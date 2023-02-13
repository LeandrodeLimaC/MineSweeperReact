import React from "react"

type TileProps = {
  positionX: number,
  positionY: number,
  wasRevealed: boolean,
  hasMine: boolean,
  minesAround: number
  isFlagged: boolean,
  onLeftClick: (positionX: number, positionY: number) => void,
  onRightClick: (positionX: number, positionY: number) => void,
}

function Tile({
  positionX,
  positionY,
  onLeftClick,
  onRightClick,
  minesAround,
  wasRevealed,
  hasMine,
  isFlagged
}: TileProps) {
  const handleOnLeftClick = () => {
    onLeftClick(positionX, positionY)
  }

  const handleOnRightClick = (ev: React.MouseEvent) => {
    ev.preventDefault()
    onRightClick(positionX, positionY)
  }

  const flaggedIncorrectly = !hasMine && isFlagged
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

export { Tile, TileProps }