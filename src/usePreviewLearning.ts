import {useState} from 'react';
import {initialAttempt, type Answers} from '../shared/lesson';
import type {useLearning} from './useLearning';

// Preview has no learner API, autosave, local recovery queue, or activity tracking.
// It is mounted only after the server accepts an instructor-only operation.
export function usePreviewLearning():ReturnType<typeof useLearning>{
 const [attempt,setAttempt]=useState(initialAttempt);
 const [answers,setAnswers]=useState<Answers>({recommendation:'stores',finalChoice:'stores'});
 const [stage,setStage]=useState(0);
 return {
  attempt,answers,stage,name:'Admin preview',cohort:null,
  status:'Preview only · No student records',error:'',conflict:null,busy:false,
  update:(key,value)=>setAnswers(a=>({...a,[key]:value})),
  save:async(_checkpoint=false,submit=false)=>{
   if(submit)setAttempt(a=>({...a,completed_at:new Date().toISOString()}));
   return true;
  },
  navigate:async(next)=>{setStage(next);setAttempt(a=>({...a,completed_at:null}));},
  resolve:async()=>{},event:()=>{},reload:async()=>{},
 };
}
