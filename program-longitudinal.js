(function(){
function lpEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function lpClone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function lpNum(v,d){const n=Number(String(v==null?"":v).replace(",","."));return Number.isFinite(n)?n:d}
function lpPrograms(){return window.RodasPrograms?window.RodasPrograms.getPrograms():[]}
function lpProgram(i){return lpPrograms()[i]||null}
function lpRoutine(id){return window.RodasPrograms?window.RodasPrograms.getRoutineById(id):routineCatalog.find(function(r){return r.id===id})}
function lpZero(){return {setsPercent:0,seriesDelta:0,repsMinDelta:0,repsMaxDelta:0,loadPercent:0,effortEase:0,restDelta:0}}
function lpNormalizeMods(m){const z=lpZero();m=m||{};Object.keys(z).forEach(function(k){z[k]=lpNum(m[k],0)});return z}
function lpEnsurePhase(ph){
 if(!ph.plan)ph.plan={base:lpZero(),weeks:{},progressions:[]};
 ph.plan.base=lpNormalizeMods(ph.plan.base);
 if(!ph.plan.weeks||typeof ph.plan.weeks!=="object")ph.plan.weeks={};
 if(!Array.isArray(ph.plan.progressions))ph.plan.progressions=[];
 return ph.plan
}
function lpDirty(p){if(p.status==="Publicado")p.status="Borrador";else p.status="Borrador";if(window.RodasPrograms)window.RodasPrograms.save()}
function lpIsZero(m){m=lpNormalizeMods(m);return Object.keys(m).every(function(k){return Number(m[k]||0)===0})}
function lpModifierText(m){
 m=lpNormalizeMods(m);const out=[];
 if(m.setsPercent)out.push((m.setsPercent>0?"+":"")+m.setsPercent+"% volumen");
 if(m.seriesDelta)out.push((m.seriesDelta>0?"+":"")+m.seriesDelta+" series");
 if(m.loadPercent)out.push((m.loadPercent>0?"+":"")+m.loadPercent+"% carga");
 if(m.repsMinDelta||m.repsMaxDelta)out.push("reps "+(m.repsMinDelta>0?"+":"")+m.repsMinDelta+"/"+(m.repsMaxDelta>0?"+":"")+m.repsMaxDelta);
 if(m.effortEase)out.push((m.effortEase>0?"+":"")+m.effortEase+" autorreg.");
 if(m.restDelta)out.push((m.restDelta>0?"+":"")+m.restDelta+" s descanso");
 return out.length?out.join(" · "):"Sin modificadores"
}
function lpProgressionTouches(ph,w){const plan=lpEnsurePhase(ph);return plan.progressions.some(function(pr){return pr.values&&Object.prototype.hasOwnProperty.call(pr.values,String(w))})}
function lpWeekCustom(ph,w){const plan=lpEnsurePhase(ph),entry=plan.weeks[String(w)];return !!(entry&&!lpIsZero(entry.modifiers))||lpProgressionTouches(ph,w)}
function lpSection(p,pi){
 p.phases.forEach(lpEnsurePhase);
 return '<div class="section lp-section"><div class="section-head"><div><h2>Programación semanal</h2><span class="caption">Herencia por fase y semana</span></div><button class="link" data-lp-grid="'+pi+'">Vista longitudinal</button></div>'+
 '<div class="lp-phase-plan-list">'+p.phases.map(function(ph,phi){const plan=lpEnsurePhase(ph),weeks=[];for(let w=ph.from;w<=ph.to;w++)weeks.push('<button class="lp-week-chip '+(lpWeekCustom(ph,w)?"custom":"")+'" data-lp-week="'+pi+':'+phi+':'+w+'"><strong>S'+w+'</strong><span>'+(lpWeekCustom(ph,w)?(lpProgressionTouches(ph,w)?"Plan":"Cambio"):"=")+'</span></button>');return '<article class="card lp-phase-plan"><div class="lp-phase-plan-head"><div><span class="lp-phase-type">'+lpEsc(ph.type)+'</span><strong>'+lpEsc(ph.name)+'</strong><small>'+lpEsc(lpModifierText(plan.base))+'</small></div><button class="secondary" data-lp-phase-plan="'+pi+':'+phi+'">'+ic("sliders-horizontal")+' Planificar</button></div><div class="lp-week-strip">'+weeks.join("")+'</div>'+(plan.progressions.length?'<div class="lp-progression-count">'+ic("trending-up")+' '+plan.progressions.length+' progresión'+(plan.progressions.length===1?"":"es")+' planificada'+(plan.progressions.length===1?"":"s")+'</div>':"")+'</article>'}).join("")+'</div></div>'
}
function lpInjectProgram(html,p,pi){
 const marker='<div class="rp-program-actions">';
 return html.indexOf(marker)>=0?html.replace(marker,lpSection(p,pi)+marker):html
}
function lpFields(m,prefix){
 m=lpNormalizeMods(m);
 return '<div class="lp-mod-grid">'+
 '<label class="rp-field"><span>Volumen series (%)</span><input id="'+prefix+'-setsPercent" inputmode="decimal" value="'+m.setsPercent+'"></label>'+
 '<label class="rp-field"><span>Series (+/−)</span><input id="'+prefix+'-seriesDelta" inputmode="decimal" value="'+m.seriesDelta+'"></label>'+
 '<label class="rp-field"><span>Carga (%)</span><input id="'+prefix+'-loadPercent" inputmode="decimal" value="'+m.loadPercent+'"></label>'+
 '<label class="rp-field"><span>Reps mín. (+/−)</span><input id="'+prefix+'-repsMinDelta" inputmode="decimal" value="'+m.repsMinDelta+'"></label>'+
 '<label class="rp-field"><span>Reps máx. (+/−)</span><input id="'+prefix+'-repsMaxDelta" inputmode="decimal" value="'+m.repsMaxDelta+'"></label>'+
 '<label class="rp-field"><span>Esfuerzo más fácil</span><input id="'+prefix+'-effortEase" inputmode="decimal" value="'+m.effortEase+'"></label>'+
 '<label class="rp-field"><span>Descanso (+/− s)</span><input id="'+prefix+'-restDelta" inputmode="decimal" value="'+m.restDelta+'"></label>'+
 '</div>'
}
function lpRead(prefix){const m=lpZero();Object.keys(m).forEach(function(k){const el=document.getElementById(prefix+"-"+k);m[k]=el?lpNum(el.value,0):0});return m}
function lpOpenPhase(pi,phi){
 const p=lpProgram(pi),ph=p&&p.phases[phi];if(!ph)return;const plan=lpEnsurePhase(ph);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lp-phase-bg"><div class="sheet lp-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Semanas '+ph.from+(ph.to!==ph.from?"–"+ph.to:"")+'</div><h2>'+lpEsc(ph.name)+'</h2></div><button class="icon-btn" id="lp-close-phase">'+ic("x")+'</button></div><div class="lp-help">'+ic("layers-3")+' La fase define valores heredados. Cada semana guarda únicamente diferencias adicionales.</div><div class="lp-subhead"><strong>Modificadores base</strong><span>Se aplican a toda la fase</span></div>'+lpFields(plan.base,"lp-base")+
 (String(ph.type).toLowerCase()==="descarga"?'<button class="lp-preset" id="lp-deload-preset">'+ic("battery-low")+' Aplicar preset de descarga (−40% volumen · −10% carga · +2 facilidad)</button>':"")+
 '<div class="lp-phase-actions"><button class="secondary" id="lp-mass">'+ic("layers")+' Cambios masivos</button><button class="secondary" id="lp-progression">'+ic("trending-up")+' Generar progresión</button></div>'+
 '<div class="lp-subhead weeks"><strong>Semanas</strong><span>Toca una semana para añadir diferencias</span></div><div class="lp-week-list">'+Array.from({length:ph.to-ph.from+1},function(_,i){const w=ph.from+i,entry=plan.weeks[String(w)],mods=entry?entry.modifiers:lpZero(),has=lpWeekCustom(ph,w);return '<button data-lp-week-edit="'+pi+':'+phi+':'+w+'" class="'+(has?"custom":"")+'"><span><strong>Semana '+w+'</strong><small>'+lpEsc(lpIsZero(mods)?(lpProgressionTouches(ph,w)?"Progresión planificada":"Hereda fase"):lpModifierText(mods))+'</small></span><b>'+(has?"Personalizada":"=")+'</b>'+ic("chevron-right")+'</button>'}).join("")+'</div>'+
 (plan.progressions.length?'<div class="lp-subhead"><strong>Progresiones planificadas</strong></div><div class="lp-prog-list">'+plan.progressions.map(function(pr,i){return '<div><span><strong>'+lpEsc(pr.exerciseName)+'</strong><small>'+lpEsc(lpProgressionFieldLabel(pr.field))+' · S'+ph.from+'→S'+ph.to+'</small></span><button data-lp-remove-prog="'+i+'">'+ic("trash-2")+'</button></div>'}).join("")+'</div>':"")+
 '<button class="primary lp-save" id="lp-save-phase">Guardar fase</button></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("lp-close-phase").onclick=clearRest;document.getElementById("lp-phase-bg").onclick=function(ev){if(ev.target.id==="lp-phase-bg")clearRest()};
 const preset=document.getElementById("lp-deload-preset");if(preset)preset.onclick=function(){document.getElementById("lp-base-setsPercent").value=-40;document.getElementById("lp-base-loadPercent").value=-10;document.getElementById("lp-base-effortEase").value=2};
 document.getElementById("lp-mass").onclick=function(){plan.base=lpRead("lp-base");lpDirty(p);lpOpenMass(pi,phi)};
 document.getElementById("lp-progression").onclick=function(){plan.base=lpRead("lp-base");lpDirty(p);lpOpenProgression(pi,phi)};
 document.querySelectorAll("[data-lp-week-edit]").forEach(function(b){b.onclick=function(){plan.base=lpRead("lp-base");lpDirty(p);const q=b.dataset.lpWeekEdit.split(":").map(Number);lpOpenWeek(q[0],q[1],q[2])}});
 document.querySelectorAll("[data-lp-remove-prog]").forEach(function(b){b.onclick=function(){plan.progressions.splice(+b.dataset.lpRemoveProg,1);lpDirty(p);lpOpenPhase(pi,phi)}});
 document.getElementById("lp-save-phase").onclick=function(){plan.base=lpRead("lp-base");lpDirty(p);clearRest();render()}
}
function lpOpenWeek(pi,phi,w){
 const p=lpProgram(pi),ph=p&&p.phases[phi];if(!ph)return;const plan=lpEnsurePhase(ph),entry=plan.weeks[String(w)]||(plan.weeks[String(w)]={modifiers:lpZero()});entry.modifiers=lpNormalizeMods(entry.modifiers);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lp-week-bg"><div class="sheet lp-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+lpEsc(ph.name)+'</div><h2>Semana '+w+'</h2></div><button class="icon-btn" id="lp-close-week">'+ic("x")+'</button></div><div class="lp-help">'+ic("git-branch")+' Estos valores se suman a los modificadores base de la fase. Dejar todo en 0 significa heredar sin cambios.</div>'+lpFields(entry.modifiers,"lp-week")+'<div class="lp-effective-preview"><strong>Resultado combinado</strong><span id="lp-combined">'+lpEsc(lpModifierText(lpCombine(plan.base,entry.modifiers)))+'</span></div><div class="lp-week-actions"><button class="secondary" id="lp-reset-week">'+ic("rotate-ccw")+' Volver a herencia</button><button class="primary" id="lp-save-week">Guardar semana</button></div></div></div>';
 if(window.lucide)lucide.createIcons();
 document.getElementById("lp-close-week").onclick=function(){lpOpenPhase(pi,phi)};document.getElementById("lp-week-bg").onclick=function(ev){if(ev.target.id==="lp-week-bg")lpOpenPhase(pi,phi)};
 document.querySelectorAll("[id^='lp-week-']").forEach(function(el){if(el.tagName==="INPUT")el.oninput=function(){document.getElementById("lp-combined").textContent=lpModifierText(lpCombine(plan.base,lpRead("lp-week")))}});
 document.getElementById("lp-reset-week").onclick=function(){delete plan.weeks[String(w)];lpDirty(p);lpOpenPhase(pi,phi)};
 document.getElementById("lp-save-week").onclick=function(){entry.modifiers=lpRead("lp-week");if(lpIsZero(entry.modifiers))delete plan.weeks[String(w)];lpDirty(p);lpOpenPhase(pi,phi)}
}
function lpCombine(a,b){a=lpNormalizeMods(a);b=lpNormalizeMods(b);const out=lpZero();Object.keys(out).forEach(function(k){out[k]=Number(a[k]||0)+Number(b[k]||0)});return out}
function lpExercisesForPhase(ph){
 const r=lpRoutine(ph.routineId),seen={},out=[];if(!r)return out;const days=Array.isArray(r.days)&&r.days.length?r.days:[{exercises:r.exercises||[]}];
 days.forEach(function(d){(d.exercises||[]).forEach(function(e){const key=e._rbid||e.id||e.name;if(seen[key])return;seen[key]=1;const p=e.prescription||{},sets=e.sets||[],first=sets[0]||[],meta=first[7]||{};out.push({key:key,name:e.name,weight:Number(p.weight!=null?p.weight:(meta.weight!=null?meta.weight:first[2]||0)),repsMax:Number(p.repsMax!=null?p.repsMax:(meta.repsMax!=null?meta.repsMax:first[3]||0)),series:sets.length||1})})});return out
}
function lpProgressionFieldLabel(f){return f==="weight"?"Carga (kg)":f==="repsMax"?"Repeticiones":"Series"}
function lpOpenProgression(pi,phi){
 const p=lpProgram(pi),ph=p&&p.phases[phi];if(!ph)return;const plan=lpEnsurePhase(ph),exs=lpExercisesForPhase(ph);if(!exs.length){alert("La rutina de esta fase no tiene ejercicios.");return}
 const first=exs[0];
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lp-prog-bg"><div class="sheet lp-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+lpEsc(ph.name)+'</div><h2>Generar progresión</h2></div><button class="icon-btn" id="lp-close-prog">'+ic("x")+'</button></div><label class="rp-field"><span>Ejercicio</span><select id="lp-prog-ex">'+exs.map(function(e){return '<option value="'+lpEsc(e.key)+'">'+lpEsc(e.name)+'</option>'}).join("")+'</select></label><label class="rp-field"><span>Variable</span><select id="lp-prog-field"><option value="weight">Carga (kg)</option><option value="repsMax">Repeticiones máximas</option><option value="series">Series</option></select></label><div class="lp-mod-grid two"><label class="rp-field"><span>Valor inicial</span><input id="lp-prog-start" inputmode="decimal" value="'+first.weight+'"></label><label class="rp-field"><span>Valor final</span><input id="lp-prog-end" inputmode="decimal" value="'+(first.weight+5)+'"></label></div><div class="lp-help">'+ic("wand-sparkles")+' Rodas generará una propuesta lineal y editable por semanas. Esto es progresión planificada, no una decisión automática basada en rendimiento.</div><button class="primary lp-save" id="lp-create-prog">Generar propuesta</button></div></div>';
 if(window.lucide)lucide.createIcons();
 function defaults(){const e=exs.find(function(x){return x.key===document.getElementById("lp-prog-ex").value})||first,f=document.getElementById("lp-prog-field").value,v=e[f];document.getElementById("lp-prog-start").value=v;document.getElementById("lp-prog-end").value=f==="weight"?v+5:v+Math.max(1,ph.to-ph.from)}
 document.getElementById("lp-prog-ex").onchange=defaults;document.getElementById("lp-prog-field").onchange=defaults;
 document.getElementById("lp-close-prog").onclick=function(){lpOpenPhase(pi,phi)};document.getElementById("lp-prog-bg").onclick=function(ev){if(ev.target.id==="lp-prog-bg")lpOpenPhase(pi,phi)};
 document.getElementById("lp-create-prog").onclick=function(){const key=document.getElementById("lp-prog-ex").value,e=exs.find(function(x){return x.key===key}),field=document.getElementById("lp-prog-field").value,start=lpNum(document.getElementById("lp-prog-start").value,e[field]),end=lpNum(document.getElementById("lp-prog-end").value,start),span=Math.max(1,ph.to-ph.from),values={};for(let w=ph.from;w<=ph.to;w++){let val=start+(end-start)*((w-ph.from)/span);val=field==="weight"?Math.round(val*2)/2:Math.round(val);values[String(w)]=val}plan.progressions=plan.progressions.filter(function(x){return !(x.exerciseKey===key&&x.field===field)});plan.progressions.push({id:"prog-"+Date.now(),exerciseKey:key,exerciseName:e.name,field:field,values:values});lpDirty(p);lpOpenPhase(pi,phi)}
}
function lpOpenMass(pi,phi){
 const p=lpProgram(pi),ph=p&&p.phases[phi];if(!ph)return;const plan=lpEnsurePhase(ph);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lp-mass-bg"><div class="sheet lp-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">'+lpEsc(ph.name)+'</div><h2>Cambios masivos</h2></div><button class="icon-btn" id="lp-close-mass">'+ic("x")+'</button></div><div class="lp-subhead"><strong>Semanas</strong><span>Selecciona dónde sumar el cambio</span></div><div class="lp-mass-weeks">'+Array.from({length:ph.to-ph.from+1},function(_,i){const w=ph.from+i;return '<label><input type="checkbox" value="'+w+'" checked><span>S'+w+'</span></label>'}).join("")+'</div>'+lpFields(lpZero(),"lp-mass")+'<div class="lp-help">'+ic("plus-circle")+' Los valores se suman a los cambios semanales existentes. Por ejemplo, −10 en Carga aplica −10% adicional.</div><button class="primary lp-save" id="lp-apply-mass">Aplicar a semanas seleccionadas</button></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lp-close-mass").onclick=function(){lpOpenPhase(pi,phi)};document.getElementById("lp-mass-bg").onclick=function(ev){if(ev.target.id==="lp-mass-bg")lpOpenPhase(pi,phi)};
 document.getElementById("lp-apply-mass").onclick=function(){const add=lpRead("lp-mass"),weeks=Array.from(document.querySelectorAll(".lp-mass-weeks input:checked")).map(function(x){return x.value});weeks.forEach(function(w){const e=plan.weeks[w]||(plan.weeks[w]={modifiers:lpZero()});e.modifiers=lpCombine(e.modifiers,add);if(lpIsZero(e.modifiers))delete plan.weeks[w]});lpDirty(p);lpOpenPhase(pi,phi)}
}
function lpOpenGrid(pi){
 const p=lpProgram(pi);if(!p)return;
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lp-grid-bg"><div class="sheet lp-grid-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Programa</div><h2>Vista longitudinal</h2></div><button class="icon-btn" id="lp-close-grid">'+ic("x")+'</button></div><div class="lp-grid-scroll">'+p.phases.map(function(ph){const plan=lpEnsurePhase(ph),weeks=[];for(let w=ph.from;w<=ph.to;w++)weeks.push(w);return '<section><div class="lp-grid-phase"><strong>'+lpEsc(ph.name)+'</strong><span>'+lpEsc(lpModifierText(plan.base))+'</span></div><table><thead><tr><th>Plan</th>'+weeks.map(function(w){return '<th>S'+w+'</th>'}).join("")+'</tr></thead><tbody><tr><td>Semana</td>'+weeks.map(function(w){const e=plan.weeks[String(w)];return '<td class="'+(lpWeekCustom(ph,w)?"custom":"")+'">'+(e&&!lpIsZero(e.modifiers)?lpEsc(lpModifierText(e.modifiers)):(lpProgressionTouches(ph,w)?"Prog.":"="))+'</td>'}).join("")+'</tr>'+plan.progressions.map(function(pr){return '<tr><td>'+lpEsc(pr.exerciseName)+'<small>'+lpEsc(lpProgressionFieldLabel(pr.field))+'</small></td>'+weeks.map(function(w){return '<td class="custom">'+lpEsc(pr.values[String(w)])+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></section>'}).join("")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lp-close-grid").onclick=clearRest;document.getElementById("lp-grid-bg").onclick=function(ev){if(ev.target.id==="lp-grid-bg")clearRest()}
}
function lpResizeSets(ex,count){
 if(!Array.isArray(ex.sets))ex.sets=[];count=Math.max(1,Math.round(count));
 while(ex.sets.length<count){const last=ex.sets[ex.sets.length-1]||["1","—",0,10,false,"","Efectiva",{}],cp=lpClone(last);cp[0]=String(ex.sets.length+1);cp[4]=false;cp[5]="";ex.sets.push(cp)}
 if(ex.sets.length>count)ex.sets=ex.sets.slice(0,count)
}
function lpApplyMods(ex,m){
 m=lpNormalizeMods(m);if(!ex.prescription)ex.prescription={};const p=ex.prescription,sets=ex.sets||[],first=sets[0]||[],meta=first[7]||{};
 const baseCount=Math.max(1,sets.length||1),count=Math.max(1,Math.round(baseCount*(1+m.setsPercent/100)+m.seriesDelta));lpResizeSets(ex,count);
 const rmin=Math.max(0,Number(p.repsMin!=null?p.repsMin:(meta.repsMin!=null?meta.repsMin:first[3]||0))+m.repsMinDelta),rmax=Math.max(rmin,Number(p.repsMax!=null?p.repsMax:(meta.repsMax!=null?meta.repsMax:first[3]||0))+m.repsMaxDelta);
 p.repsMin=rmin;p.repsMax=rmax;
 const baseWeight=Number(p.weight!=null?p.weight:(meta.weight!=null?meta.weight:first[2]||0));p.weight=Math.max(0,Math.round(baseWeight*(1+m.loadPercent/100)*2)/2);
 const mode=p.effortMode||"rir",target=Number(p.effortTarget!=null?p.effortTarget:(p.rir!=null?p.rir:2));p.effortTarget=Math.max(0,Math.min(10,mode==="rpe"?target-m.effortEase:target+m.effortEase));if(mode==="rir")p.rir=p.effortTarget;
 p.rest=Math.max(0,Number(p.rest||90)+m.restDelta);
 ex.sets.forEach(function(s,i){if(!s[7]||typeof s[7]!=="object")s[7]={};s[7].repsMin=rmin;s[7].repsMax=rmax;s[7].weight=p.weight;s[7].effortMode="inherit";s[7].effortTarget=null;s[3]=rmax;if((p.loadMode||"fixed")!=="none")s[2]=p.weight;if(s[0]!=="W"&&s[0]!=="B")s[0]=String(i+1)})
}
function lpApplyProgression(ex,field,value){
 if(!ex.prescription)ex.prescription={};
 if(field==="series"){lpResizeSets(ex,value);return}
 if(field==="weight"){ex.prescription.weight=Math.max(0,Number(value));(ex.sets||[]).forEach(function(s){if((ex.prescription.loadMode||"fixed")!=="none")s[2]=ex.prescription.weight;if(!s[7]||typeof s[7]!=="object")s[7]={};s[7].weight=ex.prescription.weight});return}
 if(field==="repsMax"){ex.prescription.repsMax=Math.max(0,Number(value));if(ex.prescription.repsMin==null||ex.prescription.repsMin>ex.prescription.repsMax)ex.prescription.repsMin=ex.prescription.repsMax;(ex.sets||[]).forEach(function(s){s[3]=ex.prescription.repsMax;if(!s[7]||typeof s[7]!=="object")s[7]={};s[7].repsMax=ex.prescription.repsMax;s[7].repsMin=ex.prescription.repsMin})}
}
function lpApplyToRoutine(a,routine,context){
 if(!a||a.sourceType!=="program"||!a.baseSnapshot||a.baseSnapshot.type!=="program")return routine;
 const week=Number(context&&context.week||1),phaseName=context&&context.phase,ph=(a.baseSnapshot.phases||[]).find(function(x){return week>=x.from&&week<=x.to&&(x.routineId===routine.id||!routine.id)})||(a.baseSnapshot.phases||[]).find(function(x){return x.name===phaseName})||null;if(!ph)return routine;
 const out=lpClone(routine),plan=lpEnsurePhase(lpClone(ph)),entry=plan.weeks[String(week)],mods=lpCombine(plan.base,entry&&entry.modifiers);
 (out.days||[]).forEach(function(d){(d.exercises||[]).forEach(function(ex){lpApplyMods(ex,mods);const key=ex.key||ex._rbid||ex.id||ex.name;plan.progressions.forEach(function(pr){if(pr.exerciseKey===key&&pr.values&&Object.prototype.hasOwnProperty.call(pr.values,String(week)))lpApplyProgression(ex,pr.field,pr.values[String(week)])})})});
 return out
}

lpPrograms().forEach(function(p){(p.phases||[]).forEach(lpEnsurePhase)});
const lpPrevRoutines=routines;
routines=function(){let html=lpPrevRoutines();const st=window.RodasPrograms&&window.RodasPrograms.getState();if(st&&st.programDetail!==null&&html.indexOf("rp-program-detail")>=0){const p=lpProgram(st.programDetail);if(p)html=lpInjectProgram(html,p,st.programDetail)}return html};

const lpPrevEvents=events;
events=function(){
 lpPrevEvents();
 document.querySelectorAll("[data-lp-phase-plan]").forEach(function(b){b.onclick=function(){const q=b.dataset.lpPhasePlan.split(":").map(Number);lpOpenPhase(q[0],q[1])}});
 document.querySelectorAll("[data-lp-week]").forEach(function(b){b.onclick=function(){const q=b.dataset.lpWeek.split(":").map(Number);lpOpenWeek(q[0],q[1],q[2])}});
 document.querySelectorAll("[data-lp-grid]").forEach(function(b){b.onclick=function(){lpOpenGrid(+b.dataset.lpGrid)}})
};

window.RodasLongitudinal={applyToRoutine:lpApplyToRoutine,ensurePhase:lpEnsurePhase,combine:lpCombine};
render();
})();