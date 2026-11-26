# Atlas de Fizică X

Site interactiv pentru fizica din clasa a X-a: **28 de capitole** cu teorie pe scurt, formule, simulări pe care le poți modifica și teste de câte trei întrebări.

- **Mecanică (M1–M9):** mișcarea uniformă și uniform variată, căderea liberă și aruncările, principiile dinamicii, planul înclinat, lucrul mecanic, energia, impulsul și ciocnirile, echilibrul și pârghiile. Se studiază în clasa a IX-a și e inclusă ca recapitulare.
- **Termodinamică (1–8):** gazul ideal, transformările simple, principiile termodinamicii, calorimetrie, ciclul Carnot, stările de agregare, fenomenele capilare.
- **Electricitate și magnetism (9–19):** Coulomb, câmpul electric, condensatorul, legea lui Ohm, grupări de rezistoare, Kirchhoff, efectul Joule, câmpul magnetic, inducția electromagnetică.
- Formular de recapitulare cu toate formulele principale.

Setările (butonul din antet) permit schimbarea temei (bleumarin și bej, alb, verde-turcoaz, negru, lavandă), alegerea unei muzici ambientale din 8 variante, volum separat pentru muzică și pentru sunetele de la butoane. Toate sunetele sunt generate în browser cu Web Audio, deci nu există fișiere audio.

Site-ul e static: HTML, CSS și JavaScript simplu, fără build și fără dependențe. Singura resursă externă este fontul de pe Google Fonts. Dacă nu se încarcă, se folosesc fonturile de rezervă ale sistemului.

## Structura

```
atlas-fizica-x/
├── index.html              pagina, cu toate capitolele
├── css/
│   └── style.css           stilul și temele (variabilele de culoare sunt la început)
├── js/
│   ├── 0-tema-init.js      aplică tema salvată înainte de afișare
│   ├── 1-core-termodinamica.js   funcții comune pentru grafice + simulările de termodinamică
│   ├── 2-electricitate.js  simulările de electricitate și magnetism
│   ├── 3-mecanica.js       simulările de mecanică
│   ├── 4-sunet.js          muzica ambientală și sunetele de interfață
│   ├── 5-interfata.js      teme, panoul de setări, animații la apariție
│   └── 6-aplicatie.js      navigarea, testele, formularul, progresul
├── .nojekyll
└── README.md
```

Ordinea scripturilor din `index.html` contează: fișierele 2, 3, 4 și 5 folosesc funcțiile definite în 1.

## Publicare pe GitHub Pages

1. Creează un repository nou pe GitHub, de exemplu `atlas-fizica-x`.
2. Încarcă conținutul acestui folder în rădăcina repository-ului (`index.html` trebuie să fie la nivelul de sus). Din terminal:
   ```bash
   cd atlas-fizica-x
   git init
   git add .
   git commit -m "Atlas de Fizică X"
   git branch -M main
   git remote add origin https://github.com/NUME-UTILIZATOR/atlas-fizica-x.git
   git push -u origin main
   ```
3. În repository: **Settings → Pages → Build and deployment**. Alege **Deploy from a branch**, branch-ul `main`, folderul `/ (root)`, apoi **Save**.
4. După un minut, site-ul apare la `https://NUME-UTILIZATOR.github.io/atlas-fizica-x/`.

Toate căile sunt relative, deci site-ul merge și într-un subfolder, și pe un domeniu propriu.

## Rulare locală

Deschide `index.html` direct în browser sau pornește un server simplu:

```bash
python3 -m http.server 8000
```

apoi mergi la http://localhost:8000.

## Personalizare

- **Culori și teme:** variabilele de la începutul lui `css/style.css`. Fiecare temă este un bloc `:root[data-skin="..."]`. Pentru o temă nouă, copiază un bloc, schimbă valorile și adaugă-o în lista `SKINS` din `js/5-interfata.js`.
- **Melodii:** funcțiile din obiectul `BUILD` și lista `SOUNDS` din `js/4-sunet.js`.
- **Întrebările din teste și formular:** obiectele `QZ` și `FM` din `js/6-aplicatie.js`.
- **Un capitol nou:** adaugă o secțiune `<section class="page" id="...">` în `index.html`, o intrare în lista `CH` din `js/6-aplicatie.js` și, dacă vrei simulare, o funcție în obiectul `labs`.

## Note

- Progresul (capitolele bifate), tema și setările de sunet se păstrează în `localStorage`, deci rămân doar în browserul respectiv.
- Browserele pornesc sunetul doar după un clic al utilizatorului. De aceea muzica și sunetele de hover încep să se audă abia după prima apăsare pe pagină.
- Notațiile și simulările au scop didactic. Valorile din simulări presupun modele ideale (fără rezistența aerului, fără pierderi de căldură, dacă nu e specificat altfel).
