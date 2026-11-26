(function(){
'use strict';
var A=window.__atlas,H=A.helpers,$=H.$,$$=H.$$;

var CH=[
 {id:'mec-1',d:'mec',l:'M1',t:'Mișcarea rectilinie uniformă'},
 {id:'mec-2',d:'mec',l:'M2',t:'Mișcarea uniform variată'},
 {id:'mec-3',d:'mec',l:'M3',t:'Căderea liberă și aruncările'},
 {id:'mec-4',d:'mec',l:'M4',t:'Principiile dinamicii'},
 {id:'mec-5',d:'mec',l:'M5',t:'Planul înclinat și frecarea'},
 {id:'mec-6',d:'mec',l:'M6',t:'Lucrul mecanic, puterea, randamentul'},
 {id:'mec-7',d:'mec',l:'M7',t:'Energia mecanică și conservarea ei'},
 {id:'mec-8',d:'mec',l:'M8',t:'Impulsul și ciocnirile'},
 {id:'mec-9',d:'mec',l:'M9',t:'Echilibrul. Momentul forței. Pârghii'}
];
['Agitația termică. Structura discretă','Noțiuni de bază. Gazul ideal','Transformările simple ale gazului ideal','Energia internă, lucrul, căldura. Principiul I','Calorimetrie','Principiul II. Ciclul Carnot. Mașini termice','Transformări de stare de agregare','Fenomene de suprafață și capilare'].forEach(function(t,i){ CH.push({id:'cap-'+(i+1),d:'heat',l:''+(i+1),t:t}); });
['Legea lui Coulomb','Câmpul electrostatic. Potențialul. Tensiunea','Condensatorul plan. Capacitatea','Curentul electric. Rezistența','Legea lui Ohm. Reostatul. Potențiometrul','Gruparea rezistoarelor','Sursa de tensiune. Gruparea generatoarelor','Rețele electrice. Teoremele lui Kirchhoff','Energia, puterea, efectul Joule. Protecție','Efectul magnetic. Inducția magnetică','Inducția electromagnetică'].forEach(function(t,i){ CH.push({id:'cap-'+(i+9),d:'volt',l:''+(i+9),t:t}); });
var ORDER=CH.map(function(c){return c.id}).concat(['formular']);
var DOM={mec:['Mecanică','Mișcare, forțe, energie, impuls și echilibru. Programa clasei a IX-a, aici ca recapitulare.'],heat:['Termodinamică','Gaze, căldură, motoare și schimbări de stare.'],volt:['Electricitate și magnetism','Câmpuri, circuite de curent continuu și inducție.']};

/* ---------- Teste: [întrebare, [variante], index corect, explicație] ---------- */
var QZ={
m1:[['Un tren merge cu 72 km/h. Cât este viteza în m/s?',['7,2 m/s','20 m/s','72 m/s','259 m/s'],1,'72 km/h = 72/3,6 = 20 m/s.'],
   ['x₁ = 4t și x₂ = 30 − 2t (în metri). Când se întâlnesc?',['3 s','6 s','5 s','7,5 s'],2,'4t = 30 − 2t, deci 6t = 30 și t = 5 s.'],
   ['Ce reprezintă panta graficului x(t) în MRU?',['accelerația','viteza','timpul','forța'],1,'Panta este Δx/Δt, adică viteza.']],
m2:[['Un corp pornește din repaus cu a = 2 m/s². Ce viteză are după 5 s?',['5 m/s','2,5 m/s','10 m/s','25 m/s'],2,'v = at = 2·5 = 10 m/s.'],
   ['Ce distanță a parcurs corpul din întrebarea anterioară în cele 5 s?',['10 m','25 m','50 m','12,5 m'],1,'x = at²/2 = 2·25/2 = 25 m.'],
   ['Ce reprezintă aria de sub graficul v(t)?',['accelerația','forța','deplasarea','puterea'],2,'Aria de sub v(t) este deplasarea (cu semn).']],
m3:[['Un corp cade liber din repaus timp de 2 s (g = 9,81 m/s²). De la ce înălțime a căzut?',['9,8 m','19,6 m','39,2 m','4,9 m'],1,'h = gt²/2 = 9,81·4/2 ≈ 19,6 m.'],
   ['La ce unghi, fără rezistența aerului și la același nivel, este bătaia maximă?',['30°','60°','90°','45°'],3,'d = v₀² sin2α / g este maximă când sin2α = 1, adică α = 45°.'],
   ['Într-o aruncare orizontală, componenta orizontală a vitezei:',['crește','scade','rămâne constantă','devine zero în vârf'],2,'Pe orizontală nu acționează nicio forță, deci mișcarea e uniformă.']],
m4:[['O forță de 20 N acționează asupra unui corp de 4 kg, fără frecare. Cât este accelerația?',['5 m/s²','80 m/s²','0,2 m/s²','16 m/s²'],0,'a = F/m = 20/4 = 5 m/s².'],
   ['Ce spune principiul inerției?',['Forța este egală cu masa înmulțită cu accelerația','Un corp rămâne în repaus sau în MRU dacă forța rezultantă e zero','Acțiunea este egală cu reacțiunea','Greutatea depinde de loc'],1,'Fără forță rezultantă, viteza nu se schimbă.'],
   ['Forțele de acțiune și reacțiune:',['se anulează reciproc','acționează pe același corp','sunt egale și opuse, pe corpuri diferite','sunt mereu perpendiculare'],2,'Se aplică pe corpuri diferite, de aceea nu se anulează.']],
m5:[['Un corp alunecă fără frecare pe un plan înclinat cu α = 30°. Cât este accelerația?',['9,81 m/s²','4,9 m/s²','8,5 m/s²','2,5 m/s²'],1,'a = g sinα = 9,81·0,5 ≈ 4,9 m/s².'],
   ['Un corp de 10 kg pe o suprafață orizontală, cu μ = 0,2 (g = 9,81). Cât este frecarea la alunecare?',['2 N','19,6 N','98,1 N','0,2 N'],1,'Ff = μmg = 0,2·10·9,81 ≈ 19,6 N.'],
   ['Când rămâne un corp în repaus pe un plan înclinat?',['tg α ≤ μ','tg α > μ','mereu','niciodată'],0,'Când frecarea maximă μmg cos α acoperă componenta mg sin α.']],
m6:[['Cât este lucrul mecanic al unei forțe de 50 N pe o deplasare de 10 m, în direcția forței?',['5 J','60 J','500 J','50 J'],2,'L = Fd cos0° = 50·10 = 500 J.'],
   ['Un lucru de 1200 J se efectuează în 20 s. Cât este puterea?',['60 W','24 000 W','600 W','6 W'],0,'P = L/t = 1200/20 = 60 W.'],
   ['Cât este lucrul unei forțe perpendiculare pe deplasare?',['maxim','negativ','zero','egal cu F·d'],2,'cos90° = 0, deci L = 0.']],
m7:[['Un pendul fără frecare trece prin punctul cel mai de jos. Ce energie are maximă?',['Potențială','Cinetică','Niciuna','Ambele sunt zero'],1,'Jos, înălțimea e minimă (Ep minimă), deci Ec e maximă.'],
   ['Ce energie potențială are un corp de 2 kg la 5 m înălțime (g = 9,81)?',['10 J','49 J','98,1 J','981 J'],2,'Ep = mgh = 2·9,81·5 = 98,1 J.'],
   ['Un corp cade liber de la 20 m. Ce viteză are la sol (g = 9,81, fără aer)?',['14 m/s','9,9 m/s','196 m/s','19,8 m/s'],3,'v = √(2gh) = √(2·9,81·20) ≈ 19,8 m/s.']],
m8:[['Ce impuls are un corp de 2 kg cu viteza de 3 m/s?',['6 kg·m/s','1,5 kg·m/s','5 kg·m/s','18 kg·m/s'],0,'p = mv = 2·3 = 6 kg·m/s.'],
   ['Într-o ciocnire perfect plastică se conservă:',['doar energia cinetică','nimic','și impulsul, și energia cinetică','doar impulsul'],3,'Impulsul total se conservă mereu într-un sistem izolat. Energia cinetică scade.'],
   ['Ciocnire elastică frontală, mase egale, al doilea corp în repaus. Ce se întâmplă?',['Primul se oprește, al doilea pleacă cu viteza primului','Rămân lipite','Primul revine cu aceeași viteză','Ambele se opresc'],0,'Cu mase egale, la ciocnirea elastică vitezele se schimbă între ele.']],
m9:[['Cât este momentul unei forțe de 20 N cu brațul de 0,5 m?',['40 N·m','10 N·m','0,025 N·m','20,5 N·m'],1,'M = Fd = 20·0,5 = 10 N·m.'],
   ['Pe un balansoar stă un copil de 30 kg la 2 m de pivot. Unde trebuie să stea unul de 60 kg pentru echilibru?',['la 1 m','la 2 m','la 4 m','la 0,5 m'],0,'30·2 = 60·d, deci d = 1 m.'],
   ['Pentru a ridica o greutate mare cu o forță mică, cu o pârghie, forța se aplică:',['la un braț mai scurt','la un braț mai lung','chiar la pivot','nu contează'],1,'F₁d₁ = F₂d₂: forța mică are nevoie de braț mai mare.']],

1:[['Câte molecule conțin 36 g de apă (μ = 18 g/mol)?',['6,02·10²³','1,20·10²⁴','3,01·10²³','2,17·10²⁵'],1,'ν = m/μ = 2 mol, deci N = 2·6,022·10²³ ≈ 1,2·10²⁴ molecule.'],
   ['Cât este 27 °C în kelvin?',['246 K','300 K','27 K','300 °C'],1,'T = t + 273,15, deci aproximativ 300 K.'],
   ['Ce dovedește mișcarea browniană?',['Moleculele se mișcă haotic și continuu','Lichidele sunt incompresibile','Atomii au sarcină electrică','Polenul este un organism viu'],0,'Granulele vizibile sunt lovite neregulat de moleculele invizibile ale lichidului aflate în agitație termică.']],
2:[['Un gaz ideal, la volum constant, își dublează temperatura absolută. Ce face presiunea?',['Se înjumătățește','Rămâne constantă','Se dublează','Crește de 4 ori'],2,'p = νRT/V: la V constant, p este proporțională cu T.'],
   ['De ce depinde energia cinetică medie de translație a unei molecule de gaz ideal?',['De presiune','De temperatura absolută','De volumul vasului','De numărul de molecule'],1,'ε = 3kT/2. Temperatura este o măsură a agitației termice.'],
   ['Care afirmație descrie modelul gazului ideal?',['Moleculele se resping cu forță Coulomb','Moleculele sunt punctiforme și interacționează doar prin ciocniri elastice','Moleculele ocupă tot volumul vasului','Moleculele pierd energie la fiecare ciocnire'],1,'Modelul neglijează volumul propriu al moleculelor și forțele dintre ele, în afara ciocnirilor elastice.']],
3:[['Într-o transformare izotermă volumul gazului se dublează. Ce se întâmplă cu presiunea?',['Se dublează','Se înjumătățește','Rămâne constantă','Crește de 4 ori'],1,'pV = const., deci p scade la jumătate.'],
   ['Într-o transformare izobară T crește de la 300 K la 600 K. Ce face volumul?',['Rămâne același','Se înjumătățește','Se dublează','Crește de 4 ori'],2,'V/T = const., iar T s-a dublat.'],
   ['Un gaz la 27 °C și 3 atm este încălzit izocor la 127 °C. Care e presiunea finală?',['3,0 atm','14,1 atm','0,9 atm','4,0 atm'],3,'p/T = const. cu temperaturi în kelvin: p₂ = 3·400/300 = 4 atm. Rapoartele în °C nu sunt corecte.']],
4:[['Un gaz ideal se destinde adiabatic. Ce se întâmplă cu temperatura lui?',['Crește','Rămâne constantă','Scade','Nu se poate stabili'],2,'Q = 0, deci ΔU = −L. Gazul efectuează lucru mecanic pe seama energiei interne.'],
   ['Un gaz ideal primește 500 J în timpul unei izoterme. Ce lucru mecanic efectuează?',['0 J','500 J','250 J','−500 J'],1,'Izoterma are ΔU = 0, deci Q = L.'],
   ['Un gaz primește 300 J într-o transformare izocoră. Cât este ΔU?',['L = 300 J','ΔU = 0','ΔU = −300 J','ΔU = 300 J'],3,'La volum constant L = 0, deci Q = ΔU.']],
5:[['Se amestecă 1 kg de apă la 80 °C cu 1 kg de apă la 20 °C. Care este temperatura de echilibru (fără pierderi)?',['60 °C','40 °C','50 °C','100 °C'],2,'Capacitățile calorice sunt egale, deci Tₑ este media aritmetică.'],
   ['Ce căldură încălzește 2 kg de apă cu 10 K (c = 4180 J/kg·K)?',['83,6 kJ','8,36 kJ','41,8 kJ','836 kJ'],0,'Q = mcΔT = 2·4180·10 = 83 600 J.'],
   ['Corpul 1 are capacitatea calorică mai mare decât corpul 2. Unde se așază temperatura de echilibru?',['Aproape de T₂','Mai aproape de T₁','Exact la media aritmetică','Nu depinde de capacități'],1,'Tₑ = (C₁T₁ + C₂T₂)/(C₁ + C₂) este mai aproape de temperatura corpului cu C mai mare.']],
6:[['Un motor Carnot lucrează între 600 K și 300 K. Care este randamentul lui?',['100 %','25 %','75 %','50 %'],3,'η = 1 − 300/600 = 0,5.'],
   ['Poate exista un motor termic cu randament 100 %?',['Da, dacă nu are frecări','Da, la temperaturi foarte mari','Nu, principiul II al termodinamicii îl exclude','Doar cu gaze reale'],2,'Fără sursă rece nu se poate transforma integral căldura în lucru mecanic ciclic.'],
   ['Din ce transformări este format ciclul Carnot?',['Două izobare și două izocore','Trei izoterme','Două izoterme și două adiabate','O izotermă, o izobară și o izocoră'],2,'Ciclul Carnot are două izoterme (la T caldă și T rece) și două adiabate.']],
7:[['În timpul topirii gheții la 0 °C, temperatura amestecului:',['crește încet','rămâne constantă','scade','depinde de masă'],1,'Căldura primită rupe legăturile dintre molecule, nu mărește agitația termică.'],
   ['Ce căldură topește 0,5 kg de gheață aflată la 0 °C (λ = 334 kJ/kg)?',['334 kJ','167 kJ','668 kJ','16,7 kJ'],1,'Q = mλ = 0,5·334 = 167 kJ.'],
   ['De ce este palierul de la 100 °C mai lung decât cel de la 0 °C?',['Aburul e mai cald','Apa se încălzește mai greu','λ de vaporizare este mult mai mare decât λ de topire','Presiunea scade'],2,'Vaporizarea cere aproximativ de șapte ori mai multă căldură pe kilogram decât topirea.']],
8:[['Ce se întâmplă cu un lichid care udă pereții unui tub capilar?',['Urcă în tub','Coboară în tub','Rămâne la același nivel','Fierbe'],0,'Pentru θ < 90°, cosθ > 0, deci h > 0.'],
   ['Dublezi raza tubului capilar. Ce face înălțimea de ridicare?',['Se dublează','Rămâne la fel','Crește de 4 ori','Se înjumătățește'],3,'h = 2σcosθ/(ρgr) este invers proporțională cu r.'],
   ['De ce coboară mercurul într-un capilar de sticlă?',['Fiindcă e foarte dens','Unghiul de racordare este mai mare de 90°','Nu are tensiune superficială','Sticla îl respinge electric'],1,'Mercurul nu udă sticla: θ > 90°, deci cosθ < 0 și h < 0.']],
9:[['Dublezi distanța dintre două sarcini. Cum se modifică forța?',['Crește de 2 ori','Scade de 2 ori','Scade de 4 ori','Crește de 4 ori'],2,'F este proporțională cu 1/r².'],
   ['Două sarcini de același semn:',['se atrag','nu interacționează','se resping','se anulează'],2,'Sarcinile de același semn se resping, iar cele de semne contrare se atrag.'],
   ['Ce se întâmplă cu forța dintre două sarcini scufundate în apă (εr ≈ 80)?',['Scade de aproximativ 80 de ori','Crește de 80 de ori','Rămâne aceeași','Devine zero'],0,'F este invers proporțională cu εr.']],
10:[['Între două armături la 100 V aflate la 2 cm distanță, câmpul uniform are intensitatea:',['50 V/m','200 V/m','5000 V/m','0,02 V/m'],2,'E = U/d = 100/0,02 = 5000 V/m.'],
   ['Ce energie câștigă un electron accelerat de o tensiune de 100 V?',['1 eV','100 eV','100 J','1,6 J'],1,'Prin definiție, 1 eV este energia câștigată la 1 V. Aici: 100 eV.'],
   ['Direcția câmpului electric între două plăci încărcate este:',['de la placa negativă la cea pozitivă','paralelă cu plăcile','de la placa pozitivă la cea negativă','aleatoare'],2,'Liniile de câmp pornesc de la sarcina pozitivă și ajung la cea negativă.']],
11:[['Dublezi distanța dintre armăturile unui condensator plan. Ce face capacitatea?',['Se dublează','Se înjumătățește','Rămâne constantă','Crește de 4 ori'],1,'C = ε₀εᵣS/d este invers proporțională cu d.'],
   ['Un condensator de 10 μF este încărcat la 100 V. Ce sarcină are?',['10 mC','0,1 mC','1 mC','1 C'],2,'Q = CU = 10·10⁻⁶·100 = 10⁻³ C.'],
   ['Ce energie înmagazinează condensatorul de 10 μF încărcat la 100 V?',['0,5 J','0,05 J','5 J','1 J'],1,'W = CU²/2 = 10·10⁻⁶·10⁴/2 = 0,05 J.']],
12:[['Prin secțiunea unui conductor trec 12 C în 4 s. Care este intensitatea curentului?',['48 A','8 A','0,33 A','3 A'],3,'I = Δq/Δt = 12/4 = 3 A.'],
   ['Dublezi și lungimea, și secțiunea unui fir. Ce face rezistența?',['Rămâne neschimbată','Se dublează','Se înjumătățește','Crește de 4 ori'],0,'R = ρl/S: raportul l/S nu se modifică.'],
   ['Sensul convențional al curentului este:',['sensul de mișcare al electronilor','de la borna + la borna −','de la borna − la borna +','alternativ'],1,'Sensul convențional este opus mișcării electronilor în metale.']],
13:[['La o tensiune de 12 V un rezistor de 4 Ω este parcurs de curentul:',['48 A','0,33 A','8 A','3 A'],3,'I = U/R = 12/4 = 3 A.'],
   ['Panta graficului I(U) al unui rezistor ohmic este:',['R','1/R','U','R²'],1,'I = U/R, deci panta este 1/R. Panta mai mare înseamnă rezistență mai mică.'],
   ['De ce nu respectă un bec cu filament legea lui Ohm cu R constant?',['Nu are rezistență','Filamentul se încălzește și R crește','Funcționează numai în curent alternativ','Are rezistență negativă'],1,'Rezistivitatea metalelor crește cu temperatura, deci graficul I(U) se curbează.']],
14:[['Două rezistoare de 10 Ω în paralel au rezistența echivalentă:',['20 Ω','10 Ω','5 Ω','2,5 Ω'],2,'R = 10·10/(10 + 10) = 5 Ω.'],
   ['Rezistoarele de 10, 20 și 30 Ω în serie au rezistența echivalentă:',['5,45 Ω','60 Ω','20 Ω','6000 Ω'],1,'În serie se adună: 10 + 20 + 30 = 60 Ω.'],
   ['Ce este același pentru toate rezistoarele legate în serie?',['Tensiunea','Rezistența','Puterea','Intensitatea curentului'],3,'Nu există noduri, deci același curent trece prin toate.']],
15:[['O sursă cu E = 12 V și r = 1 Ω alimentează un rezistor R = 5 Ω. Cât este curentul?',['2 A','2,4 A','12 A','0,5 A'],0,'I = E/(R + r) = 12/6 = 2 A.'],
   ['Pentru aceeași sursă și același circuit, cât este tensiunea la borne?',['12 V','11 V','10 V','2 V'],2,'U = E − Ir = 12 − 2 = 10 V (sau U = IR = 10 V).'],
   ['Când este maximă puterea transmisă consumatorului?',['R = 0','R = r','R foarte mare','R = 2r'],1,'Puterea utilă este maximă la R = r, dar randamentul este atunci doar 50%.']],
16:[['Prima teoremă a lui Kirchhoff exprimă:',['conservarea energiei','conservarea sarcinii electrice','legea lui Ohm','legea lui Joule'],1,'Într-un nod nu se acumulează sarcină: suma curenților care intră egală cu suma celor care ies.'],
   ['Într-un nod intră un curent de 3 A. Pe o ramură iese 1 A. Cât iese pe a treia ramură?',['2 A','4 A','3 A','1 A'],0,'3 = 1 + I, deci I = 2 A.'],
   ['Rezolvând o rețea obții un curent negativ. Ce înseamnă?',['Ai greșit calculul','Sensul real e opus celui ales','Curentul e zero','Ramura e întreruptă'],1,'Semnul minus arată doar că sensul presupus inițial era invers.']],
17:[['Un aparat de 2000 W funcționează 30 min. Ce energie consumă?',['1 kWh','2 kWh','4 kWh','0,5 kWh'],0,'W = P·t = 2 kW · 0,5 h = 1 kWh.'],
   ['Ce căldură degajă un rezistor de 10 Ω parcurs de 2 A timp de 10 s?',['40 J','200 J','400 J','2000 J'],2,'Q = RI²t = 10·4·10 = 400 J.'],
   ['Ce rol are o siguranță fuzibilă?',['Mărește tensiunea','Întrerupe circuitul la supracurent','Crește rezistența circuitului','Stochează energie'],1,'La un curent prea mare siguranța se topește sau declanșează și protejează cablurile.']],
18:[['Un fir lung este parcurs de 5 A. Cât este inducția magnetică la 10 cm de el?',['1 μT','100 μT','0,1 mT','10 μT'],3,'B = μ₀I/(2πd) = 4π·10⁻⁷·5/(2π·0,1) = 10⁻⁵ T.'],
   ['Forța electromagnetică asupra unui conductor este maximă pentru:',['α = 0°','α = 45°','α = 90°','α = 180°'],2,'F = BIl·sinα, iar sinα este maxim la 90°.'],
   ['Unitatea de măsură a inducției magnetice în SI este:',['weberul','tesla','amperul','henry'],1,'Tesla (T). Weberul este unitatea fluxului magnetic.']],
19:[['Ce produce o t.e.m. indusă într-un circuit?',['Un câmp magnetic constant','Variația fluxului magnetic','Prezența unui izolator','Un curent continuu'],1,'e = −ΔΦ/Δt: contează variația fluxului, nu valoarea lui.'],
   ['Ce t.e.m. apare într-o tijă de 0,4 m care se mișcă cu 5 m/s perpendicular pe un câmp de 0,5 T?',['1 V','0,1 V','10 V','2,5 V'],0,'e = Blv = 0,5·0,4·5 = 1 V.'],
   ['Legea lui Lenz spune că sensul curentului indus:',['este mereu orar','se opune cauzei care l-a produs','este mereu invers celui din sursă','nu depinde de nimic'],1,'Efectul indus se opune variației de flux care îl generează.']]
};

/* ---------- Formular ---------- */
var FM=[
 ['mec','Mecanică',[['<i>x</i> = <i>x</i><sub>0</sub> + <i>v</i><sub>0</sub><i>t</i> + <i>at</i><sup>2</sup>/2','legea mișcării'],['<i>v</i> = <i>v</i><sub>0</sub> + <i>at</i>','legea vitezei'],['<i>F</i> = <i>ma</i>, <i>G</i> = <i>mg</i>, <i>F</i><sub>f</sub> = <i>μN</i>','dinamica'],['<i>L</i> = <i>Fd</i>cos<i>α</i>, <i>P</i> = <i>L</i>/<i>t</i>','lucru și putere'],['<i>E</i><sub>c</sub> = <i>mv</i><sup>2</sup>/2, <i>E</i><sub>p</sub> = <i>mgh</i>','energii'],['<i>p</i> = <i>mv</i>, Σ<i>p</i> = const.','impulsul'],['<i>M</i> = <i>Fd</i>, Σ<i>M</i> = 0','momentul forței']]],
 ['heat','Termodinamică: gaze',[['<i>pV</i> = <i>νRT</i>','ecuația de stare'],['<i>p</i><sub>1</sub><i>V</i><sub>1</sub>/<i>T</i><sub>1</sub> = <i>p</i><sub>2</sub><i>V</i><sub>2</sub>/<i>T</i><sub>2</sub>','masă constantă'],['<i>ε</i><sub>c</sub> = 3<i>kT</i>/2','energia cinetică medie'],['<i>ν</i> = <i>m</i>/<i>μ</i> = <i>N</i>/<i>N</i><sub>A</sub>','cantitatea de substanță']]],
 ['heat','Termodinamică: principiile',[['Δ<i>U</i> = <i>νC</i><sub>V</sub>Δ<i>T</i>','energia internă'],['<i>Q</i> = Δ<i>U</i> + <i>L</i>','principiul I'],['<i>C</i><sub>p</sub> = <i>C</i><sub>V</sub> + <i>R</i>','relația Mayer'],['<i>η</i> = 1 − <i>T</i><sub>r</sub>/<i>T</i><sub>c</sub>','randament Carnot'],['<i>Q</i> = <i>mc</i>Δ<i>T</i>, <i>Q</i> = <i>mλ</i>','căldura sensibilă și latentă'],['<i>h</i> = 2<i>σ</i>cos<i>θ</i>/(<i>ρgr</i>)','legea lui Jurin']]],
 ['volt','Electrostatică',[['<i>F</i> = <i>k</i>|<i>q</i><sub>1</sub><i>q</i><sub>2</sub>|/(<i>ε</i><sub>r</sub><i>r</i><sup>2</sup>)','Coulomb'],['<i>E</i> = <i>F</i>/<i>q</i>, <i>U</i> = <i>Ed</i>','câmp uniform'],['<i>C</i> = <i>Q</i>/<i>U</i> = <i>ε</i><sub>0</sub><i>ε</i><sub>r</sub><i>S</i>/<i>d</i>','condensator plan'],['<i>W</i> = <i>CU</i><sup>2</sup>/2','energia condensatorului']]],
 ['volt','Curent continuu',[['<i>I</i> = Δ<i>q</i>/Δ<i>t</i>','intensitatea'],['<i>R</i> = <i>ρl</i>/<i>S</i>','rezistența unui fir'],['<i>I</i> = <i>U</i>/<i>R</i>','Ohm, porțiune'],['<i>I</i> = <i>E</i>/(<i>R</i> + <i>r</i>)','Ohm, circuit întreg'],['<i>R</i><sub>s</sub> = Σ<i>R</i><sub>i</sub>; 1/<i>R</i><sub>p</sub> = Σ1/<i>R</i><sub>i</sub>','grupare'],['Σ<i>I</i> = 0 (nod); Σ<i>E</i> = Σ<i>IR</i> (ochi)','Kirchhoff'],['<i>P</i> = <i>UI</i> = <i>RI</i><sup>2</sup>, <i>Q</i> = <i>RI</i><sup>2</sup><i>t</i>','putere, Joule']]],
 ['volt','Magnetism',[['<i>B</i> = <i>μ</i><sub>0</sub><i>I</i>/(2π<i>d</i>)','fir lung'],['<i>B</i> = <i>μ</i><sub>0</sub><i>NI</i>/<i>l</i>','solenoid'],['<i>F</i> = <i>BIl</i> sin<i>α</i>','forța electromagnetică'],['<i>e</i> = −ΔΦ/Δ<i>t</i>, <i>e</i> = <i>Blv</i>','inducția electromagnetică']]]
];

/* ---------- Progres ---------- */
var KEY='atlas-fizica-x-gata-v2', done={};
try{ var raw=localStorage.getItem(KEY); if(raw)done=JSON.parse(raw)||{}; }catch(e){ done={}; }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(done)); }catch(e){} }
function count(){ var n=0; CH.forEach(function(c){ if(done[c.id])n++; }); return n; }
function chOf(id){ for(var i=0;i<CH.length;i++)if(CH[i].id===id)return CH[i]; return null; }
function titleOf(id){ if(id==='formular')return 'Formularul clasei a X-a'; var c=chOf(id); return c?c.t:''; }

/* ---------- Navigare și pagina de start ---------- */
function link(c){ return '<a href="#'+c.id+'" data-id="'+c.id+'"><span class="n">'+c.l+'</span><span>'+c.t+'</span><span class="dot"></span></a>'; }
function build(){
  var html='',home='';
  ['mec','heat','volt'].forEach(function(d){
    var list=CH.filter(function(c){return c.d===d});
    html+='<div data-domain="'+d+'"><h2>'+DOM[d][0]+'</h2>'+list.map(link).join('')+'</div>';
    home+='<section class="dcard" data-domain="'+d+'"><h2>'+DOM[d][0]+'</h2><p>'+DOM[d][1]+'</p><ol>'+list.map(function(c){return '<li>'+link(c)+'</li>'}).join('')+'</ol></section>';
  });
  html+='<div data-domain="mec"><h2>Mai mult</h2><a href="#formular"><span class="n">∑</span><span>Formularul clasei a X-a</span></a></div>';
  $('#side').innerHTML=html; $('#homeGrid').innerHTML=home;
  $('#formGrid').innerHTML=FM.map(function(g){ return '<article class="fcard" data-domain="'+g[0]+'"><h3>'+g[1]+'</h3>'+g[2].map(function(f){ return '<p class="fm" style="border:0;padding:6px 0;background:none"><span class="mf">'+f[0]+'</span><small>'+f[1]+'</small></p>'; }).join('')+'</article>'; }).join('');
  $('#totalCh').textContent=CH.length;
}
function paintProgress(){
  $$('[data-id]').forEach(function(a){ a.classList.toggle('done',!!done[a.dataset.id]); });
  $('#progTop').textContent=count()+' din '+CH.length;
}

/* ---------- Teste ---------- */
function mountQuiz(el,pageId){
  var Q=QZ[el.dataset.quiz]; if(!Q)return; var ans=[],right=0;
  function render(){
    el.innerHTML='<div class="lab-head"><span class="tag">Test</span><h3>Verifică-te</h3></div>'+Q.map(function(q,i){
      return '<div class="q" data-i="'+i+'"><p>'+(i+1)+'. '+q[0]+'</p>'+q[1].map(function(o,j){ return '<button type="button" class="opt" data-j="'+j+'">'+o+'</button>'; }).join('')+'<p class="exp" hidden></p></div>'; }).join('')+'<div class="score" hidden></div><button type="button" class="btn" hidden>Încearcă din nou</button>';
    ans=[]; right=0;
    $$('.opt',el).forEach(function(b){ b.addEventListener('click',function(){
      var qe=b.closest('.q'),i=+qe.dataset.i,j=+b.dataset.j; if(ans[i]!==undefined)return; ans[i]=j; var ok=j===Q[i][2]; if(ok)right++;
      if(A.chime)A.chime(ok);
      $$('.opt',qe).forEach(function(o,k){ o.disabled=true; if(k===Q[i][2])o.classList.add('ok'); else if(k===j)o.classList.add('no'); });
      var ex=$('.exp',qe); ex.hidden=false; ex.textContent=(ok?'Corect. ':'Nu chiar. ')+Q[i][3];
      var all=0; for(var t=0;t<Q.length;t++)if(ans[t]!==undefined)all++;
      if(all===Q.length){ var sc=$('.score',el); sc.hidden=false; sc.textContent='Scor: '+right+' din '+Q.length; $('.btn',el).hidden=false;
        if(right>=2&&!done[pageId]){ done[pageId]=1; save(); paintProgress(); } }
    }); });
    $('.btn',el).addEventListener('click',render);
  }
  render();
}

/* ---------- Pagini ---------- */
var inited={};
function doShow(){
  var id=(location.hash||'#acasa').slice(1),pg=document.getElementById(id);
  if(!pg||!pg.classList.contains('page')){ id='acasa'; pg=document.getElementById(id); }
  $$('.page').forEach(function(p){ p.hidden=p!==pg; });
  document.body.classList.remove('menu'); $('#menuBtn').setAttribute('aria-expanded','false');
  $('.main').dataset.domain=pg.dataset.domain||'mec';
  $$('#side a').forEach(function(a){ if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  if(!inited[id]){ inited[id]=1;
    $$('.lab[data-lab]',pg).forEach(function(el){ var f=A.labs[el.dataset.lab]; if(f){ try{ f(el); }catch(err){ el.textContent='Simularea nu a putut porni.'; if(window.console)console.error(err); } } });
    $$('.quiz[data-quiz]',pg).forEach(function(q){ mountQuiz(q,id); });
    var pos=ORDER.indexOf(id);
    if(pos>=0&&!pg.querySelector('.pager')){ var p=document.createElement('nav'); p.className='pager'; p.setAttribute('aria-label','Navigare între capitole');
      p.innerHTML=(pos>0?'<a href="#'+ORDER[pos-1]+'"><small>Capitolul anterior</small>'+titleOf(ORDER[pos-1])+'</a>':'<span></span>')+(pos<ORDER.length-1?'<a href="#'+ORDER[pos+1]+'"><small>'+(ORDER[pos+1]==='formular'?'La final':'Capitolul următor')+'</small>'+titleOf(ORDER[pos+1])+'</a>':''); pg.appendChild(p); }
  }
  window.scrollTo(0,0);
  H.redraws.forEach(function(f){ try{ f(); }catch(e){} });
  if(A.onShow)A.onShow(pg);
}
var firstShow=true,calm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function show(){ if(firstShow||calm){ firstShow=false; doShow(); return; } var m=$('.main'); m.classList.add('leaving'); clearTimeout(show.t); show.t=setTimeout(function(){ doShow(); m.classList.remove('leaving'); },170); }

build(); paintProgress();
var rb=$('#resetBtn');
if(rb){ rb.addEventListener('click',function(){ if(rb.dataset.armed!=='1'){ rb.dataset.armed='1'; rb.textContent='Apasă încă o dată ca să confirmi'; setTimeout(function(){ rb.dataset.armed='0'; rb.textContent='Șterge progresul'; },4000); return; } done={}; save(); paintProgress(); rb.dataset.armed='0'; rb.textContent='Progres șters'; }); }
$('#menuBtn').addEventListener('click',function(){ var on=document.body.classList.toggle('menu'); this.setAttribute('aria-expanded',on?'true':'false'); });
window.addEventListener('hashchange',show);
show();
})();
