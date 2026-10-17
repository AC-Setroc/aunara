// SDD017 compiled UI probe. Fresh synthetic contexts only; never reads an .env or browser profile.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, symlinkSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
const here=dirname(fileURLToPath(import.meta.url)), repo=resolve(here,'../../..');
const runtime=process.env.PLAYWRIGHT_MODULE??'/Users/alejandro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const {chromium,webkit}=await import(pathToFileURL(runtime));
// Reuse versioned synthetic auth handlers, adapting only the runtime import in memory.
const fixtureSource=readFileSync(resolve(here,'../2026-10-16-uat-dev-revision/harness/lib.mjs'),'utf8').replace('from "playwright"',`from ${JSON.stringify(pathToFileURL(runtime).href)}`);
const {installSyntheticSupabase,syntheticUser,syntheticSession}=await import('data:text/javascript;base64,'+Buffer.from(fixtureSource).toString('base64'));
const out=resolve(process.env.OUT??resolve(here,'resultados'));mkdirSync(out,{recursive:true});
if(process.env.MERGE_RETRY){
 const originalFile=resolve(out,process.env.MERGE_RETRY),retry=JSON.parse(readFileSync(process.env.RETRY_JSON,'utf8')),original=JSON.parse(readFileSync(originalFile,'utf8'));
 if(retry.rows.some(r=>!r.pass))throw Error('Retry has failures; refusing merge');
 const tags=[...new Set(retry.rows.map(r=>r.tag))];if(tags.length!==1)throw Error('Expected exactly one retry tag');
 const [tag]=tags;mkdirSync(resolve(out,'calibration'),{recursive:true});cpSync(originalFile,resolve(out,'calibration',`${process.env.MERGE_RETRY}.before-retry.json`));
 original.rows=[...original.rows.filter(r=>r.tag!==tag),...retry.rows];original.measurements=[...original.measurements.filter(r=>r.tag!==tag),...retry.measurements];original.summary={passed:original.rows.filter(r=>r.pass).length,total:original.rows.length};original.recovery={tag,retry:process.env.RETRY_JSON,reason:'Capture timeout under competing browser load; full isolated case rerun, no assertion waived'};
 writeFileSync(originalFile,JSON.stringify(original,null,2));console.log(original.summary);process.exit(original.rows.every(r=>r.pass)?0:1);
}
if(process.env.COMPACT==='1'){
 const archive=mkdtempSync('/private/tmp/aunara-s17-captures-'),kept=[],moved=[];
 const selected=new Set(['chromium','webkit'].flatMap(e=>['baseline-footer','candidate-footer','candidate-drawer','consent'].map(s=>`${e}-root-guest-es-390-${s}.png`)));
 const walk=(dir,relative='')=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const path=resolve(dir,entry.name),rel=relative?`${relative}/${entry.name}`:entry.name;if(entry.isDirectory())walk(path,rel);else if(entry.name.endsWith('.png')&&/^(chromium|webkit)-(root|aunara)-/.test(entry.name)){if(!relative&&selected.has(entry.name)){kept.push(rel);continue;}const target=resolve(archive,rel);mkdirSync(dirname(target),{recursive:true});renameSync(path,target);moved.push(rel);}}};walk(out);
 writeFileSync(resolve(out,'capture-inventory.json'),JSON.stringify({archive,kept,moved},null,2));console.log({archive,kept:kept.length,moved:moved.length});process.exit(0);
}
if(process.env.BUILD==='1'){
 const scratch=mkdtempSync('/private/tmp/aunara-s17-build-');
 const files=['src/App.tsx','src/styles.css','src/components/NavigationMenu.tsx'];
 const manifest={baselineRef:'6e3ddaa',scratch,sourceHashes:Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(resolve(repo,f))).digest('hex')])),builds:{}};
 for(const variant of ['baseline','candidate']){
  const root=resolve(scratch,variant);mkdirSync(root);const archive=spawnSync('git',['archive','6e3ddaa','src','public','index.html','package.json','vite.config.ts'],{cwd:repo,maxBuffer:200*1024*1024});if(archive.status||archive.error)throw Error(String(archive.error??archive.stderr));
  const extract=spawnSync('tar',['-x','-C',root],{input:archive.stdout});if(extract.status)throw Error(extract.stderr.toString());
  if(variant==='candidate')for(const f of files)cpSync(resolve(repo,f),resolve(root,f));
  symlinkSync(resolve(repo,'node_modules'),resolve(root,'node_modules'));mkdirSync(resolve(root,'empty-env'));
  for(const base of ['/','/aunara/']){
   process.env.VITE_SUPABASE_URL='https://synthetic.supabase.invalid';process.env.VITE_SUPABASE_PUBLISHABLE_KEY='synthetic-public-key';process.env.AUNARA_BASE_PATH=base;
   const {build}=await import(pathToFileURL(resolve(repo,'node_modules/vite/dist/node/index.js')));
   const dir=resolve(scratch,`${variant}-${base==='/'?'root':'aunara'}`);
   await build({root,envDir:resolve(root,'empty-env'),base,build:{outDir:dir,emptyOutDir:true},logLevel:'warn'});manifest.builds[`${variant}-${base==='/'?'root':'aunara'}`]=dir;
  }
 }
 writeFileSync(resolve(out,'builds.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest));process.exit(0);
}
const builds=JSON.parse(readFileSync(process.env.BUILDS??resolve(out,'builds.json'),'utf8')).builds;
const engine=process.env.BROWSER??'chromium',base=process.env.BASE??'/',key=base==='/'?'root':'aunara';
if(process.env.NEGATIVES==='1'){
 const scratch=mkdtempSync('/private/tmp/aunara-s17-negatives-'),results=[];
 const mutations=[
  ['padding100','C17-01','footer{padding-bottom:100px!important}'],
  ['ink-offset','C17-02','.footer-brand img{transform:translateX(12px)!important}'],
  ['duplicate-menu','C17-03',null,"const e=document.querySelector('#aunara-navigation .navigation-row');if(e&&!document.querySelector('[data-s17-duplicate]')){const n=e.cloneNode(true);n.dataset.s17Duplicate='1';e.after(n);}"],
  ['native-select','C17-04',null,"const e=document.querySelector('#aunara-navigation');if(e&&!e.querySelector('select')){const s=document.createElement('select');s.innerHTML='<option>ES</option><option>EN</option>';e.append(s);}"],
  ['consent-border','C17-05','.access-login .create-account-consents .optional-health-consent > span:last-child{border:2px solid red!important;background:white!important;height:48px!important}'],
  ['broken-portal','C17-06',null,"const e=document.querySelector('.navigation-backdrop'),h=document.querySelector('.site-header');if(e&&e.parentElement!==h)h.append(e);"],
 ];
 for(const [name,guard,css,js] of mutations){const dir=resolve(scratch,name);cpSync(builds[`candidate-${key}`],dir,{recursive:true});const html=resolve(dir,'index.html'),original=readFileSync(html,'utf8');
  for(const phase of ['red','restored']){const injection=phase==='restored'?'':css?`<style>${css}</style>`:`<script>new MutationObserver(()=>{${js}}).observe(document.documentElement,{childList:true,subtree:true});</script>`;writeFileSync(html,original.replace('</head>',injection+'</head>'));const resultOut=resolve(out,'negatives',name,phase);mkdirSync(resultOut,{recursive:true});
   const run=spawnSync(process.execPath,[fileURLToPath(import.meta.url)],{env:{...process.env,NEGATIVES:'0',ONLY_TAG:'guest-es-390',BUILD_DIR:dir,BUILDS:process.env.BUILDS??resolve(out,'builds.json'),OUT:resultOut},encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
   writeFileSync(resolve(resultOut,'run.log'),run.stdout+'\n'+run.stderr);const data=JSON.parse(readFileSync(resolve(resultOut,`${engine}-${key}.json`),'utf8'));const failed=data.rows.filter(r=>!r.pass);results.push({name,guard,phase,pass:phase==='red'?failed.some(r=>r.id===guard||r.id.startsWith(guard+' ')):failed.length===0,exit:run.status,failed});console.log(name,phase,results.at(-1).pass);
  }
 }
 writeFileSync(resolve(out,`negatives-${engine}-${key}.json`),JSON.stringify({results},null,2));process.exit(results.every(r=>r.pass)?0:1);
}
const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='chromium'?{executablePath:process.env.CHROMIUM_EXE??'/Users/alejandro/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell'}:{});
const rows=[],measurements=[];const add=(id,tag,pass,detail)=>{rows.push({id,tag,pass:!!pass,detail});if(!pass)console.log('FAIL',id,tag,JSON.stringify(detail));};
async function serve(dir){const s=createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://local').pathname);if(base!=='/'&&p.startsWith(base))p=p.slice(base.length);p=p.replace(/^\//,'');let f=resolve(dir,p||'index.html');if(!f.startsWith(dir)||!existsSync(f)||!extname(f))f=resolve(dir,'index.html');try{res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[extname(f)]??'application/octet-stream');res.end(readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>s.listen(0,'127.0.0.1',r));return {url:`http://127.0.0.1:${s.address().port}${base}`,close:()=>s.close()};}
const servers={baseline:await serve(builds[`baseline-${key}`]),candidate:await serve(process.env.BUILD_DIR??builds[`candidate-${key}`])};
const profile={onboardingCompleted:true,initialRoutineDecision:'rejected',healthDataMode:'personalized',primaryGoal:'strength',goals:['strength'],equipmentPreference:'mixed',trainingDaysPerWeek:3,sessionMinutes:45,birthDate:'',ageYears:null,metabolicSex:'unspecified',heightCm:null,currentWeightKg:null,targetWeightKg:null,waistCm:null,activityLevel:'moderate',experience:'beginner',dietaryPattern:'omnivore',nutritionPlanMode:'simple',macroMealsPerDay:4,allergies:'',healthNotes:'',readinessScreen:{confirmed:false,chestPain:false,dizzinessOrFainting:false,medicallySupervisedOnly:false,musculoskeletalConcern:false},limitations:[]};
const track={id:'track-s17',name:'Synthetic SDD017',kind:'goal',focus:'strength',equipment:'mixed',sessionMinutes:45,daysPerWeek:3,creationMode:'manual',trainingDays:['monday','wednesday','friday'],workout:[{id:'s17-w1',exerciseId:'0001',sets:3,reps:8,day:'wednesday'}]};
async function open(variant,auth,lang,width){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height:900},locale:lang==='es'?'es-CO':'en-US',reducedMotion:'reduce'}),user=syntheticUser({user_metadata:{health_data_consent:'granted'}});
 await context.addInitScript(({lang,profile,track,token})=>{if(sessionStorage.getItem('s17-seeded'))return;sessionStorage.setItem('s17-seeded','1');localStorage.setItem('repbook-language',JSON.stringify(lang));localStorage.setItem('aunara-storage-notice-v1','1');localStorage.setItem('repbook-training-tracks-initialized','true');localStorage.setItem('repbook-health-profile',JSON.stringify(profile));localStorage.setItem('repbook-training-tracks',JSON.stringify([track]));localStorage.setItem('repbook-active-track',JSON.stringify(track.id));if(token)localStorage.setItem('sb-synthetic-auth-token',JSON.stringify(token));},{lang,profile,track,token:auth?syntheticSession(user):null});
 const log=[];await installSyntheticSupabase(context,{user,log});const page=await context.newPage();page.setDefaultTimeout(30000);await page.goto(servers[variant].url);await page.locator('.shared-navigation').waitFor();if(auth)await page.waitForFunction(()=>!document.querySelector('.app-shell').classList.contains('is-guest'));await page.evaluate(()=>document.fonts.ready);return {context,page,log};
}
async function footer(page){await page.locator('footer').scrollIntoViewIfNeeded();return page.evaluate(async()=>{
 const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
 const ink=async img=>{await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);await new Promise(r=>setTimeout(r,100));ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);const d=ctx.getImageData(0,0,c.width,c.height).data;let l=c.width,r=-1,t=c.height,b=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>20){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const z=box(img);return{bounds:[l,r,t,b],natural:[c.width,c.height],box:z,cx:z.x+(l+r+1)/2/c.width*z.w,cy:z.y+(t+b+1)/2/c.height*z.h,left:z.x+l/c.width*z.w,right:z.x+(r+1)/c.width*z.w,src:img.getAttribute('src')};};
 const f=document.querySelector('footer'),style=getComputedStyle(f),a=await ink(f.querySelector('.footer-brand img')),ac=await ink(f.querySelector('.footer-development-credit img')),slogan=box(f.querySelector('.footer-brand span')),label=box(f.querySelector('.footer-development-credit span')),r=box(f),fixed=document.querySelector('.mobile-workout'),fr=fixed&&getComputedStyle(fixed).display!=='none'&&getComputedStyle(fixed).position==='fixed'?box(fixed):null;
 return {rect:r,padding:[style.paddingTop,style.paddingRight,style.paddingBottom,style.paddingLeft],gap:style.gap,creditMarginTop:parseFloat(getComputedStyle(f.querySelector('.footer-development-credit')).marginTop),minHeight:style.minHeight,bg:style.backgroundColor,a,ac,slogan,label,deltaLogo:Math.abs(a.cx-slogan.x-slogan.w/2),deltaCredit:Math.abs((label.x+ac.right)/2-(r.x+r.w/2)),deltaCreditY:Math.abs(ac.cy-label.y-label.h/2),fixed:fr,legalBottom:box(f.querySelector('.footer-development-credit')).bottom,text:f.innerText,links:[...f.querySelectorAll('a')].map(e=>e.getAttribute('href')),overflow:document.documentElement.scrollWidth-innerWidth};
 });}
const labels={es:['Inicio','Ingresar','Ayuda / instalación'],en:['Home','Log in','Help / installation']};
async function drawer(page,auth,lang,tag,baselineItems){
 const trigger=page.locator('.navigation-trigger');let expectedScroll=await page.evaluate(()=>scrollY);await trigger.click();const panel=page.locator('#aunara-navigation');await panel.waitFor();
 await page.screenshot({path:resolve(out,`${engine}-${key}-${tag}-candidate-drawer.png`),timeout:30000});
 const items=await panel.locator('.navigation-row').allTextContents();
 add('C17-03',tag,auth?JSON.stringify(items)===JSON.stringify(baselineItems):JSON.stringify(items)===JSON.stringify(labels[lang]),{items,baselineItems});
 const geometry=await panel.evaluate(e=>{const r=e.getBoundingClientRect();return{portal:e.parentElement.parentElement===document.body,overflow:e.scrollWidth-e.clientWidth,modal:e.getAttribute('aria-modal'),locked:document.body.style.overflow,focused:!!document.activeElement.closest('#aunara-navigation')};});
 add('C17-06',tag,geometry.portal&&geometry.overflow<=1&&geometry.modal==='true'&&geometry.locked==='hidden'&&geometry.focused,geometry);
 const toggle=panel.locator('.navigation-head button').filter({hasText:/^(ES|EN)$/});
 add('C17-04',tag,await toggle.count()===1&&await panel.locator('select').count()===0,{toggleCount:await toggle.count(),selects:await panel.locator('select').count()});
 if(await toggle.count()===1){
  const g=await toggle.evaluate(e=>{const r=e.getBoundingClientRect(),h=e.closest('.navigation-head'),i=h.querySelector('img').getBoundingClientRect(),c=h.querySelector('.navigation-close').getBoundingClientRect();return{w:r.width,h:r.height,x:r.x,right:r.right,logoRight:i.right,closeX:c.x,label:e.getAttribute('aria-label')};});
  add('C17-04 geometry',tag,g.w>=44&&g.h>=44&&g.x>=g.logoRight-1&&g.right<=g.closeX+1&&!!g.label,g);
  await page.keyboard.press('Tab');await toggle.focus();const visual=await toggle.evaluate(e=>{const s=getComputedStyle(e),lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};const a=lum(s.color),b=lum(s.backgroundColor);return{contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),outline:s.outlineStyle,width:parseFloat(s.outlineWidth),focusVisible:e.matches(':focus-visible')};});add('C17-04 contrast/focus',tag,visual.contrast>=4.5&&visual.outline!=='none'&&visual.width>=2&&visual.focusVisible,visual);
  for(const key of ['click','Enter','Space']){const before=await toggle.textContent();if(key==='click')await toggle.click();else await toggle.press(key);add('C17-04 activation',tag,await toggle.textContent()!==before&&await panel.count()===1&&await toggle.evaluate(e=>e===document.activeElement),key);}
  const changed=await toggle.textContent();await page.keyboard.press('Escape');await page.reload();await page.waitForTimeout(100);expectedScroll=await page.evaluate(()=>scrollY);await trigger.click();add('C17-04 persistence',tag,await toggle.textContent()===changed,{changed,after:await toggle.textContent()});
  // Restore original locale through the real control before subsequent checks.
  if((await toggle.textContent()).toLowerCase()!==lang)await toggle.click();
 }
 for(const direction of ['Tab','Shift+Tab']){const trace=[];const n=await panel.locator('button,a,select').count();for(let i=0;i<n+2;i++){await page.keyboard.press(direction);trace.push(await page.evaluate(()=>!!document.activeElement.closest('#aunara-navigation')));}add('C17-06 focus trap',tag,trace.every(Boolean),{direction,trace});}
 await page.keyboard.press('Escape');const restored=await page.evaluate(()=>({overflow:document.body.style.overflow,scroll:scrollY}));add('C17-06 Escape',tag,await panel.count()===0&&await trigger.evaluate(e=>e===document.activeElement)&&restored.overflow!=='hidden'&&Math.abs(restored.scroll-expectedScroll)<=2,{expectedScroll,...restored});
 await page.locator('.brand').click();add('C17-06 logo opener',tag,await panel.count()===1);await page.locator('.navigation-close').click();
 if(tag.endsWith('1440')){await trigger.click();await page.locator('.navigation-backdrop').click({position:{x:1,y:1}});add('C17-06 backdrop',tag,await panel.count()===0&&await trigger.evaluate(e=>e===document.activeElement));}
 if(auth){
  const actions=[[/Abrir perfil|Open profile/,'.profile-done','.profile-done'],[/Cuenta \/ privacidad|Account \/ privacy/,'.access-panel','button.access-close'],[/Biblioteca de ejercicios|Exercise library/,'#library-title',null]];
  for(const [name,target,close] of actions){await trigger.click();await panel.getByRole('button',{name,exact:true}).click();await page.locator(target).waitFor();add('C17-06 auth destination',tag,await panel.count()===0,{name:String(name),target});if(close){if(close==='button.access-close')await page.getByRole('button',{name:/Cerrar acceso|Close access panel/,exact:true}).click();else await page.locator(close).click();}}
  await trigger.click();await panel.locator('.navigation-row').first().click();
  await trigger.click();await panel.locator('.workout-trigger').click();await page.locator('.workout-panel').waitFor();add('C17-06 training',tag,await panel.count()===0);await page.locator('.workout-panel .close-button').first().click();
 }
 if(!auth){
  for(let i=0;i<2;i++){await trigger.click();const entry=panel.locator('.navigation-row').nth(i);if(!(await entry.count())){await page.keyboard.press('Escape');continue;}await entry.click();await page.waitForTimeout(100);const state=await page.evaluate(()=>({hash:location.hash,top:scrollY,targetTop:document.querySelector('#top').getBoundingClientRect().top,access:!!document.querySelector('.access-panel'),open:!!document.querySelector('#aunara-navigation')}));add('C17-03 destination '+i,tag,!state.open&&(i===0?state.hash==='#top'&&Math.abs(state.targetTop)<=2:state.access),state);if(state.access)await page.getByRole('button',{name:/Cerrar acceso|Close access panel/,exact:true}).click();}
 }
}
async function consent(page,lang,tag){await page.locator('.navigation-trigger').click();await page.locator('#aunara-navigation .navigation-row').filter({hasText:/Ingresar|Log in|Login/}).first().click();await page.locator('.access-mode').getByRole('button',{name:lang==='es'?/Crear/:/Create/}).click();
 const m=await page.evaluate(()=>{const wrap=document.querySelector('.create-account-consents'),label=wrap.querySelector('.optional-health-consent'),span=label.querySelector('span'),check=label.querySelector('input');const measure=e=>{const s=getComputedStyle(e);return{border:parseFloat(s.borderTopWidth)+parseFloat(s.borderRightWidth)+parseFloat(s.borderBottomWidth)+parseFloat(s.borderLeftWidth),background:s.backgroundColor,shadow:s.boxShadow,height:s.height,minHeight:s.minHeight,padding:s.padding,color:s.color};};const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};const color=getComputedStyle(span).color;let e=span,bg='rgb(255,255,255)';while(e){const c=getComputedStyle(e).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){bg=c;break;}e=e.parentElement;}const a=lum(color),b=lum(bg);const old=span.getBoundingClientRect().height,oldText=span.textContent;span.textContent=oldText+' '+oldText+' '+oldText;const expanded=span.getBoundingClientRect().height;span.textContent=oldText;return{span:measure(span),wrapper:measure(wrap),required:check.required,checked:check.checked,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),naturalWrap:expanded>old+4};});
 const clean=s=>s.border===0&&['transparent','rgba(0, 0, 0, 0)'].includes(s.background)&&s.shadow==='none';add('C17-05',tag,clean(m.span)&&clean(m.wrapper)&&m.naturalWrap&&m.contrast>=4.5&&!m.required&&!m.checked,m);
 await page.screenshot({path:resolve(out,`${engine}-${key}-${tag}-consent.png`),fullPage:true,timeout:30000});
 const form=page.locator('.access-panel form');await form.locator('input[type=text]:not([inputmode=email])').first().fill('Synthetic athlete');await form.locator('input[inputmode=email]').fill('fixture@example.invalid');const passwords=form.locator('input[type=password]');for(let i=0;i<await passwords.count();i++)await passwords.nth(i).fill('Synthetic-Password-2026');
 const submissions=[];await page.context().route('**/auth/v1/signup**',route=>{const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});submissions.push(JSON.parse(route.request().postData()));return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({user:syntheticUser(),session:null})});});
 const submit=form.getByRole('button',{name:lang==='es'?/Crear mi cuenta/:/Create my account/});add('C17-05 mandatory',tag,await submit.isDisabled()&&submissions.length===0);await form.locator('input[type=checkbox]').first().check();await submit.click();await page.waitForTimeout(150);add('C17-05 optional decline',tag,submissions.length===1&&submissions[0].data?.health_data_consent==='declined'&&!!submissions[0].data?.accepted_legal_version,{requests:submissions.length,health:submissions[0]?.data?.health_data_consent,legal:!!submissions[0]?.data?.accepted_legal_version});
 await page.getByRole('button',{name:/Cerrar acceso|Close access panel/,exact:true}).click();}
try{for(const auth of [false,true])for(const lang of ['es','en'])for(const width of [320,390,1440]){
 const tag=`${auth?'auth':'guest'}-${lang}-${width}`;if(process.env.ONLY_TAG&&process.env.ONLY_TAG!==tag)continue;const control=await open('baseline',auth,lang,width),candidate=await open('candidate',auth,lang,width);
 try{
  const before=await footer(control.page),after=await footer(candidate.page);measurements.push({tag,before,after});
  await control.page.screenshot({path:resolve(out,`${engine}-${key}-${tag}-baseline-footer.png`),fullPage:true,timeout:30000});await candidate.page.screenshot({path:resolve(out,`${engine}-${key}-${tag}-candidate-footer.png`),fullPage:true,timeout:30000});
  const pad=width===1440?24:20;const bottom=parseFloat(after.padding[2]);const reserve=after.fixed?after.fixed.h+12:0;
  add('C17-01',tag,parseFloat(after.padding[0])===pad&&Math.abs(bottom-(pad+reserve))<=2&&parseFloat(after.gap)===12&&after.creditMarginTop===0&&(auth||after.rect.h<before.rect.h)&&after.bg==='rgb(255, 255, 255)'&&(!after.fixed||after.legalBottom<=after.fixed.y+1),{before:before.rect.h,after:after.rect.h,padding:after.padding,gap:after.gap,creditMarginTop:after.creditMarginTop,reserve,fixed:after.fixed,legalBottom:after.legalBottom});
  add('C17-02',tag,after.deltaLogo<=2&&after.deltaCredit<=2&&after.deltaCreditY<=2&&after.text===before.text&&JSON.stringify(after.links)===JSON.stringify(before.links)&&after.a.src===before.a.src&&after.ac.src===before.ac.src&&after.overflow<=1,{logo:after.deltaLogo,credit:after.deltaCredit,creditY:after.deltaCreditY,textEqual:after.text===before.text,srcEqual:after.a.src===before.a.src});
  await control.page.locator('.navigation-trigger').click();await control.page.screenshot({path:resolve(out,`${engine}-${key}-${tag}-baseline-drawer.png`),timeout:30000});const baselineItems=await control.page.locator('#aunara-navigation .navigation-row').allTextContents();
  await drawer(candidate.page,auth,lang,tag,baselineItems);if(!auth)await consent(candidate.page,lang,tag);
  add('C17-10 network isolation',tag,candidate.log.every(e=>e.blocked||e.path?.startsWith('/auth/')||e.path?.startsWith('/rest/')||e.path?.startsWith('/functions/')),{syntheticRequests:candidate.log.filter(e=>e.path).length,externalBlocked:candidate.log.filter(e=>e.blocked).length});
 }catch(e){add('execution',tag,false,String(e));}finally{await control.context.close();await candidate.context.close();}console.log('completed',tag);
}}finally{await browser.close();servers.baseline.close();servers.candidate.close();writeFileSync(resolve(out,`${engine}-${key}.json`),JSON.stringify({engine,base,rows,measurements,summary:{passed:rows.filter(r=>r.pass).length,total:rows.length}},null,2));}
process.exitCode=rows.every(r=>r.pass)?0:1;
