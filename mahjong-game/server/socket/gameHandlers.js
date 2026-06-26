// Handles in-game socket events: turns, discards, claims, mahjong.
// For now this is a placeholder — we fill it in from Step 4f onwards.
// It exists now so server/socket/index.js can import it without errors.

function registerGameHandlers(io,socket)
{
    // Step 4f: game:deal (server-initiated, not client event)
     // Step 4g: game:discard
      // Step 4h: game:claim (pung, kong, chow, mahjong)
       // Step 4i: game:flowerReplace
        // All coming soon — one step at a time.
         console.log(`[gameHandlers] Registered for socket ${socket.id}`);
}

export default registerGameHandlers;