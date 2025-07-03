Videochamada com Tradução Simultânea
Este é um projeto de uma aplicação web completa para videochamada em grupo com tradução simultânea de legendas em tempo real. A aplicação permite que múltiplos utilizadores entrem numa sala de conferência, partilhem áudio, vídeo e ecrã, com o diferencial de que a fala de um participante é transcrita e traduzida para o idioma escolhido pelos outros participantes, sendo exibida como legenda.
A arquitetura é construída com um backend em Python (FastAPI) que funciona como uma SFU (Selective Forwarding Unit) para gerir a mídia, e um frontend moderno em Next.js (React) para uma interface de utilizador reativa e escalável.
✨ Funcionalidades
Salas de Conferência para Múltiplos Utilizadores: Suporte para mais de dois participantes por sala.
Tradução Simultânea: Legendas traduzidas em tempo real para o idioma de preferência de cada utilizador.
Partilha de Mídia: Suporte para partilha de áudio, vídeo e ecrã.
Criação de Reunião e Convite por Link: Gere links de convite únicos para cada sala.
Lobby de Pré-visualização: Ecrã para configurar câmara e microfone antes de entrar na chamada.
Controlos de Chamada: Interface intuitiva para silenciar/ativar microfone, ligar/desligar câmara e sair da chamada.
Indicador de Fala: Destaque visual no vídeo do participante que está a falar.
Design Moderno e Responsivo: Interface limpa e adaptável a diferentes tamanhos de ecrã.
🖼️ Screenshots
<div style="display: flex; gap: 20px;">
<figure>
<img src="https://placehold.co/600x400/0f172a/94a3b8?text=Ecr%C3%A3+do+Lobby" alt="Ecrã do Lobby" />
<figcaption align="center">Ecrã do Lobby</figcaption>
</figure>
<figure>
<img src="https://placehold.co/600x400/0f172a/94a3b8?text=Sala+de+Chamada" alt="Sala de Chamada" />
<figcaption align="center">Sala de Chamada em Ação</figcaption>
</figure>
</div>
🚀 Como Começar
Siga estas instruções para ter o projeto a correr localmente na sua máquina para desenvolvimento e testes.
Pré-requisitos
Antes de começar, certifique-se de que tem o seguinte software instalado:
Node.js (versão 18.x ou superior) - Download
Python (versão 3.8 ou superior) - Download
Google Cloud SDK (gcloud CLI) - Instruções de Instalação
Uma conta Google Cloud com a API Cloud Speech-to-Text e a API Cloud Translation ativadas.
🔧 Instalação e Configuração
O projeto está dividido em duas partes: backend e frontend. Ambas precisam de ser configuradas e executadas em paralelo.
1. Backend (Python/FastAPI)
O backend é responsável por toda a lógica de sinalização, reencaminhamento de mídia (SFU) e comunicação com as APIs de IA do Google.
# 1. Clone o repositório (se ainda não o fez)
git clone <url-do-seu-repositorio>
cd <pasta-do-projeto>/backend # Navegue para a pasta do backend

# 2. Crie e ative um ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# 3. Instale as dependências Python
pip install "fastapi[all]" "uvicorn[standard]" aiortc google-cloud-speech google-cloud-translate

# 4. Configure a autenticação do Google Cloud
# Este comando abrirá o seu navegador para que possa fazer login com a sua conta Google.
gcloud auth application-default login

# 5. Execute o servidor backend
# O servidor estará a correr em http://localhost:8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload


O seu terminal do backend deverá agora mostrar que o servidor Uvicorn está a correr e pronto para aceitar ligações.
2. Frontend (Next.js)
O frontend é a interface com a qual o utilizador interage, construída com Next.js e React.
# 1. Navegue para a pasta do frontend (num novo terminal)
cd <pasta-do-projeto>/frontend

# 2. Instale as dependências do Node.js
npm install

# 3. Execute o servidor de desenvolvimento do Next.js
# A aplicação estará disponível em http://localhost:3000
npm run dev


🎮 Utilização
Com ambos os servidores (backend e frontend) a correr, abra o seu navegador e aceda a http://localhost:3000.
Será recebido pelo lobby. Aqui, pode:
Criar uma Reunião Instantânea: Clique no botão + para gerar um nome de sala aleatório.
Entrar numa Sala Existente: Insira o nome de uma sala ou cole um link de convite completo no seu navegador (ex: http://localhost:3000/?room=nome-da-sala).
Configure a sua câmara e microfone e clique em "Entrar na Sala".
Para convidar outros, clique em "Copiar Link" e partilhe o URL com eles. Eles precisam de ter a aplicação a correr localmente para se conectarem.
🏗️ Arquitetura
A aplicação utiliza uma arquitetura cliente-servidor com uma Selective Forwarding Unit (SFU) no backend.
Frontend (Cliente): Cada cliente captura a sua mídia (câmara, microfone, ecrã) e envia uma única cópia para o servidor via WebRTC. Também recebe as faixas de mídia de todos os outros participantes do servidor.
Backend (Servidor SFU):
Recebe a faixa de mídia de cada participante.
Para faixas de vídeo, ele simplesmente as reencaminha para todos os outros participantes na sala.
Para faixas de áudio, ele reencaminha o áudio e, em paralelo, envia uma cópia para o pipeline de IA:
Speech-to-Text: Converte a fala em texto.
Translation: Traduz o texto para o idioma de destino de cada um dos outros participantes.
WebSocket: Envia a legenda traduzida para os clientes correspondentes.
🛠️ Tecnologias Utilizadas
Backend
Python 3.10+
FastAPI: Framework web de alta performance para a API e o servidor WebSocket.
Uvicorn: Servidor ASGI para executar o FastAPI.
aiortc: Biblioteca Python para implementar a lógica de servidor WebRTC (SFU).
Google Cloud Speech-to-Text: Para transcrição de áudio em tempo real.
Google Cloud Translation: Para tradução de texto.
Frontend
Next.js 13+ (com App Router): Framework React para renderização e estrutura da aplicação.
React 18+: Biblioteca para construir a interface de utilizador.
Tailwind CSS: Framework de CSS para estilização rápida e moderna.
WebRTC API (Navegador): Para comunicação de áudio/vídeo ponto a ponto com o servidor.
📁 Estrutura do Projeto Frontend
O frontend segue a estrutura recomendada para projetos Next.js com o App Router, promovendo a organização e a escalabilidade.
/frontend
|
├── .next/
├── node_modules/
|
├── public/
│   └── favicon.ico
|
└── src/
    |
    ├── app/                # Diretório principal do App Router
    │   ├── globals.css     # Estilos globais (Tailwind CSS)
    │   ├── layout.js       # Layout raiz da aplicação
    │   └── page.js         # Componente principal da página, gere o estado da chamada
    │
    └── components/         # Componentes React reutilizáveis
        ├── Controls.js     # Barra de controlos da chamada (mic, cam, etc.)
        ├── Icons.js        # Exporta os ícones SVG como componentes
        ├── Lobby.js        # Ecrã de configuração pré-chamada
        └── VideoPlayer.js  # Componente para exibir o vídeo de um participante
|
├── .gitignore
├── next.config.mjs
├── package.json
└── ... (outros ficheiros de configuração)


🔮 Melhorias Futuras
[ ] Chat de Texto: Implementar uma funcionalidade de chat de texto na sala.
[ ] Gravação da Chamada: Adicionar a capacidade de gravar a chamada (áudio e vídeo) no lado do servidor.
[ ] Autenticação de Utilizadores: Criar um sistema de login para gerir utilizadores e salas privadas.
[ ] Melhorar a Qualidade da Tradução: Permitir que o utilizador especifique o seu idioma de origem para melhorar a precisão da transcrição.
[ ] Deploy: Criar scripts e configurações para fazer o deploy da aplicação em serviços de nuvem como Vercel (frontend) e Google Cloud Run (backend).
"# tradutor-simultaneo" 
"# tradutor-V3" 
