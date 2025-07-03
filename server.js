const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const mediasoup = require('mediasoup');

// --- Configuração do Next.js ---
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// --- Lógica do Mediasoup e WebSocket ---
let worker;
const rooms = {}; // { roomId: { router, participants: {} } }

const createWorker = async () => {
    try {
        worker = await mediasoup.createWorker({ logLevel: 'warn' });
        worker.on('died', () => {
            console.error('Mediasoup worker morreu, a sair...');
            process.exit(1);
        });
        console.log(`Mediasoup worker criado com PID ${worker.pid}`);
    } catch (error) {
        console.error('Falha ao criar o worker do Mediasoup:', error);
        process.exit(1);
    }
};

app.prepare().then(async () => {
    await createWorker();

    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        const { pathname } = parse(request.url);
        // Apenas lida com pedidos para o nosso endpoint de WebSocket
        if (pathname.startsWith('/ws/')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws, req) => {
        const urlParts = req.url.split('/');
        const roomId = urlParts[2];
        const userId = urlParts[3];

        console.log(`Utilizador ${userId} a ligar-se à sala ${roomId}`);

        // A lógica de sinalização do Mediasoup e tradução iria aqui.
        // O código abaixo é um placeholder para a lógica de mensagens.
        ws.on('message', (message) => {
            console.log(`Mensagem recebida de ${userId}: ${message}`);
            // Exemplo: retransmitir mensagens para outros na sala
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === ws.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            console.log(`Utilizador ${userId} desconectado.`);
        });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Servidor pronto em http://localhost:${PORT}`);
    });
});
