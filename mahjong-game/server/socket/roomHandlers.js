// Handles socket events related to joining and leaving a game session.
// These are the FIRST events that fire after a client connects.

import { markPlayerConnected,markPlayerDisconnected,getConnectedCount,getConnectedPlayers,loadGameState } from "../redis/gameState.js";

import {prisma}  from "../../app/lib/prisma.js";

function registerRoomHandlers(io,socket)
{
    /**
     * Event:game:join
     * fired by a client immediately after connecting to socket.io
     * payload:{roomId,playerId}
     * 
     * what this does
     * 1.validates the player is actually in this room
     * 2.puts the socket into the socket.io channer for this room
     * 3 marks player as connected in redis
     * 4.Tells all other players in the room someone connected
     * 5.If all 4 are now connected tells everyone dealing begin
     */
    socket.on('game:join',async({roomId,playerId})=>{
        try {
            console.log(roomId,playerId);
            
            //validate does this player actually belongs to this room?
            const roomPlayer=await prisma.roomPlayer.findFirst({
                where:{roomId,playerId},
                include:{player:true},
            });
            console.log(roomPlayer);
            if(!roomPlayer)
            {
                socket.emit('game:error',{
                    event:'game:join',
                    message:"you are not a member of this room"
                });
                return;
            }
            // Validate: is the room actually in progress?
            const room=await prisma.room.findUnique({
                where:{id:roomId}
            });

            if(!room || room.status!=='IN_PROGRESS')
            {
                socket.emit('game:error',{
                    event:'game:join',
                    message:"Room is not in progress yet"
                });
                return;
            }
            socket.join('game:${roomId}')
            socket.roomId=roomId;
            socket.playerId=playerId;
            socket.seat=roomPlayer.originalSeat;

            await markPlayerConnected(roomId,playerId);

            const connectedCount=await getConnectedCount(roomId);

            // Tell EVERYONE in this room (including the new joiner) that someone connected
            io.to(`game:${roomId}`).emit('game:playerJoined',{
                playerId,
                displayName:roomPlayer.player.displayName,
                seat:roomPlayer.originalSeat,
                connectedCount,
                totalNeeded:4,
            });
            console.log(
        `[socket] ${roomPlayer.player.displayName} (${roomPlayer.originalSeat}) joined game:${roomId} — ${connectedCount}/4 connected`);

        // If all 4 players are now connected, trigger the dealing phase.
         // We emit game:allPlayersReady — Step 4f (dealer.js) will listen
          // to this and actually deal the tiles.

          if(connectedCount===4)
          {
            console.log(`[socket] All 4 players connected in room ${roomId} — starting deal`);
            io.to(`game:${roomId}`).emit('game:allPlayersReady',{
                message: 'All players connected — dealing begins',
            });
          }
        } catch (error) {
             console.error('[socket] game:join error:', error);
             socket.emit('game:error',{
                event: 'game:join',
                message: 'Server error during join',
             });
        }
    });
}
export default registerRoomHandlers;