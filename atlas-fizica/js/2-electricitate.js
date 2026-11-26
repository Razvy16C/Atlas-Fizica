(function(){
'use strict';
var A=window.__atlas,H=A.helpers,labs=A.labs;
var $=H.$,fmt=H.fmt,sci=H.sci,si=H.si,colors=H.colors,canvas=H.canvas,ctx=H.ctx,watch=H.watch,plot=H.plot,poly=H.poly,arrow=H.arrow,dotLabel=H.dotLabel,res=H.res,controls=H.controls,showCtl=H.showCtl,makeLab=H.makeLab,loop=H.loop,visible=H.visible,reduce=H.reduce;
var QE=H.K.QE,K0=H.K.K0,EPS0=H.K.EPS0,MU0=H.K.MU0;

/* ---------- 9. Coulomb ---------- */
labs.coul=function(el){
  var L=makeLab(el,'Forța dintre două sarcini punctiforme');
  var S=controls(L.ctl,'cl',[
    {id:'q1',label:'Sarcina q₁',min:-10,max:10,step:0.5,value:4,dec:1,unit:'μC'},
    {id:'q2',label:'Sarcina q₂',min:-10,max:10,step:0.5,value:-3,dec:1,unit:'μC'},
    {id:'r',label:'Distanța r',min:2,max:30,step:1,value:10,unit:'cm'},
    {id:'e',label:'Mediul',options:[[1,'vid sau aer (εr = 1)'],[2.2,'ulei (εr ≈ 2,2)'],[80,'apă (εr ≈ 80)']],value:1}],function(){upd()});
  var c=canvas(L.vis,'16/7','Două sarcini electrice și forțele dintre ele');
  function F(){ return K0*Math.abs(S.q1*S.q2)*1e-12/(S.e*Math.pow(S.r/100,2)); }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),f=F();
    var sep=0.12*w+S.r/30*0.62*w,x1=w/2-sep/2,x2=w/2+sep/2,cy=h*0.45;
    var rad=function(q){return 10+3*Math.sqrt(Math.abs(q))};
    [[x1,S.q1],[x2,S.q2]].forEach(function(p){ var col=p[1]>=0?cl.pos:cl.neg; g.fillStyle=col; g.beginPath(); g.arc(p[0],cy,rad(p[1]),0,6.2832); g.fill();
      g.fillStyle='#fff'; g.font='700 14px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(p[1]===0?'0':(p[1]>0?'+':'−'),p[0],cy+0.5);
      g.fillStyle=cl.ink; g.font='600 12px "Space Grotesk", sans-serif'; g.textBaseline='top'; g.fillText(fmt(p[1],1)+' μC',p[0],cy+rad(p[1])+6); });
    if(f>0&&S.q1!==0&&S.q2!==0){ var len=Math.min(95,16+26*Math.log10(1+f)),att=S.q1*S.q2<0,r1=rad(S.q1),r2=rad(S.q2);
      if(att){ arrow(g,x1+r1+3,cy,x1+r1+3+len,cy,cl.acc,3); arrow(g,x2-r2-3,cy,x2-r2-3-len,cy,cl.acc,3); }
      else { arrow(g,x1-r1-3,cy,x1-r1-3-len,cy,cl.acc,3); arrow(g,x2+r2+3,cy,x2+r2+3+len,cy,cl.acc,3); } }
    var yd=h*0.86; g.strokeStyle=cl.mut; g.lineWidth=1.5; g.beginPath(); g.moveTo(x1,yd); g.lineTo(x2,yd); g.moveTo(x1,yd-5); g.lineTo(x1,yd+5); g.moveTo(x2,yd-5); g.lineTo(x2,yd+5); g.stroke();
    g.fillStyle=cl.ink; g.font='12px Inter, sans-serif'; g.textAlign='center'; g.textBaseline='bottom'; g.fillText('r = '+fmt(S.r,0)+' cm',w/2,yd-4); }
  function upd(){ var f=F(),kind=S.q1===0||S.q2===0?'fără interacțiune':(S.q1*S.q2<0?'atracție':'respingere');
    res(L.res,[['Forța F',f>=0.01?fmt(f,3):sci(f),'N',true],['Interacțiunea',kind,''],['Mediul',fmt(S.e,1).replace(',0',''),'ε<sub>r</sub>']]);
    L.hint.textContent='Săgețile arată forțele care acționează asupra fiecărei sarcini. Sunt egale ca mărime (principiul acțiunii și reacțiunii), chiar dacă sarcinile sunt diferite. Dublează r și F scade de 4 ori.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 10. Câmp uniform ---------- */
labs.field=function(el){
  var L=makeLab(el,'Particulă încărcată între două armături');
  var PART=[['Electron',-QE,9.109e-31],['Proton',QE,1.673e-27]];
  var S=controls(L.ctl,'fi',[
    {id:'p',label:'Particula',options:[[0,'Electron'],[1,'Proton']],value:0},
    {id:'U',label:'Tensiunea U',min:10,max:1000,step:10,value:100,unit:'V'},
    {id:'d',label:'Distanța d',min:1,max:10,step:0.5,value:5,dec:1,unit:'cm'}],function(){upd()});
  var c=canvas(L.vis,'4/3','Particulă încărcată accelerată între două armături plane');
  function draw(ts){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),p=PART[S.p];
    var gap=h*(0.36+0.38*(S.d-1)/9),yT=h/2-gap/2,yB=h/2+gap/2,x0=w*0.14,x1=w*0.86;
    g.fillStyle=cl.pos; g.fillRect(x0,yT-9,x1-x0,9); g.fillStyle=cl.neg; g.fillRect(x0,yB,x1-x0,9);
    g.fillStyle=cl.ink; g.font='700 15px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    for(var i=0;i<6;i++){ var xx=x0+(x1-x0)*(i+0.5)/6; g.fillText('+',xx,yT-22); g.fillText('−',xx,yB+23); }
    for(var j=0;j<5;j++){ var xl=x0+(x1-x0)*(j+0.5)/5; arrow(g,xl,yT+8,xl,yB-8,cl.mut,1.5); }
    var tau=reduce?0.5:(((ts||performance.now())/1000)%2.6)/2.6,u=reduce?0.5:Math.min(1,tau/0.8),s=u*u,cx=w/2,pad=14,y;
    var up=p[1]<0; y=up?(yB-pad)-s*(gap-2*pad):(yT+pad)+s*(gap-2*pad);
    g.fillStyle=up?cl.neg:cl.pos; g.beginPath(); g.arc(cx,y,9,0,6.2832); g.fill(); g.fillStyle='#fff'; g.font='700 13px "Space Grotesk", sans-serif'; g.fillText(up?'−':'+',cx,y+0.5);
    arrow(g,cx+16,y,cx+16,y+(up?-30:30),cl.acc,3);
    g.fillStyle=cl.ink; g.font='12px Inter, sans-serif'; g.textAlign='left'; g.fillText('F',cx+24,y+(up?-18:18)); g.fillText('E',x1-40,h/2);
    var xd=x0-14; g.strokeStyle=cl.mut; g.lineWidth=1.5; g.beginPath(); g.moveTo(xd,yT); g.lineTo(xd,yB); g.stroke(); g.textAlign='right'; g.fillText('d = '+fmt(S.d,1)+' cm',xd-5,h/2); }
  loop(el,function(dt,ts){ if(visible(c))draw(ts); });
  function upd(){ var p=PART[S.p],d=S.d/100,E=S.U/d,F=Math.abs(p[1])*E,a=F/p[2],v=Math.sqrt(2*Math.abs(p[1])*S.U/p[2]),t=Math.sqrt(2*d/a);
    res(L.res,[['Intensitatea câmpului E = U/d',fmt(E,0),'V/m',true],['Forța F = qE',sci(F),'N'],['Accelerația a = F/m',sci(a),'m/s²'],['Energia câștigată',fmt(S.U,0),'eV'],['Viteza finală',sci(v),'m/s'],['Timpul de traversare',sci(t),'s']]);
    L.hint.textContent='Electronul (sarcină negativă) e atras de placa pozitivă, iar protonul de cea negativă. Energia câștigată este qU. Animația nu e la scară ca timp: traversarea reală durează nanosecunde.'; draw(); }
  watch(c,function(){draw()}); upd();
};

/* ---------- 11. Condensator ---------- */
labs.cond=function(el){
  var L=makeLab(el,'Condensatorul plan');
  var S=controls(L.ctl,'cd',[
    {id:'S',label:'Aria armăturilor S',min:10,max:500,step:10,value:100,unit:'cm²'},
    {id:'d',label:'Distanța dintre armături d',min:0.1,max:5,step:0.1,value:1,dec:1,unit:'mm'},
    {id:'e',label:'Dielectricul',options:[[1,'aer (εr = 1)'],[2.3,'polietilenă (εr ≈ 2,3)'],[3.5,'hârtie (εr ≈ 3,5)'],[7,'sticlă (εr ≈ 7)']],value:1},
    {id:'U',label:'Tensiunea U',min:1,max:100,step:1,value:50,unit:'V'}],function(){upd()});
  var c=canvas(L.vis,'16/9','Condensator plan cu armături și dielectric');
  function calc(){ var C=EPS0*S.e*(S.S*1e-4)/(S.d*1e-3); return {C:C,Q:C*S.U,W:C*S.U*S.U/2,E:S.U/(S.d*1e-3)}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),r=calc();
    var fr=(Math.sqrt(S.S)-Math.sqrt(10))/(Math.sqrt(500)-Math.sqrt(10)),pw=w*(0.25+0.55*fr),gap=12+58*(S.d-0.1)/4.9,x0=(w-pw)/2,yT=h/2-gap/2,yB=h/2+gap/2;
    if(S.e>1){ g.fillStyle=cl.acc; g.globalAlpha=0.12+0.03*S.e; g.fillRect(x0,yT,pw,gap); g.globalAlpha=1; g.fillStyle=cl.ink; g.font='600 12px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('εr = '+fmt(S.e,1),w/2,h/2); }
    g.fillStyle=cl.pos; g.fillRect(x0,yT-8,pw,8); g.fillStyle=cl.neg; g.fillRect(x0,yB,pw,8);
    var n=Math.max(1,Math.min(10,Math.round(1+9*(Math.log10(r.Q)+12)/6.5)));
    g.font='700 14px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    for(var i=0;i<n;i++){ var xx=x0+pw*(i+0.5)/n; g.fillStyle=cl.pos; g.fillText('+',xx,yT-20); g.fillStyle=cl.neg; g.fillText('−',xx,yB+21); }
    if(S.e===1){ for(var j=0;j<7;j++){ var xl=x0+pw*(j+0.5)/7; arrow(g,xl,yT+3,xl,yB-3,cl.mut,1.2); } }
    g.strokeStyle=cl.mut; g.lineWidth=1.5; var xd=x0+pw+14; g.beginPath(); g.moveTo(xd,yT); g.lineTo(xd,yB); g.stroke(); g.fillStyle=cl.ink; g.font='12px Inter, sans-serif'; g.textAlign='left'; g.fillText('d',xd+5,h/2);
    g.textAlign='center'; g.fillText('S = '+fmt(S.S,0)+' cm²',w/2,h-12); }
  function upd(){ var r=calc();
    res(L.res,[['Capacitatea C',si(r.C,'F',2),'',true],['Sarcina Q = CU',si(r.Q,'C',2),''],['Energia W = CU²/2',si(r.W,'J',2),''],['Câmpul E = U/d',fmt(r.E/1000,1),'kV/m']]);
    L.hint.textContent='Mai multe semne + și − înseamnă sarcină mai mare. Apropie armăturile, mărește aria sau introdu un dielectric și C crește.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 12. Fir conductor ---------- */
labs.wire=function(el){
  var L=makeLab(el,'Rezistența și curentul într-un fir');
  var MAT=[['cupru',1.7e-8],['aluminiu',2.8e-8],['fier',1.0e-7],['nichelină',4.2e-7],['constantan',4.9e-7]];
  var S=controls(L.ctl,'wi',[
    {id:'m',label:'Materialul',options:MAT.map(function(m,i){return [i,m[0]+' (ρ = '+String(m[1]).replace('e-','·10⁻').replace('.',',')+' Ω·m)']}),value:0},
    {id:'U',label:'Tensiunea U',min:0.1,max:12,step:0.1,value:2,dec:1,unit:'V'},
    {id:'l',label:'Lungimea l',min:1,max:100,step:1,value:10,unit:'m'},
    {id:'s',label:'Secțiunea S',min:0.5,max:6,step:0.1,value:1.5,dec:1,unit:'mm²'},
    {id:'t',label:'Durata t',min:1,max:60,step:1,value:10,unit:'s'}],function(){upd()});
  var c=canvas(L.vis,'16/7','Fir conductor cu electroni în mișcare');
  var EL=[]; for(var i=0;i<70;i++)EL.push({x:Math.random(),y:Math.random()});
  function calc(){ var Rr=MAT[S.m][1]*S.l/(S.s*1e-6),I=S.U/Rr,q=I*S.t; return {R:Rr,I:I,q:q,N:q/QE}; }
  function geom(w,h){ var len=w*(0.3+0.4*Math.log10(S.l)/2),th=14+30*Math.sqrt((S.s-0.5)/5.5); return {len:len,th:th,x0:(w-len)/2,cy:h*0.55}; }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),G=geom(w,h);
    g.fillStyle=cl.line; g.fillRect(G.x0,G.cy-G.th/2,G.len,G.th); g.strokeStyle=cl.ink; g.lineWidth=2; g.strokeRect(G.x0,G.cy-G.th/2,G.len,G.th);
    g.fillStyle=cl.acc; EL.forEach(function(e){ g.beginPath(); g.arc(G.x0+e.x*G.len,G.cy-G.th/2+3+e.y*(G.th-6),2.6,0,6.2832); g.fill(); });
    [[G.x0-17,'+',cl.pos],[G.x0+G.len+17,'−',cl.neg]].forEach(function(t){ g.fillStyle=t[2]; g.beginPath(); g.arc(t[0],G.cy,11,0,6.2832); g.fill(); g.fillStyle='#fff'; g.font='700 15px "Space Grotesk", sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(t[1],t[0],G.cy+0.5); });
    var ya=G.cy-G.th/2-20; arrow(g,G.x0+G.len*0.3,ya,G.x0+G.len*0.7,ya,cl.ink,2.5); g.fillStyle=cl.ink; g.font='italic 14px "STIX Two Text", serif'; g.textAlign='center'; g.textBaseline='bottom'; g.fillText('I (sens convențional)',G.x0+G.len/2,ya-5);
    var yb=G.cy+G.th/2+22; arrow(g,G.x0+G.len*0.7,yb,G.x0+G.len*0.3,yb,cl.acc,2.5); g.fillStyle=cl.acc; g.font='12px Inter, sans-serif'; g.textBaseline='top'; g.fillText('electronii',G.x0+G.len/2,yb+7); }
  loop(el,function(dt){ if(!visible(c))return; var G=geom(c.clientWidth,c.clientHeight),I=calc().I,v=14+30*Math.log10(1+I*2);
    EL.forEach(function(e){ e.x-=v*dt/G.len; if(e.x<0)e.x+=1; }); draw(); });
  function upd(){ var r=calc();
    res(L.res,[['Rezistența R = ρl/S',fmt(r.R,r.R<1?3:2),'Ω',true],['Intensitatea I = U/R',fmt(r.I,r.I<1?3:2),'A'],['Sarcina q = I·t',fmt(r.q,2),'C'],['Electroni trecuți N',sci(r.N),'']]);
    L.hint.textContent='Electronii se mișcă spre borna +, adică opus sensului convențional al curentului. Valorile mari ale curentului sunt didactice: un fir real s-ar încălzi puternic.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 13. Ohm ---------- */
labs.ohm=function(el){
  var L=makeLab(el,'Caracteristica I–U');
  var S=controls(L.ctl,'oh',[
    {id:'R1',label:'Rezistorul 1: R₁',min:2,max:50,step:1,value:10,unit:'Ω'},
    {id:'R2',label:'Rezistorul 2: R₂',min:2,max:50,step:1,value:25,unit:'Ω'},
    {id:'k',label:'Tipul rezistorului 2',options:[['o','Ohmic'],['b','Bec cu filament (neohmic)']],value:'o'},
    {id:'U',label:'Tensiunea aplicată U',min:0,max:12,step:0.5,value:6,dec:1,unit:'V'}],function(){upd()});
  var c=canvas(L.vis,'4/3','Graficul intensității în funcție de tensiune');
  function I1(U){return U/S.R1}
  function I2(U){return S.k==='o'?U/S.R2:(12/S.R2)*Math.pow(U/12,0.6)}
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c);
    var pl=plot(g,w,h,[0,12],[0,6.5],{xl:'U (V)',yl:'I (A)',ny:5});
    [[I1,cl.acc,'R₁'],[I2,cl.pos,'R₂']].forEach(function(l){ var pts=[]; for(var i=0;i<=80;i++){ var U=12*i/80,I=l[0](U); if(I<=6.5)pts.push([pl.X(U),pl.Y(I)]); } poly(g,pts,l[1],3); });
    var x=pl.X(S.U); g.setLineDash([4,4]); g.strokeStyle=cl.mut; g.lineWidth=1; g.beginPath(); g.moveTo(x,pl.box.t); g.lineTo(x,pl.box.b); g.stroke(); g.setLineDash([]);
    if(I1(S.U)<=6.5)dotLabel(g,x,pl.Y(I1(S.U)),'1',cl.acc,cl,-11,-8); if(I2(S.U)<=6.5)dotLabel(g,x,pl.Y(I2(S.U)),'2',cl.pos,cl,11,-8); }
  function upd(){ var i1=I1(S.U),i2=I2(S.U);
    res(L.res,[['I₁ = U/R₁',fmt(i1,2),'A',true],['I₂ la aceeași tensiune',fmt(i2,2),'A',true],['Panta 1/R₁',fmt(1/S.R1,3),'S'],['R₂ la această tensiune',S.U>0?fmt(S.U/i2,1):'—','Ω']]);
    L.hint.textContent=S.k==='o'?'Dreapta cu panta mai mare corespunde rezistenței mai mici. Pentru același U, curentul prin R₂ e mai mic dacă R₂ > R₁.':'Filamentul becului se încălzește, rezistența lui crește odată cu U, iar graficul se curbează. Un astfel de element nu respectă legea lui Ohm cu R constant.'; draw(); }
  watch(c,draw); upd();
};

labs.pot=function(el){
  var L=makeLab(el,'Potențiometrul ca divizor de tensiune');
  var RP=100;
  var S=controls(L.ctl,'po',[
    {id:'U',label:'Tensiunea sursei U',min:1,max:24,step:1,value:12,unit:'V'},
    {id:'x',label:'Poziția cursorului',min:0,max:100,step:1,value:60,unit:'%'},
    {id:'RL',label:'Rezistența consumatorului R_L',min:10,max:1000,step:10,value:100,unit:'Ω'}],function(){upd()});
  var c=canvas(L.vis,'16/10','Tensiunea de ieșire în funcție de poziția cursorului');
  function uo(x,RL){ var Rl=x*RP; if(RL===null)return S.U*x; var Rp=Rl*RL/(Rl+RL||1); return S.U*Rp/(Rp+(1-x)*RP||1); }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c);
    var pl=plot(g,w,h,[0,100],[0,S.U],{xl:'poziția cursorului (%)',yl:'U ieșire (V)'});
    var a=[],b=[]; for(var i=0;i<=100;i++){ a.push([pl.X(i),pl.Y(uo(i/100,null))]); b.push([pl.X(i),pl.Y(uo(i/100,S.RL))]); }
    poly(g,a,cl.mut,2,[5,4]); poly(g,b,cl.acc,3.5); var x=S.x/100;
    dotLabel(g,pl.X(S.x),pl.Y(uo(x,S.RL)),'cu sarcină',cl.acc,cl,-38,-14); dotLabel(g,pl.X(S.x),pl.Y(uo(x,null)),'fără',cl.mut,cl,22,-12); }
  function upd(){ var x=S.x/100,u0=uo(x,null),u1=uo(x,S.RL);
    res(L.res,[['Fără consumator: U·x',fmt(u0,2),'V'],['Cu consumator R_L',fmt(u1,2),'V',true],['Scădere față de gol',fmt(u0-u1,2),'V']]);
    L.hint.textContent='Potențiometrul are R = 100 Ω. Linia punctată e tensiunea fără consumator (liniară), cea groasă e cu consumator. Cu cât R_L e mai mare față de 100 Ω, cu atât curba se apropie de dreaptă.'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 14. Gruparea rezistoarelor ---------- */
labs.rez=function(el){
  var L=makeLab(el,'Rezistoare în serie, în paralel și mixt');
  var S=controls(L.ctl,'rz',[
    {id:'k',label:'Montajul',options:[['s','Serie'],['p','Paralel'],['m','Mixt: R₁ în serie cu (R₂ ∥ R₃)']],value:'s'},
    {id:'U',label:'Tensiunea sursei U',min:3,max:24,step:1,value:12,unit:'V'},
    {id:'R1',label:'R₁',min:1,max:50,step:1,value:10,unit:'Ω'},
    {id:'R2',label:'R₂',min:1,max:50,step:1,value:20,unit:'Ω'},
    {id:'R3',label:'R₃',min:1,max:50,step:1,value:30,unit:'Ω'}],function(){upd()});
  L.vis.innerHTML='<div class="svgbox"></div><div class="tblwrap"><table class="tbl"></table></div>';
  function calc(){ var U=S.U,a=S.R1,b=S.R2,c=S.R3,Req,I,rows;
    if(S.k==='s'){Req=a+b+c;I=U/Req;rows=[['R₁',a,I*a,I],['R₂',b,I*b,I],['R₃',c,I*c,I]];}
    else if(S.k==='p'){Req=1/(1/a+1/b+1/c);I=U/Req;rows=[['R₁',a,U,U/a],['R₂',b,U,U/b],['R₃',c,U,U/c]];}
    else{var R23=b*c/(b+c);Req=a+R23;I=U/Req;var U23=I*R23;rows=[['R₁',a,I*a,I],['R₂',b,U23,U23/b],['R₃',c,U23,U23/c]];}
    return {Req:Req,I:I,rows:rows}; }
  function rb(cx,cy,t){ return '<rect class="rb" x="'+(cx-26)+'" y="'+(cy-10)+'" width="52" height="20"/><text class="t" x="'+cx+'" y="'+(cy-16)+'" text-anchor="middle">'+t+'</text>'; }
  function batt(x){ return '<line class="bt" x1="'+(x-13)+'" x2="'+(x+13)+'" y1="94" y2="94"/><line class="bt" x1="'+(x-6)+'" x2="'+(x+6)+'" y1="106" y2="106"/><text class="t" x="'+(x+18)+'" y="93">+</text><text class="t" x="'+(x+18)+'" y="117">'+fmt(S.U,0)+' V</text>'; }
  function dot(x,y){ return '<circle class="dt" cx="'+x+'" cy="'+y+'" r="3.5"/>'; }
  function svg(){ var t=function(n,v){return 'R'+n+' = '+fmt(v,0)+' Ω'},s='<svg viewBox="0 0 360 206" role="img" aria-label="Schema circuitului">';
    if(S.k==='s'){ s+='<path class="w" d="M40,92 V40 H320 V186 H40 V108"/>'+rb(100,40,t('₁',S.R1))+rb(180,40,t('₂',S.R2))+rb(260,40,t('₃',S.R3)); }
    else if(S.k==='p'){ s+='<path class="w" d="M40,92 V40 H90 M90,40 V160 M90,40 H300 M90,100 H300 M90,160 H300 M300,40 V186 H40 V108"/>'+rb(195,40,t('₁',S.R1))+rb(195,100,t('₂',S.R2))+rb(195,160,t('₃',S.R3))+dot(90,40)+dot(90,100)+dot(90,160)+dot(300,40)+dot(300,100)+dot(300,160); }
    else { s+='<path class="w" d="M40,92 V40 H300 M170,40 V110 M170,110 H300 M300,40 V186 H40 V108"/>'+rb(105,40,t('₁',S.R1))+rb(235,40,t('₂',S.R2))+rb(235,110,t('₃',S.R3))+dot(170,40)+dot(170,110)+dot(300,40)+dot(300,110); }
    return s+batt(40)+'</svg>'; }
  function upd(){ var r=calc(); $('.svgbox',L.vis).innerHTML=svg();
    var rows=r.rows.map(function(x){return '<tr><td>'+x[0]+'</td><td>'+fmt(x[1],1)+'</td><td>'+fmt(x[2],2)+'</td><td>'+fmt(x[3],3)+'</td><td>'+fmt(x[2]*x[3],2)+'</td></tr>'}).join('');
    rows+='<tr><td><b>Echivalent</b></td><td><b>'+fmt(r.Req,2)+'</b></td><td><b>'+fmt(S.U,2)+'</b></td><td><b>'+fmt(r.I,3)+'</b></td><td><b>'+fmt(S.U*r.I,2)+'</b></td></tr>';
    $('.tbl',L.vis).innerHTML='<thead><tr><th>Element</th><th>R (Ω)</th><th>U (V)</th><th>I (A)</th><th>P (W)</th></tr></thead><tbody>'+rows+'</tbody>';
    res(L.res,[['Rezistența echivalentă',fmt(r.Req,2),'Ω',true],['Curentul din sursă',fmt(r.I,3),'A'],['Puterea totală',fmt(S.U*r.I,2),'W']]);
    L.hint.textContent=S.k==='s'?'Serie: același curent prin toate, tensiunile se adună la U.':S.k==='p'?'Paralel: aceeași tensiune pe toate, curenții se adună la curentul din sursă.':'Mixt: întâi R₂ ∥ R₃, apoi rezultatul în serie cu R₁. Suma puterilor pe rezistoare este egală cu puterea sursei.'; }
  upd();
};

/* ---------- 15. Sursa de tensiune ---------- */
labs.source=function(el){
  var L=makeLab(el,'Circuitul întreg: sursă și consumator');
  var S=controls(L.ctl,'so',[
    {id:'E',label:'T.e.m. a unei surse E',min:1.5,max:24,step:0.5,value:12,dec:1,unit:'V'},
    {id:'r',label:'Rezistența internă r (a unei surse)',min:0.1,max:5,step:0.1,value:1,dec:1,unit:'Ω'},
    {id:'n',label:'Număr de surse identice n',min:1,max:6,step:1,value:1},
    {id:'g',label:'Gruparea surselor',options:[['s','În serie'],['p','În paralel']],value:'s'},
    {id:'R',label:'Rezistența exterioară R',min:0.5,max:50,step:0.5,value:5,dec:1,unit:'Ω'}],function(){upd()});
  var c1=canvas(L.vis,'16/10','Caracteristica sursei și dreapta consumatorului');
  var c2=canvas(L.vis,'16/10','Puterea utilă în funcție de R');
  function b(){ var Eb=S.g==='s'?S.n*S.E:S.E,rb=S.g==='s'?S.n*S.r:S.r/S.n,I=Eb/(S.R+rb); return {Eb:Eb,rb:rb,I:I,U:Eb-I*rb,P:I*I*S.R,Pt:Eb*I,eta:S.R/(S.R+rb)}; }
  function draw1(){ var k=ctx(c1); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c1),q=b(),Isc=q.Eb/q.rb;
    var pl=plot(g,w,h,[0,Isc],[0,q.Eb],{xl:'I (A)',yl:'U (V)'});
    poly(g,[[pl.X(0),pl.Y(q.Eb)],[pl.X(Isc),pl.Y(0)]],cl.acc,3);
    var xe=Math.min(q.Eb/S.R,Isc); poly(g,[[pl.X(0),pl.Y(0)],[pl.X(xe),pl.Y(S.R*xe)]],cl.pos,3);
    dotLabel(g,pl.X(q.I),pl.Y(q.U),'punct de funcționare',cl.ink,cl,0,-15);
    g.fillStyle=cl.acc; g.font='600 11px "Space Grotesk", sans-serif'; g.textAlign='left'; g.fillText('U = E − Ir',pl.X(Isc*0.52)+6,pl.Y(q.Eb*0.5)-12); g.fillStyle=cl.pos; g.fillText('U = IR',pl.X(Isc*0.05)+4,pl.Y(Math.min(q.Eb,S.R*Isc*0.05))-12); }
  function draw2(){ var k=ctx(c2); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c2),q=b(),xm=Math.max(6*q.rb,S.R*1.2),Pm=q.Eb*q.Eb/(4*q.rb);
    var pl=plot(g,w,h,[0,xm],[0,Pm*1.15],{xl:'R (Ω)',yl:'P utilă (W)'});
    var pts=[]; for(var i=0;i<=100;i++){ var Rv=xm*i/100; pts.push([pl.X(Rv),pl.Y(q.Eb*q.Eb*Rv/Math.pow(Rv+q.rb,2))]); } poly(g,pts,cl.acc,3);
    dotLabel(g,pl.X(q.rb),pl.Y(Pm),'R = r',cl.mut,cl,0,-15); dotLabel(g,pl.X(S.R),pl.Y(q.P),'R',cl.pos,cl,11,-11); }
  function upd(){ var q=b();
    res(L.res,[['T.e.m. a bateriei',fmt(q.Eb,1),'V'],['Rezistența internă',fmt(q.rb,2),'Ω'],['Curentul I',fmt(q.I,2),'A',true],['Tensiunea la borne U',fmt(q.U,2),'V',true],['Tensiunea interioară u = Ir',fmt(q.I*q.rb,2),'V'],['Putere utilă P = RI²',fmt(q.P,2),'W'],['Putere totală EI',fmt(q.Pt,2),'W'],['Randament η',fmt(q.eta*100,1),'%'],['Curent de scurtcircuit',fmt(q.Eb/q.rb,1),'A']]);
    L.hint.textContent='Punctul de funcționare este intersecția dintre caracteristica sursei și dreapta U = IR. Puterea utilă e maximă la R = r, iar atunci η = 50%. Seria mărește E, paralelul micșorează r.'; draw1(); draw2(); }
  watch(c1,draw1); watch(c2,draw2); upd();
};

/* ---------- 16. Kirchhoff ---------- */
labs.kirch=function(el){
  var L=makeLab(el,'Rețea cu două surse și trei rezistoare');
  var S=controls(L.ctl,'ki',[
    {id:'E1',label:'E₁',min:1,max:24,step:1,value:12,unit:'V'},
    {id:'E2',label:'E₂',min:1,max:24,step:1,value:6,unit:'V'},
    {id:'R1',label:'R₁',min:1,max:50,step:1,value:10,unit:'Ω'},
    {id:'R2',label:'R₂',min:1,max:50,step:1,value:20,unit:'Ω'},
    {id:'R3',label:'R₃',min:1,max:50,step:1,value:15,unit:'Ω'}],function(){upd()});
  L.vis.innerHTML='<div class="svgbox"></div>';
  function solve(){ var a=S.R1,b=S.R2,c=S.R3,D=(a+c)*(b+c)-c*c,I1=(S.E1*(b+c)-S.E2*c)/D,I2=((a+c)*S.E2-c*S.E1)/D; return {I1:I1,I2:I2,I3:I1+I2}; }
  function tri(x,y,up,sz){ return up?'<path class="ar" d="M'+x+','+(y-sz)+' L'+(x-5)+','+(y+sz)+' L'+(x+5)+','+(y+sz)+' Z"/>':'<path class="ar" d="M'+x+','+(y+sz)+' L'+(x-5)+','+(y-sz)+' L'+(x+5)+','+(y-sz)+' Z"/>'; }
  function bt(x,t){ return '<line class="bt" x1="'+(x-12)+'" x2="'+(x+12)+'" y1="74" y2="74"/><line class="bt" x1="'+(x-6)+'" x2="'+(x+6)+'" y1="84" y2="84"/><text class="t" x="'+(x-16)+'" y="82" text-anchor="end">'+t+'</text><text class="t" x="'+(x+16)+'" y="73">+</text>'; }
  function rv(x,t,y0){ return '<rect class="rb" x="'+(x-10)+'" y="'+y0+'" width="20" height="34"/><text class="t" x="'+(x-16)+'" y="'+(y0+21)+'" text-anchor="end">'+t+'</text>'; }
  function svg(r){ var xs=[90,200,310],s='<svg viewBox="0 0 400 226" role="img" aria-label="Rețea cu două surse">';
    s+='<path class="w" d="M90,40 H310 M90,190 H310 M90,40 V70 M90,88 V190 M310,40 V70 M310,88 V190 M200,40 V190"/>';
    s+=bt(90,'E₁ = '+fmt(S.E1,0)+' V')+bt(310,'E₂ = '+fmt(S.E2,0)+' V')+rv(90,'R₁ = '+fmt(S.R1,0)+' Ω',118)+rv(200,'R₃ = '+fmt(S.R3,0)+' Ω',95)+rv(310,'R₂ = '+fmt(S.R2,0)+' Ω',118);
    s+='<circle class="dt" cx="200" cy="40" r="3.5"/><circle class="dt" cx="200" cy="190" r="3.5"/>';
    var cur=[[90,r.I1,true,'I₁'],[200,r.I3,false,'I₃'],[310,r.I2,true,'I₂']];
    cur.forEach(function(c){ var up=(c[1]>=0)===c[2]; s+=tri(c[0],c[3]==='I₃'?168:170,up,7)+'<text class="t" x="'+(c[0]+10)+'" y="'+(c[3]==='I₃'?172:174)+'">'+c[3]+' = '+(c[1]<0?'−':'')+fmt(Math.abs(c[1]),3)+' A</text>'; });
    s+='<text class="tm" x="12" y="216">Săgeata arată sensul real al curentului.</text>';
    return s+'</svg>'; }
  function upd(){ var r=solve(); $('.svgbox',L.vis).innerHTML=svg(r);
    res(L.res,[['I₁',sgn(r.I1)+fmt(Math.abs(r.I1),3),'A',true],['I₂',sgn(r.I2)+fmt(Math.abs(r.I2),3),'A',true],['I₃ = I₁ + I₂',sgn(r.I3)+fmt(Math.abs(r.I3),3),'A',true],
      ['Ochi 1: E₁ − I₁R₁ − I₃R₃',fmt(S.E1-r.I1*S.R1-r.I3*S.R3,3),'V'],['Ochi 2: E₂ − I₂R₂ − I₃R₃',fmt(S.E2-r.I2*S.R2-r.I3*S.R3,3),'V']]);
    L.hint.textContent='Verificările din ultimele două casete dau 0, adică teorema a II-a se respectă pe ambii ochi. Când un curent iese negativ, săgeata se inversează: sensul real e opus celui ales.'; }
  function sgn(x){return x<0?'−':''}
  upd();
};

/* ---------- 17. Energie, Joule, siguranță ---------- */
labs.cost=function(el){
  var L=makeLab(el,'Consumul de energie al unui aparat');
  var DEV=[['Bec LED',9],['Laptop în încărcare',65],['Televizor',100],['Cuptor cu microunde',1000],['Aspirator',1400],['Fier de călcat',2000],['Fierbător',2000]];
  var S=controls(L.ctl,'co',[
    {id:'d',label:'Aparatul',options:DEV.map(function(d,i){return [i,d[0]+' ('+d[1]+' W)']}),value:6},
    {id:'h',label:'Ore de funcționare pe zi',min:0.1,max:12,step:0.1,value:0.5,dec:1,unit:'h'},
    {id:'z',label:'Zile',min:1,max:30,step:1,value:30,unit:'zile'},
    {id:'p',label:'Prețul energiei',min:0.5,max:3,step:0.05,value:1.3,dec:2,unit:'lei/kWh'}],function(){upd()});
  function upd(){ var P=DEV[S.d][1],I=P/230,Rr=230*230/P,kwh=P*S.h*S.z/1000;
    res(L.res,[['Curentul I = P/U (la 230 V)',fmt(I,2),'A'],['Rezistența R = U²/P',fmt(Rr,1),'Ω'],['Energia consumată',fmt(kwh,1),'kWh',true],['Energia în jouli',fmt(kwh*3.6,1),'MJ'],['Costul',fmt(kwh*S.p,2),'lei',true]]);
    L.hint.textContent='Prețul din cursor este un exemplu. Folosește prețul de pe factura ta. 1 kWh = 3,6·10⁶ J.'; }
  upd();
};

labs.joule=function(el){
  var L=makeLab(el,'Efectul Joule: încălzirea apei cu un rezistor');
  var S=controls(L.ctl,'jo',[
    {id:'R',label:'Rezistența R',min:1,max:100,step:1,value:20,unit:'Ω'},
    {id:'I',label:'Curentul I',min:0.1,max:10,step:0.1,value:5,dec:1,unit:'A'},
    {id:'t',label:'Durata t',min:1,max:600,step:1,value:120,unit:'s'},
    {id:'m',label:'Masa apei m',min:0.1,max:2,step:0.1,value:0.5,dec:1,unit:'kg'}],function(){upd()});
  L.vis.innerHTML='<div class="scale"><div class="scale-top"></div><div class="scale-bar"><i></i></div><div class="scale-lab"><span style="left:0">20 °C</span><span style="right:0">100 °C</span></div></div>';
  function upd(){ var P=S.R*S.I*S.I,Q=P*S.t,dT=Q/(S.m*4180),Tf=20+dT;
    $('.scale-top',L.vis).textContent='Apa pornește de la 20 °C și ajunge teoretic la '+fmt(Tf,1)+' °C';
    $('.scale-bar i',L.vis).style.width=Math.max(0,Math.min(100,(Tf-20)/80*100))+'%';
    res(L.res,[['Puterea P = RI²',fmt(P,1),'W'],['Căldura Q = RI²t',fmt(Q,0),'J',true],['Încălzirea ΔT = Q/(mc)',fmt(dT,1),'K',true],['Temperatura finală',fmt(Tf,1),'°C']]);
    L.hint.textContent=Tf>100?'Peste 100 °C apa fierbe. Calculul nu mai este valid, fiindcă o parte din căldură ar servi la vaporizare.':'Se presupune că toată căldura ajunge în apă (c = 4180 J/kg·K), fără pierderi.'; L.hint.className='hint'+(Tf>100?' bad':''); }
  upd();
};

labs.fuse=function(el){
  var L=makeLab(el,'Siguranța dintr-un circuit de priză');
  var DEV=[['Fierbător',2000],['Cuptor cu microunde',1000],['Aspirator',1400],['Uscător de păr',1800],['Laptop',65],['Bec LED',9]];
  var S=controls(L.ctl,'fu',[{id:'f',label:'Siguranța circuitului',options:[[10,'10 A'],[16,'16 A'],[20,'20 A']],value:16}],function(){upd()});
  var chk=document.createElement('div'); chk.className='checks'; var on=[true,true,false,false,true,false];
  DEV.forEach(function(d,i){ var lb=document.createElement('label'); lb.innerHTML='<input type="checkbox" id="fu-d'+i+'"'+(on[i]?' checked':'')+'><span>'+d[0]+'</span><span class="pw">'+d[1]+' W</span>'; lb.querySelector('input').addEventListener('change',function(){on[i]=this.checked;upd();}); chk.appendChild(lb); });
  L.ctl.appendChild(chk);
  L.vis.innerHTML='<div class="scale-top"></div><div class="gauge"><i></i><u></u></div><div class="scale-lab" style="height:18px"><span style="left:0">0 A</span></div>';
  function upd(){ var P=0; DEV.forEach(function(d,i){ if(on[i])P+=d[1]; }); var I=P/230,lim=S.f,max=lim*1.5,over=I>lim;
    var bar=$('.gauge i',L.vis); bar.style.width=Math.min(100,I/max*100)+'%'; bar.className=over?'over':''; $('.gauge u',L.vis).style.left=(lim/max*100)+'%';
    $('.scale-top',L.vis).textContent=fmt(I,1)+' A față de limita de '+fmt(lim,0)+' A';
    res(L.res,[['Puterea totală',fmt(P,0),'W'],['Curentul I = P/U (230 V)',fmt(I,1),'A',true],['Starea siguranței',over?'se declanșează':'rezistă','']]);
    L.hint.textContent=over?'Curentul depășește limita, deci siguranța întrerupe circuitul. Așa se evită încălzirea cablurilor. Nu o înlocui cu una mai mare.':'Curentul e sub limită. Bifează încă un aparat și urmărește când se declanșează siguranța.'; L.hint.className='hint'+(over?' bad':''); }
  upd();
};

/* ---------- 18. Câmp magnetic ---------- */
labs.bfield=function(el){
  var L=makeLab(el,'Inducția magnetică a unui curent');
  var S=controls(L.ctl,'bf',[
    {id:'k',label:'Conductorul',options:[['f','Fir rectiliniu lung'],['s','Spiră circulară (în centru)'],['o','Solenoid (în interior)']],value:'f'},
    {id:'I',label:'Curentul I',min:0.1,max:50,step:0.1,value:5,dec:1,unit:'A'},
    {id:'d',label:'Distanța de la fir d',min:1,max:50,step:1,value:10,unit:'cm'},
    {id:'R',label:'Raza spirei R',min:1,max:20,step:1,value:5,unit:'cm'},
    {id:'N',label:'Număr de spire N',min:10,max:1000,step:10,value:200},
    {id:'l',label:'Lungimea solenoidului l',min:5,max:50,step:1,value:20,unit:'cm'}],function(){upd()});
  var c=canvas(L.vis,'16/6','Scara logaritmică a inducției magnetice');
  function B(){ if(S.k==='f')return MU0*S.I/(2*Math.PI*S.d/100); if(S.k==='s')return MU0*S.I/(2*S.R/100); return MU0*S.N*S.I/(S.l/100); }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),m=30,x0=m,x1=w-m,y=h*0.58,lo=-8,hi=1;
    var X=function(b){return x0+(Math.log10(b)-lo)/(hi-lo)*(x1-x0)};
    g.strokeStyle=cl.mut; g.lineWidth=2; g.beginPath(); g.moveTo(x0,y); g.lineTo(x1,y); g.stroke();
    g.fillStyle=cl.mut; g.font='10px Inter, sans-serif'; g.textAlign='center'; g.textBaseline='top';
    for(var e=lo;e<=hi;e++){ var x=X(Math.pow(10,e)); g.beginPath(); g.moveTo(x,y-4); g.lineTo(x,y+4); g.stroke(); if(e%2!==0)g.fillText(si(Math.pow(10,e),'T',0),x,y+8); }
    [[5e-5,'Pământ'],[5e-3,'magnet'],[3,'RMN']].forEach(function(r){ var x=X(r[0]); g.strokeStyle=cl.line; g.lineWidth=1.5; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y-26); g.stroke(); g.fillStyle=cl.ink; g.font='11px Inter, sans-serif'; g.textBaseline='bottom'; g.fillText(r[1],x,y-28); });
    var b=B(),xb=Math.max(x0,Math.min(x1,X(b))); g.fillStyle=cl.acc; g.beginPath(); g.moveTo(xb,y+2); g.lineTo(xb-7,y+16); g.lineTo(xb+7,y+16); g.closePath(); g.fill();
    g.fillStyle=cl.acc; g.font='600 12px "Space Grotesk", sans-serif'; g.textBaseline='top'; g.textAlign=xb<x0+50?'left':xb>x1-50?'right':'center'; g.fillText(si(b,'T',2),xb,y+19); }
  function upd(){ var b=B(); showCtl(L.ctl,'d',S.k==='f'); showCtl(L.ctl,'R',S.k==='s'); showCtl(L.ctl,'N',S.k==='o'); showCtl(L.ctl,'l',S.k==='o');
    res(L.res,[['Inducția B',si(b,'T',2),'',true],['Raportat la câmpul Pământului (≈ 50 μT)',fmt(b/5e-5,2),'×']]);
    L.hint.textContent=S.k==='f'?'Fir lung: B = μ₀I/(2πd). B scade pe măsură ce te depărtezi.':S.k==='s'?'În centrul spirei: B = μ₀I/(2R).':'În interiorul solenoidului lung: B = μ₀NI/l. Mai multe spire pe lungime dau un câmp mai puternic.'; draw(); }
  watch(c,draw); upd();
};

labs.force=function(el){
  var L=makeLab(el,'Forța asupra unui conductor într-un câmp magnetic');
  var S=controls(L.ctl,'fo',[
    {id:'B',label:'Inducția B',min:0.1,max:2,step:0.1,value:0.5,dec:1,unit:'T'},
    {id:'I',label:'Curentul I',min:0.5,max:20,step:0.5,value:5,dec:1,unit:'A'},
    {id:'l',label:'Lungimea l',min:0.1,max:1,step:0.1,value:0.4,dec:1,unit:'m'},
    {id:'a',label:'Unghiul α dintre conductor și B',min:0,max:180,step:5,value:90,unit:'°'}],function(){upd()});
  var c=canvas(L.vis,'16/9','Conductor într-un câmp magnetic');
  function F(){ return S.B*S.I*S.l*Math.sin(S.a*Math.PI/180); }
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),cx=w/2,cy=h*0.45,f=F();
    for(var j=0;j<5;j++){ var yy=h*0.12+j*h*0.15; arrow(g,w*0.08,yy,w*0.92,yy,cl.line,1.5); }
    g.fillStyle=cl.mut; g.font='italic 14px "STIX Two Text", serif'; g.textAlign='left'; g.textBaseline='bottom'; g.fillText('B',w*0.9,h*0.1);
    var a=S.a*Math.PI/180,half=Math.min(w,h)*0.28; g.save(); g.strokeStyle=cl.ink; g.lineWidth=5; g.lineCap='round'; g.beginPath(); g.moveTo(cx-Math.cos(a)*half,cy+Math.sin(a)*half); g.lineTo(cx+Math.cos(a)*half,cy-Math.sin(a)*half); g.stroke(); g.restore();
    g.strokeStyle=cl.acc; g.lineWidth=2; g.beginPath(); g.arc(cx,cy,half*0.55,-a,0); g.stroke(); g.fillStyle=cl.acc; g.font='italic 14px "STIX Two Text", serif'; g.textAlign='left'; g.textBaseline='middle'; g.fillText('α',cx+half*0.55+6,cy-6);
    var bx=w*0.1,by=h*0.88,bw=w*0.8,fm=40; g.fillStyle=cl.surf; g.strokeStyle=cl.line; g.lineWidth=1; g.fillRect(bx,by-8,bw,16); g.strokeRect(bx,by-8,bw,16);
    g.fillStyle=cl.pos; g.fillRect(bx,by-8,bw*Math.min(1,f/fm),16); g.fillStyle=cl.ink; g.font='600 12px "Space Grotesk", sans-serif'; g.textAlign='left'; g.textBaseline='bottom'; g.fillText('F = '+fmt(f,2)+' N',bx,by-12);
    g.fillStyle=cl.mut; g.font='11px Inter, sans-serif'; g.textAlign='right'; g.fillText('0 – '+fm+' N',bx+bw,by-12); }
  function upd(){ var f=F(); res(L.res,[['Forța F = BIl·sinα',fmt(f,2),'N',true],['sin α',fmt(Math.sin(S.a*Math.PI/180),2),'']]);
    L.hint.textContent='Conductorul paralel cu B (α = 0° sau 180°) nu simte nicio forță. Forța e maximă la α = 90°. Direcția ei e perpendiculară pe planul format de conductor și B (regula mâinii stângi).'; draw(); }
  watch(c,draw); upd();
};

/* ---------- 19. Inducție electromagnetică ---------- */
labs.induc=function(el){
  var L=makeLab(el,'Tijă care alunecă pe două șine într-un câmp magnetic');
  var S=controls(L.ctl,'in',[
    {id:'B',label:'Inducția B',min:0.1,max:2,step:0.1,value:0.5,dec:1,unit:'T'},
    {id:'l',label:'Lungimea tijei l',min:0.1,max:1,step:0.1,value:0.5,dec:1,unit:'m'},
    {id:'v',label:'Viteza v',min:0.5,max:5,step:0.5,value:2,dec:1,unit:'m/s'},
    {id:'R',label:'Rezistența circuitului R',min:0.5,max:10,step:0.5,value:2,dec:1,unit:'Ω'}],function(){upd()});
  var c=canvas(L.vis,'16/9','Tijă mobilă pe șine într-un câmp magnetic');
  var frac=reduce?0.5:0.1;
  function draw(){ var k=ctx(c); if(!k)return; var g=k.g,w=k.w,h=k.h,cl=colors(c),y1=h*0.26,y2=h*0.74,xL=w*0.14,xR=w*0.94,xr=xL+(xR-xL-12)*frac,mid=(y1+y2)/2;
    g.fillStyle=cl.acc; g.globalAlpha=0.12; g.fillRect(xL,y1,xr-xL,y2-y1); g.globalAlpha=1;
    g.fillStyle=cl.mut; g.font='13px Inter, sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    for(var i=0;i<12;i++){ for(var j=0;j<3;j++){ var xx=xL+18+i*((xR-xL-30)/11),yy=y1+(y2-y1)*(j+1)/4; if(xx<xr+2||true)g.fillText('×',xx,yy); } }
    g.strokeStyle=cl.ink; g.lineWidth=3; g.lineCap='round'; g.beginPath(); g.moveTo(xL,y1); g.lineTo(xR,y1); g.moveTo(xL,y2); g.lineTo(xR,y2); g.moveTo(xL,y1); g.lineTo(xL,mid-16); g.moveTo(xL,mid+16); g.lineTo(xL,y2); g.stroke();
    g.fillStyle=cl.surf; g.fillRect(xL-9,mid-16,18,32); g.lineWidth=2; g.strokeRect(xL-9,mid-16,18,32); g.fillStyle=cl.ink; g.font='italic 14px "STIX Two Text", serif'; g.textAlign='right'; g.fillText('R',xL-14,mid);
    g.strokeStyle=cl.pos; g.lineWidth=6; g.beginPath(); g.moveTo(xr,y1-6); g.lineTo(xr,y2+6); g.stroke();
    arrow(g,xr+10,mid,xr+10+14+S.v*9,mid,cl.ink,2.5); g.fillStyle=cl.ink; g.textAlign='left'; g.fillText('v',xr+14+S.v*9+14,mid-10);
    var xm=(xL+xr)/2; if(xr-xL>50){ arrow(g,xm-10,y2,xm+10,y2,cl.neg,2); arrow(g,xm+10,y1,xm-10,y1,cl.neg,2); } arrow(g,xr-14,mid+12,xr-14,mid-12,cl.neg,2); arrow(g,xL+14,mid-30,xL+14,mid-12,cl.neg,2);
    g.fillStyle=cl.mut; g.font='11px Inter, sans-serif'; g.textAlign='left'; g.textBaseline='bottom'; g.fillText('B perpendicular pe plan (intră în pagină)',xL,h-6); }
  loop(el,function(dt){ if(!visible(c))return; frac+=dt*(S.v/5)*0.32; if(frac>0.95)frac=0.1; draw(); });
  function upd(){ var e=S.B*S.l*S.v,I=e/S.R,F=S.B*I*S.l;
    res(L.res,[['T.e.m. indusă e = Blv',fmt(e,2),'V',true],['Curentul I = e/R',fmt(I,2),'A'],['ΔΦ/Δt = B·l·v',fmt(e,2),'Wb/s'],['Forța de frânare F = BIl',fmt(F,2),'N'],['Puterea P = e·I',fmt(e*I,2),'W']]);
    L.hint.textContent='Aria buclei (zona colorată) crește cu l·v pe secundă, deci fluxul crește uniform. Curentul indus (săgețile albastre) circulă invers acelor de ceasornic și produce o forță care se opune mișcării (legea lui Lenz).'; draw(); }
  watch(c,draw); upd();
};
})();
