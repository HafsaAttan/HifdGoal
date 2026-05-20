import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400&family=Noto+Naskh+Arabic:wght@400;500;600&display=swap";
document.head.appendChild(FONT_LINK);

/* ─── CSS Variables & Global Styles ────────────────────────────────────────── */
const GLOBAL_CSS = `
  :root {
    --cream: #F7F3EC;
    --cream-deep: #EFE8DB;
    --ink: #1A1612;
    --ink-soft: #3D342A;
    --ink-muted: #7A6E63;
    --ink-faint: #B8AFA4;
    --gold: #C4933A;
    --gold-light: #E8C97A;
    --gold-faint: rgba(196,147,58,0.12);
    --sage: #4A7C59;
    --sage-light: #D4EAD9;
    --blue: #2A5278;
    --blue-light: #D6E8F5;
    --amber: #8B5E1A;
    --violet: #5A3A7A;
    --violet-light: #E8DFF5;
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  body { background: var(--cream); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes rippleOut {
    to { transform: translate(-50%,-50%) scale(20); opacity: 0; }
  }
  @keyframes completePop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  .stagger-1 { animation: fadeUp 0.5s ease both; }
  .stagger-2 { animation: fadeUp 0.5s 0.07s ease both; }
  .stagger-3 { animation: fadeUp 0.5s 0.14s ease both; }
  .stagger-4 { animation: fadeUp 0.5s 0.21s ease both; }
  .stagger-5 { animation: fadeUp 0.5s 0.28s ease both; }

  .complete-pop { animation: completePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-btn {
    font-family: 'Cormorant SC', serif;
    font-size: 0.58rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 8px 4px;
    transition: color 0.2s;
    border: none;
    background: none;
  }
  .nav-btn:hover { color: var(--gold); }

  .dhikr-card {
    background: #FFFFFF;
    border: 1px solid rgba(196,147,58,0.15);
    border-radius: 3px;
    transition: box-shadow 0.25s, border-color 0.25s;
    cursor: pointer;
  }
  .dhikr-card:hover {
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    border-color: rgba(196,147,58,0.35);
  }

  .pill {
    display: inline-block;
    font-family: 'Cormorant SC', serif;
    font-size: 0.5rem;
    letter-spacing: 0.18em;
    border-radius: 2px;
    padding: 3px 8px;
  }

  .paper::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    z-index: 0;
  }

  .session-divider {
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 0 auto;
  }
`;

const styleEl = document.createElement("style");
styleEl.textContent = GLOBAL_CSS;
document.head.appendChild(styleEl);

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function getTodayKey() { return new Date().toISOString().split("T")[0]; }

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function getDutchDateTime() {
  const now = new Date();
  const datum = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  const tijd  = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  return { datum, tijd };
}

function getHijriDate() {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric", month: "long", year: "numeric"
    }).format(new Date());
  } catch { return ""; }
}

/* ─── Storage ───────────────────────────────────────────────────────────────── */
async function loadStorage() {
  try {
    if (window.storage) {
      const r = await window.storage.get("adkhar-progress-v2");
      return r ? JSON.parse(r.value) : {};
    }
    const raw = localStorage.getItem("adkhar-progress-v2");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

async function saveStorage(data) {
  try {
    if (window.storage) {
      await window.storage.set("adkhar-progress-v2", JSON.stringify(data));
    } else {
      localStorage.setItem("adkhar-progress-v2", JSON.stringify(data));
    }
  } catch {}
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const ADKHAR = {
  ochtend: [
    { id:"o1", arabic:"اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", fonetisch:"Allahu laa ilaaha illaa Huwal-Hayyul-Qayyoom, laa ta'khudhuhu sinatun wa laa nawm...", vertaling:"Allah — er is geen god dan Hij, de Eeuwig Levende, de Zelfbestaande. Sluimer noch slaap overvalt Hem...", aantal:1, categorie:"Koran", beloning:"Wie Ayat Al-Kursi reciteert na elke verplichte salah — niets belet hem het Paradijs te betreden behalve de dood. (An-Nasa'i)" },
    { id:"o2", arabic:"قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ", fonetisch:"Qul huwa Allahu ahad. Allahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan ahad.", vertaling:"Zeg: Hij is Allah, de Enige. Allah, de Eeuwige Toevlucht. Hij heeft niet verwekt, noch is Hij verwekt.", aantal:3, categorie:"Koran", beloning:"Al-Ikhlas is gelijkwaardig aan een derde van de Koran. (Bukhari & Muslim)" },
    { id:"o3", arabic:"قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", fonetisch:"Qul a'oodhu birabbi al-falaq...", vertaling:"Zeg: Ik zoek bescherming bij de Heer van de dageraad. Tegen het kwaad van wat Hij heeft geschapen...", aantal:3, categorie:"Koran", beloning:null },
    { id:"o4", arabic:"قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَـٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", fonetisch:"Qul a'oodhu birabbi an-naas. Maliki an-naas. Ilaahi an-naas...", vertaling:"Zeg: Ik zoek bescherming bij de Heer van de mensen. De Koning van de mensen. De God van de mensen...", aantal:3, categorie:"Koran", beloning:null },
    { id:"o5", arabic:"أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", fonetisch:"Asbahnaa wa asbahal-mulku lillaahi walhamdu lillaahi, laa ilaaha illallaahu wahdahu laa shareeka lahu...", vertaling:"Wij zijn de ochtend ingegaan en het koninkrijk behoort Allah toe. Alle lof is voor Allah...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o6", arabic:"اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", fonetisch:"Allaahumma bika asbahnaa, wa bika amsaynaa, wa bika nahyaa, wa bika namootu wa ilaykan-nushoor.", vertaling:"O Allah, door U zijn wij de ochtend ingegaan, door U de avond, door U leven wij en door U sterven wij — en tot U is de wederopstanding.", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o7", arabic:"اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ", fonetisch:"Allaahumma Anta Rabbee laa ilaaha illaa Anta, khalaqtanee wa anaa 'abduka...", vertaling:"O Allah, U bent mijn Heer. Er is geen god dan U. U hebt mij geschapen en ik ben Uw dienaar...", aantal:1, categorie:"Dhikr", beloning:"Sayyid Al-Istighfaar — Wie dit 's ochtends zegt met overtuiging en vóór de avond sterft, behoort tot de mensen van het Paradijs. (Bukhari)" },
    { id:"o8", arabic:"اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ", fonetisch:"Allaahumma innee asbaHtu ush-hiduka wa ush-hidu Hamalata 'arshika...", vertaling:"O Allah, ik roep U als getuige aan, en de dragers van Uw Troon, en Uw engelen en al Uw schepping...", aantal:4, categorie:"Dhikr", beloning:"Allah bevrijdt daarmee een kwart van de persoon van het Hellevuur. Wie het 4× zegt wordt volledig bevrijd. (Abu Dawud)" },
    { id:"o9", arabic:"اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ", fonetisch:"Allaahumma maa asbaHa bee min ni'matin aw bi-ahadin min khalqika faminka wahdaka laa shareeka laka...", vertaling:"O Allah, welke gunst ik ook ontvang deze ochtend — die is uitsluitend van U. Alle lof is voor U.", aantal:1, categorie:"Dhikr", beloning:"Wie dit 's ochtends zegt heeft de dankbaarheidsplicht van die dag vervuld. (Abu Dawud)" },
    { id:"o10", arabic:"اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي", fonetisch:"Allaahumma 'aafinee fee badanee, Allaahumma 'aafinee fee sam'ee, Allaahumma 'aafinee fee basaree...", vertaling:"O Allah, geef mij gezondheid in mijn lichaam, mijn gehoor en mijn zicht. Er is geen god dan U...", aantal:3, categorie:"Dhikr", beloning:null },
    { id:"o11", arabic:"حَسْبِيَ اللَّهُ لاَ إِلَـهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", fonetisch:"Hasbiyallaahu laa ilaaha illaa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.", vertaling:"Allah is mij genoeg. Er is geen god dan Hij. Op Hem vertrouw ik en Hij is de Heer van de geweldige Troon.", aantal:7, categorie:"Dhikr", beloning:"Allah zal hem genoeg zijn in wat hem zorgen baart. (Abu Dawud)" },
    { id:"o12", arabic:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ", fonetisch:"Allaahumma innee as'alukal-'afwa wal-'aafiyata fid-dunyaa wal-aakhirati...", vertaling:"O Allah, ik vraag U om vergeving en welzijn in dit leven en het hiernamaals...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o13", arabic:"اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ", fonetisch:"Allaahumma 'Aalimal-ghaybi wash-shahaadati faatiras-samaawaati wal-ardhi...", vertaling:"O Allah, Kenner van het onzichtbare en het zichtbare, Schepper van hemelen en aarde...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o14", arabic:"بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ", fonetisch:"Bismillaahil-lathee laa yadhurru ma'as-mihi shay'un fil-ardhi wa laa fis-samaa'i...", vertaling:"In de naam van Allah — waarmee niets in de aarde of de hemel schade kan berokkenen...", aantal:3, categorie:"Dhikr", beloning:"Geen plotseling onheil zal hem treffen. (Abu Dawud, Tirmidhi)" },
    { id:"o15", arabic:"رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", fonetisch:"Radheetu billaahi Rabban, wa bil-Islaami deenan, wa bi-Muhammadin sallallaahu 'alayhi wa sallama nabiyyan.", vertaling:"Ik ben tevreden met Allah als mijn Heer, met de Islam als mijn godsdienst, en met Mohammed ﷺ als mijn profeet.", aantal:3, categorie:"Dhikr", beloning:"Het is een recht op Allah om hem tevreden te stellen op de Dag des Oordeels. (Abu Dawud)" },
    { id:"o16", arabic:"يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", fonetisch:"Yaa Hayyu yaa Qayyoomu birahmatika astagheethu, aslih lee sha'nee kullahu...", vertaling:"O Eeuwig Levende, o Zelfbestaande — door Uw genade zoek ik hulp. Herstel al mijn aangelegenheden...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o17", arabic:"أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ", fonetisch:"Asbahnaa 'alaa fitratil-Islaam, wa 'alaa kalimatil-ikhlaas...", vertaling:"Wij zijn de ochtend ingegaan op de fitrah van de Islam, op het woord van oprechtheid...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o18", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", fonetisch:"Subhaanallaahi wa bihamdihi.", vertaling:"Glorie zij Allah en alle lof is voor Hem.", aantal:100, categorie:"Tasbeeh", beloning:"Wie dit 100× zegt worden zijn zonden vergeven, al waren ze talrijk als het schuim van de zee. (Bukhari & Muslim)" },
    { id:"o19", arabic:"لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", fonetisch:"Laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu wa Huwa 'alaa kulli shay'in Qadeer.", vertaling:"Er is geen god dan Allah alleen, zonder deelgenoot. Aan Hem behoort het koninkrijk en alle lof.", aantal:100, categorie:"Tasbeeh", beloning:"100×: gelijk aan het vrijkopen van 10 slaven, 100 goede daden, beschermd van de shaytan die dag. (Bukhari & Muslim)" },
    { id:"o20", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ", fonetisch:"Subhaanallaahi wa bihamdihi: 'adada khalqihi, wa ridhaa nafsihi, wa zinata 'arshihi, wa midaada kalimaatih.", vertaling:"Glorie zij Allah — zo talrijk als Zijn schepping, zo veel als Zijn tevredenheid, zo zwaar als Zijn Troon, zo oneindig als Zijn woorden.", aantal:3, categorie:"Tasbeeh", beloning:"Zwaarder op de weegschaal dan de eerste tasbeeh. (Muslim)" },
    { id:"o21", arabic:"اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلاً مُتَقَبَّلاً", fonetisch:"Allaahumma innee as'aluka 'ilman naafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.", vertaling:"O Allah, ik vraag U nuttige kennis, goede voorziening en aanvaarde daden.", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"o22", arabic:"أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", fonetisch:"Astaghfirullaaha wa atoobu ilayh.", vertaling:"Ik vraag Allah om vergeving en keer tot Hem terug.", aantal:100, categorie:"Istighfaar", beloning:"De Profeet ﷺ zei dit 100× per dag. (Bukhari & Muslim)" },
    { id:"o23", arabic:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", fonetisch:"A'oothu bikalimaatil-laahit-taammaati min sharri maa khalaq.", vertaling:"Ik zoek bescherming in de volmaakte woorden van Allah tegen het kwaad van wat Hij heeft geschapen.", aantal:3, categorie:"Dhikr", beloning:"Niets zal hem schaden totdat hij vertrekt. (Muslim)" },
    { id:"o24", arabic:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", fonetisch:"Allaahumma Salli wa Sallim 'alaa Nabeeyinnaa Muhammad.", vertaling:"O Allah, zend zegeningen en vrede over onze Profeet Mohammed ﷺ.", aantal:10, categorie:"Salawaat", beloning:"Wie 10× salawaat verzendt: 10 zegeningen van Allah, 10 zonden vergeven, 10 rangen verhoogd. (Muslim)" },
  ],
  avond: [
    { id:"a1", arabic:"اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", fonetisch:"Allahu laa ilaaha illaa Huwal-Hayyul-Qayyoom...", vertaling:"Allah — er is geen god dan Hij, de Eeuwig Levende, de Zelfbestaande...", aantal:1, categorie:"Koran", beloning:"Wie Ayat Al-Kursi reciteert na elke verplichte salah — niets belet hem het Paradijs te betreden behalve de dood." },
    { id:"a2", arabic:"قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ", fonetisch:"Qul huwa Allahu ahad. Allahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan ahad.", vertaling:"Zeg: Hij is Allah, de Enige. Allah, de Eeuwige Toevlucht. Hij heeft niet verwekt, noch is Hij verwekt.", aantal:3, categorie:"Koran", beloning:"Al-Ikhlas is gelijkwaardig aan een derde van de Koran. (Bukhari & Muslim)" },
    { id:"a3", arabic:"قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ", fonetisch:"Qul a'oodhu birabbi al-falaq...", vertaling:"Zeg: Ik zoek bescherming bij de Heer van de dageraad...", aantal:3, categorie:"Koran", beloning:null },
    { id:"a4", arabic:"قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَـٰهِ ٱلنَّاسِ", fonetisch:"Qul a'oodhu birabbi an-naas...", vertaling:"Zeg: Ik zoek bescherming bij de Heer van de mensen...", aantal:3, categorie:"Koran", beloning:null },
    { id:"a5", arabic:"أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", fonetisch:"Amsaynaa wa amsal-mulku lillaahi walhamdu lillaahi...", vertaling:"Wij zijn de avond ingegaan en het koninkrijk behoort Allah toe. Alle lof is voor Allah.", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"a6", arabic:"اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", fonetisch:"Allaahumma bika amsaynaa, wa bika asbahnaa, wa bika nahyaa, wa bika namootu wa ilaykal-maseer.", vertaling:"O Allah, door U zijn wij de avond ingegaan, door U de ochtend, door U leven wij en door U sterven wij.", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"a7", arabic:"اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَـهَ إِلاَّ أَنْتَ", fonetisch:"Allaahumma Anta Rabbee laa ilaaha illaa Anta...", vertaling:"O Allah, U bent mijn Heer. Er is geen god dan U. U hebt mij geschapen en ik ben Uw dienaar...", aantal:1, categorie:"Dhikr", beloning:"Sayyid Al-Istighfaar — Wie dit 's avonds zegt met overtuiging en vóór de ochtend sterft, behoort tot de mensen van het Paradijs. (Bukhari)" },
    { id:"a8", arabic:"اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ", fonetisch:"Allaahumma innee amsaytu ush-hiduka wa ush-hidu Hamalata 'arshika...", vertaling:"O Allah, ik roep U als getuige aan deze avond, en de dragers van Uw Troon, Uw engelen en al Uw schepping...", aantal:4, categorie:"Dhikr", beloning:"Allah bevrijdt daarmee een kwart van de persoon van het Hellevuur per keer. 4× = volledig bevrijd. (Abu Dawud)" },
    { id:"a9", arabic:"اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ", fonetisch:"Allaahumma maa amsaa bee min ni'matin aw bi-ahadin min khalqika faminka...", vertaling:"O Allah, welke gunst ik ook ontvang deze avond — die is uitsluitend van U. Alle lof is voor U.", aantal:1, categorie:"Dhikr", beloning:"Wie dit 's avonds zegt heeft de dankbaarheidsplicht van die nacht vervuld. (Abu Dawud)" },
    { id:"a10", arabic:"اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي", fonetisch:"Allaahumma 'aafinee fee badanee, Allaahumma 'aafinee fee sam'ee...", vertaling:"O Allah, geef mij gezondheid in mijn lichaam, gehoor en zicht. Er is geen god dan U...", aantal:3, categorie:"Dhikr", beloning:null },
    { id:"a11", arabic:"حَسْبِيَ اللَّهُ لاَ إِلَـهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ", fonetisch:"Hasbiyallaahu laa ilaaha illaa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.", vertaling:"Allah is mij genoeg. Er is geen god dan Hij. Op Hem vertrouw ik.", aantal:7, categorie:"Dhikr", beloning:"Allah zal hem genoeg zijn in wat hem zorgen baart. (Abu Dawud)" },
    { id:"a12", arabic:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ", fonetisch:"Allaahumma innee as'alukal-'afwa wal-'aafiyata fid-dunyaa wal-aakhirati...", vertaling:"O Allah, ik vraag U om vergeving en welzijn in dit leven en het hiernamaals...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"a13", arabic:"اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ", fonetisch:"Allaahumma 'Aalimal-ghaybi wash-shahaadati faatiras-samaawaati wal-ardhi...", vertaling:"O Allah, Kenner van het onzichtbare en het zichtbare, Schepper van hemelen en aarde...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"a14", arabic:"بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", fonetisch:"Bismillaahil-lathee laa yadhurru ma'as-mihi shay'un fil-ardhi wa laa fis-samaa'i...", vertaling:"In de naam van Allah — waarmee niets in de aarde of de hemel schade kan berokkenen.", aantal:3, categorie:"Dhikr", beloning:"Geen plotseling onheil zal hem treffen. (Abu Dawud, Tirmidhi)" },
    { id:"a15", arabic:"رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا", fonetisch:"Radheetu billaahi Rabban, wa bil-Islaami deenan, wa bi-Muhammadin sallallaahu 'alayhi wa sallama nabiyyan.", vertaling:"Ik ben tevreden met Allah als mijn Heer, met de Islam als mijn godsdienst, en met Mohammed ﷺ als mijn profeet.", aantal:3, categorie:"Dhikr", beloning:"Het is een recht op Allah om hem tevreden te stellen op de Dag des Oordeels. (Abu Dawud)" },
    { id:"a16", arabic:"يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", fonetisch:"Yaa Hayyu yaa Qayyoomu birahmatika astagheethu...", vertaling:"O Eeuwig Levende, o Zelfbestaande — door Uw genade zoek ik hulp...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"a17", arabic:"أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ", fonetisch:"Amsaynaa 'alaa fitratil-Islaam, wa 'alaa kalimatil-ikhlaas...", vertaling:"Wij zijn de avond ingegaan op de fitrah van de Islam, op het woord van oprechtheid...", aantal:1, categorie:"Dhikr", beloning:null },
    { id:"a18", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", fonetisch:"Subhaanallaahi wa bihamdihi.", vertaling:"Glorie zij Allah en alle lof is voor Hem.", aantal:100, categorie:"Tasbeeh", beloning:"Wie dit 100× zegt worden zijn zonden vergeven, al waren ze talrijk als het schuim van de zee. (Bukhari & Muslim)" },
    { id:"a19", arabic:"لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ", fonetisch:"Laa ilaaha illallaahu wahdahu laa shareeka lahu...", vertaling:"Er is geen god dan Allah alleen, zonder deelgenoot. Aan Hem behoort het koninkrijk en alle lof.", aantal:10, categorie:"Tasbeeh", beloning:"10×: gelijk aan het vrijkopen van een slaaf, 10 goede daden, beschermd van de shaytan. (Tirmidhi)" },
    { id:"a20", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ", fonetisch:"Subhaanallaahi wa bihamdihi: 'adada khalqihi...", vertaling:"Glorie zij Allah — zo talrijk als Zijn schepping, zo zwaar als Zijn Troon, zo oneindig als Zijn woorden.", aantal:3, categorie:"Tasbeeh", beloning:"Zwaarder op de weegschaal dan de gewone tasbeeh. (Muslim)" },
    { id:"a21", arabic:"أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", fonetisch:"Astaghfirullaaha wa atoobu ilayh.", vertaling:"Ik vraag Allah om vergeving en keer tot Hem terug.", aantal:100, categorie:"Istighfaar", beloning:"De Profeet ﷺ zei dit 100× per dag. (Bukhari & Muslim)" },
    { id:"a22", arabic:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", fonetisch:"A'oothu bikalimaatil-laahit-taammaati min sharri maa khalaq.", vertaling:"Ik zoek bescherming in de volmaakte woorden van Allah.", aantal:3, categorie:"Dhikr", beloning:"Niets zal hem schaden totdat hij vertrekt. (Muslim)" },
    { id:"a23", arabic:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", fonetisch:"Allaahumma Salli wa Sallim 'alaa Nabeeyinnaa Muhammad.", vertaling:"O Allah, zend zegeningen en vrede over onze Profeet Mohammed ﷺ.", aantal:10, categorie:"Salawaat", beloning:"Wie 10× salawaat verzendt: 10 zegeningen van Allah, 10 zonden vergeven, 10 rangen verhoogd. (Muslim)" },
  ],
};

/* ─── Category config ──────────────────────────────────────────────────────── */
const CAT = {
  Koran:      { accent:"#C4933A", bg:"#FBF6EC", pill:"#F5E9C8", pillText:"#7A5A18" },
  Dhikr:      { accent:"#2A5278", bg:"#EEF5FC", pill:"#D6E8F5", pillText:"#1E3A5A" },
  Tasbeeh:    { accent:"#5A3A7A", bg:"#F3EEF9", pill:"#E3D9F2", pillText:"#3E2556" },
  Istighfaar: { accent:"#7A4020", bg:"#FBF0E8", pill:"#F5D9C5", pillText:"#5A2E14" },
  Salawaat:   { accent:"#2A6B52", bg:"#EBF7F2", pill:"#C5EAD8", pillText:"#1A4A38" },
};

/* ─── Kalender dagring (Apple Watch stijl) ──────────────────────────────────── */
function DagRing({ date, allData }) {
  const dayKey  = date.toISOString().split("T")[0];
  const todayKey = new Date().toISOString().split("T")[0];
  const dayData  = allData[dayKey] || {};

  const ochPct = ADKHAR.ochtend.filter(d => dayData[`${dayKey}-${d.id}`]).length / ADKHAR.ochtend.length;
  const avPct  = ADKHAR.avond.filter(d => dayData[`${dayKey}-${d.id}`]).length / ADKHAR.avond.length;

  const RO = 17, RI = 10;
  const CO = 2 * Math.PI * RO, CI = 2 * Math.PI * RI;

  const isToday   = dayKey === todayKey;
  const isFuture  = dayKey > todayKey;
  const dagNaam   = date.toLocaleDateString("nl-NL", { weekday: "short" }).slice(0, 2).toUpperCase();
  const dagNum    = date.getDate();

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity: isFuture ? 0.25 : 1 }}>
      <div style={{ position:"relative", width:42, height:42 }}>
        <svg width="42" height="42" style={{ transform:"rotate(-90deg)" }}>
          {/* buitenste ring: ochtend */}
          <circle cx="21" cy="21" r={RO} fill="none" stroke="#C4933A20" strokeWidth="3.5"/>
          <circle cx="21" cy="21" r={RO} fill="none" stroke="#C4933A" strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={CO}
            strokeDashoffset={CO * (1 - ochPct)}
            style={{ transition:"stroke-dashoffset 0.5s ease" }}
          />
          {/* binnenste ring: avond */}
          <circle cx="21" cy="21" r={RI} fill="none" stroke="#2A527820" strokeWidth="3.5"/>
          <circle cx="21" cy="21" r={RI} fill="none" stroke="#2A5278" strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={CI}
            strokeDashoffset={CI * (1 - avPct)}
            style={{ transition:"stroke-dashoffset 0.5s ease" }}
          />
        </svg>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.46rem", letterSpacing:"0.06em",
          color: isToday ? "var(--gold)" : "var(--ink-faint)" }}>{dagNaam}</div>
        <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"0.7rem",
          color: isToday ? "var(--ink)" : "var(--ink-muted)", fontWeight: isToday ? 600 : 400 }}>{dagNum}</div>
      </div>
    </div>
  );
}

/* ─── Ornament ──────────────────────────────────────────────────────────────── */
function Ornament({ color = "#C4933A", opacity = 0.35 }) {
  return (
    <svg width="60" height="10" viewBox="0 0 60 10" fill="none" style={{ display:"block" }}>
      <line x1="0" y1="5" x2="22" y2="5" stroke={color} strokeOpacity={opacity} strokeWidth="0.75"/>
      <circle cx="26" cy="5" r="1.5" fill={color} fillOpacity={opacity}/>
      <circle cx="30" cy="5" r="2.5" fill={color} fillOpacity={opacity}/>
      <circle cx="34" cy="5" r="1.5" fill={color} fillOpacity={opacity}/>
      <line x1="38" y1="5" x2="60" y2="5" stroke={color} strokeOpacity={opacity} strokeWidth="0.75"/>
    </svg>
  );
}

/* ─── Main App ──────────────────────────────────────────────────────────────── */
export default function AdkharApp() {
  const [sessie, setSessie]           = useState("ochtend");
  const [huidigIndex, setHuidigIndex] = useState(0);
  const [teller, setTeller]           = useState(0);
  const [voltooid, setVoltooid]       = useState({});
  const [allData, setAllData]         = useState({});
  const [ripples, setRipples]         = useState([]);
  const [klaar, setKlaar]             = useState(false);
  const [geladen, setGeladen]         = useState(false);
  const [scherm, setScherm]           = useState("home");
  const [beloningOpen, setBeloningOpen] = useState(false);
  const [tijd, setTijd]               = useState(getDutchDateTime());

  const adkharLijst = ADKHAR[sessie];
  const huidig      = adkharLijst[huidigIndex];
  const todayKey    = getTodayKey();

  // Klok elke minuut bijwerken
  useEffect(() => {
    const id = setInterval(() => setTijd(getDutchDateTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    loadStorage().then(d => {
      setAllData(d);
      if (d[todayKey]) setVoltooid(d[todayKey]);
      setGeladen(true);
    });
  }, []);

  const slaOp = useCallback(async (nv) => {
    const data = await loadStorage();
    data[todayKey] = nv;
    const keys = Object.keys(data).sort();
    if (keys.length > 30) delete data[keys[0]];
    await saveStorage(data);
    setAllData(prev => ({ ...prev, [todayKey]: nv }));
  }, [todayKey]);

  const startSessie = (type) => {
    setSessie(type);
    const lijst  = ADKHAR[type];
    const eerste = lijst.findIndex(d => !voltooid[`${todayKey}-${d.id}`]);
    setHuidigIndex(eerste === -1 ? 0 : eerste);
    setTeller(0); setKlaar(false); setBeloningOpen(false); setScherm("sessie");
  };

  const handleTik = useCallback((e) => {
    if (klaar) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id   = Date.now();
    setRipples(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 800);

    vibrate(30);

    const nt = teller + 1;
    setTeller(nt);
    if (nt >= huidig.aantal) {
      const nv = { ...voltooid, [`${todayKey}-${huidig.id}`]: true };
      setVoltooid(nv); slaOp(nv);
      vibrate([60, 30, 60]);
      setTimeout(() => {
        if (huidigIndex < adkharLijst.length - 1) {
          setHuidigIndex(huidigIndex + 1); setTeller(0); setBeloningOpen(false);
        } else {
          setKlaar(true);
          vibrate([80, 40, 80, 40, 120]);
        }
      }, 450);
    }
  }, [teller, huidig, huidigIndex, adkharLijst, voltooid, klaar, todayKey, slaOp]);

  const gaanNaar = (i) => {
    setHuidigIndex(i); setTeller(0); setKlaar(false); setBeloningOpen(false);
  };

  const voltVandaag = (type) =>
    ADKHAR[type].filter(d => voltooid[`${todayKey}-${d.id}`]).length;

  // Laatste 7 dagen voor kalender
  const kalenderDagen = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  /* ── Loading ── */
  if (!geladen) return (
    <div style={{ minHeight:"100vh", background:"var(--cream)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"0.8rem", color:"var(--ink-faint)", letterSpacing:"0.2em" }}>laden…</div>
    </div>
  );

  /* ═══════════════════════ HOME ═══════════════════════════════════════════ */
  if (scherm === "home") {
    const ochV = voltVandaag("ochtend"), avV = voltVandaag("avond");
    const hijri = getHijriDate();

    const sessions = [
      { type:"ochtend", arabisch:"أذكار الصباح", label:"Ochtendadhkaar", sub:"Na Fajr · tot zonsopgang", volt:ochV, totaal:ADKHAR.ochtend.length, accent:"#C4933A" },
      { type:"avond",   arabisch:"أذكار المساء",  label:"Avondadhkaar",   sub:"Na Asr · tot Maghrib",   volt:avV,  totaal:ADKHAR.avond.length,   accent:"#2A5278" },
    ];

    return (
      <div className="paper" style={{ minHeight:"100vh", background:"var(--cream)", fontFamily:"'Cormorant Garamond', Georgia, serif", display:"flex", flexDirection:"column" }}>

        {/* ── Top bar ── */}
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"44px 28px 0", animation:"fadeIn 0.6s ease" }}>
          <button className="nav-btn" style={{ fontSize:"0.54rem" }} onClick={() => setScherm("overzicht")}>Overzicht</button>
        </div>

        {/* ── Begroeting ── */}
        <div style={{ padding:"24px 28px 0", animation:"fadeUp 0.6s ease both" }}>
          <div style={{ fontFamily:"'Noto Naskh Arabic', serif", fontSize:"2rem", color:"var(--ink)", direction:"rtl", textAlign:"right", lineHeight:1.3 }}>
            السلام عليكم
          </div>
          <div style={{ marginTop:6, fontSize:"1.5rem", color:"var(--ink-soft)", fontWeight:300 }}>Hafsa</div>
          <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:2 }}>
            <div style={{ fontSize:"0.78rem", color:"var(--ink-muted)", fontStyle:"italic" }}>
              {tijd.datum} · {tijd.tijd}
            </div>
            {hijri && (
              <div style={{ fontFamily:"'Noto Naskh Arabic', serif", fontSize:"0.78rem", color:"var(--ink-faint)", direction:"rtl", textAlign:"right" }}>
                {hijri}
              </div>
            )}
          </div>
          <div style={{ marginTop:14 }}>
            <Ornament color="#C4933A" opacity={0.4}/>
          </div>
        </div>

        {/* ── Kalenderstrip ── */}
        <div style={{ padding:"24px 28px 0", animation:"fadeUp 0.6s 0.08s ease both" }}>
          <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.52rem", color:"var(--ink-faint)", letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:14 }}>
            Voortgang · 7 dagen
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            {kalenderDagen.map((d, i) => (
              <DagRing key={i} date={d} allData={allData} />
            ))}
          </div>
          {/* Legenda */}
          <div style={{ display:"flex", gap:16, marginTop:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#C4933A" }}/>
              <span style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.48rem", color:"var(--ink-faint)", letterSpacing:"0.1em" }}>Ochtend</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#2A5278" }}/>
              <span style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.48rem", color:"var(--ink-faint)", letterSpacing:"0.1em" }}>Avond</span>
            </div>
          </div>
        </div>

        {/* ── Sessiekaarten ── */}
        <div style={{ padding:"32px 0 0" }}>
          {sessions.map((s, i) => {
            const pct  = s.volt / s.totaal;
            const done = s.volt === s.totaal;
            return (
              <div
                key={s.type}
                onClick={() => startSessie(s.type)}
                style={{
                  borderTop: i === 0 ? "1px solid var(--cream-deep)" : "none",
                  borderBottom: "1px solid var(--cream-deep)",
                  padding:"22px 28px",
                  cursor:"pointer",
                  display:"flex", alignItems:"center", gap:20,
                  transition:"background 0.2s",
                  animation:`fadeUp 0.55s ${0.15 + i*0.1}s ease both`,
                  background:"transparent",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.6)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ flexShrink:0, position:"relative", width:52, height:52 }}>
                  <svg width="52" height="52" style={{ transform:"rotate(-90deg)" }}>
                    <circle cx="26" cy="26" r="22" fill="none" stroke={s.accent+"18"} strokeWidth="3"/>
                    <circle cx="26" cy="26" r="22" fill="none" stroke={s.accent} strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2*Math.PI*22}
                      strokeDashoffset={2*Math.PI*22*(1-pct)}
                      style={{ transition:"stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {done
                      ? <span style={{ fontSize:"0.85rem", color:s.accent }}>✓</span>
                      : <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"0.72rem", color:s.accent, fontWeight:500 }}>{Math.round(pct*100)}%</span>
                    }
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Noto Naskh Arabic', serif", fontSize:"1.1rem", color:"var(--ink-soft)", direction:"rtl", marginBottom:4 }}>{s.arabisch}</div>
                  <div style={{ fontSize:"0.9rem", color:"var(--ink)", fontWeight:500, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.54rem", color:"var(--ink-faint)", letterSpacing:"0.08em" }}>{s.sub} · {s.volt}/{s.totaal}</div>
                </div>
                <div style={{ flexShrink:0, fontFamily:"'Cormorant SC', serif", fontSize:"0.7rem", color:"var(--ink-faint)" }}>→</div>
              </div>
            );
          })}
        </div>

        <div style={{ paddingBottom:56 }}/>
      </div>
    );
  }

  /* ═══════════════════════ OVERZICHT ══════════════════════════════════════ */
  if (scherm === "overzicht") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--cream)", fontFamily:"'Cormorant Garamond', Georgia, serif" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 24px 28px" }}>
          <button className="nav-btn" onClick={() => setScherm("home")}>← Terug</button>
          <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.65rem", color:"var(--ink-soft)", letterSpacing:"0.2em", textTransform:"uppercase" }}>Overzicht Vandaag</div>
          <div style={{ width:60 }}/>
        </div>

        {["ochtend", "avond"].map((type) => (
          <div key={type} style={{ padding:"0 20px", maxWidth:440, margin:"0 auto 44px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, padding:"0 4px" }}>
              <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.6rem", color:"var(--ink-muted)", letterSpacing:"0.25em", textTransform:"uppercase" }}>
                {type === "ochtend" ? "🌅 Ochtend" : "🌙 Avond"}
              </div>
              <div style={{ flex:1, height:1, background:"linear-gradient(90deg, var(--cream-deep), transparent)" }}/>
            </div>
            {ADKHAR[type].map((d, i) => {
              const isVolt = voltooid[`${todayKey}-${d.id}`];
              const c = CAT[d.categorie] || CAT.Dhikr;
              return (
                <div
                  key={d.id}
                  className="dhikr-card"
                  onClick={() => { setSessie(type); gaanNaar(i); setScherm("sessie"); }}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"13px 16px", marginBottom:5, opacity: isVolt ? 0.72 : 1 }}
                >
                  <div style={{ width:18, height:18, borderRadius:"50%", border:`1.5px solid ${isVolt ? "#4A7C59" : c.accent}40`, background: isVolt ? "#4A7C59" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.55rem", color:"white", flexShrink:0, marginTop:2 }}>
                    {isVolt ? "✓" : ""}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Noto Naskh Arabic', serif", fontSize:"0.95rem", color: isVolt ? "var(--ink-muted)" : "var(--ink-soft)", marginBottom:4, direction:"rtl", textAlign:"right", lineHeight:1.6 }}>
                      {d.arabic.length > 60 ? d.arabic.slice(0,60)+"…" : d.arabic}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="pill" style={{ background:c.pill, color:c.pillText }}>{d.categorie}</span>
                      <span style={{ fontSize:"0.6rem", color:"var(--ink-faint)", fontFamily:"'Cormorant SC', serif" }}>{d.aantal}×</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  /* ═══════════════════════ SESSIE ═════════════════════════════════════════ */
  const voltAantal = adkharLijst.filter(d => voltooid[`${todayKey}-${d.id}`]).length;
  const isVolt     = voltooid[`${todayKey}-${huidig.id}`];
  const c          = CAT[huidig.categorie] || CAT.Dhikr;
  const restant    = Math.max(0, huidig.aantal - teller);
  const ringPct    = Math.min(teller / huidig.aantal, 1);
  const R = 40, CIRC = 2 * Math.PI * R;

  return (
    <div style={{ minHeight:"100vh", background:"var(--cream)", display:"flex", flexDirection:"column", fontFamily:"'Cormorant Garamond', Georgia, serif", userSelect:"none" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"50px 24px 0" }}>
        <button className="nav-btn" onClick={() => setScherm("home")}>← Home</button>
        <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.6rem", color:"var(--ink-muted)", letterSpacing:"0.18em" }}>
          {sessie === "ochtend" ? "🌅" : "🌙"} {huidigIndex + 1} / {adkharLijst.length}
        </div>
        <button className="nav-btn" onClick={() => setScherm("overzicht")}>Lijst</button>
      </div>

      <div style={{ height:2, background:"var(--cream-deep)", margin:"14px 24px 0", borderRadius:1 }}>
        <div style={{ height:"100%", width:`${(voltAantal/adkharLijst.length)*100}%`, background:`linear-gradient(90deg, ${c.accent}88, ${c.accent})`, borderRadius:1, transition:"width 0.5s ease" }}/>
      </div>

      {klaar ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 36px", textAlign:"center" }}>
          <div className="complete-pop" style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg, #D4EAD9, #B8E0C2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", marginBottom:28, boxShadow:"0 8px 32px rgba(74,124,89,0.2)" }}>
            ✓
          </div>
          <div style={{ fontFamily:"'Noto Naskh Arabic', serif", fontSize:"2rem", color:"var(--ink)", marginBottom:10, direction:"rtl" }}>بارك الله فيك</div>
          <div className="session-divider" style={{ marginBottom:18 }}/>
          <div style={{ fontSize:"1rem", color:"var(--ink-soft)", marginBottom:8 }}>Alle {sessie}adhkaar voltooid</div>
          <div style={{ fontSize:"0.8rem", color:"var(--ink-muted)", fontStyle:"italic", marginBottom:52 }}>Moge Allah het van jou aanvaarden</div>
          <button
            onClick={() => setScherm("home")}
            style={{ padding:"14px 40px", background:"var(--ink)", border:"none", borderRadius:2, color:"var(--cream)", fontFamily:"'Cormorant SC', serif", fontSize:"0.62rem", letterSpacing:"0.22em", textTransform:"uppercase", cursor:"pointer" }}
          >
            Terug naar home
          </button>
        </div>
      ) : (
        <>
          <div className="stagger-1" style={{ padding:"22px 26px 0" }}>
            <span className="pill" style={{ background:c.pill, color:c.pillText }}>{huidig.categorie}</span>
          </div>

          <div className="stagger-2" style={{ padding:"18px 26px 0", direction:"rtl" }}>
            <div style={{ fontFamily:"'Noto Naskh Arabic', serif", fontSize:"1.8rem", lineHeight:2.1, color:"var(--ink)", textAlign:"right" }}>
              {huidig.arabic}
            </div>
          </div>

          <div className="stagger-3" style={{ padding:"14px 26px 0" }}>
            <div style={{ height:1, background:`linear-gradient(90deg, ${c.accent}30, transparent)` }}/>
          </div>

          <div className="stagger-3" style={{ padding:"12px 26px 0" }}>
            <div style={{ fontSize:"0.82rem", color:"var(--ink-muted)", fontStyle:"italic", lineHeight:1.85 }}>
              {huidig.fonetisch}
            </div>
          </div>

          <div className="stagger-4" style={{ padding:"8px 26px 0" }}>
            <div style={{ fontSize:"0.82rem", color:"var(--ink-faint)", lineHeight:1.9 }}>
              {huidig.vertaling}
            </div>
          </div>

          {huidig.beloning && (
            <div className="stagger-5" style={{ padding:"16px 26px 0" }}>
              <button
                onClick={() => setBeloningOpen(!beloningOpen)}
                style={{ background:"none", border:`1px solid ${c.accent}30`, borderRadius:2, padding:"6px 14px", display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"'Cormorant SC', serif", fontSize:"0.54rem", color:c.accent, letterSpacing:"0.16em", textTransform:"uppercase" }}
              >
                ✦ {beloningOpen ? "Verberg beloning" : "Beloning"}
              </button>
              {beloningOpen && (
                <div style={{ marginTop:10, padding:"14px 18px", background:c.bg, border:`1px solid ${c.accent}20`, borderRadius:2, fontSize:"0.8rem", color:"var(--ink-soft)", lineHeight:1.8, fontStyle:"italic", animation:"fadeUp 0.3s ease" }}>
                  {huidig.beloning}
                </div>
              )}
            </div>
          )}

          <div style={{ flex:1, minHeight:16 }}/>

          {/* Tikzone */}
          <div
            onClick={handleTik}
            style={{
              position:"relative", margin:"0 20px 20px", borderRadius:4,
              background: isVolt ? "linear-gradient(160deg, #EBF7F2, #F5FBF7)" : "linear-gradient(160deg, #FFFFFF, #FDFBF7)",
              border:`1px solid ${isVolt ? "#86EFAC55" : c.accent+"20"}`,
              padding:"32px 24px", cursor:"pointer", overflow:"hidden",
              display:"flex", flexDirection:"column", alignItems:"center", gap:16,
              boxShadow:"0 2px 16px rgba(0,0,0,0.05)",
              WebkitTapHighlightColor:"transparent",
            }}
          >
            {ripples.map(r => (
              <div key={r.id} style={{ position:"absolute", left:r.x, top:r.y, width:12, height:12, background:c.accent+"25", borderRadius:"50%", transform:"translate(-50%,-50%) scale(0)", animation:"rippleOut 0.8s ease-out forwards", pointerEvents:"none" }}/>
            ))}

            <div style={{ position:"relative", width:96, height:96 }}>
              <svg width="96" height="96" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="48" cy="48" r={R} fill="none" stroke={c.accent+"18"} strokeWidth="4"/>
                <circle cx="48" cy="48" r={R} fill="none" stroke={c.accent} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - ringPct)}
                  style={{ transition:"stroke-dashoffset 0.18s ease", filter:`drop-shadow(0 0 4px ${c.accent}55)` }}
                />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                {isVolt ? (
                  <div style={{ fontSize:"1.6rem", color:"var(--sage)" }}>✓</div>
                ) : (
                  <>
                    <div style={{ fontSize:"2rem", fontWeight:300, color:c.accent, lineHeight:1, fontFamily:"'Cormorant Garamond', serif" }}>{restant}</div>
                    <div style={{ fontSize:"0.5rem", color:"var(--ink-faint)", letterSpacing:"0.1em", fontFamily:"'Cormorant SC', serif", marginTop:1 }}>
                      {restant === huidig.aantal ? `${huidig.aantal}×` : "resterend"}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.58rem", color:"var(--ink-faint)", letterSpacing:"0.18em", textTransform:"uppercase" }}>
              {isVolt ? "Voltooid · tik om verder" : `${teller} / ${huidig.aantal} · tik om te tellen`}
            </div>
          </div>

          {/* Navigatie */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 26px 48px" }}>
            <button
              className="nav-btn"
              onClick={() => huidigIndex > 0 && gaanNaar(huidigIndex - 1)}
              style={{ opacity: huidigIndex > 0 ? 1 : 0.3, cursor: huidigIndex > 0 ? "pointer" : "default" }}
            >← Vorige</button>

            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
              {adkharLijst.slice(Math.max(0, huidigIndex-2), Math.min(adkharLijst.length, huidigIndex+3)).map((d, i) => {
                const absI = Math.max(0, huidigIndex-2) + i;
                const isActive = absI === huidigIndex;
                const isDone   = voltooid[`${todayKey}-${d.id}`];
                return (
                  <div key={d.id} onClick={() => gaanNaar(absI)} style={{
                    width: isActive ? 18 : 6, height:6, borderRadius:3,
                    background: isActive ? c.accent : isDone ? c.accent+"55" : "var(--cream-deep)",
                    cursor:"pointer", transition:"all 0.3s ease",
                  }}/>
                );
              })}
            </div>

            <button
              className="nav-btn"
              onClick={() => huidigIndex < adkharLijst.length - 1 && gaanNaar(huidigIndex + 1)}
              style={{ opacity: huidigIndex < adkharLijst.length - 1 ? 1 : 0.3, cursor: huidigIndex < adkharLijst.length - 1 ? "pointer" : "default" }}
            >Volgende →</button>
          </div>
        </>
      )}
    </div>
  );
}
