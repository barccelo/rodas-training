const state={tab:"home",startedAt:null,elapsed:0,workoutTimer:null,restTimer:null,restEndsAt:null,activeExercise:0,exercises:[
{id:"bench",name:"Press banca",note:"Controlar la bajada · 2 s. Mantener escápulas retraídas.",sets:[["W","40 × 10",40,10,false],["1","70 × 8",72.5,8,false],["2","70 × 8",72.5,8,false],["3","70 × 7",72.5,8,false]]},
{id:"ohp",name:"Press militar",note:"Evitar hiperextender la zona lumbar.",sets:[["1","40 × 8",42.5,8,false],["2","40 × 8",42.5,8,false],["3","40 × 7",42.5,8,false]]},
{id:"dips",name:"Fondos",note:"RIR objetivo: 2.",sets:[["1","BW × 10",0,10,false],["2","BW × 9",0,10,false],["3","BW × 8",0,9,false]]}
]};
const tabs=[["home","house","Inicio"],["routines","list-checks","Rutinas"],["workout","play","Entrenar"],["history","clock-3","Historial"],["profile","circle-user-round","Perfil"]];
const STORAGE_KEY="rodas.activeWorkout.v1";
function saveWorkout(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({startedAt:state.startedAt,elapsed:state.elapsed,activeExercise:state.activeExercise,exercises:state.exercises}))}catch(e){}}
function restoreWorkout(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;const saved=JSON.parse(raw);if(saved.startedAt){state.startedAt=saved.startedAt;state.elapsed=Math.floor((Date.now()-saved.startedAt)/1000);state.activeExercise=Number.isInteger(saved.activeExercise)?saved.activeExercise:0;if(Array.isArray(saved.exercises))state.exercises=saved.exercises;startWorkoutTimer()}}catch(e){}}
function clearSavedWorkout(){try{localStorage.removeItem(STORAGE_KEY)}catch(e){}}
function startWorkoutTimer(){clearInterval(state.workoutTimer);if(!state.startedAt)return;state.workoutTimer=setInterval(function(){state.elapsed=Math.floor((Date.now()-state.startedAt)/1000);const el=document.getElementById("workout-timer");if(el)el.textContent=fmt(state.elapsed);saveWorkout()},1000)}
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function dateLabel(){return new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long"}).format(new Date()).replace(/^./,m=>m.toUpperCase())}
function topbar(){return '<div class="topbar"><div class="brandmark"><span class="brand-dot"></span><span class="brand-name">RODAS</span></div><button class="icon-btn" aria-label="Notificaciones">'+ic("bell")+'</button></div>'}
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
const rs=[["Empuje A","Pecho · Hombros · Tríceps","7 ejercicios","52 min"],["Tirón A","Espalda · Bíceps","6 ejercicios","58 min"],["Piernas A","Cuádriceps · Femoral · Gemelos","7 ejercicios","64 min"]];
return '<section class="page">'+topbar()+'<div class="eyebrow">Programa actual</div><h1>Rutinas</h1>'+
rs.map(function(r,i){return '<article class="card routine"><div class="routine-top"><div><h3>'+r[0]+'</h3><div class="muted">'+r[1]+'</div></div><span class="caption">'+r[3]+'</span></div><div class="caption" style="margin-top:12px">'+r[2]+'</div><div class="actions"><button class="small accent" data-start="'+i+'">'+ic("play")+' Empezar</button><button class="small">Detalles</button></div></article>'}).join("")+
'<div class="section"><article class="card list-card">'+row("library","Biblioteca de ejercicios","Explorar ejercicios y ejercicios propios")+'</article></div></section>'}

function totalSets(){return state.exercises.reduce(function(a,e){return a+e.sets.length},0)}
function doneSets(){return state.exercises.reduce(function(a,e){return a+e.sets.filter(function(s){return s[4]}).length},0)}
function fmt(sec){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(function(v){return String(v).padStart(2,"0")}).join(":")}

function exerciseCard(e,ei){
const complete=e.sets.filter(function(s){return s[4]}).length;
const isActive=state.activeExercise===ei;
return '<article class="card exercise-card '+(isActive?'exercise-active':'')+'" id="exercise-'+ei+'">'+
'<div class="exercise-topline"><div class="exercise-index">'+String(ei+1).padStart(2,"0")+'</div><div class="exercise-heading"><h3>'+e.name+'</h3><div class="caption">'+complete+' de '+e.sets.length+' series completadas</div></div>'+
'<button class="exercise-menu">'+ic("ellipsis")+'</button></div>'+
'<div class="exercise-quick"><button class="quick-chip">'+ic("history")+' Historial</button><button class="quick-chip">'+ic("message-square-text")+' Nota</button><button class="quick-chip" data-rest-now>'+ic("timer-reset")+' Descanso</button></div>'+
'<div class="note">'+ic("message-square-text")+e.note+'</div>'+
'<div class="sets"><div class="set-row head"><div>Serie</div><div>Anterior</div><div>kg</div><div>reps</div><div></div></div>'+
e.sets.map(function(s,si){
return '<div class="set-row '+(s[4]?'set-done':'')+'">'+
'<button class="set-tag '+(s[0]==="W"?"warmup":"")+'" data-set-options data-ei="'+ei+'" data-si="'+si+'">'+s[0]+'</button>'+
'<div class="previous">'+s[1]+'</div>'+
'<input class="set-input" inputmode="decimal" value="'+(s[2]||"")+'" data-ei="'+ei+'" data-si="'+si+'" data-f="2" aria-label="Peso en kilogramos">'+
'<input class="set-input" inputmode="numeric" value="'+s[3]+'" data-ei="'+ei+'" data-si="'+si+'" data-f="3" aria-label="Repeticiones">'+
'<button class="check '+(s[4]?"done":"")+'" data-check data-ei="'+ei+'" data-si="'+si+'" aria-label="Completar serie">'+ic("check")+'</button></div>'
}).join("")+
'</div><button class="add-set" data-add="'+ei+'">'+ic("plus")+' Agregar serie</button></article>'
}

function workout(){
if(!state.startedAt){
return '<section class="page">'+topbar()+'<div class="eyebrow">Entrenamiento</div><h1>Empuje A</h1><article class="card" style="padding:28px 18px;text-align:center"><div class="list-icon" style="margin:0 auto 14px;width:58px;height:58px">'+ic("dumbbell")+'</div><h2 style="margin-bottom:6px">Listo para entrenar</h2><p class="muted">7 ejercicios · aproximadamente 52 minutos.</p><button class="primary" id="start-workout">Comenzar entrenamiento</button></article></section>'
}
const progress=Math.round(doneSets()/totalSets()*100);
const current=state.activeExercise+1;
return '<section class="page workout-page">'+
'<header class="workout-head"><div class="workout-titlebar"><button class="workout-close" data-go="home">'+ic("chevron-down")+'</button><div class="workout-titlecopy"><strong>Empuje A</strong><span id="workout-timer">'+fmt(state.elapsed)+'</span></div><button class="workout-more">'+ic("ellipsis")+'</button></div>'+
'<div class="session-summary"><span>'+doneSets()+' / '+totalSets()+' series</span><span>'+progress+'%</span></div><div class="progress"><span style="width:'+progress+'%"></span></div></header>'+
'<div class="current-exercise-label"><span>Ejercicio '+current+' de '+state.exercises.length+'</span><button data-jump-active>'+ic("locate-fixed")+' Ir al actual</button></div>'+
state.exercises.map(exerciseCard).join("")+
'<div class="finish-zone"><div><strong>¿Terminaste?</strong><span>Revisa las series antes de cerrar la sesión.</span></div><button class="finish-btn" id="finish">Finalizar</button></div>'+
'<div class="session-dock"><button class="dock-nav" data-exercise-nav="-1" '+(state.activeExercise===0?'disabled':'')+'>'+ic("chevron-left")+'<span>Anterior</span></button><button class="dock-main" data-rest-now>'+ic("timer")+'<span>Descanso</span></button><button class="dock-nav" data-exercise-nav="1" '+(state.activeExercise===state.exercises.length-1?'disabled':'')+'><span>Siguiente</span>'+ic("chevron-right")+'</button></div>'+
'</section>'
}

function history(){
const es=[["Ayer","Tirón A","1 h 08 min","8.420 kg","21","6"],["Martes","Empuje A","54 min","7.880 kg","20","7"],["Lunes","Piernas A","1 h 12 min","11.260 kg","24","7"],["12 sep","Tirón A","1 h 02 min","8.100 kg","20","6"]];
return '<section class="page">'+topbar()+'<div class="eyebrow">Actividad</div><h1>Historial</h1>'+
es.map(function(e){return '<article class="card history"><div class="history-top"><div><h3 style="margin:0 0 3px">'+e[1]+'</h3><div class="caption">'+e[0]+'</div></div><span class="caption">'+e[2]+'</span></div><div class="history-stats"><div class="history-stat"><strong>'+e[3]+'</strong><span>Volumen</span></div><div class="history-stat"><strong>'+e[4]+'</strong><span>Series</span></div><div class="history-stat"><strong>'+e[5]+'</strong><span>Ejercicios</span></div></div></article>'}).join("")+
'</section>'}

function profile(){
return '<section class="page">'+topbar()+'<article class="card profile"><div class="profile-avatar">D</div><h2 style="margin:0 0 3px">David</h2><div class="muted">Entrenado</div><div class="profile-kpis"><div><strong>78,4 kg</strong><span>Peso</span></div><div><strong>6 sem.</strong><span>Racha</span></div><div><strong>43</strong><span>Sesiones</span></div></div></article>'+
'<div class="section"><div class="section-head"><h2>Progreso</h2></div><article class="card list-card">'+row("chart-no-axes-combined","Estadísticas","Volumen, frecuencia y marcas")+row("ruler","Medidas corporales","Peso y perímetros")+row("image","Fotos de progreso","Comparaciones privadas")+'</article></div>'+
'<div class="section"><div class="section-head"><h2>Cuenta</h2></div><article class="card list-card">'+row("user-round-cog","Entrenador","Carlos · conectado")+row("settings-2","Preferencias","Unidades, descanso y apariencia")+row("cloud","Sincronización","Datos guardados")+'</article></div></section>'}

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
if(left<=0)clearRest()
}
function clearRest(){clearInterval(state.restTimer);state.restTimer=null;state.restEndsAt=null;document.getElementById("sheet-root").innerHTML=""}

function openSetSheet(ei,si){
const set=state.exercises[ei].sets[si],exercise=state.exercises[ei];
document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="set-sheet-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+exercise.name+'</div><h2>Serie '+set[0]+'</h2></div><button class="icon-btn" id="close-set-sheet">'+ic("x")+'</button></div><div class="sheet-actions"><button data-set-kind="normal">'+ic("circle")+' Normal</button><button data-set-kind="warmup">'+ic("flame")+' Calentamiento</button><button data-set-kind="failed">'+ic("x-circle")+' Fallada</button><button data-set-kind="partial">'+ic("circle-dashed")+' Parciales</button></div><button class="secondary" id="set-note" style="width:100%;margin-top:12px">'+ic("message-square-plus")+' Agregar nota a la serie</button></div></div>';
if(window.lucide)lucide.createIcons();
document.getElementById("close-set-sheet").onclick=clearRest;
document.getElementById("set-sheet-bg").onclick=function(ev){if(ev.target.id==="set-sheet-bg")clearRest()};
document.querySelectorAll("[data-set-kind]").forEach(function(btn){btn.onclick=function(){
const kind=btn.dataset.setKind;
if(kind==="warmup")set[0]="W";
else if(kind==="failed")set[0]="F";
else if(kind==="partial")set[0]="P";
else if(set[0]==="W"||set[0]==="F"||set[0]==="P")set[0]=String(si+1);
clearRest();saveWorkout();render()
}});
}

function events(){
document.querySelectorAll("[data-go]").forEach(function(b){b.onclick=function(){state.tab=b.dataset.go;render()}});
const sh=document.getElementById("start-home");if(sh)sh.onclick=function(){startWorkout();state.tab="workout";render()};
const sw=document.getElementById("start-workout");if(sw)sw.onclick=function(){startWorkout();render()};
document.querySelectorAll("[data-start]").forEach(function(b){b.onclick=function(){startWorkout();state.tab="workout";render()}});
document.querySelectorAll("[data-check]").forEach(function(b){b.onclick=function(){const e=+b.dataset.ei,s=+b.dataset.si;const set=state.exercises[e].sets[s];set[4]=!set[4];if(set[4]){const exerciseDone=state.exercises[e].sets.every(function(x){return x[4]});if(exerciseDone&&e<state.exercises.length-1)state.activeExercise=e+1;rest(90)}saveWorkout();render()}});
document.querySelectorAll(".set-input").forEach(function(inp){inp.onchange=function(){const v=Number(inp.value.replace(",","."));state.exercises[+inp.dataset.ei].sets[+inp.dataset.si][+inp.dataset.f]=Number.isFinite(v)?v:0;saveWorkout()}});
document.querySelectorAll("[data-add]").forEach(function(b){b.onclick=function(){const e=+b.dataset.add,sets=state.exercises[e].sets,last=sets[sets.length-1];sets.push([String(sets.length+1),"—",last[2],last[3],false]);saveWorkout();render()}});
document.querySelectorAll("[data-exercise-nav]").forEach(function(b){
b.onclick=function(){
const next=Math.max(0,Math.min(state.exercises.length-1,state.activeExercise+Number(b.dataset.exerciseNav)));
state.activeExercise=next;saveWorkout();
restoreWorkout();
render();
requestAnimationFrame(function(){const el=document.getElementById("exercise-"+next);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})})
}});
const jump=document.querySelector("[data-jump-active]");if(jump)jump.onclick=function(){const el=document.getElementById("exercise-"+state.activeExercise);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})};
document.querySelectorAll("[data-rest-now]").forEach(function(b){b.onclick=function(){rest(90)}});
document.querySelectorAll("[data-set-options]").forEach(function(b){b.onclick=function(){openSetSheet(+b.dataset.ei,+b.dataset.si)}});
const f=document.getElementById("finish");if(f)f.onclick=function(){if(confirm("¿Finalizar este entrenamiento?")){clearInterval(state.workoutTimer);state.startedAt=null;state.elapsed=0;state.activeExercise=0;state.exercises.forEach(function(e){e.sets.forEach(function(s){s[4]=false})});clearSavedWorkout();state.tab="history";render()}}
}

function render(){
const views={home:home,routines:routines,workout:workout,history:history,profile:profile};
document.getElementById("app").innerHTML=views[state.tab]();
tabbar();events();if(window.lucide)lucide.createIcons()
}
render();