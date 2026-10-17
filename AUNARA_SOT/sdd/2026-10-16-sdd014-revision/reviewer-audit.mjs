import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,copyFile,rm,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,join} from 'node:path';
const root=process.cwd(),out=join(root,'AUNARA_SOT/sdd/2026-10-16-sdd014-revision');
const original=JSON.parse(await readFile(join(out,'source-sha256.json'),'utf8'));
const allowed=new Set(['src/lib/privacy.ts','src/components/LegalPanel.test.tsx','docs/compliance/README.md','docs/compliance/incident-response.md','docs/compliance/retention-and-rights.md']);
const hashes={},different=[];
const tracked=new Set(execFileSync('git',['ls-tree','-r','--name-only','61610c1'],{encoding:'utf8'}).trim().split('\n'));
for(const [path,expected]of Object.entries(original.sha256)){
 const bytes=await readFile(join(root,path)),h=createHash('sha256').update(bytes).digest('hex');assert.equal(h,expected,path);hashes[path]=h;
 if(tracked.has(path)){const base=execFileSync('git',['show','61610c1:'+path],{stdio:['ignore','pipe','ignore'],maxBuffer:64*1024*1024});if(!base.equals(bytes)){assert.ok(allowed.has(path),path);different.push(path);}}
}
const temp=await mkdtemp('/private/tmp/aunara-sdd014-review-archive-');
let output;
try{
 const paths=['src/lib/privacy.ts','src/hooks/useCloudSync.ts','src/components/LegalPanel.tsx','docs/compliance/README.md','docs/compliance/retention-and-rights.md','docs/compliance/incident-response.md','supabase/templates/confirm-signup.html','supabase/templates/reset-password.html','supabase/templates/README.md','scripts/auth-email-templates.node-test.mjs'];
 for(const p of paths){await mkdir(dirname(join(temp,p)),{recursive:true});await copyFile(join(root,p),join(temp,p));}
 output=execFileSync(process.execPath,['--test',join(temp,'scripts/auth-email-templates.node-test.mjs')],{cwd:'/private/tmp',encoding:'utf8'});
}finally{await rm(temp,{recursive:true,force:true});}
await writeFile(join(out,'reviewer-archive-guards.log'),output);
await writeFile(join(out,'reviewer-source-audit.json'),JSON.stringify({at:new Date().toISOString(),role:'independent-review',base:'61610c1',frozenAt:original.recordedAt,changedTrackedImplementation:different,sourceHashes:hashes,archiveNoGit:'10/10',clock:{date:String(new Date()),tz:process.env.TZ??'unset',nodeOptions:process.env.NODE_OPTIONS??'absent'}},null,2));
console.log('PASS frozen hashes, baseline scope, archive without Git 10/10');
