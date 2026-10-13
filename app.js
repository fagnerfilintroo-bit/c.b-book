var KEY = 'cbbook_v3';
var state = load() || fresh();

function fresh(){
  return {
    v:1, logged:false, name:'', email:'', plan:0, ints:[],
    pages:0, goal:30, streak:0, hit:false, words:0,
    books: [],
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

// Livros (Adicionar e Editar)
let editingBookId = null;

function openBookModal(id = null){
  editingBookId = id;
  let titleInput = document.getElementById('bk-title');
  let authorInput = document.getElementById('bk-author');
  let pagesInput = document.getElementById('bk-pages');
  let coverInput = document.getElementById('bk-cover');
  let modalTitle = document.getElementById('book-modal-title');

  if(id !== null && state.books){
    let book = state.books.find(b => b.id === id);
    if(book){
      modalTitle.textContent = 'Editar Livro';
      titleInput.value = book.title;
      authorInput.value = book.author;
      pagesInput.value = book.total;
      coverInput.value = book.cover || '';
    }
  } else {
    modalTitle.textContent = 'Adicionar Novo Livro';
    titleInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
    coverInput.value = '';
  }

  document.getElementById('scrim').classList.add('act');
  document.getElementById('book-sheet').classList.add('act');
}

function saveNewBook(){
  let title = document.getElementById('bk-title').value;
  let author = document.getElementById('bk-author').value;
  let pages = parseInt(document.getElementById('bk-pages').value) || 100;
  let cover = document.getElementById('bk-cover').value;

  if(!title){ toast('Digite o título do livro'); return; }

  if(!state.books) state.books = [];

  if(editingBookId !== null){
    let book = state.books.find(b => b.id === editingBookId);
    if(book){
      book.title = title;
      book.author = author || 'Desconhecido';
      book.total = pages;
      book.cover = cover;
    }
    toast('Livro atualizado com sucesso!');
  } else {
    state.books.push({
      id: Date.now(),
      title: title,
      author: author || 'Desconhecido',
      pages: 0,
      total: pages,
      cover: cover
    });
    toast('Livro adicionado com sucesso!');
  }

  save();
  renderBooks();
  updateActiveBookDisplay();
  closeSheets();
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
    return `
      <div class="card" style="display:flex;gap:14px;align-items:center;margin:0 0 10px 0">
        <div class="bk" style="${b.cover ? 'background-image:url('+b.cover+');background-size:cover;' : ''}">${b.cover ? '' : b.title.charAt(0)}</div>
        <div style="flex:1;min-width:0">
          <div class="t" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</div>
          <div class="mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.author}</div>
          <div class="mut" style="margin-top:4px">Progresso: ${b.pages} / ${b.total} pág (${pct}%)</div>
        </div>
        <button class="ib" onclick="openBookModal(${b.id})" title="Editar"><i class="ti ti-pencil"></i></button>
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

// Registro de Leitura
let currentAdd = 10;
function openSheet(){
  document.getElementById('scrim').classList.add('act');
  document.getElementById('sheet').classList.add('act');
}

function closeSheets(){
  document.getElementById('scrim').classList.remove('act');
  document.getElementById('sheet').classList.remove('act');
  document.getElementById('book-sheet').classList.remove('act');
  document.getElementById('ed').classList.remove('act');
}

function stepAmt(delta){
  currentAdd = Math.max(5, currentAdd + delta);
  document.getElementById('amt').textContent = currentAdd;
}

function logPages(){
  state.pages += currentAdd;
  state.streak = 1;
  
  if(state.books && state.books.length > 0){
    state.books[0].pages = Math.min(state.books[0].total, state.books[0].pages + currentAdd);
  }

  save();
  updateUI();
  renderBooks();
  closeSheets();
  toast('Leitura registrada com sucesso!');
}

function updateUI(){
  document.getElementById('hi-name').textContent = 'Olá, ' + (state.name || 'Fagner') + '.';
  document.getElementById('hi-pages').textContent = state.pages;
  let pct = Math.round((state.pages / state.goal) * 100);
  document.getElementById('hi-bpct').textContent = pct + '%';
  document.querySelector('.stk').textContent = state.streak;
  document.getElementById('pg-mail').textContent = state.email;
  updateActiveBookDisplay();
}

function initApp(){
  updateUI();
  renderBooks();
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
