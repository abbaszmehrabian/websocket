const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 3000 });

let clients = new Map();

wss.on('connection', function connection(ws) {
    const id = uuidv4();
    clients.set(id, ws);
    console.log(`New connection! (${id})`);

    ws.on('message', function incoming(message) {
        clients.forEach((client, clientId) => {
            if (clientId !== id && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        clients.delete(id);
        console.log(`Connection ${id} has disconnected`);
    });

    ws.on('error', (error) => {
        console.error(`An error has occurred: ${error.message}`);
    });

    // پشتیبانی از پینگ/پنگ
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
});

// تابع برای ارسال پینگ به کلاینت‌ها و بررسی وضعیت اتصالات
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(); // اصلاح شده: فراخوانی متد ping بدون پارامتر اضافی
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

console.log('WebSocket server is running on ws://localhost:3000');
