import {prisma} from "../../lib/prisma"
import { NextResponse } from "next/server"

const VALID_ROUND_MODES = [
  'EAST_REGULAR',
  'EAST_ALTERNATIVE',
  'SOUTH',
  'WEST',
  'NORTH',
];
function validateRounds(rounds)
{
    if(!Array.isArray(rounds) || rounds.length===0)
    {
         return 'rounds must be a non-empty array';
    }
    if(rounds.length>5)
    {
         return 'rounds cannot have more than 5 entries';
    }
    for(const r of rounds)
    {
        if(!VALID_ROUND_MODES.includes(r.mode))
        {
             return `Invalid round mode: ${r.mode}`;
        }
        if(!Number.isInteger(r.handsCount) || r.handsCount<1 || r.handsCount>20)
        {
             return `handsCount must be an integer between 1 and 20`;
        }
    }
    return null;
}
export async function POST(req,res){
    try {
        const body=await req.json();
        const {playerId,rounds}=body;
        if(!playerId)
        {
            return NextResponse.json({message:"PlayerId is required"},{status:400});
        }
        const configError=validateRounds(rounds);
        if(configError)
        {
            return Response.json({ error: configError }, { status: 400 });
        }

        const player=await prisma.player.findUnique({
            where:{id:playerId}
        });
        if(!player)
        {
            return NextResponse.json({message:"Player not found"},{status:404});
        }

        let roomCode;
        let isUnique=false;

        while(!isUnique)
        {
            roomCode=generateRoomCode();
            const exisitng=await prisma.room.findUnique({where:{roomCode}});
            if(!exisitng) isUnique=true
        }
        const result=await prisma.$transaction(async(tx)=>{
            const room=await tx.room.create({
            data:{
                roomCode,
                status:'WAITING'
            }
        });
        const hostSeat=await tx.roomPlayer.create({
            data:{
                roomId:room.id,
                playerId,
                originalSeat:'EAST',
                isHost:true,
            },
        });
        const config=await tx.sessionConfig.create({
            data:{
                roomId:room.id,
                rounds
            }
        })
        return {room,hostSeat,config}
        });

        return NextResponse.json({
            roomId:result.room.id,
            roomCOde:result.room.roomCode,
            status:result.room.status,
            isHost:true,
            yourSeat:result.hostSeat.originalSeat,
            seatsFilled:1,
            seatsTotal:4,
            sessionConfig:result.config.rounds
        },{status:201});
    } catch (error) {
        console.error("Internal server Error",error);
        return NextResponse.json({status:500},{message:"Error While creating room"});
    }
}
function generateRoomCode(){
     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
     let code='';
     for(let i=0;i<6;i++)
     {
        code+=chars[Math.floor(Math.random()*chars.length)];
     }
     return code;
}