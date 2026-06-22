# GenieACS Docker Workspace

Este projeto contém a arquitetura dockerizada do GenieACS e do Simulador de modems (GenieACS-Sim), configurados para operarem juntos utilizando microsserviços.

## Requisitos
- [Docker](https://www.docker.com/) instalado.
- [Docker Compose](https://docs.docker.com/compose/) instalado.

## Como Iniciar o Projeto

1. **Configurar as Variáveis de Ambiente:**
   Crie uma cópia do arquivo `.env.example` e renomeie para `.env`.
   Preencha as variáveis necessárias, especialmente o JWT Secret por questões de segurança.

   ```bash
   cp .env.example .env
   ```

2. **Subir os Contêineres:**
   Na raiz do projeto (onde está o arquivo `docker-compose.yml`), execute:

   ```bash
   docker-compose up -d --build
   ```

3. **Acessar a Interface:**
   Após todos os serviços estarem rodando, acesse a interface web através do navegador:
   [http://localhost:3000](http://localhost:3000)

   *Nota: O banco de dados iniciará vazio. Siga o "Initialization Wizard" na tela inicial.*

4. **Portas Expostas:**
   - **3000**: GenieACS UI (Interface de Gerenciamento)
   - **7547**: CWMP (Porta de comunicação com os roteadores)
   - **7557**: NBI (API REST de Integração)
   - **7567**: FS (Servidor de Arquivos para Firmwares)

## Documentação e Relatórios
Consulte os arquivos `.md` na raiz deste projeto para entender melhor a plataforma:
- `manual_genieacs.md`: Explicação completa de como utilizar cada aba e a arquitetura do projeto.
- `relatorio_erros.md`: Relatório dos problemas resolvidos durante a construção da arquitetura em Docker.
