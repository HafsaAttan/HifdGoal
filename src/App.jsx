import React, { useState, useEffect, useCallback, useRef } from "react";

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400&family=Noto+Naskh+Arabic:wght@400;500;600&display=swap";
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
    --card-bg: #FFFFFF;
    --border: rgba(196,147,58,0.15);
    --pad: 26px;
  }

  body.dark {
    --cream: #1A1712;
    --cream-deep: #252018;
    --ink: #F0EAE0;
    --ink-soft: #D4CCB8;
    --ink-muted: #9A8E7E;
    --ink-faint: #5A5048;
    --gold-faint: rgba(196,147,58,0.18);
    --card-bg: #222018;
    --border: rgba(196,147,58,0.2);
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  body { background: var(--cream); transition: background 0.3s ease; }

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
  @keyframes orbPulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--gold-faint), 0 8px 32px rgba(196,147,58,0.18); }
    50%       { box-shadow: 0 0 0 16px transparent, 0 8px 40px rgba(196,147,58,0.26); }
  }
  @keyframes completePop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes streakPop {
    0%   { transform: scale(0.85); opacity: 0; }
    70%  { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }

  .orb-idle { animation: orbPulse 3s ease-in-out infinite; }
  .complete-pop { animation: completePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
  .streak-pop { animation: streakPop 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-btn {
    font-family: 'Cormorant SC', serif;
    font-size: 0.66rem;
    letter-spacing: 0.2em;
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
    background: var(--card-bg);
    border: 1px solid var(--border);
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

  /* Arabische tekst — Amiri leest mooier bij lange passages */
  .arabic { font-family: 'Amiri', 'Noto Naskh Arabic', serif; }

  /* Paper texture overlay */
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

  /* Dark mode toggle */
  .dark-toggle {
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: var(--cream-deep);
    border: 1px solid var(--border);
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0;
  }
  .dark-toggle.on { background: #3A2E1A; border-color: #C4933A55; }
  .dark-toggle::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--ink-muted);
    transition: transform 0.25s, background 0.25s;
  }
  .dark-toggle.on::after { transform: translateX(16px); background: #C4933A; }
`;

const styleEl = document.createElement("style");
styleEl.textContent = GLOBAL_CSS;
document.head.appendChild(styleEl);

/* ─── Data — volledige originele teksten ─────────────────────────────────── */
const ADKHAR = {
  ochtend: [
    {
      id: "o1",
      arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      fonetisch: "Allahu laa ilaaha illaa Huwal-Hayyul-Qayyoom. Laa ta'khudhuhu sinatun wa laa nawm. Lahu maa fis-samaawaati wa maa fil-ardh. Man dhal-ladhee yashfa'u 'indahu illaa bi-idhnih. Ya'lamu maa bayna aydeehim wa maa khalfahum. Wa laa yuheetoona bishay'im-min 'ilmihi illaa bimaa shaa'. Wasi'a kursiyyuhus-samaawaati wal-ardh. Wa laa ya'ooduhu hifdhuhuma. Wa Huwal-'Aliyyul-'Adheem.",
      vertaling: "Allah — er is geen god dan Hij, de Eeuwig Levende, de Zelfbestaande. Sluimer noch slaap overvalt Hem. Aan Hem behoort wat in de hemelen en wat op aarde is. Wie is er die bij Hem kan bemiddelen anders dan met Zijn toestemming? Hij weet wat vóór hen en wat achter hen is. En zij omvatten niets van Zijn kennis, behalve wat Hij wil. Zijn Troon strekt zich uit over de hemelen en de aarde. Het bewaken daarvan valt Hem niet zwaar. En Hij is de Verhevene, de Geweldige.",
      aantal: 1, categorie: "Koran",
      beloning: "Wie Ayat Al-Kursi reciteert na elke verplichte salah — niets belet hem het Paradijs te betreden behalve de dood. (An-Nasa'i)",
    },
    {
      id: "o2",
      arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
      fonetisch: "Qul huwa Allahu ahad. Allahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan ahad.",
      vertaling: "Zeg: Hij is Allah, de Enige. Allah, de Eeuwige Toevlucht. Hij heeft niet verwekt, noch is Hij verwekt. En niemand is Hem gelijkwaardig.",
      aantal: 3, categorie: "Koran",
      beloning: "Al-Ikhlas is gelijkwaardig aan een derde van de Koran. (Bukhari & Muslim)",
    },
    {
      id: "o3",
      arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      fonetisch: "Qul a'oodhu birabbi al-falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin idha waqab. Wa min sharrin-naffaathaati fil-'uqad. Wa min sharri haasidin idha hasad.",
      vertaling: "Zeg: Ik zoek bescherming bij de Heer van de dageraad. Tegen het kwaad van wat Hij heeft geschapen. Tegen het kwaad van de duisternis als zij valt. Tegen het kwaad van hen die op knopen blazen. Tegen het kwaad van een afgunstige als hij afgunst koestert.",
      aantal: 3, categorie: "Koran", beloning: null,
    },
    {
      id: "o4",
      arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَـٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
      fonetisch: "Qul a'oodhu birabbi an-naas. Maliki an-naas. Ilaahi an-naas. Min sharril-waswaasil-khannaas. Alladhee yuwaswisu fee sudoorin-naas. Minal-jinnati wan-naas.",
      vertaling: "Zeg: Ik zoek bescherming bij de Heer van de mensen. De Koning van de mensen. De God van de mensen. Tegen het kwaad van de influisteraar die zich terugtrekt. Die influistert in de harten van de mensen. Uit de djinn en de mensen.",
      aantal: 3, categorie: "Koran", beloning: null,
    },
    {
      id: "o5",
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      fonetisch: "Asbahnaa wa asbahal-mulku lillaahi walhamdu lillaahi, laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu wa Huwa 'alaa kulli shay'in Qadeer. Rabbi as'aluka khayra maa fee haadhal-yawmi wa khayra maa ba'dahu, wa a'oothu bika min sharri maa fee haadhal-yawmi wa sharri maa ba'dahu. Rabbi a'oothu bika minal-kasali wa soo'il-kibari. Rabbi a'oothu bika min 'adhaabin fin-naari wa 'adhaabin fil-qabri.",
      vertaling: "Wij zijn de ochtend ingegaan en het koninkrijk behoort Allah toe. Alle lof is voor Allah. Er is geen god dan Allah alleen, zonder deelgenoot. Aan Hem behoort het koninkrijk en alle lof, en Hij is over alles Almachtig. Mijn Heer, ik vraag U het goede van deze dag en het goede van wat erna komt, en ik zoek bescherming bij U tegen het kwaad van deze dag en het kwaad van wat erna komt. Mijn Heer, ik zoek bescherming bij U tegen luiheid en de ellende van de ouderdom. Mijn Heer, ik zoek bescherming bij U tegen een bestraffing in het Vuur en een bestraffing in het graf.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o6",
      arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
      fonetisch: "Allaahumma bika asbahnaa, wa bika amsaynaa, wa bika nahyaa, wa bika namootu wa ilaykan-nushoor.",
      vertaling: "O Allah, door U zijn wij de ochtend ingegaan, door U de avond, door U leven wij en door U sterven wij — en tot U is de wederopstanding.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o7",
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
      fonetisch: "Allaahumma Anta Rabbee laa ilaaha illaa Anta, khalaqtanee wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastataTtu, a'oothu bika min sharri maa sana'tu, aboo'u laka bini'matika 'alayya, wa aboo'u bithanbee faghfir lee fa'innahu laa yaghfirudhdhunuba illaa Anta.",
      vertaling: "O Allah, U bent mijn Heer. Er is geen god dan U. U hebt mij geschapen en ik ben Uw dienaar. Ik houd mij aan mijn verbond en belofte aan U zo goed ik kan. Ik zoek bescherming bij U tegen het kwaad van wat ik heb gedaan. Ik erken Uw gunsten aan mij en ik erken mijn zonde — vergeef mij, want niemand vergeeft zonden behalve U.",
      aantal: 1, categorie: "Dhikr",
      beloning: "Wie dit 's ochtends zegt met overtuiging en vóór de avond sterft, behoort tot de mensen van het Paradijs. Evenzo 's avonds. (Bukhari) — Dit is Sayyid Al-Istighfaar.",
    },
    {
      id: "o8",
      arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
      fonetisch: "Allaahumma innee asbaHtu ush-hiduka wa ush-hidu Hamalata 'arshika, wa malaa'ikataka wa jamee'a khalqika, annaka Antal-laahu laa ilaaha illaa Anta wahdaka laa shareeka laka, wa anna Muhammadan 'abduka wa Rasooluka.",
      vertaling: "O Allah, ik roep U als getuige aan, en de dragers van Uw Troon, en Uw engelen en al Uw schepping: dat U Allah bent, er is geen god dan U alleen, zonder deelgenoot — en dat Mohammed Uw dienaar en Boodschapper is.",
      aantal: 4, categorie: "Dhikr",
      beloning: "Allah bevrijdt daarmee een kwart van de persoon van het Hellevuur. Wie het 4× zegt wordt volledig bevrijd. (Abu Dawud)",
    },
    {
      id: "o9",
      arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
      fonetisch: "Allaahumma maa asbaHa bee min ni'matin aw bi-ahadin min khalqika faminka wahdaka laa shareeka laka, falakal-hamdu wa lakashshukru.",
      vertaling: "O Allah, welke gunst ik ook ontvang deze ochtend, of enig deel van Uw schepping — die is uitsluitend van U, zonder deelgenoot. Alle lof is voor U en alle dank.",
      aantal: 1, categorie: "Dhikr",
      beloning: "Wie dit 's ochtends zegt heeft de dankbaarheidsplicht van die dag vervuld. (Abu Dawud)",
    },
    {
      id: "o10",
      arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَـهَ إِلاَّ أَنْتَ",
      fonetisch: "Allaahumma 'aafinee fee badanee, Allaahumma 'aafinee fee sam'ee, Allaahumma 'aafinee fee basaree, laa ilaaha illaa Anta. Allaahumma innee a'oothu bika minal-kufri, walfaqri, wa a'oothu bika min 'adhaabil-qabri, laa ilaaha illaa Anta.",
      vertaling: "O Allah, geef mij gezondheid in mijn lichaam. O Allah, geef mij gezondheid in mijn gehoor. O Allah, geef mij gezondheid in mijn zicht. Er is geen god dan U. O Allah, ik zoek bescherming bij U tegen ongeloof en armoede, en tegen de bestraffing van het graf. Er is geen god dan U.",
      aantal: 3, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o11",
      arabic: "حَسْبِيَ اللَّهُ لاَ إِلَـهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      fonetisch: "Hasbiyallaahu laa ilaaha illaa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.",
      vertaling: "Allah is mij genoeg. Er is geen god dan Hij. Op Hem vertrouw ik en Hij is de Heer van de geweldige Troon.",
      aantal: 7, categorie: "Dhikr",
      beloning: "Allah zal hem genoeg zijn in wat hem zorgen baart. (Abu Dawud, Ibn As-Sunni)",
    },
    {
      id: "o12",
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      fonetisch: "Allaahumma innee as'alukal-'afwa wal-'aafiyata fid-dunyaa wal-aakhirah. Allaahumma innee as'alukal-'afwa wal-'aafiyata fee deenee wa dunyaaya wa ahlee wa maalee. Allaahum-mastur 'awraatee wa aamin raw'aatee. Allaahum-mahfadhnee min bayni yadayya wa min khalfee wa 'an yameenee wa 'an shimaalee wa min fawqee, wa a'oothu bi'adhamatika an ughtaala min tahtee.",
      vertaling: "O Allah, ik vraag U om vergiffenis en welzijn in dit leven en het hiernamaals. O Allah, ik vraag U om vergiffenis en welzijn in mijn geloof, mijn wereldse leven, mijn familie en mijn bezit. O Allah, bedek mijn gebreken en stel mijn angsten gerust. O Allah, bescherm mij van vóór mij, van achter mij, van mijn rechterzijde, mijn linkerzijde en van boven mij, en ik zoek bescherming in Uw Grootheid dat ik van onderen onverhoeds vernietigd word.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o13",
      arabic: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ",
      fonetisch: "Allaahumma 'Aalimal-ghaybi wash-shahaadati faatiras-samaawaati wal-ardhi, Rabba kulli shay'in wa maleekahu, ash-hadu an laa ilaaha illaa Anta, a'oothu bika min sharri nafsee, wa min sharrish-shaytaani wa shirkihi, wa an aqtarifa 'alaa nafsee soo'an aw ajurrahu ilaa muslim.",
      vertaling: "O Allah, Kenner van het onzichtbare en het zichtbare, Schepper van hemelen en aarde, Heer en Bezitter van alles — ik getuig dat er geen god is dan U. Ik zoek bescherming bij U tegen het kwaad van mijn ziel, en het kwaad van de shaytan en zijn polytheïsme, en dat ik iets slechts tegen mijzelf of een moslim bewerk.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o14",
      arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      fonetisch: "Bismillaahil-lathee laa yadhurru ma'as-mihi shay'un fil-ardhi wa laa fis-samaa'i wa Huwas-Samee'ul-'Aleem.",
      vertaling: "In de naam van Allah — waarmee niets in de aarde of de hemel schade kan berokkenen. Hij is de Alhorende, de Alwetende.",
      aantal: 3, categorie: "Dhikr",
      beloning: "Geen plotseling onheil zal hem treffen. (Abu Dawud, Tirmidhi)",
    },
    {
      id: "o15",
      arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
      fonetisch: "Radheetu billaahi Rabban, wa bil-Islaami deenan, wa bi-Muhammadin sallallaahu 'alayhi wa sallama nabiyyan.",
      vertaling: "Ik ben tevreden met Allah als mijn Heer, met de Islam als mijn godsdienst, en met Mohammed ﷺ als mijn profeet.",
      aantal: 3, categorie: "Dhikr",
      beloning: "Het is een recht op Allah om hem tevreden te stellen op de Dag des Oordeels. (Abu Dawud, Tirmidhi)",
    },
    {
      id: "o16",
      arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
      fonetisch: "Yaa Hayyu yaa Qayyoomu birahmatika astagheethu, aslih lee sha'nee kullahu wa laa takilnee ilaa nafsee tarfata 'aynin.",
      vertaling: "O Eeuwig Levende, o Zelfbestaande — door Uw genade zoek ik hulp. Herstel al mijn aangelegenheden en laat mij geen ogenblik aan mijzelf over.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o16b",
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ",
      fonetisch: "Asbahnaa wa asbahal-mulku lillaahi Rabbil-'aalameen. Allaahumma innee as'aluka khayra haadhal-yawmi: fat-hahu wa nasrahu wa noorahu wa barakatahu wa hudaahu, wa a'oothu bika min sharri maa feehi wa sharri maa ba'dahu.",
      vertaling: "Wij zijn de ochtend ingegaan en het koninkrijk behoort Allah toe, de Heer der werelden. O Allah, ik vraag U het goede van deze dag: zijn overwinning, zijn hulp, zijn licht, zijn zegen en zijn leiding, en ik zoek bescherming bij U tegen het kwaad dat erin is en het kwaad van wat erna komt.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o17",
      arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
      fonetisch: "Asbahnaa 'alaa fitratil-Islaam, wa 'alaa kalimatil-ikhlaas, wa 'alaa deeni nabiyyinaa Muhammadin sallallaahu 'alayhi wa sallama, wa 'alaa millati abeenaa Ibraaheema haneefan musliman wa maa kaana minal-mushrikeen.",
      vertaling: "Wij zijn de ochtend ingegaan op de fitrah van de Islam, op het woord van oprechtheid, op de godsdienst van onze Profeet Mohammed ﷺ, en op de godsdienst van onze vader Ibrahim — zuiver rechtleidig moslim, en hij behoorde niet tot de veelgodenaanbidders.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o18",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      fonetisch: "Subhaanallaahi wa bihamdihi.",
      vertaling: "Glorie zij Allah en alle lof is voor Hem.",
      aantal: 100, categorie: "Tasbeeh",
      beloning: "Wie dit 100× zegt worden zijn zonden vergeven, al waren ze talrijk als het schuim van de zee. (Bukhari & Muslim)",
    },
    {
      id: "o19",
      arabic: "لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      fonetisch: "Laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu wa Huwa 'alaa kulli shay'in Qadeer.",
      vertaling: "Er is geen god dan Allah alleen, zonder deelgenoot. Aan Hem behoort het koninkrijk en alle lof, en Hij is over alles Almachtig.",
      aantal: 100, categorie: "Tasbeeh",
      beloning: "100×: gelijk aan het vrijkopen van 10 slaven, 100 goede daden geschreven, 100 zonden uitgewist, beschermd tegen de shaytan die dag, en niemand doet beter behalve wie meer zegt. (Bukhari & Muslim)",
    },
    {
      id: "o20",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
      fonetisch: "Subhaanallaahi wa bihamdihi: 'adada khalqihi, wa ridhaa nafsihi, wa zinata 'arshihi, wa midaada kalimaatih.",
      vertaling: "Glorie zij Allah en alle lof is voor Hem — zo talrijk als Zijn schepping, zo veel als Zijn tevredenheid, zo zwaar als Zijn Troon, en zo oneindig als Zijn woorden.",
      aantal: 3, categorie: "Tasbeeh",
      beloning: "Zwaarder op de weegschaal dan de eerste tasbeeh. (Muslim)",
    },
    {
      id: "o21",
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً",
      fonetisch: "Allaahumma innee as'aluka 'ilman naafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.",
      vertaling: "O Allah, ik vraag U nuttige kennis, goede voorziening en aanvaarde daden.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "o22",
      arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
      fonetisch: "Astaghfirullaaha wa atoobu ilayh.",
      vertaling: "Ik vraag Allah om vergeving en keer tot Hem terug.",
      aantal: 100, categorie: "Istighfaar",
      beloning: "De Profeet ﷺ zei dit 100× per dag. (Bukhari & Muslim)",
    },
    {
      id: "o23",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      fonetisch: "A'oothu bikalimaatil-laahit-taammaati min sharri maa khalaq.",
      vertaling: "Ik zoek bescherming in de volmaakte woorden van Allah tegen het kwaad van wat Hij heeft geschapen.",
      aantal: 3, categorie: "Dhikr",
      beloning: "Niets zal hem schaden totdat hij vertrekt. (Muslim)",
    },
    {
      id: "o24",
      arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
      fonetisch: "Allaahumma Salli wa Sallim 'alaa Nabeeyinnaa Muhammad.",
      vertaling: "O Allah, zend zegeningen en vrede over onze Profeet Mohammed ﷺ.",
      aantal: 10, categorie: "Salawaat",
      beloning: "Wie 10× salawaat verzendt: 10 zegeningen van Allah, 10 zonden vergeven, 10 rangen verhoogd. (Muslim)",
    },
  ],
  avond: [
    {
      id: "a1",
      arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      fonetisch: "Allahu laa ilaaha illaa Huwal-Hayyul-Qayyoom. Laa ta'khudhuhu sinatun wa laa nawm. Lahu maa fis-samaawaati wa maa fil-ardh. Man dhal-ladhee yashfa'u 'indahu illaa bi-idhnih. Ya'lamu maa bayna aydeehim wa maa khalfahum. Wa laa yuheetoona bishay'im-min 'ilmihi illaa bimaa shaa'. Wasi'a kursiyyuhus-samaawaati wal-ardh. Wa laa ya'ooduhu hifdhuhuma. Wa Huwal-'Aliyyul-'Adheem.",
      vertaling: "Allah — er is geen god dan Hij, de Eeuwig Levende, de Zelfbestaande. Sluimer noch slaap overvalt Hem. Aan Hem behoort wat in de hemelen en wat op aarde is. Wie is er die bij Hem kan bemiddelen anders dan met Zijn toestemming? Hij weet wat vóór hen en wat achter hen is. En zij omvatten niets van Zijn kennis, behalve wat Hij wil. Zijn Troon strekt zich uit over de hemelen en de aarde. Het bewaken daarvan valt Hem niet zwaar. En Hij is de Verhevene, de Geweldige.",
      aantal: 1, categorie: "Koran",
      beloning: "Wie Ayat Al-Kursi reciteert na elke verplichte salah — niets belet hem het Paradijs te betreden behalve de dood. (An-Nasa'i)",
    },
    {
      id: "a2",
      arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
      fonetisch: "Qul huwa Allahu ahad. Allahus-Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan ahad.",
      vertaling: "Zeg: Hij is Allah, de Enige. Allah, de Eeuwige Toevlucht. Hij heeft niet verwekt, noch is Hij verwekt. En niemand is Hem gelijkwaardig.",
      aantal: 3, categorie: "Koran",
      beloning: "Al-Ikhlas is gelijkwaardig aan een derde van de Koran. (Bukhari & Muslim)",
    },
    {
      id: "a3",
      arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      fonetisch: "Qul a'oodhu birabbi al-falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin idha waqab. Wa min sharrin-naffaathaati fil-'uqad. Wa min sharri haasidin idha hasad.",
      vertaling: "Zeg: Ik zoek bescherming bij de Heer van de dageraad. Tegen het kwaad van wat Hij heeft geschapen. Tegen het kwaad van de duisternis als zij valt. Tegen het kwaad van hen die op knopen blazen. Tegen het kwaad van een afgunstige als hij afgunst koestert.",
      aantal: 3, categorie: "Koran", beloning: null,
    },
    {
      id: "a4",
      arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۝ مَلِكِ ٱلنَّاسِ ۝ إِلَـٰهِ ٱلنَّاسِ ۝ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۝ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۝ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
      fonetisch: "Qul a'oodhu birabbi an-naas. Maliki an-naas. Ilaahi an-naas. Min sharril-waswaasil-khannaas. Alladhee yuwaswisu fee sudoorin-naas. Minal-jinnati wan-naas.",
      vertaling: "Zeg: Ik zoek bescherming bij de Heer van de mensen. De Koning van de mensen. De God van de mensen. Tegen het kwaad van de influisteraar die zich terugtrekt. Die influistert in de harten van de mensen. Uit de djinn en de mensen.",
      aantal: 3, categorie: "Koran", beloning: null,
    },
    {
      id: "a5",
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      fonetisch: "Amsaynaa wa amsal-mulku lillaahi walhamdu lillaahi, laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu wa Huwa 'alaa kulli shay'in Qadeer. Rabbi as'aluka khayra maa fee haadhihil-laylati wa khayra maa ba'dahaa, wa a'oothu bika min sharri maa fee haadhihil-laylati wa sharri maa ba'dahaa. Rabbi a'oothu bika minal-kasali wa soo'il-kibari. Rabbi a'oothu bika min 'adhaabin fin-naari wa 'adhaabin fil-qabri.",
      vertaling: "Wij zijn de avond ingegaan en het koninkrijk behoort Allah toe. Alle lof is voor Allah. Er is geen god dan Allah alleen, zonder deelgenoot. Aan Hem behoort het koninkrijk en alle lof, en Hij is over alles Almachtig. Mijn Heer, ik vraag U het goede van deze nacht en het goede van wat erna komt, en ik zoek bescherming bij U tegen het kwaad van deze nacht en het kwaad van wat erna komt. Mijn Heer, ik zoek bescherming bij U tegen luiheid en de ellende van de ouderdom. Mijn Heer, ik zoek bescherming bij U tegen een bestraffing in het Vuur en een bestraffing in het graf.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a6",
      arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
      fonetisch: "Allaahumma bika amsaynaa, wa bika asbahnaa, wa bika nahyaa, wa bika namootu wa ilaykal-maseer.",
      vertaling: "O Allah, door U zijn wij de avond ingegaan, door U de ochtend, door U leven wij en door U sterven wij — en tot U is de terugkeer.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a7",
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
      fonetisch: "Allaahumma Anta Rabbee laa ilaaha illaa Anta, khalaqtanee wa anaa 'abduka, wa anaa 'alaa 'ahdika wa wa'dika mastataTtu, a'oothu bika min sharri maa sana'tu, aboo'u laka bini'matika 'alayya, wa aboo'u bithanbee faghfir lee fa'innahu laa yaghfirudhdhunuba illaa Anta.",
      vertaling: "O Allah, U bent mijn Heer. Er is geen god dan U. U hebt mij geschapen en ik ben Uw dienaar. Ik houd mij aan mijn verbond en belofte aan U zo goed ik kan. Ik zoek bescherming bij U tegen het kwaad van wat ik heb gedaan. Ik erken Uw gunsten aan mij en ik erken mijn zonde — vergeef mij, want niemand vergeeft zonden behalve U.",
      aantal: 1, categorie: "Dhikr",
      beloning: "Wie dit 's avonds zegt met overtuiging en vóór de ochtend sterft, behoort tot de mensen van het Paradijs. (Bukhari) — Sayyid Al-Istighfaar.",
    },
    {
      id: "a8",
      arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
      fonetisch: "Allaahumma innee amsaytu ush-hiduka wa ush-hidu Hamalata 'arshika, wa malaa'ikataka wa jamee'a khalqika, annaka Antal-laahu laa ilaaha illaa Anta wahdaka laa shareeka laka, wa anna Muhammadan 'abduka wa Rasooluka.",
      vertaling: "O Allah, ik roep U als getuige aan deze avond, en de dragers van Uw Troon, Uw engelen en al Uw schepping: dat U Allah bent, er is geen god dan U alleen, zonder deelgenoot — en dat Mohammed Uw dienaar en Boodschapper is.",
      aantal: 4, categorie: "Dhikr",
      beloning: "Allah bevrijdt daarmee een kwart van de persoon van het Hellevuur per keer. 4× = volledig bevrijd. (Abu Dawud)",
    },
    {
      id: "a9",
      arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ",
      fonetisch: "Allaahumma maa amsaa bee min ni'matin aw bi-ahadin min khalqika faminka wahdaka laa shareeka laka, falakal-hamdu wa lakashshukru.",
      vertaling: "O Allah, welke gunst ik ook ontvang deze avond, of enig deel van Uw schepping — die is uitsluitend van U, zonder deelgenoot. Alle lof is voor U en alle dank.",
      aantal: 1, categorie: "Dhikr",
      beloning: "Wie dit 's avonds zegt heeft de dankbaarheidsplicht van die nacht vervuld. (Abu Dawud)",
    },
    {
      id: "a10",
      arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَـهَ إِلاَّ أَنْتَ",
      fonetisch: "Allaahumma 'aafinee fee badanee, Allaahumma 'aafinee fee sam'ee, Allaahumma 'aafinee fee basaree, laa ilaaha illaa Anta. Allaahumma innee a'oothu bika minal-kufri, walfaqri, wa a'oothu bika min 'adhaabil-qabri, laa ilaaha illaa Anta.",
      vertaling: "O Allah, geef mij gezondheid in mijn lichaam. O Allah, geef mij gezondheid in mijn gehoor. O Allah, geef mij gezondheid in mijn zicht. Er is geen god dan U. O Allah, ik zoek bescherming bij U tegen ongeloof en armoede, en tegen de bestraffing van het graf. Er is geen god dan U.",
      aantal: 3, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a11",
      arabic: "حَسْبِيَ اللَّهُ لاَ إِلَـهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      fonetisch: "Hasbiyallaahu laa ilaaha illaa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adheem.",
      vertaling: "Allah is mij genoeg. Er is geen god dan Hij. Op Hem vertrouw ik en Hij is de Heer van de geweldige Troon.",
      aantal: 7, categorie: "Dhikr",
      beloning: "Allah zal hem genoeg zijn in wat hem zorgen baart. (Abu Dawud)",
    },
    {
      id: "a12",
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
      fonetisch: "Allaahumma innee as'alukal-'afwa wal-'aafiyata fid-dunyaa wal-aakhirah. Allaahumma innee as'alukal-'afwa wal-'aafiyata fee deenee wa dunyaaya wa ahlee wa maalee. Allaahum-mastur 'awraatee wa aamin raw'aatee. Allaahum-mahfadhnee min bayni yadayya wa min khalfee wa 'an yameenee wa 'an shimaalee wa min fawqee, wa a'oothu bi'adhamatika an ughtaala min tahtee.",
      vertaling: "O Allah, ik vraag U om vergiffenis en welzijn in dit leven en het hiernamaals. O Allah, ik vraag U om vergiffenis en welzijn in mijn geloof, mijn wereldse leven, mijn familie en mijn bezit. O Allah, bedek mijn gebreken en stel mijn angsten gerust. O Allah, bescherm mij van vóór mij, van achter mij, van mijn rechterzijde, mijn linkerzijde en van boven mij, en ik zoek bescherming in Uw Grootheid dat ik van onderen onverhoeds vernietigd word.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a13",
      arabic: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ",
      fonetisch: "Allaahumma 'Aalimal-ghaybi wash-shahaadati faatiras-samaawaati wal-ardhi, Rabba kulli shay'in wa maleekahu, ash-hadu an laa ilaaha illaa Anta, a'oothu bika min sharri nafsee, wa min sharrish-shaytaani wa shirkihi, wa an aqtarifa 'alaa nafsee soo'an aw ajurrahu ilaa muslim.",
      vertaling: "O Allah, Kenner van het onzichtbare en het zichtbare, Schepper van hemelen en aarde, Heer en Bezitter van alles — ik getuig dat er geen god is dan U. Ik zoek bescherming bij U tegen het kwaad van mijn ziel en de shaytan en zijn polytheïsme, en dat ik iets slechts tegen mijzelf of een moslim bewerk.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a14",
      arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      fonetisch: "Bismillaahil-lathee laa yadhurru ma'as-mihi shay'un fil-ardhi wa laa fis-samaa'i wa Huwas-Samee'ul-'Aleem.",
      vertaling: "In de naam van Allah — waarmee niets in de aarde of de hemel schade kan berokkenen. Hij is de Alhorende, de Alwetende.",
      aantal: 3, categorie: "Dhikr",
      beloning: "Geen plotseling onheil zal hem treffen. (Abu Dawud, Tirmidhi)",
    },
    {
      id: "a15",
      arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
      fonetisch: "Radheetu billaahi Rabban, wa bil-Islaami deenan, wa bi-Muhammadin sallallaahu 'alayhi wa sallama nabiyyan.",
      vertaling: "Ik ben tevreden met Allah als mijn Heer, met de Islam als mijn godsdienst, en met Mohammed ﷺ als mijn profeet.",
      aantal: 3, categorie: "Dhikr",
      beloning: "Het is een recht op Allah om hem tevreden te stellen op de Dag des Oordeels. (Abu Dawud, Tirmidhi)",
    },
    {
      id: "a16",
      arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
      fonetisch: "Yaa Hayyu yaa Qayyoomu birahmatika astagheethu, aslih lee sha'nee kullahu wa laa takilnee ilaa nafsee tarfata 'aynin.",
      vertaling: "O Eeuwig Levende, o Zelfbestaande — door Uw genade zoek ik hulp. Herstel al mijn aangelegenheden en laat mij geen ogenblik aan mijzelf over.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a16b",
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ: فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا",
      fonetisch: "Amsaynaa wa amsal-mulku lillaahi Rabbil-'aalameen. Allaahumma innee as'aluka khayra haadhihil-laylati: fat-hahaa wa nasrahaa wa noorahaa wa barakatahaa wa hudaahaa, wa a'oothu bika min sharri maa feehaa wa sharri maa ba'dahaa.",
      vertaling: "Wij zijn de avond ingegaan en het koninkrijk behoort Allah toe, de Heer der werelden. O Allah, ik vraag U het goede van deze nacht: haar overwinning, haar hulp, haar licht, haar zegen en haar leiding, en ik zoek bescherming bij U tegen het kwaad dat erin is en het kwaad van wat erna komt.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a17",
      arabic: "أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
      fonetisch: "Amsaynaa 'alaa fitratil-Islaam, wa 'alaa kalimatil-ikhlaas, wa 'alaa deeni nabiyyinaa Muhammadin sallallaahu 'alayhi wa sallama, wa 'alaa millati abeenaa Ibraaheema haneefan musliman wa maa kaana minal-mushrikeen.",
      vertaling: "Wij zijn de avond ingegaan op de fitrah van de Islam, op het woord van oprechtheid, op de godsdienst van onze Profeet Mohammed ﷺ, en op de godsdienst van onze vader Ibrahim — zuiver rechtleidig moslim, en hij behoorde niet tot de veelgodenaanbidders.",
      aantal: 1, categorie: "Dhikr", beloning: null,
    },
    {
      id: "a18",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      fonetisch: "Subhaanallaahi wa bihamdihi.",
      vertaling: "Glorie zij Allah en alle lof is voor Hem.",
      aantal: 100, categorie: "Tasbeeh",
      beloning: "Wie dit 100× zegt worden zijn zonden vergeven, al waren ze talrijk als het schuim van de zee. (Bukhari & Muslim)",
    },
    {
      id: "a19",
      arabic: "لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      fonetisch: "Laa ilaaha illallaahu wahdahu laa shareeka lahu, lahul-mulku wa lahul-hamdu wa Huwa 'alaa kulli shay'in Qadeer.",
      vertaling: "Er is geen god dan Allah alleen, zonder deelgenoot. Aan Hem behoort het koninkrijk en alle lof, en Hij is over alles Almachtig.",
      aantal: 10, categorie: "Tasbeeh",
      beloning: "10×: gelijk aan het vrijkopen van een slaaf, 10 goede daden, 10 zonden uitgewist, beschermd van de shaytan. (Tirmidhi)",
    },
    {
      id: "a20",
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
      fonetisch: "Subhaanallaahi wa bihamdihi: 'adada khalqihi, wa ridhaa nafsihi, wa zinata 'arshihi, wa midaada kalimaatih.",
      vertaling: "Glorie zij Allah en alle lof is voor Hem — zo talrijk als Zijn schepping, zo veel als Zijn tevredenheid, zo zwaar als Zijn Troon, en zo oneindig als Zijn woorden.",
      aantal: 3, categorie: "Tasbeeh",
      beloning: "Zwaarder op de weegschaal dan de gewone tasbeeh. (Muslim)",
    },
    {
      id: "a21",
      arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
      fonetisch: "Astaghfirullaaha wa atoobu ilayh.",
      vertaling: "Ik vraag Allah om vergeving en keer tot Hem terug.",
      aantal: 100, categorie: "Istighfaar",
      beloning: "De Profeet ﷺ zei dit 100× per dag. (Bukhari & Muslim)",
    },
    {
      id: "a22",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      fonetisch: "A'oothu bikalimaatil-laahit-taammaati min sharri maa khalaq.",
      vertaling: "Ik zoek bescherming in de volmaakte woorden van Allah tegen het kwaad van wat Hij heeft geschapen.",
      aantal: 3, categorie: "Dhikr",
      beloning: "Niets zal hem schaden totdat hij vertrekt. (Muslim)",
    },
    {
      id: "a23",
      arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
      fonetisch: "Allaahumma Salli wa Sallim 'alaa Nabeeyinnaa Muhammad.",
      vertaling: "O Allah, zend zegeningen en vrede over onze Profeet Mohammed ﷺ.",
      aantal: 10, categorie: "Salawaat",
      beloning: "Wie 10× salawaat verzendt: 10 zegeningen van Allah, 10 zonden vergeven, 10 rangen verhoogd. (Muslim)",
    },
  ],
};


/* ─── Category config ──────────────────────────────────────────────────────── */
const CAT = {
  Koran:      { accent:"#C4933A", bg:"#FBF6EC", pill:"#F5E9C8", pillText:"#7A5A18", dot:"#C4933A" },
  Dhikr:      { accent:"#2A5278", bg:"#EEF5FC", pill:"#D6E8F5", pillText:"#1E3A5A", dot:"#2A5278" },
  Tasbeeh:    { accent:"#5A3A7A", bg:"#F3EEF9", pill:"#E3D9F2", pillText:"#3E2556", dot:"#5A3A7A" },
  Istighfaar: { accent:"#7A4020", bg:"#FBF0E8", pill:"#F5D9C5", pillText:"#5A2E14", dot:"#7A4020" },
  Salawaat:   { accent:"#2A6B52", bg:"#EBF7F2", pill:"#C5EAD8", pillText:"#1A4A38", dot:"#2A6B52" },
};

/* ─── Personalisatie — pas hier je naam en begroeting aan ── */
const NAAM  = "Hafsa";
const GROET = "As-salāmu ʿalaykum";

function getTodayKey() { return new Date().toISOString().split("T")[0]; }

/* ─── Opslag via localStorage (werkt op GitHub Pages / in de browser) ──────── */
async function loadStorage() {
  try { const r = localStorage.getItem("adkhar-progress-v2"); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
async function saveStorage(data) {
  try { localStorage.setItem("adkhar-progress-v2", JSON.stringify(data)); } catch {}
}
async function loadStreak() {
  try { const r = localStorage.getItem("adkhar-streak-v1"); return r ? JSON.parse(r) : { streak:0, lastDay:"" }; }
  catch { return { streak:0, lastDay:"" }; }
}
async function saveStreak(data) {
  try { localStorage.setItem("adkhar-streak-v1", JSON.stringify(data)); } catch {}
}
async function loadDarkMode() {
  try { const r = localStorage.getItem("adkhar-dark-v1"); return r ? JSON.parse(r) : false; }
  catch { return false; }
}
async function saveDarkMode(val) {
  try { localStorage.setItem("adkhar-dark-v1", JSON.stringify(val)); } catch {}
}

/* ─── Ornament SVG ─────────────────────────────────────────────────────────── */
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

/* ─── Main App ─────────────────────────────────────────────────────────────── */
export default function AdkharApp() {
  const [sessie, setSessie]         = useState("ochtend");
  const [huidigIndex, setHuidigIndex] = useState(0);
  const [teller, setTeller]         = useState(0);
  const [voltooid, setVoltooid]     = useState({});
  const [ripples, setRipples]       = useState([]);
  const [klaar, setKlaar]           = useState(false);
  const [geladen, setGeladen]       = useState(false);
  const [scherm, setScherm]         = useState("home");
  const [beloningOpen, setBeloningOpen]   = useState(false);
  const [fonetischOpen, setFonetischOpen] = useState(false);
  const [vertalingOpen, setVertalingOpen] = useState(false);
  const [darkMode, setDarkMode]     = useState(false);
  const [streak, setStreak]         = useState(0);

  const adkharLijst = ADKHAR[sessie];
  const huidig      = adkharLijst[huidigIndex];
  const todayKey    = getTodayKey();

  // Apply dark mode to body
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Load all persisted state
  useEffect(() => {
    Promise.all([loadStorage(), loadStreak(), loadDarkMode()]).then(([prog, str, dark]) => {
      if (prog[todayKey]) setVoltooid(prog[todayKey]);
      setStreak(str.streak || 0);
      setDarkMode(dark || false);
      setGeladen(true);
    });
  }, []);

  // Audio helper — werkt wel op iOS (Web Audio API)
  const audioCtx = useRef(null);
  const getCtx = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  };

  const playTick = useCallback((type = "tap") => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "tap") {
        // Zachte klik bij elke tel
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "complete") {
        // Zacht dubbel toon als dhikr klaar is
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === "next") {
        // Kort opgaand tintje bij volgende dhikr
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "done") {
        // Drie oplopende tonen als hele sessie klaar is
        [0, 0.12, 0.24].forEach((delay, i) => {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = "sine";
          o2.frequency.setValueAtTime([440, 550, 660][i], ctx.currentTime + delay);
          g2.gain.setValueAtTime(0.12, ctx.currentTime + delay);
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
          o2.start(ctx.currentTime + delay);
          o2.stop(ctx.currentTime + delay + 0.15);
        });
        return;
      }
    } catch (e) {}
  }, []);

  // Toggle dark mode
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    saveDarkMode(next);
  };

  // Update streak when both sessions fully done
  const checkStreak = useCallback(async (nieuweVoltooid) => {
    const ochVolt = ADKHAR.ochtend.every(d => nieuweVoltooid[`${todayKey}-${d.id}`]);
    const avVolt  = ADKHAR.avond.every(d => nieuweVoltooid[`${todayKey}-${d.id}`]);
    if (!ochVolt && !avVolt) return;
    const str = await loadStreak();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];
    let newStreak = str.streak;
    if (str.lastDay === todayKey) return; // already counted today
    if (str.lastDay === yesterdayKey) newStreak += 1;
    else newStreak = 1;
    const updated = { streak: newStreak, lastDay: todayKey };
    setStreak(newStreak);
    await saveStreak(updated);
  }, [todayKey]);

  const slaOp = useCallback(async (nv) => {
    const data = await loadStorage();
    data[todayKey] = nv;
    const keys = Object.keys(data).sort();
    if (keys.length > 30) delete data[keys[0]];
    await saveStorage(data);
    await checkStreak(nv);
  }, [todayKey, checkStreak]);

  const startSessie = (type) => {
    setSessie(type);
    const lijst = ADKHAR[type];
    const eerste = lijst.findIndex(d => !voltooid[`${todayKey}-${d.id}`]);
    setHuidigIndex(eerste === -1 ? 0 : eerste);
    setTeller(0); setKlaar(false); setBeloningOpen(false); setFonetischOpen(false); setVertalingOpen(false); setScherm("sessie");
  };

  const handleTik = useCallback((e) => {
    if (klaar) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 800);

    const nt = teller + 1;
    setTeller(nt);
    playTick("tap");

    if (nt >= huidig.aantal) {
      const nv = { ...voltooid, [`${todayKey}-${huidig.id}`]: true };
      setVoltooid(nv); slaOp(nv);
      playTick("complete");
      setTimeout(() => {
        if (huidigIndex < adkharLijst.length - 1) {
          setHuidigIndex(huidigIndex + 1); setTeller(0); setBeloningOpen(false);
          setFonetischOpen(false); setVertalingOpen(false);
          setTimeout(() => playTick("next"), 100);
        } else {
          setKlaar(true);
          playTick("done");
        }
      }, 450);
    }
  }, [teller, huidig, huidigIndex, adkharLijst, voltooid, klaar, todayKey, slaOp]);

  const gaanNaar = (i) => {
    playTick("next");
    setHuidigIndex(i); setTeller(0); setKlaar(false);
    setBeloningOpen(false); setFonetischOpen(false); setVertalingOpen(false);
  };
  const voltVandaag = (type) => ADKHAR[type].filter(d => voltooid[`${todayKey}-${d.id}`]).length;

  /* ── Loading ── */
  if (!geladen) return (
    <div style={{ minHeight:"100vh", background:"var(--cream)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:"0.8rem", color:"var(--ink-faint)", letterSpacing:"0.2em" }}>
        laden…
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     HOME
  ═══════════════════════════════════════════════════════════════════════════ */
  if (scherm === "home") {
    const ochV = voltVandaag("ochtend"), avV = voltVandaag("avond");
    const datumRaw = new Date().toLocaleDateString("nl-NL", { weekday:"long", day:"numeric", month:"long" });
    const datum = datumRaw.charAt(0).toUpperCase() + datumRaw.slice(1);

    const sessions = [
      { type:"ochtend", arabisch:"أذكار الصباح", label:"Ochtendadhkaar", sub:"Na Fajr · tot zonsopgang", volt:ochV, totaal:ADKHAR.ochtend.length, accent:"#C4933A" },
      { type:"avond",   arabisch:"أذكار المساء",  label:"Avondadhkaar",  sub:"Na Asr · tot Maghrib",   volt:avV,  totaal:ADKHAR.avond.length,   accent:"#2A5278" },
    ];

    return (
      <div className="paper" style={{ minHeight:"100vh", background:"var(--cream)", fontFamily:"'Cormorant Garamond', Georgia, serif", display:"flex", flexDirection:"column" }}>

        {/* ── Top strip: date left, dark toggle + overzicht right ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"48px var(--pad) 0", animation:"fadeIn 0.6s ease" }}>
          <div style={{ width:24 }}/>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/* Dark mode toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontSize:"0.65rem" }}>{darkMode ? "🌙" : "☀️"}</span>
              <div className={`dark-toggle${darkMode ? " on" : ""}`} onClick={toggleDark}/>
            </div>
            <button className="nav-btn" style={{ fontSize:"0.6rem" }} onClick={() => setScherm("overzicht")}>Overzicht</button>
          </div>
        </div>

        {/* ── Hero block ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px var(--pad) 0", textAlign:"center" }}>
          <div style={{ animation:"fadeUp 0.7s ease both" }}>
            <div className="arabic" style={{ fontSize:"4rem", color:"var(--ink)", lineHeight:1.2, direction:"rtl", marginBottom:18 }}>
              الأذكار
            </div>
            <Ornament color="#C4933A" opacity={0.5}/>
            <div style={{ marginTop:14, fontFamily:"'Cormorant SC', serif", fontSize:"0.58rem", color:"var(--ink-faint)", letterSpacing:"0.4em", textTransform:"uppercase" }}>
              Ochtend &amp; Avond
            </div>
            <div style={{ marginTop:28, fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic", fontSize:"1.3rem", color:"var(--ink-soft)" }}>
              {GROET}, {NAAM}
            </div>
            <div style={{ marginTop:7, fontFamily:"'Cormorant SC', serif", fontSize:"0.66rem", color:"var(--ink-faint)", letterSpacing:"0.16em" }}>
              {datum}
            </div>
          </div>

          {/* ── Streak badge ── */}
          {streak > 0 && (
            <div className="streak-pop" style={{ marginTop:32, display:"inline-flex", alignItems:"center", gap:8, background: darkMode ? "#2A2218" : "#FBF6EC", border:"1px solid #C4933A33", borderRadius:100, padding:"8px 20px" }}>
              <span style={{ fontSize:"1rem" }}>🔥</span>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.1rem", fontWeight:500, color:"var(--gold)", lineHeight:1 }}>{streak}</div>
                <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.48rem", color:"var(--ink-faint)", letterSpacing:"0.15em" }}>dag{streak === 1 ? "" : "en"} streak</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Session blocks: full-width stacked ── */}
        <div style={{ padding:"44px 0 0" }}>
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
                  padding:"26px var(--pad)",
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  gap:20,
                  transition:"background 0.2s",
                  animation:`fadeUp 0.55s ${0.15 + i*0.1}s ease both`,
                  background:"transparent",
                }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {/* Left: radial progress circle */}
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

                {/* Middle: text */}
                <div style={{ flex:1 }}>
                  <div className="arabic" style={{ fontSize:"1.35rem", color:"var(--ink-soft)", direction:"rtl", marginBottom:5 }}>{s.arabisch}</div>
                  <div style={{ fontSize:"1.05rem", color:"var(--ink)", fontWeight:500, marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.66rem", color:"var(--ink-faint)", letterSpacing:"0.08em" }}>{s.sub} · {s.volt}/{s.totaal}</div>
                </div>

                {/* Right: arrow */}
                <div style={{ flexShrink:0, fontFamily:"'Cormorant SC', serif", fontSize:"0.7rem", color:"var(--ink-faint)" }}>→</div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom spacer ── */}
        <div style={{ paddingBottom:56 }}/>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     OVERZICHT
  ═══════════════════════════════════════════════════════════════════════════ */
  if (scherm === "overzicht") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--cream)", fontFamily:"'Cormorant Garamond', Georgia, serif" }}>
        {/* Nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px var(--pad) 28px" }}>
          <button className="nav-btn" onClick={() => setScherm("home")}>← Terug</button>
          <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.65rem", color:"var(--ink-soft)", letterSpacing:"0.2em", textTransform:"uppercase" }}>Overzicht Vandaag</div>
          <div style={{ width:60 }}/>
        </div>

        {["ochtend", "avond"].map((type) => (
          <div key={type} style={{ padding:"0 var(--pad)", maxWidth:440, margin:"0 auto 44px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"0 4px" }}>
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
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", marginBottom:6, opacity: isVolt ? 0.72 : 1 }}
                >
                  <div style={{ width:18, height:18, borderRadius:"50%", border:`1.5px solid ${isVolt ? "#4A7C59" : c.accent}40`, background: isVolt ? "#4A7C59" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.55rem", color:"white", flexShrink:0, marginTop:2 }}>
                    {isVolt ? "✓" : ""}
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="arabic" style={{ fontSize:"0.95rem", color: isVolt ? "var(--ink-muted)" : "var(--ink-soft)", marginBottom:4, direction:"rtl", textAlign:"right", lineHeight:1.7 }}>
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

  /* ═══════════════════════════════════════════════════════════════════════════
     SESSIE
  ═══════════════════════════════════════════════════════════════════════════ */
  const voltAantal = adkharLijst.filter(d => voltooid[`${todayKey}-${d.id}`]).length;
  const isVolt     = voltooid[`${todayKey}-${huidig.id}`];
  const c          = CAT[huidig.categorie] || CAT.Dhikr;
  const restant    = Math.max(0, huidig.aantal - teller);
  const ringPct    = Math.min(teller / huidig.aantal, 1);
  const R = 40, CIRC = 2 * Math.PI * R;

  return (
    <div style={{ minHeight:"100vh", background:"var(--cream)", display:"flex", flexDirection:"column", fontFamily:"'Cormorant Garamond', Georgia, serif", userSelect:"none" }}>

      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"48px var(--pad) 0" }}>
        <button className="nav-btn" onClick={() => setScherm("home")}>← Home</button>
        <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.6rem", color:"var(--ink-muted)", letterSpacing:"0.18em" }}>
          {sessie === "ochtend" ? "🌅" : "🌙"} {huidigIndex + 1} / {adkharLijst.length}
        </div>
        <button className="nav-btn" onClick={() => setScherm("overzicht")}>Lijst</button>
      </div>

      {/* Progress bar */}
      <div style={{ height:2, background:"var(--cream-deep)", margin:"16px var(--pad) 0", borderRadius:1 }}>
        <div style={{ height:"100%", width:`${(voltAantal/adkharLijst.length)*100}%`, background:`linear-gradient(90deg, ${c.accent}88, ${c.accent})`, borderRadius:1, transition:"width 0.5s ease" }}/>
      </div>

      {klaar ? (
        /* ── Completion Screen ── */
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 36px", textAlign:"center" }}>
          <div className="complete-pop" style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg, #D4EAD9, #B8E0C2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", marginBottom:28, boxShadow:"0 8px 32px rgba(74,124,89,0.2)" }}>
            ✓
          </div>
          <div className="arabic" style={{ fontSize:"2rem", color:"var(--ink)", marginBottom:10, direction:"rtl" }}>بارك الله فيك</div>
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
        <React.Fragment key={huidig.id}>
          {/* Category pill */}
          <div style={{ padding:"24px var(--pad) 0" }}>
            <span className="pill" style={{ background:c.pill, color:c.pillText }}>{huidig.categorie}</span>
          </div>

          {/* Arabic text — always full, scrollable */}
          <div style={{ padding:"22px var(--pad) 0", direction:"rtl" }}>
            <div className="arabic" style={{ fontSize:"1.85rem", lineHeight:2.25, color:"var(--ink)", textAlign:"right" }}>
              {huidig.arabic}
            </div>
          </div>

          {/* Divider */}
          <div style={{ padding:"18px var(--pad) 0" }}>
            <div style={{ height:1, background:`linear-gradient(90deg, ${c.accent}30, transparent)` }}/>
          </div>

          {/* Toggle row: Fonetisch · Vertaling · Beloning */}
          <div style={{ padding:"16px var(--pad) 0", display:"flex", flexWrap:"wrap", gap:8 }}>
            <button
              onClick={() => setFonetischOpen(!fonetischOpen)}
              style={{ background:"none", border:`1px solid ${c.accent}30`, borderRadius:2, padding:"9px 16px", display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"'Cormorant SC', serif", fontSize:"0.62rem", color: fonetischOpen ? c.accent : "var(--ink-muted)", letterSpacing:"0.16em", textTransform:"uppercase" }}
            >
              ◌ Fonetisch
            </button>
            <button
              onClick={() => setVertalingOpen(!vertalingOpen)}
              style={{ background:"none", border:`1px solid ${c.accent}30`, borderRadius:2, padding:"9px 16px", display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"'Cormorant SC', serif", fontSize:"0.62rem", color: vertalingOpen ? c.accent : "var(--ink-muted)", letterSpacing:"0.16em", textTransform:"uppercase" }}
            >
              ◌ Vertaling
            </button>
            {huidig.beloning && (
              <button
                onClick={() => setBeloningOpen(!beloningOpen)}
                style={{ background:"none", border:`1px solid ${c.accent}30`, borderRadius:2, padding:"9px 16px", display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"'Cormorant SC', serif", fontSize:"0.62rem", color: beloningOpen ? c.accent : "var(--ink-muted)", letterSpacing:"0.16em", textTransform:"uppercase" }}
              >
                ✦ Beloning
              </button>
            )}
          </div>

          {/* Expanded panels */}
          {fonetischOpen && (
            <div style={{ padding:"12px var(--pad) 0", animation:"fadeUp 0.25s ease" }}>
              <div style={{ padding:"16px 18px", background:"var(--cream-deep)", border:`1px solid ${c.accent}15`, borderRadius:2, fontSize:"0.82rem", color:"var(--ink-muted)", lineHeight:1.9, fontStyle:"italic" }}>
                {huidig.fonetisch}
              </div>
            </div>
          )}
          {vertalingOpen && (
            <div style={{ padding:"12px var(--pad) 0", animation:"fadeUp 0.25s ease" }}>
              <div style={{ padding:"16px 18px", background:"var(--cream-deep)", border:`1px solid ${c.accent}15`, borderRadius:2, fontSize:"0.82rem", color:"var(--ink-soft)", lineHeight:1.95 }}>
                {huidig.vertaling}
              </div>
            </div>
          )}
          {beloningOpen && huidig.beloning && (
            <div style={{ padding:"12px var(--pad) 0", animation:"fadeUp 0.25s ease" }}>
              <div style={{ padding:"16px 18px", background:c.bg, border:`1px solid ${c.accent}20`, borderRadius:2, fontSize:"0.8rem", color:"var(--ink-soft)", lineHeight:1.85, fontStyle:"italic" }}>
                {huidig.beloning}
              </div>
            </div>
          )}

          <div style={{ flex:1, minHeight:20 }}/>

          {/* ── Tap zone ── */}
          <div
            onClick={handleTik}
            style={{
              position:"relative", margin:"0 20px 20px",
              borderRadius:4,
              background: isVolt
                ? "linear-gradient(160deg, #EBF7F233, var(--cream))"
                : "linear-gradient(160deg, var(--card-bg), var(--cream))",
              border:`1px solid ${isVolt ? "#86EFAC55" : c.accent+"20"}`,
              padding:"32px 24px",
              cursor:"pointer", overflow:"hidden",
              display:"flex", flexDirection:"column", alignItems:"center", gap:16,
              boxShadow:"0 2px 16px rgba(0,0,0,0.05)",
              WebkitTapHighlightColor:"transparent",
            }}
          >
            {ripples.map(r => (
              <div key={r.id} style={{ position:"absolute", left:r.x, top:r.y, width:12, height:12, background:c.accent+"25", borderRadius:"50%", transform:"translate(-50%,-50%) scale(0)", animation:"rippleOut 0.8s ease-out forwards", pointerEvents:"none" }}/>
            ))}

            {/* SVG ring counter */}
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
                    <div style={{ fontSize:"2rem", fontWeight:300, color:c.accent, lineHeight:1, fontFamily:"'Cormorant Garamond', serif" }}>{teller}</div>
                    <div style={{ fontSize:"0.6rem", color:"var(--ink-faint)", letterSpacing:"0.1em", fontFamily:"'Cormorant SC', serif", marginTop:3 }}>
                      {teller === 0 ? `${huidig.aantal}×` : `van ${huidig.aantal}`}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ fontFamily:"'Cormorant SC', serif", fontSize:"0.66rem", color:"var(--ink-faint)", letterSpacing:"0.18em", textTransform:"uppercase" }}>
              {isVolt ? "Voltooid · tik om verder" : `${teller} / ${huidig.aantal} · tik om te tellen`}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 var(--pad) 48px" }}>
            <button
              className="nav-btn"
              onClick={() => huidigIndex > 0 && gaanNaar(huidigIndex - 1)}
              style={{ opacity: huidigIndex > 0 ? 1 : 0.3, cursor: huidigIndex > 0 ? "pointer" : "default" }}
            >← Vorige</button>

            {/* Dot progress */}
            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
              {adkharLijst.slice(Math.max(0, huidigIndex-2), Math.min(adkharLijst.length, huidigIndex+3)).map((d, i) => {
                const absI = Math.max(0, huidigIndex-2) + i;
                const isActive = absI === huidigIndex;
                const isDone = voltooid[`${todayKey}-${d.id}`];
                return (
                  <div key={d.id} onClick={() => gaanNaar(absI)} style={{
                    width: isActive ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: isActive ? c.accent : isDone ? c.accent+"55" : "var(--cream-deep)",
                    cursor:"pointer",
                    transition:"all 0.3s ease",
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
        </React.Fragment>
      )}
    </div>
  );
}
