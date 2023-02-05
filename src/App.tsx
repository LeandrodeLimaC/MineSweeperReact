import React, { useEffect, useState } from "react";
import { Board } from "./components/Board";

export type GameState = 'playing' | 'game-over' | 'finished'
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
      totalColumns: 2,
      totalRows: 2,
      mineProbability: {
        base: 10,
        outcomes: 8
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
  const [gameState, setGameState] = useState<GameState>('playing')
  const [gameLevel, setGameLevel] = useState<keyof Levels>('easy')

  useEffect(() => {
    setGameState('playing')
  }, [gameLevel])

  const handleOnGameOver = () => {
    setGameState('game-over')
  }

  const handleLevelSelect = (level: keyof Levels) => {
    console.log(level)
    setGameLevel(level)
  }

  return (
    <>
      {
        Object.keys(levels).map((level) => (
          <button
            key={level}
            onClick={() => handleLevelSelect(level as keyof Levels)}
          >
            {level}
          </button>
        ))
      }

      {
        gameLevel && (
          <Board
            gameState={gameState}
            onGameOver={handleOnGameOver}
            {...levels[gameLevel].config}
          />
        )
      }
    </>
  );
}

export default App;
