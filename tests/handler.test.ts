import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {makeHandler,hash} from '../supabase/functions/case-guide/handler';
import {fullAnswers} from './lesson.test';
// A Postgres-backed adapter for the query subset used by the Edge Function.
// The production smoke test separately verifies actual Supabase/PostgREST behavior.
let pg:PGlite,handler:(r:Request)=>Promise<Response>,teacher:string,student:string,secondTeacher:string,cohort:string,learner:string;
class Query{
 op='select';fields='*';values:any=null;filters:{k:string;v:any;op:string}[]=[];singleMode=false;optional=false;options:any={};conflict:any={};sorts:string[]=[];rangeValue:number[]=[];
 constructor(public table:string){}
 select(fields='*',options={}){this.fields=fields;this.options=options;return this;}
 insert(v:any){this.op='insert';this.values=v;return this;}
 upsert(v:any,options={}){this.op='upsert';this.values=v;this.conflict=options;return this;}
 update(v:any){this.op='update';this.values=v;return this;}
 delete(){this.op='delete';return this;}
 eq(k:string,v:any){this.filters.push({k,v,op:'='});return this;}
 is(k:string,v:any){this.filters.push({k,v,op:'is'});return this;}
 lt(k:string,v:any){this.filters.push({k,v,op:'<'});return this;}
 in(k:string,v:any){this.filters.push({k,v,op:'in'});return this;}
 single(){this.singleMode=true;return this;}
 maybeSingle(){this.singleMode=true;this.optional=true;return this;}
 order(k:string,o:any={}){this.sorts.push(`"${k}" ${o.ascending===false?'desc':'asc'}`);return this;}
 limit(n:number){this.rangeValue=[0,n-1];return this;}
 range(a:number,b:number){this.rangeValue=[a,b];return this;}
 then(resolve:any,reject:any){return this.exec().then(resolve,reject);}
 async exec(){try{const args:any[]=[];const param=(v:any)=>{args.push(v);return '$'+args.length;};const columns=(v:any)=>Object.keys(v).map(k=>'"'+k+'"').join(',');let sql='';
 if(this.op==='insert'||this.op==='upsert'){const ks=Object.keys(this.values);sql=`insert into ${this.table} (${columns(this.values)}) values (${ks.map(k=>param(this.values[k])).join(',')})`;if(this.op==='upsert'){sql+=` on conflict (${this.conflict.onConflict||'id'}) `+(this.conflict.ignoreDuplicates?'do nothing':'do update set '+ks.map(k=>`"${k}"=excluded."${k}"`).join(','));}}
 else if(this.op==='update')sql=`update ${this.table} set `+Object.keys(this.values).map(k=>`"${k}"=${param(this.values[k])}`).join(',');
 else if(this.op==='delete')sql=`delete from ${this.table}`;
 else sql=`select ${this.options.count?'count(*)::int as count':this.fields} from ${this.table}`;
 if(this.filters.length)sql+=' where '+this.filters.map(f=>f.op==='is'?`"${f.k}" is null`:f.op==='in'?`"${f.k}" = any(${param(f.v)})`:`"${f.k}" ${f.op} ${param(f.v)}`).join(' and ');
 if(this.sorts.length)sql+=' order by '+this.sorts.join(',');if(this.rangeValue.length)sql+=` limit ${this.rangeValue[1]-this.rangeValue[0]+1} offset ${this.rangeValue[0]}`;
 if(this.op!=='select')sql+=' returning '+this.fields;const r=await pg.query<any>(sql,args);if(this.options.count)return{data:null,count:r.rows[0].count,error:null};if(this.singleMode&&!r.rows.length&&!this.optional)return{data:null,error:{message:'not found'}};return{data:this.singleMode?r.rows[0]||null:r.rows,error:null};}catch(e:any){return{data:null,error:{message:e.message,code:e.code}};}}
}
async function call(action:string,data:any={},token=''){const r=await handler(new Request('https://test/functions/v1/case-guide',{method:'POST',headers:{'Content-Type':'application/json','x-case-session':token,origin:'http://127.0.0.1:4173'},body:JSON.stringify({action,...data})}));return{status:r.status,body:await r.json()};}
beforeAll(async()=>{pg=new PGlite();await pg.exec('create role anon;create role authenticated;create role service_role bypassrls;');await pg.exec(readFileSync('supabase/migrations/20261024213014_case_guide.sql','utf8'));const db={from:(t:string)=>new Query(t),rpc:async(name:string,args:any)=>{try{const vals=Object.values(args);const r=await pg.query<any>(`select ${name}(${Object.keys(args).map((k,i)=>`${k} => $${i+1}`).join(',')}) as data`,vals.map(v=>typeof v==='object'?JSON.stringify(v):v));return{data:r.rows[0].data,error:null};}catch(e:any){return{data:null,error:{message:e.message,code:e.code}};}}};handler=makeHandler(db);
 for(const code of ['owner-test','owner-two'])await pg.query("insert into cg_credentials(role,token_hash) values('instructor',$1)",[await hash(code)]);
 teacher=(await call('login',{code:'owner-test'})).body.token;secondTeacher=(await call('login',{code:'owner-two'})).body.token;
 cohort=(await call('createCohort',{name:'Synthetic QA cohort'},teacher)).body.cohort.id;
 const imported=await call('importRoster',{cohortId:cohort,rows:[{student_id:'T1',display_name:'Synthetic Student'}]},teacher);expect(imported.status).toBe(200);
 student=(await call('login',{code:imported.body.codes[0].code})).body.token;
 learner=(await pg.query<any>('select id from cg_learners')).rows[0].id;
},30000);
afterAll(async()=>await pg.close());
it('requires authentication and rejects foreign origins',async()=>{expect((await call('cohorts')).status).toBe(401);const r=await handler(new Request('https://test',{method:'POST',headers:{origin:'https://attacker.example'},body:'{"action":"health"}'}));expect(r.status).toBe(403);});
it('isolates students and instructors from unauthorized records',async()=>{expect((await call('cohorts',{},student)).status).toBe(403);expect((await call('roster',{cohortId:cohort},secondTeacher)).status).toBe(404);expect((await call('replaceCode',{learnerId:learner},secondTeacher)).status).toBe(404);const r=await call('load',{},student);expect(r.body.attempt.learner_id).toBeUndefined();expect(r.body.name).toBe('Synthetic Student');});
it('authorizes the preview check only for instructors without creating learner activity',async()=>{
 const before=(await pg.query<any>('select (select count(*) from cg_attempts)::int as attempts, (select count(*) from cg_events)::int as events')).rows[0];
 expect((await call('cohorts',{},teacher)).status).toBe(200);
 expect((await call('cohorts',{role:'instructor',preview:true},student)).status).toBe(403);
 const after=(await pg.query<any>('select (select count(*) from cg_attempts)::int as attempts, (select count(*) from cg_events)::int as events')).rows[0];
 expect(after).toEqual(before);
});
it('does not let student requests opt out of required answers through preview flags',async()=>{
 const a=(await call('load',{},student)).body.attempt;
 for(const fields of [{stage:0,checkpoint:true},{stage:7,checkpoint:true,submit:true}]){
  const response=await call('save',{revision:a.revision,responses:{},...fields,preview:true,demo:true,role:'instructor'},student);
  expect(response.status).toBe(400);
 }
 expect((await call('load',{},student)).body.attempt.checkpoints).toEqual([]);
});
it('rejects skipping, stale saves, missing disclosure, and replay after completion',async()=>{let a=(await call('load',{},student)).body.attempt;const responses=fullAnswers();expect((await call('save',{revision:a.revision,responses,stage:7,checkpoint:true,submit:true},student)).status).toBe(400);
 for(let stage=0;stage<8;stage++){const stageResponses=stage===0?{privacy:responses.privacy}:stage===1?{privacy:responses.privacy,firstRead:responses.firstRead}:responses;const r=await call('save',{revision:a.revision,responses:stageResponses,stage,checkpoint:true},student);expect(r.status).toBe(200);a=r.body.attempt;if(stage===2)expect((await call('save',{revision:a.revision,responses:{...responses,initial:'digital'},stage},student)).status).toBe(400);}
 expect((await call('save',{revision:a.revision-1,responses,stage:7},student)).status).toBe(409);
 expect((await call('save',{revision:a.revision,responses:{...responses,aiUse:'used'},stage:7,submit:true},student)).status).toBe(400);
 const r=await call('save',{revision:a.revision,responses,stage:7,submit:true},student);expect(r.body.attempt.completed_at).toBeTruthy();
 expect((await call('save',{revision:r.body.attempt.revision,responses,stage:7},student)).status).toBe(409);
});
it('revocation invalidates an existing student session',async()=>{expect((await call('replaceCode',{learnerId:learner},teacher)).status).toBe(200);expect((await call('load',{},student)).status).toBe(401);});
