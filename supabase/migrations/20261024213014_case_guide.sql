create table public.cg_credentials (
 id uuid primary key default gen_random_uuid(), role text not null check(role in ('instructor','student')),
 token_hash text not null unique, learner_id uuid, revoked_at timestamptz, created_at timestamptz not null default now()
);
create table public.cg_cohorts (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.cg_credentials(id),
 name text not null check(length(name) between 1 and 120), deadline timestamptz, created_at timestamptz not null default now()
);
create index on public.cg_cohorts(owner_id);
create table public.cg_learners (
 id uuid primary key default gen_random_uuid(), cohort_id uuid not null references public.cg_cohorts(id) on delete cascade,
 external_id text not null, display_name text not null, created_at timestamptz not null default now(), unique(cohort_id,external_id)
);
create index on public.cg_learners(cohort_id);
alter table public.cg_credentials add constraint cg_learner_fk foreign key(learner_id) references public.cg_learners(id) on delete cascade;
create index on public.cg_credentials(learner_id);
create table public.cg_sessions (
 token_hash text primary key, credential_id uuid not null references public.cg_credentials(id) on delete cascade,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
create index on public.cg_sessions(credential_id);
create index on public.cg_sessions(expires_at);
create table public.cg_attempts (
 id uuid primary key default gen_random_uuid(), learner_id uuid not null unique references public.cg_learners(id) on delete cascade,
 lesson_version text not null, revision integer not null default 0, stage integer not null default 0 check(stage between 0 and 7),
 responses jsonb not null default '{}', checkpoints integer[] not null default '{}',
 started_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz
);
create table public.cg_revisions (
 id bigint generated always as identity primary key, attempt_id uuid not null references public.cg_attempts(id) on delete cascade,
 revision integer not null, stage integer not null, responses jsonb not null, kind text not null, created_at timestamptz not null default now()
);
create index on public.cg_revisions(attempt_id,revision);
create table public.cg_events (
 id uuid primary key, attempt_id uuid not null references public.cg_attempts(id) on delete cascade,
 stage integer not null check(stage between 0 and 7), kind text not null check(kind in ('feedback','reference','retry','checkpoint','reopen')),
 created_at timestamptz not null default now()
);
create index on public.cg_events(attempt_id);
create table public.cg_ticks (
 attempt_id uuid not null references public.cg_attempts(id) on delete cascade, bucket bigint not null,
 stage integer not null check(stage between 0 and 7), visible_ms integer not null check(visible_ms between 0 and 15000),
 active_ms integer not null check(active_ms between 0 and visible_ms), primary key(attempt_id,bucket)
);
create table public.cg_reviews (
 attempt_id uuid primary key references public.cg_attempts(id) on delete cascade, notes text not null default '',
 reviewed boolean not null default false, updated_at timestamptz not null default now()
);
create table public.cg_limits (key text primary key, bucket bigint not null, count integer not null);

-- Browser roles cannot read any application table. The Edge Function authenticates
-- each request and uses the server-only service role. No permissive RLS policies.
do $$ declare t text; begin
 foreach t in array array['cg_credentials','cg_cohorts','cg_learners','cg_sessions','cg_attempts','cg_revisions','cg_events','cg_ticks','cg_reviews','cg_limits'] loop
 execute format('alter table public.%I enable row level security', t);
 execute format('revoke all on public.%I from public, anon, authenticated', t);
 execute format('grant all on public.%I to service_role', t);
 end loop;
end $$;
grant usage, select on sequence public.cg_revisions_id_seq to service_role;

create function public.cg_rate_limit(p_key text,p_bucket bigint,p_limit integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.cg_limits(key,bucket,count) values(p_key,p_bucket,1)
 on conflict(key) do update set bucket=excluded.bucket,count=case when cg_limits.bucket=excluded.bucket then cg_limits.count+1 else 1 end returning count into n;
 return n<=p_limit;
end $$;

create function public.cg_save(p_id uuid,p_revision integer,p_answers jsonb,p_stage integer,p_checkpoint boolean,p_submit boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare a public.cg_attempts; cps integer[];
begin
 select * into a from public.cg_attempts where id=p_id for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if a.revision<>p_revision then raise exception 'CONFLICT'; end if;
 if a.completed_at is not null then raise exception 'COMPLETED'; end if;
 cps:=a.checkpoints;
 if p_checkpoint and not p_stage=any(cps) then cps:=array_append(cps,p_stage); end if;
 update public.cg_attempts set responses=p_answers, stage=p_stage,checkpoints=cps,revision=revision+1,updated_at=now(),completed_at=case when p_submit then now() else null end where id=p_id returning * into a;
 if p_checkpoint or p_submit then
 insert into public.cg_revisions(attempt_id,revision,stage,responses,kind) values(p_id,a.revision,p_stage,p_answers,case when p_submit then 'submit' else 'checkpoint' end);
 end if;
 return to_jsonb(a);
end $$;

create function public.cg_tick(p_id uuid,p_bucket bigint,p_stage integer,p_visible integer,p_active integer) returns void
language sql security invoker set search_path='' as $$
 insert into public.cg_ticks(attempt_id,bucket,stage,visible_ms,active_ms) values(p_id,p_bucket,p_stage,p_visible,p_active)
 on conflict(attempt_id,bucket) do update set visible_ms=greatest(cg_ticks.visible_ms,excluded.visible_ms),active_ms=greatest(cg_ticks.active_ms,excluded.active_ms);
$$;

create function public.cg_import(p_cohort uuid,p_rows jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare r jsonb; l uuid;
begin
 for r in select * from jsonb_array_elements(p_rows) loop
 insert into public.cg_learners(cohort_id,external_id,display_name) values(p_cohort,r->>'student_id',r->>'display_name') returning id into l;
 insert into public.cg_credentials(role,learner_id,token_hash) values('student',l,r->>'token_hash');
 end loop;
end $$;

create function public.cg_replace_code(p_learner uuid,p_hash text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 update public.cg_credentials set revoked_at=now() where learner_id=p_learner and revoked_at is null;
 delete from public.cg_sessions where credential_id in(select id from public.cg_credentials where learner_id=p_learner);
 insert into public.cg_credentials(role,learner_id,token_hash) values('student',p_learner,p_hash);
end $$;

create function public.cg_reopen(p_id uuid) returns void language plpgsql security invoker set search_path='' as $$
begin
 update public.cg_attempts set completed_at=null,revision=revision+1,updated_at=now() where id=p_id;
 update public.cg_reviews set reviewed=false,updated_at=now() where attempt_id=p_id;
 insert into public.cg_events(id,attempt_id,stage,kind) values(gen_random_uuid(),p_id,7,'reopen');
end $$;

revoke all on function public.cg_rate_limit(text,bigint,integer), public.cg_save(uuid,integer,jsonb,integer,boolean,boolean), public.cg_tick(uuid,bigint,integer,integer,integer), public.cg_import(uuid,jsonb), public.cg_replace_code(uuid,text), public.cg_reopen(uuid) from public,anon,authenticated;
grant execute on function public.cg_rate_limit(text,bigint,integer), public.cg_save(uuid,integer,jsonb,integer,boolean,boolean), public.cg_tick(uuid,bigint,integer,integer,integer), public.cg_import(uuid,jsonb), public.cg_replace_code(uuid,text), public.cg_reopen(uuid) to service_role;
