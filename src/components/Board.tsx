import React, { useEffect, useState } from "react"
import { Tile, TileProps } from "./Tile"

type TileState = Omit<TileProps, 'onClick'>
type GameBoard = TileState[][]

function Board() {
  const [board, setBoard] = useState<GameBoard>([])
  const totalRows = 10
  const totalColumns = 10

  useEffect(() => {
    const newBoard = createNewBoard(totalRows, totalColumns, getInitialTileState)

    setBoard(newBoard)
  }, [])

  const getInitialTileState = (
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
    getStateFn: (positionX: number, positionY: number) => TileState
  ): GameBoard => {
    const board = Array(totalRows).fill('').map((_, rowIndex) =>
      Array(totalColumns).fill('').map((_, columnIndex) => getStateFn(rowIndex, columnIndex))
    )

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

  const floodFill = (
    startPointX: number,
    startPointY: number,
    board: GameBoard
  ): void => {
    const neighbors = getNeighbors(startPointX, startPointY)
    const minesAround = countMinesInNeighbors(neighbors)

    const getCurrentTile = () => board[startPointX][startPointY]

    revealTile(startPointX, startPointY, board, minesAround)

    if (!getCurrentTile().hasMine) {
      neighbors.map((neighbor) => {
        if (!neighbor.wasRevealed && getCurrentTile().minesAround === 0)
          return floodFill(neighbor.positionX, neighbor.positionY, board)

        return neighbor
      })
    }
  }

  const handleTileClick = (
    positionX: number,
    positionY: number,
  ): void => {
    floodFill(positionX, positionY, [...board])
  }

  const revealTile = (
    positionX: number,
    positionY: number,
    board: GameBoard,
    minesAround: number = 0
  ): void => {
    const newTileState = {
      ...board[positionX][positionY],
      wasRevealed: true,
      minesAround
    }

    board[positionX][positionY] = newTileState
    setBoard([...board])
  }


  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 40px)",
        gridTemplateRows: "repeat(10, 40px)",
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