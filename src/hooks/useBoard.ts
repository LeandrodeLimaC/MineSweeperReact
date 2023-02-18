import React from "react";

type UseBoardProps = Dimensions;

function useBoard({ rows, cols }: UseBoardProps) {
  const [board, setBoard] = React.useState<Board>([]);

  React.useEffect(() => {
    const newBoard = createBoard({ rows, cols }, createTile);
    setBoard(newBoard);
  }, [rows, cols]);

  const createTile = (coordinates: Coordinates2D): Tile => ({
    wasRevealed: false,
    hasMine: false,
    minesAround: 0,
    isFlagged: false,
    coordinates,
  });

  const createBoard = (
    { rows, cols }: Dimensions,
    createTileFn: (coordinates: Coordinates2D) => Tile
  ): Board =>
    Array(rows)
      .fill("")
      .map((_, x) =>
        Array(cols)
          .fill("")
          .map((_, y) => createTileFn({ x, y }))
      );

  return [board, setBoard] as const;
}

export { useBoard };
