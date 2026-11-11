/* =====================================================================
   c.b book - BIBLIOTECA, ARQUIVOS PESSOAIS (PDF/EPUB) E INDICAÇÕES
   Carregado depois do app.js e do horas.js. Para desligar, tire as linhas
   <script src="catalogo.js"> e <script src="biblioteca.js"> do index.html.

   - Biblioteca: catálogo do catalogo.js, igual para todos, com capas.
   - Arquivos: o PDF/EPUB que a pessoa envia fica guardado SÓ no aparelho dela
     (IndexedDB). Nada vai para servidor.
   - Compartilhar: só livro (título + capa + nota) ou arquivo que a pessoa
     declara ser de domínio público ou de sua autoria.
   ===================================================================== */

var BIB_MAX_MB = 150;
var BIB_SEL = 'background:#0d1b33;color:var(--text-main);border:1px solid var(--border-color);padding:10px;border-radius:10px;width:100%;margin-top:6px';
var BIB_CAPAS_KEY = 'cbbook_capas_v1';
var bibFilter = {q: '', tag: ''};
var bibTagList = [];
var bibPending = null;       // arquivo escolhido no envio
var bibTarget = null;        // id do livro que vai receber o arquivo (ou null = livro novo)
var bibAddId = null;         // item do catálogo que está sendo adicionado

/* ---------- utilidades ---------- */
function bibCat(){ return (typeof CATALOGO !== 'undefined' && CATALOGO) ? CATALOGO : []; }
function bibItem(id){ return bibCat().find(function(x){ return x.id === id; }); }
function bibBook(id){ return (state.books || []).find(function(b){ return b.id === id; }); }
function bibSlug(s){ return normTitle(s).replace(/ /g, '-').slice(0, 60) || ('livro-' + Date.now()); }
function bibSize(n){ return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
function bibInit(){ if(typeof hrInit === 'function') hrInit(); }
function bibTemaOpts(sel){
  if(typeof hrTemaOptions === 'function'){ bibInit(); return hrTemaOptions(sel || ''); }
  return '<option value="">—</option>';
}
function bibOnShelf(item){
  var n = normTitle(item.t);
  return (state.books || []).some(function(b){ return b.fromCatalog === item.id || normTitle(b.title) === n; });
}
function bibCor(item){
  var cores = ['#2EE6C8', '#4F6BFF', '#9BE7FF', '#25B4FF', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'];
  var h = 0, s = item.id || item.t;
  for(var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return item.cor || cores[h % cores.length];
}
function bibCapaCache(){ try{ return JSON.parse(localStorage.getItem(BIB_CAPAS_KEY) || '{}'); }catch(e){ return {}; } }
function bibCapaSave(c){ try{ localStorage.setItem(BIB_CAPAS_KEY, JSON.stringify(c)); }catch(e){} }

/* ---------- capas: a do catálogo ou a da Open Library (guardada depois da primeira busca) ---------- */
function bibCapa(item){
  if(item.cover) return Promise.resolve(item.cover);
  var cache = bibCapaCache();
  if(cache[item.id] !== undefined) return Promise.resolve(cache[item.id]);
  var url = 'https://openlibrary.org/search.json?limit=1&fields=cover_i&title=' + encodeURIComponent(item.busca || item.t) +
            (item.a ? '&author=' + encodeURIComponent(item.a) : '');
  return fetch(url).then(function(r){ return r.json(); }).then(function(j){
    var c = j && j.docs && j.docs[0] && j.docs[0].cover_i;
    var u = c ? 'https://covers.openlibrary.org/b/id/' + c + '-M.jpg' : '';
    var cc = bibCapaCache(); cc[item.id] = u; bibCapaSave(cc);
    return u;
  }).catch(function(){ return ''; });   // sem internet: não guarda, tenta de novo depois
}

function bibApplyCover(elId, u){
  if(!u) return;
  var img = new Image();     // só troca a letra pela capa se a imagem carregar de verdade
  img.onload = function(){
    var el = document.getElementById(elId);
    if(el){
      el.style.backgroundImage = 'url(' + coverUrl(u) + ')';
      var l = el.querySelector('.cv-l'); if(l) l.remove();   // tira só a letra, mantém a faixa LIDO
    }
  };
  img.src = u;
}

function bibLoadCovers(){
  bibCat().forEach(function(item){
    bibCapa(item).then(function(u){ bibApplyCover('bib-cv-' + item.id, u); });
  });
}

/* capas da estante: a que a pessoa cadastrou, ou a do catálogo / Open Library */
function bibLoadShelfCovers(){
  (state.books || []).forEach(function(b){
    var elId = 'shelf-cv-' + b.id;
    if(b.cover){ bibApplyCover(elId, b.cover); return; }
    var n = normTitle(b.title);
    var cat = bibCat().find(function(x){ return x.id === b.fromCatalog || normTitle(x.t) === n; });
    if(!cat && b.file) return;        // livro pessoal enviado em arquivo: não consulta serviço externo
    var item = cat || {id: 'b' + b.id, t: b.title, a: b.author && b.author !== 'Desconhecido' ? b.author : ''};
    bibCapa(item).then(function(u){ bibApplyCover(elId, u); });
  });
}

/* ---------- banco de arquivos no aparelho (IndexedDB) ---------- */
function bibDB(){
  return new Promise(function(res, rej){
    if(!window.indexedDB){ rej(new Error('Este navegador não guarda arquivos.')); return; }
    var r = indexedDB.open('cbbook-files', 1);
    r.onupgradeneeded = function(){ r.result.createObjectStore('files'); };
    r.onsuccess = function(){ res(r.result); };
    r.onerror = function(){ rej(r.error); };
  });
}
function bibTx(mode, fn){
  return bibDB().then(function(db){
    return new Promise(function(res, rej){
      var tx = db.transaction('files', mode), out = fn(tx.objectStore('files'));
      tx.oncomplete = function(){ res(out && out.result); };
      tx.onerror = tx.onabort = function(){ rej(tx.error || new Error('Falha ao guardar o arquivo.')); };
    });
  });
}
function bibPut(key, blob){ return bibTx('readwrite', function(s){ return s.put(blob, key); }); }
function bibGet(key){ return bibTx('readonly', function(s){ return s.get(key); }); }
function bibDel(key){ return bibTx('readwrite', function(s){ return s.delete(key); }); }

/* ---------- contagem de páginas do PDF ---------- */
function bibLoadPdfJs(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise(function(res, rej){
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = function(){
      try{ window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(window.pdfjsLib); }
      catch(e){ rej(e); }
    };
    s.onerror = function(){ rej(new Error('pdf.js indisponível')); };
    document.head.appendChild(s);
  });
}

function bibCountHeuristic(file){
  if(file.size > 80 * 1048576) return Promise.resolve(0);
  return new Promise(function(res){
    var fr = new FileReader();
    fr.onload = function(){
      var t = fr.result || '', n = (t.match(/\/Type\s*\/Page[^s]/g) || []).length;
      if(!n){
        var m = t.match(/\/Count\s+(\d+)/g) || [];
        m.forEach(function(x){ var v = parseInt(x.replace(/\D/g, '')); if(v > n) n = v; });
      }
      res(n);
    };
    fr.onerror = function(){ res(0); };
    fr.readAsBinaryString(file);
  });
}

function bibCountPdf(file){
  return new Promise(function(resolve){
    var done = false;
    function fin(n){ if(!done){ done = true; resolve(n || 0); } }
    function fallback(){ bibCountHeuristic(file).then(fin); }
    var t = setTimeout(fallback, 10000);
    bibLoadPdfJs().then(function(lib){
      return file.arrayBuffer().then(function(buf){ return lib.getDocument({data: buf}).promise; });
    }).then(function(doc){ clearTimeout(t); fin(doc.numPages); })
      .catch(function(){ clearTimeout(t); fallback(); });
  });
}

/* ---------- painéis (sheets) ---------- */
function bibSheet(){
  var s = document.getElementById('bib-sheet');
  if(!s){
    s = document.createElement('div');
    s.className = 'sheet';
    s.id = 'bib-sheet';
    s.style.cssText = 'max-height:90vh;overflow-y:auto;-webkit-overflow-scrolling:touch';
    (document.getElementById('app') || document.body).appendChild(s);
  }
  return s;
}
function bibShowSheet(html){
  var el = bibSheet();
  el.innerHTML = html;
  document.getElementById('scrim').classList.add('act');
  el.classList.add('act');
}
function bibHead(title){
  return '<div style="display:flex;justify-content:space-between;align-items:center"><span class="sf" style="font-size:18px">' + title + '</span>' +
         '<button class="ib" onclick="closeSheets()" aria-label="Fechar"><i class="ti ti-x"></i></button></div>';
}

/* ---------- abas Minha estante / Biblioteca ---------- */
function bibEnsureUI(){
  var v = document.getElementById('v-leitura');
  if(!v || document.getElementById('bib-switch')) return;
  var list = document.getElementById('books-list');
  var sw = document.createElement('div');
  sw.id = 'bib-switch';
  sw.style.cssText = 'display:flex;gap:8px;padding:0 20px;margin-top:6px';
  sw.innerHTML = '<button class="ch sel" id="bib-b-estante" onclick="bibView(\'estante\')">📚 Minha estante</button>' +
                 '<button class="ch" id="bib-b-bib" onclick="bibView(\'bib\')">🏛️ Biblioteca</button>';
  v.insertBefore(sw, list);
  var box = document.createElement('div');
  box.id = 'bib-box';
  box.style.display = 'none';
  v.appendChild(box);
}

function bibView(w){
  bibEnsureUI();
  var list = document.getElementById('books-list'), box = document.getElementById('bib-box');
  var onBib = w === 'bib';
  list.style.display = onBib ? 'none' : '';
  box.style.display = onBib ? '' : 'none';
  document.getElementById('bib-b-estante').classList.toggle('sel', !onBib);
  document.getElementById('bib-b-bib').classList.toggle('sel', onBib);
  if(onBib){ bibRender(); bibLoadCovers(); }
}

/* ---------- Biblioteca ---------- */
function bibRender(){
  var box = document.getElementById('bib-box');
  if(!box) return;
  bibTagList = [];
  bibCat().forEach(function(i){ (i.tags || []).forEach(function(t){ if(bibTagList.indexOf(t) < 0) bibTagList.push(t); }); });
  box.innerHTML =
    '<div style="padding:12px 16px 0">' +
      '<button class="pb" style="margin:0" onclick="bibOpenFile(null)">📎 Enviar meu PDF ou EPUB</button>' +
      '<div class="mut" style="font-size:11px;margin-top:6px">O arquivo fica guardado só neste aparelho, e ninguém mais vê.</div>' +
      '<input class="ip" id="bib-q" placeholder="Buscar título ou autor" oninput="bibSearch(this.value)" style="margin:12px 0 0" value="' + esc(bibFilter.q) + '">' +
      '<div id="bib-chips" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"></div>' +
    '</div>' +
    '<div id="bib-grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px 16px 0"></div>' +
    '<div style="padding:18px 16px 0;text-align:center"><button class="ob" style="margin:0;width:auto;padding:8px 14px;font-size:12px" onclick="bibOpenExport()">🛠️ Dono do app: copiar minha estante como catálogo</button></div>';
  bibRenderChips();
  bibRenderGrid();
}

function bibSearch(v){ bibFilter.q = v; bibRenderGrid(); bibLoadCovers(); }
function bibTag(i){ bibFilter.tag = (i < 0 || bibFilter.tag === bibTagList[i]) ? '' : bibTagList[i]; bibRenderChips(); bibRenderGrid(); bibLoadCovers(); }

function bibRenderChips(){
  var el = document.getElementById('bib-chips');
  if(!el) return;
  var h = '<button class="ch' + (bibFilter.tag === '' ? ' sel' : '') + '" style="padding:5px 12px;font-size:12px" onclick="bibTag(-1)">Todos</button>';
  bibTagList.forEach(function(t, i){
    h += '<button class="ch' + (bibFilter.tag === t ? ' sel' : '') + '" style="padding:5px 12px;font-size:12px" onclick="bibTag(' + i + ')">' + esc(t) + '</button>';
  });
  el.innerHTML = h;
}

function bibRenderGrid(){
  var el = document.getElementById('bib-grid');
  if(!el) return;
  var q = normTitle(bibFilter.q);
  var items = bibCat().filter(function(i){
    if(bibFilter.tag && (i.tags || []).indexOf(bibFilter.tag) < 0) return false;
    return !q || normTitle(i.t + ' ' + (i.a || '')).indexOf(q) >= 0;
  });
  if(!items.length){
    el.innerHTML = '<div class="mut" style="grid-column:1/-1;text-align:center;padding:20px 0">Nenhum livro encontrado.</div>';
    return;
  }
  el.innerHTML = items.map(function(i){
    var shelf = bibOnShelf(i), prova = !!provaFor({title: i.t});
    return '<div class="card" style="margin:0;padding:10px;display:flex;flex-direction:column;min-width:0">' +
      '<div id="bib-cv-' + i.id + '" style="aspect-ratio:2/3;border-radius:8px;background:linear-gradient(135deg,' + bibCor(i) + ',#0d1b33);background-size:cover;background-position:center;' +
        'display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;color:rgba(255,255,255,.85)"><span class="cv-l">' + esc(i.t.charAt(0)) + '</span></div>' +
      '<div style="font-size:13px;font-weight:700;margin-top:8px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(i.t) + '</div>' +
      '<div class="mut" style="font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (i.a ? esc(i.a) : '&nbsp;') + '</div>' +
      '<div style="font-size:10px;margin-top:6px;line-height:1.5;color:var(--text-muted)">' + (i.dominio ? '🌐 Domínio público (original)' : '© Obra protegida') + (prova ? '<br>📝 Tem prova' : '') + '</div>' +
      '<div style="margin-top:auto;padding-top:8px;display:flex;gap:6px">' +
        (shelf ? '<button class="ob" style="margin:0;flex:1;padding:7px 4px;font-size:12px" disabled>✔ Na estante</button>'
               : '<button class="pb" style="margin:0;flex:1;padding:7px 4px;font-size:12px" onclick="bibOpenAdd(\'' + i.id + '\')">+ Estante</button>') +
        '<button class="ob" style="margin:0;flex:0 0 38px;padding:0" onclick="bibIndicarItem(\'' + i.id + '\')" aria-label="Indicar a um amigo">📤</button>' +
      '</div></div>';
  }).join('');
}

/* ---------- adicionar da Biblioteca à estante ---------- */
function bibOpenAdd(id){
  bibInit();
  var it = bibItem(id);
  if(!it) return;
  bibAddId = id;
  bibShowSheet(bibHead('Adicionar à estante') +
    '<div class="t" style="margin-top:10px">' + esc(it.t) + '</div><div class="mut">' + esc(it.a || '') + '</div>' +
    '<div class="mut" style="margin-top:12px">Total de páginas da sua edição</div>' +
    '<input class="ip" id="ba-total" type="number" min="1" placeholder="Ex.: 320" value="' + (it.pag || '') + '" style="margin-top:6px">' +
    '<div class="mut" style="margin-top:8px">Páginas que você já leu antes (opcional)</div>' +
    '<input class="ip" id="ba-read" type="number" min="0" value="0" style="margin-top:6px">' +
    '<div class="mut" style="font-size:11px;margin-top:4px">Páginas lidas antes de cadastrar não contam para a evolução da nau.</div>' +
    '<div class="mut" style="margin-top:8px">Demanda</div>' +
    '<select id="ba-tema" onchange="hrNewTema(this)" style="' + BIB_SEL + '">' + bibTemaOpts(it.tema) + '</select>' +
    '<button class="pb" style="margin-top:18px" onclick="bibConfirmAdd()">Adicionar à estante</button>');
}

function bibConfirmAdd(){
  var it = bibItem(bibAddId);
  if(!it) return;
  var total = parseInt(document.getElementById('ba-total').value) || 0;
  if(total < 1){ toast('Informe o total de páginas da sua edição'); return; }
  var read = Math.max(0, Math.min(total, parseInt(document.getElementById('ba-read').value) || 0));
  var tema = document.getElementById('ba-tema').value;
  if(tema === '__new__') tema = '';
  if(bibOnShelf(it)){ toast('Este livro já está na sua estante'); closeSheets(); return; }
  var cap = it.cover || bibCapaCache()[it.id] || '';
  if(!state.books) state.books = [];
  var b = {id: Date.now(), title: it.t, author: it.a || 'Desconhecido', pages: read, total: total, cover: cap, notes: '', start: read, fromCatalog: it.id};
  if(tema) b.tema = tema;
  state.books.push(b);
  recalculateTotalPages();
  save();
  renderBooks();
  updateUI();
  updateActiveBookDisplay();
  closeSheets();
  bibRenderGrid(); bibLoadCovers();
  toast('📚 Adicionado à sua estante');
}

/* ---------- enviar PDF / EPUB (fica só neste aparelho) ---------- */
function bibOpenFile(bookId){
  bibInit();
  bibPending = null;
  bibTarget = bookId === undefined ? null : bookId;
  var b = bibTarget ? bibBook(bibTarget) : null;
  var h = bibHead(b ? 'Anexar arquivo' : 'Enviar meu livro');
  if(b) h += '<div class="t" style="margin-top:10px">' + esc(b.title) + '</div>';
  h += '<div class="mut" style="margin-top:12px">Escolha o arquivo (PDF ou EPUB, até ' + BIB_MAX_MB + ' MB)</div>' +
       '<input class="ip" id="bf-file" type="file" accept=".pdf,.epub,application/pdf,application/epub+zip" onchange="bibFilePicked(this)" style="margin-top:6px">' +
       '<div class="mut" id="bf-info" style="font-size:12px;margin-top:6px"></div>';
  if(!b){
    h += '<input class="ip" id="bf-title" placeholder="Título do livro" style="margin-top:10px">' +
         '<input class="ip" id="bf-author" placeholder="Autor (opcional)">' +
         '<div class="mut" style="margin-top:6px">Total de páginas</div>' +
         '<input class="ip" id="bf-pages" type="number" min="1" placeholder="Total de páginas" style="margin-top:6px">' +
         '<div class="mut" style="margin-top:8px">Demanda</div>' +
         '<select id="bf-tema" onchange="hrNewTema(this)" style="' + BIB_SEL + '">' + bibTemaOpts('') + '</select>';
  }
  h += '<label style="display:flex;gap:10px;align-items:flex-start;margin-top:14px;font-size:12px;line-height:1.45;color:var(--text-muted)">' +
         '<input type="checkbox" id="bf-pd" style="margin-top:2px;flex:0 0 auto"' + (b && b.file && b.file.pd ? ' checked' : '') + '>' +
         '<span>Este arquivo é de <b>domínio público</b> ou de <b>minha autoria</b>. (Só assim posso compartilhá-lo com outras pessoas. Sem marcar, ele fica só para mim.)</span></label>' +
       '<button class="pb" style="margin-top:16px" onclick="bibSaveFile()">Guardar no aparelho</button>';
  bibShowSheet(h);
}

function bibFilePicked(input){
  var f = input.files && input.files[0];
  var info = document.getElementById('bf-info');
  bibPending = null;
  if(!f) return;
  var ext = (f.name.split('.').pop() || '').toLowerCase();
  if(ext !== 'pdf' && ext !== 'epub'){ info.textContent = 'Só aceito PDF ou EPUB.'; input.value = ''; return; }
  if(f.size > BIB_MAX_MB * 1048576){ info.textContent = 'Arquivo grande demais (' + bibSize(f.size) + '). O limite é ' + BIB_MAX_MB + ' MB.'; input.value = ''; return; }
  bibPending = {file: f, ext: ext};
  info.textContent = '📎 ' + f.name + ' · ' + bibSize(f.size);
  var t = document.getElementById('bf-title');
  if(t && !t.value) t.value = f.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  var p = document.getElementById('bf-pages');
  if(p && ext === 'pdf'){
    p.value = ''; p.placeholder = 'contando páginas…';
    bibCountPdf(f).then(function(n){
      var cur = document.getElementById('bf-pages');
      if(!cur || !bibPending || bibPending.file !== f) return;
      if(n > 0) cur.value = n;
      cur.placeholder = n > 0 ? 'Total de páginas' : 'Não consegui contar: informe o total';
    });
  } else if(p){ p.placeholder = 'EPUB não tem páginas fixas: informe o total da sua edição'; }
}

function bibSaveFile(){
  if(!bibPending){ toast('Escolha um arquivo'); return; }
  var f = bibPending.file, ext = bibPending.ext;
  var pd = !!document.getElementById('bf-pd').checked;
  var existing = bibTarget ? bibBook(bibTarget) : null;
  var title, author, pages, tema;
  if(!existing){
    title = document.getElementById('bf-title').value.trim();
    author = document.getElementById('bf-author').value.trim();
    pages = parseInt(document.getElementById('bf-pages').value) || 0;
    tema = document.getElementById('bf-tema').value;
    if(tema === '__new__') tema = '';
    if(!title){ toast('Digite o título'); return; }
    if(pages < 1){ toast('Informe o total de páginas'); return; }
  }
  var id = existing ? existing.id : Date.now();
  var key = 'f' + id;
  var type = ext === 'pdf' ? 'application/pdf' : 'application/epub+zip';
  var blob = f.slice(0, f.size, type);
  bibPut(key, blob).then(function(){
    var meta = {key: key, name: f.name, type: type, ext: ext, size: f.size, pd: pd};
    if(existing){ existing.file = meta; }
    else {
      var nb = {id: id, title: title, author: author || 'Desconhecido', pages: 0, total: pages, cover: '', notes: '', start: 0, file: meta};
      if(tema) nb.tema = tema;
      state.books = state.books || [];
      state.books.push(nb);
    }
    recalculateTotalPages();
    save();
    renderBooks();
    updateUI();
    updateActiveBookDisplay();
    closeSheets();
    toast('📎 Guardado neste aparelho');
    try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){}
  }).catch(function(err){
    toast('Não foi possível guardar: ' + (err && err.message ? err.message : 'sem espaço no aparelho'));
  });
}

function bibDownload(blob, name){
  var url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 60000);
}

function bibOpenBookFile(bookId){
  var b = bibBook(bookId);
  if(!b || !b.file) return;
  bibGet(b.file.key).then(function(blob){
    if(!blob){ toast('O arquivo não está mais neste aparelho. Anexe de novo.'); return; }
    if(b.file.ext === 'pdf'){
      var url = URL.createObjectURL(blob);
      var w = window.open(url, '_blank');
      if(!w) bibDownload(blob, b.file.name);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 120000);
    } else {
      bibDownload(blob, b.file.name);
      toast('EPUB baixado. Abra no seu leitor de e-books.');
    }
  }).catch(function(){ toast('Não consegui abrir o arquivo.'); });
}

function bibRemoveFile(bookId){
  var b = bibBook(bookId);
  if(!b || !b.file) return;
  if(!confirm('Remover o arquivo deste aparelho? O livro continua na estante.')) return;
  bibDel(b.file.key).catch(function(){}).then(function(){
    delete b.file;
    save();
    renderBooks();
    toast('Arquivo removido');
  });
}

/* ---------- compartilhar ---------- */
function bibShareText(title, author, nota){
  var url = location.origin && location.origin !== 'null' ? location.origin + location.pathname : '';
  return '📚 Indico "' + title + '"' + (author && author !== 'Desconhecido' ? ' de ' + author : '') + ' no c.b book.' + (nota ? '\n"' + nota + '"' : '') + (url ? '\n' + url : '');
}

function bibSendText(title, text){
  if(navigator.share){
    navigator.share({title: title, text: text}).catch(function(){});
  } else if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ toast('Texto copiado. Cole no WhatsApp ou onde quiser.'); }, function(){ prompt('Copie o texto:', text); });
  } else { prompt('Copie o texto:', text); }
}

function bibIndicarItem(id){
  var it = bibItem(id);
  if(!it) return;
  var nota = (prompt('Quer deixar um recado junto? (opcional)') || '').trim();
  bibSendText(it.t, bibShareText(it.t, it.a, nota));
}
function bibIndicarBook(bookId){
  var b = bibBook(bookId);
  if(!b) return;
  var nota = (prompt('Quer deixar um recado junto? (opcional)') || '').trim();
  bibSendText(b.title, bibShareText(b.title, b.author, nota));
}

function bibShareFile(bookId){
  var b = bibBook(bookId);
  if(!b || !b.file) return;
  if(!b.file.pd){
    if(!confirm('Compartilhar arquivo só é permitido se ele for de DOMÍNIO PÚBLICO ou de SUA AUTORIA.\n\nEste arquivo é um desses casos?')) return;
    b.file.pd = true; save(); renderBooks();
  } else if(!confirm('Lembrete: envie apenas obras de domínio público ou de sua autoria. Continuar?')) return;
  bibGet(b.file.key).then(function(blob){
    if(!blob){ toast('O arquivo não está mais neste aparelho.'); return; }
    var file = new File([blob], b.file.name, {type: b.file.type});
    if(navigator.canShare && navigator.canShare({files: [file]})){
      navigator.share({files: [file], title: b.title}).catch(function(){});
    } else {
      bibDownload(blob, b.file.name);
      toast('Arquivo baixado. Envie pelo WhatsApp, e-mail ou Bluetooth.');
    }
  });
}

/* ---------- ESTANTE: mesma grade de capas da Biblioteca ---------- */
(function(){
  var st = document.createElement('style');
  st.textContent = '#books-list.bib-shelf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px 16px 0}';
  document.head.appendChild(st);
})();

function bibShelfCard(b){
  var total = b.total || 0, pages = b.pages || 0;
  var pct = total ? Math.min(100, Math.round(pages / total * 100)) : 0;
  var done = total > 0 && pages >= total;
  var p = provaFor(b), ex = p && state.exams && state.exams[p.id];
  var ri = resumoIndex(b.id), rw = ri >= 0 ? chapterWords(state.ch[ri]) : 0;
  var primary, items = [];

  /* botão principal, embaixo da capa */
  if(!done){
    primary = '<button class="pb" style="margin:0;padding:8px 2px;font-size:13px;white-space:nowrap" onclick="openSheetForBook(' + b.id + ')">+ Lançar páginas</button>';
  } else if(p && ex && ex.passed){
    primary = '<button class="ob" style="margin:0;padding:8px 2px;font-size:12px;width:100%;white-space:nowrap;border-color:rgba(34,197,94,.6);color:#22c55e" onclick="openExam(' + b.id + ')">🏅 ' + ex.best + '/' + p.q.length + ' · refazer</button>';
  } else if(p){
    primary = '<button class="pb" style="margin:0;padding:8px 4px;font-size:13px" onclick="openExam(' + b.id + ')">📝 Fazer a prova</button>';
  } else if(ri < 0){
    primary = '<button class="pb" style="margin:0;padding:8px 4px;font-size:13px" onclick="openResumo(' + b.id + ')">✍️ Escrever resumo</button>';
  } else {
    primary = '<button class="ob" style="margin:0;padding:8px 4px;font-size:12px;width:100%" disabled>✔ Concluído</button>';
  }

  /* demais opções, em duas colunas */
  items.push(['📝 Notas', 'openNotesModal(' + b.id + ')']);
  items.push(['✏️ Editar', 'openBookModal(' + b.id + ')']);
  if(b.file){
    items.push([b.file.ext === 'pdf' ? '📖 Abrir' : '⬇ Baixar', 'bibOpenBookFile(' + b.id + ')']);
    items.push(['🔁 Enviar', 'bibShareFile(' + b.id + ')']);
  } else {
    items.push(['📎 Arquivo', 'bibOpenFile(' + b.id + ')']);
  }
  items.push(['📤 Indicar', 'bibIndicarBook(' + b.id + ')']);
  if(p && !done) items.push(['🔒 Prova', 'openExam(' + b.id + ')']);
  if(done && (p || ri >= 0)){
    var rl = ri < 0 ? '✍️ Resumo' : (rw >= RESUMO_MIN ? '✍️ Resumo ✔' : '✍️ Rascunho');
    items.push([rl, 'openResumo(' + b.id + ')']);
  }
  var grid = items.map(function(it, i){
    var span = (i === items.length - 1 && items.length % 2 === 1) ? 'grid-column:1/-1;' : '';
    return '<button class="ob" style="margin:0;padding:7px 2px;font-size:11.5px;width:100%;white-space:nowrap;' + span + '" onclick="' + it[1] + '">' + it[0] + '</button>';
  }).join('');

  var tema = b.tema ? '<span style="color:' + (typeof hrTemaCor === 'function' ? hrTemaCor(b.tema) : 'var(--blue-primary)') + '">●</span> ' + esc(b.tema) : '';
  var fileChip = b.file
    ? '<div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:4px;font-size:10px;color:var(--text-muted)">' +
        '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📎 ' + esc(b.file.ext.toUpperCase()) + ' · ' + bibSize(b.file.size) + ' · só aqui</span>' +
        '<button class="ib" onclick="bibRemoveFile(' + b.id + ')" aria-label="Remover arquivo" style="flex:0 0 auto;width:24px;height:24px;padding:0"><i class="ti ti-trash"></i></button></div>'
    : '';

  return '<div class="card" style="margin:0;padding:10px;display:flex;flex-direction:column;min-width:0">' +
    '<div id="shelf-cv-' + b.id + '" style="position:relative;aspect-ratio:2/3;border-radius:8px;background:linear-gradient(135deg,' + bibCor({id: 'b' + b.id, t: b.title}) + ',#0d1b33);background-size:cover;background-position:center;' +
      'display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;color:rgba(255,255,255,.85)"><span class="cv-l">' + esc((b.title || '?').charAt(0)) + '</span>' +
      (done ? '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(234,179,8,.92);color:#060e1e;font-size:10px;font-weight:800;text-align:center;padding:2px 0;letter-spacing:.05em;border-radius:0 0 8px 8px">LIDO</div>' : '') +
    '</div>' +
    '<div style="font-size:13px;font-weight:700;margin-top:8px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(b.title) + '</div>' +
    '<div class="mut" style="font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (b.author ? esc(b.author) : '&nbsp;') + '</div>' +
    '<div style="height:5px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:8px"><div style="height:5px;border-radius:4px;width:' + pct + '%;background:' + (done ? '#eab308' : 'var(--blue-primary)') + '"></div></div>' +
    '<div class="mut" style="font-size:11px;margin-top:4px">' + pages + ' / ' + total + ' pág · ' + pct + '%</div>' +
    (tema ? '<div style="font-size:10px;margin-top:4px;color:var(--text-muted)">' + tema + '</div>' : '') + fileChip +
    '<div style="margin-top:auto;padding-top:10px"><div style="display:flex;margin-bottom:6px">' + primary + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' + grid + '</div></div>' +
  '</div>';
}

renderBooks = function(){
  var el = document.getElementById('books-list');
  if(!el) return;
  el.classList.add('bib-shelf');
  if(!state.books || state.books.length === 0){
    el.innerHTML = '<div class="card" style="grid-column:1/-1;margin:0;text-align:center"><div class="mut">Sua estante está vazia.<br>Toque em <b>Biblioteca</b> para escolher um livro, em <b>Novo Livro</b> ou envie seu PDF.</div></div>';
    return;
  }
  try{
    el.innerHTML = state.books.map(bibShelfCard).join('');
    bibLoadShelfCovers();
  }catch(err){ cbShowError('biblioteca/estante: ' + err.message); }
};

/* ---------- dono do app: exportar a estante como catálogo ---------- */
function bibOpenExport(){
  var books = state.books || [];
  if(!books.length){ toast('Sua estante está vazia.'); return; }
  var lines = books.map(function(b){
    var tags = [];
    var cat = bibCat().find(function(x){ return normTitle(x.t) === normTitle(b.title); });
    if(cat) tags = cat.tags || [];
    return '  {id:' + JSON.stringify(bibSlug(b.title)) + ', t:' + JSON.stringify(b.title) + ', a:' + JSON.stringify(b.author && b.author !== 'Desconhecido' ? b.author : '') +
           ', tags:' + JSON.stringify(tags) + ', tema:' + JSON.stringify(b.tema || '') + ', dominio:false, pag:' + (b.total || 'null') + ', cover:' + JSON.stringify(b.cover || '') + '},';
  }).join('\n');
  bibShowSheet(bibHead('Minha estante como catálogo') +
    '<div class="mut" style="font-size:12px;margin-top:10px;line-height:1.5">Copie as linhas abaixo e cole dentro da lista <b>CATALOGO</b> do arquivo <b>catalogo.js</b> (antes do <code>];</code>). Troque <code>dominio:false</code> por <code>true</code> nos clássicos em domínio público. Livros repetidos, apague as duplicatas.</div>' +
    '<textarea class="ip" id="bx-text" readonly style="min-height:180px;margin-top:10px;font-family:monospace;font-size:11px;white-space:pre">' + esc(lines) + '</textarea>' +
    '<button class="pb" style="margin-top:12px" onclick="bibCopyExport()">Copiar</button>');
}
function bibCopyExport(){
  var ta = document.getElementById('bx-text');
  if(!ta) return;
  ta.select();
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(ta.value).then(function(){ toast('Copiado!'); }, function(){ try{ document.execCommand('copy'); toast('Copiado!'); }catch(e){} });
  } else { try{ document.execCommand('copy'); toast('Copiado!'); }catch(e){} }
}

/* ---------- ligação com o app ---------- */
var _bibCloseSheetsBase = closeSheets;
closeSheets = function(){
  _bibCloseSheetsBase();
  var s = document.getElementById('bib-sheet');
  if(s) s.classList.remove('act');
  bibPending = null;
};

var _bibTabBase = tab;
tab = function(name){
  _bibTabBase(name);
  try{ if(name === 'leitura') bibEnsureUI(); }catch(err){ cbShowError('biblioteca/aba: ' + err.message); }
};

bibEnsureUI();
if(state && state.logged){ try{ renderBooks(); }catch(e){ cbShowError('biblioteca/início: ' + e.message); } }
