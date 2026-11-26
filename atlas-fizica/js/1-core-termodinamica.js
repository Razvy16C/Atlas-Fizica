(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var R=8.314, NA=6.022e23, QE=1.602e-19, K0=9e9, EPS0=8.854e-12, MU0=4*Math.PI*1e-7;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

function fmt(x,d){ if(d===undefined)d=2; if(!isFinite(x))return '—'; return x.toLocaleString('ro-RO',{minimumFractionDigits:d,maximumFractionDigits:d}); }
function sci(x,d){ if(d===undefined)d=2; if(!isFinite(x)||x===0)return '0'; var e=Math.floor(Math.log10(Math.abs(x))); var m=x/Math.pow(10,e); if(Math.abs(m)>=9.995){m/=10;e+=1;} return fmt(m,d)+'·10<sup>'+e+'</sup>'; }
function si(x,u,d){ if(d===undefined)d=2; if(!isFinite(x))return '—'; if(x===0)return '0 '+u;
  var P=[[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'μ'],[1e-9,'n'],[1e-12,'p']]; var a=Math.abs(x);
  for(var i=0;i<P.length;i++){ if(a>=P[i][0]*0.9995) return fmt(x/P[i][0],d)+' '+P[i][1]+u; }
  return fmt(x*1e12,d)+' p'+u; }
function sgn(x){return x<0?'−':''}

var redraws=[];
function colors(el){ var s=getComputedStyle(el||document.documentElement); var g=function(n){return s.getPropertyValue(n).trim()};
  return {ink:g('--ink'),mut:g('--muted'),line:g('--line'),acc:g('--accent'),pos:g('--pos'),neg:g('--neg'),surf:g('--surface'),surf2:g('--surface2'),heat:g('--heat'),volt:g('--volt'),good:g('--good'),bad:g('--bad')}; }
function canvas(host,ratio,label){ var c=document.createElement('canvas'); c.className='cv'; c.style.aspectRatio=ratio; c.setAttribute('role','img'); if(label)c.setAttribute('aria-label',label); host.appendChild(c); return c; }
function ctx(c){ var w=c.clientWidth,h=c.clientHeight; if(w<10||h<10)return null; var dpr=Math.min(window.devicePixelRatio||1,2); var W=Math.round(w*dpr),H=Math.round(h*dpr);
  if(c.width!==W||c.height!==H){c.width=W;c.height=H;} var g=c.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h); return {g:g,w:w,h:h}; }
function watch(c,draw){ redraws.push(draw); if('ResizeObserver' in window){ new ResizeObserver(function(){draw()}).observe(c); } draw(); }
function ticks(a,b,n){ var span=b-a,raw=span/n,p=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/p,step=(m<1.5?1:m<3.5?2:m<7.5?5:10)*p,out=[];
  for(var v=Math.ceil(a/step-1e-9)*step;v<=b+step*1e-6;v+=step)out.push(+v.toPrecision(12)); out.step=step; return out; }
function decs(s){ return s>=1?0:Math.min(4,Math.ceil(-Math.log10(s)-1e-9)); }
function plot(g,w,h,xr,yr,o){ o=o||{}; var cl=colors(); var m={l:o.ml||46,r:14,t:24,b:34}; var box={l:m.l,t:m.t,r:w-m.r,b:h-m.b};
  var X=function(v){return box.l+(v-xr[0])/(xr[1]-xr[0])*(box.r-box.l)}, Y=function(v){return box.b-(v-yr[0])/(yr[1]-yr[0])*(box.b-box.t)};
  g.save(); g.font='11px Inter, system-ui, sans-serif'; g.lineWidth=1;
  var xt=ticks(xr[0],xr[1],o.nx||6), yt=ticks(yr[0],yr[1],o.ny||5);
  g.strokeStyle=cl.line; g.fillStyle=cl.mut; g.textAlign='center'; g.textBaseline='top';
  xt.forEach(function(v){var x=X(v); g.beginPath(); g.moveTo(x,box.t); g.lineTo(x,box.b); g.stroke(); g.fillText(fmt(v,decs(xt.step)),x,box.b+5);});
  g.textAlign='right'; g.textBaseline='middle';
  yt.forEach(function(v){var y=Y(v); g.beginPath(); g.moveTo(box.l,y); g.lineTo(box.r,y); g.stroke(); g.fillText(fmt(v,decs(yt.step)),box.l-6,y);});
  g.strokeStyle=cl.mut; g.lineWidth=1.5; g.beginPath(); g.moveTo(box.l,box.t); g.lineTo(box.l,box.b); g.lineTo(box.r,box.b); g.stroke();
  g.fillStyle=cl.mut; g.textBaseline='top';
  if(o.xl){g.textAlign='right'; g.fillText(o.xl,box.r,h-15);} if(o.yl){g.textAlign='left'; g.fillText(o.yl,6,4);}
  g.restore(); return {X:X,Y:Y,box:box}; }
function poly(g,pts,color,width,dash){ g.save(); g.strokeStyle=color; g.lineWidth=width||2; if(dash)g.setLineDash(dash); g.lineJoin='round'; g.beginPath();
  pts.forEach(function(p,i){ if(i)g.lineTo(p[0],p[1]); else g.moveTo(p[0],p[1]); }); g.stroke(); g.restore(); }
function arrow(g,x1,y1,x2,y2,color,wd){ var a=Math.atan2(y2-y1,x2-x1),hl=Math.max(7,(wd||2)*3.2); g.save(); g.strokeStyle=color; g.fillStyle=color; g.lineWidth=wd||2; g.lineCap='round';
  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2-Math.cos(a)*hl*0.6,y2-Math.sin(a)*hl*0.6); g.stroke();
  g.beginPath(); g.moveTo(x2,y2); g.lineTo(x2-hl*Math.cos(a-0.45),y2-hl*Math.sin(a-0.45)); g.lineTo(x2-hl*Math.cos(a+0.45),y2-hl*Math.sin(a+0.45)); g.closePath(); g.fill(); g.restore(); }
function dotLabel(g,x,y,txt,color,cl,dx,dy){ g.save(); g.fillStyle=cl.surf; g.strokeStyle=color; g.lineWidth=2; g.beginPath(); g.arc(x,y,5,0,6.2832); g.fill(); g.stroke();
  g.fillStyle=cl.ink; g.font='600 12px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,x+(dx===undefined?10:dx),y+(dy===undefined?-11:dy)); g.restore(); }

function res(host,items){ host.innerHTML=items.map(function(it){ return '<div class="r'+(it[3]?' hl':'')+'"><small>'+it[0]+'</small><b>'+it[1]+(it[2]?'<span class="u"> '+it[2]+'</span>':'')+'</b></div>'; }).join(''); }

function controls(host,prefix,defs,onChange){
  var box=document.createElement('div'); box.className='ctls'; var S={};
  defs.forEach(function(d){
    var id=prefix+'-'+d.id; var lab=document.createElement('label'); lab.className='ctl'; lab.htmlFor=id; lab.dataset.id=d.id;
    if(d.options){
      lab.innerHTML='<span class="ctl-name">'+d.label+'</span><select id="'+id+'"></select>';
      var sel=lab.querySelector('select');
      d.options.forEach(function(o){var op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; sel.appendChild(op);});
      sel.value=d.value; S[d.id]=isNaN(+d.value)?d.value:+d.value;
      sel.addEventListener('change',function(){ S[d.id]=isNaN(+sel.value)?sel.value:+sel.value; onChange(S,d.id); });
    } else {
      lab.innerHTML='<span class="ctl-name">'+d.label+'</span><output></output><input type="range" id="'+id+'" min="'+d.min+'" max="'+d.max+'" step="'+d.step+'" value="'+d.value+'">';
      var inp=lab.querySelector('input'), out=lab.querySelector('output');
      var upd=function(){ S[d.id]=+inp.value; out.textContent=fmt(S[d.id],d.dec||0)+(d.unit?' '+d.unit:''); };
      inp.addEventListener('input',function(){ upd(); onChange(S,d.id); }); upd();
    }
    box.appendChild(lab);
  });
  host.appendChild(box); return S;
}
function showCtl(host,id,on){ var l=host.querySelector('.ctl[data-id="'+id+'"]'); if(l)l.hidden=!on; }
function makeLab(el,title){
  el.classList.add('lab');
  el.innerHTML='<div class="lab-head"><span class="tag">Simulare</span><h3>'+title+'</h3></div><div class="lab-body"><div class="lab-ctl"></div><div class="lab-out"><div class="vis"></div><div class="res"></div><p class="hint"></p></div></div>';
  return {ctl:$('.lab-ctl',el),vis:$('.vis',el),res:$('.res',el),hint:$('.hint',el)};
}
function loop(el,fn){ if(reduce)return; var last=0; (function frame(ts){ if(!el.isConnected)return; var dt=Math.min(0.05,(ts-last)/1000||0); last=ts; if(!document.hidden)fn(dt,ts); requestAnimationFrame(frame); })(0); }
function visible(c){ return c.clientWidth>10; }

var labs={};

/* ---------- 1. Mol ---------- */
labs.mol=function(el){
  var L=makeLab(el,'Mol, masă molară și număr de particule');
  var subs=[['apă (H₂O)',18],['dioxid de carbon (CO₂)',44],['oxigen (O₂)',32],['azot (N₂)',28],['heliu (He)',4],['fier (Fe)',56],['aluminiu (Al)',27],['cupru (Cu)',64]];
  var S=controls(L.ctl,'mol',[
    {id:'s',label:'Substanța',options:subs.map(function(s,i){return [i,s[0]]}),value:0},
    {id:'m',label:'Masa probei m',min:1,max:500,step:1,value:36,unit:'g'},
    {id:'t',label:'Temperatura t',min:-100,max:500,step:1,value:27,unit:'°C'}],function(){upd()});
  L.vis.innerHTML='<div class="scale"><div class="scale-top"></div><div class="scale-bar"><i></i></div><div class="scale-lab"><span style="left:0">−100 °C</span><span style="left:16.7%;transform:translateX(-50%)">0 °C = 273,15 K</span><span style="right:0">500 °C</span></div></div>';
  function upd(){ var mu=subs[S.s][1]; var nu=S.m/mu, N=nu*NA, m0=mu*1e-3/NA, T=S.t+273.15;
    $('.scale-top',L.vis).textContent='t = '+fmt(S.t,0)+' °C  →  T = '+fmt(T,2)+' K';
    $('.scale-bar i',L.vis).style.width=((S.t+100)/600*100)+'%';
    res(L.res,[['Masa molară μ',fmt(mu,0),'g/mol'],['Cantitatea ν = m/μ',fmt(nu,2),'mol',true],['Număr de particule N',sci(N),''],['Masa unei particule m₀',sci(m0),'kg'],['Temperatura T',fmt(T,2),'K']]);
    L.hint.textContent='Pentru metale, particulele sunt atomi, nu molecule. Calculul este același.'; }
  upd();
};

/* ---------- 2. Gaz ideal ---------- */
labs.gas=function(el){
  var L=makeLab(el,'Gazul ideal într-un cilindru cu piston');
  var S=controls(L.ctl,'gas',[{id:'T',label:'Temperatura T',min:150,max:800,step:5,value:300,unit:'K'},{id:'V',label:'Volumul V',min:5,max:50,step:1,value:25,unit:'L'}],function(){upd()});
  var c=canvas(L.vis,'16/9','Particule de gaz într-un cilindru cu piston');
  var P=[]; for(var i=0;i<70;i++)P.push({x:Math.random(),y:Math.random(),a:Math.random()*6.2832,k:0.55+Math.random()*0.9});
  function geom(w,h){ var full=w-36; return {x0:12,top:12,Hb:h-24,full:full,Wb:S.V/50*full}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),G=geom(w,h);
    g.save(); g.strokeStyle=cl.line; g.setLineDash([4,4]); g.lineWidth=1; g.strokeRect(G.x0,G.top,G.full+12,G.Hb); g.restore();
    g.fillStyle=cl.acc; g.globalAlpha=0.08; g.fillRect(G.x0,G.top,G.Wb,G.Hb); g.globalAlpha=1;
    g.strokeStyle=cl.ink; g.lineWidth=3; g.beginPath(); g.moveTo(G.x0,G.top); g.lineTo(G.x0,G.top+G.Hb); g.moveTo(G.x0,G.top); g.lineTo(G.x0+G.full+12,G.top); g.moveTo(G.x0,G.top+G.Hb); g.lineTo(G.x0+G.full+12,G.top+G.Hb); g.stroke();
    g.fillStyle=cl.ink; g.fillRect(G.x0+G.Wb,G.top,8,G.Hb); g.fillRect(G.x0+G.Wb+8,G.top+G.Hb/2-3,Math.max(0,G.full+12-G.Wb-8),6);
    g.fillStyle=cl.acc; P.forEach(function(p){ g.beginPath(); g.arc(G.x0+p.x*G.Wb,G.top+p.y*G.Hb,3.2,0,6.2832); g.fill(); }); }
  function step(dt){ if(!visible(c))return; var G=geom(c.clientWidth,c.clientHeight), sp=95*Math.sqrt(S.T/300);
    P.forEach(function(p){ var v=sp*p.k; p.x+=Math.cos(p.a)*v*dt/G.Wb; p.y+=Math.sin(p.a)*v*dt/G.Hb;
      if(p.x<0){p.x=-p.x;p.a=Math.PI-p.a}else if(p.x>1){p.x=2-p.x;p.a=Math.PI-p.a}
      if(p.y<0){p.y=-p.y;p.a=-p.a}else if(p.y>1){p.y=2-p.y;p.a=-p.a} }); }
  loop(el,function(dt){ if(visible(c)){step(dt);draw();} });
  function upd(){ var p=R*S.T/S.V, v=Math.sqrt(3*R*S.T/0.028);
    res(L.res,[['Presiunea p = νRT/V',fmt(p,1),'kPa',true],['Temperatura T',fmt(S.T,0),'K'],['Volumul V',fmt(S.V,0),'L'],['Viteza termică (N₂)',fmt(v,0),'m/s'],['pV/T = νR',fmt(p*S.V/S.T,2),'J/K']]);
    L.hint.textContent='Gazul are ν = 1 mol. Mărește T și particulele se mișcă mai repede. Micșorează V și lovesc peretele mai des, deci p crește.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 3. Transformări simple ---------- */
labs.trans=function(el){
  var L=makeLab(el,'Transformări simple pe diagrama p–V');
  var S=controls(L.ctl,'tr',[
    {id:'k',label:'Transformarea',options:[['izoterm','Izotermă (T = const.)'],['izobar','Izobară (p = const.)'],['izocor','Izocoră (V = const.)']],value:'izoterm'},
    {id:'f',label:'Factorul de modificare f',min:0.4,max:2.5,step:0.05,value:1.5,dec:2}],function(){upd()});
  var c=canvas(L.vis,'4/3','Diagrama presiune–volum');
  function st(){ var T1=300,V1=12,p1=R*T1/V1,V2=V1,p2=p1,T2=T1,f=S.f;
    if(S.k==='izoterm'){V2=f*V1;p2=p1/f;} else if(S.k==='izobar'){V2=f*V1;T2=T1*f;} else {p2=f*p1;T2=T1*f;}
    return {T1:T1,V1:V1,p1:p1,V2:V2,p2:p2,T2:T2}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),s=st();
    var pl=plot(g,w,h,[0,36],[0,560],{xl:'V (L)',yl:'p (kPa)'});
    [s.T1,s.T2].forEach(function(T,i){ if(i===1&&Math.abs(s.T2-s.T1)<1e-6)return; var pts=[]; for(var V=3;V<=36;V+=0.5){var p=R*T/V; if(p<=560)pts.push([pl.X(V),pl.Y(p)]);} poly(g,pts,cl.mut,1.2,[5,4]); });
    var pts=[],n=60; for(var i=0;i<=n;i++){ var u=i/n,V,p; if(S.k==='izoterm'){V=s.V1+(s.V2-s.V1)*u;p=s.p1*s.V1/V;} else if(S.k==='izobar'){V=s.V1+(s.V2-s.V1)*u;p=s.p1;} else {V=s.V1;p=s.p1+(s.p2-s.p1)*u;} pts.push([pl.X(V),pl.Y(p)]); }
    var moved=Math.abs(pts[n][0]-pts[0][0])+Math.abs(pts[n][1]-pts[0][1])>6;
    poly(g,pts,cl.acc,3.5);
    if(moved){ var a=pts[n-4],b=pts[n]; arrow(g,a[0],a[1],b[0],b[1],cl.acc,3); }
    dotLabel(g,pl.X(s.V1),pl.Y(s.p1),'1',cl.ink,cl,-11,-10);
    dotLabel(g,pl.X(s.V2),pl.Y(s.p2),'2',cl.acc,cl,moved?11:11,moved?-10:12); }
  function upd(){ var s=st();
    res(L.res,[['Starea 1: p₁, V₁, T₁',fmt(s.p1,0)+' kPa, '+fmt(s.V1,0)+' L, '+fmt(s.T1,0)+' K',''],
      ['Starea 2: p₂, V₂, T₂',fmt(s.p2,0)+' kPa, '+fmt(s.V2,1)+' L, '+fmt(s.T2,0)+' K','',true],
      ['p₁V₁/T₁',fmt(s.p1*s.V1/s.T1,2),'J/K'],['p₂V₂/T₂',fmt(s.p2*s.V2/s.T2,2),'J/K']]);
    L.hint.textContent=S.k==='izocor'?'Izocoră: p₂ = f·p₁ și T₂ = f·T₁. Volumul rămâne 12 L.':S.k==='izobar'?'Izobară: V₂ = f·V₁ și T₂ = f·T₁. Presiunea rămâne constantă.':'Izotermă: V₂ = f·V₁ și p₂ = p₁/f. Linia punctată este izoterma T = 300 K.';
    draw(); }
  watch(c,draw); upd();
};

/* ---------- 4. Principiul I ---------- */
labs.first=function(el){
  var L=makeLab(el,'Q, ΔU și L pentru fiecare transformare');
  var S=controls(L.ctl,'f1',[
    {id:'g',label:'Gazul',options:[[1.5,'Monoatomic (He), CV = 3R/2'],[2.5,'Biatomic (N₂), CV = 5R/2']],value:1.5},
    {id:'nu',label:'Cantitatea ν',min:0.5,max:5,step:0.5,value:1,dec:1,unit:'mol'},
    {id:'T1',label:'Temperatura inițială T₁',min:200,max:600,step:10,value:300,unit:'K'},
    {id:'k',label:'Transformarea',options:[['izocor','Izocoră'],['izobar','Izobară'],['izoterm','Izotermă'],['adiabat','Adiabatică']],value:'izobar'},
    {id:'f',label:'Factorul f',min:0.4,max:2.5,step:0.05,value:2,dec:2}],function(){upd()});
  L.vis.innerHTML='<div class="bars"></div>';
  function calc(){ var cv=S.g*R,cp=cv+R,gm=cp/cv,nu=S.nu,T1=S.T1,f=S.f,T2,dU,Lm,Q;
    if(S.k==='izocor'){T2=T1*f;dU=nu*cv*(T2-T1);Lm=0;Q=dU;}
    else if(S.k==='izobar'){T2=T1*f;dU=nu*cv*(T2-T1);Lm=nu*R*(T2-T1);Q=dU+Lm;}
    else if(S.k==='izoterm'){T2=T1;dU=0;Lm=nu*R*T1*Math.log(f);Q=Lm;}
    else {T2=T1*Math.pow(f,1-gm);dU=nu*cv*(T2-T1);Lm=-dU;Q=0;}
    return {T2:T2,dU:dU,L:Lm,Q:Q}; }
  function upd(){ var r=calc(); var rows=[['Q',r.Q],['ΔU',r.dU],['L',r.L]]; var mx=Math.max(Math.abs(r.Q),Math.abs(r.dU),Math.abs(r.L),1e-9);
    $('.bars',L.vis).innerHTML=rows.map(function(x){ var wd=Math.abs(x[1])/mx*50; var left=x[1]>=0?50:50-wd;
      return '<div class="bar"><span>'+x[0]+'</span><div class="track"><i class="'+(x[1]<0?'n':'')+'" style="left:'+left+'%;width:'+wd+'%"></i></div><b>'+fmt(x[1],0)+' J</b></div>'; }).join('');
    res(L.res,[['Temperatura finală T₂',fmt(r.T2,0),'K'],['Căldura Q',fmt(r.Q,0),'J'],['Variația ΔU',fmt(r.dU,0),'J'],['Lucrul L',fmt(r.L,0),'J'],['Q − (ΔU + L)',fmt(r.Q-r.dU-r.L,0),'J',true]]);
    L.hint.textContent=(S.k==='izocor'?'Factorul f este raportul p₂/p₁. ':'Factorul f este raportul V₂/V₁. ')+'f > 1 înseamnă încălzire (izocoră, izobară) sau destindere (izotermă, adiabată). Bara roșie e pozitivă, cea albastră e negativă.'; }
  upd();
};

/* ---------- 5. Calorimetrie ---------- */
labs.calor=function(el){
  var L=makeLab(el,'Echilibru termic între două corpuri');
  var MAT=[['apă',4180],['aluminiu',900],['fier',450],['cupru',385],['plumb',130]];
  var opts=MAT.map(function(m,i){return [i,m[0]+' (c = '+m[1]+' J/kg·K)']});
  var S=controls(L.ctl,'ca',[
    {id:'a',label:'Corpul 1: substanța',options:opts,value:0},
    {id:'m1',label:'Masa m₁',min:0.1,max:5,step:0.1,value:1,dec:1,unit:'kg'},
    {id:'T1',label:'Temperatura T₁',min:0,max:100,step:1,value:80,unit:'°C'},
    {id:'b',label:'Corpul 2: substanța',options:opts,value:1},
    {id:'m2',label:'Masa m₂',min:0.1,max:5,step:0.1,value:2,dec:1,unit:'kg'},
    {id:'T2',label:'Temperatura T₂',min:0,max:100,step:1,value:20,unit:'°C'}],function(){upd()});
  var c=canvas(L.vis,'16/10','Două corpuri cu temperaturi diferite și temperatura de echilibru');
  function calc(){ var c1=MAT[S.a][1],c2=MAT[S.b][1],C1=S.m1*c1,C2=S.m2*c2,Te=(C1*S.T1+C2*S.T2)/(C1+C2); return {C1:C1,C2:C2,Te:Te,Q:Math.abs(C1*(Te-S.T1))}; }
  var col=function(T){return 'hsl('+Math.round(215-2.05*Math.max(0,Math.min(100,T)))+' 72% 52%)'};
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),r=calc();
    var items=[['Corpul 1',MAT[S.a][0]+', '+fmt(S.m1,1)+' kg',S.T1],['Corpul 2',MAT[S.b][0]+', '+fmt(S.m2,1)+' kg',S.T2],['După echilibru','amestec',r.Te]];
    items.forEach(function(it,i){ var cx=w*(2*i+1)/6,bw=w/3*0.62,bh=h*0.34,top=h*0.2;
      g.fillStyle=col(it[2]); g.fillRect(cx-bw/2,top,bw,bh); g.strokeStyle=cl.ink; g.lineWidth=2; g.strokeRect(cx-bw/2,top,bw,bh);
      g.fillStyle=cl.ink; g.textAlign='center'; g.textBaseline='bottom'; g.font='600 12px "Space Grotesk", sans-serif'; g.fillText(it[0],cx,top-18); g.font='11px Inter, sans-serif'; g.fillStyle=cl.mut; g.fillText(it[1],cx,top-4);
      g.textBaseline='top'; g.fillStyle=cl.ink; g.font='600 14px "Space Grotesk", sans-serif'; g.fillText(fmt(it[2],1)+' °C',cx,top+bh+6); });
    var y=h*0.84,x0=w*0.08,x1=w*0.92,X=function(T){return x0+(T/100)*(x1-x0)};
    g.strokeStyle=cl.mut; g.lineWidth=1.5; g.beginPath(); g.moveTo(x0,y); g.lineTo(x1,y); g.stroke(); g.fillStyle=cl.mut; g.font='11px Inter, sans-serif'; g.textBaseline='top';
    for(var T=0;T<=100;T+=20){ g.beginPath(); g.moveTo(X(T),y-4); g.lineTo(X(T),y+4); g.stroke(); g.textAlign='center'; g.fillText(T+' °C',X(T),y+7); }
    [[S.T1,'1',cl.ink],[S.T2,'2',cl.ink],[r.Te,'e',cl.acc]].forEach(function(m,i){ g.fillStyle=m[2]; g.beginPath(); g.arc(X(m[0]),y,6,0,6.2832); g.fill(); g.fillStyle=cl.surf; g.font='600 9px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(m[1],X(m[0]),y+0.5); }); }
  function upd(){ var r=calc();
    res(L.res,[['Temperatura de echilibru Tₑ',fmt(r.Te,1),'°C',true],['Căldura schimbată Q',fmt(r.Q,0),'J'],['C₁ = m₁c₁',fmt(r.C1,0),'J/K'],['C₂ = m₂c₂',fmt(r.C2,0),'J/K']]);
    L.hint.textContent='Căldura cedată de corpul mai cald este egală cu cea primită de corpul mai rece (fără pierderi către mediu). Tₑ e mai aproape de temperatura corpului cu C mai mare.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 6. Carnot ---------- */
labs.carnot=function(el){
  var L=makeLab(el,'Ciclul Carnot pe diagrama p–V');
  var S=controls(L.ctl,'cn',[
    {id:'Th',label:'Temperatura sursei calde',min:400,max:800,step:10,value:600,unit:'K'},
    {id:'Tc',label:'Temperatura sursei reci',min:250,max:350,step:10,value:300,unit:'K'}],function(){upd()});
  var c=canvas(L.vis,'4/3','Ciclul Carnot');
  var GM=5/3,VA=10,VB=20;
  function cyc(){ var Th=S.Th,Tc=S.Tc,r=Math.pow(Th/Tc,1/(GM-1)),VC=VB*r,VD=VA*r;
    var pA=R*Th/VA,pB=R*Th/VB,pC=R*Tc/VC,pD=R*Tc/VD; var pts=[],i,V,n=36;
    for(i=0;i<=n;i++){V=VA+(VB-VA)*i/n;pts.push([V,R*Th/V]);}
    for(i=1;i<=n;i++){V=VB+(VC-VB)*i/n;pts.push([V,pB*Math.pow(VB/V,GM)]);}
    for(i=1;i<=n;i++){V=VC+(VD-VC)*i/n;pts.push([V,R*Tc/V]);}
    for(i=1;i<=n;i++){V=VD+(VA-VD)*i/n;pts.push([V,pD*Math.pow(VD/V,GM)]);}
    return {VC:VC,VD:VD,pA:pA,pB:pB,pC:pC,pD:pD,pts:pts}; }
  function draw(ts){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),Y=cyc();
    var pl=plot(g,w,h,[0,Math.ceil(Y.VC*1.06/10)*10],[0,Math.ceil(Y.pA*1.1/50)*50],{xl:'V (L)',yl:'p (kPa)'});
    var P=Y.pts.map(function(p){return [pl.X(p[0]),pl.Y(p[1])]});
    g.fillStyle=cl.acc; g.globalAlpha=0.14; g.beginPath(); P.forEach(function(p,i){ if(i)g.lineTo(p[0],p[1]); else g.moveTo(p[0],p[1]); }); g.closePath(); g.fill(); g.globalAlpha=1;
    poly(g,P.slice(0,37),cl.pos,3); poly(g,P.slice(36,73),cl.ink,3); poly(g,P.slice(72,109),cl.neg,3); poly(g,P.slice(108),cl.ink,3);
    var lab=[['A',VA,Y.pA,-11,-10],['B',VB,Y.pB,11,-10],['C',Y.VC,Y.pC,11,-10],['D',Y.VD,Y.pD,-11,-10]];
    lab.forEach(function(l){ dotLabel(g,pl.X(l[1]),pl.Y(l[2]),l[0],cl.ink,cl,l[3],l[4]); });
    if(!reduce){ var u=((ts||performance.now())/9000)%1, idx=Math.min(P.length-1,Math.floor(u*P.length)); g.fillStyle=cl.acc; g.beginPath(); g.arc(P[idx][0],P[idx][1],6,0,6.2832); g.fill(); g.strokeStyle=cl.surf; g.lineWidth=2; g.stroke(); } }
  loop(el,function(dt,ts){ if(visible(c))draw(ts); });
  function upd(){ var Th=S.Th,Tc=S.Tc,ln=Math.log(VB/VA),Qp=R*Th*ln,Qc=R*Tc*ln,Lm=Qp-Qc;
    res(L.res,[['Randamentul η = 1 − T rece / T caldă',fmt((1-Tc/Th)*100,1),'%',true],['Căldura primită (A→B)',fmt(Qp,0),'J'],['Căldura cedată (C→D)',fmt(Qc,0),'J'],['Lucrul pe ciclu L',fmt(Lm,0),'J'],['L / Q primit',fmt(Lm/Qp*100,1),'%']]);
    L.hint.textContent='Gaz monoatomic, ν = 1 mol. A→B izotermă la temperatura sursei calde (roșu), B→C adiabată, C→D izotermă la temperatura sursei reci (albastru), D→A adiabată. Aria ciclului este lucrul mecanic L.'; draw(); }
  watch(c,function(){draw()}); upd();
};

/* ---------- 7. Stări de agregare ---------- */
labs.phase=function(el){
  var L=makeLab(el,'Curba de încălzire a apei');
  var S=controls(L.ctl,'ph',[
    {id:'m',label:'Masa m',min:0.1,max:2,step:0.1,value:1,dec:1,unit:'kg'},
    {id:'P',label:'Puterea de încălzire',min:200,max:3000,step:100,value:1500,unit:'W'},
    {id:'T0',label:'Temperatura inițială a gheții',min:-40,max:0,step:5,value:-20,unit:'°C'},
    {id:'u',label:'Cât din proces a trecut',min:0,max:100,step:1,value:35,unit:'%'}],function(){upd()});
  var c=canvas(L.vis,'16/10','Temperatura în funcție de timp la încălzirea apei');
  var ci=2090,lf=334000,cw=4180,lv=2256000,cs=2010;
  function stg(){ var m=S.m,Q1=m*ci*(0-S.T0),Q2=Q1+m*lf,Q3=Q2+m*cw*100,Q4=Q3+m*lv,Q5=Q4+m*cs*20; return [Q1,Q2,Q3,Q4,Q5]; }
  function at(Q){ var s=stg(),m=S.m;
    if(Q<=s[0])return {T:S.T0+Q/(m*ci),ph:'gheață',fr:0};
    if(Q<=s[1])return {T:0,ph:'topire (gheață + apă)',fr:(Q-s[0])/(s[1]-s[0])};
    if(Q<=s[2])return {T:(Q-s[1])/(m*cw),ph:'apă lichidă',fr:0};
    if(Q<=s[3])return {T:100,ph:'fierbere (apă + abur)',fr:(Q-s[2])/(s[3]-s[2])};
    return {T:100+(Q-s[3])/(m*cs),ph:'abur',fr:0}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),s=stg(),tot=s[4]/S.P/60;
    var pl=plot(g,w,h,[0,tot],[Math.min(S.T0,0)-10,130],{xl:'timp (min)',yl:'T (°C)'});
    var pts=[]; for(var i=0;i<=240;i++){ var Q=s[4]*i/240; pts.push([pl.X(Q/S.P/60),pl.Y(at(Q).T)]); }
    poly(g,pts,cl.acc,3.5);
    var Qn=S.u/100*s[4],a=at(Qn); dotLabel(g,pl.X(Qn/S.P/60),pl.Y(a.T),fmt(a.T,0)+' °C',cl.acc,cl,0,-15); }
  function upd(){ var s=stg(),Qn=S.u/100*s[4],a=at(Qn),m=S.m;
    res(L.res,[['Temperatura',fmt(a.T,1),'°C',true],['Starea',a.ph,''],['Căldura primită',fmt(Qn/1000,0),'kJ'],['Timpul scurs',fmt(Qn/S.P/60,1),'min'],
      ['Topit / vaporizat',a.ph.indexOf('topire')===0?fmt(a.fr*100,0)+' % din gheață':a.ph.indexOf('fierbere')===0?fmt(a.fr*100,0)+' % din apă':'—','']]);
    L.hint.textContent='Palierele sunt la 0 °C și 100 °C. Căldura latentă: Q = mλ, cu λ = 334 kJ/kg la topire și 2256 kJ/kg la vaporizare. Pentru încălzire s-au folosit c = 2090 (gheață), 4180 (apă) și 2010 J/(kg·K) (abur).'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 8. Capilaritate ---------- */
labs.cap=function(el){
  var L=makeLab(el,'Ridicarea unui lichid într-un tub capilar');
  var LQ=[['Apă',0.0728,998,0,'#3b82f6'],['Alcool etilic',0.0223,789,0,'#10b981'],['Mercur',0.485,13534,140,'#9ca3af']];
  var S=controls(L.ctl,'cp',[
    {id:'q',label:'Lichidul',options:LQ.map(function(q,i){return [i,q[0]]}),value:0},
    {id:'r',label:'Raza tubului r',min:0.1,max:2,step:0.05,value:0.5,dec:2,unit:'mm'}],function(){upd()});
  var c=canvas(L.vis,'4/3','Tub capilar introdus într-un vas cu lichid');
  function hcm(){ var q=LQ[S.q]; return 100*2*q[1]*Math.cos(q[3]*Math.PI/180)/(q[2]*9.81*S.r*1e-3); }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),q=LQ[S.q],hc=hcm();
    var y0=h*0.66,ppc=h*0.48/18,cx=w/2,bx0=w*0.12,bx1=w*0.88,yb=h*0.94,ytop=h*0.04,tb=h*0.8;
    var yl=y0-hc*ppc; yl=Math.max(ytop+6,Math.min(tb-6,yl));
    var tw=Math.max(5,S.r*2*7); // lățimea interioară în px
    g.fillStyle=q[4]; g.globalAlpha=0.35; g.fillRect(bx0,y0,bx1-bx0,yb-y0); g.globalAlpha=1;
    g.strokeStyle=cl.ink; g.lineWidth=2.5; g.beginPath(); g.moveTo(bx0,y0-18); g.lineTo(bx0,yb); g.lineTo(bx1,yb); g.lineTo(bx1,y0-18); g.stroke();
    g.fillStyle=q[4]; g.globalAlpha=0.55; g.fillRect(cx-tw/2,yl,tw,tb-yl); g.globalAlpha=1;
    // nivel de referință
    g.setLineDash([5,4]); g.strokeStyle=cl.mut; g.lineWidth=1; g.beginPath(); g.moveTo(bx0+4,y0); g.lineTo(bx1-4,y0); g.stroke(); g.setLineDash([]);
    // menisc
    var dep=Math.min(8,tw*0.45)*(q[3]<90?1:-1); g.strokeStyle=cl.ink; g.lineWidth=2; g.beginPath(); g.moveTo(cx-tw/2,yl-dep*0.2); g.quadraticCurveTo(cx,yl+dep,cx+tw/2,yl-dep*0.2); g.stroke();
    // pereții tubului
    g.strokeStyle=cl.ink; g.lineWidth=2.5; g.beginPath(); g.moveTo(cx-tw/2-2,ytop); g.lineTo(cx-tw/2-2,tb); g.moveTo(cx+tw/2+2,ytop); g.lineTo(cx+tw/2+2,tb); g.stroke();
    g.fillStyle=cl.mut; g.font='11px Inter, sans-serif'; g.textAlign='left'; g.textBaseline='bottom'; g.fillText('nivelul din vas',bx0+6,y0-3);
    // cota h
    if(Math.abs(yl-y0)>4){ var xa=cx+tw/2+30; arrow(g,xa,y0,xa,yl,cl.acc,2); arrow(g,xa,yl,xa,y0,cl.acc,2); g.fillStyle=cl.ink; g.font='600 13px "Space Grotesk", sans-serif'; g.textAlign='left'; g.textBaseline='middle'; g.fillText('h',xa+8,(y0+yl)/2); } }
  function upd(){ var q=LQ[S.q],hc=hcm();
    res(L.res,[['Înălțimea h',fmt(hc*10,1),'mm',true],['Efectul',hc>=0?'urcare (udă sticla)':'coborâre (nu udă sticla)',''],['σ',fmt(q[1],4),'N/m'],['Unghi de racordare θ',fmt(q[3],0),'°']]);
    L.hint.textContent='Legea lui Jurin: h = 2σ·cosθ/(ρ·g·r). Micșorează raza și diferența de nivel crește. Mercurul are θ > 90°, deci cosθ < 0 și lichidul coboară. Tubul din desen e cu atât mai lat cu cât r e mai mare, dar nu la scară.'; draw(); }
  watch(c,draw); upd();
};

window.__atlas={labs:labs,helpers:{$:$,$$:$$,fmt:fmt,sci:sci,si:si,sgn:sgn,colors:colors,canvas:canvas,ctx:ctx,watch:watch,plot:plot,poly:poly,arrow:arrow,dotLabel:dotLabel,res:res,controls:controls,showCtl:showCtl,makeLab:makeLab,loop:loop,visible:visible,redraws:redraws,reduce:reduce,
  K:{R:R,NA:NA,QE:QE,K0:K0,EPS0:EPS0,MU0:MU0}}};
})();
