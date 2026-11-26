/* Se rulează în <head>, înainte de afișare, ca tema salvată să nu licărească la încărcare. */
document.documentElement.classList.add('js');
try{var k=localStorage.getItem('atlas-x-skin');if(k&&/^[a-z]+$/.test(k)&&k!=='bleumarin')document.documentElement.setAttribute('data-skin',k);}catch(e){}
