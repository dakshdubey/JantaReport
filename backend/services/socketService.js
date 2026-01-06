const socketIo = require('socket.io');

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join-city', (cityId) => {
            socket.join(`city-${cityId}`);
            console.log(`Socket ${socket.id} joined city-${cityId}`);
        });

        socket.on('join-global', () => {
            socket.join('global-admin');
            console.log(`Socket ${socket.id} joined global-admin`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitNewIssue = (cityId, issue) => {
    if (io) {
        // Notify city admins
        io.to(`city-${cityId}`).emit('new_issue', issue);
        // Notify super admins
        io.to('global-admin').emit('new_issue', issue);
    }
};

const emitStatusUpdate = (cityId, issueId, newStatus) => {
    if (io) {
        io.to(`city-${cityId}`).emit('status_updated', { issueId, newStatus });
        io.to('global-admin').emit('status_updated', { issueId, newStatus, cityId });
    }
};

module.exports = {
    init,
    getIO,
    emitNewIssue,
    emitStatusUpdate
};
