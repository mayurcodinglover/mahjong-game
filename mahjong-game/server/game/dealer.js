import { createShuffledWall } from "./tileEngine";
import { buildWalls,drawFromGardenWall,drawFromPlayingWall } from "./wallManager";

const SEAT_ORDER = ['EAST', 'SOUTH', 'WEST', 'NORTH'];

/**
 * Deal initial tiles to all players following the Willingdon rulebook sequence.
 *
 * Dealing order (counter-clockwise = EAST, SOUTH, WEST, NORTH in our seat layout):
 * - 3 rounds of 4 tiles each to every player (12 tiles each)
 * - Then 1 tile each in a special pattern (East top, South bottom, West top, North bottom)
 * - Then East takes one more tile → East=14, others=13
 */

function dealInitialHands(playingWall){
    const hands={
        EAST:[],
        SOUTH:[],
        WEST:[],
        NORTH:[],
    };
    let wall=[...playingWall];
    for(const seat of SEAT_ORDER)
    {
        for(let i=0;i<13;i++)
        {
            const {tile,remainingWall}=drawFromPlayingWall(wall);
            hands[seat].push(tile);
            wall=remainingWall;
        }
    }
    const {tile:extraTile,remainingWall}=drawFromPlayingWall(wall);
    hands.EAST.push(extraTile);
    wall=remainingWall;
    return {
        hands,
        remainingWall:wall,
    }
}

/**
 * Separate bonus tiles (flowers/seasons) from a player's hand.
 * Returns { hand: normalTiles[], flowers: bonusTiles[] }
 */

function extractFlowers(hand){
    const flower=hand.filter((tile)=>tile.isBonus);
    const normalHand=hand.filter((tile)=>!tile.isBonus);

    return {hand:normalHand,flower};
}

