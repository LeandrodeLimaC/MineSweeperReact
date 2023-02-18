type Coordinates2D = {
  x: number;
  y: number;
};

type Dimensions = {
  rows: number;
  cols: number;
};

type Tile = {
  coordinates: Coordinates2D;
  wasRevealed: boolean;
  hasMine: boolean;
  minesAround: number;
  isFlagged: boolean;
};

type Board = Tile[][];
