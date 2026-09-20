(function(){
const rbState={selected:[],selectionMode:false};

function rbEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rbUid(e){
 if(!e._rbid)e._rbid="ex-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);
 return e._rbid
}
function rbDays(r){
 if(!Array.isArray(r.days)||!r.days.length)r.days=[{id:"day-"+Date.now(),name:r.personal?"Día 1":r.name,exercises:Array.isArray(r.exercises)?r.exercises:[]}];
 r.days.forEach(function(d){if(!Array.isArray(d.exercises))d.exercises=[];d.exercises.forEach(rbUid)});
 return r.days
}
function rbCurrentDay(r){
 const days=rbDays(r);
 const found=days.find(function(d){return d.exercises===r.exercises});
 return found||days[0]
}
function rbMarkDirty(r){
 if(!r.personal)return;
 if(r.status==="Publicado")r.dirty=true;else r.status="Borrador"
}
function rbTypeName(type){return type==="superset"?"Superserie":type==="supraset"?"Supraserie":"Individual"}
function rbTypeIcon(type){return type==="superset"?"link-2":type==="supraset"?"workflow":"circle"}
function rbGroupBlocks(blocks){return blocks.filter(function(b){return b.type!=="individual"})}
function rbEnsureBlocks(day){
 const byId={};day.exercises.forEach(function(e){byId[rbUid(e)]=e});
 if(!Array.isArray(day.blocks)||!day.blocks.length){
  const blocks=[],used={};
  day.exercises.forEach(function(e){
   const uid=rbUid(e);
   if(used[uid])return;
   if(e.group){
    const members=day.exercises.filter(function(x){return x.group===e.group});
    members.forEach(function(x){used[rbUid(x)]=1});
    blocks.push({id:"block-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),type:e.groupType==="superset"?"superset":"supraset",exerciseIds:members.map(rbUid),rounds:Math.max.apply(null,members.map(function(x){return (x.sets||[]).length||1})),betweenRest:0,roundRest:90});
   }else{
    used[uid]=1;
    blocks.push({id:"block-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),type:"individual",exerciseIds:[uid],rounds:(e.sets||[]).length||1,betweenRest:0,roundRest:(e.prescription&&e.prescription.rest)||90});
   }
  });
  day.blocks=blocks
 }
 day.blocks=day.blocks.filter(function(b){
  b.exerciseIds=(b.exerciseIds||[]).filter(function(id){return !!byId[id]});
  if(!b.type)b.type=b.exerciseIds.length>1?"superset":"individual";
  if(!b.id)b.id="block-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);
  if(!Number.isFinite(b.rounds))b.rounds=Math.max(1,b.exerciseIds.length?Math.max.apply(null,b.exerciseIds.map(function(id){return (byId[id].sets||[]).length||1})):1);
  if(!Number.isFinite(b.betweenRest))b.betweenRest=0;
  if(!Number.isFinite(b.roundRest))b.roundRest=90;
  return b.exerciseIds.length>0
 });
 const assigned={};day.blocks.forEach(function(b){b.exerciseIds.forEach(function(id){assigned[id]=1})});
 day.exercises.forEach(function(e){const id=rbUid(e);if(!assigned[id])day.blocks.push({id:"block-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),type:"individual",exerciseIds:[id],rounds:(e.sets||[]).length||1,betweenRest:0,roundRest:(e.prescription&&e.prescription.rest)||90})});
 rbSync(day);
 return day.blocks
}
function rbSync(day){
 const byId={};day.exercises.forEach(function(e){byId[rbUid(e)]=e});
 const ordered=[],seen={};
 const grouped=rbGroupBlocks(day.blocks||[]);
 let gIndex=0;
 (day.blocks||[]).forEach(function(b){
  const groupLabel=b.type==="individual"?null:String.fromCharCode(65+(gIndex++%26));
  b.exerciseIds.forEach(function(id){
   const e=byId[id];if(!e||seen[id])return;seen[id]=1;
   if(b.type==="individual"){delete e.group;delete e.groupType;delete e.blockMeta}
   else{
    e.group=groupLabel;
    e.groupType=b.type==="superset"?"superset":"supraset";
    e.blockMeta={type:b.type,rounds:b.rounds,betweenRest:b.betweenRest,roundRest:b.roundRest,blockId:b.id}
   }
   ordered.push(e)
  })
 });
 day.exercises.forEach(function(e){const id=rbUid(e);if(!seen[id])ordered.push(e)});
 day.exercises.splice(0,day.exercises.length);ordered.forEach(function(e){day.exercises.push(e)})
}
function rbFindBlock(day,id){return rbEnsureBlocks(day).find(function(b){return b.id===id})}
function rbExerciseById(day,id){return day.exercises.find(function(e){return rbUid(e)===id})}
function rbExerciseIndex(day,id){return day.exercises.findIndex(function(e){return rbUid(e)===id})}
function rbSelected(id){return rbState.selected.indexOf(id)>=0}
function rbCleanSelection(day){
 const valid={};day.exercises.forEach(function(e){valid[rbUid(e)]=1});
 rbState.selected=rbState.selected.filter(function(id){return valid[id]})
}
function rbBlockHeader(block,bi,total,editable){
 const grouped=block.type!=="individual";
 const detail=grouped?(block.rounds+" vueltas · "+block.betweenRest+" s entre ejercicios · "+block.roundRest+" s al cerrar vuelta"):"Bloque individual";
 return '<div class="rb-block-head"><div class="rb-block-title"><span class="rb-block-icon '+block.type+'">'+ic(rbTypeIcon(block.type))+'</span><div><strong>'+(grouped?rbTypeName(block.type)+" "+String.fromCharCode(65+rbGroupBlocks(rbCurrentBlocks).indexOf(block)):rbTypeName(block.type))+'</strong><small>'+detail+'</small></div></div>'+(editable?'<div class="rb-block-actions"><button data-rb-move-block="'+block.id+':-1" '+(bi===0?'disabled':'')+'>'+ic("chevron-up")+'</button><button data-rb-move-block="'+block.id+':1" '+(bi===total-1?'disabled':'')+'>'+ic("chevron-down")+'</button><button data-rb-block-menu="'+block.id+'">'+ic("ellipsis")+'</button></div>':'')+'</div>'
}
let rbCurrentBlocks=[];
function rbExerciseRow(r,ri,day,block,e,position,total){
 const id=rbUid(e),ei=rbExerciseIndex(day,id);
 const p=e.prescription||{},repMin=p.repsMin!=null?p.repsMin:p.reps,repMax=p.repsMax!=null?p.repsMax:p.reps;
 const reps=(repMin!=null&&repMax!=null)?(String(repMin)===String(repMax)?String(repMin):repMin+"–"+repMax):"";
 const effort=p.effortMode&&p.effortMode!=="none"&&p.effortTarget!=null?" · "+String(p.effortMode).toUpperCase()+" "+p.effortTarget:"";
 const shownWeight=typeof toDisplayWeight==="function"?toDisplayWeight(p.weight||0):(p.weight||0),shownUnit=typeof unitLabel==="function"?unitLabel():"kg";
 const load=p.loadMode==="suggested"&&p.weight?" · ~"+shownWeight+" "+shownUnit:p.loadMode==="fixed"&&p.weight?" · "+shownWeight+" "+shownUnit:"";
 const metricUnit=p.metricType==="time"?"s":p.metricType==="distance"?(p.distanceUnit||"m"):"reps";
 const meta=(e.sets||[]).length+" series"+(reps?" · "+reps+" "+metricUnit:"")+load+effort+(p.optional?" · opcional":"")+(e.note?" · "+e.note:"");
 const check=rbState.selectionMode?'<button class="rb-select '+(rbSelected(id)?"selected":"")+'" data-rb-select="'+id+'" aria-label="Seleccionar">'+(rbSelected(id)?ic("check"):ic("circle"))+'</button>':'<div class="routine-drag">'+ic("grip-vertical")+'</div>';
 return '<article class="rb-exercise-row '+(rbSelected(id)?"selected":"")+'">'+check+'<div class="routine-exercise-copy"><strong>'+rbEsc(e.name)+'</strong><span>'+rbEsc(meta)+'</span></div>'+(r.personal?'<div class="rb-ex-actions"><button data-rb-move-ex="'+block.id+':'+id+':-1" '+(position===0?'disabled':'')+'>'+ic("chevron-up")+'</button><button data-rb-move-ex="'+block.id+':'+id+':1" '+(position===total-1?'disabled':'')+'>'+ic("chevron-down")+'</button></div><button class="routine-edit-btn" data-edit-routine-exercise="'+ri+':'+ei+'">'+ic("ellipsis")+'</button>':'')+'</article>'
}
function rbBlockCard(r,ri,day,block,bi,total){
 const byId={};day.exercises.forEach(function(e){byId[rbUid(e)]=e});
 const members=block.exerciseIds.map(function(id){return byId[id]}).filter(Boolean);
 return '<section class="rb-block '+block.type+'">'+rbBlockHeader(block,bi,total,!!r.personal)+'<div class="rb-block-body">'+members.map(function(e,i){return rbExerciseRow(r,ri,day,block,e,i,members.length)}).join("")+'</div></section>'
}
function rbSelectionBar(ri,day){
 if(!rbState.selectionMode)return '<button class="rb-select-mode" data-rb-selection-mode>'+ic("check-square")+' Seleccionar ejercicios</button>';
 const count=rbState.selected.length;
 return '<div class="rb-selection-bar"><div><strong>'+count+' seleccionado'+(count===1?'':'s')+'</strong><button data-rb-selection-cancel>Cancelar</button></div><div class="rb-selection-actions"><button data-rb-group-as="superset" '+(count<2?'disabled':'')+'>'+ic("link-2")+' Superserie</button><button data-rb-group-as="supraset" '+(count<2?'disabled':'')+'>'+ic("workflow")+' Supraserie</button><button data-rb-group-as="individual" '+(count<1?'disabled':'')+'>'+ic("ungroup")+' Separar</button></div></div>'
}
function rbEditorSection(r,ri,day){
 rbCurrentBlocks=rbEnsureBlocks(day);rbCleanSelection(day);
 return '<div class="section re-exercise-section rb-editor-section"><div class="section-head rb-editor-head"><div><div class="re-section-kicker">Editor por bloques</div><h2>'+rbEsc(day.name)+'</h2></div><span class="caption">'+rbCurrentBlocks.length+' bloque'+(rbCurrentBlocks.length===1?'':'s')+'</span></div>'+
 (r.personal?rbSelectionBar(ri,day):"")+
 '<div class="rb-block-list">'+rbCurrentBlocks.map(function(b,i){return rbBlockCard(r,ri,day,b,i,rbCurrentBlocks.length)}).join("")+'</div>'+
 (r.personal?'<div class="rb-add-row"><button class="routine-add-exercise" data-add-routine-exercise="'+ri+'">'+ic("plus")+' Agregar ejercicio</button><button class="rb-add-block" data-rb-create-block>'+ic("blocks")+' Crear bloque</button></div>':"")+'</div>'
}

const rbPreviousRoutineDetailView=routineDetailView;
routineDetailView=function(index){
 const r=routineCatalog[index],day=rbCurrentDay(r);
 let html=rbPreviousRoutineDetailView(index);
 const start=html.indexOf('<div class="section re-exercise-section">');
 const end=html.lastIndexOf('</section>');
 if(start>=0&&end>start)html=html.slice(0,start)+rbEditorSection(r,index,day)+html.slice(end);
 return html
};

function rbResetSelection(){rbState.selected=[];rbState.selectionMode=false}
function rbToggleSelection(id){
 const i=rbState.selected.indexOf(id);if(i>=0)rbState.selected.splice(i,1);else rbState.selected.push(id)
}
function rbMoveBlock(r,day,id,dir){
 const blocks=rbEnsureBlocks(day),i=blocks.findIndex(function(b){return b.id===id}),n=i+dir;if(i<0||n<0||n>=blocks.length)return;
 const t=blocks[i];blocks[i]=blocks[n];blocks[n]=t;rbSync(day);r.exercises=day.exercises;rbMarkDirty(r)
}
function rbMoveExercise(r,day,blockId,exId,dir){
 const block=rbFindBlock(day,blockId);if(!block)return;
 const i=block.exerciseIds.indexOf(exId),n=i+dir;if(i<0||n<0||n>=block.exerciseIds.length)return;
 const t=block.exerciseIds[i];block.exerciseIds[i]=block.exerciseIds[n];block.exerciseIds[n]=t;rbSync(day);r.exercises=day.exercises;rbMarkDirty(r)
}
function rbRegroup(r,day,type){
 const order={};day.exercises.forEach(function(e,i){order[rbUid(e)]=i});
 const selected=rbState.selected.slice().sort(function(a,b){return (order[a]||0)-(order[b]||0)});if(!selected.length)return;
 let blocks=rbEnsureBlocks(day);
 blocks.forEach(function(b){b.exerciseIds=b.exerciseIds.filter(function(id){return selected.indexOf(id)<0})});
 blocks=blocks.filter(function(b){return b.exerciseIds.length});
 blocks.forEach(function(b){if(b.exerciseIds.length===1)b.type="individual"});
 const firstOrder=day.exercises.reduce(function(best,e,i){return selected.indexOf(rbUid(e))>=0&&i<best?i:best},99999);
 const insertIndex=Math.min(blocks.length,blocks.reduce(function(pos,b,i){
   const first=b.exerciseIds[0],idx=rbExerciseIndex(day,first);return idx<firstOrder?i+1:pos
 },0));
 if(type==="individual"){
  selected.forEach(function(id,offset){blocks.splice(insertIndex+offset,0,{id:"block-"+Date.now()+"-"+offset,type:"individual",exerciseIds:[id],rounds:(rbExerciseById(day,id).sets||[]).length||1,betweenRest:0,roundRest:90})})
 }else{
  blocks.splice(insertIndex,0,{id:"block-"+Date.now(),type:type,exerciseIds:selected,rounds:Math.max.apply(null,selected.map(function(id){return (rbExerciseById(day,id).sets||[]).length||1})),betweenRest:0,roundRest:90})
 }
 day.blocks=blocks;rbSync(day);r.exercises=day.exercises;rbMarkDirty(r);rbResetSelection()
}
function rbBlockSettings(r,day,blockId){
 const b=rbFindBlock(day,blockId);if(!b)return;
 const grouped=b.type!=="individual";
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rb-block-settings-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Bloque</div><h2>'+rbTypeName(b.type)+'</h2></div><button class="icon-btn" id="rb-close-settings">'+ic("x")+'</button></div>'+
 '<label class="rp-field"><span>Tipo</span><select id="rb-block-type"><option value="individual" '+(b.type==="individual"?'selected':'')+'>Individual</option>'+(b.exerciseIds.length>1?'<option value="superset" '+(b.type==="superset"?'selected':'')+'>Superserie</option><option value="supraset" '+(b.type==="supraset"?'selected':'')+'>Supraserie</option>':'')+'</select></label>'+
 (grouped?'<div class="rb-settings-grid"><label class="rp-field"><span>Vueltas</span><input id="rb-rounds" type="number" min="1" max="20" value="'+b.rounds+'"></label><label class="rp-field"><span>Entre ejercicios</span><select id="rb-between"><option value="0">Sin descanso</option><option value="15">15 s</option><option value="30">30 s</option><option value="45">45 s</option><option value="60">60 s</option></select></label></div><label class="rp-field"><span>Descanso al terminar vuelta</span><select id="rb-round-rest"><option value="60">60 s</option><option value="90">90 s</option><option value="120">2 min</option><option value="180">3 min</option></select></label>':'')+
 '<div class="rb-sheet-actions"><button class="secondary" id="rb-split-block">'+ic("ungroup")+' Separar ejercicios</button><button class="primary" id="rb-save-settings">Guardar</button></div></div></div>';
 if(grouped){document.getElementById("rb-between").value=String(b.betweenRest);document.getElementById("rb-round-rest").value=String(b.roundRest)}
 if(window.lucide)lucide.createIcons();
 document.getElementById("rb-close-settings").onclick=clearRest;
 document.getElementById("rb-block-settings-bg").onclick=function(ev){if(ev.target.id==="rb-block-settings-bg")clearRest()};
 document.getElementById("rb-split-block").onclick=function(){rbState.selected=b.exerciseIds.slice();rbRegroup(r,day,"individual");clearRest();render()};
 document.getElementById("rb-save-settings").onclick=function(){
  const type=document.getElementById("rb-block-type").value;
  if(type==="individual"&&b.exerciseIds.length>1){rbState.selected=b.exerciseIds.slice();rbRegroup(r,day,"individual");clearRest();render();return}
  if(type!=="individual"&&b.exerciseIds.length<2){alert("Una superserie o supraserie necesita al menos dos ejercicios.");return}
  b.type=type;
  if(type!=="individual"){
    b.rounds=Math.max(1,+document.getElementById("rb-rounds").value||1);
    b.betweenRest=+document.getElementById("rb-between").value||0;
    b.roundRest=+document.getElementById("rb-round-rest").value||90;
    b.exerciseIds.forEach(function(id){
      const ex=rbExerciseById(day,id);if(!ex)return;
      if(!Array.isArray(ex.sets))ex.sets=[];
      while(ex.sets.length<b.rounds){
        const last=ex.sets[ex.sets.length-1]||["1","—",0,10,false,"","Efectiva"];
        ex.sets.push([String(ex.sets.length+1),"—",last[2],last[3],false,"",last[6]||"Efectiva"])
      }
      if(ex.sets.length>b.rounds)ex.sets=ex.sets.slice(0,b.rounds);
      ex.sets.forEach(function(set,i){if(set[0]!=="W")set[0]=String(i+1)})
    })
  }
  rbSync(day);r.exercises=day.exercises;rbMarkDirty(r);clearRest();render()
 }
}
function rbCreateBlockSheet(r,day){
 const candidates=day.exercises;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="rb-create-bg"><div class="sheet rb-create-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+rbEsc(day.name)+'</div><h2>Crear bloque</h2></div><button class="icon-btn" id="rb-close-create">'+ic("x")+'</button></div><label class="rp-field"><span>Tipo</span><select id="rb-create-type"><option value="superset">Superserie</option><option value="supraset">Supraserie</option></select></label><div class="rb-picker-title">Elige al menos 2 ejercicios</div><div class="rb-picker">'+candidates.map(function(e){const id=rbUid(e);return '<label><input type="checkbox" value="'+id+'"><span>'+rbEsc(e.name)+'</span></label>'}).join("")+'</div><button class="primary rp-sheet-primary" id="rb-create-confirm">Crear bloque</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("rb-close-create").onclick=clearRest;
 document.getElementById("rb-create-bg").onclick=function(ev){if(ev.target.id==="rb-create-bg")clearRest()};
 document.getElementById("rb-create-confirm").onclick=function(){
  const ids=Array.from(document.querySelectorAll(".rb-picker input:checked")).map(function(x){return x.value});
  if(ids.length<2){alert("Selecciona al menos dos ejercicios.");return}
  rbState.selected=ids;rbRegroup(r,day,document.getElementById("rb-create-type").value);clearRest();render()
 }
}

const rbPreviousEvents=events;
events=function(){
 rbPreviousEvents();
 const ri=state.routineDetail,r=ri!==null?routineCatalog[ri]:null,day=r?rbCurrentDay(r):null;
 const selectMode=document.querySelector("[data-rb-selection-mode]");if(selectMode)selectMode.onclick=function(){rbState.selectionMode=true;rbState.selected=[];render()};
 const cancel=document.querySelector("[data-rb-selection-cancel]");if(cancel)cancel.onclick=function(){rbResetSelection();render()};
 document.querySelectorAll("[data-rb-select]").forEach(function(btn){btn.onclick=function(){rbToggleSelection(btn.dataset.rbSelect);render()}});
 document.querySelectorAll("[data-rb-group-as]").forEach(function(btn){btn.onclick=function(){if(!r||!day)return;rbRegroup(r,day,btn.dataset.rbGroupAs);render()}});
 document.querySelectorAll("[data-rb-move-block]").forEach(function(btn){btn.onclick=function(){if(!r||!day)return;const p=btn.dataset.rbMoveBlock.split(":");rbMoveBlock(r,day,p[0],Number(p[1]));render()}});
 document.querySelectorAll("[data-rb-move-ex]").forEach(function(btn){btn.onclick=function(){if(!r||!day)return;const p=btn.dataset.rbMoveEx.split(":");rbMoveExercise(r,day,p[0],p[1],Number(p[2]));render()}});
 document.querySelectorAll("[data-rb-block-menu]").forEach(function(btn){btn.onclick=function(){if(r&&day)rbBlockSettings(r,day,btn.dataset.rbBlockMenu)}});
 const create=document.querySelector("[data-rb-create-block]");if(create)create.onclick=function(){if(r&&day)rbCreateBlockSheet(r,day)};
 document.querySelectorAll("[data-check]").forEach(function(btn){btn.onclick=function(){
  const ei=+btn.dataset.ei,si=+btn.dataset.si,set=state.exercises[ei].sets[si];
  set[4]=!set[4];haptic(set[4]?22:10);
  if(set[4]){
    const exercise=state.exercises[ei];
    if(exercise.group){
      const target=nextGroupTarget(ei);state.activeExercise=target===null?ei:target;
      const members=groupMembers(exercise.group),atEnd=members[members.length-1]===ei,meta=exercise.blockMeta||{};
      if(atEnd){if((meta.roundRest||preferences.restSeconds)>0)rest(meta.roundRest||preferences.restSeconds)}
      else if((meta.betweenRest||0)>0)rest(meta.betweenRest)
    }else{
      const exerciseDone=exercise.sets.every(function(x){return x[4]});
      if(exerciseDone&&ei<state.exercises.length-1)state.activeExercise=ei+1;
      rest(preferences.restSeconds)
    }
  }
  saveWorkout();render()
 }});
};

const oldGroupBanner=groupBanner;
groupBanner=function(e,ei){
 if(!e.group)return "";
 const members=groupMembers(e.group);if(members[0]!==ei)return "";
 const meta=e.blockMeta||{},type=e.groupType==="superset"?"Superserie":"Supraserie";
 const details=[];
 if(meta.rounds)details.push(meta.rounds+" vueltas");
 details.push((meta.betweenRest||0)?"descanso "+meta.betweenRest+" s entre ejercicios":"sin descanso entre ejercicios");
 if(meta.roundRest)details.push(meta.roundRest+" s al cerrar vuelta");
 return '<div class="group-banner rb-workout-group"><span class="group-badge">'+e.group+'</span><div><strong>'+type+'</strong><span>'+details.join(" · ")+'</span></div>'+ic(e.groupType==="superset"?"link-2":"workflow")+'</div>'
};

routineCatalog.forEach(function(r){rbDays(r).forEach(rbEnsureBlocks)});
render();
})();