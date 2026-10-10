/*
  c.b book - lógica do app
  Os dados da pessoa ficam salvos no próprio navegador (localStorage).
  O login ainda é de mentirinha: não há servidor nem senha de verdade.
  As questões e os livros ficam em dados.js.
*/
var KEY = 'cbbook_v1';
var C1 = 2 * Math.PI * 52;   // circunferência do anel de meta
var C2 = 2 * Math.PI * 40;   // circunferência da rosca
var S;                       // dados salvos da pessoa
var T = {type:'Livro', amt:10, terms:true, qa:false, qsel:-1};   // estado temporário (não salva)
var tmr, edIdx = -1;
var TGN = ['Enem', 'Concurso público', 'Vestibular'];
var PN = ['Gratuito', 'Leitor', 'Autor'];

function $(id){ return document.getElementById(id); }
function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function iso(d){
  var m = d.getMonth() + 1, dd = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
}
function wc(t){ var m = String(t || '').trim().match(/\S+/g); return m ? m.length : 0; }

/* ---------- dados salvos ---------- */
function fresh(){
  return {
    v:1, logged:false, name:'', email:'', plan:1, ints:[], tg:0,
    date:'', pages:0, goal:30, streak:0, hit:false, words:0, day:false,
    types:{Livro:0, Ebook:0, Artigo:0, HQ:0},
    week:[0,0,0,0,0,0],
    book:{t:'Dom Casmurro', a:'Machado de Assis', p:0, total:256},
    qd:0, qt:0, qr:0, qi:0, erros:[], sub:{}, lastSub:'', pl:[false,false,false],
    saved:{},
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

/* vira o dia: guarda as páginas de ontem no gráfico e zera as metas */
function rollDay(){
  var t = iso(new Date());
  if(S.date === t){ return; }
  if(S.date){
    var diff = Math.round((new Date(t + 'T00:00:00') - new Date(S.date + 'T00:00:00')) / 86400000);
    if(diff >= 1){
      S.week.push(S.pages);
      for(var i = 1; i < diff; i++){ S.week.push(0); }
      S.week = S.week.slice(-6);
      if(!S.hit || diff > 1){ S.streak = 0; }
    }
  }
  S.pages = 0; S.words = 0; S.qd = 0; S.day = false; S.hit = false;
  S.pl = [false, false, false]; S.date = t;
  save();
}

function hello(){
  var h = new Date().getHours();
  var g = h < 12 ? 'Bom dia' : (h < 18 ? 'Boa tarde' : 'Boa noite');
  var n = S.name ? S.name.split(' ')[0] : '';
  return n ? g + ', ' + n : g;
}
function subjects(){
  var l = [];
  for(var i = 0; i < QUESTOES.length; i++){ if(l.indexOf(QUESTOES[i].s) < 0){ l.push(QUESTOES[i].s); } }
  return l;
}
function subPct(k){ var x = S.sub[k]; return x && x.t ? Math.round(100 * x.c / x.t) : 0; }

/* ---------- telas e abas ---------- */
function go(id){
  var a = document.querySelectorAll('.sc');
  for(var i = 0; i < a.length; i++){ a[i].classList.remove('act'); }
  $(id).classList.add('act');
}
function tab(n){
  var v = document.querySelectorAll('.v');
  for(var i = 0; i < v.length; i++){ v[i].classList.remove('act'); }
  $('v-' + n).classList.add('act');
  var nid = (n === 'desc') ? 'leitura' : n;
  var b = document.querySelectorAll('.nav button');
  for(var j = 0; j < b.length; j++){ b[j].classList.remove('on'); }
  $('n-' + nid).classList.add('on');
  document.querySelector('.views').scrollTop = 0;
  if(n === 'desc'){ drawDesc(); }
}
function toast(m){
  var t = $('toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(tmr);
  tmr = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}

/* ---------- entrar, criar conta, plano, interesses ---------- */
function login(){
  var m = $('lg-mail').value.trim().toLowerCase(), p = $('lg-pass').value;
  if(!m || !p){ toast('Preencha e-mail e senha'); return; }
  if(S.email && S.email === m){ enterApp(); return; }
  toast('Conta não encontrada neste aparelho. Toque em Criar conta.');
}
function tgTerms(){
  T.terms = !T.terms;
  var b = $('tbox');
  b.className = 'ck' + (T.terms ? ' on' : '');
  b.innerHTML = T.terms ? '<i class="ti ti-check" aria-hidden="true"></i>' : '';
}
function signup(){
  var n = $('su-name').value.trim();
  var m = $('su-mail').value.trim().toLowerCase();
  var p = $('su-pass').value;
  if(!n){ toast('Digite seu nome'); return; }
  if(m.indexOf('@') < 1 || m.indexOf('.') < 0){ toast('Digite um e-mail válido'); return; }
  if(p.length < 6){ toast('A senha precisa ter 6 caracteres ou mais'); return; }
  if(!T.terms){ toast('Aceite os termos para continuar'); return; }
  S.name = n; S.email = m;     // a senha não é guardada
  save();
  go('s-plan');
}
function selPlan(n){
  S.plan = n; save();
  for(var i = 0; i < 3; i++){ $('p' + i).classList.toggle('sel', i === n); }
  $('planbtn').textContent = 'Continuar com ' + PN[n];
}
function tgInt(el){
  el.classList.toggle('sel');
  S.ints = [];
  var c = document.querySelectorAll('#ints .ch.sel');
  for(var i = 0; i < c.length; i++){ S.ints.push(c[i].textContent); }
  save();
  $('intcount').textContent = S.ints.length ? S.ints.length + ' escolhido(s)' : 'Nenhum escolhido ainda';
}
function enterApp(){
  S.logged = true; save();
  go('s-app'); tab('hoje'); render();
}
function logout(){
  S.logged = false; save();
  $('lg-pass').value = '';
  go('s-login');
}
function wipe(){
  if(!confirm('Apagar todos os seus dados deste aparelho? Isso não pode ser desfeito.')){ return; }
  try{ localStorage.removeItem(KEY); }catch(e){}
  S = fresh(); rollDay();
  var c = document.querySelectorAll('#ints .ch');
  for(var i = 0; i < c.length; i++){ c[i].classList.remove('sel'); }
  $('intcount').textContent = 'Nenhum escolhido ainda';
  selPlan(1); render(); go('s-login');
}

/* ---------- gráficos ---------- */
function bars(id){
  var all = S.week.concat([S.pages]), mx = S.goal, h = '', i, d = new Date();
  for(i = 0; i < all.length; i++){ if(all[i] > mx){ mx = all[i]; } }
  for(i = 0; i < all.length; i++){
    var dt = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (all.length - 1 - i));
    var ht = Math.max(6, Math.round(all[i] / mx * 84));
    h += '<div class="bw"><div class="' + (i === all.length - 1 ? 't' : '') + '" style="height:' + ht + 'px"></div><span>' + 'dstqqss'.charAt(dt.getDay()) + '</span></div>';
  }
  $(id).innerHTML = h;
}
function drawSubj(id){
  var l = subjects(), h = '';
  for(var i = 0; i < l.length; i++){
    var x = S.sub[l[i]], p = subPct(l[i]);
    h += '<div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>' + esc(l[i]) + '</span><span class="mut">' + (x && x.t ? p + '% (' + x.t + ')' : 'sem respostas') + '</span></div><div class="track" style="margin-top:6px"><div style="width:' + p + '%"></div></div></div>';
  }
  $(id).innerHTML = h;
}
function showChart(n){
  $('ch0').style.display = n === 0 ? 'block' : 'none';
  $('ch1').style.display = n === 1 ? 'block' : 'none';
  $('sg0').classList.toggle('on', n === 0);
  $('sg1').classList.toggle('on', n === 1);
}

/* ---------- questões ---------- */
function drawQ(){
  var Q = QUESTOES[S.qi % QUESTOES.length], L = ['A','B','C','D'], h = '';
  h += '<div class="rowb" style="justify-content:space-between"><span class="badge">' + esc(Q.s) + '</span><span class="mut">questão ' + ((S.qi % QUESTOES.length) + 1) + ' de ' + QUESTOES.length + '</span></div>';
  h += '<div style="font-size:15px;line-height:1.5;margin-top:12px;font-weight:500">' + esc(Q.q) + '</div>';
  for(var i = 0; i < 4; i++){
    var cl = 'opt';
    if(T.qa){
      if(i === Q.c){ cl += ' ok'; }
      else if(i === T.qsel){ cl += ' no'; }
      else { cl += ' off'; }
    }
    h += '<button class="' + cl + '" onclick="answer(' + i + ')"><span class="l">' + L[i] + '</span><span>' + esc(Q.o[i]) + '</span></button>';
  }
  if(T.qa){
    var ok = (T.qsel === Q.c);
    h += '<div style="margin-top:12px;padding:12px;border-radius:14px;background:rgba(37,180,255,.1);border:1px solid rgba(37,180,255,.3)"><div style="font-weight:600;color:' + (ok ? '#2EE6C8' : '#FF8FA6') + '">' + (ok ? 'Resposta certa' : 'Resposta errada · anotada no caderno de erros') + '</div><div class="mut" style="margin-top:4px;line-height:1.5">' + esc(Q.e) + '</div></div>';
    h += '<button class="pb" onclick="nextQ()">Próxima questão</button>';
  } else {
    h += '<div class="mut" style="margin-top:12px;text-align:center">Toque na alternativa que você acha correta</div>';
  }
  $('quiz').innerHTML = h;
}
function answer(i){
  if(T.qa){ return; }
  var Q = QUESTOES[S.qi % QUESTOES.length], ok = (i === Q.c), k = S.erros.indexOf(Q.id);
  T.qa = true; T.qsel = i;
  S.qt++; S.qd++; S.lastSub = Q.s;
  if(!S.sub[Q.s]){ S.sub[Q.s] = {c:0, t:0}; }
  S.sub[Q.s].t++;
  if(ok){ S.qr++; S.sub[Q.s].c++; if(k >= 0){ S.erros.splice(k, 1); } }
  else if(k < 0){ S.erros.push(Q.id); }
  save(); render();
  toast(ok ? 'Resposta certa' : 'Anotado no caderno de erros');
}
function nextQ(){
  S.qi = (S.qi + 1) % QUESTOES.length;
  T.qa = false; T.qsel = -1;
  save(); render();
}
function setTg(n){
  S.tg = n; save();
  var b = document.querySelectorAll('#tgc button');
  for(var i = 0; i < b.length; i++){ b[i].classList.toggle('on', i === n); }
  toast('Alvo: ' + TGN[n]);
}
function tgPl(i){ S.pl[i] = !S.pl[i]; save(); render(); }

/* ---------- Descobrir ---------- */
function matches(b){
  if(!S.ints.length){ return true; }
  for(var i = 0; i < b.tags.length; i++){ if(S.ints.indexOf(b.tags[i]) >= 0){ return true; } }
  return false;
}
function sv(i){
  var t = LIVROS[i].t;
  S.saved[t] = !S.saved[t];
  save(); drawDesc();
  toast(S.saved[t] ? 'Salvo na sua estante' : 'Removido da estante');
}
function drawDesc(){
  var chips = '', l = S.ints.length ? S.ints : ['Todos os gêneros'], i;
  for(i = 0; i < l.length; i++){ chips += '<span class="pill">' + esc(l[i]) + '</span>'; }
  $('dchips').innerHTML = chips;

  var list = LIVROS.filter(matches), note = '';
  if(!list.length){ list = LIVROS.slice(); note = 'Ainda não temos títulos para esses interesses. Veja estes clássicos:'; }
  var feat = list[Math.floor(Date.now() / 86400000) % list.length];
  var h = '';
  h += '<div class="card" style="border-color:rgba(37,180,255,.7);box-shadow:inset 0 0 22px rgba(40,140,255,.12),0 0 20px rgba(20,120,255,.25)">';
  h += '<div class="rowb" style="gap:8px"><span class="badge">leitura do dia</span><span class="mut">15 min</span></div>';
  h += '<div class="rowb" style="margin-top:10px"><div class="bk" style="--sp:' + feat.cor + '"><span>' + esc(feat.t.charAt(0)) + '</span></div>';
  h += '<div style="flex:1"><div class="t" style="font-size:19px">' + esc(feat.t) + '</div><div class="mut">' + esc(feat.a) + ' · ' + esc(feat.pais) + '</div><div class="mut">domínio público</div></div></div>';
  h += '<button class="wb" onclick="toast(\'Leitor de livros: próxima etapa\')">Ler agora</button></div>';
  h += '<div class="sec"><h3>Para você</h3></div>';
  if(note){ h += '<div class="mut" style="margin:8px 18px 0">' + note + '</div>'; }
  for(i = 0; i < list.length; i++){
    var b = list[i];
    if(b === feat){ continue; }
    var on = !!S.saved[b.t], idx = LIVROS.indexOf(b);
    h += '<div class="card rowb"><div class="bk" style="--sp:' + b.cor + '"><span>' + esc(b.t.charAt(0)) + '</span></div>';
    h += '<div style="flex:1;min-width:0"><div class="t">' + esc(b.t) + '</div><div class="mut">' + esc(b.a) + ' · ' + esc(b.pais) + '</div><span class="badge" style="display:inline-block;margin-top:6px">' + esc(b.tags[b.tags.length > 2 ? 2 : 0]) + '</span></div>';
    h += '<button class="sv' + (on ? ' on' : '') + '" onclick="sv(' + idx + ')">' + (on ? 'Salvo' : 'Salvar') + '</button></div>';
  }
  $('dlist').innerHTML = h;
}

/* ---------- Estúdio ---------- */
function drawChaps(){
  var h = '';
  for(var i = 0; i < S.ch.length; i++){
    h += '<button class="chap" onclick="openEd(' + i + ')"><span class="cn">' + (i + 1) + '</span><span style="flex:1">' + esc(S.ch[i].t) + '</span><span class="mut">' + wc(S.ch[i].x) + ' palavras</span></button>';
  }
  $('chaps').innerHTML = h;
}
function openEd(i, def){
  edIdx = i;
  var c = i >= 0 ? S.ch[i] : {t:(def || 'Capítulo ' + (S.ch.length + 1)), x:''};
  $('edt').value = c.t; $('edx').value = c.x; edCount();
  $('ed').classList.add('show'); $('scrim').classList.add('show');
}
function edCount(){ $('edc').textContent = wc($('edx').value) + ' palavras'; }
function edSave(){
  if(edIdx < 0){ S.ch.push({t:'', x:''}); edIdx = S.ch.length - 1; }
  var c = S.ch[edIdx], antes = wc(c.x);
  c.t = $('edt').value.trim() || ('Capítulo ' + (edIdx + 1));
  c.x = $('edx').value;
  var depois = wc(c.x);
  if(depois > antes){ S.words += depois - antes; }
  save(); closeSheets(); render();
  toast('Capítulo salvo');
}

/* ---------- registrar leitura ---------- */
function openSheet(){ $('sheet').classList.add('show'); $('scrim').classList.add('show'); }
function closeSheets(){
  $('sheet').classList.remove('show');
  $('ed').classList.remove('show');
  $('scrim').classList.remove('show');
}
function pickType(el, t){
  T.type = t;
  var c = document.querySelectorAll('#types .ch');
  for(var i = 0; i < c.length; i++){ c[i].classList.remove('sel'); }
  el.classList.add('sel');
}
function stepAmt(d){ T.amt = Math.max(5, T.amt + d); $('amt').textContent = T.amt; }
function logPages(){
  var was = S.pages < S.goal;
  S.pages += T.amt;
  S.types[T.type] += T.amt;
  if(T.type === 'Livro'){ S.book.p = Math.min(S.book.total, S.book.p + T.amt); }
  var hit = was && S.pages >= S.goal && !S.hit;
  if(hit){ S.hit = true; S.streak++; }
  save(); render(); closeSheets();
  toast(hit ? 'Meta batida! Sequência: ' + S.streak + ' dias' : '+' + T.amt + ' páginas registradas');
}

/* ---------- desenha tudo ---------- */
function render(){
  var i, p = Math.min(S.pages / S.goal, 1);
  var bp = S.book.total ? Math.round(100 * S.book.p / S.book.total) : 0;

  // Início
  $('hi-name').textContent = S.name ? 'Olá, ' + S.name.split(' ')[0] : 'Olá!';
  $('hi-ring').style.strokeDashoffset = C1 * (1 - p);
  $('hi-pages').textContent = S.pages;
  $('hi-book').textContent = S.book.t;
  $('hi-author').textContent = S.book.a;
  $('hi-bp').style.width = bp + '%';
  $('hi-bpct').textContent = bp + '%';
  $('ac-cover').textContent = S.book.t.charAt(0);
  $('ac-title').textContent = S.book.t;
  $('ac-author').textContent = S.book.a;
  $('ac-bar').style.width = bp + '%';
  $('ac-pct').textContent = bp + '%';
  var subs = subjects(), ls = S.lastSub || subs[0];
  $('st-sub').textContent = ls;
  $('st-bar').style.width = subPct(ls) + '%';
  $('st-pct').textContent = subPct(ls) + '%';

  // Leitura
  $('greet2').textContent = hello();
  $('ringp').style.strokeDashoffset = C1 * (1 - p);
  $('ringn').textContent = S.pages;
  $('ringg').textContent = 'de ' + S.goal + ' páginas';
  var left = Math.max(S.goal - S.pages, 0);
  $('rsub').textContent = left > 0 ? 'Faltam ' + left + ' páginas para fechar o dia' : 'Meta do dia batida. Bom trabalho!';
  $('lv-cover').textContent = S.book.t.charAt(0);
  $('lv-title').textContent = S.book.t;
  $('lv-author').textContent = S.book.a;
  $('lv-bar').style.width = bp + '%';
  $('lv-txt').textContent = 'p. ' + S.book.p + ' de ' + S.book.total + ' · ' + bp + '%';
  var sk = document.querySelectorAll('.stk');
  for(i = 0; i < sk.length; i++){ sk[i].textContent = S.streak; }

  // rosca
  var keys = ['Livro','Ebook','Artigo','HQ'], tot = 0, cum = 0;
  for(i = 0; i < 4; i++){ tot += S.types[keys[i]]; }
  for(i = 0; i < 4; i++){
    var len = tot ? C2 * S.types[keys[i]] / tot : 0;
    $('d' + i).setAttribute('stroke-dasharray', len + ' ' + C2);
    $('d' + i).setAttribute('stroke-dashoffset', -cum);
    cum += len;
    $('l' + i).textContent = keys[i] + ' ' + (tot ? Math.round(100 * S.types[keys[i]] / tot) : 0) + '%';
  }
  $('dtot').textContent = tot;
  $('ptot').textContent = tot + ' páginas no total';
  bars('bars1'); bars('bars2');

  // Concursos
  var acc = S.qt ? Math.round(100 * S.qr / S.qt) : 0;
  $('qd').textContent = S.qd;
  $('qacc').textContent = acc + '%';
  $('qacc2').textContent = acc + '%';
  var en = document.querySelectorAll('.errn');
  for(i = 0; i < en.length; i++){ en[i].textContent = S.erros.length; }
  if(S.qd >= 20){ S.pl[0] = true; }
  var pd = 0;
  for(i = 0; i < 3; i++){
    var ck = $('pk' + i);
    ck.className = 'ck' + (S.pl[i] ? ' on' : '');
    ck.innerHTML = S.pl[i] ? '<i class="ti ti-check" aria-hidden="true"></i>' : '';
    if(S.pl[i]){ pd++; }
  }
  $('pdone').textContent = pd + ' de 3';
  var tb = document.querySelectorAll('#tgc button');
  for(i = 0; i < tb.length; i++){ tb[i].classList.toggle('on', i === S.tg); }
  drawSubj('subj1'); drawSubj('subj2');
  drawQ();

  // Estúdio
  var wt = 0;
  for(i = 0; i < S.ch.length; i++){ wt += wc(S.ch[i].x); }
  $('wtot').textContent = wt.toLocaleString('pt-BR') + ' palavras';
  $('wbar').style.width = Math.min(wt / 5000 * 100, 100) + '%';
  drawChaps();

  // Progresso
  var wk = S.pages;
  for(i = 0; i < S.week.length; i++){ wk += S.week[i]; }
  $('wk').textContent = wk;
  $('hp').style.width = Math.round(p * 100) + '%';
  $('hpt').textContent = S.pages + ' / ' + S.goal;
  $('hq').style.width = Math.round(Math.min(S.qd / 20, 1) * 100) + '%';
  $('hqt').textContent = Math.min(S.qd, 20) + ' / 20';
  $('hw').style.width = Math.round(Math.min(S.words / 300, 1) * 100) + '%';
  $('hwt').textContent = S.words + ' / 300';
  var gd = 0;
  if(S.pages >= S.goal){ gd++; }
  if(S.qd >= 20){ gd++; }
  if(S.words >= 300){ gd++; }
  $('gdone').textContent = gd + ' de 3 concluídas';
  $('pg-mail').textContent = S.email ? S.name + ' · ' + S.email : 'Sem conta';
}

/* ---------- começo ---------- */
function init(){
  load(); rollDay();
  selPlan(S.plan);
  var c = document.querySelectorAll('#ints .ch');
  for(var i = 0; i < c.length; i++){ if(S.ints.indexOf(c[i].textContent) >= 0){ c[i].classList.add('sel'); } }
  if(S.ints.length){ $('intcount').textContent = S.ints.length + ' escolhido(s)'; }
  render();
  if(S.logged){ go('s-app'); tab('hoje'); }
}
init();
