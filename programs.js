(function(){
const RP_KEY="rodas.routinesPrograms.v1";
const rpState={section:"routines",programDetail:null};
let programCatalog=[
 {id:"hypertrophy-12",name:"Hipertrofia · 12 semanas",description:"Programa progresivo de torso y pierna.",duration:12,status:"Publicado",version:1,active:true,phases:[
  {id:"p1",name:"Adaptación",from:1,to:2,type:"Normal",routineId:"full-personal"},
  {id:"p2",name:"Volumen",from:3,to:6,type:"Normal",routineId:"push-a"},
  {id:"p3",name:"Intensificación",from:7,to:10,type:"Normal",routineId:"legs-a"},
  {id:"p4",name:"Descarga",from:11,to:11,type:"Descarga",routineId:"full-personal"},
  {id:"p5",name:"Evaluación",from:12,to:12,type:"Evaluación",routineId:"push-a"}
 ]}
];

function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function loadRP(){
 try{
  const raw=localStorage.getItem(RP_KEY);if(!raw)return;
  const saved=JSON.parse(raw);
  if(Array.isArray(saved.routines)&&saved.routines.length){routineCatalog.splice(0,routineCatalog.length);saved.routines.forEach(function(r){routineCatalog.push(r)})}
  if(Array.isArray(saved.programs)&&saved.programs.length)programCatalog=saved.programs;
 }catch(e){}
}
function saveRP(){try{localStorage.setItem(RP_KEY,JSON.stringify({routines:routineCatalog,programs:programCatalog}))}catch(e){}}
function ensureRoutineMeta(r){
 if(!r.status)r.status="Publicado";
 if(typeof r.version!=="number")r.version=1;
 if(typeof r.dirty!=="boolean")r.dirty=false;
 return r
}
function routineStatus(r){ensureRoutineMeta(r);return r.dirty?"Cambios sin publicar":r.status}
function routineStatusClass(r){const s=routineStatus(r);return s==="Borrador"?"draft":s==="Cambios sin publicar"?"dirty":"published"}
function programStatusClass(p){return p.status==="Borrador"?"draft":"published"}
function routineById(id){return routineCatalog.find(function(r){return r.id===id})}
function phaseRoutineName(ph){const r=routineById(ph.routineId);return r?r.name:"Sin rutina"}
function rpSwitcher(){
 return '<div class="rp-switcher"><button class="'+(rpState.section==="routines"?"active":"")+'" data-rp-section="routines">Rutinas</button><button class="'+(rpState.section==="programs"?"active":"")+'" data-rp-section="programs">Programas</button></div>'
}
function routineCard(r,i){
 ensureRoutineMeta(r);
 return '<article class="card routine routine-list-card rp-routine-card"><button class="routine-open" data-routine-detail="'+i+'"><div class="routine-top"><div><div class="routine-source">'+ic(r.personal?"user-round":"user-round-check")+' '+esc(r.source)+'</div><h3>'+esc(r.name)+'</h3><div class="muted">'+esc(r.subtitle)+'</div></div>'+ic("chevron-right")+'</div><div class="rp-card-status"><span class="rp-status '+routineStatusClass(r)+'">'+esc(routineStatus(r))+'</span><span>v'+r.version+'</span></div><div class="routine-meta"><span>'+ic("dumbbell")+' '+r.exercises.length+' ejercicios</span><span>'+ic("layers-3")+' '+routineSetCount(r)+' series</span><span>'+ic("clock-3")+' '+esc(r.duration)+'</span></div></button><div class="routine-quick-actions"><button class="small accent" data-start-routine="'+i+'">'+ic("play")+' Entrenar</button><button class="small" data-routine-detail="'+i+'">'+(r.personal?"Editar":"Ver detalle")+'</button></div></article>'
}
function routineList(){
 const items=routineCatalog.map(function(r,i){return {r:r,i:i}}).filter(function(x){return state.routineFilter==="personal"?!!x.r.personal:!x.r.personal});
 return '<section class="page">'+topbar()+
 '<div class="rp-heading"><div><div class="eyebrow">Planificación</div><h1>Rutinas</h1></div><button class="rp-create-btn" data-create-routine>'+ic("plus")+' Crear</button></div>'+
 rpSwitcher()+
 '<div class="routine-filter"><button class="filter-chip '+(state.routineFilter==="assigned"?"active":"")+'" data-routine-filter="assigned">Asignadas</button><button class="filter-chip '+(state.routineFilter==="personal"?"active":"")+'" data-routine-filter="personal">Propias</button></div>'+
 (items.length?items.map(function(x){return routineCard(x.r,x.i)}).join(""):'<article class="card rp-empty"><span>'+ic("list-plus")+'</span><h3>Sin rutinas aquí</h3><p>Crea una rutina o cambia de filtro.</p></article>')+
 '<div class="section"><div class="section-head"><h2>Biblioteca</h2></div><article class="card list-card"><button class="list-row" data-open-library><span class="list-icon">'+ic("library")+'</span><span class="list-copy"><span class="list-title">Ejercicios</span><span class="list-sub">Explorar biblioteca y ejercicios propios</span></span>'+ic("chevron-right")+'</button><button class="list-row" data-create-routine><span class="list-icon">'+ic("plus-circle")+'</span><span class="list-copy"><span class="list-title">Crear rutina</span><span class="list-sub">Nuevo borrador personal</span></span>'+ic("chevron-right")+'</button></article></div></section>'
}
function programCard(p,i){
 return '<article class="card rp-program-card"><button class="rp-program-open" data-rp-program="'+i+'"><div class="rp-program-top"><div><span class="rp-status '+programStatusClass(p)+'">'+esc(p.status)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.description||"")+'</p></div>'+ic("chevron-right")+'</div><div class="rp-program-meta"><span>'+ic("calendar-range")+' '+p.duration+' semanas</span><span>'+ic("layers-3")+' '+p.phases.length+' fases</span><span>v'+p.version+'</span></div></button></article>'
}
function programsList(){
 return '<section class="page">'+topbar()+
 '<div class="rp-heading"><div><div class="eyebrow">Planificación</div><h1>Programas</h1></div><button class="rp-create-btn" data-rp-create-program>'+ic("plus")+' Crear</button></div>'+
 rpSwitcher()+
 '<div class="rp-info-strip">'+ic("route")+' <span>Organiza rutinas por semanas y fases sin duplicar cada entrenamiento.</span></div>'+
 (programCatalog.length?programCatalog.map(programCard).join(""):'<article class="card rp-empty"><span>'+ic("route")+'</span><h3>Aún no hay programas</h3><p>Crea el primero para organizar varias semanas de entrenamiento.</p></article>')+
 '</section>'
}
function programDetailView(index){
 const p=programCatalog[index];
 return '<section class="page rp-program-detail"><div class="routine-detail-head"><button class="icon-btn" data-rp-program-back>'+ic("chevron-left")+'</button><div><span>Programa</span><strong>'+esc(p.name)+'</strong></div><button class="icon-btn" data-rp-program-menu="'+index+'">'+ic("ellipsis")+'</button></div>'+
 '<article class="card rp-program-hero"><div class="rp-program-hero-line"><span class="rp-status '+programStatusClass(p)+'">'+esc(p.status)+'</span><span>v'+p.version+'</span></div><h1>'+esc(p.name)+'</h1><p>'+esc(p.description||"")+'</p><div class="rp-program-kpis"><div><strong>'+p.duration+'</strong><span>Semanas</span></div><div><strong>'+p.phases.length+'</strong><span>Fases</span></div><div><strong>'+(p.active?"Activo":"Plantilla")+'</strong><span>Estado</span></div></div></article>'+
 '<div class="section"><div class="section-head"><h2>Fases</h2><button class="link" data-rp-add-phase="'+index+'">+ Añadir</button></div><div class="rp-phase-list">'+
 (p.phases.length?p.phases.map(function(ph,pi){return '<article class="card rp-phase-card"><div class="rp-phase-index">'+String(pi+1).padStart(2,"0")+'</div><div class="rp-phase-copy"><div><strong>'+esc(ph.name)+'</strong><span class="rp-phase-type">'+esc(ph.type)+'</span></div><p>Semanas '+ph.from+(ph.to!==ph.from?"–"+ph.to:"")+' · '+esc(phaseRoutineName(ph))+'</p></div><button class="icon-btn rp-phase-more" data-rp-phase-menu="'+index+':'+pi+'">'+ic("ellipsis")+'</button></article>'}).join(""):'<article class="card rp-empty compact"><p>Este programa todavía no tiene fases.</p></article>')+
 '</div></div>'+
 '<div class="rp-program-actions"><button class="secondary" data-rp-add-phase="'+index+'">'+ic("plus")+' Añadir fase</button><button class="primary" data-rp-publish-program="'+index+'">'+ic("send")+' '+(p.status==="Borrador"?"Publicar":"Publicar nueva versión")+'</button></div></section>'
}
function openCreateRoutineSheet(){
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rp-create-routine-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Nueva plantilla</div><h2>Crear rutina</h2></div><button class="icon-btn" id="rp-close-create-routine">'+ic("x")+'</button></div><label class="rp-field"><span>Nombre</span><input id="rp-routine-name" placeholder="Ej. Torso A" autocomplete="off"></label><label class="rp-field"><span>Descripción</span><input id="rp-routine-subtitle" placeholder="Ej. Pecho · Espalda · Hombros" autocomplete="off"></label><button class="primary rp-sheet-primary" id="rp-save-routine">Crear borrador</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("rp-close-create-routine").onclick=clearRest;
 document.getElementById("rp-create-routine-bg").onclick=function(ev){if(ev.target.id==="rp-create-routine-bg")clearRest()};
 document.getElementById("rp-save-routine").onclick=function(){
  const name=document.getElementById("rp-routine-name").value.trim();if(!name){document.getElementById("rp-routine-name").focus();return}
  const subtitle=document.getElementById("rp-routine-subtitle").value.trim()||"Rutina personal";
  routineCatalog.push({id:"personal-"+Date.now(),name:name,subtitle:subtitle,duration:"45 min",source:"Propia",editable:true,personal:true,status:"Borrador",version:0,dirty:true,exercises:[]});
  state.routineFilter="personal";state.routineDetail=routineCatalog.length-1;rpState.section="routines";clearRest();saveRP();render()
 }
}
function openCreateProgramSheet(){
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rp-create-program-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Nuevo programa</div><h2>Crear programa</h2></div><button class="icon-btn" id="rp-close-create-program">'+ic("x")+'</button></div><label class="rp-field"><span>Nombre</span><input id="rp-program-name" placeholder="Ej. Hipertrofia 12 semanas" autocomplete="off"></label><label class="rp-field"><span>Duración</span><select id="rp-program-duration"><option value="4">4 semanas</option><option value="6">6 semanas</option><option value="8">8 semanas</option><option value="12" selected>12 semanas</option><option value="16">16 semanas</option></select></label><label class="rp-field"><span>Descripción</span><input id="rp-program-description" placeholder="Objetivo o enfoque" autocomplete="off"></label><button class="primary rp-sheet-primary" id="rp-save-program">Crear borrador</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("rp-close-create-program").onclick=clearRest;
 document.getElementById("rp-create-program-bg").onclick=function(ev){if(ev.target.id==="rp-create-program-bg")clearRest()};
 document.getElementById("rp-save-program").onclick=function(){
  const name=document.getElementById("rp-program-name").value.trim();if(!name){document.getElementById("rp-program-name").focus();return}
  programCatalog.push({id:"program-"+Date.now(),name:name,description:document.getElementById("rp-program-description").value.trim(),duration:+document.getElementById("rp-program-duration").value,status:"Borrador",version:0,active:false,phases:[]});
  rpState.programDetail=programCatalog.length-1;clearRest();saveRP();render()
 }
}
function openAddPhaseSheet(pi){
 const p=programCatalog[pi];
 const routineOptions=routineCatalog.filter(function(r){return !r.archived}).map(function(r){return '<option value="'+esc(r.id)+'">'+esc(r.name)+'</option>'}).join("");
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rp-phase-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+esc(p.name)+'</div><h2>Añadir fase</h2></div><button class="icon-btn" id="rp-close-phase">'+ic("x")+'</button></div><label class="rp-field"><span>Nombre</span><input id="rp-phase-name" placeholder="Ej. Volumen"></label><div class="rp-field-grid"><label class="rp-field"><span>Desde semana</span><input id="rp-phase-from" type="number" min="1" max="'+p.duration+'" value="1"></label><label class="rp-field"><span>Hasta semana</span><input id="rp-phase-to" type="number" min="1" max="'+p.duration+'" value="'+p.duration+'"></label></div><label class="rp-field"><span>Tipo</span><select id="rp-phase-type"><option>Normal</option><option>Descarga</option><option>Evaluación</option><option>Transición</option></select></label><label class="rp-field"><span>Rutina</span><select id="rp-phase-routine">'+routineOptions+'</select></label><button class="primary rp-sheet-primary" id="rp-save-phase">Añadir fase</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("rp-close-phase").onclick=clearRest;
 document.getElementById("rp-phase-bg").onclick=function(ev){if(ev.target.id==="rp-phase-bg")clearRest()};
 document.getElementById("rp-save-phase").onclick=function(){
  const name=document.getElementById("rp-phase-name").value.trim();if(!name){document.getElementById("rp-phase-name").focus();return}
  let from=Math.max(1,+document.getElementById("rp-phase-from").value||1),to=Math.max(from,+document.getElementById("rp-phase-to").value||from);to=Math.min(p.duration,to);
  p.phases.push({id:"phase-"+Date.now(),name:name,from:from,to:to,type:document.getElementById("rp-phase-type").value,routineId:document.getElementById("rp-phase-routine").value});
  p.status="Borrador";clearRest();saveRP();render()
 }
}
function openProgramMenu(pi){
 const p=programCatalog[pi];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rp-program-menu-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Programa</div><h2>'+esc(p.name)+'</h2></div><button class="icon-btn" id="rp-close-program-menu">'+ic("x")+'</button></div><div class="sheet-actions"><button id="rp-duplicate-program">'+ic("copy")+' Duplicar</button><button id="rp-toggle-program">'+ic(p.active?"pause":"play")+' '+(p.active?"Marcar como plantilla":"Marcar activo")+'</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("rp-close-program-menu").onclick=clearRest;
 document.getElementById("rp-program-menu-bg").onclick=function(ev){if(ev.target.id==="rp-program-menu-bg")clearRest()};
 document.getElementById("rp-duplicate-program").onclick=function(){if(window.RodasLibraryLifecycle&&window.RodasLibraryLifecycle.duplicate){clearRest();window.RodasLibraryLifecycle.duplicate("program",p.id);return}const copy=JSON.parse(JSON.stringify(p));copy.id="program-"+Date.now();copy.name=p.name+" · copia";copy.status="Borrador";copy.version=0;copy.active=false;programCatalog.push(copy);rpState.programDetail=programCatalog.length-1;clearRest();render()};
 document.getElementById("rp-toggle-program").onclick=function(){p.active=!p.active;clearRest();render()}
}
function openPhaseMenu(pi,phaseIndex){
 const p=programCatalog[pi],ph=p.phases[phaseIndex];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rp-phase-menu-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Fase</div><h2>'+esc(ph.name)+'</h2></div><button class="icon-btn" id="rp-close-phase-menu">'+ic("x")+'</button></div><div class="sheet-actions"><button id="rp-duplicate-phase">'+ic("copy")+' Duplicar</button><button id="rp-delete-phase">'+ic("trash-2")+' Eliminar</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("rp-close-phase-menu").onclick=clearRest;
 document.getElementById("rp-phase-menu-bg").onclick=function(ev){if(ev.target.id==="rp-phase-menu-bg")clearRest()};
 document.getElementById("rp-duplicate-phase").onclick=function(){const cp=JSON.parse(JSON.stringify(ph));cp.id="phase-"+Date.now();cp.name=ph.name+" · copia";p.phases.splice(phaseIndex+1,0,cp);p.status="Borrador";clearRest();render()};
 document.getElementById("rp-delete-phase").onclick=function(){if(confirm("¿Eliminar esta fase?")){p.phases.splice(phaseIndex,1);p.status="Borrador";clearRest();render()}}
}

loadRP();
routineCatalog.forEach(ensureRoutineMeta);
window.RodasPrograms={
 getPrograms:function(){return programCatalog},
 getState:function(){return rpState},
 save:function(){saveRP()},
 getRoutineById:function(id){return routineById(id)}
};

const baseRoutineDetailView=routineDetailView;
routineDetailView=function(index){
 const r=ensureRoutineMeta(routineCatalog[index]);
 let html=baseRoutineDetailView(index);
 const status='<div class="rp-detail-status"><span class="rp-status '+routineStatusClass(r)+'">'+esc(routineStatus(r))+'</span><span>Versión '+r.version+'</span><span>Autoguardado</span></div>';
 html=html.replace('<article class="card routine-detail-hero">',status+'<article class="card routine-detail-hero">');
 if(r.personal){
  const action=r.status==="Borrador"||r.dirty?'<button class="primary" data-rp-publish-routine="'+index+'">'+ic("send")+' Publicar cambios</button>':'<button class="secondary" disabled>'+ic("check-circle-2")+' Publicada · v'+r.version+'</button>';
  html=html.replace('<div class="routine-permission">','<div class="rp-detail-toolbar">'+action+'<button class="secondary" data-rp-preview-routine="'+index+'">'+ic("eye")+' Vista previa</button></div><div class="routine-permission">');
 }
 return html
};

routines=function(){
 if(rpState.programDetail!==null)return programDetailView(rpState.programDetail);
 if(state.routineDetail!==null&&rpState.section==="routines")return routineDetailView(state.routineDetail);
 return rpState.section==="programs"?programsList():routineList()
};

createPersonalRoutine=openCreateRoutineSheet;

const baseEvents=events;
events=function(){
 baseEvents();
 document.querySelectorAll("[data-rp-section]").forEach(function(b){b.onclick=function(){rpState.section=b.dataset.rpSection;rpState.programDetail=null;state.routineDetail=null;render()}});
 document.querySelectorAll("[data-rp-program]").forEach(function(b){b.onclick=function(){rpState.programDetail=+b.dataset.rpProgram;render()}});
 const back=document.querySelector("[data-rp-program-back]");if(back)back.onclick=function(){rpState.programDetail=null;render()};
 const cp=document.querySelector("[data-rp-create-program]");if(cp)cp.onclick=openCreateProgramSheet;
 document.querySelectorAll("[data-rp-add-phase]").forEach(function(b){b.onclick=function(){openAddPhaseSheet(+b.dataset.rpAddPhase)}});
 document.querySelectorAll("[data-rp-program-menu]").forEach(function(b){b.onclick=function(){openProgramMenu(+b.dataset.rpProgramMenu)}});
 document.querySelectorAll("[data-rp-phase-menu]").forEach(function(b){b.onclick=function(){const p=b.dataset.rpPhaseMenu.split(":").map(Number);openPhaseMenu(p[0],p[1])}});
 document.querySelectorAll("[data-rp-publish-program]").forEach(function(b){b.onclick=function(){const p=programCatalog[+b.dataset.rpPublishProgram];p.version=Math.max(0,p.version)+1;p.status="Publicado";saveRP();render()}});
 document.querySelectorAll("[data-rp-publish-routine]").forEach(function(b){b.onclick=function(){const r=routineCatalog[+b.dataset.rpPublishRoutine];r.version=Math.max(0,r.version)+1;r.status="Publicado";r.dirty=false;saveRP();render()}});
 document.querySelectorAll("[data-rp-preview-routine]").forEach(function(b){b.onclick=function(){const r=routineCatalog[+b.dataset.rpPreviewRoutine];document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rp-preview-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Vista del entrenado</div><h2>'+esc(r.name)+'</h2></div><button class="icon-btn" id="rp-close-preview">'+ic("x")+'</button></div><div class="rp-preview-list">'+(r.exercises.length?r.exercises.map(function(e,i){return '<div><span>'+String(i+1).padStart(2,"0")+'</span><p><strong>'+esc(e.name)+'</strong><small>'+e.sets.length+' series'+(e.group?' · '+esc(e.group):'')+'</small></p></div>'}).join(""):'<div class="rp-preview-empty">Aún no hay ejercicios.</div>')+'</div></div></div>';if(window.lucide)lucide.createIcons();document.getElementById("rp-close-preview").onclick=clearRest;document.getElementById("rp-preview-bg").onclick=function(ev){if(ev.target.id==="rp-preview-bg")clearRest()}}});
};

const baseRender=render;
render=function(){saveRP();baseRender()};
render();
})();