const socketIO = require('socket.io');
const subStorage = require('./subscribeStorage');
const shotstackSErvice = require('../services/shotstack');

module.exports = server => {
    const io = global.io = socketIO(server, {
        allowEIO3: true, cors: { origin: '*', credentials: true }
    });

    io.on('connection', socket => {
        socket.on('render_subscribe', async id => {
            const sub = subStorage.find(id);
            if(sub) {
                subStorage.replaceSubByRenderId(id, { ...sub, socketId: socket.id });
                const result = await shotstackSErvice.getStatusBuild(id);
                if(result) {
                    shotstackSErvice.emitRender(result);
                }
            } else {
                subStorage.add(socket.id, id);
            }
        });  
    });
};