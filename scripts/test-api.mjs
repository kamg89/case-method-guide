import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const url=process.env.VITE_API_URL,code=process.env.INSTRUCTOR_CODE;
assert(url&&code,'Set VITE_API_URL and INSTRUCTOR_CODE in .env.private, which is gitignored.');
assert.equal(url,'https://apyakpyzoealaxbvhqnn.supabase.co/functions/v1/case-guide','Refusing to test against a different project.');
async function call(action,data={},token=''){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'x-case-session':token}:{})},body:JSON.stringify({action,...data})});return {status:r.status,body:await r.json()};}
const owner=(await call('login',{code})).body.token;assert(owner,'Instructor login failed');
let cohort;
try{
 assert.equal((await call('cohorts')).status,401);
 cohort=(await call('createCohort',{name:`Synthetic deployment QA ${randomUUID().slice(0,8)}`},owner)).body.cohort;assert(cohort?.id);
 const r=await call('importRoster',{cohortId:cohort.id,rows:[{student_id:'QA-A',display_name:'Synthetic Learner A'},{student_id:'QA-B',display_name:'Synthetic Learner B'}]},owner);assert.equal(r.status,200);
 const t1=(await call('login',{code:r.body.codes[0].code})).body.token,t2=(await call('login',{code:r.body.codes[1].code})).body.token;
 assert.equal((await call('cohorts',{},t1)).status,403);
 let a=(await call('load',{},t1)).body.attempt;const b=(await call('load',{},t2)).body.attempt;assert.notEqual(a.id,b.id);
 const prose='I would compare incremental demand and full costs using Exhibit 1 and a matched-market test. The totals alone do not establish the return on a particular investment.';
 const responses={orientation:'investigate',privacy:'yes',initial:'stores',initialReason:prose,initialConfidence:'3',decision:prose,constraint:prose,scenario:'decision',e1:'fact',e2:'interpretation',e3:'assumption',e4:'fact',e5:'interpretation',e6:'assumption',revenueGrowth:'12',storeGrowth:'18.5',limits:prose,evidenceRef:'Exhibit 1',criteria:prose,storesCase:prose,digitalCase:prose,stagedCase:prose,recommendation:'stores',tradeoff:prose,objection:prose,revisionReason:prose,finalChoice:'staged',finalConfidence:'4',opening:prose,discussionMove:'assumption',discussionReply:prose,discussionReflect:prose,transfer:'separate',reflection:prose,aiUse:'used',aiDetails:'Synthetic automated test response. These records will be deleted after the test.',debriefRead:'yes'};
 assert.equal((await call('save',{revision:a.revision,responses,stage:7,checkpoint:true,submit:true},t1)).status,400);
 for(let stage=0;stage<8;stage++){const saved=await call('save',{revision:a.revision,responses,stage,checkpoint:true},t1);assert.equal(saved.status,200,JSON.stringify(saved.body));a=saved.body.attempt;}
 assert.equal((await call('save',{revision:a.revision-1,responses,stage:7},t1)).status,409);
 const eventId=randomUUID();for(let i=0;i<2;i++)assert.equal((await call('event',{id:eventId,stage:7,kind:'feedback'},t1)).status,200);
 const bucket=Math.floor(Date.now()/15000);for(const visible of [1000,1500])assert.equal((await call('tick',{bucket,stage:7,visible,active:visible},t1)).status,200);
 const submitted=await call('save',{revision:a.revision,responses,stage:7,submit:true},t1);assert.equal(submitted.status,200);assert(submitted.body.attempt.completed_at);
 assert.deepEqual((await call('load',{},t2)).body.attempt.responses,{});
 let report=await call('roster',{cohortId:cohort.id},owner);assert.equal(report.status,200);const row=report.body.rows.find(x=>x.attempt?.id===a.id);assert.equal(row.activity.visible_ms,1500);
 assert.equal((await call('review',{attemptId:a.id,notes:'Synthetic private review',reviewed:true},owner)).status,200);
 const exported=await call('export',{cohortId:cohort.id},owner);assert.equal(exported.status,200);assert.equal(exported.body.events.filter(e=>e.id===eventId).length,1);assert(exported.body.revisions.length>=9);assert(!JSON.stringify(exported.body).includes(r.body.codes[0].code));
 assert.equal((await call('reopen',{attemptId:a.id},owner)).status,200);assert.equal((await call('load',{},t1)).body.attempt.completed_at,null);
 assert.equal((await call('replaceCode',{learnerId:row.id},owner)).status,200);assert.equal((await call('load',{},t1)).status,401);
 console.log('Live API checks passed: sign-in, authorization, separate student records, all checkpoints, stale saves, telemetry deduplication, submission, review, export, reopening, and revocation.');
}finally{if(cohort){const result=await call('deleteCohort',{cohortId:cohort.id,confirm:cohort.name},owner);assert.equal(result.status,200);console.log('Synthetic deployment cohort deleted.');}await call('logout',{},owner);}
