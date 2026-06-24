/*
  Warnings:

  - You are about to drop the column `reasong` on the `hand_scores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hand_scores` DROP COLUMN `reasong`,
    ADD COLUMN `reason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `hands` MODIFY `winningSeat` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NULL;

-- CreateIndex
CREATE INDEX `room_players_roomId_idx` ON `room_players`(`roomId`);

-- RenameIndex
ALTER TABLE `game_actions` RENAME INDEX `game_actions_handId_fkey` TO `game_actions_handId_idx`;

-- RenameIndex
ALTER TABLE `game_actions` RENAME INDEX `game_actions_playerId_fkey` TO `game_actions_playerId_idx`;

-- RenameIndex
ALTER TABLE `hands` RENAME INDEX `hands_roundId_fkey` TO `hands_roundId_idx`;

-- RenameIndex
ALTER TABLE `hands` RENAME INDEX `hands_winnerId_fkey` TO `hands_winnerId_idx`;

-- RenameIndex
ALTER TABLE `room_players` RENAME INDEX `room_players_playerId_fkey` TO `room_players_playerId_idx`;
