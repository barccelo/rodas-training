(function(){
const AC_KEY="rodas.assignments.v1";
const acState={detail:null};
const trainees=[
 {id:"ana",name:"Ana Pérez"},
 {id:"carlos",name:"Carlos Mendoza"},
 {id:"lucia",name:"Lucía Torres"},
 {id:"pedro",name:"Pedro Ruiz"}
];
let assignments=[];

function acEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function acToday(){const d=new Date();return acISO(d)}
function acISO(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function acParse(s){const p=String(s).split("-").map(Number);return new Date(p[0],p[1]-1,p[2],12,0,0)}
function acAddDays(s,n){const d=acParse(s);d.setDate(d.getDate()+n);return acISO(d)}
function acDiffDays(a,b){return Math.floor((acParse(b)-acParse(a))/86400000)}
function acDateLabel(s){return new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short"}).format(acParse(s)).replace(".","")}
function acWeekday(s){const d=acParse(s).getDay();return d===0?6:d-1}
function acStatusLabel(a){
 if(a.status==="paused")return "Pausada";
 if(a.status==="completed")return "Finalizada";
 if(a.startDate>acToday())return "Programada";
 return "Activa"
}
function acLoad(){try{const raw=localStorage.getItem(AC_KEY);if(raw){const x=JSON.parse(raw);if(Array.isArray(x))assignments=x}}catch(e){}}
function acSave(){try{localStorage.setItem(AC_KEY,JSON.stringify(assignments))}catch(e){}}
function acPrograms(){return window.RodasPrograms?window.RodasPrograms.getPrograms():[]}
function acRoutine(id){return routineCatalog.find(function(r){return r.id===id})}
function acProgram(id){return acPrograms().find(function(p){return p.id===id})}
function acRoutineDays(r){return Array.isArray(r&&r.days)&&r.days.length?r.days:[{id:"day-1",name:r?r.name:"Entrenamiento",exercises:r&&Array.isArray(r.exercises)?r.exercises:[]}]}
function acProgramPhase(p,week){
 if(!p||!Array.isArray(p.phases))return null;
 return p.phases.find(function(ph){return week>=ph.from&&week<=ph.to})||p.phases[p.phases.length-1]||null
}
function acSource(a){return a.sourceType==="program"?acProgram(a.sourceId):acRoutine(a.sourceId)}
function acSourceName(a){const s=acSource(a);return s?s.name:"Origen no disponible"}
function acSourceVersion(type,obj){return Number(obj&&obj.version||0)}
function acSequenceWorkout(a,step){
 step=Math.max(0,step==null?a.sequenceStep||0:step);
 if(a.sourceType==="routine"){
  const r=acRoutine(a.sourceId),days=acRoutineDays(r);
  return {name:days[step%days.length].name,routineId:r?r.id:null,dayIndex:step%days.length,week:Math.floor(step/Math.max(1,a.frequency))+1}
 }
 const p=acProgram(a.sourceId),week=Math.floor(step/Math.max(1,a.frequency))+1,ph=acProgramPhase(p,week),r=ph?acRoutine(ph.routineId):null,days=acRoutineDays(r);
 return {name:days[step%days.length].name,routineId:r?r.id:null,dayIndex:step%days.length,week:week,phase:ph?ph.name:""}
}
function acMaterialize(a){
 if(a.mode!=="fixed")return;
 const selected=(a.weekdays||[]).slice().sort(function(x,y){return x-y}),end=a.endDate||acAddDays(a.startDate,a.sourceType==="program"?Math.max(7,(acProgram(a.sourceId)||{}).duration*7-1):83);
 let date=a.startDate,count=0,sessions=[];
 while(date<=end){
  if(selected.indexOf(acWeekday(date))>=0){
   const info=acSequenceWorkout(a,count);
   sessions.push({id:"sess-"+a.id+"-"+count,date:date,originalDate:date,name:info.name,routineId:info.routineId,dayIndex:info.dayIndex,week:info.week,phase:info.phase||"",status:"planned",history:[]});
   count++;
  }
  date=acAddDays(date,1)
 }
 a.sessions=sessions
}
function acSeed(){
 if(assignments.length)return;
 const r=acRoutine("push-a");if(!r)return;
 const a={id:"assign-demo",sourceType:"routine",sourceId:r.id,sourceVersion:acSourceVersion("routine",r),traineeId:"carlos",traineeName:"Carlos Mendoza",startDate:acAddDays(acToday(),-5),endDate:null,mode:"fixed",frequency:3,weekdays:[0,2,4],status:"active",sequenceStep:0,sequenceHistory:[],createdAt:new Date().toISOString()};
 acMaterialize(a);assignments.push(a);acSave()
}
function acAssignmentsFor(type,id){return assignments.filter(function(a){return a.sourceType===type&&a.sourceId===id&&a.status!=="completed"})}
function acInjectBeforeClose(html,addition){const i=html.lastIndexOf("</section>");return i>=0?html.slice(0,i)+addition+html.slice(i):html+addition}
function acModeLabel(a){return a.mode==="fixed"?"Días fijos":"Secuencia flexible"}
function acAssignmentCard(a){
 const next=acNext(a),nextText=next?(a.mode==="fixed"?acDateLabel(next.date)+" · "+next.name:"Siguiente · "+next.name):"Sin sesiones pendientes";
 return '<article class="card ac-assignment-card"><button class="ac-assignment-open" data-ac-open="'+a.id+'"><div class="ac-assignment-top"><div><span class="ac-state '+a.status+'">'+acStatusLabel(a)+'</span><strong>'+acEsc(a.traineeName)+'</strong><small>'+acEsc(acModeLabel(a))+' · '+a.frequency+'/semana</small></div>'+ic("chevron-right")+'</div><div class="ac-next">'+ic("calendar-clock")+' '+acEsc(nextText)+'</div></button></article>'
}
function acSection(type,obj){
 const list=acAssignmentsFor(type,obj.id);
 return '<div class="section ac-source-section"><div class="section-head"><h2>Asignaciones</h2><button class="link" data-ac-assign="'+type+':'+obj.id+'">+ Asignar</button></div>'+
 (list.length?'<div class="ac-assignment-list">'+list.map(acAssignmentCard).join("")+'</div>':'<article class="card ac-empty"><span>'+ic("users-round")+'</span><div><strong>Sin asignaciones activas</strong><small>Asigna esta '+(type==="program"?"programación":"rutina")+' a uno o varios entrenados.</small></div></article>')+
 '</div>'
}
function acNext(a){
 if(a.status==="completed")return null;
 if(a.mode==="sequence")return acSequenceWorkout(a);
 const today=acToday(),sessions=(a.sessions||[]).filter(function(s){return s.status==="planned"||s.status==="rescheduled"});
 return sessions.find(function(s){return s.date>=today})||sessions[0]||null
}
function acDefaultWeekdays(freq){
 const map={1:[0],2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,3,4],6:[0,1,2,3,4,5]};
 return map[freq]||[0,2,4]
}
function acOpenAssign(type,id){
 const source=type==="program"?acProgram(id):acRoutine(id);if(!source)return;
 const today=acToday();
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ac-assign-bg"><div class="sheet ac-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Asignar</div><h2>'+acEsc(source.name)+'</h2></div><button class="icon-btn" id="ac-close-assign">'+ic("x")+'</button></div>'+
 '<div class="ac-subhead">Entrenados</div><div class="ac-trainees">'+trainees.map(function(t){return '<label><input type="checkbox" value="'+t.id+'"><span>'+acEsc(t.name)+'</span></label>'}).join("")+'</div>'+
 '<div class="ac-form-grid"><label class="rp-field"><span>Fecha de inicio</span><input id="ac-start" type="date" value="'+today+'"></label><label class="rp-field"><span>Frecuencia</span><select id="ac-frequency"><option value="2">2 / semana</option><option value="3" selected>3 / semana</option><option value="4">4 / semana</option><option value="5">5 / semana</option><option value="6">6 / semana</option></select></label></div>'+
 '<label class="rp-field"><span>Modalidad</span><select id="ac-mode"><option value="fixed">Días fijos</option><option value="sequence">Secuencia flexible</option></select></label>'+
 '<div id="ac-fixed-options"><div class="ac-subhead">Días de entrenamiento</div><div class="ac-weekdays">'+["L","M","X","J","V","S","D"].map(function(x,i){return '<button type="button" data-ac-weekday="'+i+'" class="'+([0,2,4].indexOf(i)>=0?"active":"")+'">'+x+'</button>'}).join("")+'</div></div>'+
 '<div class="ac-mode-help" id="ac-mode-help">Las sesiones quedan asociadas a fechas concretas. Si una se pierde, permanece pendiente hasta reprogramarla u omitirla.</div>'+
 '<button class="primary ac-primary" id="ac-create-assignment">Crear asignación</button></div></div>';
 if(window.lucide)lucide.createIcons();
 const mode=document.getElementById("ac-mode"),freq=document.getElementById("ac-frequency"),fixed=document.getElementById("ac-fixed-options"),help=document.getElementById("ac-mode-help");
 function updateMode(){const f=mode.value==="fixed";fixed.style.display=f?"":"none";help.textContent=f?"Las sesiones quedan asociadas a fechas concretas. Si una se pierde, permanece pendiente hasta reprogramarla u omitirla.":"El próximo entrenamiento avanza solo cuando se completa u omite. La frecuencia funciona como objetivo semanal."}
 function setWeekdays(){const wanted=acDefaultWeekdays(+freq.value);document.querySelectorAll("[data-ac-weekday]").forEach(function(b){b.classList.toggle("active",wanted.indexOf(+b.dataset.acWeekday)>=0)})}
 mode.onchange=updateMode;freq.onchange=function(){if(mode.value==="fixed")setWeekdays()};updateMode();
 document.querySelectorAll("[data-ac-weekday]").forEach(function(b){b.onclick=function(){b.classList.toggle("active")}});
 document.getElementById("ac-close-assign").onclick=clearRest;document.getElementById("ac-assign-bg").onclick=function(ev){if(ev.target.id==="ac-assign-bg")clearRest()};
 document.getElementById("ac-create-assignment").onclick=function(){
  const ids=Array.from(document.querySelectorAll(".ac-trainees input:checked")).map(function(x){return x.value});if(!ids.length){alert("Selecciona al menos un entrenado.");return}
  const frequency=+freq.value,start=document.getElementById("ac-start").value||today,weekdays=Array.from(document.querySelectorAll("[data-ac-weekday].active")).map(function(b){return +b.dataset.acWeekday});
  if(mode.value==="fixed"&&!weekdays.length){alert("Selecciona al menos un día.");return}
  ids.forEach(function(tid,n){
   const t=trainees.find(function(x){return x.id===tid}),a={id:"assign-"+Date.now()+"-"+n,sourceType:type,sourceId:id,sourceVersion:acSourceVersion(type,source),traineeId:t.id,traineeName:t.name,startDate:start,endDate:type==="program"?acAddDays(start,Math.max(7,(source.duration||1)*7)-1):null,mode:mode.value,frequency:frequency,weekdays:weekdays,status:start>today?"scheduled":"active",sequenceStep:0,sequenceHistory:[],sessions:[],createdAt:new Date().toISOString()};
   acMaterialize(a);assignments.push(a)
  });
  acSave();clearRest();render()
 }
}
function acSessionStatus(s){
 if(s.status==="completed")return "Completada";
 if(s.status==="skipped")return "Omitida";
 if(s.date<acToday())return "Pendiente";
 if(s.date===acToday())return "Hoy";
 return "Programada"
}
function acSessionClass(s){if(s.status==="completed")return "done";if(s.status==="skipped")return "skipped";if(s.date<acToday())return "overdue";if(s.date===acToday())return "today";return "planned"}
function acOpenDetail(id){
 const a=assignments.find(function(x){return x.id===id});if(!a)return;
 acState.detail=id;
 const next=acNext(a);
 const body=a.mode==="fixed"?acFixedDetail(a):acSequenceDetail(a);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ac-detail-bg"><div class="sheet ac-detail-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+acEsc(acSourceName(a))+'</div><h2>'+acEsc(a.traineeName)+'</h2></div><button class="icon-btn" id="ac-close-detail">'+ic("x")+'</button></div>'+
 '<div class="ac-detail-meta"><span class="ac-state '+a.status+'">'+acStatusLabel(a)+'</span><span>v'+a.sourceVersion+'</span><span>'+acEsc(acModeLabel(a))+'</span><span>'+a.frequency+'/sem.</span></div>'+
 (next?'<div class="ac-next-hero"><span>Próximo</span><strong>'+acEsc(next.name)+'</strong><small>'+(a.mode==="fixed"?acDateLabel(next.date):"Semana "+next.week+(next.phase?" · "+acEsc(next.phase):""))+'</small></div>':'')+
 body+
 '<div class="ac-assignment-controls"><button class="secondary" id="ac-toggle-pause">'+ic(a.status==="paused"?"play":"pause")+' '+(a.status==="paused"?"Reanudar":"Pausar")+'</button><button class="secondary" id="ac-finish-assignment">'+ic("flag")+' Finalizar</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ac-close-detail").onclick=clearRest;document.getElementById("ac-detail-bg").onclick=function(ev){if(ev.target.id==="ac-detail-bg")clearRest()};
 document.getElementById("ac-toggle-pause").onclick=function(){
  if(a.status==="paused"){acOpenResume(a);return}
  a.status="paused";a.pausedAt=acToday();acSave();clearRest();render()
 };
 document.getElementById("ac-finish-assignment").onclick=function(){if(confirm("¿Finalizar esta asignación?")){a.status="completed";acSave();clearRest();render()}};
 document.querySelectorAll("[data-ac-session]").forEach(function(b){b.onclick=function(){acOpenSessionMenu(a,b.dataset.acSession)}});
 document.querySelectorAll("[data-ac-sequence-action]").forEach(function(b){b.onclick=function(){acAdvanceSequence(a,b.dataset.acSequenceAction);acOpenDetail(a.id)}});
}
function acFixedDetail(a){
 const today=acToday(),sessions=(a.sessions||[]).filter(function(s){return s.date>=acAddDays(today,-7)&&s.date<=acAddDays(today,21)}).slice(0,12);
 return (a.status==="paused"?'<div class="ac-pause-note">'+ic("pause")+' Calendario pausado desde '+acDateLabel(a.pausedAt||today)+'. No se contabilizan atrasos durante la pausa.</div>':"")+
 '<div class="ac-detail-section"><div class="ac-detail-title"><strong>Agenda</strong><span>−7 a +21 días</span></div><div class="ac-session-list">'+sessions.map(function(s){const cls=a.status==="paused"?"paused":acSessionClass(s),label=a.status==="paused"&&s.status!=="completed"&&s.status!=="skipped"?"Pausada":acSessionStatus(s);return '<button class="ac-session '+cls+'" data-ac-session="'+s.id+'" '+(a.status==="paused"?'disabled':'')+'><div class="ac-session-date"><strong>'+acDateLabel(s.date).split(" ")[0]+'</strong><span>'+acDateLabel(s.date).split(" ").slice(1).join(" ")+'</span></div><div class="ac-session-copy"><strong>'+acEsc(s.name)+'</strong><small>'+(s.phase?acEsc(s.phase)+" · ":"")+'Semana '+s.week+'</small></div><span class="ac-session-status">'+label+'</span>'+ic("chevron-right")+'</button>'}).join("")+'</div></div>'
}
function acSequenceDetail(a){
 const next=acSequenceWorkout(a),history=(a.sequenceHistory||[]).slice().reverse().slice(0,8),disabled=a.status==="paused"?"disabled":"";
 return (a.status==="paused"?'<div class="ac-pause-note">'+ic("pause")+' Secuencia pausada desde '+acDateLabel(a.pausedAt||acToday())+'. El próximo entrenamiento no avanza.</div>':"")+
 '<div class="ac-sequence-box"><div><span>Objetivo semanal</span><strong>'+a.frequency+' sesiones</strong></div><div><span>Posición</span><strong>Sesión '+((a.sequenceStep||0)+1)+'</strong></div></div>'+
 '<div class="ac-sequence-actions"><button class="primary" data-ac-sequence-action="completed" '+disabled+'>'+ic("check")+' Completar y avanzar</button><button class="secondary" data-ac-sequence-action="skipped" '+disabled+'>'+ic("skip-forward")+' Omitir y avanzar</button></div>'+
 '<div class="ac-detail-section"><div class="ac-detail-title"><strong>Actividad reciente</strong></div><div class="ac-sequence-history">'+(history.length?history.map(function(h){return '<div><span class="'+h.status+'">'+ic(h.status==="completed"?"check":"skip-forward")+'</span><p><strong>'+acEsc(h.name)+'</strong><small>'+acDateLabel(h.date)+' · '+(h.status==="completed"?"Completada":"Omitida")+'</small></p></div>'}).join(""):'<div class="ac-history-empty">Todavía no hay sesiones registradas.</div>')+'</div></div>'
}
function acOpenResume(a){
 const pausedAt=a.pausedAt||acToday(),days=Math.max(0,acDiffDays(pausedAt,acToday()));
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ac-resume-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+acEsc(a.traineeName)+'</div><h2>Reanudar asignación</h2></div><button class="icon-btn" id="ac-close-resume">'+ic("x")+'</button></div><div class="ac-resume-summary">'+ic("calendar-range")+' Pausa de '+days+' día'+(days===1?"":"s")+'</div><div class="ac-resume-options"><button id="ac-resume-shift"><strong>Desplazar calendario</strong><span>Mueve las sesiones pendientes '+days+' día'+(days===1?"":"s")+'.</span></button><button id="ac-resume-keep"><strong>Mantener fechas originales</strong><span>Reanuda hoy sin mover las sesiones.</span></button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ac-close-resume").onclick=function(){acOpenDetail(a.id)};
 document.getElementById("ac-resume-bg").onclick=function(ev){if(ev.target.id==="ac-resume-bg")acOpenDetail(a.id)};
 function finish(shift){
  if(shift&&a.mode==="fixed"&&days>0)(a.sessions||[]).forEach(function(s){if((s.status==="planned"||s.status==="rescheduled")&&s.date>=pausedAt){const from=s.date;s.date=acAddDays(s.date,days);(s.history||(s.history=[])).push({type:"pause-shift",from:from,to:s.date,date:acToday()})}});
  if(Array.isArray(a.sessions))a.sessions.sort(function(x,y){return x.date.localeCompare(y.date)});
  a.status="active";a.resumedAt=acToday();delete a.pausedAt;acSave();acOpenDetail(a.id)
 }
 document.getElementById("ac-resume-shift").onclick=function(){finish(true)};
 document.getElementById("ac-resume-keep").onclick=function(){finish(false)}
}

function acAdvanceSequence(a,status){
 if(a.status==="paused"||a.status==="completed")return;
 const info=acSequenceWorkout(a);if(!Array.isArray(a.sequenceHistory))a.sequenceHistory=[];
 a.sequenceHistory.push({date:acToday(),name:info.name,week:info.week,phase:info.phase||"",status:status});
 a.sequenceStep=(a.sequenceStep||0)+1;acSave()
}
function acOpenSessionMenu(a,sid){
 const s=(a.sessions||[]).find(function(x){return x.id===sid});if(!s)return;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ac-session-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+acDateLabel(s.date)+'</div><h2>'+acEsc(s.name)+'</h2></div><button class="icon-btn" id="ac-close-session">'+ic("x")+'</button></div><div class="sheet-actions"><button id="ac-session-complete">'+ic("check-circle-2")+' Marcar completada</button><button id="ac-session-reschedule">'+ic("calendar-clock")+' Reprogramar</button><button id="ac-session-skip">'+ic("skip-forward")+' Omitir</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ac-close-session").onclick=function(){acOpenDetail(a.id)};
 document.getElementById("ac-session-bg").onclick=function(ev){if(ev.target.id==="ac-session-bg")acOpenDetail(a.id)};
 document.getElementById("ac-session-complete").onclick=function(){s.status="completed";s.completedDate=acToday();(s.history||(s.history=[])).push({type:"completed",date:acToday()});acSave();acOpenDetail(a.id)};
 document.getElementById("ac-session-skip").onclick=function(){s.status="skipped";s.skippedDate=acToday();(s.history||(s.history=[])).push({type:"skipped",date:acToday()});acSave();acOpenDetail(a.id)};
 document.getElementById("ac-session-reschedule").onclick=function(){acOpenReschedule(a,s)}
}
function acOpenReschedule(a,s){
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ac-reschedule-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+acEsc(s.name)+'</div><h2>Reprogramar sesión</h2></div><button class="icon-btn" id="ac-close-reschedule">'+ic("x")+'</button></div><label class="rp-field"><span>Nueva fecha</span><input id="ac-new-date" type="date" value="'+s.date+'"></label><div class="ac-original-date">'+ic("history")+' Fecha original: '+acDateLabel(s.originalDate||s.date)+'</div><button class="primary ac-primary" id="ac-save-reschedule">Guardar nueva fecha</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ac-close-reschedule").onclick=function(){acOpenSessionMenu(a,s.id)};
 document.getElementById("ac-reschedule-bg").onclick=function(ev){if(ev.target.id==="ac-reschedule-bg")acOpenSessionMenu(a,s.id)};
 document.getElementById("ac-save-reschedule").onclick=function(){const d=document.getElementById("ac-new-date").value;if(!d)return;(s.history||(s.history=[])).push({type:"rescheduled",from:s.date,to:d,date:acToday()});s.date=d;s.status="rescheduled";a.sessions.sort(function(x,y){return x.date.localeCompare(y.date)});acSave();acOpenDetail(a.id)}
}

acLoad();acSeed();

const acPrevRoutineDetailView=routineDetailView;
routineDetailView=function(index){
 const r=routineCatalog[index],html=acPrevRoutineDetailView(index);
 return acInjectBeforeClose(html,acSection("routine",r))
};

const acPrevRoutines=routines;
routines=function(){
 let html=acPrevRoutines();
 if(html.indexOf("rp-program-detail")>=0&&window.RodasPrograms){
  const st=window.RodasPrograms.getState(),p=acPrograms()[st.programDetail];
  if(p)html=acInjectBeforeClose(html,acSection("program",p))
 }
 return html
};

const acPrevEvents=events;
events=function(){
 acPrevEvents();
 document.querySelectorAll("[data-ac-assign]").forEach(function(b){b.onclick=function(){const p=b.dataset.acAssign.split(":");acOpenAssign(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-ac-open]").forEach(function(b){b.onclick=function(){acOpenDetail(b.dataset.acOpen)}});
};

render();
})();