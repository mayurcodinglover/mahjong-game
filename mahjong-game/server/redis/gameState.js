import getRedisClient from "./redisClient.js";

const STATE_TTL_SECONDS=60*60*24;

const gameKey=(roomId)=>`game:room:${roomId}`;
const connectedKey=(roomId)=>`connected:${roomId}`;

/**
 * Save the full game state for a room.
 * Overwrites whatever was there before — we always store the complete state,
 * never partial updates. This avoids partial-write bugs where one field
 * is updated but another is stale.
 */

async function saveGameState(roomId,state){
    const redis=getRedisClient();
    await redis.set(
        gameKey(roomId),
        JSON.stringify(state),
        'EX',
        STATE_TTL_SECONDS
    );
}

// Load the full game state for a room
// return null if no state exists (room has not started or expired)
async function loadGameState(roomId)
{
    const redis=getRedisClient();
    const raw=await redis.get(gameKey(roomId));
    if(!raw) return null;
    return JSON.parse(raw)
}

/**
 * Delete game state when a hand/game is fully complete.
 * We don't want stale data hanging around in Redis after MySQL has
 * already recorded the final result.
 */

async function deleteGameState(roomId)
{
    const redis=getRedisClient();
    await redis.del(gameKey(roomId));
}
/**
 * Mark a player as connected for a given room.
 * We use a Redis Set — adding the same playerId twice has no effect.
 */

async function markPlayerConnected(roomId,playerId)
{
    const redis=getRedisClient();
    await redis.sadd(connectedKey(roomId),playerId)
    await redis.expire(connectedKey(roomId),STATE_TTL_SECONDS);
}

async function markPlayerDisconnected(roomId,playerId)
{
    const redis=getRedisClient();
    await redis.srem(connectedKey(roomId),playerId);
}
/**
 * Get count of connected players for a room.
 */
async function getConnectedCount(roomId)
{
    const redis=getRedisClient();
    return await redis.scard(connectedKey(roomId));
}
/**
 * Get all connected playerIds for a room.
 */
async function getConnectedPlayers(roomId)
{
    const redis=getRedisClient();
    return await redis.smembers(connectedKey(roomId));
}
/**
 * Clean up all Redis keys for a room — call this when a game ends completely.
 */

async function cleanupRoom(roomId)
{
    const redis=getRedisClient();
    await redis.del(gameKey(roomId));
    await redis.del(connectedKey(roomId));
}

export {saveGameState,loadGameState,deleteGameState,markPlayerConnected,markPlayerDisconnected,getConnectedCount,getConnectedPlayers,cleanupRoom};