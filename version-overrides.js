(function(){
const VO_KEY="rodas.templateVersions.v1";
let versionStore={};

function voEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function voClone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function voLoad(){try{const raw=localStorage.getItem(VO_KEY);if(raw)versionStore=JSON.parse(raw)||{}}catch(e){}}
function voSave(){try{localStorage.setItem(VO_KEY,JSON.stringify(versionStore))}catch(e){}}
function voToday(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function voAssignments(){return window.RodasAssignments?window.RodasAssignments.getAssignments():[]}
function voAssignment(id){return window.RodasAssignments?window.RodasAssignments.getById(id):null}
function voPrograms(){return window.RodasPrograms?window.RodasPrograms.getPrograms():[]}
function voRoutine(id){return routineCatalog.find(function(r){return r.id===id})||null}
function voProgram(id){return voPrograms().find(function(p){return p.id===id})||null}
function voSource(type,id){return type==="program"?voProgram(id):voRoutine(id)}
function voSnapshot(type,obj){return window.RodasAssignments?window.RodasAssignments.snapshotSource(type,obj):null}
function voKey(type,id){return type+":"+id}
function voRecordSnapshot(type,obj){
 if(!obj)return;const k=voKey(type,obj.id),v=Number(obj.version||0);if(!versionStore[k])versionStore[k]={};
 versionStore[k][String(v)]={version:v,date:voToday(),snapshot:voSnapshot(type,obj)};voSave()
}
function voEnsureInitialVersions(){
 routineCatalog.forEach(function(r){voRecordSnapshot("routine",r)});
 voPrograms().forEach(function(p){voRecordSnapshot("program",p)})
}
function voRoutineSnapshots(a){
 if(!a||!a.baseSnapshot)return [];
 if(a.baseSnapshot.type==="routine")return [a.baseSnapshot];
 const map=a.baseSnapshot.routines||{};return Object.keys(map).map(function(k){return map[k]})
}
function voFindRoutineSnapshot(a,rid){
 if(!a||!a.baseSnapshot)return null;
 if(a.baseSnapshot.type==="routine")return a.baseSnapshot.id===rid?a.baseSnapshot:null;
 return (a.baseSnapshot.routines||{})[rid]||null
}
function voRoutineChoices(a){
 return voRoutineSnapshots(a).map(function(r){return {id:r.id,name:r.name}})
}
function voEnsureOverrides(a){if(!a.overrides)a.overrides={};return a.overrides}
function voNode(a,rid,did,ek,create){
 const root=voEnsureOverrides(a);if(!root[rid]&&create)root[rid]={};if(!root[rid])return null;
 if(!root[rid][did]&&create)root[rid][did]={};if(!root[rid][did])return null;
 if(!root[rid][did][ek]&&create)root[rid][did][ek]={};return root[rid][did][ek]||null
}
function voGetOverride(a,rid,did,ek,field){const n=voNode(a,rid,did,ek,false);return n&&Object.prototype.hasOwnProperty.call(n,field)?n[field]:undefined}
function voSetOverride(a,rid,did,ek,field,value,base){
 const root=voEnsureOverrides(a),n=voNode(a,rid,did,ek,true);
 if(voSame(value,base)){delete n[field]}else n[field]=value;
 if(!Object.keys(n).length)delete root[rid][did][ek];
 if(root[rid][did]&&!Object.keys(root[rid][did]).length)delete root[rid][did];
 if(root[rid]&&!Object.keys(root[rid]).length)delete root[rid]
}
function voSame(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function voExerciseKey(e){return e.key||e._rbid||e.id||e.name}
function voFields(ex){
 const p=ex.prescription||{},sets=ex.sets||[],first=sets[0]||[],m=first[7]||{};
 return {
  series:sets.length,
  repsMin:p.repsMin!=null?p.repsMin:(m.repsMin!=null?m.repsMin:Number(first[3]||0)),
  repsMax:p.repsMax!=null?p.repsMax:(m.repsMax!=null?m.repsMax:Number(first[3]||0)),
  loadMode:p.loadMode||((p.weight||first[2])?"fixed":"none"),
  weight:Number(p.weight!=null?p.weight:(m.weight!=null?m.weight:first[2]||0)),
  effortMode:p.effortMode||"rir",
  effortTarget:Number(p.effortTarget!=null?p.effortTarget:(p.rir!=null?p.rir:2)),
  rest:Number(p.rest||90),
  note:ex.note||""
 }
}
const VO_LABELS={series:"Series",repsMin:"Reps mín.",repsMax:"Reps máx.",loadMode:"Modo de carga",weight:"Carga",effortMode:"Esfuerzo",effortTarget:"Objetivo",rest:"Descanso",note:"Nota",exists:"Estructura"};
function voDisplay(field,val){
 if(field==="loadMode")return val==="suggested"?"Orientativa":val==="fixed"?"Prescrita":"Sin carga";
 if(field==="effortMode")return val==="rir"?"RIR":val==="rpe"?"RPE":"Sin objetivo";
 if(field==="weight")return Number(val||0)+" kg";
 if(field==="rest")return Number(val||0)+" s";
 return String(val==null?"—":val)
}
function voCountOverrides(a){
 let n=0,root=a.overrides||{};Object.keys(root).forEach(function(r){Object.keys(root[r]||{}).forEach(function(d){Object.keys(root[r][d]||{}).forEach(function(e){n+=Object.keys(root[r][d][e]||{}).length})})});return n
}
function voOverridePaths(a){
 const paths={},root=a.overrides||{};
 Object.keys(root).forEach(function(r){Object.keys(root[r]||{}).forEach(function(d){Object.keys(root[r][d]||{}).forEach(function(e){Object.keys(root[r][d][e]||{}).forEach(function(f){paths[r+"/"+d+"/"+e+"/"+f]=root[r][d][e][f]})})})});
 return paths
}
function voFlattenRoutine(snap){
 const out={};if(!snap)return out;
 (snap.days||[]).forEach(function(d){
  out[snap.id+"/"+d.id+"/@day/exists"]=true;
  out[snap.id+"/"+d.id+"/@day/name"]=d.name;
  (d.exercises||[]).forEach(function(e){
   const k=voExerciseKey(e),base=snap.id+"/"+d.id+"/"+k+"/";
   out[base+"exists"]=true;const fs=voFields(e);Object.keys(fs).forEach(function(f){out[base+f]=fs[f]})
  })
 });
 return out
}
function voFlatten(snap){
 if(!snap)return {};
 if(snap.type==="routine")return voFlattenRoutine(snap);
 let out={};(snap.phases||[]).forEach(function(ph,i){out["@phase/"+i+"/name"]=ph.name;out["@phase/"+i+"/from"]=ph.from;out["@phase/"+i+"/to"]=ph.to;out["@phase/"+i+"/routineId"]=ph.routineId});
 Object.keys(snap.routines||{}).forEach(function(rid){Object.assign(out,voFlattenRoutine(snap.routines[rid]))});return out
}
function voDiff(oldSnap,newSnap){
 const a=voFlatten(oldSnap),b=voFlatten(newSnap),keys={};Object.keys(a).forEach(function(k){keys[k]=1});Object.keys(b).forEach(function(k){keys[k]=1});
 return Object.keys(keys).filter(function(k){return !voSame(a[k],b[k])}).map(function(k){return {path:k,oldValue:a[k],newValue:b[k]}})
}
function voConflictChanges(a,newSnap){
 const changes=voDiff(a.baseSnapshot,newSnap),over=voOverridePaths(a);
 return changes.filter(function(ch){
  if(over[ch.path]!==undefined)return true;
  if(ch.path.endsWith("/exists")){
    const prefix=ch.path.slice(0,-"exists".length);
    return Object.keys(over).some(function(p){return p.indexOf(prefix)===0})
  }
  return false
 }).map(function(ch){return {path:ch.path,oldValue:ch.oldValue,newValue:ch.newValue,override:over[ch.path]}})
}
function voPathParts(path){const p=path.split("/");return {rid:p[0],did:p[1],ek:p[2],field:p[3]}}
function voFindExercise(snap,rid,did,ek){
 const r=snap&&snap.type==="routine"?snap:(snap&&snap.routines?snap.routines[rid]:null);if(!r)return null;
 const d=(r.days||[]).find(function(x){return x.id===did});if(!d)return null;
 return (d.exercises||[]).find(function(e){return voExerciseKey(e)===ek})||null
}
function voFieldInput(a,rid,did,ex,field,base){
 const key=voExerciseKey(ex),ov=voGetOverride(a,rid,did,key,field),value=ov!==undefined?ov:base,custom=ov!==undefined;
 let input="";
 if(field==="loadMode")input='<select data-vo-field="'+field+'"><option value="none" '+(value==="none"?"selected":"")+'>Sin carga</option><option value="fixed" '+(value==="fixed"?"selected":"")+'>Prescrita</option><option value="suggested" '+(value==="suggested"?"selected":"")+'>Orientativa</option></select>';
 else if(field==="effortMode")input='<select data-vo-field="'+field+'"><option value="none" '+(value==="none"?"selected":"")+'>Sin objetivo</option><option value="rir" '+(value==="rir"?"selected":"")+'>RIR</option><option value="rpe" '+(value==="rpe"?"selected":"")+'>RPE</option></select>';
 else if(field==="note")input='<input data-vo-field="'+field+'" value="'+voEsc(value)+'" placeholder="Nota">';
 else input='<input data-vo-field="'+field+'" inputmode="decimal" value="'+voEsc(value)+'">';
 return '<label class="vo-field '+(custom?"custom":"")+'" data-vo-wrap="'+field+'"><span>'+VO_LABELS[field]+(custom?' <b>Personalizado</b>':'')+'</span>'+input+'<button type="button" data-vo-reset="'+field+'" '+(custom?"":"disabled")+'>'+ic("rotate-ccw")+'</button></label>'
}
function voCustomize(id,rid){
 const a=voAssignment(id);if(!a)return;window.RodasAssignments.ensureSnapshot(a);
 const choices=voRoutineChoices(a);rid=rid||a._editRoutineId||(choices[0]&&choices[0].id);a._editRoutineId=rid;
 const rs=voFindRoutineSnapshot(a,rid);if(!rs)return;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="vo-custom-bg"><div class="sheet vo-custom-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+voEsc(a.traineeName)+'</div><h2>Personalizar prescripción</h2></div><button class="icon-btn" id="vo-close-custom">'+ic("x")+'</button></div>'+
 (choices.length>1?'<label class="rp-field"><span>Rutina del programa</span><select id="vo-routine-select">'+choices.map(function(x){return '<option value="'+x.id+'" '+(x.id===rid?"selected":"")+'>'+voEsc(x.name)+'</option>'}).join("")+'</select></label>':"")+
 '<div class="vo-custom-help">'+ic("layers-3")+' Solo se guardan los campos que difieren de la versión heredada. Los demás seguirán recibiendo actualizaciones compatibles.</div>'+
 '<div class="vo-custom-days">'+(rs.days||[]).map(function(d){return '<section><div class="vo-day-head"><strong>'+voEsc(d.name)+'</strong><span>'+d.exercises.length+' ejercicios</span></div>'+d.exercises.map(function(ex){
  const fs=voFields(ex),ek=voExerciseKey(ex);
  return '<article class="vo-ex-card" data-vo-ex="'+voEsc(ek)+'" data-vo-rid="'+rid+'" data-vo-did="'+d.id+'"><div class="vo-ex-head"><strong>'+voEsc(ex.name)+'</strong><span>'+Object.keys((a.overrides&&a.overrides[rid]&&a.overrides[rid][d.id]&&a.overrides[rid][d.id][ek])||{}).length+' personalizados</span></div><div class="vo-fields">'+["series","repsMin","repsMax","loadMode","weight","effortMode","effortTarget","rest","note"].map(function(f){return voFieldInput(a,rid,d.id,ex,f,fs[f])}).join("")+'</div></article>'
 }).join("")+'</section>'}).join("")+'</div>'+
 '<button class="primary vo-save" id="vo-save-custom">Guardar personalización</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("vo-close-custom").onclick=function(){voOpenDetail(a.id)};
 document.getElementById("vo-custom-bg").onclick=function(ev){if(ev.target.id==="vo-custom-bg")voOpenDetail(a.id)};
 const sel=document.getElementById("vo-routine-select");if(sel)sel.onchange=function(){voCaptureCustom(a,rs);voCustomize(a.id,sel.value)};
 document.querySelectorAll("[data-vo-reset]").forEach(function(btn){btn.onclick=function(){
  const card=btn.closest(".vo-ex-card"),ex=voFindExercise(a.baseSnapshot,card.dataset.voRid,card.dataset.voDid,card.dataset.voEx),fs=voFields(ex),f=btn.dataset.voReset;
  voSetOverride(a,card.dataset.voRid,card.dataset.voDid,card.dataset.voEx,f,fs[f],fs[f]);window.RodasAssignments.save();voCustomize(a.id,rid)
 }});
 document.getElementById("vo-save-custom").onclick=function(){voCaptureCustom(a,rs);window.RodasAssignments.save();voOpenDetail(a.id)}
}
function voCaptureCustom(a,rs){
 document.querySelectorAll(".vo-ex-card").forEach(function(card){
  const rid=card.dataset.voRid,did=card.dataset.voDid,ek=card.dataset.voEx,ex=voFindExercise(a.baseSnapshot,rid,did,ek);if(!ex)return;const fs=voFields(ex);
  card.querySelectorAll("[data-vo-field]").forEach(function(input){const f=input.dataset.voField;let v=input.value;if(["series","repsMin","repsMax","weight","effortTarget","rest"].indexOf(f)>=0){const n=Number(String(v).replace(",","."));v=Number.isFinite(n)?n:fs[f]}voSetOverride(a,rid,did,ek,f,v,fs[f])})
 })
}
function voAugmentDetail(id){
 const a=voAssignment(id);if(!a)return;window.RodasAssignments.ensureSnapshot(a);
 const sheet=document.querySelector(".ac-detail-sheet");if(!sheet)return;
 const meta=sheet.querySelector(".ac-detail-meta");if(meta&&!sheet.querySelector(".vo-personalize-row")){
  const row=document.createElement("div");row.className="vo-personalize-row";
  row.innerHTML='<button class="secondary" id="vo-customize">'+ic("sliders-horizontal")+' Personalizar prescripción</button><div><strong>'+voCountOverrides(a)+'</strong><span>campos personalizados</span></div>';
  meta.insertAdjacentElement("afterend",row)
 }
 if(a.pendingUpdate&&!sheet.querySelector(".vo-update-banner")){
  const b=document.createElement("div");b.className="vo-update-banner";
  b.innerHTML=ic("git-compare-arrows")+'<div><strong>Actualización v'+a.pendingUpdate.version+' pendiente</strong><span>'+(a.pendingUpdate.conflicts||[]).length+' conflicto'+((a.pendingUpdate.conflicts||[]).length===1?"":"s")+' por revisar</span></div><button id="vo-review-update">Revisar</button>';
  const target=sheet.querySelector(".vo-personalize-row")||meta;target.insertAdjacentElement("afterend",b)
 }
 if(window.lucide)lucide.createIcons();
 const c=document.getElementById("vo-customize");if(c)c.onclick=function(){voCustomize(a.id)};
 const r=document.getElementById("vo-review-update");if(r)r.onclick=function(){voReviewPending(a.id)}
}
function voOpenDetail(id){window.RodasAssignments.openDetail(id);voAugmentDetail(id)}
function voPublish(type,id){
 const obj=voSource(type,id);if(!obj)return;const current=Number(obj.version||0),next=current+1;
 const originalVersion=obj.version;obj.version=next;
 if(type==="program")(obj.phases||[]).forEach(function(ph){const r=voRoutine(ph.routineId);if(r)ph.routineVersion=Number(r.version||0)});
 const snap=voSnapshot(type,obj);obj.version=originalVersion;
 const active=voAssignments().filter(function(a){return a.sourceType===type&&a.sourceId===id&&a.status!=="completed"});
 const impact=active.map(function(a){window.RodasAssignments.ensureSnapshot(a);const conflicts=voConflictChanges(a,snap);return {a:a,conflicts:conflicts}});
 const compatible=impact.filter(function(x){return !x.conflicts.length}),conflicted=impact.filter(function(x){return x.conflicts.length});
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="vo-publish-bg"><div class="sheet vo-publish-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Publicar versión '+next+'</div><h2>'+voEsc(obj.name)+'</h2></div><button class="icon-btn" id="vo-close-publish">'+ic("x")+'</button></div>'+
 '<div class="vo-impact-grid"><div><strong>'+active.length+'</strong><span>asignaciones activas</span></div><div class="ok"><strong>'+compatible.length+'</strong><span>compatibles</span></div><div class="'+(conflicted.length?"warn":"")+'"><strong>'+conflicted.length+'</strong><span>con conflictos</span></div></div>'+
 (conflicted.length?'<div class="vo-conflict-preview">'+conflicted.map(function(x){return '<div><strong>'+voEsc(x.a.traineeName)+'</strong><span>'+x.conflicts.length+' campo'+(x.conflicts.length===1?"":"s")+' personalizado'+(x.conflicts.length===1?"":"s")+' también cambió en la plantilla.</span></div>'}).join("")+'</div>':'<div class="vo-all-clear">'+ic("check-circle-2")+' Todas las asignaciones pueden actualizarse sin conflicto.</div>')+
 '<label class="vo-publish-check"><input id="vo-update-compatible" type="checkbox" checked><span>Actualizar automáticamente las asignaciones compatibles</span></label>'+
 '<div class="vo-publish-actions"><button class="secondary" id="vo-publish-only">Solo publicar plantilla</button><button class="primary" id="vo-publish-apply">Publicar v'+next+'</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("vo-close-publish").onclick=clearRest;document.getElementById("vo-publish-bg").onclick=function(ev){if(ev.target.id==="vo-publish-bg")clearRest()};
 function commit(updateCompat){
  obj.version=next;if(type==="routine"){obj.status="Publicado";obj.dirty=false}else obj.status="Publicado";
  const finalSnap=voSnapshot(type,obj);versionStore[voKey(type,id)]=versionStore[voKey(type,id)]||{};versionStore[voKey(type,id)][String(next)]={version:next,date:voToday(),snapshot:voClone(finalSnap)};voSave();
  impact.forEach(function(x){
   const a=x.a;a.versionHistory=a.versionHistory||[];
   if(updateCompat&&!x.conflicts.length){
    a.versionHistory.push({from:a.sourceVersion,to:next,date:voToday(),status:"compatible"});
    a.sourceVersion=next;a.baseSnapshot=voClone(finalSnap);delete a.pendingUpdate
   }else{
    a.pendingUpdate={version:next,snapshot:voClone(finalSnap),conflicts:voClone(x.conflicts),createdAt:voToday()}
   }
  });
  if(window.RodasPrograms)window.RodasPrograms.save();window.RodasAssignments.save();clearRest();render()
 }
 document.getElementById("vo-publish-only").onclick=function(){commit(false)};
 document.getElementById("vo-publish-apply").onclick=function(){commit(document.getElementById("vo-update-compatible").checked)}
}
function voConflictCard(a,c,i){
 const p=voPathParts(c.path),ex=voFindExercise(a.baseSnapshot,p.rid,p.did,p.ek);
 const name=ex?ex.name:(p.ek==="@day"?"Día de entrenamiento":p.ek);
 const structural=p.field==="exists";
 const detail=structural?"La nueva plantilla elimina o reestructura un elemento que contiene personalizaciones.":"Plantilla: "+voDisplay(p.field,c.newValue)+" · Personalizado: "+voDisplay(p.field,c.override);
 const keepLabel=structural?"Conservar en esta asignación":"Mantener personalizado";
 return '<article class="vo-conflict-card"><div><strong>'+voEsc(name)+' · '+voEsc(VO_LABELS[p.field]||p.field)+'</strong><span>'+voEsc(detail)+'</span></div><select data-vo-decision="'+i+'"><option value="keep">'+voEsc(keepLabel)+'</option><option value="template">Usar nueva plantilla</option></select></article>'
}
function voReviewPending(id){
 const a=voAssignment(id);if(!a||!a.pendingUpdate)return;const pu=a.pendingUpdate,conf=pu.conflicts||[];
 if(!conf.length){
  document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="vo-review-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Actualización disponible</div><h2>Versión '+pu.version+'</h2></div><button class="icon-btn" id="vo-close-review">'+ic("x")+'</button></div><div class="vo-all-clear">'+ic("check-circle-2")+' No hay conflictos con tus personalizaciones.</div><button class="primary vo-save" id="vo-accept-clean">Actualizar asignación</button></div></div>';
  if(window.lucide)lucide.createIcons();document.getElementById("vo-close-review").onclick=function(){voOpenDetail(id)};document.getElementById("vo-accept-clean").onclick=function(){voApplyPending(a,{});voOpenDetail(id)};return
 }
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="vo-review-bg"><div class="sheet vo-review-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Actualizar a v'+pu.version+'</div><h2>Resolver conflictos</h2></div><button class="icon-btn" id="vo-close-review">'+ic("x")+'</button></div><div class="vo-review-help">Elige qué valor debe quedar en cada campo. Por defecto conservamos la personalización individual.</div><div class="vo-conflict-list">'+conf.map(function(c,i){return voConflictCard(a,c,i)}).join("")+'</div><button class="primary vo-save" id="vo-apply-review">Aplicar actualización</button></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("vo-close-review").onclick=function(){voOpenDetail(id)};
 document.getElementById("vo-apply-review").onclick=function(){const decisions={};document.querySelectorAll("[data-vo-decision]").forEach(function(s){decisions[+s.dataset.voDecision]=s.value});voApplyPending(a,decisions);voOpenDetail(id)}
}
function voApplyPending(a,decisions){
 const pu=a.pendingUpdate;if(!pu)return;
 (pu.conflicts||[]).forEach(function(c,i){if(decisions[i]==="template"){const p=voPathParts(c.path),oldEx=voFindExercise(a.baseSnapshot,p.rid,p.did,p.ek),oldFs=oldEx?voFields(oldEx):{};voSetOverride(a,p.rid,p.did,p.ek,p.field,oldFs[p.field],oldFs[p.field])}});
 a.versionHistory=a.versionHistory||[];a.versionHistory.push({from:a.sourceVersion,to:pu.version,date:voToday(),status:"reviewed"});
 a.sourceVersion=pu.version;a.baseSnapshot=voClone(pu.snapshot);delete a.pendingUpdate;window.RodasAssignments.save()
}
function voVersionBadgeInCards(){
 document.querySelectorAll("[data-ac-open]").forEach(function(btn){const a=voAssignment(btn.dataset.acOpen);if(!a)return;const top=btn.querySelector(".ac-assignment-top>div");if(top&&!top.querySelector(".vo-card-meta")){const s=document.createElement("span");s.className="vo-card-meta";s.textContent="v"+a.sourceVersion+" · "+voCountOverrides(a)+" personalizados"+(a.pendingUpdate?" · actualización pendiente":"");top.appendChild(s)}})
}
voLoad();voEnsureInitialVersions();

const voPrevEvents=events;
events=function(){
 voPrevEvents();
 document.querySelectorAll("[data-ac-open]").forEach(function(b){b.onclick=function(){voOpenDetail(b.dataset.acOpen)}});
 document.querySelectorAll("[data-rp-publish-routine]").forEach(function(b){b.onclick=function(){voPublish("routine",routineCatalog[+b.dataset.rpPublishRoutine].id)}});
 document.querySelectorAll("[data-rp-publish-program]").forEach(function(b){b.onclick=function(){const p=voPrograms()[+b.dataset.rpPublishProgram];if(p)voPublish("program",p.id)}});
 voVersionBadgeInCards()
};

render();
})();