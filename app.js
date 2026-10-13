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
  if(!n || !m || !p){ toast
