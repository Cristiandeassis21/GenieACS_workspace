# Documentação da Arquitetura - GenieACS Workspace

Este documento descreve a topologia de arquivos e pastas do projeto `GenieACS_workspace`. A arquitetura foi desenhada para centralizar todos os microsserviços do GenieACS e do seu simulador em um único ecossistema provisionado via Docker.

## 📂 Estrutura Raiz (Root)

### 📄 `docker-compose.yml`
**O Coração da Infraestrutura.** É o arquivo de orquestração do Docker. Ele define e conecta 6 serviços (contêineres) essenciais em uma rede interna, permitindo que eles conversem entre si:
1. **mongo**: Banco de dados NoSQL que armazena os roteadores, logs e a interface do GenieACS.
2. **cwmp**: Serviço principal que escuta e conversa com os modems do mundo exterior (porta `7547`).
3. **nbi**: API RESTful, usada para integrar o GenieACS com o sistema de faturamento/ERP do provedor (porta `7557`).
4. **fs**: Servidor de arquivos independente para distribuir Firmwares pesados (porta `7567`).
5. **ui**: Servidor do painel de controle acessado pelos atendentes no navegador (porta `3000`).
6. **genieacs-sim**: Simulador de roteadores TR-069, projetado para testes em laboratório (comunica-se diretamente com o serviço `cwmp`).

### 📄 `.env.example` e `.env`
**Segurança e Variáveis Globais.** O `.env` contém credenciais sensíveis da sua empresa e configurações do ambiente (como a URL do MongoDB e o JWT Secret para a criptografia dos logins). O `.env.example` é apenas um "esqueleto" seguro para mostrar à sua equipe quais variáveis precisam ser preenchidas, sem vazar senhas para o GitHub.

### 📄 `.gitignore`
Arquivo de regras do Git. Protege seu repositório impedindo que arquivos muito pesados (como a pasta de dependências `node_modules/`), lixos do sistema operacional ou arquivos secretos (como o próprio `.env`) sejam acidentalmente upados para a nuvem.

### 📄 `README.md`
A "porta de entrada" do projeto no GitHub. Contém o manual rápido de como um novo funcionário ou desenvolvedor deve clonar a pasta, configurar o `.env` e rodar os contêineres pela primeira vez usando o comando `docker-compose up -d`.

### 📄 `manual_genieacs.md`
**Manual do Usuário Final.** Documentação não-técnica focada na operação diária da plataforma. Ele ensina para os atendentes como navegar pela interface, a utilidade de cada aba (Devices, Provisions, Virtual Parameters, etc.) e conceitos práticos do protocolo TR-069.

### 📄 `relatorio_erros.md`
**Histórico de Resolução de Problemas (Post-Mortem).** Um relatório valioso que documenta os problemas de infraestrutura superados durante a criação deste projeto, como os bugs de quebra de linha `\r\n` causados pelo Windows e a incompatibilidade de bibliotecas C++ da imagem Alpine, servindo como base de conhecimento caso o ambiente quebre no futuro.

---

## 📁 Diretórios de Código-Fonte

### 📁 `/genieacs`
Contém o repositório principal e o motor do servidor GenieACS (escrito em TypeScript/Node.js).
**Modificações:** Nós adicionamos um `Dockerfile` customizado na raiz desta pasta. Para evitar quebras por falta de bibliotecas do sistema operacional necessárias pelas dependências do projeto, nosso Dockerfile orienta o container a ser construído em cima de uma imagem Linux robusta baseada no Debian (`node:22-bullseye-slim`). É a partir desta pasta que os serviços `cwmp`, `nbi`, `fs` e `ui` são gerados e colocados no ar.

### 📁 `/genieacs-sim`
Contém o simulador de modems. Trata-se de uma aplicação independente que cria roteadores virtuais (ex: Huawei BM632w) e os faz conversar com o nosso servidor principal, simulando um ambiente real.
**Modificações:** Esta pasta também possui seu próprio `Dockerfile` customizado para o simulador, além de um script embutido no `docker-compose.yml` (`command: ["./simulator", "http://cwmp:7547/"]`) que o instrui a disparar conexões contra a porta interna do serviço `cwmp`, permitindo que validemos todas as lógicas do provedor antes de plugar um roteador físico na rede.
