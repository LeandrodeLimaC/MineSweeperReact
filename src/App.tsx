import React, { useEffect, useState } from "react";
import { Board } from "./components/Board";

export type GameState = 'restarting' | 'waiting' | 'playing' | 'player-won' | 'game-over'

type LevelConfig = {
  totalColumns: number,
  totalRows: number,
  minesCount: number
}

type Level = {
  label: string
  config: LevelConfig
}

type Levels = Record<'beginner' | 'intermediate' | 'expert', Level>

const levels: Levels = {
  beginner: {
    label: 'Beginner',
    config: {
      totalColumns: 8,
      totalRows: 8,
      minesCount: 10,
    }
  },
  intermediate: {
    label: 'Intermediate',
    config: {
      totalColumns: 16,
      totalRows: 16,
      minesCount: 40
    }
  },
  expert: {
    label: 'Expert',
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
    if (gameState === 'restarting') {
      setGameState('waiting')
    }
  }, [gameState])

  useEffect(() => {
    setGameState('waiting')
  }, [gameLevel])

  const handlePlayerFirstMove = () => {
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
          (Object.keys(levels) as Array<keyof Levels>).map((level) => (
            <button
              disabled={gameState === 'playing' || gameLevel === level}
              key={level}
              onClick={() => handleLevelSelect(level)}
            >
              {levels[level].label}
            </button>
          ))
        }
      </div>

      {gameState}...

      {
        gameLevel &&
        gameState !== 'restarting' && (
          <Board
            gameState={gameState}
            onGameOver={handleOnGameOver}
            onPlayerWon={handlePlayerWon}
            onPlayerFirstMove={handlePlayerFirstMove}
            {...levels[gameLevel].config}
          />
        )
      }
      <div>
        <button onClick={() => setGameState('restarting')}>
          Restart
        </button>
      </div>
    </>
  );
}

export default App;
