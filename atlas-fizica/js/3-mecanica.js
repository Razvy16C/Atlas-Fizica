(function(){
'use strict';
var A=window.__atlas,H=A.helpers,labs=A.labs;
var $=H.$,fmt=H.fmt,colors=H.colors,canvas=H.canvas,ctx=H.ctx,watch=H.watch,plot=H.plot,poly=H.poly,arrow=H.arrow,dotLabel=H.dotLabel,res=H.res,controls=H.controls,makeLab=H.makeLab,loop=H.loop,visible=H.visible,reduce=H.reduce;
var RAD=Math.PI/180;
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function txt(g,s,x,y,font,color,al,bl){ g.font=font; g.fillStyle=color; g.textAlign=al||'left'; g.textBaseline=bl||'alphabetic'; g.fillText(s,x,y); }

/* ---------- M1: MRU ---------- */
labs.mru=function(el){
  var L=makeLab(el,'Două corpuri în mișcare rectilinie uniformă');
  var S=controls(L.ctl,'mr',[
    {id:'x1',label:'Corpul 1: poziția inițială x₁',min:-20,max:40,step:1,value:0,unit:'m'},
    {id:'v1',label:'Corpul 1: viteza v₁',min:-10,max:10,step:0.5,value:4,dec:1,unit:'m/s'},
    {id:'x2',label:'Corpul 2: poziția inițială x₂',min:-20,max:40,step:1,value:30,unit:'m'},
    {id:'v2',label:'Corpul 2: viteza v₂',min:-10,max:10,step:0.5,value:-2,dec:1,unit:'m/s'},
    {id:'t',label:'Momentul t',min:0,max:10,step:0.1,value:3,dec:1,unit:'s'}],function(){upd()});
  var c=canvas(L.vis,'4/3','Graficul poziției în funcție de timp pentru două corpuri');
  function tm(){ return S.v1===S.v2?null:(S.x2-S.x1)/(S.v1-S.v2); }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c);
    var vals=[S.x1,S.x2,S.x1+10*S.v1,S.x2+10*S.v2],lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals); if(hi-lo<2)hi=lo+2; var pad=(hi-lo)*0.1;
    var pl=plot(g,w,h,[0,10],[lo-pad,hi+pad],{xl:'t (s)',yl:'x (m)'});
    [[S.x1,S.v1,cl.acc,'1'],[S.x2,S.v2,cl.neg,'2']].forEach(function(o){ poly(g,[[pl.X(0),pl.Y(o[0])],[pl.X(10),pl.Y(o[0]+10*o[1])]],o[2],3); });
    var x=pl.X(S.t); g.save(); g.setLineDash([4,4]); g.strokeStyle=cl.mut; g.lineWidth=1; g.beginPath(); g.moveTo(x,pl.box.t); g.lineTo(x,pl.box.b); g.stroke(); g.restore();
    dotLabel(g,x,pl.Y(S.x1+S.v1*S.t),'1',cl.acc,cl,-11,-9); dotLabel(g,x,pl.Y(S.x2+S.v2*S.t),'2',cl.neg,cl,11,-9);
    var t0=tm(); if(t0!==null&&t0>=0&&t0<=10){ dotLabel(g,pl.X(t0),pl.Y(S.x1+S.v1*t0),'întâlnire',cl.ink,cl,0,-15); } }
  function upd(){ var t0=tm(),x1=S.x1+S.v1*S.t,x2=S.x2+S.v2*S.t,meet='nu se întâlnesc';
    if(t0!==null&&t0>=0)meet='la t = '+fmt(t0,2)+' s, x = '+fmt(S.x1+S.v1*t0,1)+' m'; else if(t0===null&&S.x1===S.x2)meet='coincid mereu';
    res(L.res,[['Poziția x₁(t)',fmt(x1,1),'m'],['Poziția x₂(t)',fmt(x2,1),'m'],['Distanța dintre ele',fmt(Math.abs(x2-x1),1),'m'],['Întâlnirea',meet,'',true]]);
    L.hint.textContent='Panta fiecărei drepte este viteza corpului. Dreptele care coboară au viteză negativă. Corpurile se întâlnesc unde dreptele se intersectează.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- M2: MRUV ---------- */
labs.mruv=function(el){
  var L=makeLab(el,'Viteza și poziția într-o mișcare cu accelerație constantă');
  var S=controls(L.ctl,'mv',[
    {id:'v0',label:'Viteza inițială v₀',min:-20,max:20,step:1,value:0,unit:'m/s'},
    {id:'a',label:'Accelerația a',min:-10,max:10,step:0.5,value:2,dec:1,unit:'m/s²'},
    {id:'t',label:'Momentul t',min:0,max:10,step:0.1,value:5,dec:1,unit:'s'}],function(){upd()});
  var c1=canvas(L.vis,'16/9','Graficul vitezei în funcție de timp'),c2=canvas(L.vis,'16/9','Graficul poziției în funcție de timp');
  function v(t){return S.v0+S.a*t} function x(t){return S.v0*t+S.a*t*t/2}
  function rng(f){ var a=f(0),b=f(10),lo=Math.min(a,b,0),hi=Math.max(a,b,0),tp=S.a!==0?-S.v0/S.a:-1; if(tp>0&&tp<10){ var q=f(tp); lo=Math.min(lo,q); hi=Math.max(hi,q); } if(hi-lo<1)hi=lo+1; var p=(hi-lo)*0.1; return [lo-p,hi+p]; }
  function mk(cv,f,yl,col){ var k=ctx(cv); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(cv),pl=plot(g,w,h,[0,10],rng(f),{xl:'t (s)',yl:yl}); var pts=[]; for(var i=0;i<=100;i++){var t=i/10; pts.push([pl.X(t),pl.Y(f(t))]);}
    g.save(); g.strokeStyle=cl.mut; g.lineWidth=1; g.beginPath(); g.moveTo(pl.box.l,pl.Y(0)); g.lineTo(pl.box.r,pl.Y(0)); g.stroke(); g.restore();
    poly(g,pts,cl[col],3); var xx=pl.X(S.t); g.save(); g.setLineDash([4,4]); g.strokeStyle=cl.mut; g.beginPath(); g.moveTo(xx,pl.box.t); g.lineTo(xx,pl.box.b); g.stroke(); g.restore();
    dotLabel(g,xx,pl.Y(f(S.t)),fmt(f(S.t),1),cl[col],cl,0,-15); }
  function d1(){ mk(c1,v,'v (m/s)','acc'); } function d2(){ mk(c2,x,'x (m)','neg'); }
  function upd(){ var t=S.t,tp=S.a!==0?-S.v0/S.a:-1,path=Math.abs(x(t));
    if(tp>0&&tp<t)path=Math.abs(x(tp))+Math.abs(x(t)-x(tp));
    res(L.res,[['Viteza v = v₀ + at',fmt(v(t),2),'m/s',true],['Poziția x (deplasarea)',fmt(x(t),2),'m',true],['Spațiul parcurs',fmt(path,2),'m'],['Verificare v² − v₀² = 2ax',fmt(v(t)*v(t)-S.v0*S.v0,1)+' = '+fmt(2*S.a*x(t),1),'']]);
    L.hint.textContent=(tp>0&&tp<t)?'Corpul s-a oprit la t = '+fmt(tp,2)+' s și apoi s-a întors. De aceea spațiul parcurs e mai mare decât deplasarea.':'Panta graficului v(t) este accelerația. Aria de sub el este deplasarea.'; d1(); d2(); }
  watch(c1,d1); watch(c2,d2); upd();
};

/* ---------- M3: Aruncarea oblică ---------- */
labs.proj=function(el){
  var L=makeLab(el,'Aruncarea oblică');
  var S=controls(L.ctl,'pr',[
    {id:'v0',label:'Viteza inițială v₀',min:5,max:50,step:1,value:25,unit:'m/s'},
    {id:'a',label:'Unghiul de lansare α',min:0,max:90,step:1,value:45,unit:'°'},
    {id:'h',label:'Înălțimea de lansare h₀',min:0,max:50,step:1,value:0,unit:'m'},
    {id:'g',label:'Locul',options:[[9.81,'Pământ (g = 9,81 m/s²)'],[3.71,'Marte (g = 3,71 m/s²)'],[1.62,'Lună (g = 1,62 m/s²)']],value:9.81}],function(){tau=0;upd()});
  var c=canvas(L.vis,'16/9','Traiectoria unui corp aruncat oblic'),tau=0;
  function calc(){ var vx=S.v0*Math.cos(S.a*RAD),vy=S.v0*Math.sin(S.a*RAD),T=(vy+Math.sqrt(vy*vy+2*S.g*S.h))/S.g; return {vx:vx,vy:vy,T:T,R:vx*T,Hm:S.h+vy*vy/(2*S.g)}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),q=calc(),bw=w-60,bh=h-58;
    var Rr=Math.max(q.R*1.08,q.Hm*1.15*bw/bh,5),pl=plot(g,w,h,[0,Rr],[0,Rr*bh/bw],{xl:'x (m)',yl:'y (m)',nx:6,ny:4});
    var pts=[]; for(var i=0;i<=80;i++){ var t=q.T*i/80; pts.push([pl.X(q.vx*t),pl.Y(S.h+q.vy*t-S.g*t*t/2)]); } poly(g,pts,cl.mut,1.8,[5,4]);
    var t=reduce?q.T*0.5:Math.min(tau,q.T),px=q.vx*t,py=Math.max(0,S.h+q.vy*t-S.g*t*t/2),X=pl.X(px),Y=pl.Y(py);
    var vyn=q.vy-S.g*t,sc=2.2; arrow(g,X,Y,X+q.vx*sc,Y,cl.neg,2); if(Math.abs(vyn)>0.5)arrow(g,X,Y,X,Y-vyn*sc,cl.pos,2);
    g.fillStyle=cl.acc; g.beginPath(); g.arc(X,Y,7,0,6.2832); g.fill(); g.strokeStyle=cl.surf; g.lineWidth=2; g.stroke();
    txt(g,'v = '+fmt(Math.sqrt(q.vx*q.vx+vyn*vyn),1)+' m/s',pl.box.r-4,pl.box.t+14,'600 12px "Space Grotesk", sans-serif',cl.ink,'right'); txt(g,'t = '+fmt(t,2)+' s',pl.box.r-4,pl.box.t+30,'12px Inter, sans-serif',cl.mut,'right'); }
  loop(el,function(dt){ if(!visible(c))return; var q=calc(); tau+=dt; if(tau>q.T+0.8)tau=0; draw(); });
  function upd(){ var q=calc();
    res(L.res,[['Bătaia d',fmt(q.R,1),'m',true],['Înălțimea maximă',fmt(q.Hm,1),'m',true],['Timpul de zbor',fmt(q.T,2),'s'],['Componenta vₓ (constantă)',fmt(q.vx,1),'m/s'],['Viteza la sol',fmt(Math.sqrt(q.vx*q.vx+Math.pow(q.vy-S.g*q.T,2)),1),'m/s']]);
    L.hint.textContent='Săgeata albastră e viteza orizontală, care nu se schimbă. Cea roșie e viteza verticală, care scade, se anulează în vârf și apoi crește în jos. Încearcă 45°, apoi 30° și 60°.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- M4: Dinamică ---------- */
labs.dyn=function(el){
  var L=makeLab(el,'Un corp tras pe o suprafață orizontală');
  var S=controls(L.ctl,'dy',[
    {id:'m',label:'Masa m',min:1,max:20,step:1,value:5,unit:'kg'},
    {id:'F',label:'Forța de tragere F',min:0,max:100,step:1,value:30,unit:'N'},
    {id:'mu',label:'Coeficientul de frecare μ',min:0,max:0.8,step:0.05,value:0.2,dec:2}],function(){st.v=0;st.x=0;st.tau=0;upd()});
  var c=canvas(L.vis,'16/8','Corp tras pe o suprafață cu frecare'),st={v:0,x:0,tau:0};
  function calc(){ var G=S.m*9.81,Fmax=S.mu*G,mv=S.F>Fmax,a=mv?(S.F-Fmax)/S.m:0,Ff=mv?Fmax:S.F; return {G:G,Fmax:Fmax,mv:mv,a:a,Ff:Ff}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),q=calc(),gy=h*0.72,bw=60+S.m*2.2,bh=44+S.m*1.2,cx=w*0.45;
    g.strokeStyle=cl.ink; g.lineWidth=2.5; g.beginPath(); g.moveTo(0,gy); g.lineTo(w,gy); g.stroke();
    g.strokeStyle=cl.mut; g.lineWidth=1.5; var off=(st.x*40)%40; for(var x=-off;x<w;x+=40){ g.beginPath(); g.moveTo(x,gy); g.lineTo(x-10,gy+12); g.stroke(); }
    g.fillStyle=cl.acc; g.fillRect(cx-bw/2,gy-bh,bw,bh); g.strokeStyle=cl.ink; g.lineWidth=2; g.strokeRect(cx-bw/2,gy-bh,bw,bh);
    txt(g,S.m+' kg',cx,gy-bh/2+4,'600 13px "Space Grotesk", sans-serif',cl.surf,'center');
    var s=1.0,my=gy-bh/2;
    if(S.F>0)arrow(g,cx+bw/2,my,cx+bw/2+Math.max(14,S.F*s*1.3),my,cl.ink,3.5);
    if(q.Ff>0)arrow(g,cx-bw/2,my+16,cx-bw/2-Math.max(14,q.Ff*s*1.3),my+16,cl.neg,3.5);
    arrow(g,cx,gy-bh,cx,gy-bh-Math.max(14,q.G*0.5),cl.mut,2); arrow(g,cx+bw*0.2,gy,cx+bw*0.2,gy+Math.max(14,q.G*0.45),cl.mut,2);
    txt(g,'F',cx+bw/2+Math.max(14,S.F*1.3)+8,my+4,'italic 15px "STIX Two Text", serif',cl.ink); txt(g,'Ff',cx-bw/2-Math.max(14,q.Ff*1.3)-8,my+20,'italic 15px "STIX Two Text", serif',cl.neg,'right');
    txt(g,'v = '+fmt(st.v,1)+' m/s',12,22,'600 13px "Space Grotesk", sans-serif',cl.ink); }
  loop(el,function(dt){ if(!visible(c))return; var q=calc(); st.tau+=dt; if(st.tau>4){st.tau=0;st.v=0;st.x=0;} st.v+=q.a*dt; st.x+=st.v*dt*0.35; draw(); });
  function upd(){ var q=calc();
    res(L.res,[['Greutatea G = mg',fmt(q.G,1),'N'],['Frecarea maximă μmg',fmt(q.Fmax,1),'N'],['Frecarea acum',fmt(q.Ff,1),'N'],['Accelerația a',fmt(q.a,2),'m/s²',true],['Starea',q.mv?'se mișcă accelerat':'rămâne în repaus','']]);
    L.hint.textContent=q.mv?'Forța rezultantă este F − μmg, iar a = (F − μmg)/m. Animația se reia la fiecare 4 secunde.':'F nu depășește frecarea maximă, deci frecarea statică o echilibrează exact și corpul stă pe loc (principiul I).'; draw(); }
  watch(c,draw); upd();
};

/* ---------- M5: Plan înclinat ---------- */
labs.incl=function(el){
  var L=makeLab(el,'Corp pe un plan înclinat');
  var S=controls(L.ctl,'in',[
    {id:'a',label:'Unghiul planului α',min:5,max:60,step:1,value:30,unit:'°'},
    {id:'mu',label:'Coeficientul de frecare μ',min:0,max:1,step:0.05,value:0.2,dec:2},
    {id:'m',label:'Masa m',min:1,max:20,step:1,value:4,unit:'kg'}],function(){st.tau=0;upd()});
  var c=canvas(L.vis,'16/10','Planul înclinat cu forțele care acționează pe corp'),st={tau:0};
  function calc(){ var al=S.a*RAD,G=S.m*9.81,N=G*Math.cos(al),Gt=G*Math.sin(al),Fm=S.mu*N,sl=Gt>Fm; return {G:G,N:N,Gt:Gt,Ff:sl?Fm:Gt,sl:sl,a:sl?9.81*(Math.sin(al)-S.mu*Math.cos(al)):0}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),q=calc(),al=S.a*RAD,ca=Math.cos(al),sa=Math.sin(al);
    var Lp=Math.min(w*0.68/ca,h*0.62/sa),ext=Lp*ca,ht=Lp*sa,x0=(w-ext)/2,yb=h*0.88,C=[x0+ext,yb-ht],A=[x0,yb];
    g.fillStyle=cl.surf2; g.strokeStyle=cl.ink; g.lineWidth=2.5; g.beginPath(); g.moveTo(A[0],A[1]); g.lineTo(C[0],yb); g.lineTo(C[0],C[1]); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle=cl.mut; g.lineWidth=1.5; g.beginPath(); g.arc(A[0],A[1],38,-al,0); g.stroke(); txt(g,'α',A[0]+46,A[1]-6,'italic 15px "STIX Two Text", serif',cl.mut);
    var bs=26,sMax=Lp-bs*1.6,sp=reduce?Lp*0.25:Math.min(sMax,Lp*0.08+(q.sl?0.5*q.a*(Lp/15.3)*st.tau*st.tau:0));
    var d=[-ca,sa],u=[ca,-sa],n=[-sa,-ca],P=[C[0]+d[0]*(sp+bs/2),C[1]+d[1]*(sp+bs/2)],ctr=[P[0]+n[0]*bs/2,P[1]+n[1]*bs/2];
    g.save(); g.translate(ctr[0],ctr[1]); g.rotate(-al); g.fillStyle=cl.acc; g.fillRect(-bs/2,-bs/2,bs,bs); g.strokeStyle=cl.ink; g.lineWidth=2; g.strokeRect(-bs/2,-bs/2,bs,bs); g.restore();
    var f=Math.min(1.2,70/Math.max(q.G,1)*1.3);
    function vec(dx,dy,len,col,lab){ arrow(g,ctr[0],ctr[1],ctr[0]+dx*len,ctr[1]+dy*len,col,2.5); txt(g,lab,ctr[0]+dx*len+dx*10,ctr[1]+dy*len+dy*10+4,'italic 14px "STIX Two Text", serif',col,'center'); }
    vec(0,1,q.G*f*0.9,cl.ink,'G'); vec(n[0],n[1],q.N*f*0.9,cl.pos,'N'); if(q.Ff>0.5)vec(u[0],u[1],q.Ff*f*0.9,cl.neg,'Ff'); }
  loop(el,function(dt){ if(!visible(c))return; var q=calc(); st.tau+=dt; if(st.tau>(q.sl?4:1))st.tau=0; draw(); });
  function upd(){ var q=calc();
    res(L.res,[['Componenta pe plan Gₜ = mg sinα',fmt(q.Gt,1),'N'],['Reacțiunea N = mg cosα',fmt(q.N,1),'N'],['Frecarea acum',fmt(q.Ff,1),'N'],['Accelerația a',fmt(q.a,2),'m/s²',true],['tg α față de μ',fmt(Math.tan(S.a*RAD),2)+(q.sl?' > ':' ≤ ')+fmt(S.mu,2),'']]);
    L.hint.textContent=q.sl?'tg α > μ, deci corpul alunecă. Animația repetă coborârea.':'tg α ≤ μ: frecarea echilibrează componenta Gₜ și corpul rămâne în repaus. Mărește unghiul sau micșorează μ ca să pornească.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- M6: Lucru mecanic ---------- */
labs.work=function(el){
  var L=makeLab(el,'Lucrul mecanic și puterea');
  var S=controls(L.ctl,'wk',[
    {id:'F',label:'Forța F',min:1,max:200,step:1,value:60,unit:'N'},
    {id:'a',label:'Unghiul α dintre F și deplasare',min:0,max:180,step:5,value:30,unit:'°'},
    {id:'d',label:'Deplasarea d',min:1,max:50,step:1,value:12,unit:'m'},
    {id:'t',label:'Durata t',min:1,max:60,step:1,value:8,unit:'s'},
    {id:'e',label:'Randamentul η',min:10,max:100,step:5,value:70,unit:'%'}],function(){upd()});
  var c=canvas(L.vis,'16/9','Forța pe direcția deplasării în funcție de distanță');
  function Fc(){return S.F*Math.cos(S.a*RAD)}
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),f=Fc(),lo=Math.min(0,f,-S.F*0.1),hi=Math.max(S.F*1.1,1);
    var pl=plot(g,w,h,[0,S.d],[lo,hi],{xl:'d (m)',yl:'F·cosα (N)'});
    g.fillStyle=f>=0?cl.acc:cl.neg; g.globalAlpha=0.25; g.fillRect(pl.X(0),Math.min(pl.Y(0),pl.Y(f)),pl.X(S.d)-pl.X(0),Math.abs(pl.Y(f)-pl.Y(0))); g.globalAlpha=1;
    g.save(); g.setLineDash([5,4]); g.strokeStyle=cl.mut; g.lineWidth=1.2; g.beginPath(); g.moveTo(pl.X(0),pl.Y(S.F)); g.lineTo(pl.X(S.d),pl.Y(S.F)); g.stroke(); g.restore(); txt(g,'F = '+S.F+' N',pl.X(S.d)-4,pl.Y(S.F)-5,'11px Inter, sans-serif',cl.mut,'right');
    poly(g,[[pl.X(0),pl.Y(f)],[pl.X(S.d),pl.Y(f)]],f>=0?cl.acc:cl.neg,3.5); txt(g,'aria = L = '+fmt(f*S.d,0)+' J',pl.X(S.d/2),Math.min(pl.box.b-8,Math.max(pl.box.t+16,(pl.Y(0)+pl.Y(f))/2+5)),'600 13px "Space Grotesk", sans-serif',cl.ink,'center'); }
  function upd(){ var Lm=Fc()*S.d,P=Lm/S.t,eta=S.e/100;
    res(L.res,[['Lucrul L = Fd cosα',fmt(Lm,1),'J',true],['Puterea P = L/t',fmt(P,1),'W',true],['Lucrul consumat L/η',fmt(Lm/eta,1),'J'],['Pierderile',fmt(Lm/eta-Lm,1),'J'],['Puterea în CP',fmt(P/736,3),'CP']]);
    L.hint.textContent=S.a===90?'La α = 90° forța e perpendiculară pe deplasare și lucrul este zero.':S.a>90?'La α > 90° forța se opune deplasării, deci lucrul este negativ.':'Doar componenta F·cosα, pe direcția deplasării, efectuează lucru.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- M7: Energie (pendul) ---------- */
labs.energy=function(el){
  var L=makeLab(el,'Pendulul și conservarea energiei');
  var S=controls(L.ctl,'en',[
    {id:'l',label:'Lungimea firului l',min:0.5,max:3,step:0.1,value:1.5,dec:1,unit:'m'},
    {id:'th',label:'Unghiul inițial θ₀',min:5,max:80,step:1,value:50,unit:'°'},
    {id:'m',label:'Masa m',min:0.1,max:5,step:0.1,value:1,dec:1,unit:'kg'},
    {id:'f',label:'Frecarea cu aerul',min:0,max:0.5,step:0.02,value:0,dec:2}],function(){reset();upd()});
  var c=canvas(L.vis,'16/9','Pendul cu bare pentru energia cinetică, potențială și totală'),st={th:0,w:0};
  function reset(){ st.th=S.th*RAD; st.w=0; }
  function E(){ var l=S.l,Ep=S.m*9.81*l*(1-Math.cos(st.th)),v=l*st.w,Ec=S.m*v*v/2; return {Ep:Ep,Ec:Ec,Em:Ep+Ec}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),e=E(),e0=Math.max(S.m*9.81*S.l*(1-Math.cos(S.th*RAD)),1e-6),px=w*0.27,py=h*0.1,Lp=h*0.2+h*0.46*(S.l/3);
    g.strokeStyle=cl.line; g.lineWidth=1.5; g.setLineDash([4,4]); g.beginPath(); g.arc(px,py,Lp,0.1,Math.PI-0.1); g.stroke(); g.setLineDash([]);
    g.strokeStyle=cl.mut; g.beginPath(); g.moveTo(px,py); g.lineTo(px,py+Lp+10); g.stroke();
    var bx=px+Math.sin(st.th)*Lp,by=py+Math.cos(st.th)*Lp,r=8+3*Math.sqrt(S.m);
    g.fillStyle=cl.ink; g.fillRect(px-26,py-6,52,6); g.strokeStyle=cl.ink; g.lineWidth=2; g.beginPath(); g.moveTo(px,py); g.lineTo(bx,by); g.stroke();
    g.fillStyle=cl.acc; g.beginPath(); g.arc(bx,by,r,0,6.2832); g.fill(); g.strokeStyle=cl.ink; g.stroke();
    var X0=w*0.58,BW=w*0.37,bh=Math.min(26,h*0.12),y0=h*0.2;
    [['Ep',e.Ep,cl.pos],['Ec',e.Ec,cl.neg],['E = Ec + Ep',e.Em,cl.ink]].forEach(function(b,i){ var y=y0+i*(bh+h*0.14);
      txt(g,b[0],X0,y-6,'600 12px "Space Grotesk", sans-serif',cl.ink); g.fillStyle=cl.surf2; g.fillRect(X0,y,BW,bh); g.strokeStyle=cl.line; g.lineWidth=1; g.strokeRect(X0,y,BW,bh);
      g.fillStyle=b[2]; g.fillRect(X0,y,BW*clamp(b[1]/e0,0,1),bh); txt(g,fmt(b[1],1)+' J',X0+BW,y-6,'12px Inter, sans-serif',cl.mut,'right'); });
    txt(g,'Barele sunt raportate la energia inițială ('+fmt(e0,1)+' J).',X0,h-10,'11px Inter, sans-serif',cl.mut); }
  loop(el,function(dt){ if(!visible(c))return; var n=Math.max(1,Math.round(dt/0.004)),h=dt/n; for(var i=0;i<n;i++){ var a=-(9.81/S.l)*Math.sin(st.th)-S.f*st.w; st.w+=a*h; st.th+=st.w*h; } draw(); });
  function upd(){ var l=S.l,v=Math.sqrt(2*9.81*l*(1-Math.cos(S.th*RAD))),E0=S.m*9.81*l*(1-Math.cos(S.th*RAD)),T=2*Math.PI*Math.sqrt(l/9.81);
    res(L.res,[['Energia totală inițială',fmt(E0,2),'J',true],['Viteza maximă (jos)',fmt(v,2),'m/s'],['Înălțimea inițială',fmt(l*(1-Math.cos(S.th*RAD)),2),'m'],['Perioada (θ mici)',fmt(T,2),'s']]);
    L.hint.textContent=S.f===0?'Fără frecare, Ec + Ep rămâne constantă. Ep atinge maximul la capete, iar Ec în punctul cel mai de jos.':'Cu frecare, energia totală scade în timp: se transformă în căldură, iar oscilațiile se sting.'; draw(); }
  reset(); watch(c,draw); upd();
};

/* ---------- M8: Ciocniri ---------- */
labs.coll=function(el){
  var L=makeLab(el,'Ciocnirea frontală a două cărucioare');
  var S=controls(L.ctl,'co2',[
    {id:'m1',label:'Masa m₁',min:1,max:10,step:1,value:2,unit:'kg'},
    {id:'v1',label:'Viteza v₁',min:-5,max:10,step:0.5,value:4,dec:1,unit:'m/s'},
    {id:'m2',label:'Masa m₂',min:1,max:10,step:1,value:2,unit:'kg'},
    {id:'v2',label:'Viteza v₂',min:-5,max:10,step:0.5,value:0,dec:1,unit:'m/s'},
    {id:'e',label:'Coeficientul de restituție e',min:0,max:1,step:0.05,value:1,dec:2}],function(){tau=0;upd()});
  var c=canvas(L.vis,'16/6','Două cărucioare care se ciocnesc'),tau=0;
  function calc(){ var M=S.m1+S.m2,u1=(S.m1*S.v1+S.m2*S.v2-S.m2*S.e*(S.v1-S.v2))/M,u2=(S.m1*S.v1+S.m2*S.v2+S.m1*S.e*(S.v1-S.v2))/M,w1=0.5+0.1*S.m1,w2=0.5+0.1*S.m2,xa=2,xb=7,gap=(xb-xa)-(w1+w2)/2,hit=S.v1>S.v2,tc=hit?gap/(S.v1-S.v2):Infinity; return {u1:u1,u2:u2,w1:w1,w2:w2,xa:xa,xb:xb,tc:tc,hit:hit}; }
  function pos(q,t){ var a,b; if(t<q.tc){a=q.xa+S.v1*t;b=q.xb+S.v2*t;} else { var xc1=q.xa+S.v1*q.tc,xc2=q.xb+S.v2*q.tc,dt=t-q.tc; a=xc1+q.u1*dt; b=xc2+q.u2*dt; } return [a,b]; }
  function tend(q){ for(var t=0;t<8;t+=0.02){ var p=pos(q,t); if(p[0]<0.4||p[1]>9.6||p[0]>9.6||p[1]<0.4)return Math.max(t,0.6); } return 8; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),q=calc(),T=tend(q),t=reduce?0:Math.min(tau,T),p=pos(q,t),sc=w/10,gy=h*0.74;
    g.strokeStyle=cl.ink; g.lineWidth=2.5; g.beginPath(); g.moveTo(0,gy); g.lineTo(w,gy); g.stroke();
    var after=t>=q.tc,v=[after?q.u1:S.v1,after?q.u2:S.v2];
    [[p[0],q.w1,S.m1,cl.acc,v[0]],[p[1],q.w2,S.m2,cl.neg,v[1]]].forEach(function(b,i){ var bw=b[1]*sc,bh=34+b[2]*2.5,x=b[0]*sc-bw/2;
      g.fillStyle=b[3]; g.fillRect(x,gy-bh-8,bw,bh); g.strokeStyle=cl.ink; g.lineWidth=2; g.strokeRect(x,gy-bh-8,bw,bh);
      g.fillStyle=cl.surf; g.beginPath(); g.arc(x+bw*0.25,gy-4,5,0,6.2832); g.arc(x+bw*0.75,gy-4,5,0,6.2832); g.fill(); g.stroke();
      txt(g,b[2]+' kg',b[0]*sc,gy-bh/2-4,'600 12px "Space Grotesk", sans-serif',cl.surf,'center');
      if(Math.abs(b[4])>0.05){ var ay=gy-bh-24; arrow(g,b[0]*sc,ay,b[0]*sc+b[4]*14,ay,cl.ink,2.5); txt(g,fmt(b[4],1)+' m/s',b[0]*sc+b[4]*7,ay-6,'11px Inter, sans-serif',cl.ink,'center'); } }); }
  loop(el,function(dt){ if(!visible(c))return; var q=calc(),T=tend(q); tau+=dt; if(tau>T+0.8)tau=0; draw(); });
  function upd(){ var q=calc(),pb=S.m1*S.v1+S.m2*S.v2,pa=S.m1*q.u1+S.m2*q.u2,eb=0.5*S.m1*S.v1*S.v1+0.5*S.m2*S.v2*S.v2,ea=0.5*S.m1*q.u1*q.u1+0.5*S.m2*q.u2*q.u2;
    res(L.res,[['Vitezele după: v₁′ ; v₂′',fmt(q.u1,2)+' ; '+fmt(q.u2,2),'m/s',true],['Impulsul înainte',fmt(pb,2),'kg·m/s'],['Impulsul după',fmt(pa,2),'kg·m/s'],['Ec înainte',fmt(eb,2),'J'],['Ec după',fmt(ea,2),'J'],['Pierdută sub formă de căldură',fmt(eb-ea,2),'J']]);
    L.hint.textContent=q.hit?(S.e===1?'Ciocnire elastică: și impulsul, și energia cinetică se conservă.':S.e===0?'Ciocnire perfect plastică: cărucioarele merg împreună, iar o parte din energie se pierde.':'Ciocnire parțial elastică: impulsul se conservă, energia cinetică scade.'):'Cărucioarele nu se ciocnesc, fiindcă v₁ nu depășește v₂. Mărește v₁ sau micșorează v₂.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- M9: Pârghie ---------- */
labs.lever=function(el){
  var L=makeLab(el,'Balansoarul și momentul forței');
  var S=controls(L.ctl,'lv',[
    {id:'m1',label:'Masa din stânga m₁',min:1,max:50,step:1,value:30,unit:'kg'},
    {id:'d1',label:'Brațul din stânga d₁',min:0.2,max:2,step:0.1,value:1.5,dec:1,unit:'m'},
    {id:'m2',label:'Masa din dreapta m₂',min:1,max:50,step:1,value:45,unit:'kg'},
    {id:'d2',label:'Brațul din dreapta d₂',min:0.2,max:2,step:0.1,value:1,dec:1,unit:'m'}],function(){upd()});
  var c=canvas(L.vis,'16/9','Balansoar cu două mase'),ang=0;
  function M(){ var a=S.m1*9.81*S.d1,b=S.m2*9.81*S.d2; return {a:a,b:b,tgt:Math.abs(a-b)<1e-6?0:clamp((b-a)/Math.max(a,b)*14,-14,14)}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),px=w/2,py=h*0.68,half=w*0.42,sc=half/2.2;
    g.fillStyle=cl.mut; g.beginPath(); g.moveTo(px,py); g.lineTo(px-26,h*0.94); g.lineTo(px+26,h*0.94); g.closePath(); g.fill(); g.strokeStyle=cl.ink; g.lineWidth=2; g.stroke();
    g.save(); g.translate(px,py); g.rotate(ang*RAD); g.fillStyle=cl.ink; g.fillRect(-half,-7,2*half,7);
    for(var i=-2;i<=2;i++){ g.fillStyle=cl.surf; g.fillRect(i*sc-1,-6,2,5); }
    [[-S.d1,S.m1,cl.acc],[S.d2,S.m2,cl.neg]].forEach(function(b){ var s=16+Math.cbrt(b[1])*7; g.fillStyle=b[2]; g.fillRect(b[0]*sc-s/2,-7-s,s,s); g.strokeStyle=cl.ink; g.lineWidth=2; g.strokeRect(b[0]*sc-s/2,-7-s,s,s); txt(g,b[1]+' kg',b[0]*sc,-7-s/2+4,'600 11px "Space Grotesk", sans-serif',cl.surf,'center'); });
    g.restore();
    g.fillStyle=cl.ink; g.beginPath(); g.arc(px,py,5,0,6.2832); g.fill();
    var m=M(); txt(g,'M₁ = '+fmt(m.a,0)+' N·m',px-half,h*0.1,'600 13px "Space Grotesk", sans-serif',cl.acc); txt(g,'M₂ = '+fmt(m.b,0)+' N·m',px+half,h*0.1,'600 13px "Space Grotesk", sans-serif',cl.neg,'right'); }
  loop(el,function(dt){ if(!visible(c))return; ang+=(M().tgt-ang)*Math.min(1,dt*4); draw(); });
  function upd(){ var m=M(),bal=Math.abs(m.a-m.b)<1e-6,side=m.b>m.a?'dreapta':'stânga';
    if(reduce)ang=m.tgt;
    res(L.res,[['Momentul din stânga M₁ = m₁gd₁',fmt(m.a,1),'N·m'],['Momentul din dreapta M₂ = m₂gd₂',fmt(m.b,1),'N·m'],['Starea',bal?'în echilibru':'se înclină spre '+side,'',true],['Brațul d₂ pentru echilibru',fmt(S.m1*S.d1/S.m2,2),'m']]);
    L.hint.textContent='Echilibrul cere M₁ = M₂, adică m₁d₁ = m₂d₂. Greutatea mai mică poate echilibra una mare dacă e așezată mai departe de pivot. Brațul d₂ de echilibru poate depăși 2 m.'; draw(); }
  watch(c,draw); upd();
};
})();
