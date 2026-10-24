import { LESSON_VERSION, readyToSubmit, validAnswers, validateStage } from '../../../shared/lesson.ts';
const origins = new Set(['https://kamg89.github.io','http://127.0.0.1:4173','http://localhost:4173']);
export async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function secret(){return Array.from(crypto.getRandomValues(new Uint8Array(24))).map(x=>x.toString(16).padStart(2,'0')).join('');}
class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
function check(ok:unknown,message:string,status=400):asserts ok{if(!ok)throw new HttpError(status,message);}
function unwrap(r:any){if(r.error){const m=r.error.message||'';if(m.includes('CONFLICT'))throw new HttpError(409,'Another tab or device saved newer work. Compare your draft with the saved version.');if(m.includes('COMPLETED'))throw new HttpError(409,'This attempt is complete. Ask your instructor to reopen it.');if(r.error.code==='23505')throw new HttpError(409,'That student ID already exists in this cohort. No duplicate record was added.');throw new HttpError(500,'The request could not be saved. Please retry.');}return r.data;}
function text(v:unknown,max:number){return typeof v==='string'&&v.trim().length>0&&v.length<=max;}
const uuid=(s:unknown)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const studentAttempt=(a:any)=>{const {learner_id,...rest}=a;return rest;};
export function makeHandler(db:any){return async(req:Request)=>{
 const origin=req.headers.get('origin');
 const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Headers':'content-type, x-case-session','Access-Control-Allow-Methods':'POST, OPTIONS'};
 if(origin&&origins.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const send=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 try{
  if(origin&&!origins.has(origin))throw new HttpError(403,'This origin is not allowed.');
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  check(req.method==='POST','Use POST.',405);
  const reader=req.body?.getReader();check(reader,'A request body is required.');let body='';let bytes=0;const decoder=new TextDecoder();
  while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>100000){await reader.cancel();throw new HttpError(413,'Request is too large.');}body+=decoder.decode(value,{stream:true});}body+=decoder.decode();
  let b:any;try{b=JSON.parse(body);}catch{throw new HttpError(400,'Invalid request.');}check(b&&typeof b==='object'&&!Array.isArray(b),'Invalid request.');
  if(b.action==='health')return send({ok:true,version:LESSON_VERSION});
  if(b.action==='login'){
   check(text(b.code,80),'Enter your access code.');
   const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
   const allowed=unwrap(await db.rpc('cg_rate_limit',{p_key:await hash('login:'+ip),p_bucket:Math.floor(Date.now()/600000),p_limit:30}));check(allowed,'Too many attempts. Wait ten minutes before trying again.',429);
   const credential=unwrap(await db.from('cg_credentials').select('*').eq('token_hash',await hash(b.code.trim())).is('revoked_at',null).maybeSingle());check(credential,'That access code is not valid.',401);
   const token=secret();unwrap(await db.from('cg_sessions').insert({token_hash:await hash(token),credential_id:credential.id,expires_at:new Date(Date.now()+7*86400000).toISOString()}));
   await db.from('cg_sessions').delete().lt('expires_at',new Date().toISOString());
   return send({token,role:credential.role});
  }
  const token=req.headers.get('x-case-session');check(token&&/^[a-f0-9]{48}$/.test(token),'Please sign in again.',401);
  const session=unwrap(await db.from('cg_sessions').select('credential_id,expires_at').eq('token_hash',await hash(token)).maybeSingle());check(session&&new Date(session.expires_at).getTime()>Date.now(),'Your session expired. Enter your access code again.',401);
  const cred=unwrap(await db.from('cg_credentials').select('*').eq('id',session.credential_id).is('revoked_at',null).maybeSingle());check(cred,'This access has been revoked.',401);
  if(b.action==='logout'){unwrap(await db.from('cg_sessions').delete().eq('token_hash',await hash(token)));return send({ok:true});}
  const allowed=unwrap(await db.rpc('cg_rate_limit',{p_key:'session:'+session.credential_id,p_bucket:Math.floor(Date.now()/60000),p_limit:120}));check(allowed,'Please wait a minute before retrying.',429);
  if(cred.role==='student'){
   const learner=unwrap(await db.from('cg_learners').select('id,display_name,cohort_id').eq('id',cred.learner_id).single());
   let a=unwrap(await db.from('cg_attempts').select('*').eq('learner_id',learner.id).maybeSingle());
   if(!a){unwrap(await db.from('cg_attempts').upsert({learner_id:learner.id,lesson_version:LESSON_VERSION},{onConflict:'learner_id',ignoreDuplicates:true}));a=unwrap(await db.from('cg_attempts').select('*').eq('learner_id',learner.id).single());}
   if(b.action==='load'){
    const cohort=unwrap(await db.from('cg_cohorts').select('name,deadline').eq('id',learner.cohort_id).single());
    return send({attempt:studentAttempt(a),name:learner.display_name,cohort});
   }
   check(a.lesson_version===LESSON_VERSION,'This attempt uses an older lesson. Contact your instructor.',409);
   if(b.action==='save'){
    check(validAnswers(b.responses),'Invalid response data.');if(a.checkpoints.includes(1))for(const k of ['initial','initialReason','initialConfidence'])check(b.responses[k]===a.responses[k],'Your first judgment is preserved after its checkpoint. Revise your position in the later stages.');check(Number.isInteger(b.stage)&&b.stage>=0&&b.stage<8,'Invalid stage.');check(Number.isInteger(b.revision)&&b.revision>=0,'Invalid revision.');
    check(b.stage<=Math.max(-1,...a.checkpoints)+1,'Complete the preceding stage first.');
    const checkpoint=b.checkpoint===true;const submit=b.submit===true;
    if(checkpoint)check(validateStage(b.stage,b.responses).length===0,'Complete the required fields before continuing.');
    const cps=checkpoint?[...a.checkpoints,b.stage]:a.checkpoints;
    if(submit)check(readyToSubmit(b.responses,cps),'Complete every stage and your AI disclosure before submitting.');
    const saved=unwrap(await db.rpc('cg_save',{p_id:a.id,p_revision:b.revision,p_answers:b.responses,p_stage:b.stage,p_checkpoint:checkpoint,p_submit:submit}));
    return send({attempt:studentAttempt(saved)});
   }
   if(b.action==='event'){
    check(uuid(b.id)&&Number.isInteger(b.stage)&&b.stage>=0&&b.stage<8&&['feedback','reference','retry'].includes(b.kind),'Invalid event.');
    unwrap(await db.from('cg_events').upsert({id:b.id,attempt_id:a.id,stage:b.stage,kind:b.kind},{onConflict:'id',ignoreDuplicates:true}));return send({ok:true});
   }
   if(b.action==='tick'){
    check(Number.isInteger(b.bucket)&&Math.abs(b.bucket-Math.floor(Date.now()/15000))<=8,'Expired activity interval.');
    check(Number.isInteger(b.stage)&&b.stage>=0&&b.stage<8&&Number.isInteger(b.visible)&&Number.isInteger(b.active)&&b.visible>=0&&b.visible<=15000&&b.active>=0&&b.active<=b.visible,'Invalid activity interval.');
    if(!a.completed_at)unwrap(await db.rpc('cg_tick',{p_id:a.id,p_bucket:b.bucket,p_stage:b.stage,p_visible:b.visible,p_active:b.active}));return send({ok:true});
   }
   throw new HttpError(403,'This operation requires instructor access.');
  }
  async function cohort(id:string){check(uuid(id),'Invalid cohort.');const c=unwrap(await db.from('cg_cohorts').select('*').eq('id',id).eq('owner_id',cred.id).maybeSingle());check(c,'Cohort not found.',404);return c;}
  async function learner(id:string){check(uuid(id),'Invalid student.');const l=unwrap(await db.from('cg_learners').select('*').eq('id',id).maybeSingle());check(l,'Student not found.',404);await cohort(l.cohort_id);return l;}
  async function attempt(id:string){check(uuid(id),'Invalid attempt.');const a=unwrap(await db.from('cg_attempts').select('*').eq('id',id).maybeSingle());check(a,'Attempt not found.',404);await learner(a.learner_id);return a;}
  if(b.action==='cohorts')return send({cohorts:unwrap(await db.from('cg_cohorts').select('*').eq('owner_id',cred.id).order('created_at',{ascending:false}))});
  if(b.action==='createCohort'){
   check(text(b.name,120),'Enter a cohort name.');check(!b.deadline||Number.isFinite(Date.parse(b.deadline)),'Invalid deadline.');
   return send({cohort:unwrap(await db.from('cg_cohorts').insert({owner_id:cred.id,name:b.name.trim(),deadline:b.deadline||null}).select().single())});
  }
  if(b.action==='updateCohort'){await cohort(b.cohortId);check(text(b.name,120),'Enter a cohort name.');check(!b.deadline||Number.isFinite(Date.parse(b.deadline)),'Invalid deadline.');unwrap(await db.from('cg_cohorts').update({name:b.name.trim(),deadline:b.deadline||null}).eq('id',b.cohortId));return send({ok:true});}
  if(b.action==='importRoster'){
   await cohort(b.cohortId);check(Array.isArray(b.rows)&&b.rows.length>0&&b.rows.length<=200,'Import between 1 and 200 students at a time.');
   const ids=new Set();const rows=[];const codes=[];
   for(const r of b.rows){check(r&&text(r.student_id,80)&&text(r.display_name,160),'Each row needs a student ID and display name.');const id=r.student_id.trim();check(!ids.has(id),'Duplicate student ID in this import.');ids.add(id);const code=secret();rows.push({student_id:id,display_name:r.display_name.trim(),token_hash:await hash(code)});codes.push({student_id:id,display_name:r.display_name.trim(),code});}
   const count=await db.from('cg_learners').select('id',{count:'exact',head:true}).eq('cohort_id',b.cohortId);check((count.count||0)+rows.length<=500,'This cohort has a 500-student limit.');
   unwrap(await db.rpc('cg_import',{p_cohort:b.cohortId,p_rows:rows}));return send({codes});
  }
  if(b.action==='replaceCode'){await learner(b.learnerId);const code=secret();unwrap(await db.rpc('cg_replace_code',{p_learner:b.learnerId,p_hash:await hash(code)}));return send({code});}
  if(b.action==='revokeCode'){await learner(b.learnerId);unwrap(await db.from('cg_credentials').update({revoked_at:new Date().toISOString()}).eq('learner_id',b.learnerId));return send({ok:true});}
  if(b.action==='roster'||b.action==='export'){
   await cohort(b.cohortId);
   const ls=unwrap(await db.from('cg_learners').select('*').eq('cohort_id',b.cohortId).order('display_name'));const ids=ls.map((x:any)=>x.id);
   const as=ids.length?unwrap(await db.from('cg_attempts').select('*').in('learner_id',ids)):[];const aids=as.map((x:any)=>x.id);
   const reviews=aids.length?unwrap(await db.from('cg_reviews').select('*').in('attempt_id',aids)):[];
   // Paginate timing data. A cohort can readily exceed the API's default 1000-row limit.
   const ticks:any[]=[];if(aids.length){for(let offset=0;;offset+=1000){const page=unwrap(await db.from('cg_ticks').select('*').in('attempt_id',aids).order('attempt_id').order('bucket').range(offset,offset+999));ticks.push(...page);if(page.length<1000)break;}}
   const stats=new Map();for(const t of ticks){let s=stats.get(t.attempt_id)||{visible_ms:0,active_ms:0,stages:{}};s.visible_ms+=t.visible_ms;s.active_ms+=t.active_ms;const part=s.stages[t.stage]||{visible_ms:0,active_ms:0};part.visible_ms+=t.visible_ms;part.active_ms+=t.active_ms;s.stages[t.stage]=part;stats.set(t.attempt_id,s);}
   const rows=ls.map((l:any)=>{const a=as.find((x:any)=>x.learner_id===l.id);return {...l,attempt:a||null,review:reviews.find((x:any)=>x.attempt_id===a?.id)||null,activity:stats.get(a?.id)||{visible_ms:0,active_ms:0,stages:{}}};});
   if(b.action==='export'){
    const revisions:any[]=[];const events:any[]=[];
    for(const table of ['cg_revisions','cg_events']){if(aids.length){for(let offset=0;;offset+=1000){const page=unwrap(await db.from(table).select('*').in('attempt_id',aids).order('id').range(offset,offset+999));(table==='cg_revisions'?revisions:events).push(...page);if(page.length<1000)break;}}}
    return send({exported_at:new Date().toISOString(),lesson_version:LESSON_VERSION,rows,revisions,events});
   }
   return send({rows});
  }
  if(b.action==='detail'){await attempt(b.attemptId);return send({revisions:unwrap(await db.from('cg_revisions').select('*').eq('attempt_id',b.attemptId).order('revision')),events:unwrap(await db.from('cg_events').select('*').eq('attempt_id',b.attemptId).order('created_at').limit(1000))});}
  if(b.action==='review'){await attempt(b.attemptId);check(typeof b.notes==='string'&&b.notes.length<=10000,'Notes are too long.');unwrap(await db.from('cg_reviews').upsert({attempt_id:b.attemptId,notes:b.notes,reviewed:b.reviewed===true,updated_at:new Date().toISOString()}));return send({ok:true});}
  if(b.action==='reopen'){await attempt(b.attemptId);unwrap(await db.rpc('cg_reopen',{p_id:b.attemptId}));return send({ok:true});}
  if(b.action==='deleteCohort'){const c=await cohort(b.cohortId);check(b.confirm===c.name,'Type the exact cohort name to delete it.');unwrap(await db.from('cg_cohorts').delete().eq('id',c.id));return send({ok:true});}
  throw new HttpError(400,'Unknown operation.');
 }catch(e){if(e instanceof HttpError)return send({error:e.message},e.status);return send({error:'The service could not complete this request. Please retry.'},500);}
};}
