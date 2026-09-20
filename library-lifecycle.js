(function(){
const LC_UI_KEY="rodas.libraryLifecycle.ui.v1";
const lcState={view:"active",query:"",folder:"all"};

function lcEsc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function lcClone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function lcPrograms(){return window.RodasPrograms?window.RodasPrograms.getPrograms():[]}
function lcAssignments(){return window.RodasAssignments?window.RodasAssignments.getAssignments():[]}
function lcProgramState(){return window.RodasPrograms?window.RodasPrograms.getState():{section:"routines",programDetail:null}}
function lcSave(){if(window.RodasPrograms)window.RodasPrograms.save()}
function lcVersions(){return window.RodasVersioning?window.RodasVersioning.getVersionStore():{}}
function lcLoadUI(){try{const raw=localStorage.getItem(LC_UI_KEY);if(raw)Object.assign(lcState,JSON.parse(raw)||{})}catch(e){}}
function lcSaveUI(){try{localStorage.setItem(LC_UI_KEY,JSON.stringify(lcState))}catch(e){}}
function lcEnsureMeta(o){
 if(!o)return o;
 if(typeof o.favorite!=="boolean")o.favorite=false;
 if(typeof o.archived!=="boolean")o.archived=false;
 if(!Array.isArray(o.tags))o.tags=[];
 if(o.folder==null)o.folder="";
 return o
}
function lcFind(type,id){return type==="routine"?routineCatalog.find(function(r){return r.id===id}):lcPrograms().find(function(p){return p.id===id})}
function lcModelList(type){return type==="routine"?routineCatalog:lcPrograms()}
function lcAssignmentsActive(list){return list.filter(function(a){return a.status!=="completed"})}
function lcProgramRefsRoutine(id){return lcPrograms().filter(function(p){return (p.phases||[]).some(function(ph){return ph.routineId===id})})}
function lcProgramContainsRoutineAssignment(a,rid){
 if(a.sourceType!=="program")return false;
 if(a.baseSnapshot&&a.baseSnapshot.type==="program")return (a.baseSnapshot.phases||[]).some(function(ph){return ph.routineId===rid});
 const p=lcFind("program",a.sourceId);return !!(p&&(p.phases||[]).some(function(ph){return ph.routineId===rid}))
}
function lcDependencies(type,obj){
 const all=lcAssignments(),direct=all.filter(function(a){return a.sourceType===type&&a.sourceId===obj.id}),active=lcAssignmentsActive(direct);
 if(type==="program")return {programs:[],direct:direct,active:active,through:[]};
 const programs=lcProgramRefsRoutine(obj.id),through=all.filter(function(a){return lcProgramContainsRoutineAssignment(a,obj.id)});
 return {programs:programs,direct:direct,active:active,through:through}
}
function lcDependencyCount(type,obj){
 const d=lcDependencies(type,obj);return type==="program"?d.direct.length:d.programs.length+d.direct.length+d.through.length
}
function lcCanDelete(type,obj){
 const d=lcDependencies(type,obj),noRefs=type==="program"?d.direct.length===0:(d.programs.length===0&&d.direct.length===0&&d.through.length===0);
 return noRefs&&Number(obj.version||0)===0&&obj.status==="Borrador"
}
function lcAllFolders(type){
 const set={};lcModelList(type).forEach(function(o){lcEnsureMeta(o);if(o.folder)set[o.folder]=1});
 return Object.keys(set).sort()
}
function lcSearchText(type,o){
 const parts=[o.name,o.subtitle,o.description,o.folder].concat(o.tags||[]);
 if(type==="routine"){
  const days=Array.isArray(o.days)&&o.days.length?o.days:[{exercises:o.exercises||[]}];
  days.forEach(function(d){parts.push(d.name);(d.exercises||[]).forEach(function(e){parts.push(e.name)})})
 }else (o.phases||[]).forEach(function(ph){parts.push(ph.name);const r=lcFind("routine",ph.routineId);if(r)parts.push(r.name)});
 return parts.filter(Boolean).join(" ").toLowerCase()
}
function lcToolbar(type){
 const folders=lcAllFolders(type);
 return '<div class="lc-library-bar"><div class="lc-search">'+ic("search")+'<input id="lc-search" value="'+lcEsc(lcState.query||"")+'" placeholder="Buscar en biblioteca"></div><div class="lc-filter-row"><div class="lc-view-tabs"><button data-lc-view="active" class="'+(lcState.view==="active"?"active":"")+'">Activas</button><button data-lc-view="favorites" class="'+(lcState.view==="favorites"?"active":"")+'">'+ic("star")+' Favoritas</button><button data-lc-view="archived" class="'+(lcState.view==="archived"?"active":"")+'">Archivadas</button></div><select id="lc-folder-filter"><option value="all">Todas las carpetas</option>'+folders.map(function(f){return '<option value="'+lcEsc(f)+'" '+(lcState.folder===f?"selected":"")+'>'+lcEsc(f)+'</option>'}).join("")+'</select></div></div>'
}
function lcInjectList(html,type){
 if(type==="routine"){
  const marker='<div class="routine-filter">';return html.indexOf(marker)>=0?html.replace(marker,lcToolbar(type)+marker):html
 }
 const marker='<div class="rp-info-strip">';return html.indexOf(marker)>=0?html.replace(marker,lcToolbar(type)+marker):html
}
function lcDetailSection(type,obj){
 lcEnsureMeta(obj);const d=lcDependencies(type,obj),versions=Object.keys(lcVersions()[type+":"+obj.id]||{}).length,canDelete=lcCanDelete(type,obj);
 const depA=type==="routine"?d.programs.length:d.direct.length,depALabel=type==="routine"?"Programas":"Asignaciones";
 const depB=type==="routine"?d.direct.length+d.through.length:d.active.length,depBLabel=type==="routine"?"Asignaciones":"Activas";
 return '<div class="section lc-detail-section"><div class="section-head"><div><h2>Biblioteca y ciclo de vida</h2><span class="caption">'+(obj.archived?"Archivada":"Disponible")+'</span></div><button class="lc-favorite-detail '+(obj.favorite?"active":"")+'" data-lc-favorite="'+type+':'+obj.id+'" aria-label="Favorito">'+ic("star")+'</button></div>'+
 '<article class="card lc-meta-card"><div class="lc-meta-main"><div><span>Carpeta</span><strong>'+lcEsc(obj.folder||"Sin carpeta")+'</strong></div><div><span>Etiquetas</span><strong>'+lcEsc((obj.tags||[]).join(" · ")||"Sin etiquetas")+'</strong></div></div><button class="secondary" data-lc-edit-meta="'+type+':'+obj.id+'">'+ic("folder-cog")+' Organizar</button></article>'+
 '<div class="lc-dependency-grid"><button data-lc-deps="'+type+':'+obj.id+'"><strong>'+depA+'</strong><span>'+depALabel+'</span></button><button data-lc-deps="'+type+':'+obj.id+'"><strong>'+depB+'</strong><span>'+depBLabel+'</span></button><button data-lc-history="'+type+':'+obj.id+'"><strong>'+versions+'</strong><span>Versiones</span></button></div>'+
 '<div class="lc-action-grid"><button class="secondary" data-lc-duplicate="'+type+':'+obj.id+'">'+ic("copy")+' Duplicar</button><button class="secondary" data-lc-history="'+type+':'+obj.id+'">'+ic("history")+' Historial</button><button class="secondary" data-lc-'+(obj.archived?"restore":"archive")+'="'+type+':'+obj.id+'">'+ic(obj.archived?"archive-restore":"archive")+' '+(obj.archived?"Restaurar":"Archivar")+'</button>'+(canDelete?'<button class="secondary danger" data-lc-delete="'+type+':'+obj.id+'">'+ic("trash-2")+' Eliminar</button>':"")+'</div></div>'
}
function lcInsertBeforeEnd(html,addition){const i=html.lastIndexOf("</section>");return i>=0?html.slice(0,i)+addition+html.slice(i):html+addition}
function lcInjectProgramDetail(html,obj){
 const marker='<div class="rp-program-actions">';return html.indexOf(marker)>=0?html.replace(marker,lcDetailSection("program",obj)+marker):lcInsertBeforeEnd(html,lcDetailSection("program",obj))
}
function lcApplyListFilters(type){
 const query=(lcState.query||"").trim().toLowerCase(),folder=lcState.folder||"all";
 const cards=type==="routine"?document.querySelectorAll(".rp-routine-card"):document.querySelectorAll(".rp-program-card");
 let visible=0;
 cards.forEach(function(card){
  const btn=type==="routine"?card.querySelector("[data-routine-detail]"):card.querySelector("[data-rp-program]");if(!btn)return;
  const idx=Number(type==="routine"?btn.dataset.routineDetail:btn.dataset.rpProgram),o=lcModelList(type)[idx];if(!o)return;lcEnsureMeta(o);
  let show=lcState.view==="archived"?o.archived:lcState.view==="favorites"?(!o.archived&&o.favorite):!o.archived;
  if(show&&folder!=="all")show=o.folder===folder;
  if(show&&query)show=lcSearchText(type,o).indexOf(query)>=0;
  card.style.display=show?"":"none";if(show)visible++;
  lcDecorateCard(type,card,o)
 });
 const page=document.querySelector(".page"),old=document.querySelector(".lc-filter-empty");if(old)old.remove();
 if(page&&cards.length&&!visible){const empty=document.createElement("article");empty.className="card lc-filter-empty";empty.innerHTML=ic("search-x")+'<strong>Sin resultados</strong><span>Cambia la búsqueda o los filtros de biblioteca.</span>';const bar=document.querySelector(".lc-library-bar");if(bar)bar.insertAdjacentElement("afterend",empty)}
 if(window.lucide)lucide.createIcons()
}
function lcDecorateCard(type,card,o){
 if(!card.querySelector(".lc-card-fav")){
  const b=document.createElement("button");b.className="lc-card-fav "+(o.favorite?"active":"");b.setAttribute("data-lc-favorite",type+":"+o.id);b.innerHTML=ic("star");card.appendChild(b)
 }
 const fav=card.querySelector(".lc-card-fav");fav.classList.toggle("active",!!o.favorite);
 let meta=card.querySelector(".lc-card-meta");if(!meta){meta=document.createElement("div");meta.className="lc-card-meta";const target=card.querySelector(".routine-quick-actions")||card;target.insertAdjacentElement("beforebegin",meta)}
 meta.innerHTML=(o.folder?'<span>'+ic("folder")+' '+lcEsc(o.folder)+'</span>':"")+(o.tags||[]).slice(0,2).map(function(t){return '<span>'+lcEsc(t)+'</span>'}).join("")+(o.archived?'<span class="archived">Archivada</span>':"")
}
function lcToggleFavorite(type,id){const o=lcFind(type,id);if(!o)return;lcEnsureMeta(o);o.favorite=!o.favorite;lcSave();render()}
function lcOpenMeta(type,id){
 const o=lcFind(type,id);if(!o)return;lcEnsureMeta(o);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lc-meta-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Biblioteca</div><h2>Organizar '+(type==="routine"?"rutina":"programa")+'</h2></div><button class="icon-btn" id="lc-close-meta">'+ic("x")+'</button></div><label class="rp-field"><span>Carpeta</span><input id="lc-folder" value="'+lcEsc(o.folder||"")+'" placeholder="Ej. Hipertrofia"></label><label class="rp-field"><span>Etiquetas</span><input id="lc-tags" value="'+lcEsc((o.tags||[]).join(", "))+'" placeholder="Ej. intermedio, 4 días, gimnasio"></label><label class="lc-check"><input id="lc-favorite-check" type="checkbox" '+(o.favorite?"checked":"")+'><span>Marcar como favorita</span></label><button class="primary lc-sheet-save" id="lc-save-meta">Guardar organización</button></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lc-close-meta").onclick=clearRest;document.getElementById("lc-meta-bg").onclick=function(ev){if(ev.target.id==="lc-meta-bg")clearRest()};
 document.getElementById("lc-save-meta").onclick=function(){o.folder=document.getElementById("lc-folder").value.trim();o.tags=document.getElementById("lc-tags").value.split(",").map(function(x){return x.trim()}).filter(Boolean).filter(function(x,i,a){return a.indexOf(x)===i});o.favorite=document.getElementById("lc-favorite-check").checked;lcSave();clearRest();render()}
}
function lcDuplicateRoutineObject(src,suffix){
 const cp=lcClone(src);cp.id="routine-"+Date.now()+"-"+Math.random().toString(36).slice(2,6);cp.name=src.name+(suffix||" · copia");cp.source="Propia";cp.personal=true;cp.editable=true;cp.status="Borrador";cp.version=0;cp.dirty=true;cp.archived=false;cp.archivedAt=null;cp.favorite=false;cp.createdAt=new Date().toISOString();delete cp.preArchiveStatus;return cp
}
function lcDuplicate(type,id){
 const o=lcFind(type,id);if(!o)return;
 if(type==="routine"){
  const cp=lcDuplicateRoutineObject(o," · copia");routineCatalog.push(cp);lcSave();state.routineFilter="personal";state.routineDetail=routineCatalog.length-1;clearRest();render();return
 }
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lc-dup-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Duplicar programa</div><h2>'+lcEsc(o.name)+'</h2></div><button class="icon-btn" id="lc-close-dup">'+ic("x")+'</button></div><div class="lc-dup-options"><button id="lc-dup-linked"><strong>Mantener las mismas rutinas</strong><span>Crea un programa nuevo que referencia las plantillas actuales.</span></button><button id="lc-dup-independent"><strong>Copia totalmente independiente</strong><span>Duplica también las rutinas utilizadas por las fases.</span></button></div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lc-close-dup").onclick=clearRest;document.getElementById("lc-dup-bg").onclick=function(ev){if(ev.target.id==="lc-dup-bg")clearRest()};
 function make(independent){
  const cp=lcClone(o);cp.id="program-"+Date.now();cp.name=o.name+" · copia";cp.status="Borrador";cp.version=0;cp.active=false;cp.archived=false;cp.archivedAt=null;cp.favorite=false;cp.createdAt=new Date().toISOString();delete cp.preArchiveStatus;
  if(independent){
   const map={};(cp.phases||[]).forEach(function(ph){if(!map[ph.routineId]){const src=lcFind("routine",ph.routineId);if(src){const nr=lcDuplicateRoutineObject(src," · "+cp.name);routineCatalog.push(nr);map[ph.routineId]=nr.id}}if(map[ph.routineId])ph.routineId=map[ph.routineId];delete ph.routineVersion})
  }
  lcPrograms().push(cp);lcSave();const st=lcProgramState();st.section="programs";st.programDetail=lcPrograms().length-1;state.routineDetail=null;clearRest();render()
 }
 document.getElementById("lc-dup-linked").onclick=function(){make(false)};document.getElementById("lc-dup-independent").onclick=function(){make(true)}
}
function lcArchive(type,id){
 const o=lcFind(type,id);if(!o)return;const d=lcDependencies(type,o),active=type==="program"?d.active.length:lcAssignmentsActive(d.direct.concat(d.through)).length;
 if(active&&!confirm("Esta plantilla tiene "+active+" asignación"+(active===1?"":"es")+" activa"+(active===1?"":"s")+". Archivarla no interrumpirá esas asignaciones. ¿Continuar?"))return;
 o.archived=true;o.archivedAt=new Date().toISOString();lcSave();lcState.view="archived";lcSaveUI();if(type==="routine")state.routineDetail=null;else lcProgramState().programDetail=null;render()
}
function lcRestore(type,id){const o=lcFind(type,id);if(!o)return;o.archived=false;o.archivedAt=null;lcSave();lcState.view="active";lcSaveUI();render()}
function lcCleanVersionKey(type,id){
 try{const raw=localStorage.getItem("rodas.templateVersions.v1");if(!raw)return;const x=JSON.parse(raw)||{};delete x[type+":"+id];localStorage.setItem("rodas.templateVersions.v1",JSON.stringify(x))}catch(e){}
}
function lcDelete(type,id){
 const o=lcFind(type,id);if(!o||!lcCanDelete(type,o))return;if(!confirm("Esta acción elimina definitivamente el borrador. No se puede deshacer. ¿Continuar?"))return;
 const list=lcModelList(type),i=list.findIndex(function(x){return x.id===id});if(i>=0)list.splice(i,1);lcCleanVersionKey(type,id);lcSave();if(type==="routine")state.routineDetail=null;else lcProgramState().programDetail=null;render()
}
function lcOpenDependencies(type,id){
 const o=lcFind(type,id);if(!o)return;const d=lcDependencies(type,o),rows=[];
 if(type==="routine"){
  d.programs.forEach(function(p){rows.push({icon:"route",title:p.name,sub:"Programa · v"+Number(p.version||0)})});
  d.direct.forEach(function(a){rows.push({icon:"user-round",title:a.traineeName,sub:"Asignación directa · "+(a.status||"active")})});
  d.through.forEach(function(a){rows.push({icon:"users-round",title:a.traineeName,sub:"Asignación mediante programa · "+(a.status||"active")})})
 }else d.direct.forEach(function(a){rows.push({icon:"user-round",title:a.traineeName,sub:"Asignación · "+(a.status||"active")})});
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lc-deps-bg"><div class="sheet lc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Dependencias</div><h2>'+lcEsc(o.name)+'</h2></div><button class="icon-btn" id="lc-close-deps">'+ic("x")+'</button></div><div class="lc-deps-summary">'+ic("network")+' '+rows.length+' referencia'+(rows.length===1?"":"s")+' encontrada'+(rows.length===1?"":"s")+'</div><div class="lc-deps-list">'+(rows.length?rows.map(function(r){return '<div><span>'+ic(r.icon)+'</span><p><strong>'+lcEsc(r.title)+'</strong><small>'+lcEsc(r.sub)+'</small></p></div>'}).join(""):'<div class="lc-no-deps">No hay dependencias. Este borrador podría eliminarse definitivamente si cumple las demás condiciones.</div>')+'</div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lc-close-deps").onclick=clearRest;document.getElementById("lc-deps-bg").onclick=function(ev){if(ev.target.id==="lc-deps-bg")clearRest()}
}
function lcVersionEntries(type,id){
 const store=lcVersions()[type+":"+id]||{};return Object.keys(store).map(function(k){return store[k]}).sort(function(a,b){return Number(b.version)-Number(a.version)})
}
function lcFlatten(v,prefix,out){out=out||{};prefix=prefix||"";if(v==null||typeof v!=="object"){out[prefix]=v;return out}if(Array.isArray(v)){out[prefix+".length"]=v.length;v.forEach(function(x,i){lcFlatten(x,prefix+"["+i+"]",out)});return out}Object.keys(v).sort().forEach(function(k){if(k==="frozenAt"||k==="date")return;lcFlatten(v[k],prefix?(prefix+"."+k):k,out)});return out}
function lcDiffCount(a,b){const x=lcFlatten(a),y=lcFlatten(b),keys={};Object.keys(x).forEach(function(k){keys[k]=1});Object.keys(y).forEach(function(k){keys[k]=1});return Object.keys(keys).filter(function(k){return JSON.stringify(x[k])!==JSON.stringify(y[k])}).length}
function lcSnapshotStats(s){
 if(!s)return "Sin snapshot";
 if(s.type==="routine"){let ex=0,sets=0;(s.days||[]).forEach(function(d){ex+=(d.exercises||[]).length;(d.exercises||[]).forEach(function(e){sets+=(e.sets||[]).length})});return (s.days||[]).length+" entrenamientos · "+ex+" ejercicios · "+sets+" series"}
 return (s.phases||[]).length+" fases · "+Number(s.duration||0)+" semanas · "+Object.keys(s.routines||{}).length+" rutinas"
}
function lcOpenHistory(type,id){
 const o=lcFind(type,id);if(!o)return;const entries=lcVersionEntries(type,id);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lc-history-bg"><div class="sheet lc-scroll-sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Historial de versiones</div><h2>'+lcEsc(o.name)+'</h2></div><button class="icon-btn" id="lc-close-history">'+ic("x")+'</button></div><div class="lc-version-list">'+(entries.length?entries.map(function(e,i){const prev=entries[i+1],diff=prev?lcDiffCount(prev.snapshot,e.snapshot):0;return '<button data-lc-version="'+type+':'+id+':'+e.version+'"><div><strong>v'+e.version+(Number(o.version)===Number(e.version)?" · actual":"")+'</strong><span>'+lcEsc(e.date||"Sin fecha")+'</span></div><p>'+lcEsc(lcSnapshotStats(e.snapshot))+'</p><small>'+(prev?diff+" cambios respecto a v"+prev.version:"Primera versión disponible")+'</small>'+ic("chevron-right")+'</button>'}).join(""):'<div class="lc-no-deps">Aún no hay snapshots de versión disponibles.</div>')+'</div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lc-close-history").onclick=clearRest;document.getElementById("lc-history-bg").onclick=function(ev){if(ev.target.id==="lc-history-bg")clearRest()};
 document.querySelectorAll("[data-lc-version]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcVersion.split(":");lcOpenVersion(p[0],p[1],Number(p[2]))}})
}
function lcOpenVersion(type,id,version){
 const o=lcFind(type,id),entry=(lcVersions()[type+":"+id]||{})[String(version)];if(!o||!entry)return;const current=Number(o.version||0)===Number(version);
 document.getElementById("sheet-root").innerHTML='<div class="sheet-bg" id="lc-version-bg"><div class="sheet"><div class="handle"></div><div class="sheet-set-title"><div><div class="eyebrow">Versión '+version+'</div><h2>'+lcEsc(entry.snapshot&&entry.snapshot.name||o.name)+'</h2></div><button class="icon-btn" id="lc-close-version">'+ic("x")+'</button></div><div class="lc-version-summary"><span>'+ic("calendar")+' '+lcEsc(entry.date||"Sin fecha")+'</span><strong>'+lcEsc(lcSnapshotStats(entry.snapshot))+'</strong></div><div class="lc-version-note">'+ic("lock-keyhole")+' Las versiones publicadas son inmutables. Restaurar crea cambios pendientes sobre la plantilla actual; al publicar se generará una versión nueva.</div><div class="lc-version-actions"><button class="secondary" id="lc-back-history">'+ic("arrow-left")+' Historial</button>'+(!current?'<button class="primary" id="lc-restore-version">'+ic("history")+' Restaurar contenido</button>':"")+'</div></div></div>';
 if(window.lucide)lucide.createIcons();document.getElementById("lc-close-version").onclick=clearRest;document.getElementById("lc-version-bg").onclick=function(ev){if(ev.target.id==="lc-version-bg")clearRest()};document.getElementById("lc-back-history").onclick=function(){lcOpenHistory(type,id)};
 const restore=document.getElementById("lc-restore-version");if(restore)restore.onclick=function(){lcRestoreVersion(type,o,entry.snapshot);clearRest();render()}
}
function lcRestoreVersion(type,o,snap){
 if(!snap)return;
 if(type==="routine"){
  o.name=snap.name||o.name;o.days=lcClone(snap.days||[]);o.exercises=o.days.length?o.days[0].exercises:[];o.dirty=true;if(Number(o.version||0)===0)o.status="Borrador";else o.status="Publicado"
 }else{
  o.name=snap.name||o.name;o.duration=Number(snap.duration||o.duration);o.phases=lcClone(snap.phases||[]);o.status="Borrador"
 }
 o.restoredFromVersion=Number(snap.version||0);lcSave()
}
function lcBindControls(){
 const st=lcProgramState(),type=st.section==="programs"?"program":"routine";
 const search=document.getElementById("lc-search");if(search)search.oninput=function(){lcState.query=search.value;lcSaveUI();lcApplyListFilters(type)};
 const folder=document.getElementById("lc-folder-filter");if(folder)folder.onchange=function(){lcState.folder=folder.value;lcSaveUI();lcApplyListFilters(type)};
 document.querySelectorAll("[data-lc-view]").forEach(function(b){b.onclick=function(){lcState.view=b.dataset.lcView;lcSaveUI();render()}});
 document.querySelectorAll("[data-lc-favorite]").forEach(function(b){b.onclick=function(ev){ev.stopPropagation();const p=b.dataset.lcFavorite.split(":");lcToggleFavorite(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-edit-meta]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcEditMeta.split(":");lcOpenMeta(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-duplicate]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcDuplicate.split(":");lcDuplicate(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-archive]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcArchive.split(":");lcArchive(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-restore]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcRestore.split(":");lcRestore(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-delete]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcDelete.split(":");lcDelete(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-deps]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcDeps.split(":");lcOpenDependencies(p[0],p.slice(1).join(":"))}});
 document.querySelectorAll("[data-lc-history]").forEach(function(b){b.onclick=function(){const p=b.dataset.lcHistory.split(":");lcOpenHistory(p[0],p.slice(1).join(":"))}});
 if(document.querySelector(".lc-library-bar"))lcApplyListFilters(type);
 const detailObj=state.routineDetail!==null?routineCatalog[state.routineDetail]:(st.programDetail!==null?lcPrograms()[st.programDetail]:null);
 if(detailObj&&detailObj.archived)document.querySelectorAll("[data-ac-assign]").forEach(function(b){b.disabled=true;b.title="Restaura la plantilla para crear nuevas asignaciones"})
}
lcLoadUI();routineCatalog.forEach(lcEnsureMeta);lcPrograms().forEach(lcEnsureMeta);lcSave();

const lcPrevRoutineDetailView=routineDetailView;
routineDetailView=function(index){return lcInsertBeforeEnd(lcPrevRoutineDetailView(index),lcDetailSection("routine",routineCatalog[index]))};

const lcPrevRoutines=routines;
routines=function(){
 let html=lcPrevRoutines(),st=lcProgramState();
 if(state.routineDetail===null&&st.programDetail===null)html=lcInjectList(html,st.section==="programs"?"program":"routine");
 if(st.programDetail!==null&&html.indexOf("rp-program-detail")>=0){const p=lcPrograms()[st.programDetail];if(p)html=lcInjectProgramDetail(html,p)}
 return html
};

const lcPrevEvents=events;
events=function(){lcPrevEvents();lcBindControls()};

window.RodasLibraryLifecycle={dependencies:lcDependencies,openHistory:lcOpenHistory,archive:lcArchive,restore:lcRestore,duplicate:lcDuplicate,editMeta:lcOpenMeta};
render();
})();