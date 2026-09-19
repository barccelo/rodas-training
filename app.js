const state={tab:"home",routineDetail:null,routineFilter:"assigned",historyMode:"overview",historySession:null,historyExercise:null,profilePage:null,activeRoutineName:"Empuje A",startedAt:null,elapsed:0,workoutTimer:null,restTimer:null,restEndsAt:null,activeExercise:0,exercises:[
{id:"bench",name:"Press banca",note:"Controlar la bajada · 2 s. Mantener escápulas retraídas.",sets:[["W","40 × 10",40,10,false,""],["1","70 × 8",72.5,8,false,""],["2","70 × 8",72.5,8,false,""],["3","70 × 7",72.5,8,false,""]]},
{id:"ohp",name:"Press militar",note:"Evitar hiperextender la zona lumbar.",group:"A",groupType:"superset",sets:[["1","40 × 8",42.5,8,false,""],["2","40 × 8",42.5,8,false,""],["3","40 × 7",42.5,8,false,""]]},
{id:"dips",name:"Fondos",note:"RIR objetivo: 2.",group:"A",groupType:"superset",sets:[["1","BW × 10",0,10,false,""],["2","BW × 9",0,10,false,""],["3","BW × 8",0,9,false,""]]}
]};
const tabs=[["home","house","Inicio"],["routines","list-checks","Rutinas"],["workout","play","Entrenar"],["history","clock-3","Historial"],["profile","circle-user-round","Perfil"]];
const routineCatalog=[
 {id:"push-a",name:"Empuje A",subtitle:"Pecho · Hombros · Tríceps",duration:"52 min",source:"Entrenador",editable:true,exercises:[
  {id:"bench",name:"Press banca",note:"Controlar la bajada · 2 s. Mantener escápulas retraídas.",sets:[["W","40 × 10",40,10,false,""],["1","70 × 8",72.5,8,false,""],["2","70 × 8",72.5,8,false,""],["3","70 × 7",72.5,8,false,""]]},
  {id:"ohp",name:"Press militar",note:"Evitar hiperextender la zona lumbar.",group:"A",groupType:"superset",sets:[["1","40 × 8",42.5,8,false,""],["2","40 × 8",42.5,8,false,""],["3","40 × 7",42.5,8,false,""]]},
  {id:"dips",name:"Fondos",note:"RIR objetivo: 2.",group:"A",groupType:"superset",sets:[["1","BW × 10",0,10,false,""],["2","BW × 9",0,10,false,""],["3","BW × 8",0,9,false,""]]},
  {id:"lateral",name:"Elevaciones laterales",note:"Control y pausa arriba.",sets:[["1","10 × 15",10,15,false,""],["2","10 × 14",10,15,false,""],["3","10 × 13",10,15,false,""]]}
 ]},
 {id:"pull-a",name:"Tirón A",subtitle:"Espalda · Bíceps",duration:"58 min",source:"Entrenador",editable:true,exercises:[
  {id:"pullup",name:"Dominadas",note:"Pecho hacia la barra.",sets:[["1","BW × 8",0,8,false,""],["2","BW × 7",0,8,false,""],["3","BW × 6",0,7,false,""]]},
  {id:"row",name:"Remo con barra",note:"Mantén torso estable.",sets:[["1","65 × 10",67.5,10,false,""],["2","65 × 9",67.5,10,false,""],["3","65 × 8",67.5,9,false,""]]},
  {id:"curl",name:"Curl inclinado",note:"Sin balanceo.",sets:[["1","12 × 10",12,10,false,""],["2","12 × 9",12,10,false,""],["3","12 × 8",12,9,false,""]]}
 ]},
 {id:"legs-a",name:"Piernas A",subtitle:"Cuádriceps · Femoral · Gemelos",duration:"64 min",source:"Entrenador",editable:true,exercises:[
  {id:"squat",name:"Sentadilla",note:"Profundidad consistente.",sets:[["W","60 × 8",60,8,false,""],["1","100 × 6",102.5,6,false,""],["2","100 × 6",102.5,6,false,""],["3","100 × 5",102.5,6,false,""]]},
  {id:"rdl",name:"Peso muerto rumano",note:"Cadera atrás, espalda neutra.",sets:[["1","80 × 8",82.5,8,false,""],["2","80 × 8",82.5,8,false,""],["3","80 × 7",82.5,8,false,""]]},
  {id:"calf",name:"Elevación de gemelos",note:"Pausa arriba y abajo.",sets:[["1","60 × 15",60,15,false,""],["2","60 × 14",60,15,false,""],["3","60 × 13",60,15,false,""]]}
 ]}
,
 {id:"full-personal",name:"Full Body",subtitle:"Rutina personal",duration:"45 min",source:"Propia",editable:true,personal:true,exercises:[
  {id:"goblet",name:"Sentadilla goblet",note:"Ritmo controlado.",sets:[["1","24 × 12",24,12,false,""],["2","24 × 12",24,12,false,""],["3","24 × 10",24,12,false,""]]},
  {id:"pushup",name:"Flexiones",note:"Mantén línea corporal.",sets:[["1","BW × 15",0,15,false,""],["2","BW × 14",0,15,false,""],["3","BW × 12",0,15,false,""]]},
  {id:"cable-row",name:"Remo en polea",note:"Pausa atrás.",sets:[["1","45 × 12",45,12,false,""],["2","45 × 11",45,12,false,""],["3","45 × 10",45,12,false,""]]}
 ]}
];
function cloneExercises(items){return JSON.parse(JSON.stringify(items))}
function routineSetCount(r){return r.exercises.reduce(function(a,e){return a+e.sets.length},0)}
function routineGroupCount(r){const gs={};r.exercises.forEach(function(e){if(e.group)gs[e.group]=1});return Object.keys(gs).length}
const historySessions=[
 {id:"s1",date:"18 sep",relative:"Ayer",name:"Tirón A",duration:"1 h 08 min",volume:8420,sets:21,exercises:6,pr:1,items:[["Dominadas","3 series","BW × 8"],["Remo con barra","3 series","67,5 × 10"],["Jalón al pecho","3 series","50 × 12"],["Curl inclinado","3 series","12 × 10"]]},
 {id:"s2",date:"16 sep",relative:"Martes",name:"Empuje A",duration:"54 min",volume:7880,sets:20,exercises:7,pr:2,items:[["Press banca","4 series","72,5 × 8"],["Press militar","3 series","42,5 × 8"],["Fondos","3 series","BW × 10"],["Elevaciones laterales","3 series","10 × 15"]]},
 {id:"s3",date:"15 sep",relative:"Lunes",name:"Piernas A",duration:"1 h 12 min",volume:11260,sets:24,exercises:7,pr:1,items:[["Sentadilla","4 series","102,5 × 6"],["Peso muerto rumano","3 series","82,5 × 8"],["Prensa","3 series","150 × 10"],["Gemelos","4 series","60 × 15"]]},
 {id:"s4",date:"12 sep",relative:"12 sep",name:"Tirón A",duration:"1 h 02 min",volume:8100,sets:20,exercises:6,pr:0,items:[["Dominadas","3 series","BW × 7"],["Remo con barra","3 series","65 × 10"],["Curl inclinado","3 series","12 × 9"]]}
];
const exerciseHistory=[
 {id:"bench",name:"Press banca",muscle:"Pecho",best:"75 × 6",bestDate:"9 sep",volume:"2.320 kg",change:"+6,8%",trend:[62,66,64,70,72,76],recent:[["16 sep","72,5 × 8","4 series"],["9 sep","75 × 6","4 series"],["2 sep","70 × 8","4 series"]]},
 {id:"squat",name:"Sentadilla",muscle:"Piernas",best:"105 × 5",bestDate:"15 sep",volume:"3.240 kg",change:"+4,2%",trend:[74,72,78,79,82,86],recent:[["15 sep","102,5 × 6","4 series"],["8 sep","100 × 6","4 series"],["1 sep","97,5 × 6","4 series"]]},
 {id:"row",name:"Remo con barra",muscle:"Espalda",best:"70 × 8",bestDate:"18 sep",volume:"2.025 kg",change:"+5,1%",trend:[58,61,63,64,67,71],recent:[["18 sep","67,5 × 10","3 series"],["12 sep","65 × 10","3 series"],["5 sep","65 × 9","3 series"]]},
 {id:"ohp",name:"Press militar",muscle:"Hombros",best:"45 × 6",bestDate:"16 sep",volume:"1.020 kg",change:"+3,9%",trend:[55,57,58,61,62,65],recent:[["16 sep","42,5 × 8","3 series"],["9 sep","42,5 × 7","3 series"],["2 sep","40 × 8","3 series"]]}
];
const measurements=[
 {label:"Peso",value:"78,4 kg",delta:"−0,8 kg",when:"Hoy",icon:"scale"},
 {label:"Cintura",value:"82 cm",delta:"−1,5 cm",when:"15 sep",icon:"ruler"},
 {label:"Pecho",value:"104 cm",delta:"+1 cm",when:"15 sep",icon:"ruler"},
 {label:"Brazo",value:"38 cm",delta:"+0,5 cm",when:"15 sep",icon:"ruler"}
];
const STORAGE_KEY="rodas.activeWorkout.v1";
const HISTORY_KEY="rodas.history.v1";
const PREFS_KEY="rodas.preferences.v1";
const PHOTO_KEY="rodas.progressPhotos.v1";
const preferences={units:"kg",restSeconds:90,appearance:"system",sounds:true,haptics:true};
let progressPhotos=[
 {id:"p1",date:"19 ago",view:"Frente",label:"Inicio",mock:"front"},
 {id:"p2",date:"19 sep",view:"Frente",label:"Actual",mock:"front"}
];
function savePreferences(){try{localStorage.setItem(PREFS_KEY,JSON.stringify(preferences))}catch(e){}}
function restorePreferences(){try{const raw=localStorage.getItem(PREFS_KEY);if(raw)Object.assign(preferences,JSON.parse(raw))}catch(e){}applyAppearance()}
function savePhotos(){try{localStorage.setItem(PHOTO_KEY,JSON.stringify(progressPhotos))}catch(e){}}
function restorePhotos(){try{const raw=localStorage.getItem(PHOTO_KEY);if(raw){const saved=JSON.parse(raw);if(Array.isArray(saved))progressPhotos=saved}}catch(e){}}
function applyAppearance(){const root=document.documentElement;if(preferences.appearance==="system")delete root.dataset.theme;else root.dataset.theme=preferences.appearance}
function unitLabel(){return preferences.units==="lb"?"lb":"kg"}
function toDisplayWeight(kg){if(!kg)return "";return preferences.units==="lb"?Math.round(kg*2.20462*2)/2:kg}
function fromDisplayWeight(v){return preferences.units==="lb"?v/2.20462:v}
function displayMeasureWeight(text){if(preferences.units==="kg")return text;const n=parseFloat(String(text).replace(",","."));return Number.isFinite(n)?(Math.round(n*2.20462*10)/10).toString().replace(".",",")+" lb":text}
function haptic(ms){if(preferences.haptics&&navigator.vibrate)navigator.vibrate(ms||18)}
function chime(){if(!preferences.sounds)return;try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=880;gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.18)}catch(e){}}
function saveHistory(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(historySessions))}catch(e){}}
function restoreHistory(){try{const raw=localStorage.getItem(HISTORY_KEY);if(!raw)return;const saved=JSON.parse(raw);if(Array.isArray(saved)&&saved.length){historySessions.splice(0,historySessions.length);saved.forEach(function(s){historySessions.push(s)})}}catch(e){}}
function completedVolume(){return state.exercises.reduce(function(total,e){return total+e.sets.reduce(function(a,s){return a+(s[4]?Number(s[2]||0)*Number(s[3]||0):0)},0)},0)}
function addCompletedSession(){const completed=doneSets(),volume=Math.round(completedVolume()),items=state.exercises.map(function(e){const done=e.sets.filter(function(s){return s[4]});const best=done.reduce(function(best,s){const score=Number(s[2]||0)*Number(s[3]||0);return !best||score>best.score?{score:score,label:(s[2]?String(s[2]).replace(".",","):"BW")+" × "+s[3]}:best},null);return [e.name,done.length+" series",best?best.label:"—"]});historySessions.unshift({id:"local-"+Date.now(),date:new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short"}).format(new Date()),relative:"Ahora",name:state.activeRoutineName,duration:fmt(state.elapsed).replace(/^00:/,""),volume:volume,sets:completed,exercises:state.exercises.length,pr:0,items:items});saveHistory()}
function normalizeWorkoutData(){state.exercises.forEach(function(e){e.sets.forEach(function(s){if(s.length<6)s[5]=""})})}
function groupMembers(group){return state.exercises.map(function(e,i){return e.group===group?i:-1}).filter(function(i){return i>=0})}
function nextGroupTarget(ei){const e=state.exercises[ei];if(!e.group)return null;const members=groupMembers(e.group);const pos=members.indexOf(ei);if(pos<0)return null;if(pos<members.length-1)return members[pos+1];const allDone=members.every(function(idx){return state.exercises[idx].sets.every(function(s){return s[4]})});if(allDone){const last=Math.max.apply(null,members);return last<state.exercises.length-1?last+1:last}return members[0]}
function focusSet(ei,si){const row=document.querySelector('[data-set-row][data-ei="'+ei+'"][data-si="'+si+'"]');if(!row)return;document.querySelectorAll(".set-focused").forEach(function(el){el.classList.remove("set-focused")});row.classList.add("set-focused");row.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(function(){row.classList.remove("set-focused")},900)}
function saveWorkout(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({startedAt:state.startedAt,elapsed:state.elapsed,activeExercise:state.activeExercise,activeRoutineName:state.activeRoutineName,exercises:state.exercises}))}catch(e){}}
function restoreWorkout(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;const saved=JSON.parse(raw);if(saved.startedAt){state.startedAt=saved.startedAt;state.elapsed=Math.floor((Date.now()-saved.startedAt)/1000);state.activeExercise=Number.isInteger(saved.activeExercise)?saved.activeExercise:0;if(saved.activeRoutineName)state.activeRoutineName=saved.activeRoutineName;if(Array.isArray(saved.exercises))state.exercises=saved.exercises;normalizeWorkoutData();startWorkoutTimer()}}catch(e){}}
function clearSavedWorkout(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}}
function startWorkoutTimer(){clearInterval(state.workoutTimer);if(!state.startedAt)return;state.workoutTimer=setInterval(function(){state.elapsed=Math.floor((Date.now()-state.startedAt)/1000);const el=document.getElementById("workout-timer");if(el)el.textContent=fmt(state.elapsed);saveWorkout()},1000)}
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function dateLabel(){return new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(new Date()).replace(/^./,m=>m.toUpperCase())}
function topbar(){return '<div class="topbar"><div class="brandmark"><span class="brand-dot"></span><span class="brand-name">RODAS</span></div><button class="icon-btn" data-notifications aria-label="Notificaciones">'+ic("bell")+'</button></div>'}
function row(icon,title,sub){return '<button class="list-row"><span class="list-icon">'+ic(icon)+'</span><span class="list-copy"><span class="list-title">'+title+'</span><span class="list-sub">'+sub+'</span></span>'+ic("chevron-right")+'</button>'}

function home(){
const active=state.startedAt?'<button class="status-banner" data-go="workout">'+ic("timer")+' Entrenamiento en curso · toca para continuar</button>':"";
return '<section class="page">'+topbar()+active+
'<div class="eyebrow">'+dateLabel()+'</div><h1>Buenas tardes.</h1>'+
'<article class="card hero">'+
'<div class="hero-label">'+ic("dumbbell")+' Entrenamiento de hoy</div>'+
'<div class="hero-title">Empuje A</div>'+
'<div class="hero-meta">Pecho · Hombros · Tríceps</div>'+
'<div class="hero-stats">'+
'<div class="hero-stat"><strong>7</strong><span>Ejercicios</span></div>'+
'<div class="hero-stat"><strong>20</strong><span>Series</span></div>'+
'<div class="hero-stat"><strong>52 min</strong><span>Estimado</span></div>'+
'</div>'+
'<div class="hero-actions"><button class="primary" id="start-home">'+ic(state.startedAt?"play":"play")+(state.startedAt?"Continuar":"Comenzar")+'</button><button class="secondary" data-go="routines">Ver rutina</button></div>'+
'</article>'+
'<div class="section"><div class="section-head"><h2>Esta semana</h2><span class="caption">3 de 4 completados</span></div><article class="card week"><div class="week-days">'+
[['L','14','done'],['M','15',''],['X','16','done'],['J','17',''],['V','18','done'],['S','19','today'],['D','20','']].map(function(d){return '<div class="day '+d[2]+'"><span>'+d[0]+'</span><strong>'+d[1]+'</strong>'+(d[2]==='done'?ic("check"):"")+'</div>'}).join("")+
'</div></article></div>'+
'<div class="section"><div class="section-head"><h2>Progreso</h2><button class="link" data-go="history">Ver todo</button></div><div class="metric-grid">'+
'<article class="card metric"><div class="metric-icon">'+ic("chart-no-axes-combined")+'</div><div class="metric-value">18.420 kg</div><div class="metric-label">Volumen semanal</div><div class="delta">↑ 8,4%</div></article>'+
'<article class="card metric"><div class="metric-icon">'+ic("flame")+'</div><div class="metric-value">6 sem.</div><div class="metric-label">Racha actual</div><div class="caption" style="margin-top:6px">Mejor: 9</div></article>'+
'</div></div>'+
'<div class="section"><div class="section-head"><h2>Para ti</h2></div><article class="card list-card">'+
row("message-square-text","Nota del entrenador","Press banca · controla la bajada durante 2 s")+
row("sparkles","Rutina actualizada","Empuje A recibió ajustes hoy")+
'</article></div></section>'}

function routines(){
 if(state.routineDetail!==null)return routineDetailView(state.routineDetail);
 return '<section class="page">'+topbar()+'<div class="eyebrow">Programa actual</div><h1>Rutinas</h1>'+
 '<div class="routine-filter"><button class="filter-chip '+(state.routineFilter==='assigned'?'active':'')+'" data-routine-filter="assigned">Asignadas</button><button class="filter-chip '+(state.routineFilter==='personal'?'active':'')+'" data-routine-filter="personal">Propias</button></div>'+
 routineCatalog.map(function(r,i){return {r:r,i:i}}).filter(function(x){return state.routineFilter==="personal"?!!x.r.personal:!x.r.personal}).map(function(x){const r=x.r,i=x.i;
   return '<article class="card routine routine-list-card"><button class="routine-open" data-routine-detail="'+i+'"><div class="routine-top"><div><div class="routine-source">'+ic("user-round-check")+' '+r.source+'</div><h3>'+r.name+'</h3><div class="muted">'+r.subtitle+'</div></div>'+ic("chevron-right")+'</div><div class="routine-meta"><span>'+ic("dumbbell")+' '+r.exercises.length+' ejercicios</span><span>'+ic("layers-3")+' '+routineSetCount(r)+' series</span><span>'+ic("clock-3")+' '+r.duration+'</span></div></button><div class="routine-quick-actions"><button class="small accent" data-start-routine="'+i+'">'+ic("play")+' Entrenar</button><button class="small" data-routine-detail="'+i+'">Ver detalle</button></div></article>'
 }).join("")+
 '<div class="section"><div class="section-head"><h2>Biblioteca</h2></div><article class="card list-card"><button class="list-row" data-open-library><span class="list-icon">'+ic("library")+'</span><span class="list-copy"><span class="list-title">Ejercicios</span><span class="list-sub">Explorar biblioteca y ejercicios propios</span></span>'+ic("chevron-right")+'</button><button class="list-row" data-create-routine><span class="list-icon">'+ic("plus-circle")+'</span><span class="list-copy"><span class="list-title">Crear rutina</span><span class="list-sub">Diseña una rutina personal</span></span>'+ic("chevron-right")+'</button></article></div></section>'
}

function routineDetailView(index){
 const r=routineCatalog[index];
 return '<section class="page routine-detail-page">'+
 '<div class="routine-detail-head"><button class="icon-btn" data-close-routine>'+ic("chevron-left")+'</button><div><span>Rutina</span><strong>'+r.name+'</strong></div><button class="icon-btn">'+ic("ellipsis")+'</button></div>'+
 '<article class="card routine-detail-hero"><div class="routine-detail-source">'+ic(r.personal?"user-round":"user-round-check")+' '+(r.personal?"Rutina personal":"Asignada por tu entrenador")+'</div><h1>'+r.name+'</h1><p>'+r.subtitle+'</p><div class="routine-detail-stats"><div><strong>'+r.exercises.length+'</strong><span>Ejercicios</span></div><div><strong>'+routineSetCount(r)+'</strong><span>Series</span></div><div><strong>'+r.duration+'</strong><span>Estimado</span></div></div><button class="primary" data-start-routine="'+index+'">'+ic("play")+' Comenzar rutina</button></article>'+
 '<div class="routine-permission">'+ic("sliders-horizontal")+' <span><strong>'+(r.personal?"Edición completa":"Ajustes personales permitidos")+'</strong><br>'+(r.personal?"Puedes modificar libremente esta rutina.":"Puedes cambiar orden, series y agrupaciones para tu sesión. La rutina original del entrenador no se modifica.")+'</span></div>'+
 '<div class="section"><div class="section-head"><h2>Ejercicios</h2><span class="caption">'+(routineGroupCount(r)?routineGroupCount(r)+' agrupación':'Sin agrupaciones')+'</span></div>'+
 r.exercises.map(function(e,ei){
   const group=e.group?'<span class="routine-group-tag">'+e.group+'</span>':"";
   return '<article class="card routine-exercise '+(e.group?'grouped':'')+'"><div class="routine-drag">'+ic("grip-vertical")+'</div><div class="routine-exercise-copy">'+group+'<strong>'+e.name+'</strong><span>'+e.sets.length+' series'+(e.note?' · '+e.note:'')+'</span></div><div class="routine-stepper"><button data-move-exercise="'+index+':'+ei+':-1" '+(ei===0?'disabled':'')+'>'+ic("chevron-up")+'</button><button data-move-exercise="'+index+':'+ei+':1" '+(ei===r.exercises.length-1?'disabled':'')+'>'+ic("chevron-down")+'</button></div><button class="routine-edit-btn" data-edit-routine-exercise="'+index+':'+ei+'">'+ic("ellipsis")+'</button></article>'
 }).join("")+
 '<button class="routine-add-exercise" data-add-routine-exercise="'+index+'">'+ic("plus")+' Agregar ejercicio</button></div>'+
 '</section>'
}

function openRoutineExerciseSheet(ri,ei){
 const r=routineCatalog[ri],e=r.exercises[ei];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="routine-sheet-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+r.name+'</div><h2>'+e.name+'</h2></div><button class="icon-btn" id="close-routine-sheet">'+ic("x")+'</button></div><div class="routine-sheet-summary"><span>'+e.sets.length+' series</span><span>'+(e.group?'Grupo '+e.group:'Sin agrupación')+'</span></div><div class="sheet-actions"><button id="routine-add-set">'+ic("plus")+' Agregar serie</button><button id="routine-remove-set">'+ic("minus")+' Quitar serie</button><button id="routine-toggle-group">'+ic("link-2")+' '+(e.group?'Quitar grupo':'Agrupar')+'</button><button id="routine-note">'+ic("message-square-text")+' Nota</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-routine-sheet").onclick=clearRest;
 document.getElementById("routine-sheet-bg").onclick=function(ev){if(ev.target.id==="routine-sheet-bg")clearRest()};
 document.getElementById("routine-add-set").onclick=function(){const last=e.sets[e.sets.length-1]||["1","—",0,10,false,""];e.sets.push([String(e.sets.length+1),"—",last[2],last[3],false,""]);clearRest();render()};
 document.getElementById("routine-remove-set").onclick=function(){if(e.sets.length>1)e.sets.pop();clearRest();render()};
 document.getElementById("routine-toggle-group").onclick=function(){if(e.group){delete e.group;delete e.groupType}else{e.group="B";e.groupType="superset"}clearRest();render()};
 document.getElementById("routine-note").onclick=function(){const note=prompt("Nota para "+e.name,e.note||"");if(note!==null)e.note=note.trim();clearRest();render()}
}

function openAddRoutineExerciseSheet(ri){
 const options=[
  {id:"lat-pulldown",name:"Jalón al pecho",note:"Controla el retorno.",sets:[["1","45 × 12",45,12,false,""],["2","45 × 12",45,12,false,""],["3","45 × 10",45,12,false,""]]},
  {id:"leg-press",name:"Prensa de piernas",note:"No bloquees rodillas.",sets:[["1","120 × 12",120,12,false,""],["2","120 × 12",120,12,false,""],["3","120 × 10",120,12,false,""]]},
  {id:"triceps",name:"Extensión de tríceps",note:"Codos estables.",sets:[["1","25 × 12",25,12,false,""],["2","25 × 12",25,12,false,""],["3","25 × 10",25,12,false,""]]}
 ];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="add-ex-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Biblioteca</div><h2>Agregar ejercicio</h2></div><button class="icon-btn" id="close-add-ex">'+ic("x")+'</button></div><div class="add-ex-list">'+options.map(function(o,i){return '<button data-add-ex-option="'+i+'"><span class="list-icon">'+ic("dumbbell")+'</span><span><strong>'+o.name+'</strong><small>3 series sugeridas</small></span>'+ic("plus")+'</button>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-add-ex").onclick=clearRest;
 document.getElementById("add-ex-bg").onclick=function(ev){if(ev.target.id==="add-ex-bg")clearRest()};
 document.querySelectorAll("[data-add-ex-option]").forEach(function(b){b.onclick=function(){routineCatalog[ri].exercises.push(JSON.parse(JSON.stringify(options[+b.dataset.addExOption])));clearRest();render()}})
}

function startRoutine(index){
 const r=routineCatalog[index];
 if(state.startedAt&&!confirm("Ya hay un entrenamiento en curso. ¿Reemplazarlo por "+r.name+"?"))return;
 clearInterval(state.workoutTimer);
 state.activeRoutineName=r.name;
 state.exercises=cloneExercises(r.exercises);
 normalizeWorkoutData();
 state.startedAt=null;state.elapsed=0;state.activeExercise=0;
 clearSavedWorkout();startWorkout();state.tab="workout";state.routineDetail=null;render()
}

function totalSets(){return state.exercises.reduce(function(a,e){return a+e.sets.length},0)}
function doneSets(){return state.exercises.reduce(function(a,e){return a+e.sets.filter(function(s){return s[4]}).length},0)}
function fmt(sec){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(function(v){return String(v).padStart(2,"0")}).join(":")}

function groupBanner(e,ei){if(!e.group)return "";const members=groupMembers(e.group);if(members[0]!==ei)return "";const label=e.groupType==="superset"?"Superserie":"Supraserie";return '<div class="group-banner"><span class="group-badge">'+e.group+'</span><div><strong>'+label+'</strong><span>'+members.length+' ejercicios · alterna sin descanso entre ellos</span></div>'+ic("link-2")+'</div>'}

function exerciseCard(e,ei){
const complete=e.sets.filter(function(s){return s[4]}).length;
const isActive=state.activeExercise===ei;
return groupBanner(e,ei)+'<article class="card exercise-card '+(isActive?'exercise-active ':'')+(e.group?'exercise-grouped':'')+'" id="exercise-'+ei+'">'+
'<div class="exercise-topline"><div class="exercise-index">'+String(ei+1).padStart(2,"0")+'</div><div class="exercise-heading"><h3>'+e.name+'</h3><div class="caption">'+complete+' de '+e.sets.length+' series completadas</div></div>'+
'<button class="exercise-menu" data-exercise-menu="'+ei+'">'+ic("ellipsis")+'</button></div>'+
'<div class="exercise-quick"><button class="quick-chip" data-exercise-history="'+ei+'">'+ic("history")+' Historial</button><button class="quick-chip" data-exercise-note="'+ei+'">'+ic("message-square-text")+' Nota</button><button class="quick-chip" data-rest-now>'+ic("timer-reset")+' Descanso</button></div>'+(isActive?'<div class="gesture-hint">'+ic("move-vertical")+' Peso/reps · '+ic("move-horizontal")+' Series</div>':"")+
'<div class="note">'+ic("message-square-text")+e.note+'</div>'+
'<div class="sets"><div class="set-row head"><div>Serie</div><div>Anterior</div><div>'+unitLabel()+'</div><div>reps</div><div></div></div>'+
e.sets.map(function(s,si){
return '<div class="set-block"><div class="set-row '+(s[4]?'set-done':'')+'" data-set-row data-ei="'+ei+'" data-si="'+si+'">'+
'<button class="set-tag '+(s[0]==="W"?"warmup":s[0]==="F"?"failed":s[0]==="P"?"partial":"")+'" data-set-options data-ei="'+ei+'" data-si="'+si+'">'+s[0]+'</button>'+
'<div class="previous">'+s[1]+'</div>'+
'<input class="set-input" inputmode="decimal" value="'+toDisplayWeight(s[2])+'" data-ei="'+ei+'" data-si="'+si+'" data-f="2" aria-label="Peso">'+
'<input class="set-input" inputmode="numeric" value="'+s[3]+'" data-ei="'+ei+'" data-si="'+si+'" data-f="3" aria-label="Repeticiones">'+
'<button class="check '+(s[4]?"done":"")+'" data-check data-ei="'+ei+'" data-si="'+si+'" aria-label="Completar serie">'+ic("check")+'</button></div>'+(s[5]?'<button class="set-note-line" data-set-options data-ei="'+ei+'" data-si="'+si+'">'+ic("sticky-note")+s[5]+'</button>':"")+'</div>'
}).join("")+
'</div><button class="add-set" data-add="'+ei+'">'+ic("plus")+' Agregar serie</button></article>'
}

function workout(){
if(!state.startedAt){
return '<section class="page">'+topbar()+'<div class="eyebrow">Entrenamiento</div><h1>'+state.activeRoutineName+'</h1><article class="card" style="padding:28px 18px;text-align:center"><div class="list-icon" style="margin:0 auto 14px;width:58px;height:58px">'+ic("dumbbell")+'</div><h2 style="margin-bottom:6px">Listo para entrenar</h2><p class="muted">7 ejercicios · aproximadamente 52 minutos.</p><button class="primary" id="start-workout">Comenzar entrenamiento</button></article></section>'
}
const progress=Math.round(doneSets()/totalSets()*100);
const current=state.activeExercise+1;
return '<section class="page workout-page">'+
'<header class="workout-head"><div class="workout-titlebar"><button class="workout-close" data-go="home">'+ic("chevron-down")+'</button><div class="workout-titlecopy"><strong>'+state.activeRoutineName+'</strong><span id="workout-timer">'+fmt(state.elapsed)+'</span></div><button class="workout-more">'+ic("ellipsis")+'</button></div>'+
'<div class="session-summary"><span>'+doneSets()+' / '+totalSets()+' series</span><span>'+progress+'%</span></div><div class="progress"><span style="width:'+progress+'%"></span></div></header>'+
'<div class="current-exercise-label"><span>Ejercicio '+current+' de '+state.exercises.length+'</span><button data-jump-active>'+ic("locate-fixed")+' Ir al actual</button></div>'+
state.exercises.map(exerciseCard).join("")+
'<div class="finish-zone"><div><strong>¿Terminaste?</strong><span>Revisa las series antes de cerrar la sesión.</span></div><button class="finish-btn" id="finish">Finalizar</button></div>'+
'<div class="session-dock"><button class="dock-nav" data-exercise-nav="-1" '+(state.activeExercise===0?'disabled':'')+'>'+ic("chevron-left")+'<span>Anterior</span></button><button class="dock-main" data-rest-now>'+ic("timer")+'<span>Descanso</span></button><button class="dock-nav" data-exercise-nav="1" '+(state.activeExercise===state.exercises.length-1?'disabled':'')+'><span>Siguiente</span>'+ic("chevron-right")+'</button></div>'+
'</section>'
}

function history(){
 if(state.historySession!==null)return historySessionDetail(state.historySession);
 if(state.historyExercise!==null)return historyExerciseDetail(state.historyExercise);
 return '<section class="page">'+topbar()+'<div class="eyebrow">Progreso</div><h1>Historial</h1>'+
 '<div class="history-tabs">'+
 ['overview','sessions','exercises','measures'].map(function(m){const labels={overview:"Resumen",sessions:"Sesiones",exercises:"Ejercicios",measures:"Medidas"};return '<button class="'+(state.historyMode===m?'active':'')+'" data-history-mode="'+m+'">'+labels[m]+'</button>'}).join("")+
 '</div>'+
 (state.historyMode==="overview"?historyOverview():state.historyMode==="sessions"?historySessionsView():state.historyMode==="exercises"?historyExercisesView():historyMeasuresView())+
 '</section>'
}

function miniBars(values){
 const max=Math.max.apply(null,values);
 return '<div class="mini-bars">'+values.map(function(v,i){return '<span style="height:'+Math.max(14,Math.round(v/max*100))+'%" class="'+(i===values.length-1?'last':'')+'"></span>'}).join("")+'</div>'
}

function historyOverview(){
 return '<div class="progress-hero-grid">'+
 '<article class="card progress-kpi"><div class="progress-kpi-top"><span>'+ic("chart-no-axes-combined")+'</span><small>Esta semana</small></div><strong>18.420 kg</strong><p>Volumen total</p><em>↑ 8,4%</em></article>'+
 '<article class="card progress-kpi"><div class="progress-kpi-top"><span>'+ic("calendar-check")+'</span><small>Últimos 7 días</small></div><strong>3</strong><p>Entrenamientos</p><em>75% del plan</em></article>'+
 '</div>'+
 '<div class="section"><div class="section-head"><h2>Volumen</h2><span class="caption">6 semanas</span></div><article class="card trend-card"><div class="trend-head"><div><strong>18.420 kg</strong><span>Semana actual</span></div><span class="delta">+8,4%</span></div>'+miniBars([58,64,61,72,78,84])+'<div class="trend-axis"><span>5 sem.</span><span>Hoy</span></div></article></div>'+
 '<div class="section"><div class="section-head"><h2>Marcas recientes</h2><button class="link" data-history-mode="exercises">Ver ejercicios</button></div><article class="card record-list">'+
 recordRow("trophy","Press banca","75 × 6","9 sep")+recordRow("trophy","Sentadilla","105 × 5","15 sep")+recordRow("trophy","Remo con barra","70 × 8","18 sep")+
 '</article></div>'+
 '<div class="section"><div class="section-head"><h2>Últimas sesiones</h2><button class="link" data-history-mode="sessions">Ver todas</button></div>'+historySessions.slice(0,2).map(sessionCard).join("")+'</div>'
}

function recordRow(icon,title,value,date){
 return '<div class="record-row"><span class="record-icon">'+ic(icon)+'</span><span class="record-copy"><strong>'+title+'</strong><small>'+date+'</small></span><b>'+value+'</b></div>'
}

function sessionCard(s,i){
 return '<button class="card session-card" data-history-session="'+historySessions.indexOf(s)+'"><div class="session-card-top"><div><span>'+s.relative+'</span><strong>'+s.name+'</strong></div><span>'+s.duration+'</span></div><div class="session-card-stats"><span><strong>'+s.volume.toLocaleString("es-ES")+' kg</strong><small>Volumen</small></span><span><strong>'+s.sets+'</strong><small>Series</small></span><span><strong>'+s.pr+'</strong><small>PR</small></span></div></button>'
}

function historySessionsView(){
 return '<div class="history-summary-line"><span>'+historySessions.length+' sesiones recientes</span><strong>'+historySessions.reduce(function(a,s){return a+s.volume},0).toLocaleString("es-ES")+' kg</strong></div>'+
 historySessions.map(sessionCard).join("")
}

function historyExercisesView(){
 return '<div class="exercise-history-list">'+exerciseHistory.map(function(e,i){return '<button class="card exercise-history-card" data-history-exercise="'+i+'"><span class="exercise-history-icon">'+ic("dumbbell")+'</span><span><strong>'+e.name+'</strong><small>'+e.muscle+' · Mejor '+e.best+'</small></span><span class="exercise-history-change">'+e.change+'</span>'+ic("chevron-right")+'</button>'}).join("")+'</div>'
}

function historyMeasuresView(){
 return '<div class="measure-grid">'+measurements.map(function(m){return '<article class="card measure-card"><span class="measure-icon">'+ic(m.icon)+'</span><small>'+m.label+'</small><strong>'+m.value+'</strong><em>'+m.delta+'</em><span>'+m.when+'</span></article>'}).join("")+'</div>'+
 '<button class="primary add-measure-btn" id="add-measure">'+ic("plus")+' Registrar medida</button>'+
 '<div class="section"><div class="section-head"><h2>Peso</h2><span class="caption">Últimas 6 semanas</span></div><article class="card trend-card"><div class="trend-head"><div><strong>78,4 kg</strong><span>Actual</span></div><span class="measure-down">−0,8 kg</span></div>'+miniBars([88,86,84,82,81,79])+'<div class="trend-axis"><span>12 ago</span><span>Hoy</span></div></article></div>'
}

function historySessionDetail(index){
 const s=historySessions[index];
 return '<section class="page history-detail-page"><div class="history-detail-head"><button class="icon-btn" data-close-history-detail>'+ic("chevron-left")+'</button><div><span>'+s.date+'</span><strong>'+s.name+'</strong></div><button class="icon-btn">'+ic("ellipsis")+'</button></div>'+
 '<article class="card history-session-hero"><span class="history-complete">'+ic("check-circle-2")+' Completado</span><h1>'+s.name+'</h1><p>'+s.relative+' · '+s.duration+'</p><div class="history-detail-kpis"><div><strong>'+s.volume.toLocaleString("es-ES")+' kg</strong><span>Volumen</span></div><div><strong>'+s.sets+'</strong><span>Series</span></div><div><strong>'+s.pr+'</strong><span>PR</span></div></div></article>'+
 '<div class="section"><div class="section-head"><h2>Ejercicios</h2><span class="caption">'+s.exercises+' total</span></div><article class="card history-exercise-lines">'+s.items.map(function(x){return '<div><span><strong>'+x[0]+'</strong><small>'+x[1]+'</small></span><b>'+x[2]+'</b></div>'}).join("")+'</article></div>'+
 '<div class="section"><article class="card session-note-card">'+ic("message-square-text")+'<div><strong>Comentario</strong><span>Sesión completada según lo programado. Buen control general de cargas.</span></div></article></div></section>'
}

function historyExerciseDetail(index){
 const e=exerciseHistory[index];
 return '<section class="page history-detail-page"><div class="history-detail-head"><button class="icon-btn" data-close-exercise-detail>'+ic("chevron-left")+'</button><div><span>'+e.muscle+'</span><strong>'+e.name+'</strong></div><button class="icon-btn">'+ic("ellipsis")+'</button></div>'+
 '<article class="card exercise-pr-hero"><span>'+ic("trophy")+' Mejor marca</span><h1>'+e.best+'</h1><p>'+e.bestDate+'</p><div class="history-detail-kpis"><div><strong>'+e.volume+'</strong><span>Volumen reciente</span></div><div><strong>'+e.change+'</strong><span>6 semanas</span></div><div><strong>'+e.recent.length+'</strong><span>Sesiones</span></div></div></article>'+
 '<div class="section"><div class="section-head"><h2>Tendencia</h2><span class="caption">6 semanas</span></div><article class="card trend-card">'+miniBars(e.trend)+'<div class="trend-axis"><span>Antes</span><span>Ahora</span></div></article></div>'+
 '<div class="section"><div class="section-head"><h2>Sesiones recientes</h2></div><article class="card recent-exercise-list">'+e.recent.map(function(r){return '<div><span><strong>'+r[0]+'</strong><small>'+r[2]+'</small></span><b>'+r[1]+'</b></div>'}).join("")+'</article></div></section>'
}

function profile(){
 if(state.profilePage==="settings")return settingsView();
 if(state.profilePage==="photos")return photosView();
 if(state.profilePage==="trainer")return trainerView();
 if(state.profilePage==="sync")return syncView();
 const weight=displayMeasureWeight(measurements[0].value);
 return '<section class="page">'+topbar()+
 '<article class="card profile"><div class="profile-avatar">D</div><h2 style="margin:0 0 3px">David</h2><div class="muted">Entrenado</div><div class="profile-kpis"><div><strong>'+weight+'</strong><span>Peso</span></div><div><strong>6 sem.</strong><span>Racha</span></div><div><strong>'+historySessions.length+'</strong><span>Sesiones</span></div></div></article>'+
 '<div class="section"><div class="section-head"><h2>Progreso</h2></div><article class="card list-card">'+
 '<button class="list-row" data-profile-history="overview"><span class="list-icon">'+ic("chart-no-axes-combined")+'</span><span class="list-copy"><span class="list-title">Estadísticas</span><span class="list-sub">Volumen, frecuencia y marcas</span></span>'+ic("chevron-right")+'</button>'+
 '<button class="list-row" data-profile-history="measures"><span class="list-icon">'+ic("ruler")+'</span><span class="list-copy"><span class="list-title">Medidas corporales</span><span class="list-sub">Peso y perímetros</span></span>'+ic("chevron-right")+'</button>'+
 '<button class="list-row" data-profile-page="photos"><span class="list-icon">'+ic("image")+'</span><span class="list-copy"><span class="list-title">Fotos de progreso</span><span class="list-sub">Comparaciones privadas</span></span>'+ic("chevron-right")+'</button>'+
 '</article></div>'+
 '<div class="section"><div class="section-head"><h2>Cuenta</h2></div><article class="card list-card">'+
 '<button class="list-row" data-profile-page="trainer"><span class="list-icon">'+ic("user-round-cog")+'</span><span class="list-copy"><span class="list-title">Entrenador</span><span class="list-sub">Carlos · conectado</span></span>'+ic("chevron-right")+'</button>'+
 '<button class="list-row" data-profile-page="settings"><span class="list-icon">'+ic("settings-2")+'</span><span class="list-copy"><span class="list-title">Preferencias</span><span class="list-sub">'+unitLabel()+' · '+preferences.restSeconds+' s · '+appearanceLabel()+'</span></span>'+ic("chevron-right")+'</button>'+
 '<button class="list-row" data-profile-page="sync"><span class="list-icon">'+ic("cloud")+'</span><span class="list-copy"><span class="list-title">Sincronización</span><span class="list-sub">Datos guardados en este dispositivo</span></span>'+ic("chevron-right")+'</button>'+
 '</article></div></section>'
}

function appearanceLabel(){return preferences.appearance==="dark"?"Oscuro":preferences.appearance==="light"?"Claro":"Sistema"}
function profileSubhead(title,eyebrow){return '<div class="profile-subhead"><button class="icon-btn" data-profile-back>'+ic("chevron-left")+'</button><div><span>'+eyebrow+'</span><strong>'+title+'</strong></div><span></span></div>'}

function settingsView(){
 return '<section class="page">'+profileSubhead("Preferencias","Perfil")+
 '<div class="settings-section"><h2>Entrenamiento</h2><article class="card settings-card">'+
 settingSegment("Unidades","Peso mostrado",["kg","lb"],preferences.units,"units")+
 settingSegment("Descanso","Tiempo predeterminado",["60","90","120","180"],String(preferences.restSeconds),"rest")+
 '</article></div>'+
 '<div class="settings-section"><h2>Apariencia</h2><article class="card settings-card">'+
 settingSegment("Tema","Interfaz de la app",["system","light","dark"],preferences.appearance,"appearance")+
 '</article></div>'+
 '<div class="settings-section"><h2>Respuesta</h2><article class="card settings-card">'+
 settingToggle("Sonidos","Avisos al completar descanso","sounds",preferences.sounds)+
 settingToggle("Respuesta háptica","Confirmaciones y gestos","haptics",preferences.haptics)+
 '</article></div>'+
 '<div class="settings-note">'+ic("info")+' Los cambios se aplican inmediatamente y permanecen en este dispositivo.</div>'+
 '</section>'
}

function settingSegment(title,subtitle,options,current,key){
 const names={system:"Sistema",light:"Claro",dark:"Oscuro","60":"60 s","90":"90 s","120":"2 min","180":"3 min",kg:"kg",lb:"lb"};
 return '<div class="setting-row"><div><strong>'+title+'</strong><span>'+subtitle+'</span></div><div class="setting-segment">'+options.map(function(o){return '<button class="'+(String(current)===String(o)?'active':'')+'" data-setting="'+key+'" data-value="'+o+'">'+(names[o]||o)+'</button>'}).join("")+'</div></div>'
}
function settingToggle(title,subtitle,key,on){
 return '<div class="setting-row toggle-row"><div><strong>'+title+'</strong><span>'+subtitle+'</span></div><button class="ios-toggle '+(on?'on':'')+'" data-toggle-setting="'+key+'" aria-label="'+title+'"><span></span></button></div>'
}

function photosView(){
 const current=progressPhotos[progressPhotos.length-1],first=progressPhotos[0];
 return '<section class="page">'+profileSubhead("Fotos de progreso","Progreso")+
 '<article class="card photo-compare-card"><div class="photo-compare-head"><div><strong>Comparación</strong><span>'+first.date+' → '+current.date+'</span></div><button class="link" id="swap-photo-view">'+((current&&current.view)||"Frente")+'</button></div>'+
 '<div class="photo-compare-grid">'+photoTile(first)+photoTile(current)+'</div></article>'+
 '<button class="primary photo-add-btn" id="add-progress-photo">'+ic("camera")+' Agregar foto</button>'+
 '<input id="progress-photo-input" type="file" accept="image/*" hidden>'+
 '<div class="photo-privacy">'+ic("lock")+' <span><strong>Privadas por defecto</strong><br>Las fotos solo se muestran en tu perfil de progreso.</span></div>'+
 '<div class="section"><div class="section-head"><h2>Registro</h2><span class="caption">'+progressPhotos.length+' fotos</span></div><div class="photo-timeline">'+progressPhotos.slice().reverse().map(function(p,i){return '<article class="card photo-history-item">'+photoThumb(p)+'<div><strong>'+p.date+'</strong><span>'+p.view+' · '+p.label+'</span></div><button class="icon-btn" data-delete-photo="'+(progressPhotos.length-1-i)+'">'+ic("ellipsis")+'</button></article>'}).join("")+'</div></div>'+
 '</section>'
}
function photoTile(p){return '<div class="photo-tile">'+photoThumb(p)+'<div><strong>'+p.label+'</strong><span>'+p.date+'</span></div></div>'}
function photoThumb(p){return p.data?'<div class="photo-thumb has-photo" style="background-image:url('+p.data+')"></div>':'<div class="photo-thumb mock-photo '+(p.mock||"front")+'"><span></span></div>'}

function trainerView(){
 return '<section class="page">'+profileSubhead("Entrenador","Cuenta")+
 '<article class="card trainer-card"><div class="trainer-avatar">C</div><div><h2>Carlos</h2><span>Entrenador conectado</span></div><span class="connected-dot"></span></article>'+
 '<div class="section"><article class="card list-card">'+
 '<div class="profile-info-row"><span>Rutina activa</span><strong>Empuje / Tirón / Piernas</strong></div>'+
 '<div class="profile-info-row"><span>Último ajuste</span><strong>Hoy</strong></div>'+
 '<div class="profile-info-row"><span>Comentarios pendientes</span><strong>1</strong></div>'+
 '</article></div>'+
 '<div class="section"><article class="card trainer-message">'+ic("message-circle")+'<div><strong>Última indicación</strong><span>Controla la bajada en press banca durante 2 segundos.</span></div></article></div>'+
 '</section>'
}

function syncView(){
 return '<section class="page">'+profileSubhead("Sincronización","Cuenta")+
 '<article class="card sync-hero"><span class="sync-icon">'+ic("cloud-check")+'</span><h2>Datos guardados</h2><p>Tu sesión activa, historial, preferencias y cambios locales permanecen en este dispositivo.</p><div class="sync-status"><span></span>Sin cambios pendientes</div></article>'+
 '<div class="section"><article class="card list-card">'+
 '<div class="profile-info-row"><span>Última actualización</span><strong>Ahora</strong></div>'+
 '<div class="profile-info-row"><span>Entrenamiento activo</span><strong>'+(state.startedAt?"Guardado":"Ninguno")+'</strong></div>'+
 '<div class="profile-info-row"><span>Sesiones</span><strong>'+historySessions.length+'</strong></div>'+
 '</article></div>'+
 '<div class="settings-note">'+ic("info")+' La sincronización entre dispositivos se conectará cuando integremos el backend.</div>'+
 '</section>'
}

function tabbar(){
const nav=document.getElementById("tabbar");
const sessionMode=state.tab==="workout"&&state.startedAt;
nav.classList.toggle("hidden",sessionMode);
nav.innerHTML=tabs.map(function(t){
const active=state.tab===t[0]?"active":"";
const train=t[0]==="workout"?"train":"";
const icon=train?'<span class="icon-wrap">'+ic(t[1])+'</span>':ic(t[1]);
return '<button class="tab '+active+' '+train+'" data-tab="'+t[0]+'">'+icon+'<span>'+t[2]+'</span></button>'
}).join("");
document.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){state.tab=b.dataset.tab;render()}})
}

function startWorkout(){
if(state.startedAt)return;
state.startedAt=Date.now();state.elapsed=0;state.activeExercise=0;saveWorkout();startWorkoutTimer()
}

function rest(seconds){
clearRest();state.restEndsAt=Date.now()+seconds*1000;
document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sheet-bg"><div class="sheet"><div class="handle"></div><div class="eyebrow">Descanso</div><h2>Siguiente serie</h2><div class="rest" id="rest">01:30</div><div class="hero-actions"><button class="secondary" id="minus">−15 s</button><button class="secondary" id="plus">+15 s</button></div><button class="primary" id="skip" style="width:100%;margin-top:10px">Terminar descanso</button></div></div>';
updateRest();state.restTimer=setInterval(updateRest,250);
document.getElementById("minus").onclick=function(){state.restEndsAt-=15000;updateRest()};
document.getElementById("plus").onclick=function(){state.restEndsAt+=15000;updateRest()};
document.getElementById("skip").onclick=clearRest
}
function updateRest(){
if(!state.restEndsAt)return;
const left=Math.max(0,Math.ceil((state.restEndsAt-Date.now())/1000));
const el=document.getElementById("rest");
if(el)el.textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");
if(left<=0){chime();haptic(35);clearRest()}
}
function clearRest(){clearInterval(state.restTimer);state.restTimer=null;state.restEndsAt=null;document.getElementById("sheet-root").innerHTML=""}

function openSetSheet(ei,si){
const set=state.exercises[ei].sets[si],exercise=state.exercises[ei];
document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="set-sheet-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+exercise.name+'</div><h2>Serie '+set[0]+'</h2></div><button class="icon-btn" id="close-set-sheet">'+ic("x")+'</button></div><div class="sheet-actions"><button data-set-kind="normal">'+ic("circle")+' Normal</button><button data-set-kind="warmup">'+ic("flame")+' Calentamiento</button><button data-set-kind="failed">'+ic("x-circle")+' Fallada</button><button data-set-kind="partial">'+ic("circle-dashed")+' Parciales</button></div><button class="secondary" id="set-note" style="width:100%;margin-top:12px">'+ic("message-square-plus")+' Agregar nota a la serie</button></div></div>';
if(window.lucide)lucide.createIcons();
document.getElementById("close-set-sheet").onclick=clearRest;
document.getElementById("set-sheet-bg").onclick=function(ev){if(ev.target.id==="set-sheet-bg")clearRest()};
document.getElementById("set-note").onclick=function(){clearRest();openSetNoteEditor(ei,si)};
document.querySelectorAll("[data-set-kind]").forEach(function(btn){btn.onclick=function(){
const kind=btn.dataset.setKind;
if(kind==="warmup")set[0]="W";
else if(kind==="failed")set[0]="F";
else if(kind==="partial")set[0]="P";
else if(set[0]==="W"||set[0]==="F"||set[0]==="P")set[0]=String(si+1);
clearRest();saveWorkout();render()
}});
}

function openSetNoteEditor(ei,si){const set=state.exercises[ei].sets[si],exercise=state.exercises[ei];document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="note-sheet-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+exercise.name+' · Serie '+set[0]+'</div><h2>Nota de la serie</h2></div><button class="icon-btn" id="close-note-sheet">'+ic("x")+'</button></div><textarea id="set-note-text" class="note-editor" placeholder="Escribe una indicación o comentario…">'+(set[5]||"")+'</textarea><div class="note-sheet-actions"><button class="secondary" id="clear-set-note">Limpiar</button><button class="primary" id="save-set-note">Guardar</button></div></div></div>';if(window.lucide)lucide.createIcons();document.getElementById("close-note-sheet").onclick=clearRest;document.getElementById("note-sheet-bg").onclick=function(ev){if(ev.target.id==="note-sheet-bg")clearRest()};document.getElementById("clear-set-note").onclick=function(){document.getElementById("set-note-text").value=""};document.getElementById("save-set-note").onclick=function(){set[5]=document.getElementById("set-note-text").value.trim();saveWorkout();clearRest();render()}}

function bindGestures(){
 document.querySelectorAll(".set-input").forEach(function(inp){let y=0;inp.addEventListener("pointerdown",function(ev){y=ev.clientY;inp.setPointerCapture&&inp.setPointerCapture(ev.pointerId)});inp.addEventListener("pointerup",function(ev){const dy=ev.clientY-y;if(Math.abs(dy)<28)return;const ei=+inp.dataset.ei,si=+inp.dataset.si,f=+inp.dataset.f;const set=state.exercises[ei].sets[si];const step=f===2?(preferences.units==="lb"?5/2.20462:2.5):1;let value=Number(set[f]||0)+(dy<0?step:-step);if(value<0)value=0;if(f===3)value=Math.round(value);set[f]=value;inp.value=f===2?toDisplayWeight(value):(value||"");saveWorkout();inp.classList.add("gesture-change");setTimeout(function(){inp.classList.remove("gesture-change")},280)})});
 document.querySelectorAll("[data-set-row]").forEach(function(row){let x=0,y=0;row.addEventListener("pointerdown",function(ev){if(ev.target.closest("input,button"))return;x=ev.clientX;y=ev.clientY});row.addEventListener("pointerup",function(ev){if(!x)return;const dx=ev.clientX-x,dy=ev.clientY-y;x=0;if(Math.abs(dx)<52||Math.abs(dx)<Math.abs(dy))return;const ei=+row.dataset.ei,si=+row.dataset.si;const max=state.exercises[ei].sets.length-1;const next=Math.max(0,Math.min(max,si+(dx<0?1:-1)));if(next!==si)focusSet(ei,next)})})
}

function openNotifications(){
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="info-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Actividad</div><h2>Notificaciones</h2></div><button class="icon-btn" id="close-info">'+ic("x")+'</button></div><div class="notification-list"><div>'+ic("message-square-text")+'<span><strong>Nueva indicación</strong><small>Press banca · controla la bajada durante 2 s</small></span></div><div>'+ic("sparkles")+'<span><strong>Rutina actualizada</strong><small>Empuje A recibió ajustes hoy</small></span></div></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-info").onclick=clearRest;
 document.getElementById("info-bg").onclick=function(e){if(e.target.id==="info-bg")clearRest()}
}
function openExerciseNote(ei){
 const e=state.exercises[ei];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ex-note-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Ejercicio</div><h2>'+e.name+'</h2></div><button class="icon-btn" id="close-ex-note">'+ic("x")+'</button></div><textarea id="exercise-note-text" class="note-editor" placeholder="Nota para este ejercicio…">'+(e.note||"")+'</textarea><div class="note-sheet-actions"><button class="secondary" id="clear-ex-note">Limpiar</button><button class="primary" id="save-ex-note">Guardar</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-ex-note").onclick=clearRest;
 document.getElementById("ex-note-bg").onclick=function(ev){if(ev.target.id==="ex-note-bg")clearRest()};
 document.getElementById("clear-ex-note").onclick=function(){document.getElementById("exercise-note-text").value=""};
 document.getElementById("save-ex-note").onclick=function(){e.note=document.getElementById("exercise-note-text").value.trim();saveWorkout();clearRest();render()}
}
function openExerciseMenu(ei){
 const e=state.exercises[ei];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ex-menu-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Opciones</div><h2>'+e.name+'</h2></div><button class="icon-btn" id="close-ex-menu">'+ic("x")+'</button></div><div class="sheet-actions"><button id="menu-add-set">'+ic("plus")+' Agregar serie</button><button id="menu-note">'+ic("message-square-text")+' Nota</button><button id="menu-rest">'+ic("timer-reset")+' Descanso</button><button id="menu-history">'+ic("history")+' Historial</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-ex-menu").onclick=clearRest;
 document.getElementById("ex-menu-bg").onclick=function(ev){if(ev.target.id==="ex-menu-bg")clearRest()};
 document.getElementById("menu-add-set").onclick=function(){const sets=e.sets,last=sets[sets.length-1];sets.push([String(sets.length+1),"—",last?last[2]:0,last?last[3]:10,false,""]);saveWorkout();clearRest();render()};
 document.getElementById("menu-note").onclick=function(){clearRest();openExerciseNote(ei)};
 document.getElementById("menu-rest").onclick=function(){clearRest();rest(preferences.restSeconds)};
 document.getElementById("menu-history").onclick=function(){const hi=exerciseHistory.findIndex(function(x){return x.id===e.id||x.name===e.name});clearRest();if(hi>=0){state.historyExercise=hi;state.historyMode="exercises";state.tab="history";render()}}
}
function openWorkoutMenu(){
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="workout-menu-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Sesión activa</div><h2>'+state.activeRoutineName+'</h2></div><button class="icon-btn" id="close-workout-menu">'+ic("x")+'</button></div><div class="sheet-actions"><button id="workout-home">'+ic("minimize-2")+' Minimizar</button><button id="workout-rest">'+ic("timer-reset")+' Descanso</button><button id="workout-routines">'+ic("list-checks")+' Cambiar rutina</button><button id="workout-discard">'+ic("trash-2")+' Descartar</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-workout-menu").onclick=clearRest;
 document.getElementById("workout-menu-bg").onclick=function(ev){if(ev.target.id==="workout-menu-bg")clearRest()};
 document.getElementById("workout-home").onclick=function(){clearRest();state.tab="home";render()};
 document.getElementById("workout-rest").onclick=function(){clearRest();rest(preferences.restSeconds)};
 document.getElementById("workout-routines").onclick=function(){clearRest();state.tab="routines";render()};
 document.getElementById("workout-discard").onclick=function(){if(confirm("¿Descartar este entrenamiento?")){clearInterval(state.workoutTimer);state.startedAt=null;state.elapsed=0;state.activeExercise=0;clearSavedWorkout();clearRest();state.tab="home";render()}}
}

function openLibrary(){
 const names=["Press banca","Sentadilla","Remo con barra","Press militar","Dominadas","Peso muerto rumano","Elevaciones laterales","Curl inclinado"];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lib-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Biblioteca</div><h2>Ejercicios</h2></div><button class="icon-btn" id="close-lib">'+ic("x")+'</button></div><div class="library-search">'+ic("search")+'<input id="lib-search" placeholder="Buscar ejercicio"></div><div class="library-results" id="lib-results">'+names.map(function(n){return '<div>'+ic("dumbbell")+'<span>'+n+'</span></div>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("close-lib").onclick=clearRest;
 document.getElementById("lib-bg").onclick=function(ev){if(ev.target.id==="lib-bg")clearRest()};
 document.getElementById("lib-search").oninput=function(){const q=this.value.toLowerCase();document.querySelectorAll("#lib-results>div").forEach(function(el){el.style.display=el.textContent.toLowerCase().includes(q)?"":"none"})}
}
function createPersonalRoutine(){
 const name=prompt("Nombre de la nueva rutina","Nueva rutina");if(!name)return;
 routineCatalog.push({id:"personal-"+Date.now(),name:name.trim(),subtitle:"Rutina personal",duration:"45 min",source:"Propia",editable:true,personal:true,exercises:[]});
 state.routineFilter="personal";state.routineDetail=routineCatalog.length-1;render()
}

function events(){
document.querySelectorAll("[data-go]").forEach(function(b){b.onclick=function(){state.tab=b.dataset.go;render()}});
const notifications=document.querySelector("[data-notifications]");if(notifications)notifications.onclick=openNotifications;
const workoutMore=document.querySelector("[data-workout-more]");if(workoutMore)workoutMore.onclick=openWorkoutMenu;
document.querySelectorAll("[data-exercise-menu]").forEach(function(b){b.onclick=function(){openExerciseMenu(+b.dataset.exerciseMenu)}});
document.querySelectorAll("[data-exercise-note]").forEach(function(b){b.onclick=function(){openExerciseNote(+b.dataset.exerciseNote)}});
document.querySelectorAll("[data-exercise-history]").forEach(function(b){b.onclick=function(){const e=state.exercises[+b.dataset.exerciseHistory],hi=exerciseHistory.findIndex(function(x){return x.id===e.id||x.name===e.name});if(hi>=0){state.historyExercise=hi;state.historyMode="exercises";state.tab="history";render()}}});
const openLib=document.querySelector("[data-open-library]");if(openLib)openLib.onclick=openLibrary;
const createRoutine=document.querySelector("[data-create-routine]");if(createRoutine)createRoutine.onclick=createPersonalRoutine;
document.querySelectorAll("[data-history-mode]").forEach(function(b){b.onclick=function(){state.historyMode=b.dataset.historyMode;state.historySession=null;state.historyExercise=null;render()}});
document.querySelectorAll("[data-history-session]").forEach(function(b){b.onclick=function(){state.historySession=+b.dataset.historySession;render()}});
document.querySelectorAll("[data-history-exercise]").forEach(function(b){b.onclick=function(){state.historyExercise=+b.dataset.historyExercise;render()}});
const closeHistory=document.querySelector("[data-close-history-detail]");if(closeHistory)closeHistory.onclick=function(){state.historySession=null;render()};
const closeExerciseHistory=document.querySelector("[data-close-exercise-detail]");if(closeExerciseHistory)closeExerciseHistory.onclick=function(){state.historyExercise=null;render()};
document.querySelectorAll("[data-profile-history]").forEach(function(b){b.onclick=function(){state.historyMode=b.dataset.profileHistory;state.historySession=null;state.historyExercise=null;state.tab="history";render()}});
document.querySelectorAll("[data-profile-page]").forEach(function(b){b.onclick=function(){state.profilePage=b.dataset.profilePage;render()}});
const profileBack=document.querySelector("[data-profile-back]");if(profileBack)profileBack.onclick=function(){state.profilePage=null;render()};
document.querySelectorAll("[data-setting]").forEach(function(b){b.onclick=function(){const key=b.dataset.setting,val=b.dataset.value;if(key==="units")preferences.units=val;if(key==="rest")preferences.restSeconds=Number(val);if(key==="appearance"){preferences.appearance=val;applyAppearance()}savePreferences();render()}});
document.querySelectorAll("[data-toggle-setting]").forEach(function(b){b.onclick=function(){const key=b.dataset.toggleSetting;preferences[key]=!preferences[key];savePreferences();render()}});
const swapPhoto=document.getElementById("swap-photo-view");if(swapPhoto&&progressPhotos.length){swapPhoto.onclick=function(){const views=["Frente","Lateral","Espalda"],photo=progressPhotos[progressPhotos.length-1],i=Math.max(0,views.indexOf(photo.view));photo.view=views[(i+1)%views.length];savePhotos();render()}};
const addPhoto=document.getElementById("add-progress-photo");const photoInput=document.getElementById("progress-photo-input");if(addPhoto&&photoInput){addPhoto.onclick=function(){photoInput.click()};photoInput.onchange=function(){const file=photoInput.files&&photoInput.files[0];if(!file)return;const reader=new FileReader();reader.onload=function(){progressPhotos.push({id:"local-"+Date.now(),date:new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short"}).format(new Date()),view:"Frente",label:"Nueva",data:reader.result});savePhotos();render()};reader.readAsDataURL(file)}}
document.querySelectorAll("[data-delete-photo]").forEach(function(b){b.onclick=function(){const i=+b.dataset.deletePhoto;if(progressPhotos.length<=1)return;if(confirm("¿Eliminar esta foto de progreso?")){progressPhotos.splice(i,1);savePhotos();render()}}});
const addMeasure=document.getElementById("add-measure");if(addMeasure)addMeasure.onclick=function(){const unit=unitLabel(),currentKg=parseFloat(String(measurements[0].value).replace(",",".")),suggested=unit==="lb"?Math.round(currentKg*2.20462*10)/10:currentKg;const value=prompt("Registrar peso ("+unit+")",String(suggested));if(value){const v=Number(String(value).replace(",","."));if(Number.isFinite(v)){const kg=unit==="lb"?v/2.20462:v;measurements[0].value=(Math.round(kg*10)/10).toString().replace(".",",")+" kg";measurements[0].when="Ahora";haptic(18);render()}}};
const sh=document.getElementById("start-home");if(sh)sh.onclick=function(){startWorkout();state.tab="workout";render()};
const sw=document.getElementById("start-workout");if(sw)sw.onclick=function(){startWorkout();render()};
document.querySelectorAll("[data-start]").forEach(function(b){b.onclick=function(){startWorkout();state.tab="workout";render()}});
document.querySelectorAll("[data-start-routine]").forEach(function(b){b.onclick=function(){startRoutine(+b.dataset.startRoutine)}});
document.querySelectorAll("[data-routine-detail]").forEach(function(b){b.onclick=function(){state.routineDetail=+b.dataset.routineDetail;render()}});
document.querySelectorAll("[data-routine-filter]").forEach(function(b){b.onclick=function(){state.routineFilter=b.dataset.routineFilter;render()}});
document.querySelectorAll("[data-add-routine-exercise]").forEach(function(b){b.onclick=function(){openAddRoutineExerciseSheet(+b.dataset.addRoutineExercise)}});
const closeRoutine=document.querySelector("[data-close-routine]");if(closeRoutine)closeRoutine.onclick=function(){state.routineDetail=null;render()};
document.querySelectorAll("[data-move-exercise]").forEach(function(b){b.onclick=function(){const p=b.dataset.moveExercise.split(":").map(Number),ri=p[0],ei=p[1],dir=p[2],arr=routineCatalog[ri].exercises,next=ei+dir;if(next<0||next>=arr.length)return;const tmp=arr[ei];arr[ei]=arr[next];arr[next]=tmp;render()}});
document.querySelectorAll("[data-edit-routine-exercise]").forEach(function(b){b.onclick=function(){const p=b.dataset.editRoutineExercise.split(":").map(Number);openRoutineExerciseSheet(p[0],p[1])}});
document.querySelectorAll("[data-check]").forEach(function(b){b.onclick=function(){const e=+b.dataset.ei,s=+b.dataset.si;const set=state.exercises[e].sets[s];set[4]=!set[4];haptic(set[4]?22:10);if(set[4]){const exercise=state.exercises[e];if(exercise.group){const target=nextGroupTarget(e);state.activeExercise=target===null?e:target;const members=groupMembers(exercise.group);const atEnd=members[members.length-1]===e;if(atEnd)rest(preferences.restSeconds)}else{const exerciseDone=exercise.sets.every(function(x){return x[4]});if(exerciseDone&&e<state.exercises.length-1)state.activeExercise=e+1;rest(preferences.restSeconds)}}saveWorkout();render()}});
document.querySelectorAll(".set-input").forEach(function(inp){inp.onchange=function(){const v=Number(inp.value.replace(",",".")),f=+inp.dataset.f;let stored=Number.isFinite(v)?v:0;if(f===2)stored=fromDisplayWeight(stored);state.exercises[+inp.dataset.ei].sets[+inp.dataset.si][f]=stored;saveWorkout()}});
document.querySelectorAll("[data-add]").forEach(function(b){b.onclick=function(){const e=+b.dataset.add,sets=state.exercises[e].sets,last=sets[sets.length-1];sets.push([String(sets.length+1),"—",last[2],last[3],false]);saveWorkout();render()}});
document.querySelectorAll("[data-exercise-nav]").forEach(function(b){
b.onclick=function(){
const next=Math.max(0,Math.min(state.exercises.length-1,state.activeExercise+Number(b.dataset.exerciseNav)));
state.activeExercise=next;saveWorkout();
render();
requestAnimationFrame(function(){const el=document.getElementById("exercise-"+next);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})})
}});
const jump=document.querySelector("[data-jump-active]");if(jump)jump.onclick=function(){const el=document.getElementById("exercise-"+state.activeExercise);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})};
document.querySelectorAll("[data-rest-now]").forEach(function(b){b.onclick=function(){rest(preferences.restSeconds)}});
document.querySelectorAll("[data-set-options]").forEach(function(b){b.onclick=function(){openSetSheet(+b.dataset.ei,+b.dataset.si)}});
const f=document.getElementById("finish");if(f)f.onclick=function(){if(confirm("¿Finalizar este entrenamiento?")){addCompletedSession();clearInterval(state.workoutTimer);state.startedAt=null;state.elapsed=0;state.activeExercise=0;state.exercises.forEach(function(e){e.sets.forEach(function(s){s[4]=false})});clearSavedWorkout();state.historyMode="sessions";state.tab="history";render()}}
}

function render(){
const views={home:home,routines:routines,workout:workout,history:history,profile:profile};
document.getElementById("app").innerHTML=views[state.tab]();
tabbar();events();bindGestures();if(window.lucide)lucide.createIcons()
}
normalizeWorkoutData();
restoreHistory();
restorePreferences();
restorePhotos();
restoreWorkout();
render();