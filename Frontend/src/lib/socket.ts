import { io, Socket } from 'socket.io-client';

// Socket event types
export interface SocketEvents {
  // Client → Server events
  authenticate: (data: { token: string }) => void;
  join_question: (data: { questionId: string }) => void;
  leave_question: (data: { questionId: string }) => void;
  typing: (data: { questionId: string }) => void;
  stop_typing: (data: { questionId: string }) => void;

  // Server → Client events
  authenticated: (data: { userId: string; username: string }) => void;
  auth_error: (data: { message: string }) => void;
  new_notification: (data: {
    type: string;
    message: string;
    questionId?: string;
    answerId?: string;
  }) => void;
  new_answer: (data: { answer: any }) => void;
  vote_updated: (data: {
    answerId: string;
    upvotes: number;
    downvotes: number;
    voteScore: number;
  }) => void;
  answer_accepted: (data: { answerId: string; questionId: string }) => void;
  user_typing: (data: { username: string; questionId: string }) => void;
  user_stop_typing: (data: { username: string; questionId: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Initialize socket connection
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket connected');
        this.isConnected = true;
        
        // Authenticate with token
        this.socket?.emit('authenticate', { token });
      });

      this.socket.on('authenticated', (data) => {
        console.log('✅ Socket authenticated:', data);
        resolve();
      });

      this.socket.on('auth_error', (data) => {
        console.error('❌ Socket auth error:', data);
        reject(new Error(data.message));
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join question room
  joinQuestion(questionId: string): void {
    this.socket?.emit('join_question', { questionId });
  }

  // Leave question room
  leaveQuestion(questionId: string): void {
    this.socket?.emit('leave_question', { questionId });
  }

  // Send typing indicator
  sendTyping(questionId: string): void {
    this.socket?.emit('typing', { questionId });
  }

  // Stop typing indicator
  stopTyping(questionId: string): void {
    this.socket?.emit('stop_typing', { questionId });
  }

  // Listen for events
  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]): void {
    this.socket?.on(event, callback as any);
  }

  // Remove event listener
  off<T extends keyof SocketEvents>(event: T, callback?: SocketEvents[T]): void {
    if (callback) {
      this.socket?.off(event, callback as any);
    } else {
      this.socket?.off(event);
    }
  }

  // Check if connected
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get socket instance
  get socketInstance(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService(); 