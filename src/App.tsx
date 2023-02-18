import React, { useEffect, useState } from "react";
import { Board } from "./components/Board";

export type GameState = 'waiting' | 'playing' | 'player-won' | 'game-over'

type LevelConfig = {
  totalColumns: number,
  totalRows: number,
  minesCount: number
}

type Level = {
  description: string,
  config: LevelConfig
}

type Levels = Record<'beginner' | 'intermediate' | 'expert', Level>

const levels: Levels = {
  beginner: {
    description: "Bem facil, feito pra bebes",
    config: {
      totalColumns: 8,
      totalRows: 8,
      minesCount: 10,
    }
  },
  intermediate: {
    description: "Bem facil, feito pra bebes",
    config: {
      totalColumns: 16,
      totalRows: 16,
      minesCount: 40
    }
  },
  expert: {
    description: "Bem facil, feito pra bebes",
    config: {
      totalColumns: 32,
      totalRows: 16,
      minesCount: 99
    }
  },
}

function App() {
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [gameLevel, setGameLevel] = useState<keyof Levels>('beginner')

  useEffect(() => {
    setGameState('waiting')
  }, [gameLevel])

  const handleOnPlayerStartPlaying = () => {
    setGameState('playing')
  }

  const handleOnGameOver = () => {
    setGameState('game-over')
  }

  const handlePlayerWon = () => {
    setGameState('player-won')
  }

  const handleLevelSelect = (level: keyof Levels) => {
    setGameLevel(level)
  }

  return (
    <>
      <div>
        {
          Object.keys(levels).map((level) => (
            <button
              disabled={gameState === 'playing'}
              key={level}
              onClick={() => handleLevelSelect(level as keyof Levels)}
            >
              {level}
            </button>
          ))
        }
      </ div>

      {gameState}

      {
        gameLevel && (
          <Board
            gameState={gameState}
            onGameOver={handleOnGameOver}
            onPlayerWon={handlePlayerWon}
            onPlayerStartPlaying={handleOnPlayerStartPlaying}
            {...levels[gameLevel].config}
          />
        )
      }
    </>
  );
}

export default App;
