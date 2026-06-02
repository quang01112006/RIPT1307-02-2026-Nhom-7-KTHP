import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to store connected clients: userId -> socketId
  private userSockets = new Map<string, string>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload._id;

      if (userId) {
        this.userSockets.set(userId, client.id);
        console.log(`User connected: ${userId} with socket ${client.id}`);
      } else {
        client.disconnect();
      }
    } catch (err) {
      console.log('Socket connection error:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(String(userId));
    if (socketId) {
      this.server.to(socketId).emit('NEW_NOTIFICATION', notification);
    }
  }

  broadcastComment(comment: any) {
    this.server.emit('NEW_COMMENT', comment);
  }

  broadcastUpdateComment(comment: any) {
    this.server.emit('UPDATE_COMMENT', comment);
  }

  broadcastDeleteComment(commentId: string) {
    this.server.emit('DELETE_COMMENT', { _id: commentId });
  }
}
