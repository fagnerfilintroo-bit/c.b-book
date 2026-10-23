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

/*
  PROVAS: uma prova de 10 questões por livro, liberada quando o livro chega a 100%.
  id     -> nome interno da prova (não repita)
  match  -> pedaços do título do livro (minúsculas e sem acento) que ligam o livro à prova
  exclude -> (opcional) pedaços do título que NÃO devem receber a prova (ex.: outros volumes)
  q      -> as 10 questões (mesmo formato de QUESTOES: q, o, c, e)
  Aprovação com 7 acertos. Questões escritas de forma original, com base no conteúdo de cada obra.
  Para adicionar prova a outro livro, copie um bloco abaixo e troque id, match, titulo e as questões.
*/

var PROVAS = [
  {id:"divina-comedia", match:["divina comedia"], titulo:"A Divina Comédia", q:[
    {q:"A Divina Comédia, de Dante Alighieri, é dividida em três partes. Quais são elas, na ordem em que Dante as percorre?",
     o:["Inferno, Limbo e Paraíso", "Purgatório, Inferno e Paraíso", "Inferno, Purgatório e Paraíso", "Paraíso, Purgatório e Inferno"], c:2,
     e:"Dante desce pelo Inferno, sobe a montanha do Purgatório e depois ascende pelos céus do Paraíso. Cada parte tem 33 cantos; com o canto de abertura, são 100 no total."},
    {q:"Quem guia Dante pelo Inferno e pelo Purgatório?",
     o:["O poeta grego Homero", "O poeta romano Virgílio", "Beatriz", "São Bernardo"], c:1,
     e:"Virgílio, autor da Eneida, representa a razão humana e acompanha Dante até o alto do Purgatório."},
    {q:"Quem assume a condução de Dante pelos céus do Paraíso?",
     o:["Beatriz", "Virgílio", "Caronte", "Santo Agostinho"], c:0,
     e:"Beatriz, a mulher amada por Dante, o leva pelas esferas do Paraíso. Ela representa a fé e a sabedoria divina."},
    {q:"Qual é o sentido do aviso gravado na porta do Inferno?",
     o:["Quem entra deve abandonar toda esperança", "Só os batizados podem passar", "O caminho de volta fica sempre aberto", "Os pecadores podem se arrepender se rezarem"], c:0,
     e:"A inscrição, no Canto III, avisa que para os condenados não há saída nem perdão."},
    {q:"No início do poema, em que situação Dante se encontra?",
     o:["Preso numa torre em Florença", "Em plena batalha contra os inimigos de Florença", "No alto da montanha do Purgatório", "Perdido numa selva escura, tendo se desviado do caminho certo"], c:3,
     e:"A selva escura é imagem do pecado e da desorientação moral. É dela que Dante precisa sair, e por isso empreende a viagem."},
    {q:"O que Dante encontra no centro do Inferno, no nono e último círculo?",
     o:["Lúcifer preso no gelo, castigando os traidores", "Minos julgando as almas", "Um grande portal de ferro", "Um rio de fogo habitado por tiranos"], c:0,
     e:"No fundo do Inferno, o lago gelado de Cocito prende os traidores, e Lúcifer fica aprisionado ali."},
    {q:"Como é o Purgatório descrito por Dante?",
     o:["Um vale sombrio dividido em nove círculos", "Uma montanha com terraços onde as almas purgam os sete pecados capitais", "Uma ilha onde as almas esperam sem sofrer", "Um deserto de gelo eterno"], c:1,
     e:"O Purgatório é uma montanha com sete terraços, um para cada pecado capital. No topo está o Paraíso Terrestre, o Éden."},
    {q:"Com qual palavra terminam as três partes do poema (Inferno, Purgatório e Paraíso)?",
     o:["Luz", "Deus", "Amor", "Estrelas"], c:3,
     e:"Cada parte termina com a palavra \"estrelas\" (stelle, em italiano), lembrando que a viagem sempre aponta para o céu."},
    {q:"Em que língua Dante escreveu a Divina Comédia, uma escolha ousada para a época?",
     o:["Em latim, a língua culta", "Em grego antigo", "Em provençal", "Em italiano vulgar, o toscano falado em Florença"], c:3,
     e:"Dante preferiu o vulgar toscano para alcançar mais leitores, e a obra ajudou a firmar o italiano como língua literária."},
    {q:"Quem são Paolo e Francesca, que Dante encontra no Canto V, e por qual pecado estão condenados?",
     o:["Amantes condenados por luxúria, arrastados por um vento incessante", "Hereges, presos em túmulos de fogo", "Traidores da pátria, presos no gelo", "Glutões, castigados pela chuva e pela lama"], c:0,
     e:"No segundo círculo ficam os luxuriosos, levados por uma tempestade sem fim. Francesca conta a Dante a história de seu amor por Paolo."}
  ]},
  {id:"miseraveis", match:["miseraveis"], exclude:["volume 2", "volume ii", "vol 2", "vol ii", "volume 3", "volume iii", "vol 3", "vol iii"], titulo:"Os Miseráveis (Volume I)", q:[
    {q:"Por que Jean Valjean foi condenado às galés no início da história?",
     o:["Por ter roubado um pão para alimentar os sobrinhos famintos", "Por ter falsificado moedas", "Por ter assassinado um guarda", "Por ter participado de uma revolta"], c:0,
     e:"Valjean roubou um pão para os sobrinhos. A pena foi aumentando com as tentativas de fuga."},
    {q:"Quantos anos Jean Valjean passou preso?",
     o:["10 anos", "25 anos", "19 anos", "5 anos"], c:2,
     e:"Condenado a cinco anos, ele acumulou novas penas por tentar fugir e só saiu depois de dezenove anos."},
    {q:"Por que o \"passaporte amarelo\" de Valjean lhe causa tantos problemas ao sair da prisão?",
     o:["Porque o documento o marca como ex-presidiário e todos o recusam", "Porque o obriga a trabalhar para a polícia", "Porque ele só pode viajar à noite", "Porque o obriga a pagar um imposto especial"], c:0,
     e:"O documento revelava seu passado: Valjean era expulso das estalagens e recusado nos trabalhos, até ser acolhido pelo bispo."},
    {q:"Quem acolhe Valjean quando todos o rejeitam?",
     o:["O bispo Myriel, conhecido como Monsenhor Bienvenu", "O prefeito de Montreuil-sur-Mer", "O inspetor Javert", "O senhor Thénardier"], c:0,
     e:"O bispo lhe dá comida e cama sem perguntar nada, ato que muda a vida do ex-presidiário."},
    {q:"O que o bispo faz quando a polícia traz Valjean de volta com a prataria roubada?",
     o:["Pede aos guardas que o prendam", "Manda-o trabalhar na igreja", "Diz que deu a prataria e ainda lhe entrega os castiçais de prata", "Cobra o valor do roubo"], c:2,
     e:"A bondade inesperada do bispo desperta Valjean e marca o início de sua transformação moral."},
    {q:"Que nome Valjean passa a usar quando refaz a vida como industrial e chega a prefeito?",
     o:["Monsieur Madeleine", "Monsieur Thénardier", "Monsieur Gillenormand", "Monsieur Champmathieu"], c:0,
     e:"Em Montreuil-sur-Mer, como Madeleine, ele monta uma fábrica, enriquece, ajuda os pobres e é escolhido prefeito."},
    {q:"Quem é Fantine e qual é a sua situação?",
     o:["A filha do bispo Myriel", "Uma operária pobre e mãe solteira que deixa a filha Cosette com os Thénardier", "A dona de uma estalagem que explora os hóspedes", "A irmã do inspetor Javert"], c:1,
     e:"Abandonada pelo pai de Cosette, Fantine manda dinheiro a quem cuida da menina, perde o emprego e cai na miséria."},
    {q:"Para continuar pagando os Thénardier, Fantine chega a vender o quê?",
     o:["Os cabelos e os dentes", "O anel de casamento", "As roupas da filha", "A casa onde morava"], c:0,
     e:"Empurrada pela miséria, ela vende os cabelos e os dentes, e depois acaba na prostituição."},
    {q:"Por que Valjean revela sua verdadeira identidade no tribunal de Arras?",
     o:["Porque queria voltar às galés", "Porque Javert já o havia descoberto", "Para impedir que o inocente Champmathieu seja condenado no lugar dele", "Para recuperar a prataria roubada"], c:2,
     e:"Champmathieu foi confundido com Valjean. Madeleine se entrega para salvar um inocente, mesmo sabendo que perderá tudo."},
    {q:"Que promessa Valjean faz a Fantine em seus últimos dias?",
     o:["Cuidar de Cosette e ir buscá-la", "Vingá-la dos Thénardier", "Entregar toda a sua fortuna à igreja", "Construir um hospital em seu nome"], c:0,
     e:"Valjean promete cuidar da filha de Fantine e cumpre a promessa depois da morte dela."}
  ]},
  {id:"homo-deus", match:["homo deus"], titulo:"Homo Deus", q:[
    {q:"Segundo Harari, quais três grandes problemas a humanidade conseguiu reduzir, deixando de serem forças incontroláveis?",
     o:["Terremotos, fome e escravidão", "Pobreza, ignorância e desigualdade", "Crime, seca e corrupção", "Fome, peste e guerra"], c:3,
     e:"Harari abre o livro dizendo que fome, epidemias e guerra deixaram de ser fatalidades e passaram a ser desafios administráveis."},
    {q:"Qual nova agenda a humanidade tenderia a perseguir, segundo Harari?",
     o:["Fé, esperança e caridade", "Expansão territorial, riqueza e poder político", "Paz mundial, igualdade e democracia", "Imortalidade, felicidade e divindade"], c:3,
     e:"Com os velhos inimigos sob controle, a humanidade voltaria sua atenção para vencer a morte, buscar a felicidade e ganhar poderes divinos."},
    {q:"O que sugere o título \"Homo Deus\"?",
     o:["O retorno dos deuses da Antiguidade", "Humanos que se aprimoram com biotecnologia e inteligência artificial e ganham poderes quase divinos", "Uma religião nova, fundada por Harari", "O fim da espécie humana"], c:1,
     e:"\"Homo Deus\" é o ser humano \"atualizado\" pela tecnologia, que poderia projetar a própria vida e a própria mente."},
    {q:"Para Harari, qual é a fonte de autoridade no humanismo, que passou a ocupar o lugar de Deus?",
     o:["O rei", "A Igreja", "Os algoritmos", "A experiência e os sentimentos do indivíduo"], c:3,
     e:"No humanismo, o sentido vem de dentro do ser humano. Daí a importância do voto, do consumo e da arte, que valorizam os sentimentos individuais."},
    {q:"Quais são as três vertentes do humanismo descritas por Harari?",
     o:["Capitalista, comunista e anarquista", "Liberal, socialista e evolutivo", "Racional, emocional e espiritual", "Cristão, islâmico e budista"], c:1,
     e:"O humanismo liberal valoriza a liberdade individual, o socialista dá peso à coletividade e o evolutivo à superação do mais fraco pelo mais forte."},
    {q:"O que é o \"dataísmo\", que Harari vê crescer?",
     o:["A defesa de que os dados pessoais devem ser sempre secretos", "Uma teoria que nega a utilidade das estatísticas", "A crença de que o valor de tudo está no fluxo de dados e de que o universo é processamento de informação", "Uma antiga religião baseada em calendários"], c:2,
     e:"No dataísmo, o maior bem é a liberdade de informação, e o valor de cada coisa depende de sua contribuição ao fluxo de dados."},
    {q:"O que Harari afirma sobre dinheiro, nações e empresas?",
     o:["Que existem nas histórias que compartilhamos, uma realidade intersubjetiva", "Que nasceram da biologia humana", "Que são ilusões individuais sem efeito prático", "Que são realidades físicas, como as montanhas"], c:0,
     e:"Eles só existem porque muita gente acredita neles ao mesmo tempo, e essa crença coletiva sustenta a cooperação em larga escala."},
    {q:"Que contraste Harari destaca sobre as causas de morte no mundo atual?",
     o:["A fome aumentou em todos os continentes", "As epidemias matam hoje mais do que na Idade Média", "Comer demais mata mais gente do que a fome, e o suicídio mata mais do que guerra e crime juntos", "A guerra continua sendo a maior causa de morte"], c:2,
     e:"Para ele, hoje o açúcar é mais perigoso do que a pólvora: obesidade e suicídio superam fome, guerra e crime."},
    {q:"O que Harari chama de \"classe inútil\"?",
     o:["Pessoas que se recusam a trabalhar", "Os intelectuais e artistas", "Os aposentados", "Pessoas que a automação e a inteligência artificial podem tornar economicamente irrelevantes"], c:3,
     e:"Se algoritmos superarem humanos em muitas tarefas, uma grande massa poderia perder função econômica e peso político."},
    {q:"Que ideia sobre os seres vivos sustenta o dataísmo, segundo o livro?",
     o:["Que os organismos são algoritmos bioquímicos", "Que são máquinas sem emoção", "Que são imunes à manipulação", "Que têm uma alma imortal"], c:0,
     e:"Se emoções e decisões são cálculos bioquímicos, então computadores poderiam um dia superá-los, argumenta Harari."}
  ]},
  {id:"cerebro-que-se-transforma", match:["cerebro que se transforma"], titulo:"O cérebro que se transforma", q:[
    {q:"O que é neuroplasticidade, ideia central do livro de Norman Doidge?",
     o:["O endurecimento do cérebro com a idade", "A divisão do cérebro em áreas fixas para cada função", "A capacidade de regenerar membros perdidos", "A capacidade do cérebro de mudar sua estrutura e seu funcionamento em resposta à experiência"], c:3,
     e:"Doidge mostra que o cérebro se reorganiza durante a vida, e não apenas na infância."},
    {q:"Que visão antiga da ciência o livro contesta?",
     o:["A de que o cérebro tem dois hemisférios", "A de que o cérebro adulto é fixo, com funções presas a locais definitivos", "A de que o sono é necessário", "A de que os neurônios transmitem sinais elétricos"], c:1,
     e:"A ideia do cérebro como máquina fixa (localizacionismo) foi enfraquecida pelos casos de recuperação e reorganização."},
    {q:"Que princípio de Donald Hebb é usado para explicar a plasticidade?",
     o:["Neurônios novos não nascem após a infância", "Neurônios inativos ficam mais fortes", "O cérebro usa só 10% de sua capacidade", "Neurônios que disparam juntos se conectam e fortalecem suas ligações"], c:3,
     e:"Repetir uma experiência fortalece as vias neurais, ideia resumida na frase \"neurônios que disparam juntos se conectam juntos\"."},
    {q:"O que o neurocientista Paul Bach-y-Rita desenvolveu?",
     o:["A técnica da psicanálise", "Um método para mapear o cérebro de macacos com eletrodos", "Aparelhos de substituição sensorial, que levam informação de um sentido danificado por outro caminho, como a pele ou a língua", "Uma vacina contra a doença de Alzheimer"], c:2,
     e:"O cérebro aprende a interpretar sinais que chegam por outra via, e pessoas cegas ou com perda de equilíbrio chegaram a se beneficiar."},
    {q:"O que Michael Merzenich mostrou com seus experimentos?",
     o:["Que o cérebro é imune a estímulos externos", "Que a plasticidade só existe na infância", "Que a memória fica no coração", "Que os mapas do cérebro se reorganizam conforme o uso e a experiência"], c:3,
     e:"Seus estudos mostraram que as áreas do córtex mudam de tamanho e função de acordo com o que o animal ou a pessoa pratica."},
    {q:"Como Barbara Arrowsmith-Young enfrentou suas severas dificuldades de aprendizagem?",
     o:["Fazendo uma cirurgia", "Criando exercícios que fortaleceram as áreas mais fracas do próprio cérebro", "Tomando remédios para se concentrar", "Aceitando que não poderia mudar"], c:1,
     e:"Seu caso mostra a plasticidade na prática: exercícios específicos melhoraram funções que antes eram muito deficientes."},
    {q:"Em que consiste a terapia de movimento induzido por restrição, de Edward Taub, para pacientes com AVC?",
     o:["Imobilizar o membro saudável para forçar o uso e a recuperação do membro afetado", "Substituir o membro por uma prótese", "Operar o cérebro para recolocar as áreas lesionadas", "Dar repouso total ao membro paralisado"], c:0,
     e:"Ao impedir que o paciente \"fuja\" usando o lado bom, o cérebro é forçado a criar novas vias para o lado afetado."},
    {q:"Como o livro explica a dor do \"membro fantasma\" depois de uma amputação?",
     o:["Por imaginação do paciente, sem base no cérebro", "Por uma infecção na cicatriz", "Pelo mapa cerebral do membro, que continua ativo ou se reorganiza e gera sensações", "Por um defeito no osso"], c:2,
     e:"Mostra o lado negativo da plasticidade, e os trabalhos de Ramachandran com a caixa de espelhos ajudam a entender o fenômeno."},
    {q:"O que o livro chama de \"paradoxo plástico\"?",
     o:["O mesmo mecanismo que permite aprender e se curar também pode produzir rigidez, maus hábitos e vícios", "A diferença de tamanho entre os dois hemisférios", "A impossibilidade de aprender depois dos 40 anos", "A perda de neurônios com a idade"], c:0,
     e:"A plasticidade serve tanto para o bem (reabilitação) quanto para o mal (hábitos que se cristalizam)."},
    {q:"O que mostram os estudos de prática mental, como os de Pascual-Leone com exercícios de piano?",
     o:["Que imaginar um movimento não tem efeito algum", "Que ensaiar mentalmente ativa áreas do cérebro e produz mudanças semelhantes às da prática real", "Que a imaginação enfraquece a memória", "Que só a prática física modifica o cérebro"], c:1,
     e:"Imaginar a ação ativa regiões do cérebro parecidas com as da execução real."}
  ]},
  {id:"contrato-social", match:["contrato social"], titulo:"Do Contrato Social", q:[
    {q:"Qual ideia abre o Contrato Social e resume o problema que Rousseau quer resolver?",
     o:["Todo poder vem de Deus", "O homem nasce mau, e só a lei o torna bom", "O homem é o lobo do homem", "O homem nasce livre, mas por toda parte vive acorrentado"], c:3,
     e:"Rousseau quer explicar como é possível uma ordem política legítima que respeite a liberdade natural dos homens."},
    {q:"O que é o pacto social para Rousseau?",
     o:["Um tratado de paz entre Estados", "Um contrato entre o povo e Deus", "Um acordo em que cada um se une a todos, obedece apenas a si mesmo e permanece livre", "Um acordo em que o povo entrega o poder a um rei absoluto"], c:2,
     e:"Pelo pacto, cada um se coloca sob a direção da vontade geral, e assim obedece às leis que ajudou a criar."},
    {q:"Qual é a diferença entre vontade geral e vontade de todos?",
     o:["A vontade geral busca o interesse comum, e a vontade de todos é só a soma de interesses particulares", "A vontade geral é a do rei, e a de todos é a do povo", "A vontade geral é a dos mais ricos", "São a mesma coisa"], c:0,
     e:"Para Rousseau, a lei legítima expressa a vontade geral, e não o resultado da soma de interesses individuais."},
    {q:"Que características Rousseau atribui à soberania?",
     o:["Pertence ao rei e se transmite por herança", "Pertence à Igreja", "É divisível e pode ser transferida a representantes", "Pertence ao povo, é inalienável e indivisível"], c:3,
     e:"Soberania não pode ser transferida nem partida, porque a vontade geral não se transmite."},
    {q:"O que Rousseau pensa da representação política?",
     o:["A representação é necessária em todo Estado", "Os representantes são a melhor forma de exercer a soberania", "Só os nobres podem representar o povo", "A soberania não pode ser representada, e os deputados são apenas comissários do povo"], c:3,
     e:"Para ele, o povo que acredita ser livre ao eleger representantes só é livre no momento do voto."},
    {q:"O que significa dizer que quem recusar obedecer à vontade geral \"será forçado a ser livre\"?",
     o:["Que só o rei pode ser livre", "Que a liberdade é desnecessária", "Que o Estado pode prender qualquer opositor sem lei", "Que a liberdade política consiste em obedecer à lei que o próprio povo se deu, e não aos impulsos individuais"], c:3,
     e:"A liberdade, para Rousseau, não é fazer o que se quer, mas obedecer à lei que nós mesmos criamos."},
    {q:"Qual é o papel do Legislador no Contrato Social?",
     o:["Governar com poder absoluto", "Julgar os crimes", "Propor boas leis ao povo, sem poder de impô-las, pois quem as aprova é o povo", "Comandar o exército"], c:2,
     e:"O Legislador é uma figura excepcional, como Licurgo em Esparta, que redige as leis, mas a soberania continua com o povo."},
    {q:"O que Rousseau diz sobre a democracia como forma de governo?",
     o:["Que nunca existiu em lugar nenhum", "Que é sempre inferior à monarquia absoluta", "Que é a melhor forma para todos os países, sem ressalvas", "Que seria perfeita demais, própria de um povo de deuses, e não de homens"], c:3,
     e:"Para ele, a democracia direta exige condições raras. Governo e soberania são coisas diferentes: o governo apenas executa a vontade geral."},
    {q:"Que função Rousseau dá à \"religião civil\"?",
     o:["Impor uma religião de Estado em todos os detalhes", "Abolir qualquer crença religiosa", "Unir os cidadãos e fazê-los amar seus deveres cívicos, com poucos dogmas simples", "Substituir as leis do Estado"], c:2,
     e:"A religião civil é uma profissão de fé cívica, com poucos princípios, que fortalece a ligação do cidadão com o Estado."},
    {q:"Em que ano O Contrato Social foi publicado, e qual acontecimento ele é lembrado por ter influenciado?",
     o:["1648; a Guerra dos Trinta Anos", "1762; a Revolução Francesa", "1848; a Primavera dos Povos", "1500; as Grandes Navegações"], c:1,
     e:"Publicado em 1762, o livro foi lido pelos pensadores e revolucionários franceses e ficou ligado à ideia de soberania popular."}
  ]},
  {id:"politicas-de-saude", match:["politicas de saude"], titulo:"Políticas de Saúde", q:[
    {q:"Segundo a apostila, qual foi a primeira faculdade de medicina do Brasil, criada por Dom João VI em 1808?",
     o:["Escola de Cirurgia da Bahia", "Faculdade de Medicina de São Paulo", "Escola de Medicina de Porto Alegre", "Instituto Oswaldo Cruz"], c:0,
     e:"Em fevereiro de 1808, de passagem por Salvador, Dom João VI criou a Escola de Cirurgia da Bahia. No mesmo ano surgiu a do Rio de Janeiro."},
    {q:"Que medida, em 1904, provocou a Revolta da Vacina?",
     o:["A obrigatoriedade da vacinação antivaríola em todo o território nacional", "O fechamento dos portos", "A criação de impostos para os hospitais", "A proibição das Santas Casas"], c:0,
     e:"A Lei Federal nº 1.261, de 31 de outubro de 1904, assustou a população, que desconhecia a vacina e rejeitou a imposição."},
    {q:"Como é conhecido o modelo de Oswaldo Cruz, com polícia sanitária e intervenções à força?",
     o:["Sanitarista campanhista", "Previdenciário", "Médico-assistencial privatista", "Atenção básica domiciliar"], c:0,
     e:"Apesar dos exageros, o modelo campanhista obteve êxitos no controle de epidemias, como o da febre amarela."},
    {q:"O que marca a Lei Eloy Chaves, de 1923, na história da saúde brasileira?",
     o:["Criou o Ministério da Saúde", "Criou as Caixas de Aposentadorias e Pensões (CAPs), ponto de partida da Previdência Social", "Criou o Sistema Único de Saúde", "Criou o INAMPS"], c:1,
     e:"As CAPs são o marco da medicina previdenciária e da assistência à saúde ligada ao trabalho formal."},
    {q:"Em 1930, no governo Vargas, qual órgão passou a cuidar dos assuntos de saúde pública?",
     o:["O Ministério dos Negócios da Educação e Saúde Pública (MESP)", "O Instituto Nacional de Previdência Social", "O Ministério da Saúde, com esse nome", "A Fundação Oswaldo Cruz"], c:0,
     e:"A medicina previdenciária ficou com o Ministério do Trabalho, e o MESP atendia desempregados, pobres e trabalhadores informais."},
    {q:"O que fez o Decreto-Lei nº 72, de 1966?",
     o:["Criou as Caixas de Aposentadorias e Pensões", "Extinguiu o INAMPS", "Criou o Sistema Único de Saúde", "Unificou os Institutos de Aposentadorias e Pensões e criou o INPS"], c:3,
     e:"O INPS reuniu os institutos para corrigir a fragmentação do sistema previdenciário no regime militar."},
    {q:"Quem tinha direito à assistência médica do INAMPS, criado em 1977?",
     o:["Apenas funcionários públicos", "Toda a população, sem distinção", "Apenas desempregados e trabalhadores autônomos", "Trabalhadores formais, com carteira assinada, e seus dependentes"], c:3,
     e:"Quem não tinha carteira assinada ficava de fora. O INAMPS foi extinto em 1993, quando o SUS já existia."},
    {q:"O que a VIII Conferência Nacional de Saúde (1986) defendeu, entre seus principais temas?",
     o:["Saúde como direito de todos e dever do Estado, e a criação de um Sistema Único de Saúde", "A extinção do Ministério da Saúde", "A privatização total da assistência", "A volta do modelo campanhista"], c:0,
     e:"A VIII CNS foi marco da Reforma Sanitária e lançou as bases do SUS, com participação popular e ampliação do conceito de saúde."},
    {q:"Quais são os princípios doutrinários do SUS?",
     o:["Universalidade, equidade e integralidade", "Contribuição, previdência e mérito", "Hierarquização, regionalização e descentralização", "Gratuidade, privatização e competitividade"], c:0,
     e:"Os princípios doutrinários são o tripé do SUS. Hierarquização, regionalização e descentralização são princípios organizativos."},
    {q:"O Pacto pela Saúde, de 2006, reuniu quais três pactos?",
     o:["Pacto pela Vida, Pacto em Defesa do SUS e Pacto de Gestão", "Pacto pela Vida, pela Previdência e pela Gestão", "Pacto Federativo, Pacto Fiscal e Pacto Social", "Pacto pela Educação, pela Saúde e pelo Trabalho"], c:0,
     e:"Em 2006, o PSF também passou a ser chamado Estratégia Saúde da Família."}
  ]},
  {id:"sociedade-politicas-sociais", match:["sociedade e politicas sociais", "sociedade e politicas publicas", "politicas sociais"], titulo:"Sociedade e Políticas Sociais", q:[
    {q:"A Declaração Universal dos Direitos Humanos foi aprovada em qual ano e em que contexto, segundo o livro?",
     o:["1789, durante a Revolução Francesa", "1988, junto com a Constituição brasileira", "1948, no pós-guerra, como reação às barbáries do nazismo", "1917, depois da Greve Geral no Brasil"], c:2,
     e:"Para o livro, a internacionalização dos direitos humanos foi consequência das atrocidades do nazismo, e o pós-guerra foi o marco desse movimento."},
    {q:"Em que contexto surge o Welfare State (Estado de Bem-Estar Social) na Europa?",
     o:["Depois da Primeira Guerra, com o fim do feudalismo", "Depois da Segunda Guerra Mundial, tendo o Plano Beveridge, de 1942, como um dos pilares", "Com o neoliberalismo dos anos 1980", "Durante a Revolução Industrial do século XVIII"], c:1,
     e:"O Estado de Bem-Estar assume a responsabilidade de garantir a todos um nível básico de vida. O Plano Beveridge previa proteção contra doença, desemprego, velhice, deficiência e a morte do provedor."},
    {q:"Segundo a PNAS-2004, que três papéis a assistência social desempenha no Brasil?",
     o:["Arrecadação, fiscalização e punição", "Caridade, filantropia e ajuda emergencial", "Previdência, saúde e educação", "Proteção social, vigilância social e defesa de direitos socioassistenciais"], c:3,
     e:"A assistência social não deve se limitar a agir depois que o problema aparece: precisa prevenir, produzir informação sobre quem demanda proteção e defender direitos."},
    {q:"O que é o Conselho Nacional de Assistência Social (CNAS)?",
     o:["Um fundo que repassa dinheiro aos municípios", "Um conselho criado pela Loas, em 1993, para exercer o controle social da política de assistência social", "Um ministério que executa os serviços dos CRAS", "Uma comissão que reúne apenas gestores federais"], c:1,
     e:"Entre suas competências estão aprovar a Política Nacional de Assistência Social, regular a prestação de serviços e convocar a Conferência Nacional."},
    {q:"O que o livro chama de \"cidadania regulada\" no início da proteção social brasileira?",
     o:["Direitos concedidos apenas a militares", "Direitos sociais ligados à inserção do trabalhador no mercado de trabalho formal", "Direitos garantidos a todos, independentemente de contribuição", "Direitos controlados pelo voto obrigatório"], c:1,
     e:"Depois da Lei Eloy Chaves (1923) e dos IAPs, quem estava fora do mercado formal ficava sem proteção. Esse modelo contrasta com a cidadania universal da seguridade social."},
    {q:"Qual é o tripé da seguridade social previsto no Art. 194 da Constituição de 1988?",
     o:["Saúde, previdência social e assistência social", "Saúde, educação e moradia", "Previdência, trabalho e renda", "Assistência social, segurança pública e justiça"], c:0,
     e:"O Art. 194 define a seguridade como conjunto integrado de ações para assegurar os direitos relativos à saúde, à previdência e à assistência social."},
    {q:"Que crítica o livro faz às políticas focalizadas, voltadas apenas aos mais pobres?",
     o:["Segmentam a cobertura e geram exclusão, pois o efeito redistributivo depende da universalização", "Alcançam sempre todos os que precisam", "São caras demais e por isso devem ser abolidas", "Só funcionam em municípios pequenos"], c:0,
     e:"Focar só na linha de pobreza deixa de fora os \"novos pobres\" e famílias vulneráveis acima da linha. O livro defende políticas universais."},
    {q:"O que é intersetorialidade nas políticas sociais?",
     o:["O trabalho articulado entre políticas públicas, em parceria, voltado à proteção social e à integralidade do cuidado", "A transferência dos serviços sociais para o setor privado", "A divisão de cada política em setores que trabalham separados", "A gestão de uma política apenas pelo governo federal"], c:0,
     e:"A intersetorialidade supera a atuação isolada de cada política e a prática assistencialista e clientelista. É um trabalho em rede, que envolve negociação e conflitos."},
    {q:"Quem compõe as Comissões Intergestores do SUAS?",
     o:["A CIB reúne municípios e sociedade civil; a CIT reúne os três Poderes", "A CIB reúne estados e municípios; a CIT reúne União, estados e municípios", "As duas reúnem apenas o governo federal", "A CIB reúne União e estados; a CIT reúne só municípios"], c:1,
     e:"São espaços de negociação e pactuação da gestão descentralizada do SUAS. Bipartite tem dois entes (estados e municípios); tripartite tem três esferas."},
    {q:"Como funciona o repasse \"fundo a fundo\" no financiamento da assistência social?",
     o:["O dinheiro vai todo ano por licitação, sem regularidade", "Os estados repassam recursos ao governo federal", "Cada município paga um convênio avulso ao governo federal a cada projeto", "Os recursos vão, de forma regular e automática, do Fundo Nacional de Assistência Social aos fundos de estados, municípios e Distrito Federal"], c:3,
     e:"O repasse fundo a fundo vai além do antigo modelo convenial e está ligado ao cofinanciamento de serviços de ação continuada."}
  ]}
];
