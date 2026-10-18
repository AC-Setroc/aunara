import sharp from '/Users/alejandro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
import {readdir,writeFile} from 'node:fs/promises';
const dir=new URL('./reviewer-shots/',import.meta.url);
const files=(await readdir(dir)).filter(x=>x.endsWith('.png')).sort();
for(let start=0;start<files.length;start+=6){
 const group=files.slice(start,start+6), parts=[];
 for(let i=0;i<group.length;i++){
  const input=await sharp(new URL(group[i],dir).pathname).resize({width:480,height:1200,fit:'inside'}).toBuffer();
  const meta=await sharp(input).metadata();
  parts.push({input,left:(i%3)*500,top:Math.floor(i/3)*1240+30});
  const text=group[i].replaceAll('&','&amp;');
  parts.push({input:Buffer.from(`<svg width="500" height="30"><rect width="500" height="30" fill="white"/><text x="4" y="18" font-size="12">${text}</text></svg>`),left:(i%3)*500,top:Math.floor(i/3)*1240});
 }
 const out=new URL(`./reviewer-collage-${String(start/6+1).padStart(2,'0')}.jpg`,import.meta.url);
 await sharp({create:{width:1500,height:2480,channels:3,background:'#bbb'}}).composite(parts).jpeg({quality:88}).toFile(out.pathname);
}
await writeFile(new URL('./reviewer-shot-index.json',import.meta.url),JSON.stringify(files,null,2));
console.log(files.length,'screenshots',Math.ceil(files.length/6),'collages');
