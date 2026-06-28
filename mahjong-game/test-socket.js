// Simulates ONE client connecting and sending game:join
// Delete this file after testing

import { io } from "socket.io-client";

const socket=io('http://localhost:3000');

socket.on('connect',()=>{
     console.log('Connected to socket server:', socket.id);

     socket.emit('game:join',{
        roomId:'03de504b-a2a4-4e47-8cad-16ae3b2b7baa',
        playerId:'28817242-2199-4090-be56-d261c7d39e93'
     });
});
socket.on('game:playerJoined',(data)=>{
    console.log('game:playerJoined event received:', data);
})
socket.on('game:error',(data)=>{
     console.log('game:error received:', data);
})
socket.on('disconnect', () => {
  console.log('Disconnected');
});
