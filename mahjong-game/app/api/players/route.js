import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { displayName } = body;

        if (typeof displayName !== "string" || displayName.trim().length === 0) {
            return NextResponse.json(
                { error: "Display name is required" },
                { status: 400 },
            );
        }

        const newPlayer = await prisma.player.create({
            data: {
                displayName: displayName.trim(),
            },
        });

        return NextResponse.json(
            {
                playerId: newPlayer.id,
                displayName: newPlayer.displayName,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("[POST /api/players] Error:", error);
        return NextResponse.json(
            { message: "Failed to create player" },
            { status: 500 },
        );
    }
}