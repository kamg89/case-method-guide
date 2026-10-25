import {useEffect,useState} from 'react';
import {api} from './api';
import {Button} from './components';
import {PreviewLesson} from './Lesson';

export default function InstructorPreview(){
 const [state,setState]=useState<'checking'|'allowed'|'denied'>('checking');
 const [error,setError]=useState('');
 const [verified,setVerified]=useState(false);
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let cancelled=false;
  async function verify(){
   setState('checking');setError('');
   try{
    // A successful instructor-only API operation proves the role. Never trust
    // the client-side role label or accept an offline/failed request as access.
    const result=await api('cohorts');
    if(!Array.isArray(result.cohorts))throw new Error('Unable to verify admin access.');
    if(!cancelled){setVerified(true);setState('allowed');}
   }catch(e){if(!cancelled){setVerified(false);setError((e as Error).message);setState('denied');}}
  }
  void verify();
  return()=>{cancelled=true;};
 },[retry]);
 // Hide preview and recheck credentials after returning to a hidden tab. The
 // server also checks revocation and expiry whenever this route is opened.
 useEffect(()=>{
  const onVisibility=()=>{if(document.hidden)setState('checking');else setRetry(n=>n+1);};
  document.addEventListener('visibilitychange',onVisibility);
  return()=>document.removeEventListener('visibilitychange',onVisibility);
 },[]);
 return <>{verified&&<div hidden={state!=='allowed'}><PreviewLesson/></div>}{state!=='allowed'&&<main className="narrow loading"><h1>Admin preview</h1>
  {state==='checking'?<p role="status">Checking your admin access…</p>:<>
   <p>Sign in with your private admin code to preview every page without answering questions.</p>
   <p className="error" role="alert">{error}</p>
   <div className="actions"><a className="button" href="#login">Sign in</a><Button secondary onClick={()=>setRetry(n=>n+1)}>Retry</Button></div>
  </>}
 </main>}</>;
}
