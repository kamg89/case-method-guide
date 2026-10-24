import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { makeHandler } from './handler.ts';
// Fail closed if someone accidentally deploys this function into another app.
const projectUrl='https://apyakpyzoealaxbvhqnn.supabase.co';
if(Deno.env.get('SUPABASE_URL')!==projectUrl)throw new Error('Case Guide project mismatch. No database client was created.');
const db = createClient(projectUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(makeHandler(db));
