const state={tab:"home",startedAt:null,elapsed:0,workoutTimer:null,restTimer:null,restEndsAt:null,exercises:[
{id:"bench",name:"Press banca",note:"Controlar la bajada · 2 s. Mantener escápulas retraídas.",sets:[["W","40 × 10",40,10,false],["1","70 × 8",72.5,8,false],["2","70 × 8",72.5,8,false],["3","70 × 7",72.5,8,false]]},
{id:"ohp",name:"Press militar",note:"Evitar hiperextender la zona lumbar.",sets:[["1","40 × 8",42.5,8,false],["2","40 × 8",42.5,8,false],["3","40 × 7",42.5,8,false]]},
{id:"dips",name:"Fondos",note:"RIR objetivo: 2.",sets:[["1","BW × 10",0,10,false],["2","BW × 9",0,10,false],["3","BW × 8",0,9,false]]}
]};
const tabs=[["home","house","Inicio"],["routines","list-checks","Rutinas"],["workout","play","Entrenar"],["history","clock-3","Historial"],["profile","circle-user-round","Perfil"]];
function ic(n){return '<i data-lucide="'+n+'"></i>'}
function topbar(){return '<div class="topbar"><div class="avatar">R</div><button class="icon-btn">'+ic("bell")+'</button></div>'}
function home(){
return '<section class="page">'+topbar()+
'<div class="eyebrow">Sábado · 19 septiembre</div><h1>Buenas tardes.<br>Hoy toca empujar.</h1>'+
'<article class="card hero"><div class="hero-top"><div><div class="eyebrow">Hoy</div><div class="hero-title">Empuje A</div><div class="hero-meta">Pecho · Hombros · Tríceps</div></div><span class="pill">'+ic("clock-3")+' 52 min</span></div>'+
'<div class="exercise-preview"><div class="exercise-line"><strong>Press banca</strong><span>4 series</span></div><div class="exercise-line"><strong>Press militar</strong><span>3 series</span></div><div class="exercise-line"><strong>Fondos</strong><span>3 series</span></div><div class="exercise-line"><strong>Elevaciones laterales</strong><span>3 series</span></div></div>'+
'<div class="button-row two"><button class="primary" id="start-home">'+(state.startedAt?"Continuar entrenamiento":"Comenzar entrenamiento")+'</button><button class="secondary" data-go="routines">Ver rutina</button></div></article>'+
'<div class="section"><div class="section-head"><h2>Esta semana</h2><span class="caption">3 de 4</span></div><article class="card week"><div class="week-days">'+
[['L','14','done'],['M','15',''],['X','16','done'],['J','17',''],['V','18','done'],['S','19','today'],['D','20','']].map(function(d){return '<div class="day '+d[2]+'"><span>'+d[0]+'</span><strong>'+d[1]+'</strong>'+(d[2]==='done'?ic("check"):"")+'</div>'}).join("")+
'</div></article></div>'+
'<div class="section"><div class="section-head"><h2>Progreso reciente</h2><button class="secondary" data-go="history" style="min-height:34px;padding:0 12px">Ver todo</button></div><div class="metric-grid"><article class="card metric"><div class="metric-value">18.420 <small style="font-size:.45em">kg</small></div><div class="metric-label">Volumen semanal</div><div class="delta">↑ 8,4%</div></article><article class="card metric"><div class="metric-value">6 <small style="font-size:.45em">sem.</small></div><div class="metric-label">Racha actual</div><div class="caption" style="margin-top:8px">Mejor: 9</div></article></div></div>'+
'<div class="section"><div class="section-head"><h2>Actividad</h2></div><article class="card list-card">'+
row("sparkles","Rutina actualizada","Tu entrenador ajustó Empuje A")+row("message-circle","Nueva indicación","Press banca · Control de tempo")+
'</article></div></section>'}
function row(icon,title,sub){return '<button class="list-row"><span class="list-icon">'+ic(icon)+'</span><span class="list-copy"><span class="list-title">'+title+'</span><span class="list-sub">'+sub+'</span></span>'+ic("chevron-right")+'</button>'}
function routines(){
const rs=[["Empuje A","Pecho · Hombros · Tríceps","7 ejercicios","52 min"],["Tirón A","Espalda · Bíceps","6 ejercicios","58 min"],["Piernas A","Cuádriceps · Femoral · Gemelos","7 ejercicios","64 min"]];
return '<section class="page">'+topbar()+'<div class="eyebrow">Programa actual</div><h1>Rutinas</h1>'+
rs.map(function(r,i){return '<article class="card routine"><div class="routine-top"><div><h3>'+r[0]+'</h3><div class="muted">'+r[1]+'</div></div><span class="pill">'+r[3]+'</span></div><div class="caption" style="margin-top:13px">'+r[2]+'</div><div class="actions"><button class="small accent" data-start="'+i+'">'+ic("play")+' Empezar</button><button class="small">Detalles</button></div></article>'}).join("")+
'<div class="section"><article class="card list-card">'+row("library","Biblioteca de ejercicios","Explorar ejercicios y ejercicios propios")+'</article></div></section>'}
function totalSets(){return state.exercises.reduce(function(a,e){return a+e.sets.length},0)}
function doneSets(){return state.exercises.reduce(function(a,e){return a+e.sets.filter(function(s){return s[4]}).length},0)}
function fmt(sec){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(function(v){return String(v).padStart(2,"0")}).join(":")}
function exerciseCard(e,ei){
return '<article class="card exercise-card"><div style="display:flex;justify-content:space-between;gap:12px"><div><h3>'+e.name+'</h3><div class="caption">'+e.sets.filter(function(s){return s[4]}).length+' de '+e.sets.length+' series</div></div><button class="icon-btn" style="width:36px;height:36px">'+ic("ellipsis")+'</button></div>'+
'<div class="note">'+ic("message-square-text")+' '+e.note+'</div><div class="sets"><div class="set-row head"><div></div><div>Anterior</div><div>kg</div><div>reps</div><div></div></div>'+
e.sets.map(function(s,si){return '<div class="set-row"><div class="caption" style="text-align:center">'+s[0]+'</div><div class="previous">'+s[1]+'</div><input class="set-input" inputmode="decimal" value="'+(s[2]||"")+'" data-ei="'+ei+'" data-si="'+si+'" data-f="2"><input class="set-input" inputmode="numeric" value="'+s[3]+'" data-ei="'+ei+'" data-si="'+si+'" data-f="3"><button class="check '+(s[4]?"done":"")+'" data-check data-ei="'+ei+'" data-si="'+si+'">'+ic("check")+'</button></div>'}).join("")+
'</div><button class="add-set" data-add="'+ei+'">+ Agregar serie</button></article>'}
function workout(){
if(!state.startedAt){return '<section class="page">'+topbar()+'<div class="eyebrow">Entrenamiento</div><h1>Empuje A</h1><article class="card" style="padding:30px 20px;text-align:center"><div class="list-icon" style="margin:0 auto 14px;width:64px;height:64px">'+ic("dumbbell")+'</div><h2>Listo para entrenar</h2><p class="muted">7 ejercicios · aproximadamente 52 minutos.</p><button class="primary" id="start-workout">Comenzar entrenamiento</button></article></section>'}
const progress=Math.round(doneSets()/totalSets()*100);
return '<section class="page"><header class="workout-head"><div class="workout-titlebar"><button class="icon-btn" data-go="home">'+ic("chevron-left")+'</button><div style="text-align:center"><h2>Empuje A</h2><div class="timer" id="workout-timer">'+fmt(state.elapsed)+'</div></div><button class="icon-btn">'+ic("ellipsis")+'</button></div><div class="progress"><span style="width:'+progress+'%"></span></div></header>'+
state.exercises.map(exerciseCard).join("")+'<button class="primary" id="finish" style="width:100%">Finalizar entrenamiento</button></section>'}
function history(){
const es=[["Ayer","Tirón A","1 h 08 min","8.420 kg","21","6"],["Martes","Empuje A","54 min","7.880 kg","20","7"],["Lunes","Piernas A","1 h 12 min","11.260 kg","24","7"],["12 sep","Tirón A","1 h 02 min","8.100 kg","20","6"]];
return '<section class="page">'+topbar()+'<div class="eyebrow">Actividad</div><h1>Historial</h1>'+es.map(function(e){return '<article class="card history"><div class="history-top"><div><h3 style="margin:0 0 3px">'+e[1]+'</h3><div class="caption">'+e[0]+'</div></div><span class="pill">'+ic("clock-3")+' '+e[2]+'</span></div><div class="history-stats"><div class="history-stat"><strong>'+e[3]+'</strong><span>Volumen</span></div><div class="history-stat"><strong>'+e[4]+'</strong><span>Series</span></div><div class="history-stat"><strong>'+e[5]+'</strong><span>Ejercicios</span></div></div></article>'}).join("")+'</section>'}
function profile(){
return '<section class="page">'+topbar()+'<article class="card profile"><div class="profile-avatar">R</div><h2 style="margin:0 0 3px">David</h2><div class="muted">Entrenado</div><div class="profile-kpis"><div><strong>78,4 kg</strong><span>Peso</span></div><div><strong>6 sem.</strong><span>Racha</span></div><div><strong>43</strong><span>Sesiones</span></div></div></article>'+
'<div class="section"><div class="section-head"><h2>Progreso</h2></div><article class="card list-card">'+row("chart-no-axes-combined","Estadísticas","Volumen, frecuencia y marcas")+row("ruler","Medidas corporales","Peso y perímetros")+row("image","Fotos de progreso","Comparaciones privadas")+'</article></div>'+
'<div class="section"><div class="section-head"><h2>Cuenta</h2></div><article class="card list-card">'+row("user-round-cog","Entrenador","Carlos · conectado")+row("settings-2","Preferencias","Unidades, descanso y apariencia")+row("cloud","Sincronización","Datos guardados")+'</article></div></section>'}
function tabbar(){
document.getElementById("tabbar").innerHTML=tabs.map(function(t){const active=state.tab===t[0]?"active":"";const train=t[0]==="workout"?"train":"";const icon=train?'<span class="icon-wrap">'+ic(t[1])+'</span>':ic(t[1]);return '<button class="tab '+active+' '+train+'" data-tab="'+t[0]+'">'+icon+'<span>'+t[2]+'</span></button>'}).join("");
document.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){if(b.dataset.tab==="workout"&&!state.startedAt){}state.tab=b.dataset.tab;render()}})
}
function startWorkout(){if(state.startedAt)return;state.startedAt=Date.now();state.elapsed=0;clearInterval(state.workoutTimer);state.workoutTimer=setInterval(function(){state.elapsed=Math.floor((Date.now()-state.startedAt)/1000);const el=document.getElementById("workout-timer");if(el)el.textContent=fmt(state.elapsed)},1000)}
function rest(seconds){
clearRest();state.restEndsAt=Date.now()+seconds*1000;document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sheet-bg"><div class="sheet"><div class="handle"></div><div class="eyebrow">Descanso</div><h2>Siguiente serie</h2><div class="rest" id="rest">01:30</div><div class="button-row two"><button class="secondary" id="minus">−15 s</button><button class="secondary" id="plus">+15 s</button></div><button class="primary" id="skip" style="width:100%;margin-top:10px">Terminar descanso</button></div></div>';updateRest();state.restTimer=setInterval(updateRest,250);document.getElementById("minus").onclick=function(){state.restEndsAt-=15000;updateRest()};document.getElementById("plus").onclick=function(){state.restEndsAt+=15000;updateRest()};document.getElementById("skip").onclick=clearRest}
function updateRest(){if(!state.restEndsAt)return;const left=Math.max(0,Math.ceil((state.restEndsAt-Date.now())/1000));const el=document.getElementById("rest");if(el)el.textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");if(left<=0)clearRest()}
function clearRest(){clearInterval(state.restTimer);state.restTimer=null;state.restEndsAt=null;document.getElementById("sheet-root").innerHTML=""}
function events(){
document.querySelectorAll("[data-go]").forEach(function(b){b.onclick=function(){state.tab=b.dataset.go;render()}});
const sh=document.getElementById("start-home");if(sh)sh.onclick=function(){startWorkout();state.tab="workout";render()};
const sw=document.getElementById("start-workout");if(sw)sw.onclick=function(){startWorkout();render()};
document.querySelectorAll("[data-start]").forEach(function(b){b.onclick=function(){startWorkout();state.tab="workout";render()}});
document.querySelectorAll("[data-check]").forEach(function(b){b.onclick=function(){const e=+b.dataset.ei,s=+b.dataset.si;state.exercises[e].sets[s][4]=!state.exercises[e].sets[s][4];if(state.exercises[e].sets[s][4])rest(90);render()}});
document.querySelectorAll(".set-input").forEach(function(inp){inp.onchange=function(){const v=Number(inp.value.replace(",","."));state.exercises[+inp.dataset.ei].sets[+inp.dataset.si][+inp.dataset.f]=Number.isFinite(v)?v:0}});
document.querySelectorAll("[data-add]").forEach(function(b){b.onclick=function(){const e=+b.dataset.add,sets=state.exercises[e].sets,last=sets[sets.length-1];sets.push([String(sets.length+1),"—",last[2],last[3],false]);render()}});
const f=document.getElementById("finish");if(f)f.onclick=function(){if(confirm("¿Finalizar este entrenamiento?")){clearInterval(state.workoutTimer);state.startedAt=null;state.elapsed=0;state.exercises.forEach(function(e){e.sets.forEach(function(s){s[4]=false})});state.tab="history";render()}}
}
function render(){const views={home:home,routines:routines,workout:workout,history:history,profile:profile};document.getElementById("app").innerHTML=views[state.tab]();tabbar();events();if(window.lucide)lucide.createIcons()}
render();