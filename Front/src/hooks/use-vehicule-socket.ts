import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface VehicleUpdate {
  vehiculeId: number;
  lat: string;
  lng: string;
  speed?: string;
  status: 'online' | 'offline';
  last_connection: string;
}

export function useVehicleSocket(onUpdate: (data: VehicleUpdate) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
        transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connecté:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
    });
    socket.on('vehicle:update', onUpdate);


    return () => {
      socket.off('vehicle:update', onUpdate);
      socket.disconnect();
    };
  }, [onUpdate]);
}