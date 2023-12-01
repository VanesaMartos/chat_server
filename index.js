// Creación y configuración del SERVER
const http = require('http');
const app = require('./src/app');
const Chat = require('./src/models/chat.model');

// Config .env
require('dotenv').config();

require('./src/config/db');

// Creación server
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on('listening', () => {
    console.log(`Servidor escuchando sobre el puerto ${PORT}`);
});

server.on('error', (error) => {
    console.log(error);
})

// Congif websocket server
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});


// socket como parámetro hace referencia al canal entre el cliente y el servidor
// Por cada cliente que se conecte habrá un socket diferente
// Todo lo que se hace en este bloque se ejecuta cuando se conecta un nuevo usuario
io.on('connection', async (socket) => {
    console.log('Se ha conectado un nuevo cliente.');

    // Mensaje informativo para el resto de usuarios
    socket.broadcast.emit('chat_message_server', {
        nombre: 'INFO',
        mensaje: 'Se ha conectado un nuevo usuario'
    });

    io.emit('clients_online', io.engine.clientsCount);

    // Extraemos los mensajes iniciales del chat
    const ultimos = await Chat.find().sort({ createdAt: -1 }).limit(5);

    // Emitir un evento "chat_init" hacia el cliente enviando el array de mensajes:
    socket.emit('chat_init', ultimos);

    // Escuchar los mensajes que llegan desde el cliente
    socket.on('chat_message_client', async (data) => {
        // Aquí utilizamos el modelo para guardar los mensajes
        await Chat.create(data);

        // emisión al resto de clientes
        io.emit('chat_message_server', data)
    });

    // Comprobar si el socket se desconecta:
    socket.on('disconnect', () => {
        io.emit('chat_message_server', {
            nombre: 'INFO',
            mensaje: 'Se ha desconectado un usuario.'
        });
        io.emit('clients_online', io.engine.clientsCount);
    });

});

/**

Cuando se conecta un nuevo usuario
    Recuperar los 5 últimos mensajes del chat
    Emitir un evento "chat_init" hacia el cliente enviando el array de mensajes (socket.emit('chat_init', ARRAY DE MENSAJES))
    En el front, subscribirse al evento chat_init y cargar en el array que estamos pintando los mensajes recibidos

*/