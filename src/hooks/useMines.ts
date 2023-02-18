import React from "react";

import { randomIntFromInterval } from "src/utils/randomIntFromInterval";

type UseMinesProps = {
  board: Board;
  minesCount: number;
};

function useMines({ board, minesCount }: UseMinesProps) {
  const [positions, setPositions] = React.useState<Coordinates2D[]>([]);

  const handlers = React.useMemo(
    () => ({
      handleDetonateMines: (
        callback: (coordinates: Coordinates2D) => void
      ): void => {
        positions.forEach(({ x, y }) => {
          if (!board[x][y].isFlagged) callback({ x, y });
        });
      },
      handleSetMines: (coordinatesToIgnore: Coordinates2D) => {
        let options = board
          .flat()
          .filter(
            ({ coordinates }) =>
              coordinates.x !== coordinatesToIgnore.x &&
              coordinates.y !== coordinatesToIgnore.y
          );

        const boardCopy = [...board];
        const mines: Coordinates2D[] = [];

        for (let i = 0; i < minesCount; i++) {
          const randomIndex = randomIntFromInterval(0, options.length - 1);
          let [pickedOption] = options.splice(randomIndex, 1);

          boardCopy[pickedOption.coordinates.x][pickedOption.coordinates.y] = {
            ...pickedOption,
            hasMine: true,
          };

          mines.push({
            x: pickedOption.coordinates.x,
            y: pickedOption.coordinates.y,
          });
        }

        setPositions(mines);
        return boardCopy;
      },
    }),
    [board, minesCount, positions]
  );

  return [positions, setPositions, handlers] as const;
}

export { useMines };
