// Independent SDD-013 compiled review. No application mutation; all identities are synthetic.
// BUILD_DIR=/absolute/client BASE=/|/aunara/ BROWSER=chromium|webkit OUT=/absolute/results
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync, symlinkSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
// The only adapters are disposable generated copies; original harnesses stay byte-identical.
if (process.env.REGRESSIONS === '1') {
  const scratch=mkdtempSync('/private/tmp/aunara-s13-regressions-');
  mkdirSync(`${scratch}/harness`);mkdirSync(`${scratch}/builds`);mkdirSync(`${scratch}/results`);
  for(const [name,target] of [['e4-root',process.env.ROOT_BUILD],['e4-aunara',process.env.AUNARA_BUILD],['e2-root',process.env.E2_ROOT_BUILD],['e2-aunara',process.env.E2_AUNARA_BUILD]])symlinkSync(target,`${scratch}/builds/${name}`);
  const historical=new URL('../../2026-10-12-sdd006-ciclo2-revision/harness/',import.meta.url);
  const later=new URL('../../2026-10-13-sdd012-revision/harness/',import.meta.url);
  const lib=readFileSync(new URL('lib.mjs',later),'utf8').replace('new URL("./server.mjs", import.meta.url).pathname',JSON.stringify(new URL('server.mjs',historical).pathname)).replace('document.querySelector("#aunara-navigation > button")?.click()', 'document.querySelector("#aunara-navigation button[aria-label]")?.click()');
  writeFileSync(`${scratch}/harness/lib.mjs`,lib);
  const menuAccount='await page.locator("button.navigation-trigger").click(); await page.getByRole("button", {name:/Abrir cuenta y sincronización|Open account and synchronization/}).click();';
  let regressionsPass=true;
  for(const name of ['storage-matrix','startup-fallback','auth-recovery','privacy-summary','ui-navigation','geometry-roundtrip']) {
    if(process.env.REGRESSION_NAMES&&!process.env.REGRESSION_NAMES.split(',').includes(name))continue;
    let source=readFileSync(new URL(`${name}.mjs`,['privacy-summary','ui-navigation'].includes(name)?later:historical),'utf8');
    source=source.replaceAll('await page.locator("button.sync-trigger").click();',menuAccount).replaceAll('#aunara-navigation nav button','#aunara-navigation .navigation-row');
    source=source.replace('else await page.locator("button.workout-trigger").first().click();','else { await page.locator("button.navigation-trigger").click(); await page.locator("#aunara-navigation .workout-trigger").first().click(); }');
    source=source.replace('const b = document.querySelectorAll("#aunara-navigation button"); return document.activeElement === b[b.length - 1];','const b = document.querySelectorAll("#aunara-navigation button, #aunara-navigation a, #aunara-navigation select"); return document.activeElement === b[b.length - 1];');
    source=source.replace('document.querySelector(".sync-trigger")?.classList.contains("is-synced") ?? false','Boolean(document.querySelector(".access-panel .access-account.is-synced"))');
    const portOffset=(process.env.BROWSER==='webkit'?1000:0)+Number(process.env.REGRESSION_PORT_OFFSET??0);
    if(portOffset)source=source.replaceAll(/startServer\((\d+),/g,(_,port)=>`startServer(${Number(port)+portOffset},`);
    if(name==='storage-matrix'){
      source=source.replace('const browser = await launch();','console.log("STAGE launch"); const browser = await launch(); console.log("STAGE launched");');
      source=source.replace('const context = await browser.newContext','console.log("STAGE context",build,base,lang,vpName,variant); const context = await browser.newContext');
      source=source.replace('const page = await context.newPage();','console.log("STAGE page",build,base,lang,vpName,variant); const page = await context.newPage(); console.log("STAGE page-ready");');
      source=source.replace('await page.goto(urls[`${build}:${base}`],','console.log("STAGE goto",build,base,lang,vpName,variant); await page.goto(urls[`${build}:${base}`],');
      source=source.replace('} finally { await context.close(); }','} finally { console.log("STAGE page-close",build,base,lang,vpName,variant); await page.close({runBeforeUnload:false}); console.log("STAGE context-close"); await context.close(); console.log("STAGE closed"); }');
    }
    writeFileSync(`${scratch}/harness/${name}.mjs`,source);
    const result=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[`${scratch}/harness/${name}.mjs`],{env:process.env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';const timer=setTimeout(()=>child.kill('SIGTERM'),3600000);child.stdout.on('data',chunk=>{stdout+=String(chunk);process.stdout.write(chunk);});child.stderr.on('data',chunk=>{stderr+=String(chunk);process.stderr.write(chunk);});child.on('error',reject);child.on('exit',code=>{clearTimeout(timer);resolve({stdout,stderr,code});});});
    const out=process.env.OUT;mkdirSync(out,{recursive:true});writeFileSync(`${out}/${name}.log`,result.stdout+'\n'+result.stderr);
    const json=readFileSync(`${scratch}/results/${name}.json`,'utf8');const data=JSON.parse(json);regressionsPass&&=data.rows.length>0&&data.rows.every(row=>row.pass);writeFileSync(`${out}/${name}.json`,json);console.log(name,data.summary);
  }
  console.log('Disposable adapted harness:',scratch);process.exit(regressionsPass?0:1);
}
import { launch, installSyntheticSupabase, syntheticUser, syntheticSession, tally, consoleCollector } from '../../2026-10-13-sdd012-revision/harness/lib.mjs';
if(process.env.WEBKIT_KEYBOARD_PROBE==='1'){
 const browser=await launch();const rows=[];
 try{for(const explicit of [false,true]){const context=await browser.newContext();await context.route('**/*',r=>r.abort('blockedbyclient'));const page=await context.newPage();
 await page.setContent(`<button id="close" ${explicit?'tabindex="0"':''}>Close</button><button id="destination" ${explicit?'tabindex="0"':''}>Destination</button><a id="anchor" href="#top" ${explicit?'tabindex="0"':''}>Anchor</a><label>Language<select id="language"><option>ES</option><option>EN</option></select></label><button id="help" ${explicit?'tabindex="0"':''}>Help</button>`);
 await page.locator('#close').focus();const trace=[];for(const key of ['Tab','Tab','Tab','Tab','Tab','Shift+Tab','Shift+Tab','Shift+Tab','Shift+Tab','Shift+Tab']){await page.keyboard.press(key);trace.push({key,...await page.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,text:document.activeElement.textContent.slice(0,50)}))});}rows.push({explicitTabIndex:explicit,trace});await context.close();}}
 finally{await browser.close();}mkdirSync(process.env.OUT,{recursive:true});writeFileSync(`${process.env.OUT}/webkit-keyboard-isolation.json`,JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));process.exit(0);
}
if(process.env.CONTACT_SHEETS==='1'){
 const browser=await launch();try{for(const state of ['guest','session'])for(const lang of ['es','en']){
  const images=[];for(const surface of ['logo','footer'])for(const width of [1440,390,320]){const name=`${state}-${lang}-${width}-${surface}.png`;images.push(`<figure style="width:${width===1440?500:width}px"><figcaption>${state} ${lang} ${width} ${surface}</figcaption><img width="${width===1440?500:width}" src="data:image/png;base64,${readFileSync(`${process.env.OUT}/${name}`).toString('base64')}"></figure>`);}
  const context=await browser.newContext({viewport:{width:1250,height:1800},deviceScaleFactor:1});const page=await context.newPage();await page.setContent(`<style>body{margin:0;background:#eee;font:14px system-ui}main{display:grid;grid-template-columns:510px 400px 330px;gap:0}figure{margin:4px}figcaption{height:24px;background:#fff}img{display:block;height:auto}</style><main>${images.join('')}</main>`);await page.screenshot({path:`${process.env.OUT}/visual-${state}-${lang}.png`,fullPage:true});await context.close();
 }}finally{await browser.close();}process.exit(0);
}
if(process.env.NEGATIVES==='1'){
 const scratch=mkdtempSync('/private/tmp/aunara-s13-negatives-');const rows=[];const original=process.env.BUILD_DIR;
 const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
 for(const [id,tag,installed,guard] of [['N1','guest-es-390',false,'S13-01'],['N2','guest-es-1440',true,'S13-04'],['N3','guest-es-1440',false,'S13-05'],['N4','session-es-1440',false,'S13-07']]){
  const copy=`${scratch}/${id}`;cpSync(original,copy,{recursive:true});const css=readdirSync(`${copy}/assets`).find(f=>f.endsWith('.css'));let target=`${copy}/assets/${css}`;let mutation='';
  if(id==='N1')mutation='\n.navigation-backdrop{display:grid!important;place-items:center!important;padding:16px!important}.navigation-panel{position:relative!important;inset:auto!important;width:min(100%,420px)!important;height:auto!important;max-height:calc(100dvh - 32px)!important;border-radius:24px!important}';
  if(id==='N3')mutation='\n.access-panel .create-account-consents{border:1px solid red!important}';
  if(id==='N4')mutation='\n.account-deletion-backdrop .account-deletion{position:fixed!important;right:0!important;top:0!important;bottom:0!important;width:370px!important;height:100dvh!important;max-height:none!important;border-radius:0!important}';
  if(id==='N2'){const candidates=readdirSync(`${copy}/assets`).filter(f=>f.endsWith('.js'));const selector='button, a[href], select, input, textarea, [tabindex]';const js=candidates.find(f=>readFileSync(`${copy}/assets/${f}`,'utf8').includes(selector));if(!js)throw Error('N2 focus selector not found; cannot claim negative');target=`${copy}/assets/${js}`;const text=readFileSync(target,'utf8');writeFileSync(target,text.replace(selector,'button, a[href], input, textarea, [tabindex]:not(select)'));}
  const sourceFile=target.replace(copy,original),before=hash(sourceFile);if(mutation)writeFileSync(target,readFileSync(target,'utf8')+mutation);
  for(const phase of ['red','restored']){
   if(phase==='restored')cpSync(sourceFile,target);
   const folder=`${process.env.OUT}/${id}-${phase}`;mkdirSync(folder,{recursive:true});const env={...process.env,NEGATIVES:'0',BUILD_DIR:copy,ONLY_TAG:tag,INSTALLED:installed?'1':'0',OUT:folder};
   const result=spawnSync(process.execPath,[new URL(import.meta.url).pathname],{env,encoding:'utf8',timeout:120000,maxBuffer:5*1024*1024});writeFileSync(`${folder}/run.log`,result.stdout+'\n'+result.stderr);
   const file=`${folder}/sdd013-${process.env.BROWSER??'chromium'}-${(process.env.BASE??'/')==='/'?'root':'aunara'}.json`;const data=JSON.parse(readFileSync(file,'utf8'));const targetRows=data.rows.filter(r=>r.name.startsWith(guard));const pass=phase==='red'?targetRows.some(r=>!r.pass):data.rows.every(r=>r.pass)&&hash(target)===before;
   rows.push({id,phase,pass,guard,summary:data.summary,failed:data.rows.filter(r=>!r.pass),restoredHash:phase==='restored'?hash(target):undefined,originalHash:before});console.log(id,phase,pass?'PASS':'FAIL');
  }
 }
 mkdirSync(process.env.OUT,{recursive:true});writeFileSync(`${process.env.OUT}/negatives.json`,JSON.stringify({scratch,rows},null,2));process.exit(rows.every(r=>r.pass)?0:1);
}
const base = process.env.BASE ?? '/';
const engine = process.env.BROWSER ?? 'chromium';
const out = process.env.OUT ?? new URL('../resultados/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const port = Number(process.env.PORT ?? 4490);
const server = spawn(process.execPath, [new URL('../../2026-10-12-sdd006-ciclo2-revision/harness/server.mjs', import.meta.url).pathname, String(port), base, process.env.BUILD_DIR], { stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((resolve, reject) => { server.stdout.on('data', c => String(c).includes('serving') && resolve()); server.on('exit', c => reject(new Error(`server ${c}`))); });
const browser = await launch();
const t = tally();
let completedCases=0;
const add=t.add.bind(t);t.add=(name,pass,detail='')=>{add(name,pass,detail);if(!pass)console.log('FAIL',name,detail);};
let baselineServer;
if(process.env.BASELINE_DIR){baselineServer=spawn(process.execPath,[new URL('../../2026-10-12-sdd006-ciclo2-revision/harness/server.mjs',import.meta.url).pathname,String(port+1),base,process.env.BASELINE_DIR],{stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{baselineServer.stdout.on('data',c=>String(c).includes('serving')&&resolve());baselineServer.on('exit',c=>reject(new Error(`baseline server ${c}`)));});}
const labels = { es: { logo: 'Navegación de Aunara', burger: 'Abrir navegación', login: 'Ingresar / crear cuenta', privacy: 'Cuenta / privacidad', home: 'Inicio / rutas', profile: 'Perfil', library: 'Biblioteca de ejercicios', help: 'Ayuda / instalación', out: 'Salir', language: 'Idioma' }, en: { logo: 'Aunara navigation', burger: 'Open navigation', login: 'Login / create account', privacy: 'Account / privacy', home: 'Home / routes', profile: 'Profile', library: 'Exercise library', help: 'Help / installation', out: 'Sign out', language: 'Language' } };
const profile = { onboardingCompleted: true, initialRoutineDecision: 'rejected', healthDataMode: 'personalized', primaryGoal: 'strength', goals: ['strength'], equipmentPreference: 'mixed', trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: '', ageYears: null, metabolicSex: 'unspecified', heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: 'moderate', experience: 'beginner', dietaryPattern: 'omnivore', nutritionPlanMode: 'simple', macroMealsPerDay: 4, allergies: '', healthNotes: '', readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] };
const track={id:'track-s13',name:'SDD013 fixture',kind:'goal',focus:'strength',equipment:'mixed',sessionMinutes:45,daysPerWeek:3,creationMode:'manual',trainingDays:['monday','wednesday','friday'],workout:[{id:'s13-w1',exerciseId:'0001',sets:3,reps:8,day:'wednesday'}]};
async function open({ session, lang, width, blocked = false, installed = false, baseline = false }) {
  const user = syntheticUser({ user_metadata: { health_data_consent: blocked ? 'denied' : 'granted' } });
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width, height: width === 1440 ? 900 : 844 }, locale: lang === 'es' ? 'es-CO' : 'en-US' });
  await context.addInitScript(({ lang, profile, track, token, installed }) => {
    localStorage.setItem('repbook-language', JSON.stringify(lang));
    localStorage.setItem('aunara-storage-notice-v1', '1');
    localStorage.setItem('repbook-training-tracks-initialized', 'true');
    localStorage.setItem('repbook-health-profile', JSON.stringify(profile));
    localStorage.setItem('repbook-training-tracks',JSON.stringify([track]));localStorage.setItem('repbook-active-track',JSON.stringify(track.id));
    if (token) localStorage.setItem('sb-synthetic-auth-token', JSON.stringify(token));
    if (installed) Object.defineProperty(navigator, 'standalone', { value: true });
  }, { lang, profile, track, token: session ? syntheticSession(user) : null, installed });
  const log = [];
  await installSyntheticSupabase(context, { user, log });
  // Library navigation is verified without contacting third-party media providers.
  // Serve the unchanged local icon as synthetic media, rather than aborting image loads.
  const media=readFileSync(new URL('../../../../public/brand/aunara-app-icon.svg',import.meta.url));
  await context.route('**/*',route=>{const host=new URL(route.request().url()).hostname;if(route.request().resourceType()==='image'&&host!=='127.0.0.1'&&host!=='synthetic.supabase.invalid'){log.push({fixtureMedia:true,host});return route.fulfill({status:200,contentType:'image/svg+xml',body:media});}return route.fallback();});
  const page = await context.newPage(); const errors = consoleCollector(page);
  page.setDefaultTimeout(30000);
  await page.goto(`http://127.0.0.1:${baseline?port+1:port}${base}`,{timeout:30000});
  await page.waitForSelector('.shared-navigation');
  if (session) await page.waitForFunction(() => !document.querySelector('.app-shell')?.classList.contains('is-guest'), { timeout: 15000 });
  await page.waitForTimeout(200);
  return { context, page, log, errors };
}
const rect = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height, right:r.right, bottom:r.bottom }; };
async function deletionGeometry(page,lang){
 await page.getByRole('button',{name:labels[lang].burger,exact:true}).click();await page.getByRole('button',{name:labels[lang].privacy,exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Eliminar cuenta permanentemente':'Delete account permanently',exact:true}).click();
 return page.locator('.account-deletion[role=dialog]').evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el),b=getComputedStyle(el.parentElement);return {box:[r.x,r.y,r.width,r.height],padding:s.padding,radius:s.borderRadius,background:s.backgroundColor,border:s.border,maxHeight:s.maxHeight,backdrop:{display:b.display,padding:b.padding,placeItems:b.placeItems},buttons:[...el.querySelectorAll('button')].map(e=>({label:e.textContent.trim(),disabled:e.disabled}))};});
}
async function footer(page) {
  return page.evaluate(async () => {
    const box = el => { const r = el.getBoundingClientRect(); return { x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom }; };
    const ink = async img => {
      await img.decode(); const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d'); ctx.drawImage(img,0,0,c.width,c.height); const pixels = ctx.getImageData(0,0,c.width,c.height).data;
      let l=c.width,r=-1,top=c.height,b=-1;
      for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++) if(pixels[(y*c.width+x)*4+3]>20) { l=Math.min(l,x);r=Math.max(r,x);top=Math.min(top,y);b=Math.max(b,y); }
      const br=box(img); return { bounds:[l,r,top,b], natural:[c.width,c.height], box:br, cx:br.x+((l+r+1)/2/c.width)*br.w, cy:br.y+((top+b+1)/2/c.height)*br.h, left:br.x+l/c.width*br.w,right:br.x+(r+1)/c.width*br.w, src:img.getAttribute('src') };
    };
    const a=await ink(document.querySelector('.footer-brand img')); const ac=await ink(document.querySelector('.footer-development-credit img'));
    const slogan=box(document.querySelector('.footer-brand span')); const label=box(document.querySelector('.footer-development-credit span')); const f=box(document.querySelector('footer'));
    return { a,ac,slogan,label,footer:f, deltaA:Math.abs(a.cx-(slogan.x+slogan.w/2)), deltaAC:Math.abs(ac.cy-(label.y+label.h/2)), deltaCredit:Math.abs((label.x+ac.right)/2-(f.x+f.w/2)), horizontal:label.right<=ac.left+1, legal:document.querySelectorAll('.footer-legal button').length,overflow:document.documentElement.scrollWidth-innerWidth };
  });
}
async function contrast(page,selector){return page.locator(selector).evaluateAll(els=>els.map(el=>{const css=getComputedStyle(el);const rgb=c=>c.match(/[\d.]+/g).map(Number);const lum=c=>{const [r,g,b]=rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};let ancestor=el,bg='rgb(255,255,255)';while(ancestor){const candidate=getComputedStyle(ancestor).backgroundColor;if(!candidate.includes('rgba')||rgb(candidate)[3]>0){bg=candidate;break;}ancestor=ancestor.parentElement;}const l1=lum(css.color),l2=lum(bg);return {label:el.textContent,fg:css.color,bg,ratio:(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};}));}
async function consent(page, lang, tag) {
  await page.getByRole('button', { name: labels[lang].burger }).click();
  await page.getByRole('button', { name: labels[lang].login, exact:true }).click();
  await page.waitForSelector('.access-panel');
  await page.locator('.access-mode').getByRole('button', {name:lang==='es'?/Crear/:/Create/}).click();
  const form=page.locator('.access-panel form');
  const measure=()=>page.evaluate(() => {
    const wrapper=document.querySelector('.access-panel .legal-consents'); const label=wrapper.querySelector('.optional-health-consent'); const check=label.querySelector('input'); const cs=getComputedStyle(wrapper); const text=getComputedStyle(label);
    const rgb=c=>c.match(/[\d.]+/g).map(Number); const lum=c=>{ const [r,g,b]=rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b;};
    let ancestor=label, bg='rgb(255,255,255)'; while(ancestor) {const color=getComputedStyle(ancestor).backgroundColor; if(!color.includes('rgba')||rgb(color)[3]>0){bg=color;break;}ancestor=ancestor.parentElement;}
    const l1=lum(text.color),l2=lum(bg); return {border:parseFloat(cs.borderTopWidth),radius:parseFloat(cs.borderTopLeftRadius),bg:cs.backgroundColor,color:text.color,teal:getComputedStyle(document.documentElement).getPropertyValue('--teal-800').trim(),opacity:text.opacity,contrast:(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05),required:check.required,checked:check.checked,association:check.labels.length,checks:wrapper.querySelectorAll('input[type=checkbox]').length};
  });
  for(const state of ['normal','hover','focus']) {if(state==='hover')await page.locator('.optional-health-consent').hover(); if(state==='focus')await page.locator('.optional-health-consent input').focus(); const m=await measure();t.add(`S13-05 visual ${state} ${tag}`,m.border===0&&m.radius===0&&/rgba\(0, 0, 0, 0\)|transparent/.test(m.bg)&&m.contrast>=4.5&&m.opacity==='1'&&!m.required&&!m.checked&&m.association>0&&m.checks===2,JSON.stringify(m));}
  await form.locator('input[type=text]:not([inputmode=email])').first().fill('Synthetic athlete');
  await form.locator('input[inputmode=email]').fill('fixture@example.invalid');
  const passwords=form.locator('input[type=password]'); for(let i=0;i<await passwords.count();i++)await passwords.nth(i).fill('Synthetic-Password-2026');
  const submissions=[];await page.context().route('**/auth/v1/signup**',route=>{const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});submissions.push(JSON.parse(route.request().postData()));return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({user:syntheticUser(),session:null})});});
  const submit=form.getByRole('button',{name:lang==='es'?/Crear mi cuenta/:/Create my account/});
  t.add(`S13-05 mandatory blocks ${tag}`,await submit.isDisabled()&&submissions.length===0,`requests=${submissions.length}`);
  await form.locator('input[type=checkbox]').first().check();await form.getByRole('button',{name:lang==='es'?/Crear mi cuenta/:/Create my account/}).click();await page.waitForTimeout(500);
  t.add(`S13-05 no optional signup ${tag}`,submissions.length===1&&submissions[0].data?.health_data_consent==='declined'&&Boolean(submissions[0].data?.accepted_legal_version),JSON.stringify(submissions).slice(0,500));
  await page.getByRole('button',{name:lang==='es'?'Cerrar acceso':'Close access panel',exact:true}).click();
}
try {
for(const session of [false,true]) for(const lang of ['es','en']) for(const width of [1440,390,320]) {
  const tag=`${session?'session':'guest'}-${lang}-${width}`;if(process.env.ONLY_TAG&&process.env.ONLY_TAG!==tag)continue;const s=labels[lang];const installed=process.env.INSTALLED==='1'; const {context,page,errors,log}=await open({session,lang,width,installed});
  try {
    const header=await page.evaluate(() => {const row=document.querySelector('.shared-navigation');const logo=row.querySelector('.brand');const burger=row.querySelector('.navigation-trigger');const img=logo.querySelector('.brand-wordmark')??logo.querySelector('img');const b=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right}};return {logo:b(logo),burger:b(burger),img:b(img),visible:getComputedStyle(img).display!=='none',controls:[...row.querySelectorAll('button,a,select')].filter(e=>e.getClientRects().length).length,src:img.getAttribute('src'),overflow:document.documentElement.scrollWidth-innerWidth};});
    t.add(`S13-02 header ${tag}`,header.visible&&Math.abs(header.img.w-(width===1440?194:168))<=1&&header.logo.right<=header.burger.x&&header.burger.w>=44&&header.burger.h>=44&&header.logo.h>=44&&header.controls===2&&header.overflow<=1&&header.src.endsWith('aunara-training-systems.svg'),JSON.stringify(header));
    const lists=[];
    for(const opener of [s.logo,s.burger]) {
      const trigger=page.getByRole('button',{name:opener,exact:true});await trigger.click();await page.waitForSelector('#aunara-navigation');await page.waitForTimeout(100);
      const geometry=await page.evaluate(()=>{const el=document.querySelector('#aunara-navigation');const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,vh:innerHeight,header:!!el.closest('.site-header'),overflow:el.scrollWidth-el.clientWidth,aria:el.getAttribute('aria-modal')};});
      t.add(`S13-01 ${opener} ${tag}`,Math.abs(geometry.w-(width===1440?370:width))<=1&&Math.abs(geometry.x-(width===1440?width-370:0))<=1&&Math.abs(geometry.y)<=1&&Math.abs(geometry.bottom-geometry.vh)<=1&&!geometry.header&&geometry.overflow<=1&&geometry.aria==='true',JSON.stringify(geometry));
      const close=page.locator('#aunara-navigation button').filter({has:page.locator('svg')}).first();
      const focusedClose=await page.evaluate(()=>document.activeElement?.closest('button')?.getAttribute('aria-label')??document.activeElement?.textContent);
      t.add(`S13-04 opening focus ${opener} ${tag}`,/Cerrar|Close/.test(focusedClose),String(focusedClose));
      const items=await page.locator('#aunara-navigation .navigation-row').allTextContents();lists.push(items);
      t.add(`S13-03 destinations ${opener} ${tag}`,items.includes(s.home)&&items.includes(session?s.privacy:s.login)&&items.includes(s.help)===!installed&&(!session||items.includes(s.profile)&&items.includes(s.library)&&items.includes(s.out)),JSON.stringify(items));
      for(const direction of ['Tab','Shift+Tab']) {let selectSeen=false,contained=true;const trace=[];const n=await page.locator('#aunara-navigation button,#aunara-navigation a,#aunara-navigation select').count();for(let i=0;i<n+2;i++){await page.keyboard.press(direction);const f=await page.evaluate(()=>({in:!!document.activeElement?.closest('#aunara-navigation'),select:document.activeElement?.tagName==='SELECT',tag:document.activeElement?.tagName,label:(document.activeElement?.getAttribute('aria-label')??document.activeElement?.textContent??'').slice(0,60)}));trace.push(f);contained&&=f.in;selectSeen||=f.select;}t.add(`S13-04 ${direction} includes select ${opener} ${tag}`,contained&&selectSeen,JSON.stringify({contained,selectSeen,trace}));}
      const selected=page.getByRole('combobox',{name:new RegExp(`^${s.language}`)});t.add(`S13-03 localized select ${tag}`,await selected.count()===1);
      await selected.selectOption(lang==='es'?'en':'es');await page.waitForTimeout(50);t.add(`S13-03 language stays open ${tag}`,await page.locator('#aunara-navigation').count()===1&&await page.getByRole('combobox',{name:new RegExp(`^${labels[lang==='es'?'en':'es'].language}`)}).count()===1);
      await page.getByRole('combobox',{name:new RegExp(`^${labels[lang==='es'?'en':'es'].language}`)}).selectOption(lang);
      await page.screenshot({path:`${out}/${tag}-${opener===s.logo?'logo':'burger'}.png`});
      const locked=await page.evaluate(()=>document.body.style.overflow);await page.keyboard.press('Escape');await page.waitForSelector('#aunara-navigation',{state:'detached'});const returned=await trigger.evaluate(el=>el===document.activeElement);t.add(`S13-04 Escape restore ${tag}`,returned&&locked==='hidden'&&await page.evaluate(()=>document.body.style.overflow)!=='hidden');
    }
    t.add(`S13-03 same trigger lists ${tag}`,JSON.stringify(lists[0])===JSON.stringify(lists[1]));
    await page.locator('footer').scrollIntoViewIfNeeded();const optical=await footer(page);t.add(`S13-06 optical ${tag}`,optical.deltaA<=2&&optical.deltaAC<=2&&optical.deltaCredit<=2&&optical.horizontal&&optical.legal===3&&optical.overflow<=1,JSON.stringify(optical));await page.screenshot({path:`${out}/${tag}-footer.png`});
    for(const state of ['normal','hover','focus']){if(state==='hover')await page.locator('.footer-legal button').first().hover();if(state==='focus')await page.locator('.footer-legal button').first().focus();const colors=await contrast(page,'.footer-brand span,.footer-development-credit span,.footer-legal button,footer > p,footer > p a');t.add(`S13-06 contrast ${state} ${tag}`,colors.every(c=>c.ratio>=4.5),JSON.stringify(colors));}
    await page.setViewportSize({width,height:400});await page.getByRole('button',{name:s.burger,exact:true}).click();const short=await page.locator('#aunara-navigation').evaluate(el=>({scroll:el.scrollHeight,client:el.clientHeight,overflow:getComputedStyle(el).overflowY}));t.add(`S13-01 short scrolling ${tag}`,short.scroll>short.client&&['auto','scroll'].includes(short.overflow),JSON.stringify(short));
    await page.getByRole('button',{name:/Cerrar navegación|Close navigation/}).click();t.add(`S13-04 close restore ${tag}`,await page.getByRole('button',{name:s.burger,exact:true}).evaluate(el=>el===document.activeElement));
    if(width===1440){await page.getByRole('button',{name:s.burger,exact:true}).click();await page.locator('.navigation-backdrop').click({position:{x:0,y:0}});t.add(`S13-04 backdrop restore ${tag}`,await page.locator('#aunara-navigation').count()===0);} // Mobile has no exposed exterior area.
    await page.setViewportSize({width,height:width===1440?900:844});if(!session)await consent(page,lang,tag);
    if(session){if(baselineServer){const control=await open({session,lang,width,baseline:true});try{const before=await deletionGeometry(control.page,lang),after=await deletionGeometry(page,lang);t.add(`S13-07 deletion baseline ${tag}`,JSON.stringify(before)===JSON.stringify(after),JSON.stringify({before,after}));await page.keyboard.press('Escape');await page.getByRole('button',{name:lang==='es'?'Cerrar acceso':'Close access panel',exact:true}).click();}finally{await control.context.close();}}else t.add(`S13-07 deletion baseline ${tag}`,false,'BASELINE_DIR not provided');}
    await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:s.burger,exact:true}).click();const reduced=await page.locator('#aunara-navigation').evaluate(el=>({transition:getComputedStyle(el).transitionDuration,animation:getComputedStyle(el).animationDuration,transform:getComputedStyle(el).transform,animationName:getComputedStyle(el).animationName}));t.add(`S13-04 reduced motion ${tag}`,reduced.transform==='none'&&reduced.animationName==='none'&&reduced.transition.split(',').every(v=>parseFloat(v)<=.00001),JSON.stringify(reduced));await page.keyboard.press('Escape');
    if(session){
      await page.getByRole('button',{name:s.burger,exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Abrir perfil':'Open profile',exact:true}).click();await page.waitForSelector('.profile-done');t.add(`S13-03 profile destination ${tag}`,await page.locator('.profile-done').count()===1&&await page.locator('#aunara-navigation').count()===0);await page.locator('.profile-done').click();
      await page.getByRole('button',{name:s.burger,exact:true}).click();await page.locator('#aunara-navigation .workout-trigger').click();await page.waitForSelector('.workout-panel');t.add(`S13-03 workout destination ${tag}`,await page.locator('.workout-panel').count()===1&&await page.locator('#aunara-navigation').count()===0);await page.locator('.workout-panel .close-button').first().click();
      await page.getByRole('button',{name:s.burger,exact:true}).click();await page.getByRole('button',{name:s.library,exact:true}).click();await page.waitForSelector('#library-title');t.add(`S13-03 library destination ${tag}`,await page.locator('#library-title').count()===1&&await page.locator('#aunara-navigation').count()===0);
      await page.getByRole('button',{name:s.burger,exact:true}).click();await page.getByRole('button',{name:s.home,exact:true}).click();t.add(`S13-03 home destination ${tag}`,await page.locator('#hero-title').count()===1&&await page.locator('#aunara-navigation').count()===0);
      await page.getByRole('button',{name:s.burger,exact:true}).click();await page.getByRole('button',{name:s.out,exact:true}).click();await page.waitForTimeout(500);t.add(`S13-03 logout once ${tag}`,log.filter(l=>l.path==='/auth/v1/logout').length===1&&await page.locator('.app-shell.is-guest').count()===1);
    }else{await page.getByRole('button',{name:s.burger,exact:true}).click();await page.locator('#aunara-navigation a[href="#top"]').click();t.add(`S13-03 guest anchor ${tag}`,new URL(page.url()).hash==='#top'&&await page.locator('#aunara-navigation').count()===0);}
    t.add(`S13-08 clean console ${tag}`,errors.length===0,JSON.stringify(errors));
  }catch(error){t.add(`matrix block ${tag}`,false,String(error));}finally{await context.close();completedCases++;console.log('completed',tag);}
}
if(!process.env.ONLY_TAG)for(const blocked of [false,true])for(const installed of [false,true]) {
 const {context,page}=await open({session:true,lang:'es',width:390,blocked,installed});try{await page.getByRole('button',{name:labels.es.burger,exact:true}).click();const items=await page.locator('#aunara-navigation .navigation-row').allTextContents();t.add(`S13-03 gates blocked=${blocked} installed=${installed}`,items.includes('Perfil')&&items.includes('Biblioteca de ejercicios')&&items.includes('Ayuda / instalación')===!installed,JSON.stringify(items));}finally{await context.close();}
}
}catch(error){t.add('fatal execution incomplete',false,String(error));}finally{t.add('S13-08 complete case coverage',completedCases===(process.env.ONLY_TAG?1:12),`completed=${completedCases}`);await browser.close();server.kill();baselineServer?.kill();writeFileSync(`${out}/sdd013-${engine}-${base==='/'?'root':'aunara'}.json`,JSON.stringify({engine,base,completedCases,summary:t.summary(),rows:t.rows},null,2));console.log(t.summary());}
process.exitCode=t.rows.every(r=>r.pass)?0:1;
