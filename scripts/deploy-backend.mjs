import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(readFileSync(resolve(root,'supabase/project-lock.json'),'utf8'));
const expected='apyakpyzoealaxbvhqnn';
if(lock.projectRef!==expected||lock.application!=='case-method-guide')throw new Error('Project lock mismatch. Deployment stopped.');
for(const variable of ['SUPABASE_PROJECT_REF','PROJECT_REF'])if(process.env[variable]&&process.env[variable]!==expected)throw new Error(`${variable} points to a different project. Deployment stopped.`);
const linked=resolve(root,'supabase/.temp/project-ref');
if(existsSync(linked)&&readFileSync(linked,'utf8').trim()!==expected)throw new Error('CLI is linked to a different project. Deployment stopped.');
if(process.argv.slice(2).some(x=>x!=='--check'))throw new Error('No arbitrary CLI arguments accepted.');
console.log(`Verified dedicated project: ${lock.application} (${expected}), ${lock.region}.`);
if(process.argv.includes('--check'))process.exit(0);
// Intentionally deploys only this function. No database push, reset, unlink,
// project pause/delete, or organization-wide operation is available here.
const r=spawnSync('supabase',['functions','deploy','case-guide','--project-ref',expected,'--no-verify-jwt'],{cwd:root,stdio:'inherit'});
process.exit(r.status??1);
