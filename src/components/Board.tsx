import React, { useEffect, useState } from "react"
import { Tile, TileProps } from "./Tile"

type TileState = Omit<TileProps, 'onClick'>
type GameBoard = TileState[][]

function Board() {
  const [board, setBoard] = useState<GameBoard>([])
  const [minesPosition, setMinesPosition] = useState<TileState[]>();

  const totalRows = 10
  const totalColumns = 10

  useEffect(() => {
    const newBoard = createNewBoard(totalRows, totalColumns, createInitialTileState)
    setBoard(newBoard)
  }, [])

  const createInitialTileState = (
    positionX: number,
    positionY: number
  ): TileState => ({
    wasRevealed: false,
    hasMine: Math.random() * 10 > 8,
    minesAround: 0,
    positionX,
    positionY
  })

  const createNewBoard = (
    totalRows: number,
    totalColumns: number,
    createTileState: (positionX: number, positionY: number) => TileState
  ): GameBoard => {
    const mines: TileState[] = []

    const board = Array(totalRows).fill('').map((_, rowIndex) =>
      Array(totalColumns).fill('').map((_, columnIndex) => {
        const tile = createTileState(rowIndex, columnIndex)

        if (tile.hasMine)
          mines.push(tile)

        return tile
      })
    )

    setMinesPosition([...mines])
    return board
  }

  const getNeighbors = (
    positionX: number,
    positionY: number
  ): TileState[] => {
    let neighbors: TileState[] = []

    for (let offSetX = -1; offSetX <= 1; offSetX++) {
      let currentX = positionX + offSetX

      for (let offSetY = -1; offSetY <= 1; offSetY++) {
        let currentY = positionY + offSetY

        const isInsideBoundaries =
          currentX > -1 &&
          currentY > -1 &&
          currentX < totalRows &&
          currentY < totalColumns

        if (isInsideBoundaries) {
          neighbors.push(board[currentX][currentY])
        }
      }
    }

    return neighbors
  }

  const countMinesInNeighbors = (neighbors: TileState[]): number => {
    return neighbors.reduce((acc, tile) => tile.hasMine ? ++acc : acc, 0)
  }

  const getCurrentTile = (
    positionX: number,
    positionY: number
  ): TileState => {
    return ({ ...board[positionX][positionY] })
  }

  const floodFill = (
    startPointX: number,
    startPointY: number,
  ): void => {
    let currentTile = getCurrentTile(startPointX, startPointY)

    if (currentTile.wasRevealed || currentTile.hasMine)
      return

    const neighbors = getNeighbors(startPointX, startPointY)
    const minesAround = countMinesInNeighbors(neighbors)

    revealTile(startPointX, startPointY, minesAround)

    neighbors.forEach((neighbor) => {
      if (!neighbor.wasRevealed && !minesAround)
        floodFill(neighbor.positionX, neighbor.positionY)
    })
  }

  const revealMines = (): void => {
    minesPosition?.forEach(({ positionX, positionY }) => {
      revealTile(positionX, positionY)
    })
  }

  const handleTileClick = (
    positionX: number,
    positionY: number,
  ): void => {
    const currentTile = getCurrentTile(positionX, positionY)

    if (currentTile.hasMine)
      return revealMines()

    floodFill(positionX, positionY)
  }

  const revealTile = (
    positionX: number,
    positionY: number,
    minesAround: number = 0,
    boardCopy: GameBoard = [...board]
  ): void => {
    const newTileState: TileState = {
      ...boardCopy[positionX][positionY],
      wasRevealed: true,
      minesAround
    }

    boardCopy[positionX][positionY] = newTileState
    setBoard([...boardCopy])
  }


  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${totalColumns}, 40px)`,
        gridTemplateRows: `repeat(${totalRows}, 40px)`,
        gap: "1px"
      }}
    >
      {board.map((row) =>
        row.map(
          ({ wasRevealed, hasMine, minesAround, positionX, positionY }) => (
            <Tile
              positionX={positionX}
              positionY={positionY}
              key={`${positionX}${positionY}`}
              onClick={handleTileClick}
              wasRevealed={wasRevealed}
              hasMine={hasMine}
              minesAround={minesAround}
            />
          )
        )
      )}
    </div>
  )
}

export { Board }