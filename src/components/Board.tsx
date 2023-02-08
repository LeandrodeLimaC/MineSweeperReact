import React, { useEffect, useState } from "react"
import { GameState, MineProbability } from "../App"
import { Tile, TileProps } from "./Tile"

type TileState = Omit<TileProps, 'onLeftClick' | 'onRightClick'>
type GameBoard = TileState[][]

type BoardProps = {
  totalRows: number,
  totalColumns: number,
  gameState: GameState,
  mineProbability: MineProbability
  onGameOver: () => void,
  onPlayerWon: () => void,
  onPlayerStartPlaying: () => void,
}

function Board({
  gameState,
  totalColumns,
  totalRows,
  mineProbability,
  onGameOver,
  onPlayerWon,
  onPlayerStartPlaying
}: BoardProps) {
  const [board, setBoard] = useState<GameBoard>([])
  const [minesPosition, setMinesPosition] = useState<Pick<TileState, 'positionX' | 'positionY'>[]>([]);
  const [flagsRemaining, setFlagsRemaining] = useState<number>(0)

  useEffect(() => {
    setFlagsRemaining(minesPosition.length ?? 0)
  }, [minesPosition])

  useEffect(() => {
    if (!flagsRemaining && minesPosition.length) {
      const playerWon = board.every((row) =>
        row.every((tile) =>
          tile.hasMine ? tile.isFlagged : tile.wasRevealed
        )
      )

      if (playerWon) {
        onPlayerWon()
      }
    }
  }, [board, flagsRemaining, minesPosition])

  useEffect(() => {
    const newBoard = createNewBoard(totalRows, totalColumns, createInitialTileState)
    setBoard(newBoard)
  }, [totalRows, totalColumns])

  const createInitialTileState = (
    positionX: number,
    positionY: number
  ): TileState => ({
    wasRevealed: false,
    hasMine: Math.random() * mineProbability.base > mineProbability.outcomes,
    minesAround: 0,
    positionX,
    positionY,
    isFlagged: false
  })

  const createNewBoard = (
    totalRows: number,
    totalColumns: number,
    createTileState: (positionX: number, positionY: number) => TileState
  ): GameBoard => {
    const mines: Pick<TileState, 'positionX' | 'positionY'>[] = []

    const board = Array(totalRows).fill('').map((_, rowIndex) =>
      Array(totalColumns).fill('').map((_, columnIndex) => {
        const tile = createTileState(rowIndex, columnIndex)

        if (tile.hasMine)
          mines.push({
            positionX: tile.positionX,
            positionY: tile.positionY
          })

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

    if (
      currentTile.wasRevealed ||
      currentTile.hasMine ||
      currentTile.isFlagged
    ) return

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

  const playerCanMakeAnAction = () => {
    switch (gameState) {
      case 'waiting':
        onPlayerStartPlaying()
        return true

      case 'game-over':
        return false

      default:
        return true
    }
  }

  const handleTileLeftClick = (
    positionX: number,
    positionY: number,
  ): void => {
    if (!playerCanMakeAnAction()) return

    const currentTile = getCurrentTile(positionX, positionY)

    if (currentTile.isFlagged)
      return

    if (!currentTile.hasMine)
      return floodFill(positionX, positionY)

    onGameOver()
    revealMines()
  }

  const handleTileRightClick = (
    positionX: number,
    positionY: number,
  ): void => {
    if (!playerCanMakeAnAction()) return

    const currentTile = getCurrentTile(positionX, positionY)

    if (currentTile.wasRevealed) return

    toggleFlagOnTile(currentTile)
  }

  const toggleFlagOnTile = (
    tile: TileState,
    boardCopy: GameBoard = [...board]
  ): void => {

    if (tile.isFlagged) {
      setFlagsRemaining(current => current + 1)
    } else {
      setFlagsRemaining(current => current - 1)
    }

    const newTileState: TileState = {
      ...tile,
      isFlagged: !tile.isFlagged
    }

    boardCopy[tile.positionX][tile.positionY] = newTileState
    setBoard([...boardCopy])
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
    <div>
      {flagsRemaining}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalColumns}, 40px)`,
          gridTemplateRows: `repeat(${totalRows}, 40px)`,
          gap: "2px"
        }}
      >
        {board.map((row) =>
          row.map(
            ({
              wasRevealed,
              hasMine,
              minesAround,
              positionX,
              positionY,
              isFlagged
            }) => (
              <Tile
                positionX={positionX}
                positionY={positionY}
                key={`${positionX}${positionY}`}
                onLeftClick={handleTileLeftClick}
                onRightClick={handleTileRightClick}
                wasRevealed={wasRevealed}
                hasMine={hasMine}
                isFlagged={isFlagged}
                minesAround={minesAround}
              />
            )
          )
        )}
      </div>
    </div>
  )
}

export { Board }