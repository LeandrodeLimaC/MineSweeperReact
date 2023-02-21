import { useEffect } from "react";

type UseManagePlayerWon = {
  board: Board;
  noMoreFlagsAvailable: boolean;
  hasMines: boolean;
  callback: () => void;
};

function useManagePlayerWon({
  board,
  noMoreFlagsAvailable,
  hasMines,
  callback,
}: UseManagePlayerWon) {
  useEffect(() => {
    if (noMoreFlagsAvailable && hasMines) {
      const playerWon = board.every((row) =>
        row.every((tile) => (tile.hasMine ? tile.isFlagged : tile.wasRevealed))
      );

      if (playerWon) callback();
    }
  }, [board, noMoreFlagsAvailable, hasMines, callback]);
}

export { useManagePlayerWon };
