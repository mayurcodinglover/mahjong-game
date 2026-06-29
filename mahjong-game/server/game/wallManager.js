/**
 * Splits a shuffled 144-tile array into Playing Wall and Garden Wall.
 *
 * Garden Wall = last 16 tiles (reserved for Kong/flower replacements)
 * Playing Wall = everything else (128 tiles)
 *
 * We take Garden Wall from the END of the shuffled array because
 * in physical Mahjong the Garden Wall is the "back" of the wall —
 * players draw from the front, replacements come from the back.
 */
function buildWalls(shuffledTiles){
    if(shuffledTiles.length!==144)
    {
        throw new Error(
             `buildWalls expects 144 tiles, got ${shuffledTiles.length}`
        );
    }
    const gardenWall=shuffledTiles.slice(128);
    const playingWall=shuffledTiles.slice(0,128);
    return {playingWall,gardenWall};
}
/**
 * Draw one tile from the FRONT of the playing wall.
 * Returns { tile, remainingWall }
 * Returns null for tile if wall is empty.
 */
function drawFromPlayingWall(playingWall)
{
    if(playingWall.length===0)
    {
        return {tile:null,remainingWall:[]};
    }
    const [tile,...remainingWall]=playingWall;
    return {tile,remainingWall};
}


/**
 * Draw one tile from the BACK of the garden wall.
 * Used for: Kong replacement, flower replacement.
 * Returns { tile, remainingGardenWall }
 * Returns null for tile if garden wall is empty (should never happen in normal play).
 */
function drawFromGardenWall(gardenWall){
    if(gardenWall.length===0)
    {
        console.error('[wallManager] Garden wall is empty — this should not happen');
        return {tile:null,gardenWall:[]}
    }
    const remainingGardenWall=[...gardenWall];
    const tile=remainingGardenWall.pop();
    return {tile,remainingGardenWall}
}

/**
 * Check if the playing wall has enough tiles to continue.
 * Per our rules: Playing Wall must have at least 7 tiles remaining.
 * If it drops below 7, the hand ends as a Wall Game (draw).
 */
function isWallDead(playingWall)
{
    return playingWall.length<7;
}

export {buildWalls,drawFromPlayingWall,drawFromGardenWall,isWallDead}