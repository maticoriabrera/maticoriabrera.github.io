(function () {
  'use strict';

  const LESSONS = window.LESSONS;
  const TOPICS = window.TOPICS;
  const VERBS = window.VERBS;
  const MEANINGS = window.VERB_MEANINGS;
  const PERSONE = ['io', 'tu', 'lui / lei', 'noi', 'voi', 'loro'];
  const LIVELLI = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const REFL = ['mi', 'ti', 'si', 'ci', 'vi', 'si'];
  const AVERE = ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'];
  const ESSERE = ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'];
  const IMP_ESSERE = ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'];
  const REM_ESSERE = ['fui', 'fosti', 'fu', 'fummo', 'foste', 'furono'];
  const REM_AVERE = ['ebbi', 'avesti', 'ebbe', 'avemmo', 'aveste', 'ebbero'];
  const CONG_ESSERE = ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'];
  const CONG_AVERE = ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'];
  const CONG_IMP_ESSERE = ['fossi', 'fossi', 'fosse', 'fossimo', 'foste', 'fossero'];
  const STORAGE_KEY = 'cpi5-a2-livelli-v2';
  const lessonById = Object.fromEntries(LESSONS.map(l => [l.id, l]));
  const topicById = Object.fromEntries(TOPICS.map(t => [t.id, t]));
  const verbById = Object.fromEntries(VERBS.map(v => [v.id, v]));
  const V = (id) => verbById[id];
  const byId = (id) => document.getElementById(id);
  const pageIds = {'home':'page-home', 'criteri':'page-criteri', 'lezione':'page-lesson', 'argomenti':'page-topics', 'argomento':'page-topic', 'armadio':'page-armario'};
  let livelli = loadLevels();
  let selectedVerb = 'essere';
  // La lezione selezionata determina i filtri predefiniti di entrambe le risorse.
  let selectedLesson = null;
  let topicsShowAll = false;
  let verbsShowAll = false;

  // Ogni lezione possiede un elenco indipendente di fotografie delle fonti.
  let viewerDocuments = [];
  let viewerIndex = 0;
  let viewerZoom = 1;
  let viewerTrigger = null;
  let viewerNaturalWidth = 1;
  let viewerNaturalHeight = 1;
  const viewer = byId('document-viewer');
  const viewerImage = byId('viewer-image');
  const viewerStage = byId('viewer-stage');
  const viewerCanvas = byId('viewer-canvas');

  // Le etichette dei livelli sono filtri di consultazione orientativi,
  // NON un'attribuzione ufficiale dei tempi verbali ai livelli QCER/CPIA5.
  function loadLevels() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(parsed) && parsed.every(l => LIVELLI.includes(l))) return new Set(parsed);
    } catch (_error) { /* L'apertura da file locale deve rimanere possibile. */ }
    return new Set(['A1', 'A2']);
  }
  function saveLevels() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...livelli])); }
    catch (_error) { /* Sessione corrente utilizzabile anche senza storage. */ }
  }
  function agreement(part, i) {
    const root = part.slice(0, -1);
    return i < 3 ? `${part} / ${root}a` : `${root}i / ${root}e`;
  }
  function baseInf(v) { return v.id.endsWith('si') ? v.id.slice(0, -2) + 'e' : v.id; }
  function hideOtherPersons(forms, v) {
    if (v.aux !== 'exist') return forms;
    return forms.map((f, i) => (i === 2 || i === 5 ? f : '—'));
  }
  function reflective(v, arr) {
    return v.aux === 'refl' ? arr.map((f, i) => `${REFL[i]} ${f}`) : arr;
  }
  function pastWithAux(v, auxForms) {
    if (v.aux === 'exist') return auxForms.map((f, i) => {
      const prefisso = /^e|^è/.test(f) ? 'c’' : 'ci ';
      return (i === 2 || i === 5) ? `${prefisso}${f} ${agreement(v.part,i)}` : '—';
    });
    if (v.aux === 'a') return auxForms.map(f => `${f} ${v.part}`);
    return auxForms.map((f,i) => `${v.aux==='refl' ? REFL[i]+' ' : ''}${f} ${agreement(v.part,i)}`);
  }
  function passatoProssimo(v) { return pastWithAux(v, v.aux === 'a' ? AVERE : ESSERE); }
  function imperfetto(v) {
    if (v.id === 'essere') return IMP_ESSERE;
    if (v.id === 'esserci') return ['—','—','c’era','—','—','c’erano'];
    let stem;
    if (v.id === 'fare') stem = 'facev';
    else if (v.id === 'dire') stem = 'dicev';
    else if (v.id === 'avere') stem = 'avev';
    else {
      const inf = baseInf(v);
      const ending = inf.endsWith('are') ? 'av' : inf.endsWith('ere') ? 'ev' : 'iv';
      stem = inf.slice(0, -3) + ending;
    }
    return reflective(v, ['o','i','a','amo','ate','ano'].map(e => stem+e));
  }
  function futureStem(v) {
    const irregular = {andare:'andr',avere:'avr',dare:'dar',dire:'dir',dovere:'dovr',essere:'sar',fare:'far',mangiare:'manger',potere:'potr',vedere:'vedr',venire:'verr',vivere:'vivr',volere:'vorr'};
    if (irregular[v.id]) return irregular[v.id];
    if (v.id === 'esserci') return 'sar';
    const inf = baseInf(v), root = inf.slice(0, -3);
    if (inf.endsWith('care') || inf.endsWith('gare')) return root + 'her';
    return root + (inf.endsWith('are') || inf.endsWith('ere') ? 'er' : 'ir');
  }
  function futuro(v) {
    const f = ['ò','ai','à','emo','ete','anno'].map(e => futureStem(v)+e);
    if (v.id === 'esserci') return ['—','—',`ci ${f[2]}`,'—','—',`ci ${f[5]}`];
    return reflective(v, f);
  }
  function condizionale(v) {
    const f = ['ei','esti','ebbe','emmo','este','ebbero'].map(e=>futureStem(v)+e);
    if (v.id === 'esserci') return ['—','—',`ci ${f[2]}`,'—','—',`ci ${f[5]}`];
    return reflective(v, f);
  }
  const SUBJ = {
    abitare:['abiti','abiti','abiti','abitiamo','abitiate','abitino'],
    andare:['vada','vada','vada','andiamo','andiate','vadano'],
    ascoltare:['ascolti','ascolti','ascolti','ascoltiamo','ascoltiate','ascoltino'],
    avere:CONG_AVERE,
    chiamarsi:['chiami','chiami','chiami','chiamiamo','chiamiate','chiamino'],
    conoscere:['conosca','conosca','conosca','conosciamo','conosciate','conoscano'],
    dare:['dia','dia','dia','diamo','diate','diano'],
    dire:['dica','dica','dica','diciamo','diciate','dicano'],
    essere:CONG_ESSERE,
    esserci:['—','—','ci sia','—','—','ci siano'],
    fare:['faccia','faccia','faccia','facciamo','facciate','facciano'],
    frequentare:['frequenti','frequenti','frequenti','frequentiamo','frequentiate','frequentino'],
    imparare:['impari','impari','impari','impariamo','impariate','imparino'],
    lavorare:['lavori','lavori','lavori','lavoriamo','lavoriate','lavorino'],
    leggere:['legga','legga','legga','leggiamo','leggiate','leggano'],
    nascere:['nasca','nasca','nasca','nasciamo','nasciate','nascano'],
    navigare:['navighi','navighi','navighi','navighiamo','navighiate','navighino'],
    parlare:['parli','parli','parli','parliamo','parliate','parlino'],
    piacere:['piaccia','piaccia','piaccia','piacciamo','piacciate','piacciano'],
    ricordare:['ricordi','ricordi','ricordi','ricordiamo','ricordiate','ricordino'],
    segnare:['segni','segni','segni','segniamo','segniate','segnino'],
    sentire:['senta','senta','senta','sentiamo','sentiate','sentano'],
    usare:['usi','usi','usi','usiamo','usiate','usino'],
    venire:['venga','venga','venga','veniamo','veniate','vengano'],
    vivere:['viva','viva','viva','viviamo','viviate','vivano'],

    arrivare:['arrivi','arrivi','arrivi','arriviamo','arriviate','arrivino'],
    ballare:['balli','balli','balli','balliamo','balliate','ballino'],
    chiedere:['chieda','chieda','chieda','chiediamo','chiediate','chiedano'],
    continuare:['continui','continui','continui','continuiamo','continuiate','continuino'],
    declinare:['declini','declini','declini','decliniamo','decliniate','declinino'],
    dormire:['dorma','dorma','dorma','dormiamo','dormiate','dormano'],
    dovere:['debba','debba','debba','dobbiamo','dobbiate','debbano'],
    indicare:['indichi','indichi','indichi','indichiamo','indichiate','indichino'],
    iniziare:['inizi','inizi','inizi','iniziamo','iniziate','inizino'],
    mangiare:['mangi','mangi','mangi','mangiamo','mangiate','mangino'],
    portare:['porti','porti','porti','portiamo','portiate','portino'],
    potere:['possa','possa','possa','possiamo','possiate','possano'],
    presentare:['presenti','presenti','presenti','presentiamo','presentiate','presentino'],
    scrivere:['scriva','scriva','scriva','scriviamo','scriviate','scrivano'],
    spiegare:['spieghi','spieghi','spieghi','spieghiamo','spieghiate','spieghino'],
    vedere:['veda','veda','veda','vediamo','vediate','vedano'],
    volere:['voglia','voglia','voglia','vogliamo','vogliate','vogliano']
  };
  function congiuntivoPresente(v) { return v.aux === 'refl' ? reflective(v,SUBJ[v.id]) : SUBJ[v.id]; }
  function congiuntivoImperfetto(v) {
    if (v.id === 'essere') return CONG_IMP_ESSERE;
    if (v.id === 'esserci') return ['—','—','ci fosse','—','—','ci fossero'];
    if (v.id === 'avere') return ['avessi','avessi','avesse','avessimo','aveste','avessero'];
    let root, suffix;
    if (v.id === 'dare') root = 'd';
    else if (v.id === 'dire') root = 'dic';
    else if (v.id === 'fare') root = 'fac';
    else root = baseInf(v).slice(0,-3);
    suffix = (baseInf(v).endsWith('are') && v.id !== 'dare') ? 'ass' : (baseInf(v).endsWith('ire') ? 'iss' : 'ess');
    const desinenze = suffix==='ass' ? ['assi','assi','asse','assimo','aste','assero'] : suffix==='iss' ? ['issi','issi','isse','issimo','iste','issero'] : ['essi','essi','esse','essimo','este','essero'];
    const f=desinenze.map(e=>root+e);
    return reflective(v,f);
  }
  function pastSubj(v) {
    return pastWithAux(v, v.aux==='a'?CONG_AVERE:CONG_ESSERE);
  }
  function pastImperfSubj(v) {
    return pastWithAux(v, v.aux==='a'?congiuntivoImperfetto(V('avere')):CONG_IMP_ESSERE);
  }
  function trapassato(v) {
    return pastWithAux(v, v.aux==='a'?imperfetto(V('avere')):IMP_ESSERE);
  }
  function futuroAnteriore(v) {
    return pastWithAux(v, v.aux==='a'?futuro(V('avere')):futuro(V('essere')));
  }
  function condizionalePassato(v) {
    return pastWithAux(v, v.aux==='a'?condizionale(V('avere')):condizionale(V('essere')));
  }
  function passatoRemoto(v) {
    if (v.aux==='exist') return ['—','—','ci fu','—','—','ci furono'];
    if (v.id==='essere') return REM_ESSERE;
    if (v.id==='avere') return REM_AVERE;
    if (v.id==='dare') return ['diedi','desti','diede','demmo','deste','diedero'];
    if (v.id==='fare') return ['feci','facesti','fece','facemmo','faceste','fecero'];
    // Solo i verbi regolari in -are/-ire: le forme irregolari non si inventano.
    const inf=baseInf(v);
    let forms;
    if (inf.endsWith('are')) forms=['ai','asti','ò','ammo','aste','arono'].map(e=>inf.slice(0,-3)+e);
    else if(inf.endsWith('ire') && inf!=='venire') forms=['ii','isti','ì','immo','iste','irono'].map(e=>inf.slice(0,-3)+e);
    else return null;
    return reflective(v, forms);
  }
  function trapassatoRemoto(v) {
    return pastWithAux(v, v.aux==='a'?REM_AVERE:REM_ESSERE);
  }
  function imperativo(v) {
    const irregular = {
      essere:['—','sii','sia','siamo','siate','siano'],
      avere:['—','abbi','abbia','abbiamo','abbiate','abbiano'],
      andare:['—','va’ / vai','vada','andiamo','andate','vadano'],
      dare:['—','da’ / dai','dia','diamo','date','diano'],
      dire:['—','di’','dica','diciamo','dite','dicano'],
      fare:['—','fa’ / fai','faccia','facciamo','fate','facciano'],
      venire:['—','vieni','venga','veniamo','venite','vengano'],
      chiamarsi:['—','chiamati','si chiami','chiamiamoci','chiamatevi','si chiamino']
    };
    if(irregular[v.id])return irregular[v.id];
    if(['esserci','nascere','piacere','volere','dovere','potere'].includes(v.id))return null;
    return ['—',v.id.endsWith('are')?v.p[2]:v.p[1],SUBJ[v.id][2],v.p[3],v.p[4],SUBJ[v.id][5]];
  }
  function infinitoPassato(v) {
    return [v.aux==='a' ? `avere ${v.part}` : v.aux==='refl' ? `essersi ${v.part}` : v.aux==='exist' ? 'esserci stato' : `essere ${v.part}`];
  }
  function gerundio(v) {
    const irreg={essere:'essendo',avere:'avendo',fare:'facendo',dire:'dicendo',dare:'dando',esserci:'essendoci'};
    if(irreg[v.id])return [irreg[v.id]];
    const inf=baseInf(v);
    const form=inf.slice(0,-3)+(inf.endsWith('are')?'ando':'endo');
    return [v.aux==='refl'?form+'si':form];
  }
  function gerundioPassato(v){
    return [v.aux==='a'?`avendo ${v.part}`:v.aux==='refl'?`essendosi ${v.part}`:v.aux==='exist'?'essendoci stato':`essendo ${v.part}`];
  }
  const TENSES = [
    {id:'indicativo-presente',modo:'Indicativo',titolo:'Presente',livello:'A1',fn:v=>v.p},
    {id:'indicativo-passato-prossimo',modo:'Indicativo',titolo:'Passato prossimo',livello:'A2',fn:passatoProssimo},
    {id:'indicativo-imperfetto',modo:'Indicativo',titolo:'Imperfetto',livello:'A2',fn:imperfetto},
    {id:'imperativo-presente',modo:'Imperativo',titolo:'Presente',livello:'A2',fn:imperativo},
    {id:'indicativo-trapassato-prossimo',modo:'Indicativo',titolo:'Trapassato prossimo',livello:'B1',fn:trapassato},
    {id:'indicativo-futuro',modo:'Indicativo',titolo:'Futuro semplice',livello:'B1',fn:futuro},
    {id:'indicativo-futuro-anteriore',modo:'Indicativo',titolo:'Futuro anteriore',livello:'B1',fn:futuroAnteriore},
    {id:'indicativo-passato-remoto',modo:'Indicativo',titolo:'Passato remoto',livello:'B2',fn:passatoRemoto},
    {id:'indicativo-trapassato-remoto',modo:'Indicativo',titolo:'Trapassato remoto',livello:'C2',fn:trapassatoRemoto},
    {id:'condizionale-presente',modo:'Condizionale',titolo:'Presente',livello:'B1',fn:condizionale},
    {id:'condizionale-passato',modo:'Condizionale',titolo:'Passato',livello:'B2',fn:condizionalePassato},
    {id:'congiuntivo-presente',modo:'Congiuntivo',titolo:'Presente',livello:'B2',fn:congiuntivoPresente},
    {id:'congiuntivo-imperfetto',modo:'Congiuntivo',titolo:'Imperfetto',livello:'C1',fn:congiuntivoImperfetto},
    {id:'congiuntivo-passato',modo:'Congiuntivo',titolo:'Passato',livello:'C1',fn:pastSubj},
    {id:'congiuntivo-trapassato',modo:'Congiuntivo',titolo:'Trapassato',livello:'C2',fn:pastImperfSubj},
    {id:'infinito-presente',modo:'Forme non personali',titolo:'Infinito presente',livello:'A2',fn:v=>[v.id],labels:['forma']},
    {id:'infinito-passato',modo:'Forme non personali',titolo:'Infinito passato',livello:'A2',fn:infinitoPassato,labels:['forma']},
    {id:'participio-passato',modo:'Forme non personali',titolo:'Participio passato',livello:'A2',fn:v=>[v.part],labels:['forma']},
    {id:'gerundio-presente',modo:'Forme non personali',titolo:'Gerundio presente',livello:'A2',fn:gerundio,labels:['forma']},
    {id:'gerundio-passato',modo:'Forme non personali',titolo:'Gerundio passato',livello:'B1',fn:gerundioPassato,labels:['forma']}
  ];

  // Correzione importante: le coniugazioni non finite/non disponibili non sono simulate.
  // L'indicazione del livello è soltanto una scelta di organizzazione per lo studio.
  function renderTense(t,v) {
    const f=t.fn(v);
    if (!f) return '';
    const isSubj=t.modo==='Congiuntivo';
    const rows=f.map((form,i)=>`<tr><td>${t.labels ? t.labels[i] : (isSubj ? 'che ' : '')+PERSONE[i]}</td><td>${form}</td></tr>`).join('');
    return `<section class="tense-box" data-tense="${t.id}"><header class="tense-head"><div><strong>${t.titolo}</strong></div><span class="level-tag level-${t.livello}">${t.livello}</span></header><table class="tense-table"><tbody>${rows}</tbody></table></section>`;
  }
  function renderVerb(v) {
    const checks=LIVELLI.map(l=>`<label class="level-check"><input type="checkbox" data-level="${l}" ${livelli.has(l)?'checked':''}><span class="level-tag level-${l}">${l}</span></label>`).join('');
    const byMode=new Map();
    TENSES.filter(t=>livelli.has(t.livello)).forEach(t=>{
      const html=renderTense(t,v);
      if(html) {if(!byMode.has(t.modo))byMode.set(t.modo,[]);byMode.get(t.modo).push(html);}
    });
    const tables=[...byMode].map(([modo, cards],i)=>`<section class="mode-group" aria-labelledby="mode-title-${i}"><header class="mode-head"><h3 id="mode-title-${i}">${modo}</h3></header><div class="mode-grid">${cards.join('')}</div></section>`).join('');
    byId('verb-details').innerHTML=`<div class="card"><fieldset class="level-filter"><legend>Livelli di studio</legend>${checks}</fieldset><h2 style="text-transform:capitalize">${v.id}</h2><p class="verb-meaning"><strong>Significato:</strong> ${MEANINGS[v.id]}</p><div class="verb-modes">${tables||'<p class="muted">Seleziona almeno un livello per visualizzare le coniugazioni.</p>'}</div><p class="small muted" style="margin:16px 0 0">I livelli sono indicativi per organizzare lo studio: non sono una classificazione ufficiale dei tempi verbali del CPIA5.</p></div>`;
    byId('verb-details').querySelectorAll('[data-level]').forEach(box=>{
      box.addEventListener('change',()=>{
        box.checked ? livelli.add(box.dataset.level) : livelli.delete(box.dataset.level);
        saveLevels();renderVerb(v);
      });
    });
  }
  // I dati grammaticali e i verbi sono unici; ogni lezione conserva solo i riferimenti.
  const collator = new Intl.Collator('it', {sensitivity:'base'});
  const alphaTopics = [...TOPICS].sort((a,b) => collator.compare(a.titolo,b.titolo));
  const alphaVerbs = [...VERBS].sort((a,b) => collator.compare(a.id,b.id));
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function currentLesson() { return selectedLesson ? lessonById[selectedLesson] : null; }
  function availableTopics() {
    if (!currentLesson() || topicsShowAll) return alphaTopics;
    const set = new Set(currentLesson().grammatica.map(x=>x.id));
    return alphaTopics.filter(t=>set.has(t.id));
  }
  function availableVerbs() {
    if (!currentLesson() || verbsShowAll) return alphaVerbs;
    const set = new Set(currentLesson().verbi);
    return alphaVerbs.filter(v=>set.has(v.id));
  }
  function updateScope() {
    const lesson = currentLesson();
    byId('topics-show-all').checked = topicsShowAll;
    byId('verbs-show-all').checked = verbsShowAll;
    byId('topics-scope').textContent = !lesson ? 'Nessuna lezione selezionata · tutti gli argomenti disponibili' : topicsShowAll ? 'Tutti gli argomenti disponibili' : `Argomenti della ${lesson.titolo}`;
    byId('verbs-scope').textContent = !lesson ? 'Nessuna lezione selezionata · tutti i verbi disponibili' : verbsShowAll ? 'Tutti i verbi disponibili' : `Verbi della ${lesson.titolo}`;
  }
  function setActiveLesson(id, forceReset=false) {
    const lesson=lessonById[id];
    if(!lesson || !lesson.abilitata) return false;
    if(forceReset || selectedLesson !== id) {
      selectedLesson=id;
      topicsShowAll=false;
      verbsShowAll=false;
    }
    return true;
  }
  // Miniature A4 come cornice: le fotografie restano integre, senza ritagli.
  function renderDocumentGallery(lesson) {
    const docs = Array.isArray(lesson.documenti) ? lesson.documenti : [];
    const gallery = byId('lesson-gallery');
    viewerDocuments = docs;
    gallery.hidden = docs.length === 0;
    byId('gallery-track').innerHTML = docs.map((doc,i)=>
      `<button class="gallery-thumb${doc.formato==='orizzontale'?' gallery-thumb--wide':''}" type="button" data-document-index="${i}" aria-label="Apri il documento originale ${i+1} di ${docs.length}" title="Apri documento ${i+1}"><img src="${escapeHtml(doc.miniatura)}" alt="" loading="lazy" decoding="async" draggable="false"></button>`
    ).join('');
    byId('gallery-track').querySelectorAll('[data-document-index]').forEach(button => {
      button.addEventListener('click',() => openViewer(Number(button.dataset.documentIndex),button));
    });
  }

  function refreshViewerControls() {
    const several = viewerDocuments.length > 1;
    byId('viewer-previous').disabled = !several || viewerIndex === 0;
    byId('viewer-next').disabled = !several || viewerIndex === viewerDocuments.length - 1;
    byId('viewer-zoom-out').disabled = viewerZoom <= 1;
    byId('viewer-zoom-in').disabled = viewerZoom >= 4;
    byId('viewer-zoom-reset').disabled = viewerZoom <= 1;
  }
  function fitViewerImage() {
    if (viewer.hidden || !viewerImage.complete || viewerNaturalWidth <= 0) return;
    const rect = viewerStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const availableWidth = Math.max(100,rect.width - 36);
    const availableHeight = Math.max(100,rect.height - 36);
    const ratio = viewerNaturalWidth / viewerNaturalHeight;
    const fittedWidth = Math.min(availableWidth, availableHeight * ratio);
    const width = Math.round(fittedWidth * viewerZoom);
    const height = Math.round(width / ratio);
    const canvasWidth = Math.max(Math.round(rect.width),width + 36);
    const canvasHeight = Math.max(Math.round(rect.height),height + 36);
    viewerCanvas.style.width = canvasWidth + 'px';
    viewerCanvas.style.height = canvasHeight + 'px';
    viewerImage.style.width = width + 'px';
    viewerImage.style.left = Math.round((canvasWidth-width)/2) + 'px';
    viewerImage.style.top = Math.round((canvasHeight-height)/2) + 'px';
    viewerStage.scrollLeft = Math.round((canvasWidth-rect.width)/2);
    viewerStage.scrollTop = Math.round((canvasHeight-rect.height)/2);
    refreshViewerControls();
  }
  function showViewerDocument(index) {
    if (index < 0 || index >= viewerDocuments.length) return;
    viewerIndex = index;
    viewerZoom = 1;
    const doc = viewerDocuments[index];
    viewerImage.alt = `Documento originale ${index+1} di ${viewerDocuments.length}`;
    viewerNaturalWidth=0;
    viewerNaturalHeight=0;
    viewerImage.onload = () => {
      viewerNaturalWidth = viewerImage.naturalWidth;
      viewerNaturalHeight = viewerImage.naturalHeight;
      byId('viewer-message').textContent = `Documento ${index+1} di ${viewerDocuments.length}`;
      fitViewerImage();
    };
    viewerImage.onerror = () => {
      byId('viewer-message').textContent = 'Impossibile caricare il documento.';
    };
    viewerImage.src = doc.src;
    refreshViewerControls();
  }
  function openViewer(index,trigger) {
    if (index < 0 || index >= viewerDocuments.length) return;
    viewerTrigger = trigger;
    viewer.hidden = false;
    viewer.setAttribute('aria-hidden','false');
    document.body.classList.add('viewer-open');
    showViewerDocument(index);
    byId('viewer-close').focus({preventScroll:true});
  }
  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden=true;
    viewer.setAttribute('aria-hidden','true');
    document.body.classList.remove('viewer-open');
    viewerImage.onload=null;
    viewerImage.onerror=null;
    viewerImage.removeAttribute('src');
    if (viewerTrigger && viewerTrigger.isConnected) viewerTrigger.focus({preventScroll:true});
    viewerTrigger = null;
  }
  function changeViewerDocument(delta) {
    const index = viewerIndex + delta;
    if (index >= 0 && index < viewerDocuments.length) showViewerDocument(index);
  }
  function changeViewerZoom(delta) {
    viewerZoom = Math.min(4,Math.max(1,Math.round((viewerZoom+delta)*10)/10));
    fitViewerImage();
  }
  function renderLesson(lesson) {
    const template = byId('lesson-template-' + lesson.id);
    if (!template) throw new Error('Manca il materiale della lezione ' + lesson.id);
    byId('lesson-content').replaceChildren(template.content.cloneNode(true));
    renderDocumentGallery(lesson);
    byId('lesson-grammar').innerHTML=lesson.grammatica.map(row=>{
      const t=topicById[row.id];
      if(!t) return '';
      return `<tr><td><span class="grammar-example">${row.esempio}</span><small class="grammar-note">${escapeHtml(row.nota)}</small></td><td class="grammar-topic">${escapeHtml(t.titolo)}</td><td><a class="grammar-details" href="#/argomento/${encodeURIComponent(t.id)}" aria-label="Dettagli: ${escapeHtml(t.titolo)}">Dettagli →</a></td></tr>`;
    }).join('');
    byId('class-verbs').innerHTML=alphaVerbs.filter(v=>lesson.verbi.includes(v.id)).map(v=>`<a href="#/verbo/${encodeURIComponent(v.id)}">${escapeHtml(v.id)}</a>`).join('');
    byId('page-lesson').setAttribute('aria-label',lesson.titolo);
  }
  function buildTopicIndex() {
    const filter=byId('topic-search').value.trim().toLocaleLowerCase('it');
    const displayed=availableTopics().filter(t=>t.titolo.toLocaleLowerCase('it').includes(filter));
    byId('topics-index').innerHTML=displayed.map(t=>`<a class="topic-card" href="#/argomento/${encodeURIComponent(t.id)}"><strong>${escapeHtml(t.titolo)} →</strong><small>${escapeHtml(t.sottotitolo)}</small></a>`).join('');
    byId('no-topics').hidden=displayed.length!==0;
    updateScope();
  }
  function buildTopic(t) {
    byId('topic-title').textContent=t.titolo;
    byId('topic-subtitle').textContent=t.sottotitolo;
    // Le spiegazioni grammaticali restano sempre interamente visibili:
    // nessun <details>, nessun clic necessario per espandere le sezioni.
    byId('topic-body').innerHTML=t.sezioni.map((sezione,i)=>
      `<section class="grammar-section" aria-labelledby="grammar-section-${i}"><h2 class="grammar-section-title" id="grammar-section-${i}">${escapeHtml(sezione.titolo)}</h2><div class="grammar-section-content">${sezione.html}</div></section>`
    ).join('');
    const linked=LESSONS.filter(l=>l.abilitata).flatMap(l=>{
      const match=l.grammatica.find(g=>g.id===t.id);
      return match?[`<li><a href="#/lezione/${encodeURIComponent(l.id)}">${escapeHtml(l.titolo)}</a> — ${escapeHtml(match.nota)}</li>`]:[];
    });
    byId('topic-refs').innerHTML=linked.length?`<ul>${linked.join('')}</ul>`:'<p class="muted">Non ci sono ancora lezioni pubblicate collegate a questo argomento.</p>';
  }
  function renderVerbPicker() {
    const available=availableVerbs();
    if (!available.some(v=>v.id===selectedVerb)) {
      selectedVerb=available.some(v=>v.id==='essere')?'essere':available[0]?.id || null;
    }
    byId('verb-picker').innerHTML=available.map(v=>`<a data-verb-link="${escapeHtml(v.id)}" href="#/verbo/${encodeURIComponent(v.id)}" class="${v.id===selectedVerb?'active':''}" ${v.id===selectedVerb?'aria-current="true"':''}>${escapeHtml(v.id)}</a>`).join('') || '<p class="empty">Nessun verbo disponibile.</p>';
    if(selectedVerb) renderVerb(V(selectedVerb));
    else byId('verb-details').innerHTML='<div class="card">Nessun verbo disponibile.</div>';
    updateScope();
  }
  function currentRoute() {
    let hash;
    try { hash=decodeURIComponent(location.hash || '#/home'); }
    catch(_error) {hash='#/home';}
    const parts=hash.replace(/^#\/?/,'').split('/');
    if(parts[0]==='lezione'&&setActiveLesson(parts[1])) {
      renderLesson(lessonById[parts[1]]);
      return 'lezione';
    }
    if(parts[0]==='criteri') return 'criteri';
    if(parts[0]==='argomenti') {
      buildTopicIndex();
      return 'argomenti';
    }
    if(parts[0]==='argomento'&&topicById[parts[1]]) {
      // Un collegamento diretto può aprire un argomento fuori dal filtro.
      if(currentLesson() && !currentLesson().grammatica.some(g=>g.id===parts[1])) topicsShowAll=true;
      buildTopic(topicById[parts[1]]);
      updateScope();
      return 'argomento';
    }
    if(parts[0]==='verbo'||parts[0]==='armadio') {
      if(parts[0]==='verbo'&&verbById[parts[1]]) {
        if(currentLesson() && !currentLesson().verbi.includes(parts[1])) verbsShowAll=true;
        selectedVerb=parts[1];
      }
      renderVerbPicker();
      return 'armadio';
    }
    // Home è la schermata iniziale, anche quando l'hash è vuoto.
    return 'home';
  }
  function navigate() {
    const section=currentRoute();
    updateScope();
    Object.entries(pageIds).forEach(([k,id])=>{byId(id).hidden=(k!==section);});
    document.querySelectorAll('[data-nav]').forEach(el=>{
      const nav=el.dataset.nav;
      const isLessonLink=nav==='lezione' && section==='lezione' && el.getAttribute('href')===`#/lezione/${selectedLesson}`;
      const active=(nav==='home'&&section==='home')||isLessonLink||(nav==='argomenti'&&['argomenti','argomento'].includes(section))||(nav==='armadio'&&section==='armadio');
      el.classList.toggle('active',active);
      active?el.setAttribute('aria-current','page'):el.removeAttribute('aria-current');
    });
    if(section==='armadio') document.querySelectorAll('[data-verb-link]').forEach(a=>a.classList.toggle('active',a.dataset.verbLink===selectedVerb));
    document.title=(section==='argomento'?byId('topic-title').textContent:section==='armadio'?'Armadio dei verbi':section==='argomenti'?'Argomenti grammaticali':section==='criteri'?'Criteri di organizzazione':section==='lezione'?lessonById[selectedLesson].titolo:'Home')+' · Italiano A2 · CPIA5';
    window.scrollTo(0,0);
  }

  // Ogni clic su una lezione reimposta entrambe le caselle «Mostra tutti».
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#/lezione/"]');
    if (!link) return;
    const match=link.getAttribute('href').match(/^#\/lezione\/(\d+)$/);
    if (!match) return;
    setActiveLesson(match[1],true);
    // Se è un collegamento alla stessa lezione, l'hash non cambia.
    if(location.hash===link.getAttribute('href')) navigate();
  });
  byId('topics-show-all').addEventListener('change',event=>{
    topicsShowAll=event.target.checked;
    buildTopicIndex();
    if (byId('page-topic').hidden===false) {
      // La pagina del tema rimane aperta; il filtro vale per l'indice.
      updateScope();
    }
  });
  byId('verbs-show-all').addEventListener('change',event=>{
    verbsShowAll=event.target.checked;
    renderVerbPicker();
  });
  byId('viewer-close').addEventListener('click',closeViewer);
  byId('viewer-previous').addEventListener('click',()=>changeViewerDocument(-1));
  byId('viewer-next').addEventListener('click',()=>changeViewerDocument(1));
  byId('viewer-zoom-in').addEventListener('click',()=>changeViewerZoom(.3));
  byId('viewer-zoom-out').addEventListener('click',()=>changeViewerZoom(-.3));
  byId('viewer-zoom-reset').addEventListener('click',()=>{viewerZoom=1;fitViewerImage();});
  document.addEventListener('keydown',event=>{
    if (viewer.hidden) return;
    if(event.key==='Escape') {event.preventDefault();closeViewer();return;}
    if(event.key==='ArrowLeft') {event.preventDefault();changeViewerDocument(-1);return;}
    if(event.key==='ArrowRight') {event.preventDefault();changeViewerDocument(1);return;}
    if(event.key==='+' || event.key==='=') {event.preventDefault();changeViewerZoom(.3);return;}
    if(event.key==='-') {event.preventDefault();changeViewerZoom(-.3);return;}
    if(event.key==='0') {event.preventDefault();viewerZoom=1;fitViewerImage();return;}
    if(event.key==='Tab') {
      const focusable=[...viewer.querySelectorAll('button:not([disabled])')];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
    }
  });
  window.addEventListener('resize',()=>{if(!viewer.hidden)fitViewerImage();});
  byId('topic-search').addEventListener('input',buildTopicIndex);
  window.addEventListener('hashchange',navigate);
  navigate();
})();
