export const LESSON_VERSION = 'warby-2024-v3';
export const INITIAL_POSITION_STAGE = 2;
export const stages = [
  ['What is a case?','Understand the material and the method',3],
  ['Read the case','Meet the decision maker and understand the situation',8],
  ['Find the decision','Turn the situation into a question',5],
  ['Work with evidence','Separate what is known from what is inferred',7],
  ['Compare the options','Decide what matters and weigh the alternatives',6],
  ['Test your argument','Respond to a serious objection',4],
  ['Join the discussion','Prepare a contribution and respond to others',6],
  ['Take stock','Review what you learned and finish',4],
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
 {id:'e1',text:'The reported net loss was $47.2 million smaller in 2023 than in 2022.',answer:'fact',why:'Subtracting the reported $63.2 million loss from the previous $110.4 million loss gives $47.2 million. A calculation can be a fact when its inputs and method are explicit. The change does not establish which activity caused the improvement.'},
 {id:'e2',text:'Stores appear to generate value beyond the purchases completed inside them.',answer:'interpretation',why:'Mixed customer journeys and eye exams support this reading of the business. The conclusion still goes beyond the reported facts: the case does not measure that additional value.'},
 {id:'e3',text:'Locations considered for expansion will attract customers with needs similar to those served by existing stores.',answer:'assumption',why:'This premise extends observations about existing locations to markets not yet observed. It could be reasonable, but the supplied evidence has not established it.'},
 {id:'e4',text:'Management describes stores as a way to build awareness and acquire customers.',answer:'fact',why:'The fact is that management makes this claim, as reported in Exhibit 2. Repeating the claim as a measured effect would require additional evidence. Distinguish the source of a statement from proof that it is true.'},
 {id:'e5',text:'Growth alongside a lower gross margin makes the economics of expansion a priority for further analysis.',answer:'interpretation',why:'The figures are reported facts. Choosing which issue deserves attention is an analytical judgment. This interpretation is reasonable without establishing that store expansion caused the margin decline.'},
 {id:'e6',text:'Results from a small pilot will be useful for deciding which markets to enter next.',answer:'assumption',why:'A staged recommendation relies on results being informative beyond the pilot. Differences in markets, execution and timing could weaken that premise.'},
] as const;
export const checks = {
 orientation:{prompt:'You have read a case once. With twenty minutes left to prepare, which next step is most useful?',options:[
 ['summarize','Condense the case into a chronological summary so you can retrieve its main facts during discussion.'],
 ['investigate','State a provisional decision question, then reread the passages that support or challenge your first explanation.'],
 ['commit','Choose a familiar strategy framework, then organize the case information under its categories.'],
 ],feedback:{
 summarize:'A short summary helps you retrieve facts, but chronology does not tell you which facts bear on the decision. First identify the question your analysis must answer, then use the summary selectively.',
 investigate:'This gives the second reading a purpose while keeping the first explanation open to challenge. A provisional question directs attention; contrary evidence helps you notice if you framed it too narrowly.',
 commit:'A framework can reveal relationships you missed. Starting with its categories can also steer you toward issues that are easy to classify rather than issues that determine the decision. Establish the task before choosing the tool.',
 }},
 scenario:{prompt:'Which question should organize your analysis of this case?',options:[
 ['diagnosis','What explains the decline in gross margin despite revenue growth?'],
 ['evaluation','How strong was the company\'s performance when growth and profitability are considered together?'],
 ['decision','Which next investment deserves priority, given the customer proposition and uncertainty about returns?'],
 ],feedback:{
 diagnosis:'Explaining the margin change is a useful diagnosis. It may inform the choice, but it does not by itself compare the next store, digital project and staged investment. The assignment ultimately asks for an allocation decision.',
 evaluation:'Evaluating performance helps establish the starting position. You would still need to explain how that evaluation changes the investment priority. A decision needs forward-looking criteria as well as a view of past results.',
 decision:'This question matches the requested decision and sets up a comparison. Diagnosis of margins and evaluation of performance can contribute evidence without becoming separate exercises that displace the choice.',
 }},
 discussionMove:{prompt:'Both contributions identify a real concern. Which intervention best clarifies the disagreement before the group chooses?',options:[
 ['financial','Ask Riley to break down the gross-margin decline so the group can judge whether it is temporary.'],
 ['assumption','Ask what each position assumes about customer behavior, and where the case supports or weakens those assumptions.'],
 ['customer','Ask Morgan which services digital investment would struggle to provide, then compare those services with the cost of stores.'],
 ],feedback:{
 financial:'A margin breakdown could clarify the financial concern. On its own, it follows Riley\'s line of analysis and leaves Morgan\'s claim about customer value untested. First make the competing assumptions explicit, then identify which financial detail could distinguish them.',
 assumption:'This exposes what must be true for each recommendation to work. It connects the financial and customer arguments and gives the group a basis for choosing the next piece of evidence to examine.',
 customer:'This is a useful way to develop Morgan\'s argument about physical service. It risks giving that argument a head start unless the group also asks what Riley assumes digital investment can improve. Comparing both assumptions makes the disagreement clearer.',
 }},
 transfer:{prompt:'Before a different case discussion, your notes support two options. One has a higher estimated return; the other fits the company\'s capabilities better. What should you do with the remaining preparation time?',options:[
 ['benchmark','Put both estimates on the same basis, rank the options by return, and make capability fit the main implementation caveat.'],
 ['separate','State which criterion should decide the choice, test its strongest assumption, and prepare to explain what would change your view.'],
 ['threshold','Design a pilot that can compare both options and recommend delaying the commitment until the pilot resolves the uncertainty.'],
 ],feedback:{
 benchmark:'Comparable estimates are useful. Making return decisive assumes that capability differences can be handled during implementation. Examine whether those differences change the credibility of the estimated returns or the feasibility of the option.',
 separate:'This prepares a position the group can examine. You must explain why a criterion matters and acknowledge the assumption that could overturn the choice. Being prepared does not require eliminating the disagreement.',
 threshold:'A pilot may be the best recommendation when it can produce timely, relevant evidence. It is not a default answer to competing criteria: delay has a cost, and the test may not resolve a judgment about strategic fit. Explain why waiting improves this particular decision.',
 }}
} as const;
export const required:Record<number,Record<string,number>> = {
 0:{privacy:1},
 1:{firstRead:70},
 2:{decision:70,constraint:40,scenario:1,initial:1,initialReason:45,initialConfidence:1},
 3:{e1:1,e2:1,e3:1,e4:1,e5:1,e6:1,revenueGrowth:1,storeGrowth:1,limits:65,evidenceRef:1},
 4:{criteria:50,storesCase:45,digitalCase:45,stagedCase:45,recommendation:1,tradeoff:65},
 5:{objection:80,revisionReason:60,finalChoice:1,finalConfidence:1},
 6:{opening:90,discussionMove:1,discussionReply:90,discussionReflect:45},
 7:{orientation:1,transfer:1,reflection:100,aiUse:1,debriefRead:1},
};
export function validateStage(stage:number,a:Answers):string[]{
 const issues:string[]=[];
 for(const [key,min] of Object.entries(required[stage]||{})) if(typeof a[key]!=='string'||a[key].trim().length<min) issues.push(key);
 const enums:Record<string,string[]>={orientation:checks.orientation.options.map(x=>x[0]),privacy:['yes'],initial:choices.map(x=>x[0]),scenario:['decision','evaluation','diagnosis'],recommendation:choices.map(x=>x[0]),finalChoice:choices.map(x=>x[0]),discussionMove:checks.discussionMove.options.map(x=>x[0]),transfer:checks.transfer.options.map(x=>x[0]),aiUse:['none','used'],debriefRead:['yes']};
 for(const key of Object.keys(required[stage]||{})) if(enums[key]&&!enums[key].includes(a[key])) issues.push(key);
 if(stage===3){for(const e of evidence)if(!['fact','interpretation','assumption'].includes(a[e.id]))issues.push(e.id);for(const k of ['revenueGrowth','storeGrowth']) if(!a[k]||!Number.isFinite(Number(a[k]))||Number(a[k])< -100||Number(a[k])>1000)issues.push(k);if(!['Exhibit 1','Exhibit 2','Exhibit 3'].includes(a.evidenceRef))issues.push('evidenceRef');}
 if(stage===2||stage===5){const k=stage===2?'initialConfidence':'finalConfidence';if(!['1','2','3','4','5'].includes(a[k]))issues.push(k);}
 if(stage===7&&a.aiUse==='used'&&(!a.aiDetails||a.aiDetails.trim().length<40))issues.push('aiDetails');
 return [...new Set(issues)];
}
export function validAnswers(value:unknown):value is Answers {return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=60&&Object.entries(value).every(([k,v])=>/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)&&typeof v==='string'&&v.length<=6000);}
export function readyToSubmit(a:Answers,checkpoints:number[]){return stages.every((_,i)=>checkpoints.includes(i)&&validateStage(i,a).length===0);}
export const responseLabels:Record<string,string>={firstRead:'First reading: person, decision and stakes',orientation:'Reading strategy',initial:'Initial choice',initialReason:'Initial reasoning',initialConfidence:'Initial confidence',decision:'Decision question',constraint:'Constraint and uncertainty',scenario:'Case type',revenueGrowth:'Revenue growth %',storeGrowth:'Store growth %',limits:'Limits of the numbers',evidenceRef:'Evidence reference',criteria:'Decision criteria',storesCase:'Case for stores',digitalCase:'Case for digital',stagedCase:'Case for staged investment',recommendation:'Recommendation',tradeoff:'Trade-off',objection:'Response to objection',revisionReason:'Reason for revision or defense',finalChoice:'Final choice',finalConfidence:'Final confidence',opening:'Opening contribution',discussionMove:'Discussion move',discussionReply:'Discussion contribution',discussionReflect:'What the discussion added',transfer:'Transfer check',reflection:'Final reflection',aiUse:'AI assistance',aiDetails:'AI disclosure'};
for(const item of evidence)responseLabels[item.id]=`Evidence: ${item.text}`;
export function choiceLabel(key:string){return choices.find(x=>x[0]===key)?.[1]||key;}
export function feedbackFor(stage:number,a:Answers){
 const key=({0:'orientation',2:'scenario',6:'discussionMove',7:'transfer'} as const)[stage as 0|2|6|7];
 if(key){const feedback=checks[key].feedback as Record<string,string>;return feedback[a[key]]||'Compare the purpose and limitations of each approach.';}
 if(stage===3){const rev=(669.8-598.1)/598.1*100;return `${Math.abs(Number(a.revenueGrowth)-rev)<.15?'Your revenue calculation is correct.':'Recheck revenue growth.'} Revenue grew about 12.0%: (669.8 − 598.1) ÷ 598.1 × 100. ${Math.abs(Number(a.storeGrowth)-18.5)<.15?'Your store calculation is correct.':'Recheck store growth.'} The year-end store count grew 18.5%: (237 − 200) ÷ 200 × 100. These percentages describe different quantities. They do not measure the return on a new store.`;}
 return 'Check whether your argument uses relevant evidence, explains its assumptions, and addresses the strongest alternative.';
}
