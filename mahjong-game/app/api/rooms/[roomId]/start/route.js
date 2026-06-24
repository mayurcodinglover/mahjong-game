import {prisma} from "../../../../lib/prisma";
import { NextResponse } from "next/server";
export async function POST(request,{params}){
    try {
        const {roomId}=params;

        const body=await request.json();
        const {playerId}=body;

        if(!playerId)
        {
            return Response.json({ error: 'playerId is required' }, { status: 400 });
        }
         const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomPlayers: true },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }
    const requestingPlayer=room.roomPlayers.find((rp)=>rp.playerId===playerId);
    if(!requestingPlayer)
    {
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
    if(room.status!=='READY')
    {
          return Response.json(
        {
          error: `Cannot start — room status is ${room.status}. Need all 4 players seated first.`,
          seatsFilled: room.roomPlayers.length,
          seatsTotal: 4,
        },
        { status: 409 }
      );
    }

    await prisma.room.update({
        where:{id:roomId},
        data:{status:'IN_PROGRESS',startedAt:new Date()},
    });
      return Response.json({
      roomId,
      status: 'IN_PROGRESS',
      message: 'Game started — dealing will begin via Socket.io',
    });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error:'Failed to start the game'},{status:500});
    }
}