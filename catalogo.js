/* =====================================================================
   c.b book - CATÁLOGO DA BIBLIOTECA
   Estes livros aparecem na aba Leitura > Biblioteca para TODOS que abrirem o app.

   Cada livro:
     id      -> código único, sem espaço e sem acento (ex.: 'dom-casmurro')
     t       -> título
     a       -> autor
     busca   -> (opcional) título mais simples para achar a capa (ex.: 'Os Miseráveis')
     tags    -> (opcional) Clássicos, História, Filosofia, Ficção, HQs, Poesia, Ciência,
                Saúde, Política, Enem e concursos, Artigos...
     tema    -> demanda sugerida no Banco de Horas (ex.: 'Filosofia')
     dominio -> true se o ORIGINAL é de domínio público (a tradução/edição tem direitos próprios)
     pag     -> número de páginas da edição que você usa (ou null: a pessoa informa ao adicionar)
     cover   -> (opcional) capa fixa. Pode ser um link (https://...) ou um arquivo seu
                no projeto (ex.: 'capas/dom-casmurro.jpg').
                Se ficar vazio, o app procura a capa sozinho na Open Library.

   Atenção:
   - Use capas autorizadas (Open Library, Google Books, ou arte sua). Não copie capas
     de editoras sem permissão.
   - O catálogo só guarda título, autor e capa. O texto do livro NÃO vai no app.
   - Se o título combinar com uma prova do dados.js (PROVAS), o app mostra o selo de prova.

   Dica: na Biblioteca, o botão "Dono do app" copia a sua estante já no formato abaixo.
   ===================================================================== */
var CATALOGO = [
  /* clássicos em domínio público (no original) */
  {id:'o-alienista', t:'O Alienista', a:'Machado de Assis', tags:['Clássicos','Ficção'], tema:'Ficção', dominio:true, pag:null, cover:''},
  {id:'a-metamorfose', t:'A Metamorfose', a:'Franz Kafka', tags:['Clássicos','Ficção'], tema:'Ficção', dominio:true, pag:null, cover:''},
  {id:'crime-e-castigo', t:'Crime e Castigo', a:'Fiódor Dostoiévski', tags:['Clássicos','Ficção','Filosofia'], tema:'Filosofia', dominio:true, pag:null, cover:''},
  {id:'memorias-postumas', t:'Memórias Póstumas de Brás Cubas', a:'Machado de Assis', tags:['Clássicos','Ficção','Enem e concursos'], tema:'Ficção', dominio:true, pag:null, cover:''},
  {id:'os-lusiadas', t:'Os Lusíadas', a:'Luís de Camões', tags:['Clássicos','Poesia','História','Enem e concursos'], tema:'História', dominio:true, pag:null, cover:''},
  {id:'o-cortico', t:'O Cortiço', a:'Aluísio Azevedo', tags:['Clássicos','Ficção','Enem e concursos'], tema:'Ficção', dominio:true, pag:null, cover:''},
  {id:'dom-casmurro', t:'Dom Casmurro', a:'Machado de Assis', tags:['Clássicos','Ficção','Enem e concursos'], tema:'Ficção', dominio:true, pag:null, cover:''},

  /* livros que já têm prova no dados.js */
  {id:'divina-comedia', t:'A Divina Comédia', a:'Dante Alighieri', tags:['Clássicos','Poesia'], tema:'Ficção', dominio:true, pag:null, cover:''},
  {id:'os-miseraveis-1', t:'Os Miseráveis (Volume I)', busca:'Os Miseráveis', a:'Victor Hugo', tags:['Clássicos','Ficção','História'], tema:'História', dominio:true, pag:null, cover:''},
  {id:'do-contrato-social', t:'Do Contrato Social', a:'Jean-Jacques Rousseau', tags:['Filosofia','Política','Clássicos'], tema:'Política', dominio:true, pag:null, cover:''},
  {id:'homo-deus', t:'Homo Deus', a:'Yuval Noah Harari', tags:['História','Ciência','Filosofia'], tema:'História', dominio:false, pag:null, cover:''},
  {id:'o-cerebro-que-se-transforma', t:'O cérebro que se transforma', a:'Norman Doidge', tags:['Ciência','Saúde'], tema:'Ciência', dominio:false, pag:null, cover:''},
  {id:'politicas-de-saude', t:'Políticas de Saúde', a:'', tags:['Saúde','Enem e concursos'], tema:'Saúde', dominio:false, pag:null, cover:''},
  {id:'sociedade-e-politicas-sociais', t:'Sociedade e Políticas Sociais', a:'', tags:['Política','Enem e concursos'], tema:'Política', dominio:false, pag:null, cover:''}
];
