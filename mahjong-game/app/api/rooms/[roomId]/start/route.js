import { getConnectedCount, markPlayerConnected, markPlayerDisconnected } from "@/server/redis/gameState";
import {prisma} from "../../../../lib/prisma";
import { NextResponse } from "next/server";

function registerRoomHandlers(io, socket) {

  /**
   * Event: game:join
   * Fired by a client immediately after connecting to Socket.io.
   * Payload: { roomId, playerId }
   *
   * What this does:
   * 1. Validates the player is actually in this room (MySQL check)
   * 2. Puts the socket into the Socket.io channel for this room
   * 3. Marks player as connected in Redis
   * 4. Tells all other players in the room "someone new connected"
   * 5. If all 4 are now connected, tells everyone "dealing begins"
   */
  socket.on('game:join', async ({ roomId, playerId }) => {
    try {
      // Validate: does this player actually belong to this room?
      const roomPlayer = await prisma.roomPlayer.findFirst({
        where: { roomId, playerId },
        include: { player: true },
      });

      if (!roomPlayer) {
        socket.emit('game:error', {
          event: 'game:join',
          message: 'You are not a member of this room',
        });
        return;
      }

      // Validate: is the room actually in progress?
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!room || room.status !== 'IN_PROGRESS') {
        socket.emit('game:error', {
          event: 'game:join',
          message: 'Room is not in progress yet',
        });
        return;
      }

      // Put this socket into the Socket.io channel for this room.
      // From now on, io.to(`game:${roomId}`).emit(...) reaches this client.
      socket.join(`game:${roomId}`);

      // Store roomId and playerId on the socket object itself —
      // we'll need these when the client disconnects (to know which room/player to clean up)
      socket.roomId = roomId;
      socket.playerId = playerId;
      socket.seat = roomPlayer.originalSeat;

      // Mark as connected in Redis
      await markPlayerConnected(roomId, playerId);

      const connectedCount = await getConnectedCount(roomId);

      // Tell EVERYONE in this room (including the new joiner) that someone connected
      io.to(`game:${roomId}`).emit('game:playerJoined', {
        playerId,
        displayName: roomPlayer.player.displayName,
        seat: roomPlayer.originalSeat,
        connectedCount,
        totalNeeded: 4,
      });

      console.log(
        `[socket] ${roomPlayer.player.displayName} (${roomPlayer.originalSeat}) joined game:${roomId} — ${connectedCount}/4 connected`
      );

      // If all 4 players are now connected, trigger the dealing phase.
      // We emit game:allPlayersReady — Step 4f (dealer.js) will listen
      // to this and actually deal the tiles.
      if (connectedCount === 4) {
        console.log(`[socket] All 4 players connected in room ${roomId} — starting deal`);
        io.to(`game:${roomId}`).emit('game:allPlayersReady', {
          roomId,
          message: 'All players connected — dealing begins',
        });
      }
    } catch (error) {
      console.error('[socket] game:join error:', error);
      socket.emit('game:error', {
        event: 'game:join',
        message: 'Server error during join',
      });
    }
  });

  /**
   * Handles a client disconnecting mid-game.
   * We mark them as disconnected in Redis and notify other players.
   * We do NOT end the game here — Step 4e just tracks the disconnect.
   * Reconnection/bot-takeover logic comes much later.
   */
  socket.on('disconnect', async () => {
    const { roomId, playerId, seat } = socket;

    // If socket never completed game:join (e.g. connected then immediately dropped),
    // roomId won't be set — nothing to clean up
    if (!roomId || !playerId) return;

    try {
      await markPlayerDisconnected(roomId, playerId);
      const connectedCount = await getConnectedCount(roomId);

      io.to(`game:${roomId}`).emit('game:playerDisconnected', {
        playerId,
        seat,
        connectedCount,
        message: `${seat} player disconnected`,
      });

      console.log(
        `[socket] ${seat} disconnected from game:${roomId} — ${connectedCount}/4 still connected`
      );
    } catch (error) {
      console.error('[socket] disconnect cleanup error:', error);
    }
  });
}

export default registerRoomHandlers;