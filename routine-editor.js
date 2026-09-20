(function(){
const reState={dayByRoutine:{}};

function reEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function markRoutineDirty(r){
 if(!r.personal)return;
 if(r.status==="Publicado")r.dirty=true;
 else r.status="Borrador";
}
function ensureDays(r){
 if(!Array.isArray(r.days)||!r.days.length){
  r.days=[{id:"day-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),name:r.personal?"Día 1":(r.name||"Día 1"),exercises:Array.isArray(r.exercises)?r.exercises:[]}];
 }
 r.days.forEach(function(d,i){
  if(!d.id)d.id="day-"+Date.now()+"-"+i;
  if(!d.name)d.name="Día "+(i+1);
  if(!Array.isArray(d.exercises))d.exercises=[];
 });
 return r.days
}
function currentDayIndex(ri){
 const r=routineCatalog[ri],days=ensureDays(r);
 const raw=reState.dayByRoutine[r.id];
 const idx=Number.isInteger(raw)?raw:0;
 return Math.max(0,Math.min(days.length-1,idx))
}
function currentDay(ri){
 const r=routineCatalog[ri],days=ensureDays(r),idx=currentDayIndex(ri);
 r.exercises=days[idx].exercises;
 return days[idx]
}
function setDay(ri,di){
 const r=routineCatalog[ri],days=ensureDays(r);
 reState.dayByRoutine[r.id]=Math.max(0,Math.min(days.length-1,di));
 r.exercises=days[reState.dayByRoutine[r.id]].exercises;
}
function routineTotals(r){
 const days=ensureDays(r);
 const exercises=days.reduce(function(a,d){return a+d.exercises.length},0);
 const sets=days.reduce(function(a,d){return a+d.exercises.reduce(function(s,e){return s+(Array.isArray(e.sets)?e.sets.length:0)},0)},0);
 return {days:days.length,exercises:exercises,sets:sets}
}
function reRoleLabel(s,si){
 if(s[6])return s[6];
 if(s[0]==="W")return "Calentamiento";
 return "Efectiva"
}
function normalizePrescription(e){
 if(!e.prescription)e.prescription={};
 if(e.prescription.reps==null){
  const vals=(e.sets||[]).map(function(s){return Number(s[3]||0)}).filter(Boolean);
  e.prescription.reps=vals.length?String(Math.max.apply(null,vals)):"10";
 }
 if(e.prescription.weight==null){
  const s=(e.sets||[]).find(function(x){return Number(x[2]||0)>0});
  e.prescription.weight=s?Number(s[2]):0;
 }
 if(e.prescription.rir==null)e.prescription.rir=2;
 if(e.prescription.rest==null)e.prescription.rest=90;
}
function reDayTabs(ri){
 const r=routineCatalog[ri],days=ensureDays(r),active=currentDayIndex(ri);
 return '<div class="re-days-wrap"><div class="re-days-scroll">'+days.map(function(d,i){return '<button class="re-day-tab '+(i===active?'active':'')+'" data-re-day="'+ri+':'+i+'"><span>'+reEsc(d.name)+'</span><small>'+d.exercises.length+' ej.</small></button>'}).join("")+(r.personal?'<button class="re-day-add" data-re-add-day="'+ri+'" aria-label="Añadir entrenamiento">'+ic("plus")+'</button>':"")+'</div>'+(r.personal?'<button class="re-day-menu" data-re-day-menu="'+ri+'">'+ic("ellipsis")+' Gestionar día</button>':"")+'</div>'
}

const previousRoutineDetailView=routineDetailView;
routineDetailView=function(index){
 const r=routineCatalog[index],day=currentDay(index),totals=routineTotals(r);
 let html=previousRoutineDetailView(index);
 const marker='<div class="rp-detail-status">';
 const pos=html.indexOf(marker);
 const tabs=reDayTabs(index);
 if(pos>=0){
  const heroEnd=html.indexOf('</article>',html.indexOf('<article class="card routine-detail-hero">'));
  if(heroEnd>=0)html=html.slice(0,heroEnd+10)+tabs+html.slice(heroEnd+10);
 }else{
  const heroEnd=html.indexOf('</article>',html.indexOf('<article class="card routine-detail-hero">'));
  if(heroEnd>=0)html=html.slice(0,heroEnd+10)+tabs+html.slice(heroEnd+10);
 }
 html=html.replace('<div class="section"><div class="section-head"><h2>Ejercicios</h2>','<div class="section re-exercise-section"><div class="section-head"><div><div class="re-section-kicker">Entrenamiento '+(currentDayIndex(index)+1)+' de '+totals.days+'</div><h2>'+reEsc(day.name)+'</h2></div>');
 html=html.replace('<div class="routine-detail-stats"><div><strong>'+day.exercises.length+'</strong><span>Ejercicios</span></div><div><strong>'+routineSetCount(r)+'</strong><span>Series</span></div><div><strong>'+reEsc(r.duration)+'</strong><span>Estimado</span></div></div>',
 '<div class="routine-detail-stats"><div><strong>'+totals.days+'</strong><span>Entrenamientos</span></div><div><strong>'+totals.exercises+'</strong><span>Ejercicios</span></div><div><strong>'+totals.sets+'</strong><span>Series</span></div></div>');
 return html
};

function openAddDaySheet(ri){
 const r=routineCatalog[ri],days=ensureDays(r);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="re-add-day-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+reEsc(r.name)+'</div><h2>Añadir entrenamiento</h2></div><button class="icon-btn" id="re-close-add-day">'+ic("x")+'</button></div><label class="rp-field"><span>Nombre</span><input id="re-new-day-name" value="Día '+(days.length+1)+'" autocomplete="off"></label><button class="primary rp-sheet-primary" id="re-save-day">Añadir día</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("re-close-add-day").onclick=clearRest;
 document.getElementById("re-add-day-bg").onclick=function(ev){if(ev.target.id==="re-add-day-bg")clearRest()};
 document.getElementById("re-save-day").onclick=function(){
  const name=document.getElementById("re-new-day-name").value.trim()||("Día "+(days.length+1));
  days.push({id:"day-"+Date.now(),name:name,exercises:[]});
  reState.dayByRoutine[r.id]=days.length-1;markRoutineDirty(r);clearRest();render()
 }
}
function openDayMenu(ri){
 const r=routineCatalog[ri],days=ensureDays(r),di=currentDayIndex(ri),day=days[di];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="re-day-menu-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Entrenamiento</div><h2>'+reEsc(day.name)+'</h2></div><button class="icon-btn" id="re-close-day-menu">'+ic("x")+'</button></div><div class="sheet-actions"><button id="re-rename-day">'+ic("pencil")+' Renombrar</button><button id="re-duplicate-day">'+ic("copy")+' Duplicar día</button><button id="re-delete-day" '+(days.length===1?'disabled':'')+'>'+ic("trash-2")+' Eliminar día</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("re-close-day-menu").onclick=clearRest;
 document.getElementById("re-day-menu-bg").onclick=function(ev){if(ev.target.id==="re-day-menu-bg")clearRest()};
 document.getElementById("re-rename-day").onclick=function(){const n=prompt("Nombre del entrenamiento",day.name);if(n&&n.trim()){day.name=n.trim();markRoutineDirty(r);clearRest();render()}};
 document.getElementById("re-duplicate-day").onclick=function(){const cp=JSON.parse(JSON.stringify(day));cp.id="day-"+Date.now();cp.name=day.name+" B";days.splice(di+1,0,cp);reState.dayByRoutine[r.id]=di+1;markRoutineDirty(r);clearRest();render()};
 document.getElementById("re-delete-day").onclick=function(){if(days.length<=1)return;if(confirm("¿Eliminar "+day.name+"?")){days.splice(di,1);reState.dayByRoutine[r.id]=Math.max(0,di-1);markRoutineDirty(r);clearRest();render()}};
}

const exerciseOptions=[
 {id:"bench",name:"Press banca",group:"Pecho",weight:70,reps:8,note:"Controlar la bajada."},
 {id:"incline-db",name:"Press inclinado con mancuernas",group:"Pecho",weight:24,reps:10,note:"Recorrido completo."},
 {id:"row",name:"Remo con barra",group:"Espalda",weight:65,reps:10,note:"Torso estable."},
 {id:"lat-pulldown",name:"Jalón al pecho",group:"Espalda",weight:45,reps:12,note:"Controla el retorno."},
 {id:"ohp",name:"Press militar",group:"Hombros",weight:40,reps:8,note:"Evita hiperextender."},
 {id:"lateral",name:"Elevaciones laterales",group:"Hombros",weight:10,reps:15,note:"Control y pausa arriba."},
 {id:"squat",name:"Sentadilla",group:"Piernas",weight:100,reps:6,note:"Profundidad consistente."},
 {id:"leg-press",name:"Prensa de piernas",group:"Piernas",weight:120,reps:12,note:"No bloquees rodillas."},
 {id:"rdl",name:"Peso muerto rumano",group:"Piernas",weight:80,reps:8,note:"Cadera atrás."},
 {id:"curl",name:"Curl inclinado",group:"Bíceps",weight:12,reps:10,note:"Sin balanceo."},
 {id:"triceps",name:"Extensión de tríceps",group:"Tríceps",weight:25,reps:12,note:"Codos estables."},
 {id:"pullup",name:"Dominadas",group:"Espalda",weight:0,reps:8,note:"Pecho hacia la barra."}
];
function newExerciseFromOption(o){
 return {id:o.id+"-"+Date.now(),name:o.name,note:o.note,prescription:{reps:String(o.reps),weight:o.weight,rir:2,rest:90},sets:[
  ["1","—",o.weight,o.reps,false,"","Efectiva"],
  ["2","—",o.weight,o.reps,false,"","Efectiva"],
  ["3","—",o.weight,o.reps,false,"","Efectiva"]
 ]}
}
openAddRoutineExerciseSheet=function(ri){
 const r=routineCatalog[ri],day=currentDay(ri);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="re-add-ex-bg"><div class="sheet re-library-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+reEsc(day.name)+'</div><h2>Agregar ejercicio</h2></div><button class="icon-btn" id="re-close-add-ex">'+ic("x")+'</button></div><div class="library-search">'+ic("search")+'<input id="re-ex-search" placeholder="Buscar ejercicio o músculo"></div><div class="re-ex-options" id="re-ex-options">'+exerciseOptions.map(function(o,i){return '<button data-re-ex-option="'+i+'"><span class="list-icon">'+ic("dumbbell")+'</span><span><strong>'+reEsc(o.name)+'</strong><small>'+reEsc(o.group)+' · 3 series sugeridas</small></span>'+ic("plus")+'</button>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("re-close-add-ex").onclick=clearRest;
 document.getElementById("re-add-ex-bg").onclick=function(ev){if(ev.target.id==="re-add-ex-bg")clearRest()};
 document.getElementById("re-ex-search").oninput=function(){const q=this.value.toLowerCase();document.querySelectorAll("[data-re-ex-option]").forEach(function(btn){btn.style.display=btn.textContent.toLowerCase().includes(q)?"":"none"})};
 document.querySelectorAll("[data-re-ex-option]").forEach(function(btn){btn.onclick=function(){day.exercises.push(newExerciseFromOption(exerciseOptions[+btn.dataset.reExOption]));r.exercises=day.exercises;markRoutineDirty(r);clearRest();render()}});
};

openRoutineExerciseSheet=function(ri,ei){
 const r=routineCatalog[ri],day=currentDay(ri),e=day.exercises[ei];normalizePrescription(e);
 const setRows=(e.sets||[]).map(function(s,si){
  return '<div class="re-set-editor-row"><select data-re-set-role="'+si+'"><option '+(reRoleLabel(s,si)==="Calentamiento"?'selected':'')+'>Calentamiento</option><option '+(reRoleLabel(s,si)==="Efectiva"?'selected':'')+'>Efectiva</option><option '+(reRoleLabel(s,si)==="Back-off"?'selected':'')+'>Back-off</option></select><input data-re-set-weight="'+si+'" inputmode="decimal" value="'+(s[2]||"")+'" placeholder="kg"><input data-re-set-reps="'+si+'" inputmode="numeric" value="'+(s[3]||"")+'" placeholder="reps"><button data-re-delete-set="'+si+'" aria-label="Eliminar serie">'+ic("x")+'</button></div>'
 }).join("");
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="re-edit-ex-bg"><div class="sheet re-editor-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+reEsc(day.name)+'</div><h2>'+reEsc(e.name)+'</h2></div><button class="icon-btn" id="re-close-edit-ex">'+ic("x")+'</button></div><div class="re-prescription-grid"><label class="rp-field"><span>RIR objetivo</span><input id="re-rir" type="number" min="0" max="10" value="'+e.prescription.rir+'"></label><label class="rp-field"><span>Descanso</span><select id="re-rest"><option value="60">60 s</option><option value="90">90 s</option><option value="120">2 min</option><option value="180">3 min</option></select></label></div><label class="rp-field"><span>Nota para el entrenado</span><input id="re-note" value="'+reEsc(e.note||"")+'" placeholder="Indicaciones técnicas"></label><div class="re-editor-title"><strong>Series</strong><button id="re-add-set-editor">'+ic("plus")+' Serie</button></div><div class="re-set-editor-head"><span>Tipo</span><span>kg</span><span>reps</span><span></span></div><div id="re-set-editor">'+setRows+'</div><div class="re-group-control"><button class="secondary" id="re-toggle-group">'+ic("link-2")+' '+(e.group?"Quitar de agrupación":"Convertir en superserie")+'</button></div><button class="primary rp-sheet-primary" id="re-save-exercise">Guardar cambios</button></div></div>';
 document.getElementById("re-rest").value=String(e.prescription.rest||90);
 if(window.lucide)lucide.createIcons();
 document.getElementById("re-close-edit-ex").onclick=clearRest;
 document.getElementById("re-edit-ex-bg").onclick=function(ev){if(ev.target.id==="re-edit-ex-bg")clearRest()};
 document.getElementById("re-add-set-editor").onclick=function(){
  const last=e.sets[e.sets.length-1]||["1","—",e.prescription.weight||0,Number(e.prescription.reps)||10,false,"","Efectiva"];
  e.sets.push([String(e.sets.length+1),"—",last[2],last[3],false,"",last[6]||"Efectiva"]);markRoutineDirty(r);clearRest();openRoutineExerciseSheet(ri,ei)
 };
 document.querySelectorAll("[data-re-delete-set]").forEach(function(btn){btn.onclick=function(){if(e.sets.length<=1)return;e.sets.splice(+btn.dataset.reDeleteSet,1);e.sets.forEach(function(s,i){if(s[0]!=="W")s[0]=String(i+1)});markRoutineDirty(r);clearRest();openRoutineExerciseSheet(ri,ei)}});
 document.getElementById("re-toggle-group").onclick=function(){
  if(e.group){
    const group=e.group;
    day.exercises.forEach(function(x){if(x.group===group){delete x.group;delete x.groupType}});
  }else{
    const mate=day.exercises[ei+1]||day.exercises[ei-1];
    if(!mate){alert("Agrega al menos otro ejercicio para crear una superserie.");return}
    const used={};day.exercises.forEach(function(x){if(x.group)used[x.group]=1});
    let group="A";
    for(let c=65;c<=90;c++){const candidate=String.fromCharCode(c);if(!used[candidate]){group=candidate;break}}
    e.group=group;e.groupType="superset";mate.group=group;mate.groupType="superset";
  }
  markRoutineDirty(r);clearRest();openRoutineExerciseSheet(ri,ei)
};
 document.getElementById("re-save-exercise").onclick=function(){
  e.prescription.rir=Math.max(0,Math.min(10,+document.getElementById("re-rir").value||0));
  e.prescription.rest=+document.getElementById("re-rest").value||90;
  e.note=document.getElementById("re-note").value.trim();
  e.sets.forEach(function(s,si){
   const role=document.querySelector("[data-re-set-role='"+si+"']").value;
   const w=Number(document.querySelector("[data-re-set-weight='"+si+"']").value.replace(",","."));
   const reps=Number(document.querySelector("[data-re-set-reps='"+si+"']").value);
   s[6]=role;s[2]=Number.isFinite(w)?w:0;s[3]=Number.isFinite(reps)?reps:0;s[0]=role==="Calentamiento"?"W":String(si+1)
  });
  const first=e.sets.find(function(s){return s[6]!=="Calentamiento"})||e.sets[0];
  e.prescription.weight=first?first[2]:0;e.prescription.reps=first?String(first[3]):"";
  markRoutineDirty(r);r.exercises=day.exercises;clearRest();render()
 };
};

startRoutine=function(index){
 const r=routineCatalog[index];
 if(!r)return;
 if(state.startedAt&&!confirm("Ya hay un entrenamiento en curso. ¿Reemplazarlo?"))return;
 const di=(state.routineDetail===index)?currentDayIndex(index):0;
 const days=ensureDays(r),day=days[di];
 clearInterval(state.workoutTimer);
 state.activeRoutineName=days.length>1?r.name+" · "+day.name:r.name;
 state.exercises=cloneExercises(day.exercises);
 normalizeWorkoutData();
 state.startedAt=null;state.elapsed=0;state.activeExercise=0;
 clearSavedWorkout();startWorkout();state.tab="workout";state.routineDetail=null;render()
};

function previewRoutineAllDays(ri){
 const r=routineCatalog[ri],days=ensureDays(r);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="re-preview-bg"><div class="sheet re-preview-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Vista del entrenado</div><h2>'+reEsc(r.name)+'</h2></div><button class="icon-btn" id="re-close-preview">'+ic("x")+'</button></div><div class="re-preview-days">'+days.map(function(d,di){return '<section><div class="re-preview-day-head"><strong>'+reEsc(d.name)+'</strong><span>'+d.exercises.length+' ejercicios</span></div>'+(d.exercises.length?d.exercises.map(function(e,i){normalizePrescription(e);return '<div class="re-preview-ex"><span>'+String(i+1).padStart(2,"0")+'</span><p><strong>'+reEsc(e.name)+'</strong><small>'+e.sets.length+' series · '+reEsc(e.prescription.reps)+' reps · RIR '+e.prescription.rir+' · '+Math.round(e.prescription.rest/60*10)/10+' min</small></p></div>'}).join(""):'<div class="re-preview-none">Sin ejercicios</div>')+'</section>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("re-close-preview").onclick=clearRest;
 document.getElementById("re-preview-bg").onclick=function(ev){if(ev.target.id==="re-preview-bg")clearRest()}
}

const previousEvents=events;
events=function(){
 previousEvents();
 document.querySelectorAll("[data-re-day]").forEach(function(btn){btn.onclick=function(){const p=btn.dataset.reDay.split(":").map(Number);setDay(p[0],p[1]);render()}});
 document.querySelectorAll("[data-re-add-day]").forEach(function(btn){btn.onclick=function(){openAddDaySheet(+btn.dataset.reAddDay)}});
 document.querySelectorAll("[data-re-day-menu]").forEach(function(btn){btn.onclick=function(){openDayMenu(+btn.dataset.reDayMenu)}});
 document.querySelectorAll("[data-add-routine-exercise]").forEach(function(btn){btn.onclick=function(){openAddRoutineExerciseSheet(+btn.dataset.addRoutineExercise)}});
 document.querySelectorAll("[data-edit-routine-exercise]").forEach(function(btn){btn.onclick=function(){const p=btn.dataset.editRoutineExercise.split(":").map(Number);openRoutineExerciseSheet(p[0],p[1])}});
 document.querySelectorAll("[data-move-exercise]").forEach(function(btn){btn.onclick=function(){const p=btn.dataset.moveExercise.split(":").map(Number),ri=p[0],ei=p[1],dir=p[2],r=routineCatalog[ri],day=currentDay(ri),next=ei+dir;if(next<0||next>=day.exercises.length)return;const tmp=day.exercises[ei];day.exercises[ei]=day.exercises[next];day.exercises[next]=tmp;r.exercises=day.exercises;markRoutineDirty(r);render()}});
 document.querySelectorAll("[data-rp-preview-routine]").forEach(function(btn){btn.onclick=function(){previewRoutineAllDays(+btn.dataset.rpPreviewRoutine)}});
};

routineCatalog.forEach(function(r){ensureDays(r);r.exercises=r.days[0].exercises});
render();
})();