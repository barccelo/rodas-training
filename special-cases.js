(function(){
const SC_LIB_KEY="rodas.exerciseLibraryState.v1";
let scLibrary={};

function scEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function scClone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function scSlug(v){return String(v||"exercise").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function scKey(name){return String(name||"").trim().toLowerCase()}
function scAssignments(){return window.RodasAssignments?window.RodasAssignments.getAssignments():[]}
function scAssignment(id){return window.RodasAssignments?window.RodasAssignments.getById(id):null}
function scSaveAssignments(){if(window.RodasAssignments)window.RodasAssignments.save()}
function scPrograms(){return window.RodasPrograms?window.RodasPrograms.getPrograms():[]}
function scRoutine(id){return routineCatalog.find(function(r){return r.id===id})||null}
function scLoadLibrary(){try{const raw=localStorage.getItem(SC_LIB_KEY);if(raw)scLibrary=JSON.parse(raw)||{}}catch(e){}scRefreshLibrary()}
function scSaveLibrary(){try{localStorage.setItem(SC_LIB_KEY,JSON.stringify(scLibrary))}catch(e){}}
function scRegister(name,id){
 const k=scKey(name);if(!k)return;
 if(!scLibrary[k])scLibrary[k]={id:id||scSlug(name),name:name,archived:false};
 else {scLibrary[k].name=name;if(id)scLibrary[k].id=id}
}
function scRefreshLibrary(){
 ["Press banca","Sentadilla","Remo con barra","Press militar","Dominadas","Peso muerto rumano","Elevaciones laterales","Curl inclinado","Press inclinado con mancuernas","Jalón al pecho","Prensa de piernas","Extensión de tríceps"].forEach(function(n){scRegister(n)});
 routineCatalog.forEach(function(r){const days=Array.isArray(r.days)&&r.days.length?r.days:[{exercises:r.exercises||[]}];days.forEach(function(d){(d.exercises||[]).forEach(function(e){scRegister(e.originalExerciseName||e.name,e.id)})})});
 scSaveLibrary()
}
function scLibraryItems(includeArchived){scRefreshLibrary();return Object.keys(scLibrary).map(function(k){return scLibrary[k]}).filter(function(x){return includeArchived||!x.archived}).sort(function(a,b){return a.name.localeCompare(b.name)})}
function scIsArchived(name){const x=scLibrary[scKey(name)];return !!(x&&x.archived)}
function scArchiveExercise(name,value){const x=scLibrary[scKey(name)];if(!x)return;x.archived=value;scSaveLibrary()}
function scOpenLibrary(view){
 view=view||"active";scRefreshLibrary();const items=scLibraryItems(true).filter(function(x){return view==="archived"?x.archived:!x.archived});
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sc-lib-bg"><div class="sheet sc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Biblioteca</div><h2>Ejercicios</h2></div><button class="icon-btn" id="sc-close-lib">'+ic("x")+'</button></div><div class="sc-lib-tabs"><button data-sc-lib-view="active" class="'+(view==="active"?"active":"")+'">Disponibles</button><button data-sc-lib-view="archived" class="'+(view==="archived"?"active":"")+'">Archivados</button></div><div class="library-search">'+ic("search")+'<input id="sc-lib-search" placeholder="Buscar ejercicio"></div><div class="sc-lib-results" id="sc-lib-results">'+(items.length?items.map(function(x){return '<div data-sc-lib-row><span class="sc-lib-icon">'+ic(x.archived?"archive":"dumbbell")+'</span><span class="sc-lib-copy"><strong>'+scEsc(x.name)+'</strong><small>'+(x.archived?"No aparece al crear nuevas prescripciones":"Disponible para nuevas rutinas")+'</small></span><button data-sc-lib-toggle="'+scEsc(x.name)+'" class="'+(x.archived?"restore":"")+'">'+ic(x.archived?"archive-restore":"archive")+' '+(x.archived?"Restaurar":"Archivar")+'</button></div>'}).join(""):'<div class="sc-empty">No hay ejercicios en esta vista.</div>')+'</div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("sc-close-lib").onclick=clearRest;document.getElementById("sc-lib-bg").onclick=function(ev){if(ev.target.id==="sc-lib-bg")clearRest()};
 document.querySelectorAll("[data-sc-lib-view]").forEach(function(b){b.onclick=function(){scOpenLibrary(b.dataset.scLibView)}});
 document.getElementById("sc-lib-search").oninput=function(){const q=this.value.toLowerCase();document.querySelectorAll("[data-sc-lib-row]").forEach(function(row){row.style.display=row.textContent.toLowerCase().includes(q)?"":"none"})};
 document.querySelectorAll("[data-sc-lib-toggle]").forEach(function(b){b.onclick=function(){const name=b.dataset.scLibToggle,arch=scIsArchived(name);if(!arch){const used=scExerciseUseCount(name);if(used&&!confirm(name+" aparece en "+used+" prescripción"+(used===1?"":"es")+". Archivarlo no afectará esas referencias históricas. ¿Continuar?"))return}scArchiveExercise(name,!arch);scOpenLibrary(!arch?"archived":"active")}})
}
function scExerciseUseCount(name){
 let n=0;routineCatalog.forEach(function(r){const days=Array.isArray(r.days)&&r.days.length?r.days:[{exercises:r.exercises||[]}];days.forEach(function(d){(d.exercises||[]).forEach(function(e){if(scKey(e.originalExerciseName||e.name)===scKey(name))n++})})});return n
}
function scRoutineDays(r){return Array.isArray(r&&r.days)&&r.days.length?r.days:[{id:"day-1",name:r?r.name:"Día 1",exercises:r&&r.exercises?r.exercises:[],blocks:[]}]}
function scValidateRoutine(r){
 const errors=[],warnings=[],days=scRoutineDays(r);
 if(!String(r.name||"").trim())errors.push("La rutina necesita un nombre.");
 if(!days.length)errors.push("La rutina no tiene entrenamientos.");
 days.forEach(function(d,di){
  if(!(d.exercises||[]).length)errors.push((d.name||"Día "+(di+1))+" no contiene ejercicios.");
  (d.exercises||[]).forEach(function(e,ei){
   const label=(d.name||"Día "+(di+1))+" · "+(e.name||"Ejercicio "+(ei+1)),p=e.prescription||{};
   if(!Array.isArray(e.sets)||!e.sets.length)errors.push(label+" no tiene series.");
   if(Number(p.repsMax||0)<Number(p.repsMin||0))errors.push(label+" tiene un rango inválido.");
   if((p.metricType==="time"||p.metricType==="distance")&&Number(p.repsMax||0)<=0)errors.push(label+" necesita un objetivo de "+(p.metricType==="time"?"tiempo":"distancia")+".");
   if(scIsArchived(e.originalExerciseName||e.name))warnings.push(label+" usa un ejercicio archivado; seguirá siendo válido históricamente.");
   if(!p.rest)warnings.push(label+" no tiene descanso definido.");
   if(p.optional)warnings.push(label+" está marcado como opcional.");
  });
  (d.blocks||[]).forEach(function(b){if(b.type!=="individual"&&(b.exerciseIds||[]).length<2)errors.push((d.name||"Día "+(di+1))+" contiene una agrupación con menos de dos ejercicios.")})
 });
 return {errors:errors,warnings:warnings}
}
function scValidateProgram(p){
 const errors=[],warnings=[];
 if(!String(p.name||"").trim())errors.push("El programa necesita un nombre.");
 if(Number(p.duration||0)<=0)errors.push("La duración del programa no es válida.");
 if(!(p.phases||[]).length)errors.push("El programa necesita al menos una fase.");
 const slots={};
 (p.phases||[]).forEach(function(ph){
  if(Number(ph.from)<1||Number(ph.to)<Number(ph.from)||Number(ph.to)>Number(p.duration||0))errors.push((ph.name||"Fase")+" tiene semanas fuera del rango del programa.");
  const r=scRoutine(ph.routineId);if(!r)errors.push((ph.name||"Fase")+" referencia una rutina inexistente.");else if(r.archived)warnings.push((ph.name||"Fase")+" utiliza "+r.name+", que está archivada.");
  for(let w=Number(ph.from||0);w<=Number(ph.to||0);w++){if(slots[w])errors.push("La semana "+w+" aparece en más de una fase.");slots[w]=1}
 });
 for(let w=1;w<=Number(p.duration||0);w++)if(!slots[w])warnings.push("La semana "+w+" no está cubierta por ninguna fase.");
 return {errors:errors,warnings:warnings}
}
function scValidationSheet(type,obj,result){
 const canPublish=!result.errors.length;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sc-validation-bg"><div class="sheet sc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Revisión antes de publicar</div><h2>'+scEsc(obj.name||"Sin nombre")+'</h2></div><button class="icon-btn" id="sc-close-validation">'+ic("x")+'</button></div><div class="sc-validation-summary '+(canPublish?"ok":"error")+'">'+ic(canPublish?"check-circle-2":"circle-alert")+'<div><strong>'+(canPublish?"Lista para publicar":"Hay errores que bloquean la publicación")+'</strong><span>'+result.errors.length+' errores · '+result.warnings.length+' advertencias</span></div></div>'+(result.errors.length?'<div class="sc-validation-group"><strong>Errores</strong>'+result.errors.map(function(x){return '<div class="error">'+ic("x-circle")+' '+scEsc(x)+'</div>'}).join("")+'</div>':"")+(result.warnings.length?'<div class="sc-validation-group"><strong>Advertencias</strong>'+result.warnings.map(function(x){return '<div class="warning">'+ic("triangle-alert")+' '+scEsc(x)+'</div>'}).join("")+'</div>':"")+'<div class="sc-validation-actions"><button class="secondary" id="sc-cancel-publish">Volver a editar</button>'+(canPublish?'<button class="primary" id="sc-confirm-publish">'+ic("send")+' Continuar a publicación</button>':"")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("sc-close-validation").onclick=clearRest;document.getElementById("sc-cancel-publish").onclick=clearRest;document.getElementById("sc-validation-bg").onclick=function(ev){if(ev.target.id==="sc-validation-bg")clearRest()};
 const go=document.getElementById("sc-confirm-publish");if(go)go.onclick=function(){clearRest();window.RodasVersioning.publish(type,obj.id)}
}
function scValidateAndPublish(type,id){const obj=type==="routine"?scRoutine(id):scPrograms().find(function(p){return p.id===id});if(!obj)return;scValidationSheet(type,obj,type==="routine"?scValidateRoutine(obj):scValidateProgram(obj))}
function scSubRoot(a,rid,did,create){
 if(!a.substitutions&&create)a.substitutions={};if(!a.substitutions)return null;
 if(!a.substitutions[rid]&&create)a.substitutions[rid]={};if(!a.substitutions[rid])return null;
 if(!a.substitutions[rid][did]&&create)a.substitutions[rid][did]={};return a.substitutions[rid][did]||null
}
function scApplyReplacement(ex,sub,scope){
 if(!sub||!sub.replacement)return;
 if(!ex.substitutionOriginal)ex.substitutionOriginal={id:ex.id,name:ex.name};
 ex.prescribedExerciseId=ex.substitutionOriginal.id;ex.prescribedExerciseName=ex.substitutionOriginal.name;
 ex.id=sub.replacement.id;ex.name=sub.replacement.name;
 ex.substitution={scope:scope,original:scClone(ex.substitutionOriginal),replacement:scClone(sub.replacement),reason:sub.reason||""}
}
function scApplyAssignmentSubs(a,r){
 if(!a||!r||!a.substitutions)return r;
 (r.days||[]).forEach(function(d){const root=scSubRoot(a,r.id,d.id,false);if(!root)return;(d.exercises||[]).forEach(function(ex){const key=ex.key||ex._rbid||ex.id||ex.name;if(root[key])scApplyReplacement(ex,root[key],"assignment")})});return r
}
function scOccSubRoot(a,occ,create){
 if(occ.mode==="fixed"){if(!occ.session.substitutions&&create)occ.session.substitutions={};return occ.session.substitutions||null}
 if(!a.sequenceSubstitutions&&create)a.sequenceSubstitutions={};if(!a.sequenceSubstitutions)return null;
 const k=String(occ.step);if(!a.sequenceSubstitutions[k]&&create)a.sequenceSubstitutions[k]={};return a.sequenceSubstitutions[k]||null
}
function scApplyOccurrenceSubs(a,day,occ){
 const root=scOccSubRoot(a,occ,false);if(!root)return day;
 (day.exercises||[]).forEach(function(ex){const key=ex.key||ex._rbid||ex.prescribedExerciseId||ex.id||ex.name;if(root[key])scApplyReplacement(ex,root[key],"scheduled")});return day
}
function scRoutineSnapshots(a){
 if(!a.baseSnapshot)return[];
 if(a.baseSnapshot.type==="routine")return[a.baseSnapshot];
 return Object.keys(a.baseSnapshot.routines||{}).map(function(k){return a.baseSnapshot.routines[k]})
}
function scOpenAssignmentSubs(a,rid){
 const choices=scRoutineSnapshots(a);rid=rid||choices[0]&&choices[0].id;const r=choices.find(function(x){return x.id===rid});if(!r)return;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sc-subs-bg"><div class="sheet sc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+scEsc(a.traineeName)+'</div><h2>Sustituciones permanentes</h2></div><button class="icon-btn" id="sc-close-subs">'+ic("x")+'</button></div>'+(choices.length>1?'<label class="rp-field"><span>Rutina</span><select id="sc-subs-routine">'+choices.map(function(x){return '<option value="'+x.id+'" '+(x.id===rid?"selected":"")+'>'+scEsc(x.name)+'</option>'}).join("")+'</select></label>':"")+'<div class="sc-sub-help">'+ic("replace")+' La sustitución conserva la prescripción y afecta únicamente a este entrenado. El historial del ejercicio original no se fusiona con el sustituto.</div><div class="sc-sub-list">'+(r.days||[]).map(function(d){const root=scSubRoot(a,rid,d.id,false)||{};return '<section><div class="sc-sub-day">'+scEsc(d.name)+'</div>'+(d.exercises||[]).map(function(ex){const key=ex.key||ex._rbid||ex.id||ex.name,sub=root[key];return '<div class="sc-sub-row"><div><strong>'+scEsc(ex.name)+'</strong><span>'+(sub?'→ '+scEsc(sub.replacement.name):'Sin sustitución')+'</span></div><button data-sc-assignment-sub="'+rid+':'+d.id+':'+encodeURIComponent(key)+'">'+(sub?"Cambiar":"Sustituir")+'</button>'+(sub?'<button class="reset" data-sc-assignment-reset="'+rid+':'+d.id+':'+encodeURIComponent(key)+'">'+ic("rotate-ccw")+'</button>':"")+'</div>'}).join("")+'</section>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("sc-close-subs").onclick=function(){window.RodasAssignments.openDetail(a.id)};document.getElementById("sc-subs-bg").onclick=function(ev){if(ev.target.id==="sc-subs-bg")window.RodasAssignments.openDetail(a.id)};
 const sel=document.getElementById("sc-subs-routine");if(sel)sel.onchange=function(){scOpenAssignmentSubs(a,sel.value)};
 document.querySelectorAll("[data-sc-assignment-sub]").forEach(function(b){b.onclick=function(){const p=b.dataset.scAssignmentSub.split(":"),key=decodeURIComponent(p.slice(2).join(":"));scPickReplacement(function(rep){const root=scSubRoot(a,p[0],p[1],true),orig=(r.days||[]).find(function(d){return d.id===p[1]}).exercises.find(function(e){return (e.key||e._rbid||e.id||e.name)===key});root[key]={replacement:rep,original:{id:orig.id,name:orig.name},createdAt:new Date().toISOString()};scSaveAssignments();scOpenAssignmentSubs(a,rid)},function(){scOpenAssignmentSubs(a,rid)})}});
 document.querySelectorAll("[data-sc-assignment-reset]").forEach(function(b){b.onclick=function(){const p=b.dataset.scAssignmentReset.split(":"),key=decodeURIComponent(p.slice(2).join(":")),root=scSubRoot(a,p[0],p[1],false);if(root)delete root[key];scSaveAssignments();scOpenAssignmentSubs(a,rid)}})
}
function scPickReplacement(done,cancel){
 const items=scLibraryItems(false);document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sc-pick-bg"><div class="sheet sc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Sustitución</div><h2>Elegir ejercicio</h2></div><button class="icon-btn" id="sc-close-pick">'+ic("x")+'</button></div><div class="library-search">'+ic("search")+'<input id="sc-pick-search" placeholder="Buscar ejercicio"></div><div class="sc-pick-list">'+items.map(function(x){return '<button data-sc-pick="'+scEsc(x.name)+'"><span>'+ic("dumbbell")+'</span><strong>'+scEsc(x.name)+'</strong>'+ic("chevron-right")+'</button>'}).join("")+'</div></div></div>';if(window.lucide)lucide.createIcons();
 document.getElementById("sc-close-pick").onclick=cancel;document.getElementById("sc-pick-bg").onclick=function(ev){if(ev.target.id==="sc-pick-bg")cancel()};
 document.getElementById("sc-pick-search").oninput=function(){const q=this.value.toLowerCase();document.querySelectorAll("[data-sc-pick]").forEach(function(b){b.style.display=b.textContent.toLowerCase().includes(q)?"":"none"})};
 document.querySelectorAll("[data-sc-pick]").forEach(function(b){b.onclick=function(){const x=scLibrary[scKey(b.dataset.scPick)];done({id:x.id,name:x.name})}})
}
function scOpenOccurrenceSubs(a,occ,returnFn){
 const day=window.RodasScheduledSessions&&window.RodasScheduledSessions.buildOccurrence(a.id,occ);if(!day)return;
 const root=scOccSubRoot(a,occ,true);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="sc-occ-sub-bg"><div class="sheet sc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Solo esta sesión</div><h2>Sustituir ejercicio</h2></div><button class="icon-btn" id="sc-close-occ-sub">'+ic("x")+'</button></div><div class="sc-sub-help">'+ic("calendar-cog")+' El cambio solo afecta esta ocurrencia y quedará registrado en su snapshot.</div><div class="sc-sub-list"><section>'+(day.exercises||[]).map(function(ex){const key=ex.key||ex._rbid||ex.prescribedExerciseId||ex.id||ex.name,sub=root[key];return '<div class="sc-sub-row"><div><strong>'+scEsc(ex.prescribedExerciseName||ex.name)+'</strong><span>'+(sub?'→ '+scEsc(sub.replacement.name):'Sin sustitución temporal')+'</span></div><button data-sc-occ-sub="'+encodeURIComponent(key)+'">'+(sub?"Cambiar":"Sustituir")+'</button>'+(sub?'<button class="reset" data-sc-occ-reset="'+encodeURIComponent(key)+'">'+ic("rotate-ccw")+'</button>':"")+'</div>'}).join("")+'</section></div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("sc-close-occ-sub").onclick=returnFn;document.getElementById("sc-occ-sub-bg").onclick=function(ev){if(ev.target.id==="sc-occ-sub-bg")returnFn()};
 document.querySelectorAll("[data-sc-occ-sub]").forEach(function(b){b.onclick=function(){const key=decodeURIComponent(b.dataset.scOccSub);scPickReplacement(function(rep){root[key]={replacement:rep,createdAt:new Date().toISOString()};scSaveAssignments();scOpenOccurrenceSubs(a,occ,returnFn)},function(){scOpenOccurrenceSubs(a,occ,returnFn)})}});
 document.querySelectorAll("[data-sc-occ-reset]").forEach(function(b){b.onclick=function(){delete root[decodeURIComponent(b.dataset.scOccReset)];scSaveAssignments();scOpenOccurrenceSubs(a,occ,returnFn)}})
}
function scAugmentAssignment(id){
 const a=scAssignment(id),sheet=document.querySelector(".ac-detail-sheet");if(!a||!sheet||sheet.querySelector(".sc-assignment-special"))return;
 const row=document.createElement("div");row.className="sc-assignment-special";row.innerHTML='<button class="secondary" id="sc-permanent-subs">'+ic("replace")+' Sustituciones</button>'+(a.mode==="sequence"?'<button class="secondary" id="sc-next-sub">'+ic("calendar-cog")+' Sustituir próxima</button>':"");
 const target=sheet.querySelector(".ac-detail-meta");if(target)target.insertAdjacentElement("afterend",row);
 if(window.lucide)lucide.createIcons();document.getElementById("sc-permanent-subs").onclick=function(){scOpenAssignmentSubs(a)};
 const next=document.getElementById("sc-next-sub");if(next)next.onclick=function(){const occ=window.RodasScheduledSessions.getSequenceOccurrence(a.id);scOpenOccurrenceSubs(a,occ,function(){window.RodasAssignments.openDetail(a.id)})}
}
function scAugmentFixedOccurrence(a,s){
 const sheet=document.querySelector(".ss-occ-sheet");if(!sheet||sheet.querySelector("#sc-fixed-sub"))return;const main=sheet.querySelector(".ss-main-actions");if(!main)return;
 const b=document.createElement("button");b.className="secondary";b.id="sc-fixed-sub";b.innerHTML=ic("replace")+" Sustituir ejercicio";main.appendChild(b);if(window.lucide)lucide.createIcons();
 b.onclick=function(){const occ={mode:"fixed",session:s,routineId:s.routineId,dayIndex:s.dayIndex,week:s.week,phase:s.phase||"",name:s.name};scOpenOccurrenceSubs(a,occ,function(){window.RodasScheduledSessions.openFixedSession(a,s)})}
}
function scDecorateArchivedRefs(){
 document.querySelectorAll(".rb-exercise-row").forEach(function(row){const strong=row.querySelector(".routine-exercise-copy strong");if(!strong||row.querySelector(".sc-archived-badge"))return;if(scIsArchived(strong.textContent)){const b=document.createElement("span");b.className="sc-archived-badge";b.textContent="Archivado";strong.insertAdjacentElement("afterend",b)}})
}
function scFilterArchivedPicker(){
 document.querySelectorAll("[data-re-ex-option]").forEach(function(b){const strong=b.querySelector("strong"),name=strong?strong.textContent.trim():"";if(name&&scIsArchived(name))b.style.display="none"})
}
scLoadLibrary();

const scBaseOpenLibrary=openLibrary;
openLibrary=function(){scOpenLibrary("active")};

const scBaseAddPicker=openAddRoutineExerciseSheet;
openAddRoutineExerciseSheet=function(ri){scBaseAddPicker(ri);scFilterArchivedPicker()};

if(window.RodasVersioning){
 const baseGet=window.RodasVersioning.getEffectiveRoutine;
 window.RodasVersioning.getEffectiveRoutine=function(assignmentId,routineId,context){const r=baseGet(assignmentId,routineId,context),a=scAssignment(assignmentId);return scApplyAssignmentSubs(a,r)}
}
if(window.RodasScheduledSessions){
 const baseFixed=window.RodasScheduledSessions.openFixedSession;
 window.RodasScheduledSessions.openFixedSession=function(a,s){baseFixed(a,s);scAugmentFixedOccurrence(a,s)}
}
if(window.RodasAssignments){
 const baseDetail=window.RodasAssignments.openDetail;
 window.RodasAssignments.openDetail=function(id){baseDetail(id);scAugmentAssignment(id)}
}

const scBaseTotalSets=totalSets,scBaseDoneSets=doneSets;
function scRequiredSetCount(doneOnly){
 if(!state.exercises)return null;
 const required=state.exercises.filter(function(e){return !(e.prescription&&e.prescription.optional)}),source=required.length?required:state.exercises;
 return source.reduce(function(n,e){return n+(doneOnly?(e.sets||[]).filter(function(s){return s[4]}).length:(e.sets||[]).length)},0)
}
totalSets=function(){const n=scRequiredSetCount(false);return n==null?scBaseTotalSets():n};
doneSets=function(){const n=scRequiredSetCount(true);return n==null?scBaseDoneSets():n};

const scBaseExerciseCard=exerciseCard;
exerciseCard=function(e,ei){
 let html=scBaseExerciseCard(e,ei),p=e.prescription||{},metric=p.metricType||"reps";
 if(metric==="time")html=html.replace("<div>reps</div>","<div>seg</div>").replace(/aria-label="Repeticiones"/g,'aria-label="Segundos"');
 if(metric==="distance"){const u=p.distanceUnit||"m";html=html.replace("<div>reps</div>","<div>"+u+"</div>").replace(/aria-label="Repeticiones"/g,'aria-label="Distancia"')}
 if(p.loadBasis==="bodyweight")html=html.replace("<div>"+unitLabel()+"</div>","<div>BW</div>");
 if(p.loadBasis==="bodyweight-plus")html=html.replace("<div>"+unitLabel()+"</div>","<div>extra "+unitLabel()+"</div>");
 if(p.loadBasis==="assisted")html=html.replace("<div>"+unitLabel()+"</div>","<div>asist. "+unitLabel()+"</div>");
 if(p.optional)html=html.replace("</h3>"," <span class=\"sc-optional-badge\">Opcional</span></h3>");
 if(e.substitution)html=html.replace('<div class="note">','<div class="sc-substitution-note">'+ic("replace")+' Prescrito: '+scEsc(e.substitution.original&&e.substitution.original.name||e.prescribedExerciseName||"Ejercicio original")+' → realizado: '+scEsc(e.name)+'</div><div class="note">');
 return html
};

const scPrevEvents=events;
events=function(){
 scPrevEvents();
 document.querySelectorAll("[data-rp-publish-routine]").forEach(function(b){b.onclick=function(){const r=routineCatalog[+b.dataset.rpPublishRoutine];if(r)scValidateAndPublish("routine",r.id)}});
 document.querySelectorAll("[data-rp-publish-program]").forEach(function(b){b.onclick=function(){const p=scPrograms()[+b.dataset.rpPublishProgram];if(p)scValidateAndPublish("program",p.id)}});
 scDecorateArchivedRefs()
};

window.RodasSpecialCases={applyOccurrenceSubstitutions:scApplyOccurrenceSubs,validateRoutine:scValidateRoutine,validateProgram:scValidateProgram,openOccurrenceSubstitution:scOpenOccurrenceSubs,isExerciseArchived:scIsArchived};
render();
})();