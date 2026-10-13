var KEY = 'cbbook_v1';
var S;
var T = {type:'Livro', amt:10, terms:true, qa:false, qsel:-1};
var tmr, edIdx = -1;

function $(id){ return document.getElementById(id); }

function fresh(){
  return {
    v:1, logged:false, name:'Fagner', email:'fagner@exemplo.com', plan:1, ints:[],
    pages:0, goal:30, streak:0, hit:false, words:0,
    book:{t:'Dom Casmurro', a:'Machado de Assis', p:0, total:256},
    qd:0, qt:0, qr:0, qi:0, erros:[], sub:{}, lastSub:'',
    ch:[{t:'Capítulo 1', x:''}]
  };
}

function load(){
  try{
    var r = localStorage.getItem(KEY);
    if(r){ S = Object.assign(fresh(), JSON.parse(r)); return; }
  }catch(e){}
  S = fresh();
}

function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }

function go(id){
  document.querySelectorAll('.sc').forEach(s => s.classList.remove('act'));
  $(id).classList.add('act');
}

function tab(n){
  document.querySelectorAll('.v').forEach(v => v.classList.remove('act'));
  document.querySelectorAll('.nav button').forEach(b => b.classList.remove('on'));
  
  var targetV = $('v-' + n);
  var targetN = $('n-' + n);
  if(targetV) targetV.classList.add('act');
  if(targetN) targetN.classList.add('on');
}

function toast(m){
  var t = $('toast');
  t.textContent = m;
  t.classList.add('act');
  clearTimeout(tmr);
  tmr = setTimeout(function(){ t.classList.remove('act'); }, 2200);
}

function openSheet(){
  $('scrim').classList.add('act');
  $('sheet').classList.add('act');
}

function openEd(i){
  edIdx = i;
  var c = i >= 0 ? S.ch[i] : {t:'Capítulo ' + (S.ch.length + 1), x:''};
  $('edt').value = c.t;
  $('edx').value = c.x;
  edCount();
  $('scrim').classList.add('act');
  $('ed').classList.add('act');
}

function closeSheets(){
  $('scrim').classList.remove('act');
  $('sheet').classList.remove('act');
  $('ed').classList.remove('act');
}

function stepAmt(d){
  T.amt = Math.max(5, T.amt + d);
  $('amt').textContent = T.amt;
}

function logPages(){
  S.pages += T.amt;
  S.book.p = Math.min(S.book.total, S.book.p + T.amt);
  save();
  render();
  closeSheets();
  toast('+' + T.amt + ' páginas registradas!');
}

function edCount(){
  var m = String($('edx').value || '').trim().match(/\S+/g);
  $('edc').textContent = (m ? m.length : 0) + ' palavras';
}

function edSave(){
  if(edIdx < 0){ S.ch.push({t:'', x:''}); edIdx = S.ch.length - 1; }
  S.ch[edIdx].t = $('edt').value.trim() || ('Capítulo ' + (edIdx + 1));
  S.ch[edIdx].x = $('edx').value;
  save();
  closeSheets();
  render();
  toast('Capítulo salvo!');
}

function login(){ enterApp(); }
function signup(){ go('s-plan'); }
function selPlan(n){ S.plan = n; }
function enterApp(){ S.logged = true; save(); go('s-app'); tab('hoje'); render(); }
function logout(){ S.logged = false; save(); go('s-login'); }

function render(){
  $('hi-name').textContent = S.name ? 'Olá, ' + S.name.split(' ')[0] + '.' : 'Olá!';
  $('hi-pages').textContent = S.pages;
  $('hi-book').textContent = S.book.t;
  $('hi-author').textContent = S.book.a;
  
  var bp = Math.round((S.pages / S.goal) * 100);
  $('hi-bpct').textContent = bp + '%';
  $('ac-cover').textContent = S.book.t.charAt(0);
  
  $('lv-title').textContent = S.book.t;
  $('lv-author').textContent = S.book.a;
  $('lv-txt').textContent = 'p. ' + S.book.p + ' de ' + S.book.total;
  
  document.querySelectorAll('.stk').forEach(e => e.textContent = S.streak);
  
  var acc = S.qt ? Math.round(100 * S.qr / S.qt) : 0;
  $('qacc').textContent = acc + '%';
  $('pg-mail').textContent = S.email;
}

function init(){
  load();
  render();
  if(S.logged){ go('s-app'); tab('hoje'); }
}

init();
