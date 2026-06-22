# Manual de Operação - GenieACS

> [!NOTE]
> Este documento é um manual vivo e deve ser atualizado à medida que novas funcionalidades e scripts forem adicionados à plataforma.

## 1. O que é o GenieACS e TR-069
O GenieACS é um servidor ACS (Auto Configuration Server) que utiliza o protocolo padrão TR-069 para gerenciar remotamente roteadores e modems (CPEs) na casa dos clientes.
A identificação dos roteadores não é feita por IP, e sim pelo **DeviceID** (Combinação do código da fabricante OUI, Product Class e Serial Number/MAC).

## 2. Lidando com CGNAT e IPs Dinâmicos
O IP do cliente pode mudar constantemente. O GenieACS atualiza o IP automaticamente sempre que o roteador entra em contato (evento "Inform").
Para forçar ações em tempo real de fora para dentro (Connection Request / Botão Summon), o servidor precisa alcançar a rede interna do cliente. A nossa arquitetura foi pensada para hospedar o servidor dentro da rede do provedor (on-premise via Docker no Ubuntu), permitindo o roteamento direto para IPs da "pool" de CGNAT (ex: `100.64.x.x`).

## 3. Navegação do Painel (Abas)

### Devices (Dispositivos)
Aba principal onde todos os modems registrados aparecem.
- **Summon (Invocar):** Botão que manda um "cutucão" (Connection Request) no modem para forçá-lo a sincronizar e enviar/receber configurações com o servidor na mesma hora.
- **Data Model:** A "árvore" de parâmetros do roteador (ex: caminhos de SSID, senhas, uptime). A interface possui um limite visual de segurança (exibe no máximo 100 itens), sendo necessário usar a barra de *Search parameters* (ex: digitar "WLAN") para encontrar configurações específicas escondidas.

### Faults (Falhas)
Painel de diagnóstico. Registra os erros de comunicação ou recusas. Sempre que o servidor envia uma ordem e o roteador a recusa (ex: tentar alterar um campo somente-leitura, valor inválido ou parâmetro não suportado por aquela marca), o log detalhado do erro cai aqui.

### Presets (Predefinições / Gatilhos)
Funcionam como regras lógicas de **"Se / Quando"**. Define *quando* uma ação deve ocorrer e *para quem*.
Exemplo: "Sempre que um modem Huawei modelo X ligar na rede pela primeira vez (Evento `0 BOOTSTRAP`), acione a rotina Y."

### Provisions (Provisões / Ações / Scripts)
Funcionam como o **"Então"**. São os scripts (escritos em JavaScript restrito) executados quando um Preset é acionado.
A função principal usada nos códigos é a `declare()`, que não é um simples "mude isso", mas sim *"Declaro que o parâmetro X deve estar configurado assim"*. O servidor lê o modem e só envia a mudança se for estritamente necessário.

### Virtual Parameters (Parâmetros Virtuais)
Parâmetros inventados e armazenados apenas no servidor para facilitar a vida dos técnicos de atendimento.
Eles agrupam caminhos (Data Models) diferentes de várias marcas sob um único "apelido" (ex: criar a variável `Senha_WiFi`). O script interno traduz isso para a linguagem da Huawei, TP-Link, etc. Também podem fazer contas matemáticas para apresentar dados difíceis (como potência óptica) de forma humanizada.

### Files (Arquivos)
Repositório central de arquivos pesados. Usado principalmente para fazer upload de **Firmwares** (`.bin` / `.img`) de roteadores para atualizações em massa de madrugada, sem sobrecarregar o painel principal. Essa função é suportada pelo serviço `genieacs-fs` do nosso Docker.

### Config (Configurações da Interface)
Onde a aparência das tabelas e painéis é montada de forma declarativa. Permite **traduzir textos para português** (alterando os *labels*), adicionar novas colunas na tela principal, e criar novos gráficos no Dashboard sem precisar mexer em códigos HTML.

### Permissions & Users (Permissões e Usuários)
Controle de acesso granular (RBAC). Permite criar perfis (Roles) para diferentes níveis de atendimento (ex: Suporte N1) com acesso restrito (apenas leitura em `Devices` e visão bloqueada das demais abas). Aceita o uso de filtros rígidos para que um atendente veja, por exemplo, apenas roteadores pertencentes a uma cidade específica.

### Views (Visualizações)
O "código-fonte" visual. Contém código Front-end avançado (React/JSX) que permite que desenvolvedores redesenhem páginas inteiras, criem novos botões funcionais e mudem totalmente a identidade visual do painel, operando diretamente pelo navegador sem derrubar o container.
