import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ 
    cors: { 
        origin: '*',
        credentials: false
     } ,
})
export class VehicleGateway {
  @WebSocketServer()
  server: Server;

  emitVehicleUpdate(payload: {
    vehiculeId: number;
    imei: string;
    lat: string;
    lng: string;
    speed?: string;
    status: 'online' | 'offline' | 'stopped' | 'moving';
    last_connection: Date;
  }) {
    this.server.emit('vehicle:update', payload);
  }
}