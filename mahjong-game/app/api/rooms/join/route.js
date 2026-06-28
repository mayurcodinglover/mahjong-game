import {prisma} from "../../../lib/prisma"
import { NextResponse } from "next/server";

const SEAT_ORDER=['EAST','SOUTH','WEST','NORTH'];

export async function POST(request)
{
    try {
        const body=await request.json();
        const {playerId,roomCode}=body;

        if(!playerId || !roomCode)
        {
            return NextResponse.json({
                error:'player id and room code are both required'
            },{status:400});
        }
        const player=await prisma.player.findUnique({where:{id:playerId}});
        if(!player)
        {
            return NextResponse.json({error:'player not found'},{status:404});
        }
        const room=await prisma.room.findUnique({
            where:{roomCode:roomCode.toUpperCase()},
            include:{roomPlayers:true}
        });

        if(!room)
        {
            return Response.json({ error: 'Room not found — check the code' }, { status: 404 });
        }
        if(room.status!=='WAITING')
        {
             return Response.json(
                { error: `Cannot join — room status is ${room.status}` },
                { status: 409 }
            );
        }
        const alreadyJoined=room.roomPlayers.find((rp)=>rp.playerId===playerId);
        if(alreadyJoined)
        {
            return NextResponse.json({
                roomId:room.id,
                yourSeat:alreadyJoined.originalSeat,
                isHost: alreadyJoined.isHost,
                message:'Your already joined this room'
            },{status:200});
        }
        if(room.roomPlayers.length>=4)
        {
          return Response.json({ error: 'Room is full' }, { status: 409 });
        }
        const nextSeat=SEAT_ORDER[room.roomPlayers.length];
        console.log(room.roomPlayers.length);
        
        const roomPlayer=await prisma.roomPlayer.create({
            data:{
                roomId:room.id,
                playerId,
                originalSeat:nextSeat,
                isHost:false,
            },
        });
        const updatedCount=room.roomPlayers.length+1
        if(updatedCount===4)
        {
             await prisma.room.update({
    where: { id: room.id },
    data: { status: 'READY' }, // host still needs to click Start
  });
        }

        return Response.json({
            roomId:room.id,
            yourSeat:roomPlayer.originalSeat,
            isHost:false,
            seatsFilled:updatedCount,
            seatTotal:4,
            roomFull:updatedCount===4,
            waitingForHost:updatedCount===4
        },{statu:201})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error:"Failed to join room"},{status:500});
    }
}