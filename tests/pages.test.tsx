import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {learningPages} from '../src/LearningPages';
import {required} from '../shared/lesson';
describe('short page structure',()=>{
 it('renders every stage and retains every completion requirement',()=>{for(let s=0;s<8;s++){const pages=learningPages({s,a:{},field:(id)=><textarea id={id}/>,options:(id)=><fieldset id={id}/>,set:()=>()=>{},initialLocked:false,invalid:[]});expect(pages.length).toBeGreaterThan(2);const fields=pages.flatMap(p=>p.fields);for(const key of Object.keys(required[s]))expect(fields).toContain(key);for(const page of pages){expect(renderToStaticMarkup(<>{page.body}{page.feedback}</>)).toBeTruthy();expect(page.fields.length).toBeLessThanOrEqual(3);}}});
});
