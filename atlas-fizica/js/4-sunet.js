(function(){
'use strict';
var A=window.__atlas,H=A.helpers,$=H.$,$$=H.$$;
var SOUNDS=[
 ['ploaie','Ploaie','Ploaie constantă, cu picături mici.'],
 ['valuri','Valuri','Valuri lente care vin și se retrag.'],
 ['vant','Vânt printre copaci','Adiere care crește și scade.'],
 ['foc','Foc de lemne','Zumzet jos și trosnete rare.'],
 ['pad','Acorduri calme','Sintetizator lent și cald.'],
 ['pian','Pian lin','Note rare de pian, cu ecou lung.'],
 ['clopote','Clopoței de sticlă','Sunete clare, ca de cristal.'],
 ['harpa','Harpă în amurg','Arpegii line, în patru acorduri.']
];
var st={ctx:null,master:null,uiOut:null,cur:null,id:'ploaie',vol:40,playing:false,ui:true,uiVol:40,bufs:{},ir:null};
var store={ get:function(k,d){ try{ var v=localStorage.getItem('atlas-x-'+k); return v===null?d:v; }catch(e){ return d; } }, set:function(k,v){ try{ localStorage.setItem('atlas-x-'+k,String(v)); }catch(e){} } };
st.id=store.get('sound','ploaie'); st.vol=+store.get('vol','40'); st.ui=store.get('ui','1')==='1'; st.uiVol=+store.get('uivol','40');
if(!SOUNDS.some(function(s){return s[0]===st.id}))st.id='ploaie';
if(!(st.vol>=0&&st.vol<=100))st.vol=40; if(!(st.uiVol>=0&&st.uiVol<=100))st.uiVol=40;
A.audio=st;

function gainOf(){ var v=st.vol/100; return v*v*0.9; }
function uiGainOf(){ var v=st.uiVol/100; return v*v*0.5; }
function ensure(){
  try{ if(!st.ctx){ var C=window.AudioContext||window.webkitAudioContext; if(!C)return false; st.ctx=new C();
      st.master=st.ctx.createGain(); st.master.gain.value=gainOf(); st.master.connect(st.ctx.destination);
      st.uiOut=st.ctx.createGain(); st.uiOut.gain.value=uiGainOf(); st.uiOut.connect(st.ctx.destination); }
    if(st.ctx.state==='suspended')st.ctx.resume(); return true; }catch(e){ return false; }
}
function setVol(){ if(st.master)st.master.gain.setTargetAtTime(gainOf(),st.ctx.currentTime,0.08); }
function setUiVol(){ if(st.uiOut)st.uiOut.gain.setTargetAtTime(uiGainOf(),st.ctx.currentTime,0.05); }

function noise(kind){
  if(st.bufs[kind])return st.bufs[kind]; var c=st.ctx,len=Math.round(c.sampleRate*6),f=Math.round(c.sampleRate*0.08),raw=new Float32Array(len+f),i;
  if(kind==='white'){ for(i=0;i<raw.length;i++)raw[i]=Math.random()*2-1; }
  else if(kind==='pink'){ var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0; for(i=0;i<raw.length;i++){ var w=Math.random()*2-1; b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980; raw[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926; } }
  else { var last=0; for(i=0;i<raw.length;i++){ var w2=Math.random()*2-1; last=(last+0.02*w2)/1.02; raw[i]=last*3.5; } }
  var buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0); for(i=0;i<len;i++)d[i]=raw[i];
  for(i=0;i<f;i++){ var k=i/f; d[i]=raw[i]*k+raw[len+i]*(1-k); }
  st.bufs[kind]=buf; return buf;
}
function impulse(){
  if(st.ir)return st.ir; var c=st.ctx,len=Math.round(c.sampleRate*3.2),b=c.createBuffer(2,len,c.sampleRate);
  for(var ch=0;ch<2;ch++){ var d=b.getChannelData(ch); for(var i=0;i<len;i++){ var t=i/len; d[i]=(Math.random()*2-1)*Math.pow(1-t,3.2); } }
  st.ir=b; return b;
}
function loopSrc(kind){ var s=st.ctx.createBufferSource(); s.buffer=noise(kind); s.loop=true; s.start(0,Math.random()*5); return s; }
function filt(type,f,q){ var n=st.ctx.createBiquadFilter(); n.type=type; n.frequency.value=f; if(q)n.Q.value=q; return n; }
function gain(v){ var n=st.ctx.createGain(); n.gain.value=v; return n; }
function lfo(rate,depth,target){ var o=st.ctx.createOscillator(),g=gain(depth); o.frequency.value=rate; o.connect(g); g.connect(target); o.start(); return o; }
function burst(dest,kind,f,q,peak,dur){ var c=st.ctx,s=c.createBufferSource(); s.buffer=noise(kind); var fl=filt(f<0?'highpass':'bandpass',Math.abs(f),q),g=c.createGain(),t=c.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+0.003); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t,Math.random()*5,dur+0.05); }
/* Intrare cu ecou pentru melodii: sunetul uscat și cel cu reverberație ajung în același nod de ieșire. */
function room(out,wet){ var inp=gain(1),dry=gain(0.7),cv=st.ctx.createConvolver(),w=gain(wet); cv.buffer=impulse(); inp.connect(dry); dry.connect(out); inp.connect(cv); cv.connect(w); w.connect(out); return inp; }
function pluck(dest,f,t,dur,type,peak,lpf){ var c=st.ctx,o=c.createOscillator(),g=c.createGain(),fl=filt('lowpass',lpf||2600); o.type=type; o.frequency.value=f; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(fl); fl.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.1); }
function hz(n){ return 440*Math.pow(2,(n-69)/12); }

var BUILD={
 ploaie:function(out,T){ var s=loopSrc('pink'),hp=filt('highpass',400),lp=filt('lowpass',7500),g=gain(0.55); s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(out);
   (function drop(){ if(T.dead)return; burst(out,'white',1800+Math.random()*4200,4,0.05+Math.random()*0.07,0.04); T.timer=setTimeout(drop,35+Math.random()*130); })();
   return [s]; },
 valuri:function(out){ var s=loopSrc('brown'),lp=filt('lowpass',420),g=gain(0.5); s.connect(lp); lp.connect(g); g.connect(out); lfo(0.09,0.4,g.gain); lfo(0.09,260,lp.frequency);
   var f=loopSrc('pink'),bp=filt('bandpass',1800,0.7),fg=gain(0.04); f.connect(bp); bp.connect(fg); fg.connect(out); lfo(0.09,0.035,fg.gain); return [s,f]; },
 vant:function(out){ var s=loopSrc('pink'),bp=filt('bandpass',520,0.9),g=gain(0.5); s.connect(bp); bp.connect(g); g.connect(out); lfo(0.05,260,bp.frequency); lfo(0.13,110,bp.frequency); lfo(0.07,0.25,g.gain);
   var s2=loopSrc('brown'),lp=filt('lowpass',200),g2=gain(0.4); s2.connect(lp); lp.connect(g2); g2.connect(out); return [s,s2]; },
 foc:function(out,T){ var s=loopSrc('brown'),lp=filt('lowpass',260),g=gain(0.7); s.connect(lp); lp.connect(g); g.connect(out); lfo(0.4,0.12,g.gain);
   (function crack(){ if(T.dead)return; var n=Math.random()<0.25?3:1; for(var i=0;i<n;i++)setTimeout(function(){ if(!T.dead)burst(out,'white',-(1400+Math.random()*3000),0.7,0.08+Math.random()*0.25,0.01+Math.random()*0.03); },i*28); T.timer=setTimeout(crack,60+Math.random()*520); })();
   return [s]; },
 pad:function(out){ var c=st.ctx,lp=filt('lowpass',1100),inp=room(out,0.5),n=[73.42,146.83,220,329.63,369.99,554.37],list=[];
   lp.connect(inp); lfo(0.03,300,lp.frequency);
   n.forEach(function(f,i){ [-5,5].forEach(function(dt){ var o=c.createOscillator(),g=gain(0.0); o.type=i<2?'sine':'triangle'; o.frequency.value=f; o.detune.value=dt; g.gain.value=i<2?0.07:0.035; o.connect(g); g.connect(lp); o.start(); lfo(0.04+0.017*i,g.gain.value*0.7,g.gain); list.push(o); }); });
   return list; },
 pian:function(out,T){ var inp=room(out,0.75),sc=[62,64,66,69,71,74,76,78],c=st.ctx,last=-1;
   (function next(){ if(T.dead)return; var i;do{ i=Math.floor(Math.random()*sc.length); }while(i===last); last=i; var t=c.currentTime+0.02,f=hz(sc[i]);
     pluck(inp,f,t,3.4,'sine',0.22,2400); pluck(inp,f*2,t,1.6,'triangle',0.05,3000);
     if(Math.random()<0.28)pluck(inp,hz(sc[Math.max(0,i-2)]),t+0.16,3,'sine',0.14,2200);
     if(Math.random()<0.18)pluck(inp,hz(38+(Math.random()<0.5?0:7)),t,5,'sine',0.16,500);
     T.timer=setTimeout(next,1400+Math.random()*2600); })();
   return []; },
 clopote:function(out,T){ var inp=room(out,0.9),sc=[76,79,81,83,86,88,91],c=st.ctx;
   (function next(){ if(T.dead)return; var t=c.currentTime+0.02,f=hz(sc[Math.floor(Math.random()*sc.length)]),car=c.createOscillator(),md=c.createOscillator(),mg=c.createGain(),g=c.createGain();
     car.type='sine'; car.frequency.value=f; md.type='sine'; md.frequency.value=f*3.51; mg.gain.setValueAtTime(f*0.9,t); mg.gain.exponentialRampToValueAtTime(f*0.02,t+1.6); md.connect(mg); mg.connect(car.frequency);
     g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.13,t+0.004); g.gain.exponentialRampToValueAtTime(0.0001,t+5.2); car.connect(g); g.connect(inp); car.start(t); md.start(t); car.stop(t+5.3); md.stop(t+5.3);
     T.timer=setTimeout(next,1800+Math.random()*4200); })();
   return []; },
 harpa:function(out,T){ var inp=room(out,0.7),c=st.ctx,ch=[[50,53,57,60,64],[46,50,53,57,62],[43,46,50,53,58],[45,49,52,55,59]],pat=[0,1,2,3,4,3,2,1],idx=0,bar=0;
   (function next(){ if(T.dead)return; var chord=ch[bar%4],n=chord[pat[idx%pat.length]],t=c.currentTime+0.02;
     pluck(inp,hz(n+12),t,1.9,'triangle',0.17,2600); if(idx%8===0)pluck(inp,hz(chord[0]-12),t,3.2,'sine',0.16,600);
     idx++; if(idx%16===0)bar++; T.timer=setTimeout(next,440+Math.random()*40); })();
   return []; }
};
function stopTrack(tr){ tr.dead=true; clearTimeout(tr.timer); tr.srcs.forEach(function(s){ try{ s.stop(); }catch(e){} }); try{ tr.out.disconnect(); }catch(e){} }
function start(id){
  if(!ensure()){ note('Browserul nu permite sunetul. Încearcă din alt browser.'); return; }
  stop(true); var out=st.ctx.createGain(); out.gain.value=0; out.connect(st.master);
  var tr={out:out,srcs:[],dead:false,timer:0}; try{ tr.srcs=BUILD[id](out,tr)||[]; }catch(e){ stopTrack(tr); note('Sunetul nu a putut porni.'); return; }
  out.gain.setTargetAtTime(1,st.ctx.currentTime,0.7); st.cur=tr; st.playing=true; setVol(); paint();
}
function stop(quiet){
  var tr=st.cur; st.cur=null; if(tr){ tr.out.gain.setTargetAtTime(0,st.ctx.currentTime,0.3); tr.dead=true; clearTimeout(tr.timer); setTimeout(function(){ stopTrack(tr); },6000); }
  st.playing=false; if(!quiet)paint();
}
function note(t){ var n=$('#sndNote'); if(n)n.textContent=t; }
function select(id){ st.id=id; store.set('sound',id); start(id); }
function toggle(){ if(st.playing)stop(); else start(st.id); paint(); }

/* ---------- Sunete pentru interfață ---------- */
var lastUi=0;
function blip(f1,f2,dur,peak,type){
  if(!st.ui||!st.ctx||st.ctx.state!=='running')return; var c=st.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f1,t); o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(st.uiOut); o.start(t); o.stop(t+dur+0.05);
}
A.hoverSound=function(){ var n=performance.now(); if(n-lastUi<55)return; lastUi=n; blip(1180,900,0.09,0.16,'sine'); };
A.clickSound=function(){ blip(310,170,0.16,0.42,'sine'); blip(900,620,0.05,0.10,'triangle'); };
A.tickSound=function(v){ var n=performance.now(); if(n-lastUi<70)return; lastUi=n; blip(500+v*500,420+v*400,0.06,0.12,'sine'); };
A.chime=function(ok){ if(!st.ui)return; if(!ensure())return; var c=st.ctx; setTimeout(function(){ if(ok){ blip(523.25,520,0.7,0.22,'sine'); setTimeout(function(){ blip(783.99,780,0.9,0.2,'sine'); },110); } else blip(233,230,0.6,0.2,'sine'); },90); };
A.ensureAudio=ensure;

/* ---------- Interfață ---------- */
function nameOf(){ var n=''; SOUNDS.forEach(function(s){ if(s[0]===st.id)n=s[1]; }); return n; }
function paint(){
  var b=$('#sndBtn'); if(b){ b.setAttribute('aria-pressed',st.playing?'true':'false'); b.setAttribute('aria-label',st.playing?'Oprește muzica de fundal':'Pornește muzica de fundal'); b.title=st.playing?'Oprește: '+nameOf():'Pornește muzica de fundal'; }
  $$('#sndGrid input').forEach(function(i){ i.checked=(st.playing&&i.value===st.id)||(!st.playing&&i.value==='none'); });
  var pp=$('#sndPlay'); if(pp)pp.textContent=st.playing?'Pauză':'Pornește muzica';
}
function buildSettings(){
  var grid=$('#sndGrid'); if(!grid)return;
  grid.innerHTML=SOUNDS.concat([['none','Fără muzică','Liniște.']]).map(function(s){ return '<label class="sopt"><input type="radio" name="amb" id="amb-'+s[0]+'" value="'+s[0]+'"><span class="sname">'+s[1]+'</span><span class="sdesc">'+s[2]+'</span></label>'; }).join('');
  $$('#sndGrid input').forEach(function(i){ i.addEventListener('change',function(){ if(i.value==='none'){ stop(); } else select(i.value); paint(); }); });
  var vr=$('#sndVol'),vo=$('#sndVolOut'); vr.value=st.vol; vo.textContent=st.vol+'%';
  vr.addEventListener('input',function(){ st.vol=+vr.value; vo.textContent=st.vol+'%'; store.set('vol',st.vol); setVol(); });
  $('#sndPlay').addEventListener('click',toggle);
  var on=$('#uiOn'); on.checked=st.ui; on.addEventListener('change',function(){ st.ui=on.checked; store.set('ui',st.ui?'1':'0'); if(st.ui){ ensure(); setTimeout(A.clickSound,40); } });
  var uv=$('#uiVol'),uo=$('#uiVolOut'); uv.value=st.uiVol; uo.textContent=st.uiVol+'%';
  uv.addEventListener('input',function(){ st.uiVol=+uv.value; uo.textContent=st.uiVol+'%'; store.set('uivol',st.uiVol); ensure(); setUiVol(); });
  var sb=$('#sndBtn'); if(sb)sb.addEventListener('click',toggle);
  paint();
}
buildSettings();

/* Sunete la hover, clic și glisare, pentru toate elementele interactive */
var HOVER='button:not(:disabled), .side a, .dcard a, .pager a, .sopt, .swatch';
var lastHover=null;
document.addEventListener('pointerover',function(e){ if(e.pointerType!=='mouse')return; var t=e.target.closest&&e.target.closest(HOVER); if(!t||t===lastHover)return; lastHover=t; A.hoverSound(); });
document.addEventListener('pointerout',function(e){ if(lastHover&&!(e.relatedTarget&&lastHover.contains(e.relatedTarget)))lastHover=null; });
document.addEventListener('pointerdown',function(e){ ensure(); var t=e.target.closest&&e.target.closest(HOVER+', a[href], select, input[type=checkbox]'); if(t)A.clickSound(); },true);
document.addEventListener('click',function(e){ if(e.detail!==0)return; var t=e.target.closest&&e.target.closest('button, a[href]'); if(t)A.clickSound(); },true);
document.addEventListener('input',function(e){ var t=e.target; if(t&&t.type==='range'){ var v=(t.value-t.min)/((t.max-t.min)||1); A.tickSound(v); } },true);
document.addEventListener('visibilitychange',function(){ if(st.ctx&&!document.hidden&&st.ctx.state==='suspended')st.ctx.resume(); });
})();
