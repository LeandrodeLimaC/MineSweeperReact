import React, { useEffect, useState } from "react"
import { GameState } from "../App"
import { Tile, TileProps } from "./Tile"

type TileState = Omit<TileProps, 'onLeftClick' | 'onRightClick'>
type GameBoard = TileState[][]

type BoardProps = {
  totalRows: number,
  totalColumns: number,
  gameState: GameState,
  minesCount: number
  onGameOver: () => void,
  onPlayerWon: () => void,
  onPlayerStartPlaying: () => void,
}

function Board({
  gameState,
  totalColumns,
  totalRows,
  minesCount,
  onGameOver,
  onPlayerWon,
  onPlayerStartPlaying
}: BoardProps) {
  const [board, setBoard] = useState<GameBoard>([])
  const [minesPosition, setMinesPosition] = useState<Coordinates2D[]>([])
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
    const newBoard = createNewBoard(totalRows, totalColumns, createInitialTileState)
    setBoard(newBoard)
  }, [totalRows, totalColumns])

  useEffect(() => {
    if (gameState === "game-over") {
      detonateMines()
      revealIncorrectFlags()
    }
  }, [gameState])

  const createInitialTileState = (coordinates: Coordinates2D): TileState => ({
    wasRevealed: false,
    hasMine: false,
    minesAround: 0,
    isFlagged: false,
    coordinates,
  })

  const randomIntFromInterval = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const plantMines = (coordinatesToIgnore: Coordinates2D) => {
    const boardCopy = [...board]
    const mines: Coordinates2D[] = []
    let options = board.flat().filter(({ coordinates }) =>
      coordinates.x !== coordinatesToIgnore.x &&
      coordinates.y !== coordinatesToIgnore.y
    )

    for (let i = 0; i < minesCount; i++) {
      const randomIndex = randomIntFromInterval(0, options.length - 1)
      let [pickedOption] = options.splice(randomIndex, 1)

      boardCopy[pickedOption.coordinates.x][pickedOption.coordinates.y] = {
        ...pickedOption,
        hasMine: true
      }

      mines.push({
        x: pickedOption.coordinates.x,
        y: pickedOption.coordinates.y
      })
    }

    setMinesPosition(mines)
    setBoard(boardCopy)
  }

  const createNewBoard = (
    totalRows: number,
    totalColumns: number,
    createTileState: (coordinates: Coordinates2D) => TileState
  ): GameBoard => {
    const board = Array(totalRows).fill('').map((_, x) =>
      Array(totalColumns).fill('').map((_, y) => createTileState({ x, y }))
    )

    return board
  }

  const getNeighbors = ({
    x,
    y
  }: Coordinates2D): TileState[] => {
    let neighbors: TileState[] = []

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

  const countMinesInNeighbors = (neighbors: TileState[]): number => {
    return neighbors.reduce((acc, tile) => tile.hasMine ? ++acc : acc, 0)
  }

  const getTileByPosition = ({
    x,
    y
  }: Coordinates2D): TileState => {
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

  const detonateMines = (): void => {
    minesPosition?.forEach(({ x, y }) => {
      let currentTile = getTileByPosition({ x, y })

      if (!currentTile.isFlagged) {
        revealTile({ x, y })
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

  const handleTileLeftClick = async ({
    x,
    y
  }: Coordinates2D): Promise<void> => {
    if (gameState === "waiting") {
      plantMines({ x, y })
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

    boardCopy[tile.coordinates.x][tile.coordinates.y] = newTileState
    setBoard([...boardCopy])
  }

  const revealTile = ({
    x,
    y
  }: Coordinates2D,
    boardCopy: GameBoard = [...board]
  ): void => {
    const minesAround = countMinesInNeighbors(getNeighbors({ x, y }))

    const newTileState: TileState = {
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