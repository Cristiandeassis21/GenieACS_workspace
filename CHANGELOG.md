# Changelog - GenieACS & Automações

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]

### Added
- **Script AutoRefresh:** Implementação de um script inteligente em `Presets` para rodar automaticamente em eventos cruciais (`0 BOOTSTRAP`, `2 PERIODIC`, `4 VALUE CHANGE`, `6 CONNECTION REQUEST`) e buscar dados essenciais das ONTs, mapeando parâmetros base, LAN, WAN e Wi-Fi.
- **Checkbox no Data Model:** Adicionado o filtro interativo `Hide undefined parameters` na tela customizada de Device (`datamodel-explorer.jsx`) para ocultar parâmetros vazios na UI com apenas um clique, mantendo a paginação.
- **Docker Compose Completo:** Estruturação de um `docker-compose.yml` abrangendo os serviços essenciais (MongoDB, CWMP, NBI, FS, UI e Simulator) para uso em desenvolvimento local.

### Changed
- **Tática de Comunicação TP-Link:** Modificada a lógica de requisição TR-069 no script para o modelo TP-Link XX530v. Foi constatado via Logs do CWMP que a ONT abortava a conexão ao receber pedidos com caracteres coringa (ex: `Device.WiFi.SSID.*.SSID`). A alteração força a requisição de índices exatos (`1` e `5`), estabilizando a comunicação com o GenieACS.
- **Base OS do Dockerfile:** Trocada a imagem do Dockerfile do GenieACS de Alpine Linux para Debian Slim (`node:18-slim`). Isso sanou as incompatibilidades e permitiu ao NPM encontrar e compilar corretamente os pacotes nativos (C++) do TailwindCSS.

### Fixed
- **Erro de Disposed Signal na UI:** Corrigido erro fatal `Cannot write to disposed signal` ao utilizar o checkbox de ocultar parâmetros. O erro do Mithril foi sanado alterando a passagem do valor (`checked={hideUndefined.get()}` para `checked={hideUndefined}`), evitando que o script reavaliasse agressivamente sua própria destruição na DOM.
- **RangeError MAXBUFFER no NodeJS:** Solucionado o estouro de buffer do Git Diff durante o build do Docker. Foi causado pelas diferenças de quebra de linha Windows (CRLF) vs Linux (LF). A correção exigiu forçar um commit neutro de cache diretamente no `Dockerfile`.
- **Not a Git Repository & Falha Silenciosa:** Resolvido o problema em que o GenieACS abortava a compilação de UI por falta do git. O arquivo `.dockerignore` foi reajustado, e as ferramentas `python3`, `make` e `git` foram adicionadas no container base.

### Removed
- Bloqueio da pasta `.git` removido do arquivo `.dockerignore` para permitir que os scripts nativos do GenieACS compilem a interface.

### Deprecated
- *(Nenhum item descontinuado)*
