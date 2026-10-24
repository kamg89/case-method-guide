import {initialAttempt, LESSON_VERSION, readyToSubmit, validateStage, type Attempt} from '../shared/lesson';
export const API_URL=import.meta.env.VITE_API_URL||'';
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
export async function api(action:string,data:Record<string,unknown>={},token=sessionStorage.getItem('cg.session')||''){
 if(!API_URL)throw new ApiError('The service is not configured yet. You can explore the demonstration.',503);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'x-case-session':token}:{})},body:JSON.stringify({action,...data}),signal:controller.signal});const j=await r.json();if(!r.ok)throw new ApiError(j.error||'The request failed.',r.status);return j;}catch(e){if(e instanceof ApiError)throw e;throw new ApiError('Connection interrupted. Your draft stays on this device. Retry when connected.',0);}finally{clearTimeout(timeout);}
}
const demoKey=`cg.demo.${LESSON_VERSION}`;
export async function learnerApi(demo:boolean,action:string,data:Record<string,unknown>={}){
 if(!demo)return api(action,data);
 let a:Attempt;try{a=JSON.parse(localStorage.getItem(demoKey)||'null')||initialAttempt();}catch{a=initialAttempt();}if(a.lesson_version!==LESSON_VERSION)a=initialAttempt();
 if(action==='load'){localStorage.setItem(demoKey,JSON.stringify(a));return {attempt:a,name:'Demo learner',cohort:{name:'Practice on this device',deadline:null}};}
 if(action==='save'){
  if(a.revision!==data.revision)throw new ApiError('Another tab saved a newer demo draft.',409);
  if(a.completed_at)throw new ApiError('This demonstration is complete. Start a new demo to try again.',409);
  const responses=data.responses as Attempt['responses'],stage=data.stage as number;
  if(data.checkpoint&&validateStage(stage,responses).length)throw new ApiError('Complete the required fields.',400);
  const checkpoints=data.checkpoint?[...new Set([...a.checkpoints,stage])]:a.checkpoints;
  if(data.submit&&!readyToSubmit(responses,checkpoints))throw new ApiError('Complete every stage first.',400);
  a={...a,responses,stage,checkpoints,revision:a.revision+1,updated_at:new Date().toISOString(),completed_at:data.submit?new Date().toISOString():null};localStorage.setItem(demoKey,JSON.stringify(a));return {attempt:a};
 }
 return {ok:true};
}
export function resetDemo(){localStorage.removeItem(demoKey);Object.keys(localStorage).filter(k=>k.startsWith('cg.draft.demo.')).forEach(k=>localStorage.removeItem(k));}
export function download(name:string,content:string,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:unknown[][]){return rows.map(row=>row.map(v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export function parseCsv(input:string){const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw new Error('A quoted field is not closed.');row.push(cell.replace(/\r$/,''));if(row.some(x=>x.trim()))rows.push(row);return rows;}
