export const API_URL=import.meta.env.VITE_API_URL||'';
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
export async function api(action:string,data:Record<string,unknown>={},token=sessionStorage.getItem('cg.session')||''){
 if(!API_URL)throw new ApiError('The service is not configured. Please contact your instructor.',503);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'x-case-session':token}:{})},body:JSON.stringify({action,...data}),signal:controller.signal});const j=await r.json();if(!r.ok)throw new ApiError(j.error||'The request failed.',r.status);return j;}catch(e){if(e instanceof ApiError)throw e;throw new ApiError('Connection interrupted. Your draft stays on this device. Retry when connected.',0);}finally{clearTimeout(timeout);}
}
export function download(name:string,content:string,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:unknown[][]){return rows.map(row=>row.map(v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export function parseCsv(input:string){const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw new Error('A quoted field is not closed.');row.push(cell.replace(/\r$/,''));if(row.some(x=>x.trim()))rows.push(row);return rows;}
