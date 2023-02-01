import React from "react"

type TileProps = {
  positionX: number,
  positionY: number,
  onClick: (positionX: number, positionY: number) => void,
  wasRevealed: boolean,
  hasMine: boolean,
  minesAround: number
}

function Tile({
  positionX,
  positionY,
  onClick,
  minesAround,
  wasRevealed,
  hasMine
}: TileProps) {
  const handleOnClick = () => {
    onClick(positionX, positionY)
  }

  return (
    <div
      onClick={handleOnClick}
      style={{
        background: wasRevealed ? 'purple' : 'black',
        height: '40px',
        color: 'white'
      }}
    >
      {wasRevealed && (hasMine ? 'M' : minesAround)}
    </div>
  )
}

export { Tile, TileProps }