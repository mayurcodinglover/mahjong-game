import {prisma} from "../../../lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req,{params})
{
    try {
        const {roomId}=await params;
        console.log(roomId);
        
        const room=await prisma.room.findUnique({
            where:{
                id:roomId
            },
            include:{
                roomPlayers:{
                    include:{
                        player:true,
                    },
                },
            },
        });
        if(!room)
        {
            return NextResponse.json({status:404},{error:"Room not found"});
        }
        const seatedPlayers=room.roomPlayers.map((rp)=>({
            playerId:rp.playerId,
            displayName:rp.player.displayName,
            seat:rp.originalSeat
        }));

        return NextResponse.json({
            roomId:room.id,
            roomCode:room.roomCode,
            status:room.status,
            seatsFilled:seatedPlayers.length,
            seatsTotal:4,
            players:seatedPlayers
        });
    } catch (error) {
        console.error("Internal server Errro",error);
        return NextResponse.json({message:"Internal server Error"},{status:500});
    }
}