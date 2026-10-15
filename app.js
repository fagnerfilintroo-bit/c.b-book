/* Aviso de erro na tela (ajuda a achar problemas no celular). Toque para fechar. */
function cbShowError(msg){
  try{
    var b = document.getElementById('cb-err');
    if(!b){
      b = document.createElement('div');
      b.id = 'cb-err';
      b.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#7f1d1d;color:#fff;font:12px/1.4 monospace;padding:10px;border-radius:8px;word-break:break-word';
      b.onclick = function(){ b.remove(); };
      (document.body || document.documentElement).appendChild(b);
    }
    b.textContent = 'Erro: ' + msg;
  }catch(e){}
}
window.addEventListener('error', function(e){ cbShowError((e.message || 'erro') + ' (linha ' + e.lineno + ')'); });
window.addEventListener('unhandledrejection', function(e){ cbShowError(String(e.reason)); });

/* ================= AJUSTE DE TELA CHEIA (celular) =================
   Para desfazer, apague este bloco inteiro (até o fim do comentário "FIM AJUSTE"). */
(function(){
  var st = document.createElement('style');
  st.id = 'cb-fullscreen-css';
  st.textContent = [
    '@media (max-width:700px){',
    '  html,body{margin:0;height:100%;overflow:hidden;background:#060e1e}',
    '  #app,.ph{width:100% !important;max-width:none !important;height:100vh !important;height:100dvh !important;min-height:0 !important;margin:0 !important;border-radius:0 !important;border:none !important;box-shadow:none !important}',
    '  .sc{height:100% !important}',
    '  .views{height:100% !important;overflow-y:auto !important;overflow-x:hidden !important;-webkit-overflow-scrolling:touch}',
    '  .v{height:auto !important;min-height:100%}',
    '  #v-hoje > div:first-child{flex-shrink:0 !important;overflow:visible !important;min-height:max-content !important;height:auto !important}',
    '  .views::-webkit-scrollbar{width:5px}',
    '  .views::-webkit-scrollbar-thumb{background:rgba(222,184,135,.55);border-radius:4px}',
    '  .nav{position:fixed !important;left:6px !important;right:6px !important;bottom:calc(6px + env(safe-area-inset-bottom)) !important;width:auto !important;max-width:none !important;height:auto !important;margin:0 auto !important;padding:6px 4px calc(6px + env(safe-area-inset-bottom) * 0) !important;box-sizing:border-box;align-items:stretch;justify-content:space-between;gap:2px;z-index:50}',
    '  .nav button{flex:1 1 0 !important;min-width:0 !important;height:auto !important;padding:8px 1px 7px !important;display:flex !important;flex-direction:column;align-items:center;justify-content:center;gap:3px;line-height:1.1 !important;white-space:nowrap;overflow:visible !important;font-size:clamp(8px,2.45vw,11px) !important;letter-spacing:-.2px}',
    '  .nav button i{font-size:20px}',
    '  .toast{top:calc(10px + env(safe-area-inset-top))}',
    '}'
  ].join('\n');
  document.head.appendChild(st);
})();
/* FIM AJUSTE */

var KEY = 'cbbook_v19';
var state = load() || fresh();

function fresh(){
  return {
    v:1, logged:false, name:'', email:'', plan:0, ints:[],
    pages:0, goal:30, streak:0, hit:false, words:0,
    prestige: 0, questCompleted: false,
    activeDays: [],
    books: [],
    friends: [],
    qd:0, qt:0, qr:0, qi:0, erros:[], sub:{}, lastSub:'',
    ch:[]
  };
}

function save(){
  localStorage.setItem(KEY, JSON.stringify(state));
}

function load(){
  let d = localStorage.getItem(KEY);
  return d ? JSON.parse(d) : null;
}

function toast(msg){
  let t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('act');
  setTimeout(() => t.classList.remove('act'), 2500);
}

function go(id){
  document.querySelectorAll('.sc').forEach(el => el.classList.remove('act'));
  let target = document.getElementById(id);
  if(target) target.classList.add('act');
  
  // Controla a visibilidade da barra de navegação inferior
  let nav = document.getElementById('main-nav');
  if(nav){
    if(id === 's-app'){
      nav.style.display = 'flex';
    } else {
      nav.style.display = 'none';
    }
  }
}

function tab(name){
  document.querySelectorAll('.v').forEach(el => el.classList.remove('act'));
  document.querySelectorAll('.nav button').forEach(el => el.classList.remove('on'));
  
  let v = document.getElementById('v-' + name);
  let btn = document.getElementById('n-' + name);
  if(v) v.classList.add('act');
  if(btn) btn.classList.add('on');
}

function login(){
  let m = document.getElementById('lg-mail').value;
  let p = document.getElementById('lg-pass').value;
  if(!m || !p){ toast('Preencha e-mail e senha'); return; }
  state.logged = true;
  state.email = m;
  state.name = m.split('@')[0];
  state.name = state.name.charAt(0).toUpperCase() + state.name.slice(1);
  save();
  initApp();
  go('s-app');
}

function signup(){
  let n = document.getElementById('su-name').value;
  let m = document.getElementById('su-mail').value;
  let p = document.getElementById('su-pass').value;
  if(!n || !m || !p){ toast('Preencha todos os campos'); return; }
  state.name = n;
  state.email = m;
  save();
  go('s-plan');
}

function selPlan(idx){
  state.plan = idx;
  document.getElementById('p0').style.borderColor = idx === 0 ? 'var(--blue-primary)' : 'var(--border-color)';
  document.getElementById('p1').style.borderColor = idx === 1 ? 'var(--blue-primary)' : 'var(--border-color)';
  document.getElementById('planbtn').textContent = idx === 1 ? 'Continuar com Leitor' : 'Continuar Gratuito';
}

function tgInt(btn){
  btn.classList.toggle('sel');
  let txt = btn.textContent;
  if(!state.ints) state.ints = [];
  if(state.ints.includes(txt)){
    state.ints = state.ints.filter(i => i !== txt);
  } else {
    state.ints.push(txt);
  }
  document.getElementById('intcount').textContent = state.ints.length + ' selecionados';
}

function enterApp(){
  state.logged = true;
  save();
  initApp();
  go('s-app');
}

function logout(){
  localStorage.removeItem(KEY);
  state = fresh();
  go('s-login');
}

// Gestão de Livros
let editingBookId = null;

function openBookModal(id = null){
  editingBookId = id;
  let titleInput = document.getElementById('bk-title');
  let authorInput = document.getElementById('bk-author');
  let pagesInput = document.getElementById('bk-pages');
  let pagesReadInput = document.getElementById('bk-pages-read');
  let coverInput = document.getElementById('bk-cover');
  let modalTitle = document.getElementById('book-modal-title');

  if(id !== null && state.books){
    let book = state.books.find(b => b.id === id);
    if(book){
      if(modalTitle) modalTitle.textContent = 'Editar Livro';
      titleInput.value = book.title;
      authorInput.value = book.author;
      pagesInput.value = book.total;
      pagesReadInput.value = book.pages;
      coverInput.value = book.cover || '';
    }
  } else {
    if(modalTitle) modalTitle.textContent = 'Adicionar Novo Livro';
    titleInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
    pagesReadInput.value = '0';
    coverInput.value = '';
  }

  document.getElementById('scrim').classList.add('act');
  document.getElementById('book-sheet').classList.add('act');
}

function saveNewBook(){
  let title = document.getElementById('bk-title').value;
  let author = document.getElementById('bk-author').value;
  let pages = parseInt(document.getElementById('bk-pages').value) || 100;
  let pagesRead = parseInt(document.getElementById('bk-pages-read').value) || 0;
  let cover = document.getElementById('bk-cover').value;

  if(!title){ toast('Digite o título do livro'); return; }

  if(!state.books) state.books = [];

  if(editingBookId !== null){
    let book = state.books.find(b => b.id === editingBookId);
    if(book){
      book.title = title;
      book.author = author || 'Desconhecido';
      book.total = pages;
      book.pages = Math.min(pages, pagesRead);
      book.cover = cover;
    }
    toast('Livro atualizado com sucesso!');
  } else {
    state.books.push({
      id: Date.now(),
      title: title,
      author: author || 'Desconhecido',
      pages: Math.min(pages, pagesRead),
      total: pages,
      cover: cover,
      notes: ''
    });
    toast('Livro adicionado com sucesso!');
  }

  recalculateTotalPages();
  save();
  renderBooks();
  updateUI();
  updateActiveBookDisplay();
  closeSheets();
}

function recalculateTotalPages(){
  if(state.books && state.books.length > 0){
    state.pages = state.books.reduce((sum, b) => sum + (b.pages || 0), 0);
  }
}

function saveTotalPages(){
  let inputVal = parseInt(document.getElementById('pg-edit-total').value);
  if(!isNaN(inputVal)){
    state.pages = Math.max(0, inputVal);
    save();
    updateUI();
    toast('Total de páginas atualizado!');
  } else {
    toast('Digite um número válido');
  }
}

function renderBooks(){
  let container = document.getElementById('books-list');
  if(!container) return;

  if(!state.books || state.books.length === 0){
    container.innerHTML = `<div class="card"><div class="mut">Nenhum livro cadastrado ainda. Clique em "Novo Livro" acima.</div></div>`;
    return;
  }

  container.innerHTML = state.books.map(b => {
    let pct = Math.round((b.pages / b.total) * 100) || 0;
    let isFinished = b.pages >= b.total;
    
    return `
      <div class="card" style="margin:0 0 10px 0;position:relative;overflow:hidden">
        <div style="display:flex;gap:14px;align-items:center">
          <div class="bk" style="position:relative;${b.cover ? 'background-image:url('+b.cover+');background-size:cover;' : ''}">
            ${b.cover ? '' : b.title.charAt(0)}
            ${isFinished ? '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(234,179,8,0.9);color:#060e1e;font-size:9px;font-weight:800;text-align:center;padding:1px 0;letter-spacing:0.05em">LIDO</div>' : ''}
          </div>
          <div style="flex:1;min-width:0">
            <div class="t" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</div>
            <div class="mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.author}</div>
            <div class="mut" style="margin-top:4px">Progresso: ${b.pages} / ${b.total} pág (${pct}%)</div>
          </div>
          <button class="ib" onclick="openBookModal(${b.id})" title="Editar"><i class="ti ti-pencil"></i></button>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border-color)">
          <button class="ob" style="flex:1;margin:0;padding:6px;font-size:12px" onclick="openSheetForBook(${b.id})"><i class="ti ti-plus"></i> Lançar Páginas</button>
          <button class="ob" style="flex:1;margin:0;padding:6px;font-size:12px" onclick="openNotesModal(${b.id})"><i class="ti ti-notes"></i> Anotações</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateActiveBookDisplay(){
  if(state.books && state.books.length > 0){
    let active = state.books[0];
    document.getElementById('hi-book').textContent = active.title;
    document.getElementById('hi-author').textContent = active.author;
    document.getElementById('ac-cover').textContent = active.cover ? '' : active.title.charAt(0);
    if(active.cover){
      document.getElementById('ac-cover').style.backgroundImage = 'url('+active.cover+')';
      document.getElementById('ac-cover').style.backgroundSize = 'cover';
    }
  } else {
    document.getElementById('hi-book').textContent = 'Nenhum livro';
    document.getElementById('hi-author').textContent = 'Adicione na aba Leitura';
    document.getElementById('ac-cover').textContent = '0';
  }
}

// Registro e Amigos
let currentAdd = 10;
let selectedBookIdForLog = null;

function openSheet(){
  selectedBookIdForLog = null;
  populateBookSelect();
  document.getElementById('scrim').classList.add('act');
  document.getElementById('sheet').classList.add('act');
}

function openSheetForBook(bookId){
  selectedBookIdForLog = bookId;
  populateBookSelect();
  let sel = document.getElementById('log-book-select');
  if(sel) sel.value = bookId;
  document.getElementById('scrim').classList.add('act');
  document.getElementById('sheet').classList.add('act');
}

function openFriendModal(){
  document.getElementById('scrim').classList.add('act');
  document.getElementById('friend-sheet').classList.add('act');
}

function saveFriend(){
  let name = document.getElementById('friend-name-input').value;
  let pages = parseInt(document.getElementById('friend-pages-input').value) || 20;
  if(!name){ toast('Digite o nome do navegador'); return; }

  if(!state.friends) state.friends = [];
  let lvl = pages > 200 ? '🏴‍☠️ Nau Capitânia' : pages > 100 ? '🚢 Caravela de Exploração' : '⛵ Barco de Pesca';
  
  state.friends.push({ id: Date.now(), name: name, pages: pages, level: lvl });
  save();
  renderFriends();
  closeSheets();
  toast('Navegador adicionado à frota!');
}

function renderFriends(){
  let list = document.getElementById('friends-list');
  if(!list) return;

  if(!state.friends || state.friends.length === 0){
    list.innerHTML = `<div class="mut" style="font-size:12px;padding:4px 0">Nenhum aliado na frota ainda. Adicione amigos para disputar a regatta!</div>`;
    return;
  }

  let sorted = [...state.friends].sort((a,b) => b.pages - a.pages);

  list.innerHTML = sorted.map((f, idx) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color)">
      <div>
        <div style="font-weight:700;font-size:14px;color:var(--text-main)">${idx === 0 ? '👑 ' : idx === 1 ? '🥈 ' : '⚓ '} ${f.name}</div>
        <div class="mut" style="font-size:11px">${f.level}</div>
      </div>
      <div style="text-align:right">
        <span class="sf" style="color:var(--blue-primary);font-size:16px">${f.pages}</span>
        <span class="mut" style="font-size:11px"> pág</span>
      </div>
    </div>
  `).join('');
}

function populateBookSelect(){
  let sel = document.getElementById('log-book-select');
  if(!sel) return;
  if(!state.books || state.books.length === 0){
    sel.innerHTML = `<option value="">Nenhum livro cadastrado</option>`;
    return;
  }
  sel.innerHTML = state.books.map(b => `<option value="${b.id}">${b.title} (${b.pages}/${b.total} pág)</option>`).join('');
}

let activeNoteBookId = null;

function openNotesModal(bookId){
  activeNoteBookId = bookId;
  let book = state.books.find(b => b.id === bookId);
  if(!book) return;
  document.getElementById('notes-book-title').textContent = book.title;
  document.getElementById('bk-notes-text').value = book.notes || '';
  document.getElementById('scrim').classList.add('act');
  document.getElementById('notes-sheet').classList.add('act');
}

function saveBookNotes(){
  if(activeNoteBookId === null) return;
  let book = state.books.find(b => b.id === activeNoteBookId);
  if(book){
    book.notes = document.getElementById('bk-notes-text').value;
    save();
    toast('Anotações salvas com sucesso!');
  }
  closeSheets();
}

function closeSheets(){
  document.getElementById('scrim').classList.remove('act');
  document.getElementById('sheet').classList.remove('act');
  document.getElementById('book-sheet').classList.remove('act');
  document.getElementById('notes-sheet').classList.remove('act');
  document.getElementById('friend-sheet').classList.remove('act');
  document.getElementById('ed').classList.remove('act');
}

function stepAmt(delta){
  currentAdd = Math.max(5, currentAdd + delta);
  document.getElementById('amt').textContent = currentAdd;
}

function triggerPrestige(){
  state.prestige = (state.prestige || 0) + 1;
  state.pages = 0;
  if(state.books){
    state.books.forEach(b => b.pages = 0);
  }
  save();
  updateUI();
  renderBooks();
  toast('Parabéns! Você zarpou para um novo oceano com Prestígio ' + state.prestige + '!');
}

function updateUI(){
  document.getElementById('hi-pages').textContent = state.pages;
  
  let pct = Math.min(100, Math.round((state.pages / state.goal) * 100));
  document.getElementById('hi-bpct').textContent = pct + '%';
  
  let donutPath = document.getElementById('donut-path');
  let donutPct = document.getElementById('donut-pct');
  let donutDesc = document.getElementById('donut-desc');
  
  if(donutPath) donutPath.setAttribute('stroke-dasharray', `${pct}, 100`);
  if(donutPct) donutPct.textContent = pct + '%';
  if(donutDesc) donutDesc.textContent = `${state.pages} de ${state.goal} páginas da meta alcançadas.`;

  let qStatus = document.getElementById('quest-status');
  if(state.pages >= 15){
    if(qStatus){ qStatus.textContent = 'Concluído 🌬️'; qStatus.style.color = 'var(--green-accent)'; }
  } else {
    if(qStatus){ qStatus.textContent = 'Pendente'; qStatus.style.color = 'var(--text-mut)'; }
  }

  let totalPages = state.pages;
  let piecesEarned = Math.min(12, Math.floor(totalPages / 20)); 
  let shipPct = Math.round((piecesEarned / 12) * 100);

  let badge = document.getElementById('ship-level-badge');
  let icon3d = document.getElementById('ship-3d-icon');
  let title = document.getElementById('ship-level-title');
  let desc = document.getElementById('ship-level-desc');
  let piecesTxt = document.getElementById('ship-pieces-txt');
  let xpPct = document.getElementById('ship-xp-pct');
  let oceanTitle = document.getElementById('ship-ocean-title');
  let prestigeContainer = document.getElementById('prestige-container');
  let prestigeStars = document.getElementById('prestige-stars');
  
  let rankTag = document.getElementById('hi-rank-tag');
  let badgeIcon = document.getElementById('hi-badge-icon');
  let nameEl = document.getElementById('hi-name');
  let userName = state.name || 'Fagner';

  let homeShipArt = document.getElementById('home-ship-art');
  let homeShipSubtitle = document.getElementById('home-ship-subtitle');
  let homeShipTitleTop = document.getElementById('home-ship-title-top');

  let oceans = ['OCEANO DOS CLÁSSICOS', 'MAR DA FILOSOFIA', 'ARQUIPÉLAGO DOS CONCURSOS', 'FROTA IMPERIAL LENDÁRIA'];
  let currentOcean = oceans[Math.min(state.prestige || 0, oceans.length - 1)];
  if(oceanTitle) oceanTitle.textContent = currentOcean;
  if(prestigeStars) prestigeStars.textContent = `⭐️ Estrelas de Almirante: ${state.prestige || 0}`;

  if(piecesEarned >= 12){
    if(badge) badge.textContent = 'Nível Máximo';
    if(icon3d) icon3d.textContent = '🏴‍☠️✨⛵';
    if(title) title.textContent = 'Nau Capitânia Lendária (Ouro e Carvalho)';
    if(desc) desc.textContent = 'Sua frota domina os mares do conhecimento!';
    if(homeShipArt) homeShipArt.textContent = '🏴‍☠️✨⛵';
    if(homeShipTitleTop) homeShipTitleTop.textContent = 'Nau Capitânia Lendária';
    if(homeShipSubtitle) homeShipSubtitle.textContent = 'Ouro e Carvalho Maciço • Nível Máximo';
    if(rankTag) rankTag.textContent = 'ALMIRANTE DA FROTA';
    if(badgeIcon) badgeIcon.textContent = '🎖️🎖️🎖️⭐';
    if(nameEl) nameEl.innerHTML = `${userName} <span style="font-size:15px;color:#f59e0b">⚓ Mestre</span>`;
    if(prestigeContainer) prestigeContainer.style.display = 'block';
  } else {
    if(prestigeContainer) prestigeContainer.style.display = 'none';
    if(piecesEarned >= 9){
      if(badge) badge.textContent = 'Nível 4';
      if(icon3d) icon3d.textContent = '🚢🟫⚓';
      if(title) title.textContent = 'Caravela de Exploração Avançada (Carvalho Escuro)';
      if(desc) desc.textContent = 'Casco reforçado com carvalho escuro e canhões prontos.';
      if(homeShipArt) homeShipArt.textContent = '🚢🟫⚓';
      if(homeShipTitleTop) homeShipTitleTop.textContent = 'Caravela Avançada';
      if(homeShipSubtitle) homeShipSubtitle.textContent = 'Carvalho escuro e canhões • Nível 4';
      if(rankTag) rankTag.textContent = 'CAPITÃO DO MAR';
      if(badgeIcon) badgeIcon.textContent = '🎖️🎖️';
      if(nameEl) nameEl.innerHTML = `${userName} <span style="font-size:15px">⚓</span>`;
    } else if(piecesEarned >= 6){
      if(badge) badge.textContent = 'Nível 3';
      if(icon3d) icon3d.textContent = '⛵🪵🧭';
      if(title) title.textContent = 'Caravela de Exploração (Carvalho)';
      if(desc) desc.textContent = 'Velas duplas e textura de madeira tratada.';
      if(homeShipArt) homeShipArt.textContent = '⛵🪵🧭';
      if(homeShipTitleTop) homeShipTitleTop.textContent = 'Caravela de Exploração';
      if(homeShipSubtitle) homeShipSubtitle.textContent = 'Madeira tratada e velas duplas • Nível 3';
      if(rankTag) rankTag.textContent = 'TENENTE DO MAR';
      if(badgeIcon) badgeIcon.textContent = '🎖️';
      if(nameEl) nameEl.innerHTML = `${userName} <span style="font-size:15px">⚓</span>`;
    } else if(piecesEarned >= 3){
      if(badge) badge.textContent = 'Nível 2';
      if(icon3d) icon3d.textContent = '🛶🪵';
      if(title) title.textContent = 'Barco de Pesca / Tronco Envernizado';
      if(desc) desc.textContent = 'O mastro de madeira rústica começa a guiar sua rotina.';
      if(homeShipArt) homeShipArt.textContent = '🛶🪵';
      if(homeShipTitleTop) homeShipTitleTop.textContent = 'Barco de Pesca';
      if(homeShipSubtitle) homeShipSubtitle.textContent = 'Troncos envernizados • Nível 2';
      if(rankTag) rankTag.textContent = 'MARINHEIRO';
      if(badgeIcon) badgeIcon.textContent = '🏅';
      if(nameEl) nameEl.innerHTML = `${userName}`;
    } else {
      if(badge) badge.textContent = 'Nível 1';
      if(icon3d) icon3d.textContent = '⛵🪵';
      if(title) title.textContent = 'Jangada de Toras (Madeira Bruta)';
      if(desc) desc.textContent = 'O ponto de partida do navegador em toras de madeira.';
      if(homeShipArt) homeShipArt.textContent = '⛵🪵';
      if(homeShipTitleTop) homeShipTitleTop.textContent = 'Embarcação de Madeira';
      if(homeShipSubtitle) homeShipSubtitle.textContent = 'Estrutura robusta de partida • Nível 1';
      if(rankTag) rankTag.textContent = 'RECRUTA';
      if(badgeIcon) badgeIcon.textContent = '🎖️';
      if(nameEl) nameEl.innerHTML = `${userName}`;
    }
  }

  if(piecesTxt) piecesTxt.textContent = `Peças conquistadas: ${piecesEarned} / 12`;
  if(xpPct) xpPct.textContent = shipPct + '%';

  let diaryList = document.getElementById('pieces-diary-list');
  if(diaryList){
    let pieceNames = [
      "Tronco base de madeira", "Corda de amarra", "Remo rústico",
      "Mastro central de madeira", "Vela de tecido branco", "Leme de direção",
      "Segunda vela e cordame", "Cesto do vigia (Gávea)", "Casco reforçado",
      "Estandarte principal", "Canhões laterais", "Leme de ouro mestre"
    ];
    diaryList.innerHTML = pieceNames.map((pName, idx) => {
      let unlocked = piecesEarned > idx;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid ${unlocked ? 'rgba(56,189,248,0.4)' : 'var(--border-color)'}">
          <span style="font-size:13px;color:${unlocked ? 'var(--text-main)' : 'var(--text-mut)'}">${idx+1}. ${pName} (${(idx)*20}–${(idx+1)*20} pág)</span>
          <span style="font-size:12px">${unlocked ? '✅ Conquistada' : '🔒 Bloqueada'}</span>
        </div>
      `;
    }).join('');
  }

  let stkEl = document.querySelector('.stk');
  if(stkEl) stkEl.textContent = state.streak;
  let mailEl = document.getElementById('pg-mail');
  if(mailEl) mailEl.textContent = state.email;
  let totalInput = document.getElementById('pg-edit-total');
  if(totalInput) totalInput.value = state.pages;
  
  renderWeeklyTracker();
  updateActiveBookDisplay();
  renderFriends();
}

function initApp(){
  updateUI();
  renderBooks();
  renderFriends();
  if(state.logged){
    go('s-app');
  } else {
    go('s-login');
  }
}

window.onload = function(){
  if(state.logged){
    initApp();
  } else {
    go('s-login');
  }
};

/* ================= CARAVELA + DIÁRIO DE BORDO ================= */
var DAILY_GOAL = 15; // páginas para "completar a leitura do dia" (mesma missão do Vento nos Castelos)

/* ---------- Datas (horário LOCAL, sem o bug do UTC) ---------- */
function dayKey(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function isDone(key){
  if(state.daily && key in state.daily) return state.daily[key] >= DAILY_GOAL;
  return !!(state.activeDays && state.activeDays.includes(key)); // dados antigos
}

function calcStreak(){
  var d = new Date();
  if(!isDone(dayKey(d))) d.setDate(d.getDate() - 1); // hoje ainda pode ser concluído
  var n = 0;
  while(isDone(dayKey(d))){ n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- Registro de leitura (agora guarda páginas por dia) ---------- */
function logPages(){
  var sel = document.getElementById('log-book-select');
  var targetBookId = selectedBookIdForLog || (sel ? parseInt(sel.value) : null);
  var book = state.books.find(function(b){ return b.id === targetBookId; });
  if(!book){ toast('Selecione um livro válido'); return; }

  var before = book.pages;
  book.pages = Math.min(book.total, book.pages + currentAdd);
  var added = book.pages - before;
  if(added <= 0){ toast('Esse livro já está concluído'); closeSheets(); return; }
  recalculateTotalPages();

  var key = dayKey(new Date());
  if(!state.daily) state.daily = {};
  var wasDone = isDone(key);
  state.daily[key] = (state.daily[key] || 0) + added;
  var nowDone = state.daily[key] >= DAILY_GOAL;

  if(!state.activeDays) state.activeDays = [];
  if(nowDone && !state.activeDays.includes(key)) state.activeDays.push(key);
  state.questCompleted = nowDone;
  state.streak = calcStreak();

  save();
  updateUI();
  renderBooks();
  closeSheets();
  if(nowDone && !wasDone) toast('🔥 Leitura do dia concluída! Sequência: ' + state.streak);
  else toast('Leitura registrada para ' + book.title + '!');
}

/* ---------- Diário de Bordo (bolinhas D S T Q Q S S) ---------- */
var DIAS_NOME = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
var DIAS_INI  = ['D','S','T','Q','Q','S','S'];

function dayInfo(key, idx){
  var p = (state.daily && state.daily[key]) || 0;
  toast(DIAS_NOME[idx] + ': ' + p + ' de ' + DAILY_GOAL + ' páginas' + (isDone(key) ? ' 🔥' : ''));
}

function renderWeeklyTracker(){
  var el = document.getElementById('weekly-streak-tracker');
  if(!el) return;
  try{ renderWeeklyTrackerInner(el); }catch(err){ cbShowError('diário: ' + err.message); }
}

function renderWeeklyTrackerInner(el){
  var now = new Date();
  var dow = now.getDay();
  var cols = '';

  for(var i = 0; i < 7; i++){
    var d = new Date(now);
    d.setDate(now.getDate() + i - dow);
    var key = dayKey(d);
    var done = isDone(key);
    var today = i === dow;
    var future = i > dow;
    var pages = (state.daily && state.daily[key]) || 0;

    var style;
    if(done) style = 'background:linear-gradient(145deg,#fb923c,#ea580c);border:2px solid #fdba74;color:#fff;box-shadow:0 0 12px rgba(249,115,22,.65);';
    else if(today) style = 'background:rgba(56,189,248,.15);border:2px solid var(--blue-primary);color:var(--text-main);';
    else style = 'background:rgba(255,255,255,.05);border:1px solid var(--border-color);color:var(--text-mut);' + (future ? 'opacity:.45;' : '');

    cols += '<div onclick="dayInfo(\'' + key + '\',' + i + ')" style="display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer">' +
      '<div style="position:relative;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;' + style + '">' +
        DIAS_INI[i] +
        (done ? '<span class="cb-fire" style="position:absolute;top:-9px;right:-6px;font-size:15px">🔥</span>' : '') +
      '</div>' +
      '<span style="font-size:10px;color:' + (done ? '#fdba74' : 'var(--text-mut)') + '">' + (pages > 0 ? pages + 'p' : '·') + '</span>' +
    '</div>';
  }

  el.style.flexDirection = 'column';
  el.style.alignItems = 'center';
  el.style.gap = '0';
  el.innerHTML =
    '<div style="font-size:11px;letter-spacing:.08em;color:#deb887;margin-bottom:12px">📖 DIÁRIO DE BORDO · meta ' + DAILY_GOAL + ' pág/dia</div>' +
    '<div style="display:flex;justify-content:center;gap:10px">' + cols + '</div>' +
    '<div style="font-size:11px;margin-top:10px;color:#a0aec0">🔥 ' + calcStreak() + ' dia(s) seguidos</div>';
}

/* ---------- Caravela em SVG (evolui com as 12 peças) ---------- */
function caravelSVG(pieces, prestige, pre){
  pieces = Math.max(0, Math.min(12, pieces));
  var P = function(n){ return pieces >= n; };
  var type = P(9) ? 'caravel' : (P(3) ? 'boat' : 'raft');
  var gold = P(12);

  var wood = '#a0642a', woodDark = '#5b3513', woodLight = '#c58a4a', goldC = '#f5b82e', sail = '#f6eed8', rope = '#d9bf8c';
  var deckY  = type === 'caravel' ? 126 : (type === 'boat' ? 138 : 146);
  var sternX = type === 'caravel' ? 50  : (type === 'boat' ? 70  : 78);
  var bowX   = type === 'caravel' ? 256 : (type === 'boat' ? 230 : 222);
  var mastX = 150;
  var mastTop = type === 'caravel' ? 32 : 66;

  function wave(y, amp, len, fill){
    var d = 'M0 ' + y + ' q' + (len / 2) + ' ' + (-amp) + ' ' + len + ' 0';
    for(var i = 1; i < Math.ceil(300 / len); i++) d += ' t' + len + ' 0';
    return '<path d="' + d + ' V220 H0 Z" fill="' + fill + '"/>';
  }

  var vbTop = -14; // mostra a arte inteira, com folga em cima
  var s = '<svg viewBox="0 ' + vbTop + ' 300 ' + (220 - vbTop) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Embarcação com ' + pieces + ' de 12 peças" style="width:100%;max-width:' + (pre === 'h' ? 340 : 320) + 'px;height:auto;display:block;margin:0 auto">';
  s += '<defs>' +
    '<linearGradient id="' + pre + 'hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + woodLight + '"/><stop offset="1" stop-color="' + wood + '"/></linearGradient>' +
    '<radialGradient id="' + pre + 'glow"><stop offset="0" stop-color="#f5b82e" stop-opacity=".45"/><stop offset="1" stop-color="#f5b82e" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="' + pre + 'w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e4078" stop-opacity=".6"/><stop offset="1" stop-color="#1e4078" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + pre + 'w2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2856" stop-opacity=".92"/><stop offset=".5" stop-color="#0e2856" stop-opacity=".5"/><stop offset="1" stop-color="#0e2856" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + pre + 'wg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".15" stop-color="#fff"/><stop offset=".85" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
    '<mask id="' + pre + 'wm" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="220"><rect width="300" height="220" fill="url(#' + pre + 'wg)"/></mask>' +
    '<style>.cv-bob{animation:cvb 4.5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}@keyframes cvb{0%,100%{transform:translateY(0) rotate(-.8deg)}50%{transform:translateY(-3px) rotate(.8deg)}}@media(prefers-reduced-motion:reduce){.cv-bob{animation:none}}</style>' +
    '</defs>';

  if(gold) s += '<circle cx="150" cy="105" r="115" fill="url(#' + pre + 'glow)"/>';
  for(var k = 0; k < Math.min(prestige || 0, 5); k++) s += '<text x="' + (16 + k * 18) + '" y="24" font-size="15" fill="' + goldC + '">★</text>';

  s += '<g mask="url(#' + pre + 'wm)">' + wave(174, 7, 36, 'url(#' + pre + 'w1)') + '</g>';
  s += '<g class="cv-bob">';

  /* --- Casco --- */
  if(type === 'raft'){
    var ys = [168, 157, 146], n = P(1) ? 3 : 1;
    for(var i = 0; i < n; i++){
      var y = n === 1 ? 168 : ys[i];
      s += '<rect x="' + sternX + '" y="' + y + '" width="144" height="11" rx="5.5" fill="url(#' + pre + 'hull)" stroke="' + woodDark + '" stroke-width="1.5"/>' +
           '<circle cx="' + (bowX - 6) + '" cy="' + (y + 5.5) + '" r="3.5" fill="' + woodLight + '" stroke="' + woodDark + '"/>';
    }
  } else if(type === 'boat'){
    s += '<path d="M70 138 L230 138 Q222 168 190 177 L110 177 Q78 168 70 138 Z" fill="url(#' + pre + 'hull)" stroke="' + woodDark + '" stroke-width="2"/>' +
         '<path d="M74 150 H226 M80 163 H220" stroke="' + woodDark + '" stroke-opacity=".5" stroke-width="1.5"/>' +
         '<path d="M66 136 H234" stroke="' + woodLight + '" stroke-width="4" stroke-linecap="round"/>';
  } else {
    s += '<path d="M50 108 L100 108 L100 128 L236 124 L256 112 Q250 160 214 176 L96 178 Q60 168 50 138 Z" fill="url(#' + pre + 'hull)" stroke="' + woodDark + '" stroke-width="2.2" stroke-linejoin="round"/>' +
         '<path d="M51 130 Q150 148 252 124 M54 147 Q150 163 244 145 M64 161 Q150 173 232 161" fill="none" stroke="' + woodDark + '" stroke-opacity=".45" stroke-width="1.5"/>' +
         '<path d="M250 118 L288 96" stroke="' + woodDark + '" stroke-width="4" stroke-linecap="round"/>';
    if(gold) s += '<path d="M50 108 L100 108 L100 128 L236 124 L256 112" fill="none" stroke="' + goldC + '" stroke-width="3.5" stroke-linejoin="round"/>' +
                  '<path d="M52 136 Q150 154 250 130" fill="none" stroke="' + goldC + '" stroke-width="2.2"/>';
    s += '<circle cx="64" cy="120" r="3.2" fill="' + (gold ? goldC : '#1f2937') + '"/><circle cx="80" cy="120" r="3.2" fill="' + (gold ? goldC : '#1f2937') + '"/>';
  }

  /* 2 — corda de amarra */
  if(P(2)){
    var rx = type === 'caravel' ? 122 : sternX + 30;
    s += '<ellipse cx="' + rx + '" cy="' + (deckY - 3) + '" rx="9" ry="4" fill="none" stroke="' + rope + '" stroke-width="2.5"/>' +
         '<ellipse cx="' + rx + '" cy="' + (deckY - 3) + '" rx="4.5" ry="2" fill="none" stroke="' + rope + '" stroke-width="2"/>' +
         '<path d="M' + (bowX - 4) + ' ' + (deckY + 4) + ' Q' + (bowX + 14) + ' ' + (deckY + 22) + ' ' + (bowX + 24) + ' 170" fill="none" stroke="' + rope + '" stroke-width="2"/>';
  }
  /* 3 — remos */
  if(P(3)){
    [128, 172].forEach(function(x){
      s += '<path d="M' + x + ' ' + (deckY + 12) + ' L' + (x - 22) + ' 178" stroke="' + woodDark + '" stroke-width="3" stroke-linecap="round"/>' +
           '<path d="M' + (x - 19) + ' 172 L' + (x - 24) + ' 184" stroke="' + woodLight + '" stroke-width="7" stroke-linecap="round"/>';
    });
  }
  /* 6 — leme */
  if(P(6)){
    s += '<path d="M' + (sternX - 2) + ' ' + (deckY + 4) + ' L' + (sternX - 12) + ' ' + (deckY + 44) + ' L' + (sternX + 2) + ' ' + (deckY + 46) + ' L' + (sternX + 6) + ' ' + (deckY + 10) + ' Z" fill="' + (gold ? goldC : woodDark) + '" stroke="' + woodDark + '" stroke-width="1.5"/>';
  }

  /* 4 — mastro central */
  if(P(4)) s += '<rect x="' + (mastX - 3) + '" y="' + mastTop + '" width="6" height="' + (deckY - mastTop) + '" fill="' + woodDark + '"/>';

  /* 7 — mastros menores, velas latinas e cordame */
  var fTop = deckY - 62, mx = type === 'caravel' ? 80 : sternX + 28, mBase = type === 'caravel' ? 108 : deckY, mTop = mBase - 50;
  if(P(7)){
    s += '<path d="M' + mastX + ' ' + mastTop + ' L' + (bowX - 2) + ' ' + (deckY - 4) + ' M' + mastX + ' ' + mastTop + ' L' + (sternX + 4) + ' ' + (mBase - 2) + '" stroke="' + rope + '" stroke-width="1" fill="none"/>' +
         '<rect x="209" y="' + fTop + '" width="5" height="' + (deckY - fTop) + '" fill="' + woodDark + '"/>' +
         '<rect x="' + (mx - 2.5) + '" y="' + mTop + '" width="5" height="' + (mBase - mTop) + '" fill="' + woodDark + '"/>' +
         '<path d="M211 ' + fTop + ' L' + (bowX - 6) + ' ' + (deckY - 12) + ' L192 ' + (deckY - 12) + ' Z" fill="' + sail + '" stroke="#cdbb8b" stroke-width="1.2"/>' +
         '<path d="M211 ' + fTop + ' L' + (bowX - 6) + ' ' + (deckY - 12) + '" stroke="' + woodDark + '" stroke-width="2"/>' +
         '<path d="M' + mx + ' ' + mTop + ' L' + (mx - 30) + ' ' + (mBase - 8) + ' L' + (mx + 14) + ' ' + (mBase - 8) + ' Z" fill="' + sail + '" stroke="#cdbb8b" stroke-width="1.2"/>';
  }

  /* 5 — vela principal com a Cruz de Cristo */
  if(P(5)){
    var y1 = mastTop + 14, y2 = y1 + (type === 'caravel' ? 64 : 48), cy = (y1 + y2) / 2 + 4, cx = mastX;
    s += '<rect x="104" y="' + (y1 - 3) + '" width="92" height="5" rx="2" fill="' + woodDark + '"/>' +
         '<path d="M112 ' + y1 + ' Q150 ' + (y1 + 10) + ' 188 ' + y1 + ' L184 ' + y2 + ' Q150 ' + (y2 + 12) + ' 116 ' + y2 + ' Z" fill="' + sail + '" stroke="' + (gold ? goldC : '#cdbb8b') + '" stroke-width="' + (gold ? 2.2 : 1.3) + '"/>' +
         '<path d="M' + (cx - 4) + ' ' + (cy - 16) + ' H' + (cx + 4) + ' V' + (cy - 4) + ' H' + (cx + 16) + ' V' + (cy + 4) + ' H' + (cx + 4) + ' V' + (cy + 16) + ' H' + (cx - 4) + ' V' + (cy + 4) + ' H' + (cx - 16) + ' V' + (cy - 4) + ' H' + (cx - 4) + ' Z" fill="#b91c1c"/>';
  }

  /* 8 — gávea (cesto do vigia) */
  if(P(8)) s += '<path d="M' + (mastX - 10) + ' ' + (mastTop - 2) + ' L' + (mastX + 10) + ' ' + (mastTop - 2) + ' L' + (mastX + 7) + ' ' + (mastTop + 9) + ' L' + (mastX - 7) + ' ' + (mastTop + 9) + ' Z" fill="' + woodDark + '" stroke="' + woodLight + '" stroke-width="1.2"/>';

  /* 10 — estandarte */
  if(P(10)){
    var t = mastTop;
    s += '<path d="M' + mastX + ' ' + (t - 2) + ' V' + (t - 18) + '" stroke="' + woodDark + '" stroke-width="2"/>' +
         '<path d="M' + mastX + ' ' + (t - 18) + ' Q168 ' + (t - 24) + ' 186 ' + (t - 16) + ' Q168 ' + (t - 8) + ' ' + mastX + ' ' + (t - 8) + ' Z" fill="' + (gold ? goldC : '#b91c1c') + '" stroke="' + woodDark + '" stroke-width=".8"/>';
  }

  /* 11 — canhões */
  if(P(11)) [112, 142, 172, 202].forEach(function(x){
    s += '<circle cx="' + x + '" cy="' + (deckY + 15) + '" r="4.4" fill="#1f2937" stroke="' + (gold ? goldC : woodLight) + '" stroke-width="1.4"/>';
  });

  s += '</g>';
  s += '<g mask="url(#' + pre + 'wm)">' + wave(180, 6, 30, 'url(#' + pre + 'w2)') + '</g>';
  s += '</svg>';
  return s;
}

/* ---------- Ligação com o app (envolve o updateUI original) ---------- */
(function(){
  var css = document.createElement('style');
  css.textContent = '@keyframes cbfire{0%,100%{transform:scale(1) rotate(-4deg)}50%{transform:scale(1.18) rotate(4deg)}}.cb-fire{display:inline-block;animation:cbfire 1.2s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.cb-fire{animation:none}}';
  document.head.appendChild(css);
})();

var _baseUpdateUI = updateUI;
updateUI = function(){
  state.streak = calcStreak();
  _baseUpdateUI();

  try{
  var pieces = Math.min(12, Math.floor((state.pages || 0) / 20));
  var home = document.getElementById('home-ship-art');
  if(home){ home.style.fontSize = '0'; if(home.parentElement){ var hp = home.parentElement.style; hp.flexShrink = '0'; hp.overflow = 'visible'; hp.minHeight = 'max-content'; hp.height = 'auto'; } home.innerHTML = caravelSVG(pieces, state.prestige, 'h'); }
  var dev = document.getElementById('ship-3d-icon');
  if(dev){ dev.style.fontSize = '0'; dev.innerHTML = caravelSVG(pieces, state.prestige, 'd'); }

  var today = (state.daily && state.daily[dayKey(new Date())]) || 0;
  var q = document.getElementById('quest-status');
  if(q){
    if(today >= DAILY_GOAL){ q.textContent = 'Concluído 🔥'; q.style.color = 'var(--green-accent)'; }
    else { q.textContent = today + '/' + DAILY_GOAL + ' pág'; q.style.color = 'var(--text-mut)'; }
  }
  }catch(err){ cbShowError('caravela: ' + err.message); }
};

/* ================= EVOLUÇÃO HISTÓRICA (Nau → Galeão → Vapor → Nautilus) ================= */
var NAU_AT = 500, GALEAO_AT = 750, VAPOR_AT = 1000, NAUT_READ = 1000, NAUT_WRITE = 1000, WORDS_PER_PAGE = 300;

function evoPages(){
  var sum = 0;
  (state.books || []).forEach(function(b){ sum += Math.max(0, (b.pages || 0) - (b.start || 0)); });
  return sum;
}

function chapterWords(c){
  var txt = '';
  if(typeof c === 'string') txt = c;
  else if(c && typeof c === 'object'){
    for(var k in c){ if(typeof c[k] === 'string' && c[k].length > txt.length) txt = c[k]; }
  }
  txt = txt.trim();
  return txt ? txt.split(/\s+/).length : 0;
}

function writtenPages(){
  var w = 0;
  if(Array.isArray(state.ch)) state.ch.forEach(function(c){ w += chapterWords(c); });
  w = Math.max(w, state.words || 0);
  return Math.floor(w / WORDS_PER_PAGE);
}

function tierOf(evo, wr){
  if(evo >= NAUT_READ && wr >= NAUT_WRITE) return 'nautilus';
  if(evo >= VAPOR_AT) return 'vapor';
  if(evo >= GALEAO_AT) return 'galeao';
  if(evo >= NAU_AT) return 'nau';
  if(evo >= 240) return 'dourada';
  return 'base';
}

/* ---------- Desenhos ---------- */
function cvHead(pre, label){
  return '<svg viewBox="0 -14 300 234" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '" style="width:100%;max-width:340px;height:auto;display:block;margin:0 auto"><defs>' +
    '<linearGradient id="' + pre + 'hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58a4a"/><stop offset="1" stop-color="#a0642a"/></linearGradient>' +
    '<linearGradient id="' + pre + 'iron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5568"/><stop offset="1" stop-color="#1f2733"/></linearGradient>' +
    '<linearGradient id="' + pre + 'steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb2c9"/><stop offset=".5" stop-color="#52667f"/><stop offset="1" stop-color="#26364d"/></linearGradient>' +
    '<radialGradient id="' + pre + 'glow"><stop offset="0" stop-color="#f5b82e" stop-opacity=".4"/><stop offset="1" stop-color="#f5b82e" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + pre + 'glowB"><stop offset="0" stop-color="#38bdf8" stop-opacity=".4"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + pre + 'pglow"><stop offset="0" stop-color="#fff7c2"/><stop offset=".6" stop-color="#facc15"/><stop offset="1" stop-color="#b45309"/></radialGradient>' +
    '<linearGradient id="' + pre + 'w1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e4078" stop-opacity=".6"/><stop offset="1" stop-color="#1e4078" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + pre + 'w2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2856" stop-opacity=".92"/><stop offset=".5" stop-color="#0e2856" stop-opacity=".5"/><stop offset="1" stop-color="#0e2856" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + pre + 'nd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2a5a" stop-opacity=".62"/><stop offset=".6" stop-color="#08183a" stop-opacity=".5"/><stop offset="1" stop-color="#08183a" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + pre + 'wg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".15" stop-color="#fff"/><stop offset=".85" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
    '<mask id="' + pre + 'wm" maskUnits="userSpaceOnUse" x="0" y="-14" width="300" height="234"><rect x="0" y="-14" width="300" height="234" fill="url(#' + pre + 'wg)"/></mask>' +
    '<style>.cv-bob{animation:cvb 4.5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}@keyframes cvb{0%,100%{transform:translateY(0) rotate(-.8deg)}50%{transform:translateY(-3px) rotate(.8deg)}}@media(prefers-reduced-motion:reduce){.cv-bob{animation:none}}</style>' +
    '</defs>';
}

function cvWave(y, amp, len, fill){
  var d = 'M0 ' + y + ' q' + (len / 2) + ' ' + (-amp) + ' ' + len + ' 0';
  for(var i = 1; i < Math.ceil(300 / len); i++) d += ' t' + len + ' 0';
  return '<path d="' + d + ' V220 H0 Z" fill="' + fill + '"/>';
}
function cvSeaBack(pre, y){ return '<g mask="url(#' + pre + 'wm)">' + cvWave(y || 174, 7, 36, 'url(#' + pre + 'w1)') + '</g>'; }
function cvSeaFront(pre, y){ return '<g mask="url(#' + pre + 'wm)">' + cvWave(y || 180, 6, 30, 'url(#' + pre + 'w2)') + '</g>'; }

function crossPath(cx, cy, k){
  var a = 4 * k, b = 16 * k;
  return 'M' + (cx - a) + ' ' + (cy - b) + ' H' + (cx + a) + ' V' + (cy - a) + ' H' + (cx + b) + ' V' + (cy + a) + ' H' + (cx + a) + ' V' + (cy + b) + ' H' + (cx - a) + ' V' + (cy + a) + ' H' + (cx - b) + ' V' + (cy - a) + ' H' + (cx - a) + ' Z';
}
function squareSail(path, yardX, yardY, yardW, cross){
  var s = '<rect x="' + yardX + '" y="' + yardY + '" width="' + yardW + '" height="4" rx="2" fill="#5b3513"/>' +
          '<path d="' + path + '" fill="#f6eed8" stroke="#cdbb8b" stroke-width="1.2"/>';
  if(cross) s += '<path d="' + crossPath(cross[0], cross[1], cross[2]) + '" fill="#b91c1c"/>';
  return s;
}
function pennant(x, y, c){
  return '<path d="M' + x + ' ' + (y + 2) + ' V' + (y - 12) + '" stroke="#5b3513" stroke-width="2"/>' +
         '<path d="M' + x + ' ' + (y - 12) + ' Q' + (x + 16) + ' ' + (y - 17) + ' ' + (x + 32) + ' ' + (y - 11) + ' Q' + (x + 16) + ' ' + (y - 5) + ' ' + x + ' ' + (y - 5) + ' Z" fill="' + (c || '#b91c1c') + '" stroke="#5b3513" stroke-width=".7"/>';
}

/* NAU — inspirada nas naus portuguesas (ex.: São Gabriel): 3 mastros, castelos de proa e popa */
function nauSVG(pre){
  var wd = '#5b3513', wl = '#c58a4a', gd = '#f5b82e', rope = '#d9bf8c';
  var s = cvHead(pre, 'Nau das Grandes Navegações');
  s += '<circle cx="150" cy="96" r="130" fill="url(#' + pre + 'glow)"/>' + cvSeaBack(pre);
  s += '<g class="cv-bob">';
  s += '<path d="M44 104 L96 104 L96 126 L206 126 L206 114 L250 114 L266 104 Q262 160 222 176 L92 178 Q56 168 44 132 Z" fill="url(#' + pre + 'hull)" stroke="' + wd + '" stroke-width="2.2" stroke-linejoin="round"/>';
  s += '<path d="M47 132 Q150 150 262 116 M52 150 Q150 166 250 142 M66 163 Q150 174 234 162" fill="none" stroke="' + wd + '" stroke-opacity=".5" stroke-width="1.6"/>';
  s += '<path d="M46 124 Q150 142 262 108" fill="none" stroke="#1f2937" stroke-opacity=".55" stroke-width="5"/>';
  s += '<path d="M44 104 L96 104 M206 114 L250 114" stroke="' + gd + '" stroke-width="3" stroke-linecap="round"/>';
  s += '<circle cx="58" cy="115" r="2.6" fill="' + gd + '"/><circle cx="72" cy="115" r="2.6" fill="' + gd + '"/><circle cx="86" cy="115" r="2.6" fill="' + gd + '"/>';
  [120, 148, 176].forEach(function(x){ s += '<circle cx="' + x + '" cy="147" r="3.2" fill="#1f2937" stroke="' + wl + '"/>'; });
  s += '<path d="M250 112 L294 92" stroke="' + wd + '" stroke-width="4" stroke-linecap="round"/>';
  // mastros
  s += '<rect x="75.5" y="54" width="5" height="50" fill="' + wd + '"/><rect x="139.5" y="24" width="6" height="102" fill="' + wd + '"/><rect x="205.5" y="38" width="5" height="76" fill="' + wd + '"/>';
  // cordame
  s += '<path d="M142 24 L96 126 M142 24 L206 126 M208 38 L250 114 M208 38 L172 126 M78 54 L48 104 M78 54 L110 126" stroke="' + rope + '" stroke-width=".9" fill="none"/>';
  // velas
  s += '<path d="M78 54 L48 100 L114 100 Z" fill="#f6eed8" stroke="#cdbb8b" stroke-width="1.2"/><path d="M78 54 L116 100" stroke="' + wd + '" stroke-width="2"/>';
  s += squareSail('M106 67 Q142 76 178 67 L174 112 Q142 122 110 112 Z', 104, 62, 76, [142, 92, 1]);
  s += squareSail('M124 34 Q142 40 160 34 L156 54 Q142 60 128 54 Z', 122, 30, 40);
  s += squareSail('M186 76 Q208 83 230 76 L227 108 Q208 116 189 108 Z', 184, 72, 48, [208, 94, .6]);
  s += squareSail('M196 48 Q208 53 220 48 L217 62 Q208 67 199 62 Z', 194, 44, 28);
  s += '<path d="M132 22 L152 22 L149 32 L135 32 Z" fill="' + wd + '" stroke="' + wl + '"/>';
  s += pennant(142, 20) + pennant(208, 36) + pennant(78, 52);
  s += '</g>' + cvSeaFront(pre) + '</svg>';
  return s;
}

/* GALEÃO — inspirado nos galeões ibéricos: casco baixo, esporão, castelo de popa alto, conveses de canhões */
function galeaoSVG(pre){
  var wd = '#5b3513', wl = '#c58a4a', gd = '#f5b82e', rope = '#d9bf8c';
  var s = cvHead(pre, 'Galeão da Carreira das Índias');
  s += '<circle cx="150" cy="92" r="130" fill="url(#' + pre + 'glow)"/>' + cvSeaBack(pre);
  s += '<g class="cv-bob">';
  s += '<path d="M38 88 L82 88 L86 114 L208 118 L244 112 L286 126 L254 142 Q238 170 206 177 L92 179 Q54 170 42 132 Z" fill="url(#' + pre + 'hull)" stroke="' + wd + '" stroke-width="2.2" stroke-linejoin="round"/>';
  s += '<path d="M42 130 Q150 148 262 128 M48 148 Q150 164 248 143" fill="none" stroke="' + gd + '" stroke-width="2.4"/>';
  s += '<path d="M38 88 L82 88" stroke="' + gd + '" stroke-width="3.5" stroke-linecap="round"/>';
  s += '<rect x="46" y="96" width="9" height="9" rx="1.5" fill="' + gd + '"/><rect x="60" y="96" width="9" height="9" rx="1.5" fill="' + gd + '"/><rect x="74" y="97" width="8" height="9" rx="1.5" fill="' + gd + '"/>';
  s += '<path d="M40 88 L40 76" stroke="' + wd + '" stroke-width="2"/><circle cx="40" cy="73" r="4" fill="' + gd + '"/>';
  [104, 124, 144, 164, 184, 204].forEach(function(x){ s += '<rect x="' + (x - 4) + '" y="136" width="8" height="7" rx="1.5" fill="#1f2937" stroke="' + gd + '" stroke-width=".8"/>'; });
  [114, 135, 156, 177, 198].forEach(function(x){ s += '<rect x="' + (x - 4) + '" y="154" width="8" height="7" rx="1.5" fill="#1f2937" stroke="' + gd + '" stroke-width=".8"/>'; });
  s += '<path d="M254 126 L298 108" stroke="' + wd + '" stroke-width="4" stroke-linecap="round"/>';
  s += '<rect x="89.5" y="52" width="5" height="62" fill="' + wd + '"/><rect x="137.5" y="22" width="6" height="96" fill="' + wd + '"/><rect x="201.5" y="34" width="5" height="82" fill="' + wd + '"/>';
  s += '<path d="M140 22 L90 114 M140 22 L206 118 M204 34 L252 124 M204 34 L170 118 M92 52 L60 106 M92 52 L120 114" stroke="' + rope + '" stroke-width=".9" fill="none"/>';
  s += '<path d="M92 52 L58 106 L124 106 Z" fill="#f6eed8" stroke="#cdbb8b" stroke-width="1.2"/><path d="M92 52 L128 106" stroke="' + wd + '" stroke-width="2"/>';
  s += squareSail('M102 69 Q140 78 178 69 L174 112 Q140 122 106 112 Z', 100, 64, 80, [140, 94, 1.05]);
  s += squareSail('M120 32 Q140 39 160 32 L156 56 Q140 62 124 56 Z', 118, 28, 44);
  s += squareSail('M182 80 Q204 87 226 80 L222 110 Q204 118 186 110 Z', 180, 76, 48, [204, 96, .55]);
  s += squareSail('M188 44 Q204 50 220 44 L216 64 Q204 70 192 64 Z', 186, 40, 36);
  s += '<path d="M264 114 L292 110 L286 126 L266 128 Z" fill="#f6eed8" stroke="#cdbb8b" stroke-width="1.1"/>';
  s += pennant(140, 20, gd) + pennant(204, 32) + pennant(92, 50, gd);
  s += '</g>' + cvSeaFront(pre) + '</svg>';
  return s;
}

/* NAVIO A VAPOR — casco de ferro, duas chaminés, roda de pás e mastros auxiliares (século XIX) */
function vaporSVG(pre){
  var wd = '#5b3513', rope = '#d9bf8c';
  var s = cvHead(pre, 'Navio a Vapor Transatlântico');
  s += '<circle cx="150" cy="96" r="125" fill="url(#' + pre + 'glow)"/>' + cvSeaBack(pre);
  s += '<g class="cv-bob">';
  // fumaça
  [[121,44,8,.7],[136,36,10,.55],[154,29,12,.42],[174,24,13,.3],[196,20,13,.2]].forEach(function(c){ s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="#9ca3af" opacity="' + c[3] + '"/>'; });
  // mastros e velas auxiliares
  s += '<rect x="241" y="50" width="5" height="74" fill="' + wd + '"/><rect x="65.5" y="56" width="5" height="68" fill="' + wd + '"/>';
  s += '<path d="M243 52 L286 108 L246 112 Z" fill="#f6eed8" stroke="#cdbb8b" stroke-width="1.1"/><path d="M68 58 L38 118 L68 118 Z" fill="#f6eed8" stroke="#cdbb8b" stroke-width="1.1"/>';
  s += '<path d="M243 52 L68 58" stroke="' + rope + '" stroke-width=".9"/>';
  s += pennant(243, 50) + pennant(68, 56);
  // casco de ferro
  s += '<path d="M36 126 L250 122 L284 108 Q272 160 232 176 L84 178 Q50 168 36 142 Z" fill="url(#' + pre + 'iron)" stroke="#111827" stroke-width="2" stroke-linejoin="round"/>';
  s += '<path d="M52 160 Q150 172 240 165" fill="none" stroke="#9b1c1c" stroke-width="7"/>';
  s += '<path d="M36 126 L250 122" stroke="#e5e7eb" stroke-width="3"/>';
  for(var x = 70; x <= 230; x += 16){ if(x >= 126 && x <= 174) continue; s += '<circle cx="' + x + '" cy="138" r="2.7" fill="#fde68a" stroke="#111827" stroke-width=".7"/>'; }
  // casaria
  s += '<rect x="92" y="96" width="104" height="5" fill="' + wd + '"/><rect x="96" y="101" width="96" height="23" rx="2" fill="#e8e4d8" stroke="#8d8a7c"/>';
  for(var w = 0; w < 6; w++) s += '<rect x="' + (103 + w * 14) + '" y="108" width="8" height="8" rx="1" fill="#1e3a5f"/>';
  // chaminés
  s += '<rect x="112" y="54" width="18" height="44" fill="#1f2937"/><rect x="112" y="66" width="18" height="6" fill="#b91c1c"/><rect x="110" y="52" width="22" height="4" fill="#111827"/>';
  s += '<rect x="150" y="60" width="18" height="38" fill="#1f2937"/><rect x="150" y="71" width="18" height="6" fill="#b91c1c"/><rect x="148" y="58" width="22" height="4" fill="#111827"/>';
  // roda de pás
  s += '<circle cx="150" cy="152" r="23" fill="rgba(0,0,0,.2)" stroke="' + wd + '" stroke-width="3"/>';
  for(var a = 0; a < 8; a++){ var r = a * Math.PI / 4; s += '<path d="M150 152 L' + (150 + 23 * Math.cos(r)).toFixed(1) + ' ' + (152 + 23 * Math.sin(r)).toFixed(1) + '" stroke="' + wd + '" stroke-width="3"/>'; }
  s += '<circle cx="150" cy="152" r="4" fill="#c58a4a" stroke="' + wd + '"/>';
  s += '<path d="M282 112 L298 102" stroke="' + wd + '" stroke-width="3.5" stroke-linecap="round"/>';
  s += '</g>' + cvSeaFront(pre) + '</svg>';
  return s;
}

/* NAUTILUS — submarino do Capitão Nemo (Vinte Mil Léguas Submarinas) */
function nautilusSVG(pre){
  var gd = '#c9a24a';
  var s = cvHead(pre, 'Nautilus, o Submarino Magnífico');
  s += '<circle cx="150" cy="150" r="130" fill="url(#' + pre + 'glowB)"/>';
  s += '<g class="cv-bob">';
  s += '<path d="M60 134 L38 110 L54 148 Z M60 166 L38 192 L54 154 Z" fill="#3b4d66" stroke="#1b2a3d" stroke-width="1.5" stroke-linejoin="round"/>';
  s += '<path d="M44 150 Q58 124 150 122 Q244 124 262 150 Q244 178 150 179 Q58 178 44 150 Z" fill="url(#' + pre + 'steel)" stroke="#1b2a3d" stroke-width="2.2"/>';
  s += '<path d="M258 140 L294 150 L258 160 Z" fill="#64748b" stroke="#1b2a3d" stroke-width="1.6" stroke-linejoin="round"/>';
  [84, 112, 140, 168, 196, 224].forEach(function(x){ s += '<path d="M' + x + ' 127 Q' + (x - 5) + ' 150 ' + x + ' 175" fill="none" stroke="#1b2a3d" stroke-opacity=".6" stroke-width="1.4"/>'; });
  s += '<path d="M50 146 Q150 140 258 146" fill="none" stroke="' + gd + '" stroke-width="2.2"/>';
  s += '<ellipse cx="36" cy="138" rx="3.5" ry="10" fill="' + gd + '" stroke="#1b2a3d"/><ellipse cx="36" cy="162" rx="3.5" ry="10" fill="' + gd + '" stroke="#1b2a3d"/><circle cx="38" cy="150" r="4" fill="#8a6d2a" stroke="#1b2a3d"/>';
  s += '</g>';
  // água sobre o casco (submerso)
  s += '<g mask="url(#' + pre + 'wm)">' + cvWave(124, 5, 30, 'url(#' + pre + 'nd)') + '</g>';
  // torre de comando (fora da água)
  s += '<g class="cv-bob">';
  s += '<path d="M128 128 L132 106 L168 106 L172 128 Z" fill="url(#' + pre + 'steel)" stroke="#1b2a3d" stroke-width="1.8" stroke-linejoin="round"/>';
  s += '<path d="M136 106 Q150 90 164 106 Z" fill="#8a6d2a" stroke="#1b2a3d" stroke-width="1.5"/>';
  s += '<circle cx="150" cy="97" r="9" fill="rgba(250,204,21,.25)"/><circle cx="150" cy="97" r="4" fill="url(#' + pre + 'pglow)"/>';
  s += '<path d="M176 106 L176 86 L186 86" fill="none" stroke="#52667f" stroke-width="3" stroke-linecap="round"/>';
  [139, 150, 161].forEach(function(x){ s += '<circle cx="' + x + '" cy="117" r="3" fill="url(#' + pre + 'pglow)" stroke="' + gd + '" stroke-width="1"/>'; });
  s += '<ellipse cx="150" cy="127" rx="28" ry="3" fill="rgba(255,255,255,.4)"/>';
  // vigias iluminados
  [96, 128, 160, 192].forEach(function(x){ s += '<circle cx="' + x + '" cy="156" r="16" fill="rgba(250,204,21,.16)"/><circle cx="' + x + '" cy="156" r="9" fill="url(#' + pre + 'pglow)" stroke="' + gd + '" stroke-width="2.6"/><circle cx="' + (x - 3) + '" cy="153" r="2.2" fill="#fff" opacity=".8"/>'; });
  s += '</g>';
  [[26,120,3],[20,102,2],[32,88,1.6],[272,122,2.5],[280,104,1.8],[268,90,1.4]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="none" stroke="#bfe3ff" stroke-opacity=".7"/>'; });
  s += '</svg>';
  return s;
}

function shipSVG(evo, wr, pre, prestige){
  switch(tierOf(evo, wr)){
    case 'nautilus': return nautilusSVG(pre);
    case 'vapor':    return vaporSVG(pre);
    case 'galeao':   return galeaoSVG(pre);
    case 'nau':      return nauSVG(pre);
    default:         return caravelSVG(Math.min(12, Math.floor(evo / 20)), prestige, pre);
  }
}

/* ---------- Textos de cada fase ---------- */
var TIERS = {
  dourada: { badge:'Nível 5', title:'Caravela Dourada', desc:'Caravela latina de ouro e carvalho, com a Cruz de Cristo nas velas.', top:'Caravela Dourada', sub:'Ouro e carvalho • Nível 5', rank:'CAPITÃO-MOR', icon:'🎖️🎖️🎖️', ocean:'OCEANO DOS CLÁSSICOS' },
  nau:     { badge:'Nível 6', title:'Nau das Grandes Navegações', desc:'Inspirada nas naus portuguesas dos séculos XV e XVI, como a São Gabriel de Vasco da Gama: três mastros e castelos de proa e popa.', top:'Nau das Grandes Navegações', sub:'Três mastros e castelos • Nível 6', rank:'ALMIRANTE', icon:'🎖️🎖️🎖️⭐', ocean:'MAR DAS GRANDES NAVEGAÇÕES' },
  galeao:  { badge:'Nível 7', title:'Galeão da Carreira das Índias', desc:'Casco mais baixo, esporão e conveses de canhões, no estilo dos galeões ibéricos dos séculos XVI e XVII.', top:'Galeão da Carreira das Índias', sub:'Conveses de canhões • Nível 7', rank:'ALMIRANTE DA FROTA', icon:'🎖️🎖️🎖️⭐⭐', ocean:'CARREIRA DAS ÍNDIAS' },
  vapor:   { badge:'Nível 8', title:'Navio a Vapor Transatlântico', desc:'Casco de ferro, chaminés e roda de pás: a era do vapor, no século XIX.', top:'Navio a Vapor', sub:'Casco de ferro e chaminés • Nível 8', rank:'GRÃO-ALMIRANTE', icon:'🎖️🎖️🎖️⭐⭐⭐', ocean:'ERA DO VAPOR' },
  nautilus:{ badge:'Nível Máximo', title:'Nautilus, o Submarino Magnífico', desc:'Inspirado no submarino do Capitão Nemo, de Vinte Mil Léguas Submarinas, de Júlio Verne.', top:'Nautilus', sub:'1.000 lidas e 1.000 escritas • Nível Máximo', rank:'COMANDANTE DO NAUTILUS', icon:'🏆', ocean:'ABISMOS DO CONHECIMENTO' }
};

function setTxt(id, v){ var e = document.getElementById(id); if(e) e.textContent = v; }

function applyTier(evo){
  var wr = writtenPages();
  var tid = tierOf(evo, wr);

  var home = document.getElementById('home-ship-art');
  if(home){ home.style.fontSize = '0'; home.innerHTML = shipSVG(evo, wr, 'h', 0); }
  var dev = document.getElementById('ship-3d-icon');
  if(dev){ dev.style.fontSize = '0'; dev.innerHTML = shipSVG(evo, wr, 'd', 0); }

  if(tid !== 'base'){
    var t = TIERS[tid];
    setTxt('ship-level-badge', t.badge);
    setTxt('ship-level-title', t.title);
    setTxt('ship-level-desc', t.desc);
    setTxt('home-ship-title-top', t.top);
    setTxt('home-ship-subtitle', t.sub);
    setTxt('hi-rank-tag', t.rank);
    setTxt('hi-badge-icon', t.icon);
    setTxt('ship-ocean-title', t.ocean);
    setTxt('ship-pieces-txt', 'Rota até o Nautilus: ' + Math.min(evo, NAUT_READ) + ' / ' + NAUT_READ + ' págs lidas');
    setTxt('ship-xp-pct', Math.min(100, Math.round(evo / NAUT_READ * 100)) + '%');
  }

  // sem prestígio/reset
  ['prestige-container', 'prestige-stars'].forEach(function(id){ var e = document.getElementById(id); if(e) e.style.display = 'none'; });

  // sem edição manual do total geral
  var ti = document.getElementById('pg-edit-total');
  if(ti && ti.parentElement && ti.parentElement.parentElement) ti.parentElement.parentElement.style.display = 'none';

  // próxima meta
  var pt = document.getElementById('ship-pieces-txt');
  if(pt && pt.parentElement){
    var g = document.getElementById('cb-next-goal');
    if(!g){
      g = document.createElement('div');
      g.id = 'cb-next-goal';
      g.style.cssText = 'margin-top:10px;font-size:12px;line-height:1.5;color:#deb887;background:rgba(0,0,0,.28);padding:8px 12px;border-radius:8px;text-align:left';
      pt.parentElement.insertAdjacentElement('afterend', g);
    }
    var msg;
    if(evo < 240) msg = '⚓ Próximo marco: Caravela Dourada com 240 págs (faltam ' + (240 - evo) + ').';
    else if(evo < NAU_AT) msg = '⚓ Próximo: Nau das Grandes Navegações com ' + NAU_AT + ' págs (faltam ' + (NAU_AT - evo) + ').';
    else if(evo < GALEAO_AT) msg = '⚓ Próximo: Galeão da Carreira das Índias com ' + GALEAO_AT + ' págs (faltam ' + (GALEAO_AT - evo) + ').';
    else if(evo < VAPOR_AT) msg = '⚓ Próximo: Navio a Vapor com ' + VAPOR_AT + ' págs (faltam ' + (VAPOR_AT - evo) + ').';
    else if(tid !== 'nautilus') msg = '🌊 Para o Nautilus: ✍️ faltam ' + (NAUT_WRITE - wr) + ' págs escritas (' + wr + ' de ' + NAUT_WRITE + '; ' + WORDS_PER_PAGE + ' palavras = 1 pág).';
    else msg = '🌊 Nautilus desbloqueado: 1.000 págs lidas e 1.000 escritas!';
    g.textContent = msg;
  }

  // marcos históricos na lista de peças
  var list = document.getElementById('pieces-diary-list');
  if(list){
    var rows = [
      ['Nau das Grandes Navegações', NAU_AT + ' págs lidas', evo >= NAU_AT],
      ['Galeão da Carreira das Índias', GALEAO_AT + ' págs lidas', evo >= GALEAO_AT],
      ['Navio a Vapor', VAPOR_AT + ' págs lidas', evo >= VAPOR_AT],
      ['Nautilus, o Submarino Magnífico', NAUT_READ + ' lidas + ' + NAUT_WRITE + ' escritas', tid === 'nautilus']
    ];
    list.insertAdjacentHTML('beforeend', rows.map(function(r){
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(245,184,46,0.06);border-radius:6px;border:1px solid ' + (r[2] ? 'rgba(245,184,46,0.6)' : 'var(--border-color)') + '">' +
        '<span style="font-size:13px;color:' + (r[2] ? 'var(--text-main)' : 'var(--text-mut)') + '">⚓ ' + r[0] + ' (' + r[1] + ')</span>' +
        '<span style="font-size:12px">' + (r[2] ? '✅' : '🔒') + '</span></div>';
    }).join(''));
  }
}

/* ---------- updateUI: a evolução conta só páginas lidas depois do cadastro ---------- */
var _tierBase = updateUI;
updateUI = function(){
  var real = state.pages;
  var evo = evoPages();
  state.pages = evo;
  try{ _tierBase(); } finally { state.pages = real; }
  try{ applyTier(evo); }catch(err){ cbShowError('evolução: ' + err.message); }
};

/* ---------- Edição manual do total: desativada ---------- */
saveTotalPages = function(){ toast('A edição manual do total foi desativada.'); };

/* ---------- Livros: "Lidas" só na criação; páginas iniciais não contam ---------- */
var _openBookModalBase = openBookModal;
openBookModal = function(id){
  _openBookModalBase(id);
  var editing = id !== null && id !== undefined;
  var pr = document.getElementById('bk-pages-read');
  if(pr){
    pr.readOnly = editing;
    pr.style.opacity = editing ? '.55' : '1';
    var hint = document.getElementById('bk-lock-hint');
    if(!hint){
      hint = document.createElement('div');
      hint.id = 'bk-lock-hint';
      hint.style.cssText = 'font-size:11px;color:#a0aec0;margin:4px 0 0';
      pr.parentElement.insertAdjacentElement('afterend', hint);
    }
    hint.textContent = editing
      ? '🔒 As páginas lidas só avançam em "Lançar Páginas".'
      : 'Páginas já lidas antes de cadastrar não contam para a evolução da nau.';
  }
};

var _saveNewBookBase = saveNewBook;
saveNewBook = function(){
  var before = state.books ? state.books.length : 0;
  var wasEditing = editingBookId !== null;
  _saveNewBookBase();
  if(!wasEditing && state.books && state.books.length > before){
    var nb = state.books[state.books.length - 1];
    nb.start = nb.pages || 0;
    save();
    updateUI();
    renderBooks();
  }
};

if(state && state.logged) { try{ updateUI(); }catch(e){} }
