const SUITS=['CRACK','BOO','RING']
const WINDS=['EAST','SOUTH','WEST','NORTH']
const DRAGONS=[
    {color:'RED',suitAffiliation:'CRACK'},
    {color:'green',suitAffiliation:'BOO'},
    {color:'white',suitAffiliation:'RING'},
];
const FLOWER_NAMES=['PLUM','ORCHID','CHRYSANTHEMUM','BAMBOO_FLOWER'];
const SEASON_NAMES=['SPRING','SUMMER','AUTUMN','WINTER'];

// Builds the 108 tiles 3 suits x 9 values x 4 copies

function generateSuitTiles(){
    const tiles=[]

    for(const suit of SUITS)
    {
        for(let value=1;value<=9;value++)
        {
            for(let copyIndex=1;copyIndex<=4;copyIndex++)
            {
                tiles.push({
                    id:`${suit}-${value}-${copyIndex}`,
                    code:`${value}-${suit}`,
                    category:'SUIT',
                    suit,
                    value,
                    isHonour:false,
                    isBonus:false,
                    isTerminal:value===1 || value===9,
                });
            }
        }
    }
    return tiles;
}
// build 16 wind tiles 4 wind x 4 copy
function generateWindTiles()
{
    const tiles=[];
    for(const wind of WINDS)
    {
        for(let copyIndex=1;copyIndex<=4;copyIndex++)
        {
            tiles.push({
                id:`WIND-${wind}-${copyIndex}`,
                code:`WIND-${wind}`,
                category:'HONOUR',
                suit:'WIND',
                value:wind,
                isHonour:true,
                isBonus:false,
                isTerminal:false,
            });
        }
    }
    return tiles;
}
//generate 3 dragon x 4 = 12 tiles

function generateDragonTiles()
{
    const tiles=[];

    for(const dragon of DRAGONS)
    {
        for(let copyIndex=1;copyIndex<=4;copyIndex++)
        {
            tiles.push({
                id:`DRAGON-${dragon.color}-${copyIndex}`,
                code:`DRAGON-${dragon.color}`,
                category:'HONOUR',
                suit:'DRAGON',
                value:dragon.color,
                suitAffiliation:dragon.suitAffiliation,
                isHonour:true,
                isBonus:false,
                isTerminal:false,
            });
        }
    }
    return tiles;
}
// Build four flower tiles 1 for each
function generateFlowerTiles()
{
    return FLOWER_NAMES.map((name,index)=>({
        id:`FLOWER-${name}-1`,
        code:`FLOWER-${index+1}`,
        category:'BONOUS',
        suit:'FLOWER',
        value:index+1,
        name,
        isHonour:false,
        isBonous:true,
        isTerminal:false
    }));
}


// build the four season tiles each copy
function generateSeasonTiles()
{
    return SEASON_NAMES.map((name,index)=>({
        id:`SEASON-${name}-1`,
        code:`SEASON-${index+1}`,
        category:'BONOUS',
        suit:"SEASON",
        value:index+1,
        name,
        isHonour:false,
        isBonous:true,
        isTerminal:false
    }));
}

function generateFullTileSet()
{
    const tiles=[
        ...generateSuitTiles(),
        ...generateWindTiles(),
        ...generateDragonTiles(),
        ...generateFlowerTiles(),
        ...generateSeasonTiles()
    ];
    if(tiles.length!==144)
    {
        throw new Error(
            `Tile generation error:expected 144 tiles got ${tiles.length}`
        )
    }
    return tiles;
}
// suffle tiles
function shuffleTiles(tiles)
{
    const shuffled=[...tiles];

    for(let i=shuffled.length-1;i>0;i--)
    {
        const j=Math.floor(Math.random()*(i+1));
        [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    return shuffled;
}

function createShuffledWall()
{
    const fullSet=generateFullTileSet();
    return shuffleTiles(fullSet) 
}

export {
    generateFullTileSet,
    shuffleTiles,
    createShuffledWall,
    SUITS,
    WINDS,
    DRAGONS,
    FLOWER_NAMES,
    SEASON_NAMES
};
