// app/api/rooms/[roomId]/start/route.js
// POST /api/rooms/:roomId/start — host starts the game when all 4 players are seated

import { prisma } from '../../../../lib/prisma';

export async function POST(request, { params }) {
  try {
    const { roomId } =await params;
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return Response.json({ error: 'playerId is required' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomPlayers: true },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    // Only the host can start the game
    const requestingPlayer = room.roomPlayers.find(
      (rp) => rp.playerId === playerId
    );

    if (!requestingPlayer) {
      return Response.json(
        { error: 'You are not in this room' },
        { status: 403 }
      );
    }

    if (!requestingPlayer.isHost) {
      return Response.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      );
    }

    // Room must be READY (all 4 seated) before host can start
    if (room.status !== 'READY') {
      return Response.json(
        {
          error: `Cannot start — room status is ${room.status}. Need all 4 players seated first.`,
          seatsFilled: room.roomPlayers.length,
          seatsTotal: 4,
        },
        { status: 409 }
      );
    }

    // All good — flip to IN_PROGRESS
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });

    return Response.json({
      roomId,
      status: 'IN_PROGRESS',
      message: 'Game started — dealing will begin via Socket.io',
    });
  } catch (error) {
    console.error('[POST /api/rooms/[roomId]/start] Error:', error);
    return Response.json({ error: 'Failed to start game' }, { status: 500 });
  }
}