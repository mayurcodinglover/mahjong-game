-- CreateTable
CREATE TABLE `players` (
    `id` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `id` VARCHAR(191) NOT NULL,
    `roomCode` VARCHAR(191) NOT NULL,
    `status` ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'WAITING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `rooms_roomCode_key`(`roomCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_players` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `originalSeat` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `totalScore` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `room_players_roomId_playerId_key`(`roomId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rounds` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `roundType` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hands` (
    `id` VARCHAR(191) NOT NULL,
    `roundId` VARCHAR(191) NOT NULL,
    `dealNumber` INTEGER NOT NULL,
    `dealerSeat` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `result` ENUM('MAHJONG', 'WALL_GAME', 'DEAD') NOT NULL,
    `winnerId` VARCHAR(191) NULL,
    `winningSeat` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `winningTiles` JSON NULL,
    `meldsExposed` JSON NULL,
    `doublesApplied` JSON NULL,
    `basicPoints` INTEGER NULL,
    `finalPoints` INTEGER NULL,
    `specialHandName` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hand_scores` (
    `id` VARCHAR(191) NOT NULL,
    `handId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `seatWind` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `pointsChange` INTEGER NOT NULL,
    `isWinner` BOOLEAN NOT NULL DEFAULT false,
    `isOnPenalty` BOOLEAN NOT NULL DEFAULT false,
    `flowerBonus` INTEGER NOT NULL DEFAULT 0,
    `reasong` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_actions` (
    `id` VARCHAR(191) NOT NULL,
    `handId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `actionType` ENUM('DRAW', 'DISCARD', 'CLAIM_PUNG', 'CLAIM_KONG', 'CLAIM_CHOW', 'CLAIM_MAHJONG', 'FLOWER_REPLACE', 'DECLARE_MAHJONG', 'WRONG_DECLARATION') NOT NULL,
    `tile` VARCHAR(191) NULL,
    `meldType` ENUM('PUNG', 'KONG', 'CHOW', 'MAHJONG', 'PAIR', 'KNIT', 'CROCHET', 'MIXED_CHOW') NULL,
    `meldTiles` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `room_players` ADD CONSTRAINT `room_players_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_players` ADD CONSTRAINT `room_players_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rounds` ADD CONSTRAINT `rounds_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hands` ADD CONSTRAINT `hands_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `rounds`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hands` ADD CONSTRAINT `hands_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hand_scores` ADD CONSTRAINT `hand_scores_handId_fkey` FOREIGN KEY (`handId`) REFERENCES `hands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hand_scores` ADD CONSTRAINT `hand_scores_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_actions` ADD CONSTRAINT `game_actions_handId_fkey` FOREIGN KEY (`handId`) REFERENCES `hands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_actions` ADD CONSTRAINT `game_actions_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
