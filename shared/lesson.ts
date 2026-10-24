export const LESSON_VERSION = 'warby-2024-v1';
export const stages = [
  ['Experience the method','What makes a case different?',3],
  ['Enter the case','Where should growth come from?',7],
  ['Frame the decision','Ask a question you can act on',4],
  ['Examine the evidence','What do the facts support?',7],
  ['Compare choices','Make the trade-off visible',6],
  ['Challenge your argument','Give the objection a fair hearing',5],
  ['Experience discussion','Move the conversation forward',5],
  ['Debrief and finish','What changed in your thinking?',4],
] as const;
export const choices = [
  ['stores','Prioritize selective store expansion','Build access to fitting and eye exams in carefully chosen markets.'],
  ['digital','Prioritize the digital experience','Improve acquisition, conversion, and repeat purchases through digital channels.'],
  ['staged','Stage the investment','Run bounded tests before committing to a broader expansion.'],
] as const;
export type Answers = Record<string,string>;
export type Attempt = {id:string; lesson_version:string; revision:number; responses:Answers; checkpoints:number[]; started_at:string; updated_at:string; completed_at:string|null; stage:number};
export const initialAttempt = ():Attempt => ({id:crypto.randomUUID(),lesson_version:LESSON_VERSION,revision:0,responses:{},checkpoints:[],started_at:new Date().toISOString(),updated_at:new Date().toISOString(),completed_at:null,stage:0});
export const evidence = [
 {id:'e1',text:'Warby Parker ended 2023 with 237 stores, compared with 200 a year earlier.',answer:'fact',why:'This is a reported count in Exhibit 1. It establishes the change in stores, not the financial effect of that change.'},
 {id:'e2',text:"The additional stores caused all of the company's revenue growth.",answer:'interpretation',why:'This is a causal interpretation. Company-wide totals do not isolate new stores, existing stores, pricing, or online activity.'},
 {id:'e3',text:'A proposed store will achieve the economics of existing mature stores.',answer:'assumption',why:'This is a planning assumption about an unobserved future result. Location, opening costs, and ramp-up could differ.'},
 {id:'e4',text:'Customers can use both digital and physical channels during the same purchase journey.',answer:'fact',why:'Exhibit 2 reports this customer behavior. The report supports the existence of mixed journeys, not their exact frequency or profitability.'},
 {id:'e5',text:'A falling gross margin means the company should stop opening stores.',answer:'interpretation',why:'This turns a reported change into a recommendation. The margin change has several possible causes, and incremental investment returns still need analysis.'},
 {id:'e6',text:'A digital experiment can identify demand that would not have occurred otherwise.',answer:'assumption',why:'That depends on the experiment design. A credible comparison group is needed to separate incremental demand from sales that would happen anyway.'},
] as const;
export const required:Record<number,Record<string,number>> = {
 0:{orientation:1,privacy:1},
 1:{initial:1,initialReason:45,initialConfidence:1},
 2:{decision:70,constraint:40,scenario:1},
 3:{e1:1,e2:1,e3:1,e4:1,e5:1,e6:1,revenueGrowth:1,storeGrowth:1,limits:65,evidenceRef:1},
 4:{criteria:50,storesCase:45,digitalCase:45,stagedCase:45,recommendation:1,tradeoff:65},
 5:{objection:80,revisionReason:60,finalChoice:1,finalConfidence:1},
 6:{discussionMove:1,discussionReply:90,discussionReflect:45},
 7:{transfer:1,reflection:100,aiUse:1,debriefRead:1},
};
export function validateStage(stage:number,a:Answers):string[]{
 const issues:string[]=[];
 for(const [key,min] of Object.entries(required[stage]||{})) if(typeof a[key]!=='string'||a[key].trim().length<min) issues.push(key);
 const enums:Record<string,string[]>={orientation:['evidence','correct','summary'],privacy:['yes'],initial:choices.map(x=>x[0]),scenario:['decision','evaluation','diagnosis'],recommendation:choices.map(x=>x[0]),finalChoice:choices.map(x=>x[0]),discussionMove:['build','dismiss','repeat'],transfer:['test','copy','wait'],aiUse:['none','used'],debriefRead:['yes']};
 for(const key of Object.keys(required[stage]||{})) if(enums[key]&&!enums[key].includes(a[key])) issues.push(key);
 if(stage===3){for(const e of evidence)if(!['fact','interpretation','assumption'].includes(a[e.id]))issues.push(e.id);for(const k of ['revenueGrowth','storeGrowth']) if(!a[k]||!Number.isFinite(Number(a[k]))||Number(a[k])< -100||Number(a[k])>1000)issues.push(k);if(!['Exhibit 1','Exhibit 2','Exhibit 3'].includes(a.evidenceRef))issues.push('evidenceRef');}
 if(stage===1||stage===5){const k=stage===1?'initialConfidence':'finalConfidence';if(!['1','2','3','4','5'].includes(a[k]))issues.push(k);}
 if(stage===7&&a.aiUse==='used'&&(!a.aiDetails||a.aiDetails.trim().length<40))issues.push('aiDetails');
 return [...new Set(issues)];
}
export function validAnswers(value:unknown):value is Answers {return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=60&&Object.entries(value).every(([k,v])=>/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)&&typeof v==='string'&&v.length<=6000);}
export function readyToSubmit(a:Answers,checkpoints:number[]){return stages.every((_,i)=>checkpoints.includes(i)&&validateStage(i,a).length===0);}
export const responseLabels:Record<string,string>={orientation:'Purpose of case learning',initial:'Initial choice',initialReason:'Initial reasoning',initialConfidence:'Initial confidence',decision:'Decision question',constraint:'Constraint and uncertainty',scenario:'Case type',revenueGrowth:'Revenue growth %',storeGrowth:'Store growth %',limits:'Limits of the numbers',evidenceRef:'Evidence reference',criteria:'Decision criteria',storesCase:'Case for stores',digitalCase:'Case for digital',stagedCase:'Case for staged investment',recommendation:'Recommendation',tradeoff:'Trade-off',objection:'Response to objection',revisionReason:'Reason for revision or defense',finalChoice:'Final choice',finalConfidence:'Final confidence',discussionMove:'Discussion move',discussionReply:'Discussion contribution',discussionReflect:'What the discussion added',transfer:'Transfer check',reflection:'Final reflection',aiUse:'AI assistance',aiDetails:'AI disclosure'};
export function choiceLabel(key:string){return choices.find(x=>x[0]===key)?.[1]||key;}
export function feedbackFor(stage:number,a:Answers){
 if(stage===0)return a.orientation==='evidence'?'Yes. A recommendation earns support through evidence and reasoning. Your task is to make the basis of your judgment visible.':'A case is an opportunity to make and examine a judgment. Searching for a single approved answer or retelling the narrative leaves the reasoning unfinished.';
 if(stage===2)return a.scenario==='decision'?'This is a decision exercise. You are choosing an investment priority. Diagnosis and evaluation can help you make that choice, but they are not the final task.':'The central task here is a decision: choose an investment priority. Evaluation asks how well something performs; diagnosis asks why an outcome occurred. Both can support your decision.';
 if(stage===3){const rev=(669.8-598.1)/598.1*100;return `${Math.abs(Number(a.revenueGrowth)-rev)<.15?'Your revenue calculation is correct.':'Recheck revenue growth.'} Revenue grew about 12.0%: (669.8 − 598.1) ÷ 598.1 × 100. ${Math.abs(Number(a.storeGrowth)-18.5)<.15?'Your store calculation is correct.':'Recheck store growth.'} The year-end store count grew 18.5%: (237 − 200) ÷ 200 × 100. These percentages describe different quantities. They do not measure the return on a new store.`;}
 if(stage===6)return a.discussionMove==='build'?'This move advances the discussion: it identifies a point of agreement, asks what evidence would distinguish the claims, and leaves room to revise.':'A useful contribution engages the reasoning already on the table. Repeating your conclusion or dismissing a person does not resolve the disagreement. Try identifying the evidence that would change either position.';
 if(stage===7)return a.transfer==='test'?"Yes. State the assumption, look for evidence that could disprove it, and compare the feasible alternatives. You can transfer that process without copying this case's recommendation.":"A prior case's answer is not a template for a different business. Identify the new decision, test its assumptions, and compare alternatives using evidence relevant to that setting.";
 return 'Review the reasoning, not just the choice. Can a reader identify your evidence, the assumption linking it to your claim, and a limitation you have taken seriously?';
}
