import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {extname,join} from 'node:path';
import {chromium,webkit} from 'playwright';
const root=process.cwd(), out=join(root,'AUNARA_SOT/sdd/2026-10-16-sdd014-revision');
const base=process.argv[2]||'/', label=base==='/'?'root':'rollback';
await mkdir(join(out,'reviewer-shots'),{recursive:true});
const manifest=JSON.parse(await readFile(join(out,'source-sha256.json'),'utf8'));
async function frozen(){for(const [p,h] of Object.entries(manifest.sha256))assert.equal(createHash('sha256').update(await readFile(join(root,p))).digest('hex'),h,p);}
await frozen();
const url='https://example.invalid/auth/v1/verify?type=synthetic-preview&redirect_to=https%3A%2F%2Flocal-preview.invalid%2Faunara%2F&fixture='+ 'not-a-token-'.repeat(12);
const server=createServer(async(req,res)=>{try{
 let path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/preview/')){let kind=path.split('/').at(-1);res.setHeader('content-type','text/html');res.end((await readFile(join(root,'supabase/templates',kind+'.html'),'utf8')).replaceAll('{{ .ConfirmationURL }}',url.replaceAll('&','&amp;')));return;}
 if(!path.startsWith(base)){res.writeHead(404);res.end();return;}
 const file=join(root,'dist/client',path.slice(base.length)||'index.html');
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
 res.setHeader('content-type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port, rows=[];
try{for(const [engine,type] of Object.entries({chromium,webkit})){
 console.log('launch',engine);const browser=await type.launch({headless:true,timeout:15000});console.log('launched',engine);
 try{for(const width of [320,390,1440])for(const lang of ['es','en']){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  const page=await context.newPage();page.setDefaultTimeout(6000);console.log('legal',engine,width,lang);
  await page.goto(origin+base);
  await page.getByRole('button',{name:'Rechazar propuesta',exact:true}).click();
  await page.getByRole('button',{name:'Navegación de Aunara',exact:true}).click();
  if(lang==='en')await page.getByRole('combobox').selectOption('en');
  await page.getByRole('button',{name:lang==='es'?'Cerrar navegación':'Close navigation',exact:true}).click();
  await page.getByRole('button',{name:lang==='es'?'Abrir navegación':'Open navigation',exact:true}).click();
  await page.getByRole('button',{name:lang==='es'?'Ingresar / crear cuenta':'Login / create account',exact:true}).click();
  for(const kind of ['privacy','terms']){
   const title=kind==='privacy'?(lang==='es'?'Política de privacidad':'Privacy policy'):(lang==='es'?'Términos de uso':'Terms of use');
   await page.getByRole('button',{name:title,exact:true}).last().click();
   const dialog=page.getByRole('dialog').filter({has:page.getByRole('heading',{name:title,exact:true})});
   await dialog.waitFor();
   const text=await dialog.innerText();
   assert.match(text,/admin@aunaratraining\.com/);if(kind==='privacy')assert.match(text,/Alejandro Cortés Burgos/);assert.match(text,/1\.0.*2026-07-29/);assert.doesNotMatch(text,/alejandro@ac-setroc|support@|soporte@/);
   assert.equal(await dialog.getByRole('checkbox').count(),0);
   const metrics=await dialog.evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,page:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(metrics.scroll<=metrics.width+1&&metrics.page<=width+1,JSON.stringify(metrics));
   const file=`${label}-${engine}-${width}-${lang}-${kind}.png`;
   await page.screenshot({path:join(out,'reviewer-shots',file)});
   // Scroll the real panel to its contact section and capture it, no DOM mutation.
   await dialog.getByText(/admin@aunaratraining\.com/).scrollIntoViewIfNeeded();
   await page.screenshot({path:join(out,'reviewer-shots',file.replace('.png','-contact.png'))});
   await page.getByRole('button',{name:lang==='es'?'Cerrar documento legal':'Close legal document',exact:true}).click();
   assert.equal(await page.getByRole('heading',{name:title,exact:true}).count(),0);
   rows.push({type:'legal',label,engine,width,lang,kind,metrics,file});
  }
  await page.close();await context.close();
 }
 if(base==='/')for(const width of [320,390,1440])for(const blocked of [false,true])for(const kind of ['confirm-signup','reset-password']){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.route('**/*',r=>!r.request().url().startsWith(origin)||(blocked&&r.request().resourceType()==='image')?r.abort():r.continue());
  const page=await context.newPage();await page.goto(origin+'/preview/'+kind);
  assert.equal(await page.locator('a[data-email-role="primary"]').getAttribute('href'),url);
  assert.equal(await page.locator('a[data-email-role="backup"]').getAttribute('href'),url);
  for(const [mail,role] of [['soporte','Español'],['support','English'],['admin','Privacidad / Privacy']]){const link=page.locator(`a[href="mailto:${mail}@aunaratraining.com"]`);assert.equal(await link.count(),1);assert.ok((await link.locator('..').innerText()).includes(role));}
  assert.ok(await page.locator('[lang=es]').count());assert.ok(await page.locator('[lang=en]').count());
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,images:document.images.length}));assert.ok(metrics.scroll<=width+1,JSON.stringify(metrics));
  const file=`email-${engine}-${width}-${blocked?'blocked':'enabled'}-${kind}.png`;
  await page.screenshot({path:join(out,'reviewer-shots',file),fullPage:true});
  const contrasts=await page.evaluate(()=>{
   const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
   const lum=s=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   return [...document.querySelectorAll('p,h1,h2,a')].map(el=>{const c=getComputedStyle(el).color;let p=el,b;while(p){b=getComputedStyle(p).backgroundColor;if(b!=='rgba(0, 0, 0, 0)'&&b!=='transparent')break;p=p.parentElement;}const a=lum(c),z=lum(b||'rgb(255,255,255)');return{tag:el.tagName,color:c,bg:b,ratio:(Math.max(a,z)+.05)/(Math.min(a,z)+.05)}});
  });assert.ok(contrasts.every(c=>c.ratio>=4.5),JSON.stringify(contrasts));
  rows.push({type:'email',engine,width,blocked,kind,metrics,contrasts,file});
  await page.close();await context.close();
 }
 }catch(error){console.error(error);throw error;}finally{for(const c of browser.contexts())for(const p of c.pages())await p.close();await browser.close();}
}}finally{server.close();await frozen();await writeFile(join(out,`reviewer-ui-${label}.json`),JSON.stringify({at:new Date().toISOString(),base,rows},null,2));}
console.log('PASS',label,rows.length,'matrix cases; source freeze unchanged');
