import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {learningPages} from '../src/LearningPages';
import {caseSections} from '../src/case';
import {required} from '../shared/lesson';
describe('short page structure',()=>{
 it('renders every stage and retains every completion requirement',()=>{for(let s=0;s<8;s++){const pages=learningPages({s,a:{},field:(id)=><textarea id={id}/>,options:(id)=><fieldset id={id}/>,set:()=>()=>{},initialLocked:false,invalid:[]});expect(pages.length).toBeGreaterThan(2);const fields=pages.flatMap(p=>p.fields);for(const key of Object.keys(required[s]))expect(fields).toContain(key);for(const page of pages){expect(renderToStaticMarkup(<>{page.body}{page.feedback}</>)).toBeTruthy();expect(page.fields.length).toBeLessThanOrEqual(3);}}});
});

describe('teach before asking for analysis',()=>{
 const pages=(s:number)=>learningPages({s,a:{},field:(id)=><textarea id={id}/>,options:(id)=><fieldset id={id}/>,set:()=>()=>{},initialLocked:false,invalid:[]});
 it('defines the case and method before any academic question',()=>{const intro=pages(0);expect(intro[0].title).toBe('What is a case?');expect(intro[1].title).toBe('What does the case method teach?');expect(intro.flatMap(p=>p.fields)).toEqual(['privacy']);});
 it('finishes the narrative and exhibits before the first response, then frames before choosing',()=>{const read=pages(1);expect(read.slice(0,-1).every(p=>p.fields.length===0)).toBe(true);expect(read.at(-1)?.fields).toEqual(['firstRead']);expect(read.length).toBe(caseSections.length+5);const frame=pages(2);expect(frame.findIndex(p=>p.fields.includes('initial'))).toBeGreaterThan(frame.findIndex(p=>p.fields.includes('constraint')));expect(pages(7).some(p=>p.fields.includes('orientation'))).toBe(true);});
 it('keeps the narrative self-contained and its reading pages short',()=>{const story=caseSections.flatMap(s=>s.paragraphs).join(' ');expect(story.split(/\s+/).length).toBeGreaterThanOrEqual(900);expect(story.split(/\s+/).length).toBeLessThanOrEqual(1100);expect(story).toContain('Dave Gilboa');expect(story).not.toMatch(/imagine|your task|your recommendation|you must/i);for(const section of caseSections)expect(section.paragraphs.join(' ').split(/\s+/).length).toBeLessThan(170);});
});
