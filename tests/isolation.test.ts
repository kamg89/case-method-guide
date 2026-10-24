import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const run=(env:Record<string,string|undefined>={})=>spawnSync(process.execPath,['scripts/deploy-backend.mjs','--check'],{encoding:'utf8',env:{...process.env,...env}});
describe('deployment isolation',()=>{
 it('accepts only the dedicated project',()=>{expect(run().status).toBe(0);const r=run({SUPABASE_PROJECT_REF:'another-application'});expect(r.status).not.toBe(0);expect(r.stderr).toContain('different project');});
 it('does not allow alternate target arguments',()=>{const r=spawnSync(process.execPath,['scripts/deploy-backend.mjs','--project-ref','another-application']);expect(r.status).not.toBe(0);});
 it('fails before database access if deployed to a different project',()=>{const s=readFileSync('supabase/functions/case-guide/index.ts','utf8');expect(s.indexOf('project mismatch')).toBeLessThan(s.indexOf('const db = createClient'));expect(s).toContain("Deno.env.get('SUPABASE_URL')!==projectUrl");});
});
