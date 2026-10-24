import {describe,it,expect} from 'vitest';
import {readyToSubmit,validateStage,validAnswers,required,checks,feedbackFor,LESSON_VERSION,type Answers} from '../shared/lesson';
import {csv,parseCsv} from '../src/api';
export function fullAnswers():Answers {const a:Answers={};for(const fields of Object.values(required))for(const [k,n] of Object.entries(fields))a[k]='A reason grounded in the case evidence. '.repeat(Math.ceil(n/35));return {...a,orientation:'investigate',privacy:'yes',initial:'stores',initialConfidence:'3',scenario:'decision',e1:'fact',e2:'interpretation',e3:'assumption',e4:'fact',e5:'interpretation',e6:'assumption',revenueGrowth:'12',storeGrowth:'18.5',evidenceRef:'Exhibit 1',recommendation:'stores',finalChoice:'staged',finalConfidence:'4',discussionMove:'assumption',transfer:'separate',aiUse:'none',debriefRead:'yes'};}
describe('completion contract',()=>{
 it('requires every stage and meaningful fields',()=>{const a=fullAnswers();expect(readyToSubmit(a,[0,1,2,3,4,5,6,7])).toBe(true);expect(readyToSubmit(a,[0,1,2,3,4,5,6])).toBe(false);expect(validateStage(7,{...a,reflection:'ok'})).toContain('reflection');});
 it('requires an AI description only when assistance was used',()=>{const a=fullAnswers();expect(validateStage(7,{...a,aiUse:'used'})).toContain('aiDetails');expect(validateStage(7,{...a,aiUse:'used',aiDetails:'Used a language model to critique my reasoning; checked every figure against Exhibit 1.'})).toEqual([]);});
 it('rejects forged enums and nonfinite numbers',()=>{const a=fullAnswers();expect(validateStage(3,{...a,revenueGrowth:'NaN',e1:'yes'})).toEqual(expect.arrayContaining(['revenueGrowth','e1']));expect(validateStage(0,{...a,privacy:'no'})).toContain('privacy');expect(validateStage(1,{...a,initialConfidence:'100'})).toContain('initialConfidence');});
 it('bounds payloads',()=>{expect(validAnswers({a:'ok'})).toBe(true);expect(validAnswers({a:{inject:true}})).toBe(false);expect(validAnswers({a:'x'.repeat(6001)})).toBe(false);});
 it('accepts a reasoned alternate conclusion and factual retries',()=>{const a=fullAnswers();expect(validateStage(3,{...a,revenueGrowth:'2'})).toEqual([]);expect(readyToSubmit({...a,finalChoice:'digital'},[0,1,2,3,4,5,6,7])).toBe(true);});
});
describe('roster and export',()=>{
 it('parses quoted names, commas and newlines',()=>expect(parseCsv('student_id,display_name\r\n1,"Doe, Jane"\r\n2,"A ""quoted"" name"')).toEqual([['student_id','display_name'],['1','Doe, Jane'],['2','A "quoted" name']]));
 it('neutralizes spreadsheet formulas in user-controlled fields',()=>expect(csv([['=1+1','@SUM(A1)','normal']])).toBe('"\'=1+1","\'@SUM(A1)","normal"'));
});

describe('discussion preparation revision',()=>{
 it('requires an opening contribution and separates the new lesson version',()=>{const a=fullAnswers();expect(LESSON_VERSION).toBe('warby-2024-v2');expect(validateStage(6,{...a,opening:''})).toContain('opening');expect(readyToSubmit({...a,opening:''},[0,1,2,3,4,5,6,7])).toBe(false);expect(validateStage(0,{...a,orientation:'evidence'})).toContain('orientation');});
 it('explains every plausible reading and discussion choice separately',()=>{for(const [stage,key] of [[0,'orientation'],[2,'scenario'],[6,'discussionMove'],[7,'transfer']] as const){const texts=checks[key].options.map(([value])=>feedbackFor(stage,{[key]:value}));expect(new Set(texts).size).toBe(checks[key].options.length);expect(texts.every(t=>t.length>100)).toBe(true);}});
});
