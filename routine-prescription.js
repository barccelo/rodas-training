(function(){
function pxEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pxNum(v,fallback){const n=Number(String(v==null?"":v).replace(",","."));return Number.isFinite(n)?n:fallback}
function pxDays(r){
 if(!Array.isArray(r.days)||!r.days.length)r.days=[{id:"day-"+Date.now(),name:r.personal?"Día 1":r.name,exercises:Array.isArray(r.exercises)?r.exercises:[]}];
 return r.days
}
function pxDay(r){
 const days=pxDays(r),found=days.find(function(d){return d.exercises===r.exercises});
 return found||days[0]
}
function pxMarkDirty(r){if(!r.personal)return;if(r.status==="Publicado")r.dirty=true;else r.status="Borrador"}
function pxSetMeta(s){
 if(!s[7]||typeof s[7]!=="object")s[7]={};
 const m=s[7];
 const reps=Number(s[3]||0);
 if(m.repsMin==null)m.repsMin=reps||8;
 if(m.repsMax==null)m.repsMax=reps||10;
 if(!m.loadMode)m.loadMode=Number(s[2]||0)>0?"fixed":"none";
 if(m.weight==null)m.weight=Number(s[2]||0);
 if(!m.effortMode)m.effortMode="inherit";
 if(m.effortTarget==null)m.effortTarget=null;
 if(!m.technique)m.technique={type:"none"};
 if(m.note==null)m.note="";
 return m
}
function pxNormalizeExercise(e){
 if(!e.prescription)e.prescription={};
 const p=e.prescription;
 const sets=Array.isArray(e.sets)?e.sets:[];
 sets.forEach(pxSetMeta);
 const first=sets[0],fm=first?pxSetMeta(first):null;
 if(p.repsMin==null)p.repsMin=fm?fm.repsMin:8;
 if(p.repsMax==null)p.repsMax=fm?fm.repsMax:10;
 if(!p.loadMode)p.loadMode=Number(p.weight||0)>0?"fixed":"none";
 if(p.weight==null)p.weight=fm?fm.weight:0;
 if(!p.effortMode)p.effortMode=p.rir!=null?"rir":"rir";
 if(p.effortTarget==null)p.effortTarget=p.rir!=null?Number(p.rir):2;
 if(p.rest==null)p.rest=90;
 if(!p.metricType)p.metricType="reps";
 if(!p.distanceUnit)p.distanceUnit="m";
 if(!p.loadBasis)p.loadBasis=p.loadMode==="none"?"none":"external";
 if(typeof p.optional!=="boolean")p.optional=false;
 if(!p.unilateralMode)p.unilateralMode="same";
 if(!p.progression)p.progression={strategy:"none",increment:2.5,custom:""};
 if(!p.progression.strategy)p.progression.strategy="none";
 if(p.progression.increment==null)p.progression.increment=2.5;
 if(p.progression.custom==null)p.progression.custom="";
}
function pxRole(s,si){return s[6]||(s[0]==="W"?"Calentamiento":s[0]==="B"?"Back-off":"Efectiva")}
function pxTechniqueLabel(t){
 return t==="drop"?"Drop set":t==="restpause"?"Rest-pause":t==="partials"?"Parciales":"Sin técnica"
}
function pxEffortLabel(mode,target){
 if(mode==="none")return "Sin esfuerzo";
 if(mode==="inherit")return "Heredado";
 return mode.toUpperCase()+" "+target
}
function pxRepsLabel(m){return Number(m.repsMin)===Number(m.repsMax)?String(m.repsMin):m.repsMin+"–"+m.repsMax}
function pxMetricLabels(p){
 if(p.metricType==="time")return {min:"Seg. mín.",max:"Seg. máx.",unit:"s",name:"seg"};
 if(p.metricType==="distance")return {min:(p.distanceUnit||"m")+" mín.",max:(p.distanceUnit||"m")+" máx.",unit:p.distanceUnit||"m",name:p.distanceUnit||"m"};
 return {min:"Reps mín.",max:"Reps máx.",unit:"reps",name:"reps"}
}
function pxLoadLabel(m){
 if(m.loadMode==="none")return "Sin carga";
 const w=Number(m.weight||0),shown=typeof toDisplayWeight==="function"?toDisplayWeight(w):w,u=typeof unitLabel==="function"?unitLabel():"kg";
 return (m.loadMode==="suggested"?"~ ":"")+shown+" "+u
}
function pxSetCard(s,si,e){
 const m=pxSetMeta(s),role=pxRole(s,si),tech=m.technique||{type:"none"},metric=pxMetricLabels(e.prescription||{}),shownWeight=typeof toDisplayWeight==="function"?toDisplayWeight(m.weight||0):(m.weight||0),shownUnit=typeof unitLabel==="function"?unitLabel():"kg";
 const effortMode=m.effortMode==="inherit"?e.prescription.effortMode:m.effortMode;
 const effortTarget=m.effortMode==="inherit"?e.prescription.effortTarget:m.effortTarget;
 return '<article class="px-set-card" data-px-set-card="'+si+'">'+
 '<div class="px-set-head"><div><span>Serie '+(si+1)+'</span><select data-px-role="'+si+'"><option '+(role==="Calentamiento"?'selected':'')+'>Calentamiento</option><option '+(role==="Efectiva"?'selected':'')+'>Efectiva</option><option '+(role==="Back-off"?'selected':'')+'>Back-off</option></select></div><button class="px-delete-set" data-px-delete-set="'+si+'" aria-label="Eliminar serie">'+ic("trash-2")+'</button></div>'+
 '<div class="px-set-grid four"><label><span>'+metric.min+'</span><input data-px-reps-min="'+si+'" type="number" min="0" value="'+m.repsMin+'"></label><label><span>'+metric.max+'</span><input data-px-reps-max="'+si+'" type="number" min="0" value="'+m.repsMax+'"></label><label><span>Carga ('+shownUnit+')</span><input data-px-weight="'+si+'" inputmode="decimal" value="'+(shownWeight||"")+'" placeholder="'+shownUnit+'"></label><label><span>Modo</span><select data-px-load-mode="'+si+'"><option value="none" '+(m.loadMode==="none"?'selected':'')+'>—</option><option value="fixed" '+(m.loadMode==="fixed"?'selected':'')+'>Fija</option><option value="suggested" '+(m.loadMode==="suggested"?'selected':'')+'>Orient.</option></select></label></div>'+
 '<div class="px-set-grid two"><label><span>Esfuerzo</span><select data-px-effort-mode="'+si+'"><option value="inherit" '+(m.effortMode==="inherit"?'selected':'')+'>Heredar</option><option value="rir" '+(m.effortMode==="rir"?'selected':'')+'>RIR</option><option value="rpe" '+(m.effortMode==="rpe"?'selected':'')+'>RPE</option><option value="none" '+(m.effortMode==="none"?'selected':'')+'>Sin objetivo</option></select></label><label><span>Objetivo</span><input data-px-effort-target="'+si+'" type="number" min="0" max="10" step=".5" value="'+(m.effortTarget==null?effortTarget:m.effortTarget)+'"></label></div>'+
 '<div class="px-technique-row"><label><span>Técnica</span><select data-px-technique="'+si+'"><option value="none" '+(tech.type==="none"?'selected':'')+'>Sin técnica</option><option value="drop" '+(tech.type==="drop"?'selected':'')+'>Drop set</option><option value="restpause" '+(tech.type==="restpause"?'selected':'')+'>Rest-pause</option><option value="partials" '+(tech.type==="partials"?'selected':'')+'>Parciales</option></select></label><button data-px-tech-settings="'+si+'" '+(tech.type==="none"?'disabled':'')+'>'+ic("sliders-horizontal")+' Configurar</button></div>'+
 '<label class="px-note-field"><span>Nota de la serie</span><input data-px-set-note="'+si+'" value="'+pxEsc(m.note||"")+'" placeholder="Opcional"></label>'+
 '<div class="px-set-summary">'+pxRepsLabel(m)+' '+metric.name+' · '+pxLoadLabel(m)+' · '+pxEffortLabel(effortMode,effortTarget)+(tech.type!=="none"?' · '+pxTechniqueLabel(tech.type):"")+'</div>'+
 '</article>'
}
function pxProgressFields(p){
 const pr=p.progression;
 return '<div class="px-progression">'+
 '<div class="px-subhead"><strong>Progresión</strong><span>La app sugiere; nunca aplica cambios sola.</span></div>'+
 '<label class="rp-field"><span>Estrategia</span><select id="px-progression-strategy"><option value="none" '+(pr.strategy==="none"?'selected':'')+'>Sin automatización</option><option value="double" '+(pr.strategy==="double"?'selected':'')+'>Doble progresión</option><option value="load" '+(pr.strategy==="load"?'selected':'')+'>Por carga</option><option value="effort" '+(pr.strategy==="effort"?'selected':'')+'>Por RIR / RPE</option><option value="custom" '+(pr.strategy==="custom"?'selected':'')+'>Personalizada</option></select></label>'+
 '<div id="px-progression-dynamic">'+
 '<div class="px-prog-standard '+(["double","load","effort"].indexOf(pr.strategy)>=0?"":"hidden")+'"><label class="rp-field"><span>Incremento sugerido</span><input id="px-progression-increment" inputmode="decimal" value="'+pr.increment+'" placeholder="2,5"></label><div class="px-prog-note" id="px-progression-note"></div></div>'+
 '<label class="rp-field px-prog-custom '+(pr.strategy==="custom"?"":"hidden")+'"><span>Regla personalizada</span><input id="px-progression-custom" value="'+pxEsc(pr.custom||"")+'" placeholder="Ej. aumentar si completa todas las series con RIR ≥ 2"></label>'+
 '</div></div>'
}
function pxEditor(ri,ei){
 const r=routineCatalog[ri],day=pxDay(r),e=day.exercises[ei];pxNormalizeExercise(e);
 const p=e.prescription;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="px-editor-bg"><div class="sheet px-editor-sheet"><div class="handle"></div>'+
 '<div class="sheet-set-title"><div><div class="eyebrow">'+pxEsc(day.name)+'</div><h2>'+pxEsc(e.name)+'</h2></div><button class="icon-btn" id="px-close-editor">'+ic("x")+'</button></div>'+
 '<div class="px-subhead"><strong>Prescripción general</strong><span>Valores por defecto para las series.</span></div>'+
 '<div class="px-general-grid"><label class="rp-field"><span>'+pxMetricLabels(p).min+'</span><input id="px-default-reps-min" type="number" min="0" value="'+p.repsMin+'"></label><label class="rp-field"><span>'+pxMetricLabels(p).max+'</span><input id="px-default-reps-max" type="number" min="0" value="'+p.repsMax+'"></label><label class="rp-field"><span>Carga ('+(typeof unitLabel==="function"?unitLabel():"kg")+')</span><input id="px-default-weight" inputmode="decimal" value="'+((typeof toDisplayWeight==="function"?toDisplayWeight(p.weight||0):(p.weight||0))||"")+'" placeholder="'+(typeof unitLabel==="function"?unitLabel():"kg")+'"></label><label class="rp-field"><span>Modo de carga</span><select id="px-default-load-mode"><option value="none" '+(p.loadMode==="none"?'selected':'')+'>Sin carga</option><option value="fixed" '+(p.loadMode==="fixed"?'selected':'')+'>Prescrita</option><option value="suggested" '+(p.loadMode==="suggested"?'selected':'')+'>Orientativa</option></select></label></div>'+
 '<div class="px-general-grid three"><label class="rp-field"><span>Esfuerzo</span><select id="px-default-effort-mode"><option value="rir" '+(p.effortMode==="rir"?'selected':'')+'>RIR</option><option value="rpe" '+(p.effortMode==="rpe"?'selected':'')+'>RPE</option><option value="none" '+(p.effortMode==="none"?'selected':'')+'>Sin objetivo</option></select></label><label class="rp-field"><span>Objetivo</span><input id="px-default-effort-target" type="number" min="0" max="10" step=".5" value="'+p.effortTarget+'"></label><label class="rp-field"><span>Descanso</span><select id="px-default-rest"><option value="60">60 s</option><option value="90">90 s</option><option value="120">2 min</option><option value="180">3 min</option><option value="240">4 min</option></select></label></div>'+
 '<div class="px-special-grid"><label class="rp-field"><span>Métrica</span><select id="px-metric-type"><option value="reps" '+(p.metricType==="reps"?"selected":"")+'>Repeticiones</option><option value="time" '+(p.metricType==="time"?"selected":"")+'>Tiempo</option><option value="distance" '+(p.metricType==="distance"?"selected":"")+'>Distancia</option></select></label><label class="rp-field"><span>Unidad distancia</span><select id="px-distance-unit" '+(p.metricType==="distance"?"":"disabled")+'><option value="m" '+(p.distanceUnit==="m"?"selected":"")+'>metros</option><option value="km" '+(p.distanceUnit==="km"?"selected":"")+'>km</option></select></label><label class="rp-field"><span>Tipo de carga</span><select id="px-load-basis"><option value="external" '+(p.loadBasis==="external"?"selected":"")+'>Carga externa</option><option value="bodyweight" '+(p.loadBasis==="bodyweight"?"selected":"")+'>Peso corporal</option><option value="bodyweight-plus" '+(p.loadBasis==="bodyweight-plus"?"selected":"")+'>BW + carga</option><option value="assisted" '+(p.loadBasis==="assisted"?"selected":"")+'>Asistido</option><option value="none" '+(p.loadBasis==="none"?"selected":"")+'>Sin carga</option></select></label><label class="rp-field"><span>Unilateral</span><select id="px-unilateral-mode"><option value="same" '+(p.unilateralMode==="same"?"selected":"")+'>Mismo valor</option><option value="per-side" '+(p.unilateralMode==="per-side"?"selected":"")+'>Registrar por lado</option></select></label></div><label class="px-optional-toggle"><input id="px-optional" type="checkbox" '+(p.optional?"checked":"")+'><span><strong>Ejercicio opcional</strong><small>Omitirlo no convierte la sesión en parcial.</small></span></label><label class="rp-field"><span>Nota para el entrenado</span><input id="px-exercise-note" value="'+pxEsc(e.note||"")+'" placeholder="Indicaciones técnicas"></label>'+
 '<div class="px-default-actions"><button id="px-apply-defaults">'+ic("wand-sparkles")+' Aplicar valores generales a todas las series</button></div>'+
 '<div class="px-subhead series"><strong>Series</strong><button id="px-add-set">'+ic("plus")+' Serie</button></div>'+
 '<div id="px-set-list">'+e.sets.map(function(s,si){return pxSetCard(s,si,e)}).join("")+'</div>'+
 pxProgressFields(p)+
 '<button class="primary px-save" id="px-save">Guardar cambios</button></div></div>';
 document.getElementById("px-default-rest").value=String(p.rest||90);
 const metricType=document.getElementById("px-metric-type"),distanceUnit=document.getElementById("px-distance-unit");
 if(metricType)metricType.onchange=function(){p.metricType=metricType.value;if(distanceUnit)distanceUnit.disabled=metricType.value!=="distance";pxEditor(ri,ei)};
 if(window.lucide)lucide.createIcons();
 pxBindEditor(r,day,e,ri,ei)
}
function pxReadDefault(p){
 p.repsMin=Math.max(0,pxNum(document.getElementById("px-default-reps-min").value,p.repsMin));
 p.repsMax=Math.max(p.repsMin,pxNum(document.getElementById("px-default-reps-max").value,p.repsMax));
 const displayWeight=Math.max(0,pxNum(document.getElementById("px-default-weight").value,typeof toDisplayWeight==="function"?toDisplayWeight(p.weight||0):(p.weight||0)));
 p.weight=typeof fromDisplayWeight==="function"?fromDisplayWeight(displayWeight):displayWeight;
 p.loadMode=document.getElementById("px-default-load-mode").value;
 p.effortMode=document.getElementById("px-default-effort-mode").value;
 p.effortTarget=Math.max(0,Math.min(10,pxNum(document.getElementById("px-default-effort-target").value,p.effortTarget)));
 p.rir=p.effortMode==="rir"?p.effortTarget:null;
 p.rest=+document.getElementById("px-default-rest").value||90;
 const metric=document.getElementById("px-metric-type"),distance=document.getElementById("px-distance-unit"),basis=document.getElementById("px-load-basis"),optional=document.getElementById("px-optional"),unilateral=document.getElementById("px-unilateral-mode");
 if(metric)p.metricType=metric.value;if(distance)p.distanceUnit=distance.value;if(basis)p.loadBasis=basis.value;if(optional)p.optional=optional.checked;if(unilateral)p.unilateralMode=unilateral.value;
 if(p.loadBasis==="bodyweight"||p.loadBasis==="none"){p.loadMode="none";p.weight=0}
}
function pxReadSet(e,s,si){
 const m=pxSetMeta(s);
 const minEl=document.querySelector("[data-px-reps-min='"+si+"']"),maxEl=document.querySelector("[data-px-reps-max='"+si+"']");
 m.repsMin=Math.max(0,pxNum(minEl.value,m.repsMin));m.repsMax=Math.max(m.repsMin,pxNum(maxEl.value,m.repsMax));
 const displaySetWeight=Math.max(0,pxNum(document.querySelector("[data-px-weight='"+si+"']").value,typeof toDisplayWeight==="function"?toDisplayWeight(m.weight||0):(m.weight||0)));
 m.weight=typeof fromDisplayWeight==="function"?fromDisplayWeight(displaySetWeight):displaySetWeight;
 m.loadMode=document.querySelector("[data-px-load-mode='"+si+"']").value;
 m.effortMode=document.querySelector("[data-px-effort-mode='"+si+"']").value;
 m.effortTarget=Math.max(0,Math.min(10,pxNum(document.querySelector("[data-px-effort-target='"+si+"']").value,e.prescription.effortTarget)));
 m.note=document.querySelector("[data-px-set-note='"+si+"']").value.trim();
 const techType=document.querySelector("[data-px-technique='"+si+"']").value;
 if(!m.technique||m.technique.type!==techType)m.technique=pxDefaultTechnique(techType);
 const role=document.querySelector("[data-px-role='"+si+"']").value;s[6]=role;
 s[0]=role==="Calentamiento"?"W":role==="Back-off"?"B":String(si+1);
 s[2]=m.loadMode==="none"?0:m.weight;
 s[3]=m.repsMax;
 return m
}
function pxDefaultTechnique(type){
 if(type==="drop")return {type:"drop",drops:2,reduction:20};
 if(type==="restpause")return {type:"restpause",pause:20,miniSets:2};
 if(type==="partials")return {type:"partials",reps:5,position:"final"};
 return {type:"none"}
}
function pxTechniqueSheet(r,day,e,ri,ei,si){
 const s=e.sets[si],m=pxSetMeta(s),t=m.technique||pxDefaultTechnique("none");
 if(t.type==="none")return;
 let fields="";
 if(t.type==="drop")fields='<div class="px-tech-grid"><label class="rp-field"><span>Descensos</span><input id="px-tech-a" type="number" min="1" max="5" value="'+(t.drops||2)+'"></label><label class="rp-field"><span>Reducción por descenso</span><input id="px-tech-b" type="number" min="5" max="50" value="'+(t.reduction||20)+'"></label></div>';
 if(t.type==="restpause")fields='<div class="px-tech-grid"><label class="rp-field"><span>Pausa</span><input id="px-tech-a" type="number" min="5" max="60" value="'+(t.pause||20)+'"></label><label class="rp-field"><span>Mini-series</span><input id="px-tech-b" type="number" min="1" max="5" value="'+(t.miniSets||2)+'"></label></div>';
 if(t.type==="partials")fields='<div class="px-tech-grid"><label class="rp-field"><span>Reps parciales</span><input id="px-tech-a" type="number" min="1" max="30" value="'+(t.reps||5)+'"></label><label class="rp-field"><span>Momento</span><select id="px-tech-b"><option value="final" '+(t.position==="final"?'selected':'')+'>Al final</option><option value="inicio" '+(t.position==="inicio"?'selected':'')+'>Al inicio</option></select></label></div>';
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="px-tech-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Serie '+(si+1)+'</div><h2>'+pxTechniqueLabel(t.type)+'</h2></div><button class="icon-btn" id="px-close-tech">'+ic("x")+'</button></div>'+fields+'<button class="primary rp-sheet-primary" id="px-save-tech">Guardar técnica</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("px-close-tech").onclick=function(){pxEditor(ri,ei)};
 document.getElementById("px-tech-bg").onclick=function(ev){if(ev.target.id==="px-tech-bg")pxEditor(ri,ei)};
 document.getElementById("px-save-tech").onclick=function(){
  if(t.type==="drop"){t.drops=Math.max(1,+document.getElementById("px-tech-a").value||2);t.reduction=Math.max(5,+document.getElementById("px-tech-b").value||20)}
  if(t.type==="restpause"){t.pause=Math.max(5,+document.getElementById("px-tech-a").value||20);t.miniSets=Math.max(1,+document.getElementById("px-tech-b").value||2)}
  if(t.type==="partials"){t.reps=Math.max(1,+document.getElementById("px-tech-a").value||5);t.position=document.getElementById("px-tech-b").value}
  pxMarkDirty(r);pxEditor(ri,ei)
 }
}
function pxFindBlock(day,e){
 if(!Array.isArray(day.blocks)||!e._rbid)return null;
 return day.blocks.find(function(b){return Array.isArray(b.exerciseIds)&&b.exerciseIds.indexOf(e._rbid)>=0})||null
}
function pxAddSet(r,day,e){
 const block=pxFindBlock(day,e),targets=block&&block.type!=="individual"?block.exerciseIds.map(function(id){return day.exercises.find(function(x){return x._rbid===id})}).filter(Boolean):[e];
 targets.forEach(function(ex){
  pxNormalizeExercise(ex);const last=ex.sets[ex.sets.length-1]||["1","—",0,10,false,"","Efectiva",{}],copy=JSON.parse(JSON.stringify(last));
  copy[0]=String(ex.sets.length+1);copy[4]=false;copy[5]="";ex.sets.push(copy)
 });
 if(block&&block.type!=="individual")block.rounds=Math.max.apply(null,targets.map(function(x){return x.sets.length}));
 r.exercises=day.exercises;pxMarkDirty(r)
}
function pxDeleteSet(r,day,e,si){
 if(e.sets.length<=1)return;
 const block=pxFindBlock(day,e),targets=block&&block.type!=="individual"?block.exerciseIds.map(function(id){return day.exercises.find(function(x){return x._rbid===id})}).filter(Boolean):[e];
 targets.forEach(function(ex){if(ex.sets.length>1)ex.sets.splice(Math.min(si,ex.sets.length-1),1);ex.sets.forEach(function(s,i){if(s[0]!=="W"&&s[0]!=="B")s[0]=String(i+1)})});
 if(block&&block.type!=="individual")block.rounds=Math.min.apply(null,targets.map(function(x){return x.sets.length}));
 r.exercises=day.exercises;pxMarkDirty(r)
}
function pxProgressNote(strategy){
 if(strategy==="double")return "Sugiere aumentar carga cuando todas las series alcanzan el máximo del rango.";
 if(strategy==="load")return "Sugiere el incremento configurado cuando se cumplen los objetivos de la sesión.";
 if(strategy==="effort")return "Usa el RIR/RPE registrado para sugerir mantener o aumentar carga.";
 return ""
}
function pxCaptureDraft(e){
 if(!document.getElementById("px-default-reps-min"))return;
 pxReadDefault(e.prescription);
 const note=document.getElementById("px-exercise-note");if(note)e.note=note.value.trim();
 e.sets.forEach(function(set,si){if(document.querySelector("[data-px-reps-min='"+si+"']"))pxReadSet(e,set,si)});
 const strategy=document.getElementById("px-progression-strategy");
 if(strategy){
  const pr=e.prescription.progression,st=strategy.value;pr.strategy=st;
  const inc=document.getElementById("px-progression-increment");if(inc&&["double","load","effort"].indexOf(st)>=0)pr.increment=Math.max(0,pxNum(inc.value,pr.increment||2.5));
  const custom=document.getElementById("px-progression-custom");if(custom&&st==="custom")pr.custom=custom.value.trim()
 }
}
function pxBindEditor(r,day,e,ri,ei){
 document.getElementById("px-close-editor").onclick=clearRest;
 document.getElementById("px-editor-bg").onclick=function(ev){if(ev.target.id==="px-editor-bg")clearRest()};
 const strategy=document.getElementById("px-progression-strategy");
 function updateProgressUI(){
  const val=strategy.value,std=document.querySelector(".px-prog-standard"),custom=document.querySelector(".px-prog-custom"),note=document.getElementById("px-progression-note");
  std.classList.toggle("hidden",["double","load","effort"].indexOf(val)<0);custom.classList.toggle("hidden",val!=="custom");note.textContent=pxProgressNote(val)
 }
 strategy.onchange=updateProgressUI;updateProgressUI();
 document.getElementById("px-apply-defaults").onclick=function(){
  pxCaptureDraft(e);
  e.sets.forEach(function(s){const m=pxSetMeta(s);m.repsMin=e.prescription.repsMin;m.repsMax=e.prescription.repsMax;m.weight=e.prescription.weight;m.loadMode=e.prescription.loadMode;m.effortMode="inherit";m.effortTarget=null;s[2]=m.loadMode==="none"?0:m.weight;s[3]=m.repsMax});
  pxMarkDirty(r);pxEditor(ri,ei)
 };
 document.getElementById("px-add-set").onclick=function(){pxReadDefault(e.prescription);e.sets.forEach(function(s,si){pxReadSet(e,s,si)});pxAddSet(r,day,e);pxEditor(ri,ei)};
 document.querySelectorAll("[data-px-delete-set]").forEach(function(btn){btn.onclick=function(){pxDeleteSet(r,day,e,+btn.dataset.pxDeleteSet);pxEditor(ri,ei)}});
 document.querySelectorAll("[data-px-technique]").forEach(function(sel){sel.onchange=function(){pxCaptureDraft(e);const si=+sel.dataset.pxTechnique,m=pxSetMeta(e.sets[si]);m.technique=pxDefaultTechnique(sel.value);pxMarkDirty(r);pxEditor(ri,ei)}});
 document.querySelectorAll("[data-px-tech-settings]").forEach(function(btn){btn.onclick=function(){
  pxCaptureDraft(e);pxTechniqueSheet(r,day,e,ri,ei,+btn.dataset.pxTechSettings)
 }});
 document.getElementById("px-save").onclick=function(){
  pxReadDefault(e.prescription);e.note=document.getElementById("px-exercise-note").value.trim();
  e.sets.forEach(function(s,si){pxReadSet(e,s,si)});
  const pr=e.prescription.progression,st=strategy.value;pr.strategy=st;
  if(["double","load","effort"].indexOf(st)>=0)pr.increment=Math.max(0,pxNum(document.getElementById("px-progression-increment").value,2.5));
  if(st==="custom")pr.custom=document.getElementById("px-progression-custom").value.trim();
  r.exercises=day.exercises;pxMarkDirty(r);clearRest();render()
 }
}
openRoutineExerciseSheet=function(ri,ei){pxEditor(ri,ei)};

function pxTechniqueCompact(t){
 if(!t||t.type==="none")return "";
 if(t.type==="drop")return "Drop set · "+(t.drops||2)+" descensos · −"+(t.reduction||20)+"%";
 if(t.type==="restpause")return "Rest-pause · "+(t.pause||20)+" s · "+(t.miniSets||2)+" mini-series";
 if(t.type==="partials")return "Parciales · "+(t.reps||5)+" reps";
 return ""
}
function pxPrescriptionLine(e){
 pxNormalizeExercise(e);const p=e.prescription,metric=pxMetricLabels(p),rep=p.repsMin===p.repsMax?String(p.repsMin):p.repsMin+"–"+p.repsMax;
 const shown=typeof toDisplayWeight==="function"?toDisplayWeight(p.weight||0):(p.weight||0),u=typeof unitLabel==="function"?unitLabel():"kg";
 let load="";
 if(p.loadBasis==="bodyweight")load=" · BW";
 else if(p.loadBasis==="bodyweight-plus")load=" · BW + "+shown+" "+u;
 else if(p.loadBasis==="assisted")load=" · asist. "+shown+" "+u;
 else if(p.loadMode!=="none")load=(p.loadMode==="suggested"?" · ~":" · ")+shown+" "+u;
 const effort=p.effortMode==="none"?"":" · "+p.effortMode.toUpperCase()+" "+p.effortTarget;
 return rep+" "+metric.name+load+effort+" · "+p.rest+" s"+(p.optional?" · opcional":"")
}
const pxBaseExerciseCard=exerciseCard;
exerciseCard=function(e,ei){
 pxNormalizeExercise(e);
 let html=pxBaseExerciseCard(e,ei);
 const line='<div class="px-workout-prescription">'+ic("target")+' '+pxEsc(pxPrescriptionLine(e))+'</div>';
 html=html.replace('<div class="note">',line+'<div class="note">');
 const techniques=e.sets.map(function(s,si){const m=pxSetMeta(s),label=pxTechniqueCompact(m.technique),parts=[];if(label)parts.push(label);if(m.note)parts.push(m.note);return parts.length?'<div class="px-workout-tech">'+ic(label?"sparkles":"sticky-note")+' <strong>Serie '+(si+1)+':</strong> '+pxEsc(parts.join(" · "))+'</div>':""}).filter(Boolean).join("");
 if(techniques)html=html.replace('<div class="sets">',techniques+'<div class="sets">');
 return html
};

function pxPreview(ri){
 const r=routineCatalog[ri],days=pxDays(r);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="px-preview-bg"><div class="sheet px-preview-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Vista del entrenado</div><h2>'+pxEsc(r.name)+'</h2></div><button class="icon-btn" id="px-close-preview">'+ic("x")+'</button></div><div class="px-preview-days">'+days.map(function(d){return '<section><div class="px-preview-day"><strong>'+pxEsc(d.name)+'</strong><span>'+d.exercises.length+' ejercicios</span></div>'+d.exercises.map(function(e){pxNormalizeExercise(e);const special=e.sets.filter(function(s){return pxSetMeta(s).technique.type!=="none"}).length;return '<div class="px-preview-ex"><div><strong>'+pxEsc(e.name)+'</strong><span>'+pxEsc(pxPrescriptionLine(e))+'</span></div><small>'+e.sets.length+' series'+(special?' · '+special+' con técnica':'')+'</small></div>'}).join("")+'</section>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("px-close-preview").onclick=clearRest;document.getElementById("px-preview-bg").onclick=function(ev){if(ev.target.id==="px-preview-bg")clearRest()}
}
const pxPrevEvents=events;
events=function(){
 pxPrevEvents();
 document.querySelectorAll("[data-edit-routine-exercise]").forEach(function(btn){btn.onclick=function(){const p=btn.dataset.editRoutineExercise.split(":").map(Number);pxEditor(p[0],p[1])}});
 document.querySelectorAll("[data-rp-preview-routine]").forEach(function(btn){btn.onclick=function(){pxPreview(+btn.dataset.rpPreviewRoutine)}});
};

routineCatalog.forEach(function(r){pxDays(r).forEach(function(d){d.exercises.forEach(pxNormalizeExercise)})});
render();
})();