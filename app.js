var KEY = 'cbbook_v4';
var state = load() || fresh();

function fresh(){
  return {
    v:1, logged:false, name:'', email:'', plan:0, ints:[],
    pages:0, goal:30, streak:0, hit:false, words:0,
    books: [],
    friends: [
      { id: 1, name: 'Carlos Almirante', pages: 145, level: 'Caravela de Exploração' },
      { id: 2, name: 'Mariana Navigator', pages: 85, level: 'Barco de Pesca' }
    ],
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
    list.innerHTML = `<div class="mut">Nenhum aliado na frota ainda.</div>`;
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

function logPages(){
  let sel = document.getElementById('log-book-select');
  let targetBookId = selectedBookIdForLog || (sel ? parseInt(sel.value) : null);

  let book = state.books.find(b => b.id === targetBookId);
  if(!book){
    toast('Selecione um livro válido');
    return;
  }

  book.pages = Math.min(book.total, book.pages + currentAdd);
  recalculateTotalPages();
  state.streak = 1;

  save();
  updateUI();
  renderBooks();
  closeSheets();
  toast('Leitura registrada para ' + book.title + '!');
}

function updateUI(){
  document.getElementById('hi-name').textContent = 'Olá, ' + (state.name || 'Fagner') + '.';
  document.getElementById('hi-pages').textContent = state.pages;
  
  let pct = Math.min(100, Math.round((state.pages / state.goal) * 100));
  document.getElementById('hi-bpct').textContent = pct + '%';
  
  let donutPath = document.getElementById('donut-path');
  let donutPct = document.getElementById('donut-pct');
  let donutDesc = document.getElementById('donut-desc');
  
  if(donutPath) donutPath.setAttribute('stroke-dasharray', `${pct}, 100`);
  if(donutPct) donutPct.textContent = pct + '%';
  if(donutDesc) donutDesc.textContent = `${state.pages} de ${state.goal} páginas da meta alcançadas.`;

  // Evolução 3D / Lúdica da Embarcação
  let totalPages = state.pages;
  let piecesEarned = Math.min(12, Math.floor(totalPages / 20)); 
  let shipPct = Math.round((piecesEarned / 12) * 100);

  let badge = document.getElementById('ship-level-badge');
  let icon3d = document.getElementById('ship-3d-icon');
  let title = document.getElementById('ship-level-title');
  let desc = document.getElementById('ship-level-desc');
  let piecesTxt = document.getElementById('ship-pieces-txt');
  let xpPct = document.getElementById('ship-xp-pct');

  if(piecesEarned >= 10){
    if(badge) badge.textContent = 'Nível 4 (Máximo)';
    if(icon3d) icon3d.textContent = '🏴‍☠️⛵';
    if(title) title.textContent = 'Nau Capitânia Lendária';
    if(desc) desc.textContent = 'Sua frota domina os mares do conhecimento com canhões e bandeira dourada!';
  } else if(piecesEarned >= 6){
    if(badge) badge.textContent = 'Nível 3';
    if(icon3d) icon3d.textContent = '🚢⚓';
    if(title) title.textContent = 'Caravela de Exploração';
    if(desc) desc.textContent = 'Casco reforçado e velas duplas erguidas para longas jornadas de estudo.';
  } else if(piecesEarned >= 3){
    if(badge) badge.textContent = 'Nível 2';
    if(icon3d) icon3d.textContent = '⛵🌊';
    if(title) title.textContent = 'Barco de Pesca / Vela Leve';
    if(desc) desc.textContent = 'O mastro está firme e o leme começa a guiar sua rotina literária.';
  } else {
    if(badge) badge.textContent = 'Nível 1';
    if(icon3d) icon3d.textContent = '🪵🛶';
    if(title) title.textContent = 'Jangada de Toras';
    if(desc) desc.textContent = 'O ponto de partida do navegador. Leia mais páginas para construir novas peças!';
  }

  if(piecesTxt) piecesTxt.textContent = `Peças conquistadas: ${piecesEarned} / 12`;
  if(xpPct) xpPct.textContent = shipPct + '%';

  let stkEl = document.querySelector('.stk');
  if(stkEl) stkEl.textContent = state.streak;
  let mailEl = document.getElementById('pg-mail');
  if(mailEl) mailEl.textContent = state.email;
  let totalInput = document.getElementById('pg-edit-total');
  if(totalInput) totalInput.value = state.pages;
  
  updateActiveBookDisplay();
  renderFriends();
}

function initApp(){
  updateUI();
  renderBooks();
  renderFriends();
  if(state.logged){
    go('s-app');
  }
}

window.onload = function(){
  if(state.logged){
    go('s-app');
    initApp();
  } else {
    go('s-login');
  }
};
