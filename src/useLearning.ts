import {useEffect,useRef,useState} from 'react';
import {type Answers,type Attempt} from '../shared/lesson';
import {ApiError,learnerApi} from './api';
export function useLearning(demo:boolean){
 const [attempt,setAttempt]=useState<Attempt|null>(null),[answers,setAnswers]=useState<Answers>({}),[stage,setStage]=useState(0),[name,setName]=useState(''),[cohort,setCohort]=useState<any>(null),[status,setStatus]=useState('Loading your work…'),[error,setError]=useState(''),[conflict,setConflict]=useState<Attempt|null>(null),[busy,setBusy]=useState(false);
 const ar=useRef<Attempt|null>(null),draft=useRef<Answers>({}),stageRef=useRef(0),task=useRef<Promise<boolean>|null>(null),blocked=useRef(false),lastInput=useRef(Date.now()),key=useRef(''),mounted=useRef(true);
 function accept(a:Attempt){ar.current=a;setAttempt(a);}
 function update(k:string,v:string){draft.current={...draft.current,[k]:v};setAnswers(draft.current);lastInput.current=Date.now();setError('');setStatus('Changes not yet saved');try{localStorage.setItem(key.current,JSON.stringify({revision:ar.current?.revision,responses:draft.current,stage:stageRef.current}));}catch{setStatus('Local recovery unavailable. Keep this tab open until saved.');}}
 async function load(){try{const r=await learnerApi(demo,'load');if(!mounted.current)return;accept(r.attempt);setName(r.name);setCohort(r.cohort);key.current=`cg.draft.${demo?'demo':'student'}.${r.attempt.id}`;let pending:any;try{pending=JSON.parse(localStorage.getItem(key.current)||'null');}catch{pending=null;}
 draft.current=pending?.responses||r.attempt.responses;setAnswers(draft.current);const s=pending?.stage??r.attempt.stage;stageRef.current=s;setStage(s);
 if(pending&&pending.revision!==r.attempt.revision&&JSON.stringify(pending.responses)!==JSON.stringify(r.attempt.responses)){blocked.current=true;setConflict(r.attempt);setStatus('Compare recovered draft');}else setStatus(pending?'Recovered draft. Saving…':'All changes saved');
 }catch(e){setError((e as Error).message);setStatus('Unable to load');}}
 useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;};},[demo]);
 async function save(checkpoint=false,submit=false):Promise<boolean>{
  if(task.current){await task.current;return save(checkpoint,submit);}
  if(blocked.current||!ar.current||ar.current.completed_at)return false;
  const current=ar.current;const outgoing={...draft.current};const atStage=stageRef.current;
  if(!checkpoint&&!submit&&JSON.stringify(outgoing)===JSON.stringify(current.responses)&&current.stage===atStage){setStatus('All changes saved');return true;}
  setBusy(true);setStatus('Saving…');
  const operation=(async()=>{try{const r=await learnerApi(demo,'save',{revision:current.revision,responses:outgoing,stage:atStage,checkpoint,submit});accept(r.attempt);
   const unchanged=JSON.stringify(draft.current)===JSON.stringify(outgoing);setStatus(unchanged?'All changes saved':'New changes waiting to save');
   if(unchanged)localStorage.removeItem(key.current);else localStorage.setItem(key.current,JSON.stringify({revision:r.attempt.revision,responses:draft.current,stage:stageRef.current}));setError('');return true;
  }catch(e){if(e instanceof ApiError&&e.status===409){blocked.current=true;try{const r=await learnerApi(demo,'load');setConflict(r.attempt);}catch{}setStatus('Compare versions before saving');}else setStatus('Not synced. Draft kept on this device.');setError((e as Error).message);return false;}finally{task.current=null;setBusy(false);}})();task.current=operation;return operation;
 }
 useEffect(()=>{if(!attempt||attempt.completed_at||conflict)return;const t=setTimeout(()=>{void save();},1000);return()=>clearTimeout(t);},[answers,stage,attempt?.revision,conflict]);
 useEffect(()=>{const retry=()=>{void save();};window.addEventListener('online',retry);const interval=setInterval(()=>{if(!blocked.current)void save();},15000);return()=>{window.removeEventListener('online',retry);clearInterval(interval);};},[]);
 async function navigate(s:number){if(await save()){stageRef.current=s;setStage(s);window.scrollTo({top:0,behavior:'instant'});}}
 async function resolve(merged:Answers){if(!conflict)return;accept(conflict);draft.current=merged;setAnswers(merged);blocked.current=false;setConflict(null);setError('');if(conflict.completed_at){draft.current=conflict.responses;setAnswers(conflict.responses);localStorage.removeItem(key.current);setStatus('Completed version loaded');}else{localStorage.setItem(key.current,JSON.stringify({revision:conflict.revision,responses:merged,stage:stageRef.current}));setStatus('Comparison saved locally. Syncing…');}}
 function event(kind:string){if(ar.current)void learnerApi(demo,'event',{id:crypto.randomUUID(),stage:stageRef.current,kind}).catch(()=>{});}
 useEffect(()=>{let prev=Date.now();let wasVisible=!document.hidden;const touch=()=>{lastInput.current=Date.now();};const tick=()=>{const now=Date.now(),delta=Math.min(15000,Math.max(0,now-prev));prev=now;if(ar.current&&!ar.current.completed_at&&wasVisible){void learnerApi(demo,'tick',{bucket:Math.floor(now/15000),stage:stageRef.current,visible:delta,active:now-lastInput.current<120000?delta:0}).catch(()=>{});}wasVisible=!document.hidden;};
 const visibility=()=>{tick();prev=Date.now();wasVisible=!document.hidden;};const t=setInterval(tick,15000);for(const e of ['pointerdown','keydown','scroll'])window.addEventListener(e,touch,{passive:true});document.addEventListener('visibilitychange',visibility);
 const before=(e:BeforeUnloadEvent)=>{if(ar.current&&JSON.stringify(draft.current)!==JSON.stringify(ar.current.responses)){e.preventDefault();}};window.addEventListener('beforeunload',before);
 return()=>{clearInterval(t);for(const e of ['pointerdown','keydown','scroll'])window.removeEventListener(e,touch);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('beforeunload',before);};},[]);
 return{attempt,answers,stage,name,cohort,status,error,conflict,busy,update,save,navigate,resolve,event,reload:load};
}
