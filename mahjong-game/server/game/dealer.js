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

/**
 * Handle flower replacement for all players after initial deal.
 *
 * Rules:
 * - East replaces first
 * - If replacement tile is also a flower, East keeps replacing before South goes
 * - Then South, West, North in order
 * - Replacement tiles come from the BACK of the Garden Wall
 *
 * Returns updated hands, updated gardenWall, and a flowerLog
 * (so we can tell each player what flowers they have)
 */

function replaceFlowers(hands,gardenWall){
    let garden=[...gardenWall];

    const flowerCollections={
        EAST:[],
        SOUTH:[],
        WEST:[],
        NORTH:[],
    };
    for(const seat of SEAT_ORDER)
    {
        let keepReplacing=true;
        while(keepReplacing)
        {
            const {hand:cleanHand,flowers}=extractFlowers(hands[seat]);
            if(flowers.length===0)
            {
                keepReplacing=false;
            }
            else{
                flowerCollections[seat].push(...flowers);
                hands[seat]=cleanHand;

                for(let i=0;i<flowers.length;i++)
                {
                    const {tile:replacement,remainingGardenWall}=drawFromGardenWall(garden);
                    garden=remainingGardenWall;

                    if(replacement)
                    {
                        hands[seat].push(replacement);
                    }
                    else{
                        console.error('[dealer] Garden wall ran out during flower replacement');
                    }
                }
            }
        }
    }
    return {hands,gardenWall:garden,flowerCollections};
}


/**
 * Main entry point — runs the full deal for one hand.
 *
 * Takes: an array of player objects [{ playerId, seat }]
 * Returns: the complete initial game state object, ready to save to Redis
 */

function dealHand(players,roomId,handNumber,roundNumber,sessionConfig){
    const shuffled=createShuffledWall();

    const {playingWall,gardenWall}=buildWalls(shuffled);

    const {hands,remainingWall}=dealInitialHands(playingWall);

    const {
        hands:finalHands,
        gardenWall:finalGardenWall,
        flowerCollections,
    }=replaceFlowers(hands,gardenWall);

    //build the full game state object
    const gameState={
        roomId,
        roundNumber,
        handNumber,
        sessionConfig,
        dealerSeat:'EAST',
        currentTurn:'EAST',
        phase:'WAITING_DISCARD',

        //wall state
        playingWall:remainingWall,
        gardenWall:finalGardenWall,

        //player state
        players:{},

        //discard pile
        discardPile:[],

         // Last discard info — needed for claim logic
        lastDiscard: null,
        lastDiscardBy: null,

         // Claim window — tracks who has been offered the discard
    claimWindow: {
      open: false,
      tile: null,
      discardedBy: null,
      claims: [], // array of { seat, claimType } as they come in
    },
    };

    // Populate per-player state

    for(const player of players)
    {
        gameState.players[player.seat]={
            playerId: player.playerId,
            seat: player.seat,
            hand: finalHands[player.seat],
            exposed: [],  
            flowers: flowerCollections[player.seat],
            isOnPenalty: false,
             handSize: finalHands[player.seat].length,
        }
    }
    return gameState;
}

export default dealHand;