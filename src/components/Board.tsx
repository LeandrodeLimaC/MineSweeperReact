import React, { useEffect } from "react"

import { GameState } from "../App"
import { Tile } from "./Tile"

import { useBoard } from "src/hooks/useBoard"
import { useMines } from "src/hooks/useMines"
import { useFlags } from "src/hooks/useFlags"

import { useManagePlayerWon } from "src/hooks/useManagePlayerWon"

type BoardProps = {
  totalRows: number,
  totalColumns: number,
  gameState: GameState,
  minesCount: number
  onGameOver: () => void,
  onPlayerWon: () => void,
  onPlayerFirstMove: () => void,
}

function Board({
  gameState,
  totalColumns,
  totalRows,
  minesCount,
  onGameOver,
  onPlayerWon,
  onPlayerFirstMove
}: BoardProps) {
  const [board, setBoard] = useBoard({ rows: totalRows, cols: totalColumns })
  const [minesPosition, { handleDetonateMines, handleSetMines }] = useMines({ board, minesCount })
  const [flagsAvailable, setFlagsAvailable] = useFlags({ minesCount })
  const canPlayerMakeAMove = gameState !== 'game-over'

  useManagePlayerWon({
    board,
    noMoreFlagsAvailable: !flagsAvailable,
    hasMines: !!minesPosition.length,
    callback: onPlayerWon
  })

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

  const getNeighbors = (
    { x, y }: Coordinates2D
  ) => {
    const neighbors = []

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

  const countInNeighbors = (
    key: 'hasMine' | 'isFlagged',
    neighbors: Tile[]
  ) =>
    neighbors.reduce((acc, tile) => tile[key] ? ++acc : acc, 0)

  const floodFill = (
    { x, y }: Coordinates2D
  ) => {
    let currentTile = board[x][y]

    if (currentTile.isFlagged)
      return

    revealTile({ x, y })

    if (
      currentTile.wasRevealed ||
      currentTile.hasMine
    ) return

    const neighbors = getNeighbors({ x, y })
    const minesAround = countInNeighbors('hasMine', neighbors)

    neighbors.forEach((neighbor) => {
      if (!neighbor.wasRevealed && !minesAround)
        floodFill(neighbor.coordinates)
    })
  }

  const revealIncorrectFlags = (boardCopy: Board = [...board]) => {
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

  const handlePlayerFirstMove = (coordinates: Coordinates2D) => {
    onSetMines(coordinates)
    onPlayerFirstMove()
  }

  const withMoveCheck = (
    coordinates: Coordinates2D,
    callback: (coordinates: Coordinates2D) => void
  ) => {
    if (canPlayerMakeAMove) {
      if (gameState === "waiting") handlePlayerFirstMove(coordinates)

      callback(coordinates)
    }
  }

  const revealUnflaggedNeighbors = (tile: Tile) => {
    const neighbors = getNeighbors(tile.coordinates)
    const flagsInNeighbors = countInNeighbors('isFlagged', neighbors)

    if (flagsInNeighbors === tile.minesAround) {
      neighbors.forEach((neighbor) => {
        if (!neighbor.isFlagged)
          floodFill(neighbor.coordinates)
      })
    }
  }

  const handleTileLeftClick = ({
    x,
    y
  }: Coordinates2D) => {
    if (board[x][y].isFlagged)
      return

    if (board[x][y].wasRevealed) {
      revealUnflaggedNeighbors(board[x][y])
      return
    }

    floodFill({ x, y })
  }

  const handleTileRightClick = ({
    x,
    y
  }: Coordinates2D): void => {
    if (!board[x][y].wasRevealed) {
      toggleFlagOnTile({ x, y })
    }
  }

  const toggleFlagOnTile = (
    { x, y }: Coordinates2D,
    boardCopy: Board = [...board]
  ) => {
    boardCopy[x][y] = {
      ...boardCopy[x][y],
      isFlagged: !boardCopy[x][y].isFlagged
    }

    setFlagsAvailable(current => boardCopy[x][y].isFlagged ? --current : ++current)
    setBoard([...boardCopy])
  }

  const handleMineRevealed = () => {
    if (gameState !== "game-over") {
      onGameOver()
    }
  }

  const revealTile = (
    { x, y }: Coordinates2D,
    boardCopy: Board = [...board]
  ) => {
    const neighbors = getNeighbors({ x, y })
    const minesAround = countInNeighbors('hasMine', neighbors)

    boardCopy[x][y] = {
      ...boardCopy[x][y],
      wasRevealed: true,
      minesAround
    }

    setBoard([...boardCopy])

    if (boardCopy[x][y].hasMine) handleMineRevealed()
  }

  return (
    <div>
      {flagsAvailable}
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
                onLeftClick={(coordinates) => withMoveCheck(coordinates, handleTileLeftClick)}
                onRightClick={(coordinates) => withMoveCheck(coordinates, handleTileRightClick)}
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