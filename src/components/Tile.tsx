import React from "react"

type TileProps = Tile & {
  onLeftClick: (coordinates: Coordinates2D) => void,
  onRightClick: (coordinates: Coordinates2D) => void,
}

function Tile({
  coordinates,
  onLeftClick,
  onRightClick,
  minesAround,
  wasRevealed,
  hasMine,
  isFlagged
}: TileProps) {
  const flaggedIncorrectly = !hasMine && isFlagged

  const handleOnLeftClick = () => onLeftClick({ ...coordinates })

  const handleOnRightClick = (ev: React.MouseEvent) => {
    ev.preventDefault()
    onRightClick({ ...coordinates })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        background: wasRevealed ? (flaggedIncorrectly ? 'red' : 'dodgerblue') : 'black',
      }}
      onClick={handleOnLeftClick}
      onContextMenu={handleOnRightClick}
    >
      {
        wasRevealed && !flaggedIncorrectly ? (
          hasMine ?
            'M' :
            (!!minesAround && minesAround)
        ) : (
          isFlagged && 'F'
        )
      }
    </div>
  )
}

export { Tile }
export type { TileProps }