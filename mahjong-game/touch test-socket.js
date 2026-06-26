// Simulates ONE client connecting and sending game:join
// Delete this file after testing

import { io } from "socket.io-client";

const socket=io('http://localhost:3000');

socket.on('connect',()=>{
     console.log('Connected to socket server:', socket.id);

     socket.emit('game:join',{
        roomId:'f510ae06-50b2-43ae-9f3a-23f8cba181ca',
        playerId:'56eef1c4-ef3a-4a78-9da1-d2ec5ac703dc'
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
