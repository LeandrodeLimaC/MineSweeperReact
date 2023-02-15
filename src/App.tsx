import React, { useEffect, useState } from "react";
import { Board } from "./components/Board";

export type GameState = 'waiting' | 'playing' | 'player-won' | 'game-over'
export type MineProbability = {
  base: number,
  outcomes: number
}

type LevelConfig = {
  totalColumns: number,
  totalRows: number,
  mineProbability: MineProbability
}

type Level = {
  description: string,
  config: LevelConfig
}

type Levels = Record<'easy' | 'medium', Level>

const levels: Levels = {
  easy: {
    description: "Bem facil, feito pra bebes",
    config: {
      totalColumns: 10,
      totalRows: 10,
      mineProbability: {
        base: 10,
        outcomes: 9
      }
    }
  },
  medium: {
    description: "Bem facil, feito pra bebes",
    config: {
      totalColumns: 20,
      totalRows: 20,
      mineProbability: {
        base: 7,
        outcomes: 5
      }
    }
  },
}

function App() {
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [gameLevel, setGameLevel] = useState<keyof Levels>('easy')

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
