import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: '*', credentials: true },
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(OrderGateway.name);

  afterInit() {
    this.logger.log('OrderGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitOrderCreated(order: any) {
    this.server.emit('order.created', order);
  }

  emitOrderStatusUpdated(order: any) {
    this.server.emit('order.status.updated', order);
  }

  emitItemStatusUpdated(item: any) {
    this.server.emit('item.status.updated', item);
  }

  emitTableStatusUpdated(table: any) {
    this.server.emit('table.status.updated', table);
  }
}
