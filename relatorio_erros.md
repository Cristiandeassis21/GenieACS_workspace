# Relatório de Erros e Ajustes: Dockerização do GenieACS

Durante a criação do ambiente de homologação/teste utilizando Docker Compose para o GenieACS (versão 1.3.0-dev) e o `genieacs-sim`, enfrentamos 4 barreiras técnicas ligadas à forma como o código-fonte original compila a aplicação. 

Abaixo está o registro técnico de todos os problemas e como os resolvemos para estabilizar o ambiente (o que será fundamental quando migrarmos isso para o Linux Ubuntu em produção):

---

## 1. Falha Silenciosa de Compilação por falta do Git
**Sintoma:** O comando `docker-compose up` indicava sucesso no build, mas os containers falhavam ao iniciar com o erro: `Error: Cannot find module '/app/dist/bin/genieacs-ui'`.
**Causa:** A imagem base que escolhemos inicialmente (`node:18-alpine`) não possuía o Git instalado por padrão. O script de build do GenieACS (`build.ts`) invoca comandos `git` internamente para gerar metadados de versão. Sem o Git, o build abortava pela metade, mas de forma silenciosa, sem gerar os arquivos na pasta `dist/`.
**Solução Aplicada:** Adicionamos a instalação explícita do Git no `Dockerfile` (`apk add git`).

## 2. Erro "Not a git repository"
**Sintoma:** Após adicionar o Git, o build começou a falhar abertamente com a mensagem: `fatal: not a git repository (or any of the parent directories): .git`.
**Causa:** Na intenção de deixar a imagem Docker o mais limpa possível, havíamos adicionado a pasta oculta `.git` no arquivo `.dockerignore`. Isso fez com que ela não fosse enviada para dentro do container, quebrando os comandos `git ls-files` do script de compilação.
**Solução Aplicada:** Removemos `.git` do `.dockerignore`, permitindo que o container reconhecesse a pasta como um repositório válido.

## 3. Estouro de Memória (RangeError MAXBUFFER)
**Sintoma:** O build falhou com o erro fatal do NodeJS: `RangeError [ERR_CHILD_PROCESS_STDIO_MAXBUFFER]: stdout maxBuffer length exceeded`.
**Causa:** O Windows salva arquivos clonados com quebras de linha no padrão `\r\n`, enquanto o Linux espera `\n`. Além disso, há diferença na herança de permissões (chmod) de arquivos. Como o comando `COPY . .` jogou os arquivos do Windows para o Linux do container, o Git identificou **todos os 2.000+ arquivos** do GenieACS como "modificados". O script rodou um `git diff HEAD`, e a saída de texto desse *diff* foi tão gigantesca que estourou o limite de memória reservada para a execução do comando no Node.js.
**Solução Aplicada:** Adicionamos no `Dockerfile` um comando para forçar o Git a "ignorar" essas modificações criando um commit fantasma instantes antes de compilar: 
`git config --global --add safe.directory /app && git add -A && git commit -m "build"`

## 4. Incompatibilidade de Bibliotecas Nativas em C++ (TailwindCSS)
**Sintoma:** O TailwindCSS parou a compilação do CSS queixando-se que não achou o componente `tailwindcss/oxide-linux-x64-musl` ou `tailwindcss-oxide-linux-x64-gnu`. 
**Causa:** Inicialmente usávamos Alpine Linux, que depende do `musl` libc (algo que pacotes nativos costumam não dar suporte oficial pré-compilado). Além disso, o arquivo `npm-shrinkwrap.json` nativo do repositório travava as dependências e impedia que o NPM baixasse as bibliotecas corretas opcionais para Linux dinamicamente.
**Solução Aplicada:**
1. Trocamos o sistema operacional base do Docker de Alpine Linux para Debian Slim (`node:18-slim`), passando a utilizar a `glibc` padrão da indústria.
2. Alteramos o `Dockerfile` para instalar a dependência explicitamente à força: `npm install @tailwindcss/oxide-linux-x64-gnu`.

---
> [!TIP]
> **Conclusão:** O ambiente agora encontra-se isolado e imune às diferenças entre Windows e Linux. Todos esses passos estão automatizados no repositório local e podem ser transportados diretamente para o Ubuntu na etapa de homologação/produção usando o simples comando `docker-compose up -d`.
