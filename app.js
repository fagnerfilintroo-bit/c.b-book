/*
  c.b book - dados de conteúdo
  Para adicionar questões ou livros, edite apenas este arquivo.

  QUESTOES: cada questão precisa de
    id  -> código único (ex.: 'h4')
    s   -> matéria (aparece no "Desempenho por matéria")
    q   -> enunciado
    o   -> as 4 alternativas
    c   -> posição da alternativa correta (0 = A, 1 = B, 2 = C, 3 = D)
    e   -> explicação mostrada depois que a pessoa responde

  As questões abaixo são exemplos escritos para o protótipo.
  Para o produto final, use questões suas ou licenciadas.
*/
var QUESTOES = [
  {id:'h1', s:'História', q:'A chegada da família real portuguesa ao Brasil, em 1808, teve como uma de suas consequências imediatas:',
   o:['a proclamação da República','a abertura dos portos às nações amigas','a abolição da escravidão','o início da Guerra do Paraguai'], c:1,
   e:'Ao se instalar no Rio de Janeiro, D. João decretou a abertura dos portos às nações amigas, encerrando o exclusivo comercial com Portugal.'},
  {id:'h2', s:'História', q:'A Revolução Industrial teve início, no século XVIII, em qual país?',
   o:['França','Inglaterra','Alemanha','Estados Unidos'], c:1,
   e:'A Inglaterra reuniu carvão, capital, mercado consumidor e mão de obra, e foi o berço da industrialização.'},
  {id:'h3', s:'História', q:'A Lei Áurea, que aboliu a escravidão no Brasil, foi assinada em:',
   o:['1822','1871','1888','1889'], c:2,
   e:'A Lei Áurea foi assinada pela Princesa Isabel em 13 de maio de 1888.'},
  {id:'m1', s:'Matemática', q:'Um livro tem 240 páginas. Lendo 30 páginas por dia, em quantos dias você termina o livro?',
   o:['6 dias','7 dias','8 dias','9 dias'], c:2,
   e:'240 ÷ 30 = 8. Dá para fechar o livro em 8 dias.'},
  {id:'p1', s:'Português', q:'Qual é o plural correto da palavra "cidadão"?',
   o:['cidadões','cidadãos','cidadães','cidadans'], c:1,
   e:'O plural de "cidadão" é "cidadãos", como em "mão/mãos" e "irmão/irmãos".'},
  {id:'g1', s:'Geografia', q:'Qual é o maior bioma brasileiro em extensão territorial?',
   o:['Cerrado','Mata Atlântica','Amazônia','Caatinga'], c:2,
   e:'A Amazônia ocupa cerca de 49% do território brasileiro.'}
];

/*
  LIVROS: lista da aba Descobrir.
  tags -> use os mesmos nomes das opções de interesse
          (Clássicos, História, Filosofia, Ficção, HQs, Poesia, Ciência, Enem e concursos, Artigos)
  cor  -> cor da lombada da capinha

  Todos os livros abaixo são de domínio público no original.
  Atenção: traduções têm direitos autorais próprios.
*/
var LIVROS = [
  {t:'O Alienista', a:'Machado de Assis', pais:'Brasil', cor:'#2EE6C8', tags:['Clássicos','Ficção']},
  {t:'A Metamorfose', a:'Franz Kafka', pais:'Praga', cor:'#4F6BFF', tags:['Clássicos','Ficção']},
  {t:'Crime e Castigo', a:'Dostoiévski', pais:'Rússia', cor:'#9BE7FF', tags:['Clássicos','Ficção','Filosofia']},
  {t:'Memórias Póstumas de Brás Cubas', a:'Machado de Assis', pais:'Brasil', cor:'#25B4FF', tags:['Clássicos','Ficção','Enem e concursos']},
  {t:'Os Lusíadas', a:'Luís de Camões', pais:'Portugal', cor:'#25B4FF', tags:['Clássicos','Poesia','História','Enem e concursos']},
  {t:'O Cortiço', a:'Aluísio Azevedo', pais:'Brasil', cor:'#2EE6C8', tags:['Clássicos','Ficção','Enem e concursos']},
  {t:'Dom Casmurro', a:'Machado de Assis', pais:'Brasil', cor:'#4F6BFF', tags:['Clássicos','Ficção','Enem e concursos']}
];
