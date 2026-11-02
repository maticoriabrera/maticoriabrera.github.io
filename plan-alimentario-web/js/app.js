/* Sitio estático: sin cuentas, analítica, servidores de aplicación ni datos personales. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayToNumber = { mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
  const messages = {
    es: {
      title:'Mi plan alimentario',brand:'Mi plan',tagline:'Alimentación sencilla, cada día',day:'Día',week:'Semana',recipes:'Preparaciones',foods:'Alimentos',
      days:['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],short:['Lun','Mar','Mié','Jue','Vie','Sáb'],
      meal:{breakfast:'Desayuno',morning:'Colación de media mañana',lunch:'Almuerzo',afternoon:'Merienda',dinner:'Cena'},
      today:'HOY',weekPlan:'TU SEMANA',todayTitle:'Tu alimentación de hoy',selectedTitle:'Plan del',subday:'Alimentos, cantidades y alternativas del día.',
      pickDay:'Elegí un día',whatToEat:'Tus comidas',items:'alimentos',item:'alimento',original:'Original',change:'Cambiar',alternatives:'Alternativas',noAlts:'Sin alternativas indicadas',
      sunday:'El domingo no tiene un menú definido',sundayMore:'El documento contiene un plan de lunes a sábado. Seleccioná uno de esos días para consultarlo.',viewMonday:'Ver lunes',
      extra:'Durante el día',extraDesc:'Indicaciones y alimentos adicionales, cuando están presentes en el plan.',general:'Indicaciones generales',generalLink:'Consultar indicaciones generales',
      weekTitle:'Tu semana, de un vistazo',weekDesc:'Seis días organizados tal como aparecen en el plan.',seeDay:'Ver día',noFoods:'Ver indicación',
      recipesTitle:'Preparaciones paso a paso',recipesDesc:'Recetas e instrucciones incluidas en el documento, sin agregar cantidades que no aparecen.',
      viewRecipe:'Ver preparación',generalSubtitle:'Indicaciones generales del plan',generalDays:'Estas indicaciones figuran de lunes a viernes. El sábado no contiene un apartado equivalente.',
      dietNote:'Contenido transcrito del plan original. Las afirmaciones clínicas que aparecen en él no se han verificado en esta web.',
      foodsTitle:'Alimentos y alternativas',foodsDesc:'Consultá los alimentos que aparecen en el plan y sus sustituciones específicas en cada comida.',
      search:'Buscar un alimento…',results:'alimentos encontrados',foundIn:'Ubicaciones en el plan',foodOccurrences:'apariciones',occur:'aparición',
      where:'Dónde aparece',asAlternative:'Alternativa de',showAlternatives:'Ver / elegir alternativa',chosen:'Seleccionado',selectOriginal:'Mantener original',
      altInfo:'Las alternativas y sus cantidades corresponden a esta comida concreta. Tu elección se guarda solamente en este navegador.',
      changed:'Elección guardada en este dispositivo.',mealType:'Comida',recipeIngredients:'Ingredientes',recipeSteps:'Preparación',recipeNotes:'Observación',
      suggestions:'Sugerencia del plan',instructions:'Indicaciones del plan',recipe:'Receta',noResults:'No se encontraron alimentos con ese término.',
      close:'Cerrar',loading:'Cargando tu plan alimentario…',loadError:'No fue posible cargar los datos del plan. Si abriste index.html directamente, publicá el proyecto en GitHub Pages o utilizá un servidor web local.',
      duringDay:'Durante el día',qty:'Cantidad',selected:'Elegido',backToDay:'Ir al día',todayBadge:'Día actual',extraTag:'Indicaciones del día',listTitle:'Listado del plan',
      recipeContext:'En el plan',madeChoice:'Elección guardada en este dispositivo.',withoutAmount:'Cantidad no especificada',dateLocale:'es-AR'
    },
    it: {
      title:'Il mio piano alimentare',brand:'Il mio piano',tagline:'Mangiare bene, giorno per giorno',day:'Giorno',week:'Settimana',recipes:'Preparazioni',foods:'Alimenti',
      days:['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],short:['Lun','Mar','Mer','Gio','Ven','Sab'],
      meal:{breakfast:'Colazione',morning:'Spuntino mattutino',lunch:'Pranzo',afternoon:'Merenda',dinner:'Cena'},
      today:'OGGI',weekPlan:'LA TUA SETTIMANA',todayTitle:'La tua alimentazione di oggi',selectedTitle:'Piano di',subday:'Alimenti, quantità e alternative della giornata.',
      pickDay:'Scegli un giorno',whatToEat:'I tuoi pasti',items:'alimenti',item:'alimento',original:'Originale',change:'Cambia',alternatives:'Alternative',noAlts:'Nessuna alternativa indicata',
      sunday:'Per domenica non è previsto un menù',sundayMore:'Il documento contiene un piano dal lunedì al sabato. Seleziona uno di questi giorni per consultarlo.',viewMonday:'Vedi lunedì',
      extra:'Durante la giornata',extraDesc:'Indicazioni e alimenti aggiuntivi, quando presenti nel piano.',general:'Indicazioni generali',generalLink:'Consulta le indicazioni generali',
      weekTitle:'La tua settimana a colpo d’occhio',weekDesc:'Sei giorni organizzati come nel piano originale.',seeDay:'Vedi giorno',noFoods:'Vedi indicazione',
      recipesTitle:'Preparazioni passo dopo passo',recipesDesc:'Ricette e istruzioni presenti nel documento, senza aggiungere quantità non indicate.',
      viewRecipe:'Vedi preparazione',generalSubtitle:'Indicazioni generali del piano',generalDays:'Queste indicazioni compaiono dal lunedì al venerdì. Il sabato non include una sezione equivalente.',
      dietNote:'Contenuto trascritto dal piano originale. Le affermazioni cliniche presenti nel documento non sono state verificate in questo sito.',
      foodsTitle:'Alimenti e alternative',foodsDesc:'Consulta gli alimenti presenti nel piano e le sostituzioni specifiche per ciascun pasto.',
      search:'Cerca un alimento…',results:'alimenti trovati',foundIn:'Dove compare nel piano',foodOccurrences:'occorrenze',occur:'occorrenza',
      where:'Dove compare',asAlternative:'Alternativa a',showAlternatives:'Vedi / scegli alternativa',chosen:'Selezionato',selectOriginal:'Mantieni originale',
      altInfo:'Le alternative e le quantità si riferiscono a questo pasto. La tua scelta viene salvata soltanto in questo browser.',
      changed:'Scelta salvata su questo dispositivo.',mealType:'Pasto',recipeIngredients:'Ingredienti',recipeSteps:'Preparazione',recipeNotes:'Osservazione',
      suggestions:'Suggerimento del piano',instructions:'Istruzioni del piano',recipe:'Ricetta',noResults:'Nessun alimento trovato con questa ricerca.',
      close:'Chiudi',loading:'Caricamento del piano alimentare…',loadError:'Impossibile caricare i dati del piano. Se hai aperto direttamente index.html, pubblica il progetto su GitHub Pages oppure usa un server web locale.',
      duringDay:'Durante la giornata',qty:'Quantità',selected:'Scelto',backToDay:'Vai al giorno',todayBadge:'Giorno corrente',extraTag:'Indicazioni del giorno',listTitle:'Elenco del piano',
      recipeContext:'Nel piano',madeChoice:'Scelta salvata su questo dispositivo.',withoutAmount:'Quantità non specificata',dateLocale:'it-IT'
    }
  };
  const ICON = { breakfast:'☀️',morning:'🍐',lunch:'🍽️',afternoon:'🍊',dinner:'🌙' };
  const recipeIcons={egg:'🍳',zucchini:'🥒',misu:'☕',crostini:'🥖',pancakes:'🥞',ceci:'🧆'};
  const STORAGE='piano-alimentare-prefs-v1';
  const saved=readSaved();
  const browserPref=(navigator.language||'').toLowerCase().startsWith('it')?'it':'es';
  const rawToday=new Date().getDay();
  const today=days.find(d=>dayToNumber[d]===rawToday)||null;
  const state={lang:saved.lang==='es'||saved.lang==='it'?saved.lang:browserPref,view:'day',day:today,choices:saved.choices||{},search:'',dialog:null,data:null,foodIndex:[]};
  const main=$('#main-content');const dlg=$('#detail-dialog');
  const esc=value=>String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t=()=>messages[state.lang];
  const local=x=>typeof x==='string'?x:(x?.[state.lang]||'');
  const dayName=id=>t().days[days.indexOf(id)]||'';
  const clean=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function readSaved(){try {const x=JSON.parse(localStorage.getItem(STORAGE)||'{}');return x&&typeof x==='object'?x:{};}catch{return {};}}
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify({lang:state.lang,choices:state.choices}));}catch{/* navegación funcional sin almacenamiento */}}
  function occKey(day,kind,index){return `${day}:${kind}:${index}`;}
  function getOptions(item){return [item,...(item.alternatives||[])];}
  function choiceIndex(day,kind,index,item){let chosen=state.choices[occKey(day,kind,index)];return Number.isInteger(chosen)&&chosen>0&&chosen<getOptions(item).length?chosen:0;}
  function occurrence(day,kind,index){const d=state.data.days.find(x=>x.id===day);if(!d)return null;const list=kind==='extra'?d.during_day:d.meals.find(m=>m.kind===kind)?.items;const item=list?.[index];return item?{day,kind,index,item}:null;}
  function occLabel(o){return `${dayName(o.day)} · ${o.kind==='extra'?t().duringDay:t().meal[o.kind]}`;}
  function tag(line){return `<span class="eyebrow">${esc(line)}</span>`;}
  function localized(item){return esc(item?.[state.lang]??'');}
  function buttonChange(day,kind,index,item){return item.alternatives?.length?`<button class="change-button" type="button" data-action="options" data-day="${day}" data-kind="${kind}" data-index="${index}" aria-label="${esc(t().alternatives+': '+local(item))}">⇄</button>`:'';}
  function itemLine(day,kind,item,index){const choice=choiceIndex(day,kind,index,item);const selected=getOptions(item)[choice];return `<li class="meal-item"><div class="food-names"><div class="food-name">${localized(selected)}</div>${choice?`<div class="food-original">${esc(t().original)}: ${localized(item)}</div>`:''}</div><strong class="food-qty">${esc(selected.qty)}</strong>${buttonChange(day,kind,index,item)}</li>`;}
  function note(n){return n?`<div class="note">${localized(n)}</div>`:'';}
  function mealCard(day,m){const c=m.items.length;const recipeLinks=(m.recipes||[]).map(id=>{const rec=state.data.recipes.find(r=>r.id===id);return rec?`<button type="button" class="recipe-link" data-action="recipe" data-id="${id}">📖 ${esc(t().viewRecipe)} · ${localized(rec.title)} →</button>`:''}).join('');return `<article class="meal-card"><div class="meal-head"><div class="meal-icon" aria-hidden="true">${ICON[m.kind]}</div><div><h3>${esc(t().meal[m.kind])}</h3><p class="meta">${c?`${c} ${esc(c===1?t().item:t().items)}`:esc(t().noFoods)}</p></div></div><div class="meal-body">${c?`<ul class="meal-list">${m.items.map((item,i)=>itemLine(day,m.kind,item,i)).join('')}</ul>`:''}${note(m.note)}${recipeLinks}</div></article>`;}
  function dateLabel(){return new Intl.DateTimeFormat(t().dateLocale,{day:'numeric',month:'long'}).format(new Date());}
  function dayChips(){return `<div class="days-picker" role="group" aria-label="${esc(t().pickDay)}">${days.map((id,i)=>`<button type="button" class="day-chip ${state.day===id?'selected':''} ${today===id?'today':''}" aria-pressed="${state.day===id}" data-action="day" data-day="${id}"><span class="short">${esc(t().short[i])}</span><span class="dot">${today===id?'●':'·'}</span></button>`).join('')}</div>`;}
  function dayView(){const d=state.data.days.find(x=>x.id===state.day);return `<section class="hero">${tag(state.day && state.day===today?t().today:t().weekPlan)}<h1>${state.day && state.day===today?esc(t().todayTitle):state.day?`${esc(t().selectedTitle)} ${esc(dayName(state.day).toLowerCase())}`:esc(t().sunday)}</h1><p>${state.day && state.day===today?esc(dateLabel()):esc(t().subday)}</p></section>${dayChips()}${d?`<div class="section-heading"><div><h2>${esc(t().whatToEat)}</h2><p>${esc(dayName(d.id))}</p></div></div><div class="meal-stack">${d.meals.map(m=>mealCard(d.id,m)).join('')}</div>${d.during_day.length?`<section><h2 class="small-heading">🌿 ${esc(t().extra)}</h2><div class="extra-card"><ul class="meal-list">${d.during_day.map((item,i)=>itemLine(d.id,'extra',item,i)).join('')}</ul></div><p class="tip-footer">${esc(t().extraDesc)}</p></section>`:''}${state.data.generalDays.includes(d.id)?`<button class="simple-link" type="button" data-action="view" data-view="recipes">📄 ${esc(t().generalLink)} →</button>`:''}`:`<section class="empty-sunday"><span aria-hidden="true">🌿</span><h2>${esc(t().sunday)}</h2><p>${esc(t().sundayMore)}</p><button type="button" class="primary-button" data-action="day" data-day="mon">${esc(t().viewMonday)}</button></section>`}`;}
  function weekView(){return `<section class="hero">${tag(t().weekPlan)}<h1>${esc(t().weekTitle)}</h1><p>${esc(t().weekDesc)}</p></section><div class="section-heading"><h2>${esc(t().week)}</h2></div><div class="week-grid">${state.data.days.map(d=>`<article class="week-card ${d.id===today?'current':''}"><div class="week-top"><h3>${esc(dayName(d.id))}</h3>${d.id===today?`<span class="week-tag">${esc(t().today)}</span>`:''}</div><div class="week-lines">${d.meals.map(m=>{const items=m.items.map((food,i)=>{const pick=getOptions(food)[choiceIndex(d.id,m.kind,i,food)];return `${local(pick)} (${pick.qty})`;});return `<div class="week-line"><strong>${esc(t().meal[m.kind])}</strong><span>${items.length?esc(items.join(' · ')):m.note?localized(m.note):'—'}</span></div>`;}).join('')}</div><button type="button" class="simple-link" data-action="day" data-day="${d.id}">${esc(t().seeDay)} →</button></article>`).join('')}</div>`;}
  function recipesView(){return `<section class="hero">${tag(t().recipes)}<h1>${esc(t().recipesTitle)}</h1><p>${esc(t().recipesDesc)}</p></section><div class="section-heading"><div><h2>${esc(t().recipes)}</h2><p>${state.data.recipes.length} ${esc(t().recipes.toLowerCase())}</p></div></div><div class="recipe-grid">${state.data.recipes.map(rec=>`<article class="recipe-card"><div class="recipe-emoji" aria-hidden="true">${recipeIcons[rec.id]||'🍳'}</div>${tag(t()[rec.type==='recipe'?'recipe':rec.type==='suggestion'?'suggestions':'instructions'])}<h3>${localized(rec.title)}</h3><p>${esc(dayName(rec.day))} · ${esc(t().meal[rec.meal])}</p><button type="button" class="simple-link" data-action="recipe" data-id="${rec.id}">${esc(t().viewRecipe)} →</button></article>`).join('')}</div><section class="general-box" id="indicaciones"><h3>📖 ${esc(t().generalSubtitle)}</h3><ul class="general-list">${state.data.general.map(g=>`<li>${localized(g)}</li>`).join('')}</ul><p class="general-footnote">${esc(t().generalDays)}</p><p class="general-footnote">${esc(t().dietNote)}</p></section>`;}
  function buildFoodIndex(){
    const map=new Map();
    for(const d of state.data.days){
      for(const m of d.meals){m.items.forEach((item,index)=>addAll(item,{day:d.id,kind:m.kind,index}));}
      d.during_day.forEach((item,index)=>addAll(item,{day:d.id,kind:'extra',index}));
    }
    function addAll(item,occ){
      add(item,{...occ,role:'main'});
      for(const alt of item.alternatives||[])add(alt,{...occ,role:'alternative',original:item});
    }
    function add(item,occ){
      const key=item.it;
      if(!map.has(key))map.set(key,{food:item,occurrences:[]});
      map.get(key).occurrences.push(occ);
    }
    state.foodIndex=[...map.values()].sort((a,b)=>local(a.food).localeCompare(local(b.food),state.lang));
  }
  function foodsList(){const matches=state.foodIndex.filter(f=>clean(f.food.it+' '+f.food.es).includes(clean(state.search)));return `<div class="result-count">${matches.length} ${esc(t().results)}</div><div class="food-list-grid">${matches.map(f=>`<button type="button" class="index-item" data-action="food" data-food="${esc(f.food.it)}"><span class="index-item-text"><strong>${localized(f.food)}</strong><small>${f.occurrences.length} ${esc(f.occurrences.length===1?t().occur:t().foodOccurrences)}</small></span><span class="index-arrow" aria-hidden="true">›</span></button>`).join('')}</div>${matches.length?'':`<p class="no-results">${esc(t().noResults)}</p>`}`;}
  function foodsView(){return `<section class="hero">${tag(t().listTitle)}<h1>${esc(t().foodsTitle)}</h1><p>${esc(t().foodsDesc)}</p></section><div class="section-heading"><h2>${esc(t().foods)}</h2></div><label class="sr-only" for="search-food">${esc(t().search)}</label><input id="search-food" class="search-field" type="search" autocomplete="off" spellcheck="false" value="${esc(state.search)}" placeholder="${esc(t().search)}"><div id="food-results">${foodsList()}</div>`;}
  function render(){document.documentElement.lang=state.lang;document.title=t().title;$('#brand-name').textContent=t().brand;$('#brand-sub').textContent=t().tagline;$('.lang-switch').setAttribute('aria-label','Idioma / Lingua');$$('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===state.lang)));[['day','nav-day'],['week','nav-week'],['recipes','nav-recipes'],['foods','nav-foods']].forEach(([key,id])=>$('#'+id).textContent=t()[key]);$$('.nav-item').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);if(b.dataset.view===state.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});main.innerHTML=state.view==='day'?dayView():state.view==='week'?weekView():state.view==='recipes'?recipesView():foodsView();$('#dialog-close').setAttribute('aria-label',t().close);}
  function openModal(kicker,title,content,context){$('#dialog-kicker').textContent=kicker;$('#dialog-title').textContent=title;$('#dialog-content').innerHTML=content;state.dialog=context;dlg.showModal();}
  function closeModal(){if(dlg.open)dlg.close();state.dialog=null;}
  function openOptions(day,kind,index){const o=occurrence(day,kind,index);if(!o)return;const options=getOptions(o.item);const selected=choiceIndex(day,kind,index,o.item);const content=`<div class="option-list">${options.map((x,i)=>`<button type="button" class="option ${selected===i?'selected':''}" data-action="choose" data-day="${day}" data-kind="${kind}" data-index="${index}" data-choice="${i}" aria-pressed="${selected===i}"><span class="option-bullet" aria-hidden="true"></span><span class="option-name">${localized(x)}${i===0?` <small>· ${esc(t().original)}</small>`:''}</span><strong class="option-qty">${esc(x.qty)}</strong></button>`).join('')}</div><p class="modal-help">${esc(t().altInfo)}</p>`;openModal(occLabel(o),local(o.item),content,{type:'options',day,kind,index});}
  function openFood(foodName){const f=state.foodIndex.find(x=>x.food.it===foodName);if(!f)return;const content=`<h3 class="dialog-subtitle">${esc(t().where)}</h3>${f.occurrences.map(o=>{const occ=occurrence(o.day,o.kind,o.index);const pick=getOptions(occ.item)[choiceIndex(o.day,o.kind,o.index,occ.item)];return `<div class="occurrence"><div class="occurrence-head"><strong>${esc(occLabel(o))}</strong><strong>${esc(o.role==='alternative'?f.food.qty:occ.item.qty)}</strong></div>${o.role==='alternative'?`<small>${esc(t().asAlternative)}: ${localized(occ.item)} · ${esc(occ.item.qty)}</small>`:''}<small>${esc(t().chosen)}: ${localized(pick)} · ${esc(pick.qty)}</small>${occ.item.alternatives?.length?`<button type="button" class="simple-link" data-action="options" data-day="${o.day}" data-kind="${o.kind}" data-index="${o.index}">${esc(t().showAlternatives)} →</button>`:`<p class="modal-help">${esc(t().noAlts)}</p>`}</div>`;}).join('')}`;openModal(t().foods,local(f.food),content,{type:'food',foodName});}
  function openRecipe(id){const r=state.data.recipes.find(x=>x.id===id);if(!r)return;let html=`<p class="modal-help">${esc(t().recipeContext)}: ${esc(dayName(r.day))} · ${esc(t().meal[r.meal])}</p>`;
    if(r.ingredients){html+=`<h3 class="dialog-subtitle">${esc(t().recipeIngredients)}</h3><ul class="ingredient-list">${r.ingredients.map(i=>`<li>${localized(i)}</li>`).join('')}</ul>`;}
    if(r.steps){html+=`<h3 class="dialog-subtitle">${esc(t().recipeSteps)}</h3><ol class="procedure-list">${r.steps.map(s=>`<li>${localized(s)}</li>`).join('')}</ol>`;}
    if(r.details)html+=`<h3 class="dialog-subtitle">${esc(t().recipeSteps)}</h3><p class="modal-help">${localized(r.details)}</p>`;
    if(r.note)html+=`<div class="dialog-note"><strong>${esc(t().recipeNotes)}:</strong> ${localized(r.note)}</div>`;
    html+=`<button type="button" class="simple-link" data-action="day" data-day="${r.day}">${esc(t().backToDay)} →</button>`;
    openModal(t().recipes,local(r.title),html,{type:'recipe',id});
  }
  function announce(msg){$('#status-announcer').textContent=msg;}
  function visitDay(id){if(!days.includes(id))return;state.day=id;state.view='day';closeModal();render();window.scrollTo({top:0,behavior:'instant'});}
  function navigate(view){if(!['day','week','recipes','foods'].includes(view))return;state.view=view;closeModal();render();window.scrollTo({top:0,behavior:'instant'});}
  function selectLang(lang){if(!messages[lang]||state.lang===lang)return;state.lang=lang;save();buildFoodIndex();const d=state.dialog;render();if(d){if(d.type==='options'){$('#dialog-content').innerHTML='';closeModal();openOptions(d.day,d.kind,d.index);}else if(d.type==='recipe'){closeModal();openRecipe(d.id);}else if(d.type==='food'){closeModal();openFood(d.foodName);}}}
  document.addEventListener('click',e=>{
    const lang=e.target.closest('[data-lang]');if(lang){selectLang(lang.dataset.lang);return;}
    const nav=e.target.closest('.nav-item[data-view]');if(nav){navigate(nav.dataset.view);return;}
    const a=e.target.closest('button[data-action]');if(!a||!state.data)return;
    const {action,day,kind,index,id,choice,food,view}=a.dataset;
    if(action==='day')visitDay(day);
    if(action==='view')navigate(view);
    if(action==='recipe')openRecipe(id);
    if(action==='food')openFood(food);
    if(action==='options'){closeModal();openOptions(day,kind,Number(index));}
    if(action==='choose'){
      const o=occurrence(day,kind,Number(index));const number=Number(choice);
      if(!o||!Number.isInteger(number)||number<0||number>=getOptions(o.item).length)return;
      const key=occKey(day,kind,Number(index));if(number===0)delete state.choices[key];else state.choices[key]=number;
      save();closeModal();render();announce(t().changed);
    }
  });
  main.addEventListener('input',e=>{if(e.target.id==='search-food'){state.search=e.target.value;$('#food-results').innerHTML=foodsList();}});
  $('#dialog-close').addEventListener('click',closeModal);
  dlg.addEventListener('click',e=>{if(e.target===dlg)closeModal();});
  dlg.addEventListener('close',()=>{state.dialog=null;});
  async function init(){try{
      const response=await fetch('./data/plan.json',{cache:'no-cache'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();if(!Array.isArray(data.days)||data.days.length!==6||!Array.isArray(data.recipes))throw new Error('Estructura de datos inválida');
      state.data=data;buildFoodIndex();render();
      if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
    }catch(err){console.error('Error al cargar el plan:',err);main.innerHTML=`<div class="error-state">${esc(t().loadError)}</div>`;}}
  init();
})();
