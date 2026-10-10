# c.b book (versão 0.1)

App de leitura, estudos para concursos/Enem e escrita. Esta é a primeira versão funcionando,
feita só com HTML, CSS e JavaScript (sem instalar nada).

## Como abrir

1. Crie uma pasta no computador, por exemplo `cbbook`, e coloque os 4 arquivos dentro dela:
   `index.html`, `style.css`, `app.js`, `dados.js`
2. Dê dois cliques em `index.html`. Ele abre no navegador.
   (precisa de internet só para carregar os ícones)
3. No celular: publique (veja abaixo) e abra o link. No Chrome do Android, menu ⋮ > "Adicionar à tela inicial".

Para editar o código, use o Visual Studio Code (gratuito): abra a pasta `cbbook` nele.

## O que cada arquivo faz

| Arquivo | Para que serve |
|---|---|
| `index.html` | A estrutura das telas (login, Início, Leitura, Concursos, Estúdio, Progresso) |
| `style.css` | Cores, cards, brilho azul neon. Para mudar a fonte dos títulos, altere `--titulo` no topo |
| `app.js` | O funcionamento: registrar páginas, gráficos, questões, escrever capítulos, salvar |
| `dados.js` | **As questões e os livros do Descobrir.** É aqui que você adiciona conteúdo |

## O que já funciona

- Criar conta, escolher plano e interesses (os interesses filtram o Descobrir)
- Registrar páginas de livro, ebook, artigo e HQ, com rosca e barras que se atualizam
- Meta diária, sequência de dias e virada de dia automática
- Questões com explicação, caderno de erros e desempenho por matéria
- Estúdio: escrever capítulos de verdade, com contagem de palavras
- Tudo fica salvo no navegador, mesmo fechando a página

## O que ainda é de mentirinha

- **Login:** não existe senha de verdade nem servidor. Os dados ficam só neste aparelho.
- **Planos e preços:** só aparecem na tela, não cobram nada.
- **Leitor de livros, simulado com cronômetro, notificações:** avisam "próxima etapa".

## Publicar de graça (para abrir no celular)

- **Netlify Drop:** entre em app.netlify.com/drop e arraste a pasta `cbbook`. Gera um link na hora.
- **GitHub Pages** ou **Cloudflare Pages**: boas opções quando você quiser versionar o código.

## Próximas etapas sugeridas

1. Login de verdade e dados na nuvem (Firebase ou Supabase, ambos têm plano gratuito)
2. Mais questões em `dados.js` e caderno de erros com revisão
3. Leitor de clássicos em domínio público dentro do app
4. Cobrança dos planos (Mercado Pago, Stripe ou Hotmart)
5. Transformar em aplicativo de loja com Capacitor, usando este mesmo código

## Lembretes

- Questões e textos precisam ser seus ou licenciados. Traduções de clássicos têm direitos próprios.
- Capas de livros: use uma fonte autorizada (por exemplo, a API do Google Books ou da Open Library), não imagens copiadas.
- Como o app guarda diários e textos pessoais, tenha política de privacidade (LGPD) antes de lançar.
