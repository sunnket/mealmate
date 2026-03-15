function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('join:gate', () => {
      socket.join('gate');
    });

    socket.on('join:student', (studentId) => {
      socket.join(`student:${studentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
