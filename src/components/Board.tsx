import React, { useEffect, useState } from "react"

import { GameState } from "../App"
import { Tile } from "./Tile"

import { useBoard } from "src/hooks/useBoard"
import { useMines } from "src/hooks/useMines"

type BoardProps = {
  totalRows: number,
  totalColumns: number,
  gameState: GameState,
  minesCount: number
  onGameOver: () => void,
  onPlayerWon: () => void,
  onPlayerFirstAction: () => void,
}

function Board({
  gameState,
  totalColumns,
  totalRows,
  minesCount,
  onGameOver,
  onPlayerWon,
  onPlayerFirstAction
}: BoardProps) {
  const [board, setBoard] = useBoard({ rows: totalRows, cols: totalColumns })
  const [minesPosition, setMinesPosition, { handleDetonateMines, handleSetMines }] = useMines({ board, minesCount })
  const [flagsRemaining, setFlagsRemaining] = useState<number>(minesCount)

  useEffect(() => {
    setFlagsRemaining(minesCount)
  }, [minesCount])

  useEffect(() => {
    if (!flagsRemaining && minesPosition.length) {
      const playerWon = board.every((row) =>
        row.every((tile) => tile.hasMine ? tile.isFlagged : tile.wasRevealed)
      )

      if (playerWon) onPlayerWon()
    }
  }, [board, flagsRemaining, minesPosition])

  useEffect(() => {
    if (gameState === "game-over") {
      handleDetonateMines(revealTile)
      revealIncorrectFlags()
    }
  }, [gameState])

  const onSetMines = (coordinatesToIgnore: Coordinates2D) => {
    const boardWithMines = handleSetMines(coordinatesToIgnore)
    setBoard(boardWithMines)
  }

  const getNeighbors = ({
    x,
    y
  }: Coordinates2D): Tile[] => {
    let neighbors: Tile[] = []

    for (let offSetX = -1; offSetX <= 1; offSetX++) {
      let currentX = x + offSetX

      for (let offSetY = -1; offSetY <= 1; offSetY++) {
        let currentY = y + offSetY

        const isCurrentTile = currentX === x && currentY === y

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

  const countMinesInNeighbors = (neighbors: Tile[]): number => {
    return neighbors.reduce((acc, tile) => tile.hasMine ? ++acc : acc, 0)
  }

  const getTileByPosition = ({
    x,
    y
  }: Coordinates2D): Tile => {
    return ({ ...board[x][y] })
  }

  const floodFill = ({
    x,
    y
  }: Coordinates2D): void => {
    // TODO - ADICIONAR INVERSãoo de dependencia pra ficar chique 8)
    let currentTile = getTileByPosition({ x, y })

    if (currentTile.isFlagged) return

    revealTile({ x, y })

    if (
      currentTile.wasRevealed ||
      currentTile.hasMine
    ) return

    const neighbors = getNeighbors({ x, y })
    const minesAround = countMinesInNeighbors(neighbors)

    neighbors.forEach((neighbor) => {
      if (!neighbor.wasRevealed && !minesAround)
        floodFill({
          x: neighbor.coordinates.x,
          y: neighbor.coordinates.y
        })
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

  const playerCanMakeAnAction = () => {
    switch (gameState) {
      case 'waiting':
        onPlayerFirstAction()
        return true

      case 'game-over':
        return false

      default:
        return true
    }
  }

  const handleTileLeftClick = async ({
    x,
    y
  }: Coordinates2D): Promise<void> => {
    if (gameState === "waiting") {
      onSetMines({ x, y })
    }

    if (!playerCanMakeAnAction()) return

    const currentTile = getTileByPosition({ x, y })

    if (currentTile.isFlagged) return

    if (currentTile.wasRevealed) {
      const neighbors = getNeighbors({ x, y })

      const flags = neighbors.reduce((acc, curr) => {
        if (curr.isFlagged) ++acc

        return acc
      }, 0)

      if (flags === currentTile.minesAround) {
        neighbors.forEach((neighbor) => {
          if (!neighbor.minesAround) {
            floodFill({
              x: neighbor.coordinates.x,
              y: neighbor.coordinates.y
            })
            return
          }

          if (!neighbor.isFlagged) {
            revealTile({
              x: neighbor.coordinates.x,
              y: neighbor.coordinates.y
            })
            return
          }
        })
      }

      return
    }

    floodFill({ x, y })
  }

  const handleTileRightClick = ({
    x,
    y
  }: Coordinates2D): void => {
    if (!playerCanMakeAnAction()) return

    const currentTile = getTileByPosition({ x, y })

    if (currentTile.wasRevealed) return

    toggleFlagOnTile(currentTile)
  }

  const toggleFlagOnTile = (
    tile: Tile,
    boardCopy: Board = [...board]
  ): void => {

    if (tile.isFlagged) {
      setFlagsRemaining(current => current + 1)
    } else {
      setFlagsRemaining(current => current - 1)
    }

    const newTileState: Tile = {
      ...tile,
      isFlagged: !tile.isFlagged
    }

    boardCopy[tile.coordinates.x][tile.coordinates.y] = newTileState
    setBoard([...boardCopy])
  }

  const revealTile = ({
    x,
    y
  }: Coordinates2D,
    boardCopy: Board = [...board]
  ): void => {
    const minesAround = countMinesInNeighbors(getNeighbors({ x, y }))

    const newTileState: Tile = {
      ...boardCopy[x][y],
      wasRevealed: true,
      minesAround
    }

    boardCopy[x][y] = newTileState
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
              coordinates,
              isFlagged
            }) => (
              <Tile
                coordinates={coordinates}
                key={`${coordinates.x}${coordinates.y}`}
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