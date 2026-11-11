/* =====================================================================
   c.b book - BANCO DE HORAS, CALENDÁRIO SEMANAL E SIMULADO DO MÊS
   Este arquivo é carregado depois do app.js e se encaixa nele.
   Para desligar tudo, remova a linha <script src="horas.js"> do index.html.

   Dados novos guardados em state:
     state.sessions  -> cada sessão de tempo: {id, day, secs, kind, bookId, tema, legacy}
     state.temas     -> lista de demandas/temas (Filosofia, História...)
     state.weekNotes -> anotação de cada semana (chave = domingo da semana)
     state.sims      -> histórico dos simulados do mês
     livro.tema      -> demanda do livro
     livro.finishedAt-> dia em que o livro foi concluído
   ===================================================================== */

var TEMAS_BASE = ['História', 'Política', 'Filosofia', 'Ficção', 'Ciência', 'Saúde', 'Concursos e Enem', 'Escrita', 'Outros'];
var SEM_DEMANDA = 'Sem demanda';
var SIM_DIAS = 28;          // 4 semanas
var SIM_QTD = 20;           // questões do simulado do mês
var SIM_PASS = 0.7;         // 70% para ser aprovado
var KIND_LABEL = {leitura: '📖 Leitura', estudo: '🎓 Estudo', escrita: '✍️ Escrita'};
var TEMA_CORES = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#60a5fa', '#2dd4bf', '#c084fc', '#94a3b8'];

var hrWeekOffset = 0;       // 0 = semana atual, -1 = semana passada...
var hrDaySel = null;        // dia aberto no detalhe

/* ---------- estado e utilidades ---------- */
function hrInit(){
  if(!state.sessions) state.sessions = [];
  if(!state.temas || !state.temas.length) state.temas = TEMAS_BASE.slice();
  if(!state.weekNotes) state.weekNotes = {};
  if(!state.sims) state.sims = [];
  if(!state.timerCtx) state.timerCtx = {bookId: null, tema: ''};

  /* migração única: o tempo que já estava salvo por dia vira sessões "sem demanda" */
  if(!state.horasMig){
    var tm = state.time || {}, k;
    for(k in tm){
      ['leitura', 'estudo', 'escrita'].forEach(function(kind){
        var s = tm[k] && tm[k][kind];
        if(s > 0) state.sessions.push({id: hrId(), day: k, secs: s, kind: kind, bookId: null, tema: SEM_DEMANDA, legacy: true});
      });
    }
    state.horasMig = 1;
  }

  /* livros já concluídos ganham a data de conclusão (hoje, se ainda não havia) */
  hrStampFinished(true);
}

function hrId(){ return Date.now() + '' + Math.floor(Math.random() * 1000); }
function hrBook(id){ return (state.books || []).find(function(b){ return b.id === id; }); }
function hrParse(key){ var p = key.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function hrWeekStart(d){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - x.getDay()); return x; }
function hrAddDays(d, n){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function hrFmtDM(d){ return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1); }
function hrHours(s){ return Math.round(s / 360) / 10; }  // horas com 1 casa
function hrTemaCor(t){
  var i = (state.temas || []).indexOf(t);
  return i < 0 ? '#94a3b8' : TEMA_CORES[i % TEMA_CORES.length];
}

function hrStampFinished(allowLegacy){
  var today = dayKey(new Date()), changed = false;
  (state.books || []).forEach(function(b){
    var done = (b.total || 0) > 0 && (b.pages || 0) >= b.total;
    if(done && !b.finishedAt){ b.finishedAt = today; changed = true; }
    if(!done && b.finishedAt){ delete b.finishedAt; changed = true; }
  });
  if(changed && !allowLegacy) save();
  return changed;
}

/* soma as sessões de um período [de, ate] (chaves yyyy-mm-dd) */
function hrSessionsBetween(from, to){
  return (state.sessions || []).filter(function(s){ return s.day >= from && s.day <= to; });
}

function hrSumBy(list, field){
  var out = {};
  list.forEach(function(s){ var k = s[field] || SEM_DEMANDA; out[k] = (out[k] || 0) + s.secs; });
  return out;
}

/* ---------- registrar tempo ---------- */
function hrAddSession(day, secs, kind, bookId, tema){
  var b = bookId ? hrBook(bookId) : null;
  var t = (b && b.tema) || tema || SEM_DEMANDA;
  state.sessions.push({id: hrId(), day: day, secs: Math.round(secs), kind: kind, bookId: b ? b.id : null, tema: t});
}

/* o botão "Salvar" do cronômetro passa a guardar também livro e demanda */
var _hrTimerSaveBase = timerSave;
timerSave = function(){
  hrInit();
  var secs = tElapsed(), kind = tState().kind, ctx = state.timerCtx || {};
  if(secs < 10){ _hrTimerSaveBase(); return; }
  var day = dayKey(new Date());
  _hrTimerSaveBase();                       // soma em state.time, zera o cronômetro e avisa
  hrAddSession(day, secs, kind, ctx.bookId, ctx.tema);
  save();
  hrRenderAll();
};

/* tempo lançado à mão (quando esqueceu de ligar o cronômetro) */
function hrSheet(){
  var s = document.getElementById('hrs-sheet');
  if(!s){
    s = document.createElement('div');
    s.className = 'sheet';
    s.id = 'hrs-sheet';
    s.style.cssText = 'max-height:90vh;overflow-y:auto;-webkit-overflow-scrolling:touch';
    (document.getElementById('app') || document.body).appendChild(s);
  }
  return s;
}

function hrBookOptions(selected){
  var o = '<option value="">— sem livro específico —</option>';
  (state.books || []).forEach(function(b){
    o += '<option value="' + b.id + '"' + (selected === b.id ? ' selected' : '') + '>' + esc(b.title) + '</option>';
  });
  return o;
}
function hrTemaOptions(selected){
  var o = '<option value="">' + SEM_DEMANDA + '</option>';
  state.temas.forEach(function(t){ o += '<option value="' + esc(t) + '"' + (selected === t ? ' selected' : '') + '>' + esc(t) + '</option>'; });
  return o + '<option value="__new__">+ Nova demanda…</option>';
}
var HR_SEL = 'background:#0d1b33;color:var(--text-main);border:1px solid var(--border-color);padding:10px;border-radius:10px;width:100%;margin-top:6px';

function hrOpenManual(){
  hrInit();
  var today = dayKey(hrDaySel ? hrParse(hrDaySel) : new Date());
  var el = hrSheet();
  el.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center"><span class="sf" style="font-size:18px">Lançar tempo</span>' +
    '<button class="ib" onclick="closeSheets()" aria-label="Fechar"><i class="ti ti-x"></i></button></div>' +
    '<div class="mut" style="margin-top:12px">Dia</div>' +
    '<input class="ip" id="hm-day" type="date" value="' + today + '" max="' + dayKey(new Date()) + '" style="margin-top:6px">' +
    '<div class="mut" style="margin-top:10px">Quanto tempo?</div>' +
    '<div style="display:flex;gap:8px;margin-top:6px"><input class="ip" id="hm-h" type="number" min="0" max="23" placeholder="horas" style="margin:0"><input class="ip" id="hm-m" type="number" min="0" max="59" placeholder="minutos" style="margin:0"></div>' +
    '<div class="mut" style="margin-top:10px">Tipo</div>' +
    '<select id="hm-kind" style="' + HR_SEL + '"><option value="leitura">📖 Leitura</option><option value="estudo">🎓 Estudo</option><option value="escrita">✍️ Escrita</option></select>' +
    '<div class="mut" style="margin-top:10px">Livro</div>' +
    '<select id="hm-book" style="' + HR_SEL + '">' + hrBookOptions(null) + '</select>' +
    '<div class="mut" style="margin-top:10px">Demanda (se o livro já tiver, ela é usada)</div>' +
    '<select id="hm-tema" onchange="hrNewTema(this)" style="' + HR_SEL + '">' + hrTemaOptions('') + '</select>' +
    '<button class="pb" style="margin-top:18px" onclick="hrSaveManual()">Salvar tempo</button>';
  document.getElementById('scrim').classList.add('act');
  el.classList.add('act');
}

function hrNewTema(sel){
  if(sel.value !== '__new__') return;
  var n = (prompt('Nome da nova demanda (ex.: Economia, Poesia):') || '').trim();
  if(n){
    if(state.temas.indexOf(n) < 0) state.temas.push(n);
    save();
    var cur = n;
    sel.innerHTML = hrTemaOptions(cur);
    sel.value = cur;
  } else sel.value = '';
}

function hrSaveManual(){
  var day = document.getElementById('hm-day').value;
  var h = parseInt(document.getElementById('hm-h').value) || 0, m = parseInt(document.getElementById('hm-m').value) || 0;
  var secs = h * 3600 + m * 60;
  if(!day){ toast('Escolha o dia'); return; }
  if(secs <= 0){ toast('Informe o tempo'); return; }
  if(day > dayKey(new Date())){ toast('Não dá para lançar tempo no futuro'); return; }
  var kind = document.getElementById('hm-kind').value;
  var bid = parseInt(document.getElementById('hm-book').value) || null;
  var tema = document.getElementById('hm-tema').value;
  hrAddSession(day, secs, kind, bid, tema === '__new__' ? '' : tema);
  /* mantém o total do cronômetro coerente */
  if(!state.time) state.time = {};
  var d = state.time[day] || (state.time[day] = {leitura: 0, estudo: 0, escrita: 0});
  d[kind] = (d[kind] || 0) + secs;
  save();
  closeSheets();
  hrRenderAll();
  try{ renderTimer(); }catch(e){}
  toast('⏱️ ' + fmtDur(secs) + ' lançados');
}

function hrDelSession(id){
  var i = state.sessions.findIndex(function(s){ return s.id === id; });
  if(i < 0 || !confirm('Apagar esta sessão de tempo?')) return;
  var s = state.sessions[i];
  state.sessions.splice(i, 1);
  var d = state.time && state.time[s.day];
  if(d && d[s.kind]) d[s.kind] = Math.max(0, d[s.kind] - s.secs);
  save();
  hrRenderAll();
  try{ renderTimer(); }catch(e){}
}

/* ---------- livro e demanda escolhidos no cronômetro ---------- */
function hrCtxChange(which, el){
  hrInit();
  var c = state.timerCtx;
  if(which === 'book') c.bookId = parseInt(el.value) || null;
  if(which === 'tema'){
    if(el.value === '__new__'){ hrNewTema(el); c.tema = el.value === '__new__' ? '' : el.value; }
    else c.tema = el.value;
  }
  save();
  renderTimer();
}

var _hrRenderTimerBase = renderTimer;
renderTimer = function(){
  _hrRenderTimerBase();
  try{
    hrInit();
    var card = document.getElementById('cb-timer-card');
    if(!card) return;
    var old = document.getElementById('cb-timer-ctx');
    if(old) old.remove();
    var c = state.timerCtx, b = c.bookId ? hrBook(c.bookId) : null;
    if(c.bookId && !b){ c.bookId = null; }
    var temaTxt = b && b.tema
      ? '<div class="mut" style="font-size:12px;margin-top:6px">Demanda do livro: <b style="color:var(--blue-primary)">' + esc(b.tema) + '</b></div>'
      : '<select onchange="hrCtxChange(\'tema\',this)" style="' + HR_SEL + ';padding:8px">' + hrTemaOptions(c.tema) + '</select>';
    var box = document.createElement('div');
    box.id = 'cb-timer-ctx';
    box.style.cssText = 'margin-top:12px';
    box.innerHTML =
      '<div class="mut" style="font-size:11px">REGISTRAR EM</div>' +
      '<select onchange="hrCtxChange(\'book\',this)" style="' + HR_SEL + ';padding:8px">' + hrBookOptions(c.bookId) + '</select>' + temaTxt;
    /* entra antes da linha dos botões Iniciar/Salvar */
    var btns = card.querySelector('button.pb');
    var row = btns && btns.parentElement;
    if(row && row.parentElement === card) card.insertBefore(box, row); else card.appendChild(box);
  }catch(err){ cbShowError('horas/cronômetro: ' + err.message); }
};

/* ---------- demanda no cadastro do livro ---------- */
function hrBookTemaField(){
  var sheet = document.getElementById('book-sheet');
  if(!sheet || document.getElementById('bk-tema')) return;
  var btn = sheet.querySelector('button.pb');
  var wrap = document.createElement('div');
  wrap.innerHTML = '<div class="mut" style="margin-top:8px;font-size:12px">Demanda (o que este livro trabalha em você):</div>' +
    '<select id="bk-tema" onchange="hrNewTema(this)" style="' + HR_SEL + '"></select>';
  sheet.insertBefore(wrap, btn);
}

var _hrOpenBookModalBase = openBookModal;
openBookModal = function(id){
  _hrOpenBookModalBase(id === undefined ? null : id);
  try{
    hrInit();
    hrBookTemaField();
    var b = (id !== undefined && id !== null) ? hrBook(id) : null;
    var sel = document.getElementById('bk-tema');
    sel.innerHTML = hrTemaOptions(b && b.tema ? b.tema : '');
  }catch(err){ cbShowError('horas/livro: ' + err.message); }
};

var _hrSaveNewBookBase = saveNewBook;
saveNewBook = function(){
  hrInit();
  var sel = document.getElementById('bk-tema');
  var tema = sel && sel.value !== '__new__' ? sel.value : '';
  var editing = editingBookId, before = (state.books || []).length;
  _hrSaveNewBookBase();
  var b = editing !== null ? hrBook(editing) : ((state.books || []).length > before ? state.books[state.books.length - 1] : null);
  if(b){
    if(tema) b.tema = tema; else delete b.tema;
    hrStampFinished(false);
    save();
    hrRenderAll();
  }
};

/* quando um livro chega a 100% registra a data de conclusão */
var _hrLogPagesBase = logPages;
logPages = function(){
  hrInit();
  _hrLogPagesBase();
  if(hrStampFinished(false)) hrRenderAll();
};

/* =====================================================================
   PAINEL "BANCO DE HORAS" (aba Desenvolvimento)
   ===================================================================== */
function hrCard(){
  var c = document.getElementById('cb-horas-card');
  if(c) return c;
  var prog = document.getElementById('v-prog');
  if(!prog) return null;
  c = document.createElement('div');
  c.className = 'card';
  c.id = 'cb-horas-card';
  var first = prog.querySelector('.card');           // o card da nau
  if(first && first.nextElementSibling) prog.insertBefore(c, first.nextElementSibling);
  else prog.appendChild(c);
  return c;
}

function hrWeekNav(n){ hrWeekOffset = Math.min(0, hrWeekOffset + n); hrDaySel = null; hrRenderPanel(); }
function hrPickDay(key){ hrDaySel = hrDaySel === key ? null : key; hrRenderPanel(); }

function hrSaveNote(key, el){
  hrInit();
  var v = el.value.trim();
  if(v) state.weekNotes[key] = v; else delete state.weekNotes[key];
  save();
  toast('Anotação da semana salva');
}

function hrRenderPanel(){
  var card = hrCard();
  if(!card) return;
  hrInit();

  var ws = hrAddDays(hrWeekStart(new Date()), hrWeekOffset * 7);
  var we = hrAddDays(ws, 6);
  var wsKey = dayKey(ws), weKey = dayKey(we), todayKey = dayKey(new Date());
  var list = hrSessionsBetween(wsKey, weKey);
  var total = list.reduce(function(a, s){ return a + s.secs; }, 0);
  var byTema = hrSumBy(list, 'tema'), byKind = hrSumBy(list, 'kind');

  /* calendário da semana */
  var days = '', maxDay = 1, i;
  for(i = 0; i < 7; i++){
    var kk = dayKey(hrAddDays(ws, i));
    var sum = 0; hrSessionsBetween(kk, kk).forEach(function(s){ sum += s.secs; });
    if(sum > maxDay) maxDay = sum;
  }
  for(i = 0; i < 7; i++){
    var dd = hrAddDays(ws, i), key = dayKey(dd), future = key > todayKey;
    var ds = hrSessionsBetween(key, key), secs = ds.reduce(function(a, s){ return a + s.secs; }, 0);
    var h = Math.round(secs / maxDay * 38);
    var sel = hrDaySel === key, isToday = key === todayKey;
    days += '<div onclick="hrPickDay(\'' + key + '\')" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;' + (future ? 'opacity:.4' : '') + '">' +
      '<div style="height:40px;display:flex;align-items:flex-end;width:100%;justify-content:center"><div style="width:70%;height:' + Math.max(secs > 0 ? 4 : 2, h) + 'px;border-radius:4px;background:' + (secs > 0 ? 'var(--blue-primary)' : 'rgba(255,255,255,.1)') + '"></div></div>' +
      '<div style="width:100%;text-align:center;padding:4px 0;border-radius:8px;border:1px solid ' + (sel ? 'var(--blue-primary)' : (isToday ? 'rgba(56,189,248,.5)' : 'transparent')) + ';background:' + (sel ? 'rgba(37,137,254,.15)' : 'transparent') + '">' +
        '<div style="font-size:10px;color:var(--text-muted)">' + DIAS_INI[i] + '</div>' +
        '<div style="font-size:13px;font-weight:700">' + dd.getDate() + '</div>' +
        '<div style="font-size:10px;color:' + (secs > 0 ? 'var(--blue-primary)' : 'var(--text-muted)') + '">' + (secs > 0 ? hrHours(secs) + 'h' : '·') + '</div></div></div>';
  }

  /* detalhe do dia escolhido */
  var detail = '';
  if(hrDaySel && hrDaySel >= wsKey && hrDaySel <= weKey){
    var dl = hrSessionsBetween(hrDaySel, hrDaySel), dd2 = hrParse(hrDaySel);
    detail = '<div style="margin-top:10px;padding:10px;border-radius:10px;background:rgba(255,255,255,.04)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13px">' + DIAS_NOME[dd2.getDay()] + ', ' + hrFmtDM(dd2) + '</b>' +
      '<button class="btn-launch" style="padding:3px 10px;font-size:11px" onclick="hrOpenManual()"><i class="ti ti-plus"></i> Lançar</button></div>';
    if(!dl.length) detail += '<div class="mut" style="margin-top:6px;font-size:12px">Nada registrado neste dia.</div>';
    dl.forEach(function(s){
      var b = s.bookId ? hrBook(s.bookId) : null;
      detail += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;font-size:12px">' +
        '<div style="min-width:0"><div>' + (KIND_LABEL[s.kind] || s.kind) + ' · <b>' + fmtDur(s.secs) + '</b></div>' +
        '<div class="mut" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="color:' + hrTemaCor(s.tema) + '">●</span> ' + esc(s.tema) + (b ? ' · ' + esc(b.title) : '') + '</div></div>' +
        '<button class="ib" onclick="hrDelSession(\'' + s.id + '\')" aria-label="Apagar" style="flex:0 0 auto"><i class="ti ti-trash"></i></button></div>';
    });
    detail += '</div>';
  }

  /* horas por demanda na semana */
  var temaKeys = Object.keys(byTema).sort(function(a, b){ return byTema[b] - byTema[a]; });
  var temas = '';
  if(!temaKeys.length) temas = '<div class="mut" style="font-size:12px;margin-top:8px">Nenhum tempo registrado nesta semana. Use o cronômetro na tela Início ou toque em um dia para lançar.</div>';
  temaKeys.forEach(function(t){
    var pct = Math.round(byTema[t] / total * 100);
    var books = {};
    list.forEach(function(s){ if(s.tema === t && s.bookId){ var b = hrBook(s.bookId); if(b) books[b.title] = 1; } });
    var bl = Object.keys(books);
    temas += '<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:13px"><span><span style="color:' + hrTemaCor(t) + '">●</span> ' + esc(t) + '</span><b>' + fmtDur(byTema[t]) + ' <span class="mut" style="font-size:11px">' + pct + '%</span></b></div>' +
      '<div style="height:6px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:4px"><div style="height:6px;border-radius:4px;width:' + pct + '%;background:' + hrTemaCor(t) + '"></div></div>' +
      (bl.length ? '<div class="mut" style="font-size:11px;margin-top:3px;line-height:1.35">' + bl.map(esc).join(' · ') + '</div>' : '') + '</div>';
  });

  /* últimas 4 semanas */
  var wk = '', maxW = 1, ws4 = [];
  for(i = 3; i >= 0; i--){
    var s0 = hrAddDays(hrWeekStart(new Date()), -7 * i), e0 = hrAddDays(s0, 6);
    var t0 = hrSessionsBetween(dayKey(s0), dayKey(e0)).reduce(function(a, s){ return a + s.secs; }, 0);
    ws4.push({s: s0, t: t0});
    if(t0 > maxW) maxW = t0;
  }
  ws4.forEach(function(w, idx){
    wk += '<div style="flex:1;text-align:center"><div style="height:34px;display:flex;align-items:flex-end;justify-content:center"><div style="width:60%;height:' + Math.max(w.t > 0 ? 4 : 2, Math.round(w.t / maxW * 32)) + 'px;border-radius:4px;background:' + (idx === 3 ? 'var(--blue-primary)' : 'rgba(37,137,254,.45)') + '"></div></div>' +
      '<div style="font-size:11px;font-weight:700;margin-top:2px">' + hrHours(w.t) + 'h</div><div class="mut" style="font-size:10px">' + hrFmtDM(w.s) + '</div></div>';
  });
  var tot4 = ws4.reduce(function(a, w){ return a + w.t; }, 0);

  var rangeTxt = hrFmtDM(ws) + ' – ' + hrFmtDM(we) + (hrWeekOffset === 0 ? ' · esta semana' : '');
  var kindTxt = ['leitura', 'estudo', 'escrita'].map(function(k){ return KIND_LABEL[k] + ' ' + fmtDur(byKind[k] || 0); }).join(' · ');
  var note = state.weekNotes[wsKey] || '';

  card.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="mut" style="font-size:11px">⏳ BANCO DE HORAS</span>' +
      '<button class="btn-launch" style="padding:4px 10px;font-size:11px" onclick="hrOpenManual()"><i class="ti ti-plus"></i> Lançar tempo</button></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">' +
      '<button class="ib" onclick="hrWeekNav(-1)" aria-label="Semana anterior"><i class="ti ti-chevron-left"></i></button>' +
      '<div style="text-align:center"><div class="sf" style="font-size:22px">' + fmtDur(total) + '</div><div class="mut" style="font-size:11px">' + rangeTxt + '</div></div>' +
      '<button class="ib" onclick="hrWeekNav(1)" aria-label="Próxima semana"' + (hrWeekOffset === 0 ? ' disabled style="opacity:.3"' : '') + '><i class="ti ti-chevron-right"></i></button></div>' +
    '<div style="display:flex;gap:4px;margin-top:12px">' + days + '</div>' + detail +
    '<div class="mut" style="font-size:11px;margin-top:10px">' + kindTxt + '</div>' +
    '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color)"><div class="t" style="font-size:14px">Por demanda nesta semana</div>' + temas + '</div>' +
    '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color)"><div class="t" style="font-size:14px">O que esta semana trabalhou em mim?</div>' +
      '<textarea class="ip" id="hr-note" placeholder="Ex.: li sobre filosofia política e isso me ajudou a organizar as ideias do canal..." style="min-height:80px;margin-top:8px" onblur="hrSaveNote(\'' + wsKey + '\',this)">' + esc(note) + '</textarea></div>' +
    '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color)"><div style="display:flex;justify-content:space-between"><span class="t" style="font-size:14px">Últimas 4 semanas</span><span class="mut" style="font-size:12px">' + fmtDur(tot4) + '</span></div>' +
      '<div style="display:flex;gap:6px;margin-top:8px">' + wk + '</div></div>';
}

/* =====================================================================
   SIMULADO DO MÊS (livros concluídos nas últimas 4 semanas)
   ===================================================================== */
var sim = null;

function hrSimWindow(){
  var to = dayKey(new Date()), from = dayKey(hrAddDays(new Date(), -(SIM_DIAS - 1)));
  return {from: from, to: to};
}

function hrSimBooks(){
  var w = hrSimWindow();
  return (state.books || []).filter(function(b){ return b.finishedAt && b.finishedAt >= w.from && b.finishedAt <= w.to; });
}

function hrSimPool(books){
  var pool = [], semProva = [];
  books.forEach(function(b){
    var p = provaFor(b);
    if(!p){ semProva.push(b); return; }
    p.q.forEach(function(q){ pool.push({q: q, book: b.title, tema: b.tema || SEM_DEMANDA}); });
  });
  return {pool: pool, semProva: semProva};
}

function hrSimCard(){
  var c = document.getElementById('cb-sim-card');
  if(c) return c;
  var prog = document.getElementById('v-prog');
  var anchor = document.getElementById('cb-horas-card');
  if(!prog || !anchor) return null;
  c = document.createElement('div');
  c.className = 'card';
  c.id = 'cb-sim-card';
  prog.insertBefore(c, anchor.nextElementSibling);
  return c;
}

function hrRenderSimCard(){
  var card = hrSimCard();
  if(!card) return;
  var books = hrSimBooks(), r = hrSimPool(books), last = state.sims[state.sims.length - 1];
  var due = !last || (new Date(dayKey(new Date())) - new Date(last.date)) / 86400000 >= SIM_DIAS;
  var n = Math.min(SIM_QTD, r.pool.length);
  var h = '<div style="display:flex;justify-content:space-between;align-items:center"><span class="mut" style="font-size:11px">📝 SIMULADO DO MÊS</span>' +
          (due && n > 0 ? '<span style="font-size:11px;font-weight:700;color:#22c55e">● pronto para fazer</span>' : '') + '</div>' +
          '<div class="mut" style="font-size:12px;margin-top:6px;line-height:1.5">Reúne os livros concluídos nas últimas ' + (SIM_DIAS / 7) + ' semanas e cobra os assuntos deles.</div>';
  if(!books.length){
    h += '<div style="margin-top:10px;font-size:13px">Nenhum livro concluído nas últimas 4 semanas.</div>';
  } else {
    h += '<div style="margin-top:10px;font-size:13px"><b>' + books.length + '</b> livro(s) concluído(s):</div>';
    books.forEach(function(b){
      var tem = provaFor(b);
      h += '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;margin-top:6px"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📘 ' + esc(b.title) + (b.tema ? ' <span class="mut">· ' + esc(b.tema) + '</span>' : '') + '</span>' +
           '<span class="mut" style="flex:0 0 auto">' + (tem ? tem.q.length + ' questões' : 'sem prova') + '</span></div>';
    });
    if(r.semProva.length) h += '<div class="mut" style="font-size:11px;margin-top:8px;line-height:1.4">Livros sem prova cadastrada não entram no simulado. As provas ficam em <code>dados.js</code> (lista PROVAS).</div>';
  }
  if(n > 0) h += '<button class="pb" style="margin-top:14px" onclick="hrOpenSim()">Fazer simulado (' + n + ' questões)</button>';
  else if(books.length) h += '<button class="ob" style="margin-top:14px" disabled>Sem questões disponíveis ainda</button>';
  if(last){
    h += '<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-color)"><div class="mut" style="font-size:11px">ÚLTIMO SIMULADO · ' + hrFmtDM(hrParse(last.date)) + '</div>' +
         '<div style="font-size:13px;margin-top:4px"><b>' + last.ok + ' / ' + last.total + '</b> (' + Math.round(last.ok / last.total * 100) + '%)' + (state.sims.length > 1 ? ' · ' + state.sims.length + ' simulados feitos' : '') + '</div>' +
         hrTemaBars(last.byTema) + '</div>';
  }
  card.innerHTML = h;
}

function hrTemaBars(byTema){
  var out = '';
  Object.keys(byTema || {}).forEach(function(t){
    var x = byTema[t], pct = Math.round(x.ok / x.total * 100);
    out += '<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:12px"><span><span style="color:' + hrTemaCor(t) + '">●</span> ' + esc(t) + '</span><b>' + x.ok + '/' + x.total + '</b></div>' +
           '<div style="height:5px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:3px"><div style="height:5px;border-radius:4px;width:' + pct + '%;background:' + (pct >= SIM_PASS * 100 ? '#22c55e' : '#f59e0b') + '"></div></div></div>';
  });
  return out;
}

function hrOpenSim(){
  var r = hrSimPool(hrSimBooks());
  if(!r.pool.length){ toast('Conclua um livro com prova para liberar o simulado.'); return; }
  /* distribui as questões entre os livros, sem repetir */
  var byBook = {};
  r.pool.forEach(function(x){ (byBook[x.book] = byBook[x.book] || []).push(x); });
  var names = Object.keys(byBook);
  names.forEach(function(k){ shuffleArr(byBook[k]); });
  var chosen = [], total = Math.min(SIM_QTD, r.pool.length), idx = 0;
  while(chosen.length < total){
    var arr = byBook[names[idx % names.length]];
    if(arr.length) chosen.push(arr.pop());
    idx++;
  }
  shuffleArr(chosen);
  var items = chosen.map(function(x){ return {q: x.q, book: x.book, tema: x.tema, idx: shuffleArr([0, 1, 2, 3])}; });
  sim = {items: items, i: 0, ok: 0, picked: null, done: false, byTema: {}, byBook: {}};
  document.getElementById('scrim').classList.add('act');
  examSheet().classList.add('act');
  hrRenderSim();
}

function hrSimPick(k){
  if(!sim || sim.picked !== null || sim.done) return;
  var it = sim.items[sim.i], right = it.idx[k] === it.q.c;
  sim.picked = k;
  if(right) sim.ok++;
  var t = sim.byTema[it.tema] || (sim.byTema[it.tema] = {ok: 0, total: 0});
  t.total++; if(right) t.ok++;
  var b = sim.byBook[it.book] || (sim.byBook[it.book] = {ok: 0, total: 0});
  b.total++; if(right) b.ok++;
  hrRenderSim();
}

function hrSimNext(){
  if(!sim) return;
  sim.i++; sim.picked = null;
  if(sim.i >= sim.items.length){
    sim.done = true;
    state.sims.push({date: dayKey(new Date()), ok: sim.ok, total: sim.items.length, byTema: sim.byTema, byBook: sim.byBook});
    save();
    hrRenderSimCard();
  }
  hrRenderSim();
}

function hrRenderSim(){
  var el = examSheet();
  if(!sim){ return; }
  var total = sim.items.length, h = '';
  h += '<div style="display:flex;justify-content:space-between;align-items:center"><span class="sf" style="font-size:18px">📝 Simulado do mês</span>' +
       '<button class="ib" onclick="closeSheets()" aria-label="Fechar"><i class="ti ti-x"></i></button></div>';

  if(sim.done){
    var pct = Math.round(sim.ok / total * 100), passed = pct >= SIM_PASS * 100;
    h += '<div style="text-align:center;margin-top:16px"><div style="font-size:46px">' + (passed ? '🏅' : '📚') + '</div>' +
         '<div class="sf" style="font-size:34px;margin-top:4px">' + sim.ok + ' / ' + total + '</div>' +
         '<div style="margin-top:6px;font-weight:700;color:' + (passed ? '#22c55e' : '#f59e0b') + '">' + pct + '% · ' + (passed ? 'Ótimo domínio dos assuntos!' : 'Vale rever alguns assuntos') + '</div></div>' +
         '<div style="margin-top:14px"><div class="t" style="font-size:14px">Por assunto</div>' + hrTemaBars(sim.byTema) + '</div>' +
         '<div style="margin-top:14px"><div class="t" style="font-size:14px">Por livro</div>';
    Object.keys(sim.byBook).forEach(function(b){
      var x = sim.byBook[b];
      h += '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;margin-top:6px"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📘 ' + esc(b) + '</span><b>' + x.ok + '/' + x.total + '</b></div>';
    });
    h += '</div><button class="pb" style="margin-top:18px" onclick="closeSheets()">Fechar</button>';
    el.innerHTML = h;
    return;
  }

  var it = sim.items[sim.i], q = it.q;
  h += '<div class="mut" style="margin-top:4px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.book) + ' · ' + esc(it.tema) + '</div>' +
       '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><span class="mut" style="font-size:11px">QUESTÃO ' + (sim.i + 1) + ' DE ' + total + '</span><span class="mut" style="font-size:11px">✅ ' + sim.ok + ' acertos</span></div>' +
       '<div style="height:5px;border-radius:4px;background:rgba(255,255,255,.08);margin-top:6px"><div style="height:5px;border-radius:4px;width:' + Math.round(sim.i / total * 100) + '%;background:var(--blue-primary)"></div></div>' +
       '<div class="t" style="margin-top:14px;font-size:16px;line-height:1.45">' + esc(q.q) + '</div><div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">';
  it.idx.forEach(function(orig, k){
    var st = 'text-align:left;margin:0;';
    if(sim.picked !== null){
      if(orig === q.c) st += 'border-color:#22c55e;background:rgba(34,197,94,.18);';
      else if(k === sim.picked) st += 'border-color:#ef4444;background:rgba(239,68,68,.18);';
      else st += 'opacity:.55;';
    }
    h += '<button class="ob" style="' + st + '"' + (sim.picked !== null ? ' disabled' : ' onclick="hrSimPick(' + k + ')"') + '><b>' + 'ABCD'.charAt(k) + ')</b> ' + esc(q.o[orig]) + '</button>';
  });
  h += '</div>';
  if(sim.picked !== null){
    var right = it.idx[sim.picked] === q.c;
    h += '<div style="margin-top:12px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.05);font-size:13px;line-height:1.5"><b style="color:' + (right ? '#22c55e' : '#ef4444') + '">' + (right ? '✅ Acertou!' : '❌ Errou.') + '</b> ' + esc(q.e) + '</div>' +
         '<button class="pb" style="margin-top:12px" onclick="hrSimNext()">' + (sim.i + 1 >= total ? 'Ver resultado' : 'Próxima questão') + '</button>';
  }
  el.innerHTML = h;
}

/* ---------- ligação com o app ---------- */
function hrRenderAll(){
  try{ hrRenderPanel(); hrRenderSimCard(); }catch(err){ cbShowError('horas: ' + err.message); }
}

var _hrCloseSheetsBase = closeSheets;
closeSheets = function(){
  _hrCloseSheetsBase();
  var s = document.getElementById('hrs-sheet');
  if(s) s.classList.remove('act');
  sim = null;
};

var _hrUpdateUIBase = updateUI;
updateUI = function(){
  _hrUpdateUIBase();
  try{ hrInit(); hrRenderAll(); }catch(err){ cbShowError('horas/updateUI: ' + err.message); }
};

if(state && state.logged){ try{ hrInit(); save(); updateUI(); }catch(e){ cbShowError('horas/início: ' + e.message); } }
