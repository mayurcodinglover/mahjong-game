// server/socket/index.js
// Initializes Socket.io and registers all event handler modules.
// This file is the single entry point for all socket logic —
// server/index.js calls this once with the io instance.
import registerGameHandlers from "./gameHandlers.js";
import registerRoomHandlers from "./roomHandlers.js";

function initializeSocket(io){
    io.on("connection",(socket)=>{
        console.log(`[socket] Client connected : ${socket.id}`);

        // Register handler groups — each file handles a specific concern.
    // We pass both io and socket:
    // - io: needed when a handler wants to broadcast to ALL clients in a channel
    // - socket: needed when a handler wants to respond to just THIS client
    registerRoomHandlers(io,socket);
    registerGameHandlers(io,socket);

    socket.on('disconnect',(reason)=>{
        console.log(`[socket] Client disconnected: ${socket.id}-reason ${reason}`);
        //Disconnect cleanupis handled inside roomHandlers
    })
    })
}

export default initializeSocket;