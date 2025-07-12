const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Authenticate user
    socket.on('authenticate', async (data) => {
      try {
        const token = data.token;
        if (!token) {
          socket.emit('auth_error', { message: 'No token provided' });
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.isBanned) {
          socket.emit('auth_error', { message: 'Invalid token or banned user' });
          return;
        }

        socket.userId = user._id;
        socket.username = user.username;
        
        // Join user's personal room
        socket.join(`user_${user._id}`);
        
        socket.emit('authenticated', { 
          userId: user._id, 
          username: user.username 
        });
        
        console.log(`✅ User authenticated: ${user.username}`);
      } catch (error) {
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Join question room for real-time updates
    socket.on('join_question', (data) => {
      const { questionId } = data;
      socket.join(`question_${questionId}`);
      console.log(`📝 User joined question room: ${questionId}`);
    });

    // Leave question room
    socket.on('leave_question', (data) => {
      const { questionId } = data;
      socket.leave(`question_${questionId}`);
      console.log(`👋 User left question room: ${questionId}`);
    });

    // Typing indicators
    socket.on('typing', (data) => {
      const { questionId } = data;
      socket.to(`question_${questionId}`).emit('user_typing', {
        username: socket.username,
        questionId: questionId
      });
    });

    socket.on('stop_typing', (data) => {
      const { questionId } = data;
      socket.to(`question_${questionId}`).emit('user_stop_typing', {
        username: socket.username,
        questionId: questionId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  // Make io available globally for other modules
  global.io = io;
};

module.exports = socketHandler; 