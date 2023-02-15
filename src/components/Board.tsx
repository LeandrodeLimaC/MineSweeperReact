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

      if (playerWon) onPlayerWon()
    }
  }, [board, flagsRemaining, minesPosition])

  useEffect(() => {
    const newBoard = createNewBoard(totalRows, totalColumns, createInitialTileState)
    setBoard(newBoard)
  }, [totalRows, totalColumns])

  useEffect(() => {
    if (gameState === "game-over") {
      detonateMines()
      revealIncorrectFlags()
    }
  }, [gameState])

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

        const isCurrentTile = currentX === positionX && currentY === positionY

        const isInsideBoundaries =
          currentX > -1 &&
          currentY > -1 &&
          currentX < totalRows &&
          currentY < totalColumns

        if (isInsideBoundaries && !isCurrentTile) {
          neighbors.push(board[currentX][currentY])
        }
      }
    }

    return neighbors
  }

  const countMinesInNeighbors = (neighbors: TileState[]): number => {
    return neighbors.reduce((acc, tile) => tile.hasMine ? ++acc : acc, 0)
  }

  const getTileByPosition = (
    positionX: number,
    positionY: number
  ): TileState => {
    return ({ ...board[positionX][positionY] })
  }

  const floodFill = (
    startPointX: number,
    startPointY: number,
  ): void => {
    let currentTile = getTileByPosition(startPointX, startPointY)

    if (currentTile.isFlagged) return

    revealTile(startPointX, startPointY)

    if (
      currentTile.wasRevealed ||
      currentTile.hasMine
    ) return

    const neighbors = getNeighbors(startPointX, startPointY)
    const minesAround = countMinesInNeighbors(neighbors)


    neighbors.forEach((neighbor) => {
      if (!neighbor.wasRevealed && !minesAround)
        floodFill(neighbor.positionX, neighbor.positionY)
    })
  }

  const revealIncorrectFlags = () => {
    const boardCopy = [...board]

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalColumns; col++) {
        const currentTile = boardCopy[row][col]
        const isIncorrectlyFlagged = currentTile.isFlagged && !currentTile.hasMine

        if (isIncorrectlyFlagged) {
          currentTile.wasRevealed = true
        }
      }
    }

    setBoard([...boardCopy])
  }

  const detonateMines = (): void => {
    minesPosition?.forEach(({ positionX, positionY }) => {
      let currentTile = getTileByPosition(positionX, positionY)

      if (!currentTile.isFlagged) {
        revealTile(positionX, positionY)
      }
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

    const currentTile = getTileByPosition(positionX, positionY)

    if (currentTile.isFlagged) return

    if (currentTile.wasRevealed) {
      const neighbors = getNeighbors(positionX, positionY)

      const flags = neighbors.reduce((acc, curr) => {
        if (curr.isFlagged) ++acc

        return acc
      }, 0)

      if (flags === currentTile.minesAround) {
        // reveal neighbors which aren't flagged mines
        neighbors.forEach((neighbor) => {
          if (!neighbor.minesAround) {
            floodFill(neighbor.positionX, neighbor.positionY)
            return
          }
          if (!neighbor.isFlagged) {
            revealTile(neighbor.positionX, neighbor.positionY)
          }
        })
      }
      return
    }

    floodFill(positionX, positionY)
  }

  const handleTileRightClick = (
    positionX: number,
    positionY: number,
  ): void => {
    if (!playerCanMakeAnAction()) return

    const currentTile = getTileByPosition(positionX, positionY)

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
    boardCopy: GameBoard = [...board]
  ): void => {
    const minesAround = countMinesInNeighbors(getNeighbors(positionX, positionY))

    const newTileState: TileState = {
      ...boardCopy[positionX][positionY],
      wasRevealed: true,
      minesAround
    }

    boardCopy[positionX][positionY] = newTileState
    setBoard([...boardCopy])

    if (newTileState.hasMine && gameState !== "game-over") onGameOver()
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