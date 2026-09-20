(function(){
const SS_KEY="rodas.activeScheduledSession.v1";
let activeContext=null;

function ssEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function ssClone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function ssToday(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function ssAssignments(){return window.RodasAssignments?window.RodasAssignments.getAssignments():[]}
function ssAssignment(id){return window.RodasAssignments?window.RodasAssignments.getById(id):null}
function ssSaveAssignments(){if(window.RodasAssignments)window.RodasAssignments.save()}
function ssPrograms(){return window.RodasPrograms?window.RodasPrograms.getPrograms():[]}
function ssProgram(id){return ssPrograms().find(function(p){return p.id===id})||null}
function ssExerciseKey(e){return e.key||e._rbid||e.id||e.name}
function ssLoadContext(){try{const raw=localStorage.getItem(SS_KEY);if(raw)activeContext=JSON.parse(raw)}catch(e){}}
function ssSaveContext(){try{if(activeContext)localStorage.setItem(SS_KEY,JSON.stringify(activeContext));else localStorage.removeItem(SS_KEY)}catch(e){}}
function ssEffectiveRoutine(a,rid,context){
 if(window.RodasVersioning){const r=window.RodasVersioning.getEffectiveRoutine(a.id,rid,context);if(r)return r}
 if(a.baseSnapshot){
  if(a.baseSnapshot.type==="routine"&&a.baseSnapshot.id===rid)return ssClone(a.baseSnapshot);
  if(a.baseSnapshot.routines&&a.baseSnapshot.routines[rid])return ssClone(a.baseSnapshot.routines[rid])
 }
 return null
}
function ssSequenceInfo(a){
 const step=Math.max(0,a.sequenceStep||0),freq=Math.max(1,a.frequency||1);
 if(a.sourceType==="routine"){
  const week=Math.floor(step/freq)+1,r=ssEffectiveRoutine(a,a.sourceId,{week:week,phase:""}),days=r&&r.days&&r.days.length?r.days:[];
  return {step:step,week:week,phase:"",routineId:a.sourceId,dayIndex:days.length?step%days.length:0,name:days.length?days[step%days.length].name:"Entrenamiento"}
 }
 const p=a.baseSnapshot&&a.baseSnapshot.type==="program"?a.baseSnapshot:ssProgram(a.sourceId),week=Math.floor(step/freq)+1,ph=p&&p.phases?(p.phases.find(function(x){return week>=x.from&&week<=x.to})||p.phases[p.phases.length-1]):null;
 const rid=ph?ph.routineId:null,r=rid?ssEffectiveRoutine(a,rid,{week:week,phase:ph?ph.name:""}):null,days=r&&r.days&&r.days.length?r.days:[];
 return {step:step,week:week,phase:ph?ph.name:"",routineId:rid,dayIndex:days.length?step%days.length:0,name:days.length?days[step%days.length].name:"Entrenamiento"}
}
function ssOverridesFor(a,occ){
 if(occ.mode==="fixed"){if(!occ.session.overrides)occ.session.overrides={};return occ.session.overrides}
 if(!a.sequenceOverrides)a.sequenceOverrides={};
 const k=String(occ.step);if(!a.sequenceOverrides[k])a.sequenceOverrides[k]={};return a.sequenceOverrides[k]
}
function ssFields(ex){
 const p=ex.prescription||{},sets=ex.sets||[],first=sets[0]||[],m=first[7]||{};
 return {series:sets.length,repsMin:p.repsMin!=null?p.repsMin:(m.repsMin!=null?m.repsMin:Number(first[3]||0)),repsMax:p.repsMax!=null?p.repsMax:(m.repsMax!=null?m.repsMax:Number(first[3]||0)),loadMode:p.loadMode||((p.weight||first[2])?"fixed":"none"),weight:Number(p.weight!=null?p.weight:(m.weight!=null?m.weight:first[2]||0)),effortMode:p.effortMode||"rir",effortTarget:Number(p.effortTarget!=null?p.effortTarget:(p.rir!=null?p.rir:2)),rest:Number(p.rest||90),note:ex.note||""}
}
function ssSame(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function ssApplyField(ex,field,value){
 if(!ex.prescription)ex.prescription={};
 if(field==="note"){ex.note=value;return}
 if(field==="series"){
  if(!Array.isArray(ex.sets))ex.sets=[];const count=Math.max(1,Number(value||1));
  while(ex.sets.length<count){const last=ex.sets[ex.sets.length-1]||["1","—",0,10,false,"","Efectiva",{}],copy=ssClone(last);copy[0]=String(ex.sets.length+1);copy[4]=false;copy[5]="";ex.sets.push(copy)}
  if(ex.sets.length>count)ex.sets=ex.sets.slice(0,count);return
 }
 ex.prescription[field]=value;
 (ex.sets||[]).forEach(function(set){
  if(!set[7]||typeof set[7]!=="object")set[7]={};
  if(field==="repsMin")set[7].repsMin=value;
  if(field==="repsMax"){set[7].repsMax=value;set[3]=value}
  if(field==="weight"){set[7].weight=value;if(ex.prescription.loadMode!=="none")set[2]=value}
  if(field==="loadMode"){set[7].loadMode=value;if(value==="none")set[2]=0}
  if(field==="effortMode")set[7].effortMode=value;
  if(field==="effortTarget")set[7].effortTarget=value
 })
}
function ssBuildDay(a,occ){
 const r=ssEffectiveRoutine(a,occ.routineId,{week:occ.week||1,phase:occ.phase||""});if(!r)return null;
 const day=ssClone((r.days||[])[occ.dayIndex]||(r.days||[])[0]);if(!day)return null;
 const overrides=ssOverridesFor(a,occ);
 (day.exercises||[]).forEach(function(ex){const node=overrides[ssExerciseKey(ex)]||{};Object.keys(node).forEach(function(f){ssApplyField(ex,f,node[f])})});
 if(window.RodasSpecialCases&&window.RodasSpecialCases.applyOccurrenceSubstitutions)window.RodasSpecialCases.applyOccurrenceSubstitutions(a,day,occ);
 return day
}
function ssCountOverrides(a,occ){const root=ssOverridesFor(a,occ);return Object.keys(root).reduce(function(n,k){return n+Object.keys(root[k]||{}).length},0)}
function ssOccurrenceFromFixed(s){return {mode:"fixed",session:s,routineId:s.routineId,dayIndex:s.dayIndex,week:s.week,phase:s.phase||"",name:s.name}}
function ssOccurrenceFromSequence(a){const x=ssSequenceInfo(a);return {mode:"sequence",step:x.step,routineId:x.routineId,dayIndex:x.dayIndex,week:x.week,phase:x.phase,name:x.name}}
function ssActiveMatches(a,occ){
 if(!activeContext||activeContext.assignmentId!==a.id)return false;
 if(occ.mode==="fixed")return activeContext.mode==="fixed"&&activeContext.scheduledSessionId===occ.session.id;
 return activeContext.mode==="sequence"&&activeContext.sequenceStep===occ.step
}
function ssStart(a,occ){
 if(!occ.routineId){alert("Esta sesión no tiene una rutina válida.");return}
 if(state.startedAt){
  if(ssActiveMatches(a,occ)){clearRest();state.tab="workout";render();return}
  if(!confirm("Ya hay un entrenamiento en curso. ¿Reemplazarlo?"))return;
  ssRevertActiveOccurrence()
 }
 const day=ssBuildDay(a,occ);if(!day){alert("No fue posible construir la prescripción de esta sesión.");return}
 const snapshot={assignmentId:a.id,traineeId:a.traineeId,traineeName:a.traineeName,sourceType:a.sourceType,sourceId:a.sourceId,sourceVersion:a.sourceVersion,mode:occ.mode,routineId:occ.routineId,dayId:day.id,dayIndex:occ.dayIndex,week:occ.week||1,phase:occ.phase||"",name:day.name,day:ssClone(day),frozenAt:new Date().toISOString()};
 activeContext={assignmentId:a.id,mode:occ.mode,scheduledSessionId:occ.mode==="fixed"?occ.session.id:null,sequenceStep:occ.mode==="sequence"?occ.step:null,previousStatus:occ.mode==="fixed"?occ.session.status:null,snapshot:snapshot};
 if(occ.mode==="fixed"){
  occ.session.previousStatus=occ.session.status;occ.session.status="in-progress";occ.session.startedAt=snapshot.frozenAt;occ.session.startedSnapshot=ssClone(snapshot)
 }else{
  a.sequenceActive={step:occ.step,startedAt:snapshot.frozenAt,startedSnapshot:ssClone(snapshot)}
 }
 ssSaveAssignments();
 clearInterval(state.workoutTimer);state.activeRoutineName=(a.sourceType==="program"?(ssProgram(a.sourceId)||{name:"Programa"}).name:a.baseSnapshot&&a.baseSnapshot.name||"Rutina")+" · "+day.name;
 state.exercises=ssClone(day.exercises||[]);state.exercises.forEach(function(e){(e.sets||[]).forEach(function(set){set[4]=false})});normalizeWorkoutData();
 state.startedAt=null;state.elapsed=0;state.activeExercise=0;clearSavedWorkout();startWorkout();ssSaveContext();state.tab="workout";state.routineDetail=null;clearRest();render()
}
function ssRevertActiveOccurrence(){
 if(!activeContext)return;
 const a=ssAssignment(activeContext.assignmentId);
 if(a&&activeContext.mode==="fixed"){
  const s=(a.sessions||[]).find(function(x){return x.id===activeContext.scheduledSessionId});
  if(s&&s.status==="in-progress"){s.status=activeContext.previousStatus||s.previousStatus||"planned";delete s.startedAt;delete s.startedSnapshot}
 }else if(a&&activeContext.mode==="sequence"){
  delete a.sequenceActive
 }
 ssSaveAssignments();activeContext=null;ssSaveContext()
}
function ssCompleteActive(){
 if(!activeContext)return;
 const a=ssAssignment(activeContext.assignmentId);if(!a)return;
 const resolvedStatus=doneSets()<totalSets()?"partial":"completed";
 const actual={completedAt:new Date().toISOString(),elapsed:state.elapsed,exercises:ssClone(state.exercises),prescriptionSnapshot:ssClone(activeContext.snapshot),status:resolvedStatus};
 if(activeContext.mode==="fixed"){
  const s=(a.sessions||[]).find(function(x){return x.id===activeContext.scheduledSessionId});
  if(s){s.status=resolvedStatus;s.completedDate=ssToday();s.actualSnapshot=actual;(s.history||(s.history=[])).push({type:resolvedStatus,date:ssToday(),fromStartedSnapshot:true})}
 }else{
  const step=activeContext.sequenceStep;
  if((a.sequenceStep||0)===step){
   const snap=activeContext.snapshot;a.sequenceHistory=a.sequenceHistory||[];a.sequenceHistory.push({date:ssToday(),name:snap.name,week:snap.week,phase:snap.phase||"",status:resolvedStatus,actualSnapshot:actual});a.sequenceStep=step+1
  }
  delete a.sequenceActive
 }
 ssSaveAssignments()
}
function ssAttachHistory(){
 if(!activeContext||!historySessions.length)return;
 historySessions[0].assignmentId=activeContext.assignmentId;
 historySessions[0].scheduledSessionId=activeContext.scheduledSessionId||null;
 historySessions[0].sourceVersion=activeContext.snapshot.sourceVersion;
 historySessions[0].plannedSnapshot=ssClone(activeContext.snapshot);
 saveHistory()
}
function ssFinish(){
 if(!confirm("¿Finalizar este entrenamiento?"))return;
 ssCompleteActive();addCompletedSession();ssAttachHistory();clearInterval(state.workoutTimer);state.startedAt=null;state.elapsed=0;state.activeExercise=0;state.exercises.forEach(function(e){e.sets.forEach(function(s){s[4]=false})});clearSavedWorkout();activeContext=null;ssSaveContext();state.historyMode="sessions";state.tab="history";render()
}
function ssFormatValue(field,v){
 if(field==="loadMode")return v==="fixed"?"Prescrita":v==="suggested"?"Orientativa":"Sin carga";
 if(field==="effortMode")return v==="rir"?"RIR":v==="rpe"?"RPE":"Sin objetivo";
 if(field==="weight"){const shown=typeof toDisplayWeight==="function"?toDisplayWeight(Number(v||0)):Number(v||0),u=typeof unitLabel==="function"?unitLabel():"kg";return shown+" "+u}if(field==="rest")return Number(v||0)+" s";return String(v==null?"—":v)
}
const SS_LABELS={series:"Series",repsMin:"Reps mín.",repsMax:"Reps máx.",loadMode:"Carga",weight:"Peso",effortMode:"Esfuerzo",effortTarget:"Objetivo",rest:"Descanso",note:"Nota"};
function ssField(ex,field,base,node){
 const custom=Object.prototype.hasOwnProperty.call(node,field),value=custom?node[field]:base,shownValue=field==="weight"&&typeof toDisplayWeight==="function"?toDisplayWeight(Number(value||0)):value;let input="";
 if(field==="loadMode")input='<select data-ss-field="'+field+'"><option value="none" '+(value==="none"?"selected":"")+'>Sin carga</option><option value="fixed" '+(value==="fixed"?"selected":"")+'>Prescrita</option><option value="suggested" '+(value==="suggested"?"selected":"")+'>Orientativa</option></select>';
 else if(field==="effortMode")input='<select data-ss-field="'+field+'"><option value="none" '+(value==="none"?"selected":"")+'>Sin objetivo</option><option value="rir" '+(value==="rir"?"selected":"")+'>RIR</option><option value="rpe" '+(value==="rpe"?"selected":"")+'>RPE</option></select>';
 else input='<input data-ss-field="'+field+'" '+(field==="note"?'':'inputmode="decimal"')+' value="'+ssEsc(shownValue)+'">';
 return '<label class="ss-field '+(custom?"custom":"")+'"><span>'+SS_LABELS[field]+(custom?' <b>Solo esta sesión</b>':'')+'</span>'+input+'<button type="button" data-ss-reset="'+field+'" '+(custom?"":"disabled")+'>'+ic("rotate-ccw")+'</button></label>'
}
function ssEditOccurrence(a,occ){
 if(ssActiveMatches(a,occ)&&state.startedAt){alert("Esta sesión ya comenzó. Su snapshot está congelado.");return}
 const day=ssBuildDay(a,occ);if(!day)return;const root=ssOverridesFor(a,occ);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ss-edit-bg"><div class="sheet ss-edit-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Solo esta sesión</div><h2>'+ssEsc(day.name)+'</h2></div><button class="icon-btn" id="ss-close-edit">'+ic("x")+'</button></div><div class="ss-warning">'+ic("calendar-cog")+' Estos cambios afectan únicamente esta ocurrencia. La asignación y la plantilla permanecen intactas.</div><div class="ss-edit-list">'+(day.exercises||[]).map(function(ex){const key=ssExerciseKey(ex),base=ssFields(ex),node=root[key]||{};return '<article class="ss-ex-card" data-ss-ex="'+ssEsc(key)+'"><div class="ss-ex-head"><strong>'+ssEsc(ex.name)+'</strong><span>'+Object.keys(node).length+' cambios</span></div><div class="ss-fields">'+["series","repsMin","repsMax","loadMode","weight","effortMode","effortTarget","rest","note"].map(function(f){return ssField(ex,f,base[f],node)}).join("")+'</div></article>'}).join("")+'</div><button class="primary ss-save" id="ss-save-edit">Guardar para esta sesión</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ss-close-edit").onclick=function(){ssOpenOccurrence(a,occ)};
 document.getElementById("ss-edit-bg").onclick=function(ev){if(ev.target.id==="ss-edit-bg")ssOpenOccurrence(a,occ)};
 document.querySelectorAll("[data-ss-reset]").forEach(function(btn){btn.onclick=function(){const card=btn.closest(".ss-ex-card"),key=card.dataset.ssEx,node=root[key]||{};delete node[btn.dataset.ssReset];if(!Object.keys(node).length)delete root[key];ssSaveAssignments();ssEditOccurrence(a,occ)}});
 document.getElementById("ss-save-edit").onclick=function(){
  document.querySelectorAll(".ss-ex-card").forEach(function(card){
   const key=card.dataset.ssEx,baseEx=(day.exercises||[]).find(function(e){return ssExerciseKey(e)===key}),base=ssFields(baseEx),node=root[key]||(root[key]={});
   card.querySelectorAll("[data-ss-field]").forEach(function(input){const f=input.dataset.ssField;let v=input.value;if(["series","repsMin","repsMax","weight","effortTarget","rest"].indexOf(f)>=0){const n=Number(String(v).replace(",","."));v=Number.isFinite(n)?n:base[f];if(f==="weight"&&typeof fromDisplayWeight==="function")v=fromDisplayWeight(v)}if(ssSame(v,base[f]))delete node[f];else node[f]=v});
   if(!Object.keys(node).length)delete root[key]
  });ssSaveAssignments();ssOpenOccurrence(a,occ)
 }
}
function ssReschedule(a,s){
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ss-reschedule-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+ssEsc(s.name)+'</div><h2>Reprogramar sesión</h2></div><button class="icon-btn" id="ss-close-reschedule">'+ic("x")+'</button></div><label class="rp-field"><span>Nueva fecha</span><input id="ss-new-date" type="date" value="'+s.date+'"></label><div class="ss-original">'+ic("history")+' Fecha original: '+ssEsc(s.originalDate||s.date)+'</div><button class="primary ss-save" id="ss-save-reschedule">Guardar</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ss-close-reschedule").onclick=function(){ssOpenOccurrence(a,ssOccurrenceFromFixed(s))};
 document.getElementById("ss-reschedule-bg").onclick=function(ev){if(ev.target.id==="ss-reschedule-bg")ssOpenOccurrence(a,ssOccurrenceFromFixed(s))};
 document.getElementById("ss-save-reschedule").onclick=function(){const d=document.getElementById("ss-new-date").value;if(!d)return;(s.history||(s.history=[])).push({type:"rescheduled",from:s.date,to:d,date:ssToday()});s.date=d;s.status="rescheduled";(a.sessions||[]).sort(function(x,y){return x.date.localeCompare(y.date)});ssSaveAssignments();window.RodasAssignments.openDetail(a.id)}
}
function ssOpenOccurrence(a,occ){
 const day=ssBuildDay(a,occ),count=ssCountOverrides(a,occ),started=ssActiveMatches(a,occ)&&state.startedAt;
 const fixed=occ.mode==="fixed",s=fixed?occ.session:null,status=fixed?s.status:(a.sequenceActive&&a.sequenceActive.step===occ.step?"in-progress":"planned"),terminal=fixed&&(s.status==="completed"||s.status==="partial"||s.status==="skipped");
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="ss-occ-bg"><div class="sheet ss-occ-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+ssEsc(a.traineeName)+'</div><h2>'+ssEsc(day?day.name:occ.name)+'</h2></div><button class="icon-btn" id="ss-close-occ">'+ic("x")+'</button></div><div class="ss-occ-meta"><span>'+ssEsc(fixed?s.date:"Secuencia flexible")+'</span><span>Semana '+(occ.week||1)+'</span>'+(occ.phase?'<span>'+ssEsc(occ.phase)+'</span>':'')+'<span>v'+a.sourceVersion+'</span></div><div class="ss-frozen '+(started?"active":"")+'">'+ic(started?"snowflake":"layers-3")+'<div><strong>'+(started?"Snapshot congelado":"Prescripción todavía editable")+'</strong><span>'+(started?"Las publicaciones posteriores no modificarán esta sesión iniciada.":"Se congelará exactamente al pulsar Entrenar ahora.")+'</span></div></div><div class="ss-occ-summary"><div><strong>'+(day&&day.exercises?day.exercises.length:0)+'</strong><span>Ejercicios</span></div><div><strong>'+count+'</strong><span>Cambios puntuales</span></div></div><div class="ss-main-actions"><button class="primary" id="ss-train-now" '+(terminal&&!started?'disabled':'')+'>'+ic(started?"play":"play")+' '+(started?"Continuar":terminal?"Sesión resuelta":"Entrenar ahora")+'</button><button class="secondary" id="ss-edit-only" '+(started||terminal?'disabled':'')+'>'+ic("calendar-cog")+' Editar solo esta sesión</button></div>'+(fixed?'<div class="sheet-actions ss-secondary-actions"><button id="ss-reschedule" '+(started?'disabled':'')+'>'+ic("calendar-clock")+' Reprogramar</button><button id="ss-complete-manual" '+(started?'disabled':'')+'>'+ic("check-circle-2")+' Marcar completada</button><button id="ss-skip" '+(started?'disabled':'')+'>'+ic("skip-forward")+' Omitir</button></div>':'')+'</div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("ss-close-occ").onclick=function(){window.RodasAssignments.openDetail(a.id)};
 document.getElementById("ss-occ-bg").onclick=function(ev){if(ev.target.id==="ss-occ-bg")window.RodasAssignments.openDetail(a.id)};
 document.getElementById("ss-train-now").onclick=function(){if(!terminal||started)ssStart(a,occ)};
 document.getElementById("ss-edit-only").onclick=function(){ssEditOccurrence(a,occ)};
 if(fixed){
  document.getElementById("ss-reschedule").onclick=function(){ssReschedule(a,s)};
  document.getElementById("ss-complete-manual").onclick=function(){s.status="completed";s.completedDate=ssToday();(s.history||(s.history=[])).push({type:"completed-manual",date:ssToday()});ssSaveAssignments();window.RodasAssignments.openDetail(a.id)};
  document.getElementById("ss-skip").onclick=function(){s.status="skipped";s.skippedDate=ssToday();(s.history||(s.history=[])).push({type:"skipped",date:ssToday()});ssSaveAssignments();window.RodasAssignments.openDetail(a.id)}
 }
}
function ssOpenFixedSession(a,s){ssOpenOccurrence(a,ssOccurrenceFromFixed(s))}
function ssAugmentDetail(id){
 const a=ssAssignment(id);if(!a)return;const sheet=document.querySelector(".ac-detail-sheet");if(!sheet)return;
 if(a.mode==="sequence"&&!sheet.querySelector(".ss-sequence-actions")){
  const occ=ssOccurrenceFromSequence(a),next=sheet.querySelector(".ac-next-hero"),wrap=document.createElement("div");wrap.className="ss-sequence-actions";
  wrap.innerHTML='<button class="primary" id="ss-sequence-train">'+ic("play")+' Entrenar ahora</button><button class="secondary" id="ss-sequence-edit">'+ic("calendar-cog")+' Editar solo próxima</button>';
  if(next)next.insertAdjacentElement("afterend",wrap);else sheet.querySelector(".ac-detail-meta").insertAdjacentElement("afterend",wrap);
  if(window.lucide)lucide.createIcons();
  document.getElementById("ss-sequence-train").onclick=function(){ssStart(a,occ)};
  document.getElementById("ss-sequence-edit").onclick=function(){ssEditOccurrence(a,occ)}
 }
}
ssLoadContext();
if(activeContext&&!state.startedAt){activeContext=null;ssSaveContext()}
const baseAssignmentOpen=window.RodasAssignments&&window.RodasAssignments.openDetail;
if(baseAssignmentOpen)window.RodasAssignments.openDetail=function(id){baseAssignmentOpen(id);ssAugmentDetail(id)};

const baseWorkout=workout;
workout=function(){
 let html=baseWorkout();
 if(activeContext&&state.startedAt){
  const s=activeContext.snapshot;
  const banner='<div class="ss-active-banner">'+ic("snowflake")+'<div><strong>Sesión programada · snapshot congelado</strong><span>'+ssEsc(s.traineeName)+' · v'+s.sourceVersion+(s.phase?' · '+ssEsc(s.phase):'')+'</span></div></div>';
  const marker='<div class="current-exercise-label">';html=html.replace(marker,banner+marker)
 }
 return html
};

const baseWorkoutMenu=openWorkoutMenu;
openWorkoutMenu=function(){
 baseWorkoutMenu();
 if(!activeContext)return;
 const discard=document.getElementById("workout-discard");if(discard)discard.onclick=function(){if(confirm("¿Descartar este entrenamiento? La sesión programada volverá a quedar pendiente.")){ssRevertActiveOccurrence();clearInterval(state.workoutTimer);state.startedAt=null;state.elapsed=0;state.activeExercise=0;clearSavedWorkout();clearRest();state.tab="home";render()}}
};

const ssPrevEvents=events;
events=function(){
 ssPrevEvents();
 const f=document.getElementById("finish");if(f&&activeContext)f.onclick=ssFinish;
 document.querySelectorAll("[data-ac-open]").forEach(function(b){const old=b.onclick;b.onclick=function(){if(old)old();ssAugmentDetail(b.dataset.acOpen)}})
};

window.RodasScheduledSessions={
 openFixedSession:ssOpenFixedSession,
 augmentDetail:ssAugmentDetail,
 getActiveContext:function(){return activeContext},
 getSequenceOccurrence:function(assignmentId){const a=ssAssignment(assignmentId);return a?ssOccurrenceFromSequence(a):null},
 openOccurrence:function(assignmentId,occ){const a=ssAssignment(assignmentId);if(a&&occ)ssOpenOccurrence(a,occ)},
 buildOccurrence:function(assignmentId,occ){const a=ssAssignment(assignmentId);return a&&occ?ssBuildDay(a,occ):null},
 buildDay:function(assignmentId,sessionId){const a=ssAssignment(assignmentId);if(!a)return null;const s=(a.sessions||[]).find(function(x){return x.id===sessionId});return s?ssBuildDay(a,ssOccurrenceFromFixed(s)):null}
};
render();
})();