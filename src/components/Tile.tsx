import React from "react"

type TileProps = Tile & {
  onLeftClick: (coordinates: Coordinates2D) => void,
  onRightClick: (coordinates: Coordinates2D) => void,
}

const colors = {
  1: "#2c00f5",
  2: "#367e19",
  3: "#e73c00",
  4: "#11007f",
  5: "#701a00",
  6: "#3a7c81",
  7: "#000000",
  8: "#808080",
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
    <button
      style={{
        position: "absolute",
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        inset: 1,
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 'bold',
        background: wasRevealed ? (flaggedIncorrectly ? 'red' : '#c0c0c0') : '#c0c0c0',
        ...(!wasRevealed ? (
          {
            borderColor: 'white #808080 #808080 white',
            borderStyle: "solid",
            borderWidth: "4px 4px 4px 4px",
          }) : ({
            border: 0,

          }
        ))
      }}
      onClick={handleOnLeftClick}
      onContextMenu={handleOnRightClick}
    >
      <p style={{
        margin: 0,
        color: colors[minesAround as keyof typeof colors]
      }}>
        {isFlagged && '🚩'}
        {wasRevealed && hasMine && '💣'}
        {wasRevealed && !hasMine && !isFlagged && (!!minesAround && minesAround)}
      </p>
    </button>
  )
}

export { Tile }
export type { TileProps }