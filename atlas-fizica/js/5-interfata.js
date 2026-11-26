(function(){
'use strict';
var A=window.__atlas,H=A.helpers,$=H.$,$$=H.$$;
var root=document.documentElement;
var store={ get:function(k,d){ try{ var v=localStorage.getItem('atlas-x-'+k); return v===null?d:v; }catch(e){ return d; } }, set:function(k,v){ try{ localStorage.setItem('atlas-x-'+k,String(v)); }catch(e){} } };

/* ---------- Teme ---------- */
var SKINS=[
 ['bleumarin','Bleumarin și bej',['#14213f','#ece3d1','#7a1d3b']],
 ['alb','Alb',['#ffffff','#f3f4f8','#8a2347']],
 ['turcoaz','Verde-turcoaz',['#0d3b3d','#e2efea','#0d7773']],
 ['negru','Negru',['#000000','#17171e','#e0728f']],
 ['lavanda','Lavandă',['#2b255b','#e9e6f3','#7a2468']]
];
function currentSkin(){ return root.getAttribute('data-skin')||'bleumarin'; }
function applySkin(id){
  if(id==='bleumarin')root.removeAttribute('data-skin'); else root.setAttribute('data-skin',id);
  store.set('skin',id); paintSkins();
  setTimeout(function(){ H.redraws.forEach(function(f){ try{ f(); }catch(e){} }); },60);
}
function paintSkins(){ var c=currentSkin(); $$('#swGrid .swatch').forEach(function(b){ b.setAttribute('aria-checked',b.dataset.skin===c?'true':'false'); }); }
(function buildSkins(){
  var g=$('#swGrid'); if(!g)return;
  g.innerHTML=SKINS.map(function(s){ return '<button type="button" class="swatch" role="radio" aria-checked="false" data-skin="'+s[0]+'"><span class="sw"><i style="background:'+s[2][0]+'"></i><i style="background:'+s[2][1]+'"></i><i style="background:'+s[2][2]+'"></i></span><span>'+s[1]+'</span></button>'; }).join('');
  $$('.swatch',g).forEach(function(b){ b.addEventListener('click',function(){ applySkin(b.dataset.skin); }); });
  paintSkins();
})();

/* ---------- Panoul de setări ---------- */
var drawer=$('#drawer'),scrim=$('#scrim'),setBtn=$('#setBtn'),closeBtn=$('#drClose'),lastFocus=null;
function focusables(){ return $$('button, input, select, a[href]',drawer).filter(function(e){ return !e.disabled&&e.offsetParent!==null; }); }
function openDrawer(){
  if(drawer.classList.contains('open'))return; lastFocus=document.activeElement;
  drawer.classList.add('open'); scrim.classList.add('open'); drawer.setAttribute('aria-hidden','false'); setBtn.setAttribute('aria-expanded','true');
  setTimeout(function(){ closeBtn.focus(); },60);
}
function closeDrawer(){
  if(!drawer.classList.contains('open'))return;
  drawer.classList.remove('open'); scrim.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); setBtn.setAttribute('aria-expanded','false');
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
setBtn.addEventListener('click',function(){ if(drawer.classList.contains('open'))closeDrawer(); else openDrawer(); });
closeBtn.addEventListener('click',closeDrawer); scrim.addEventListener('click',closeDrawer);
document.addEventListener('keydown',function(e){
  if(!drawer.classList.contains('open'))return;
  if(e.key==='Escape'){ closeDrawer(); return; }
  if(e.key==='Tab'){ var f=focusables(); if(!f.length)return; var a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); } }
});
document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-open-settings]'); if(t){ e.preventDefault(); openDrawer(); } });

/* ---------- Efect de undă la butoane ---------- */
document.addEventListener('pointerdown',function(e){
  if(e.button>0)return; var b=e.target.closest&&e.target.closest('.hbtn, .btn, .opt, .swatch'); if(!b||b.disabled)return;
  var r=b.getBoundingClientRect(),d=Math.max(r.width,r.height),s=document.createElement('span'); s.className='ripple';
  s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px'; b.appendChild(s); setTimeout(function(){ if(s.parentNode)s.parentNode.removeChild(s); },650);
});

/* ---------- Apariție și dispariție la intrarea și ieșirea din ecran ---------- */
var SEL='.chap-head, .hero, .theory > *, .formulas .fm, .lab, .quiz, .dcard, .fcard, .pager, .domains + .note';
var io=null;
if('IntersectionObserver' in window){ io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('in',e.isIntersecting); }); },{rootMargin:'-4% 0px -4% 0px',threshold:0}); }
A.onShow=function(pg){
  var n=0; $$(SEL,pg).forEach(function(el){
    if(el.dataset.rv)return; el.dataset.rv='1'; el.classList.add('rv');
    if(el.classList.contains('fm')||el.classList.contains('dcard')||el.classList.contains('fcard'))el.style.transitionDelay=((n++%4)*70)+'ms';
    if(io)io.observe(el); else el.classList.add('in');
  });
};
if(A.pendingPage)A.onShow(A.pendingPage);
})();
