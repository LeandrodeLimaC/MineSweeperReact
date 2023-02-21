import { useEffect, useState } from "react";

type UseFlagsProps = {
  minesCount: number;
};

function useFlags({ minesCount }: UseFlagsProps) {
  const [flagsAvailable, setFlagsAvailable] = useState(minesCount);

  useEffect(() => {
    setFlagsAvailable(minesCount);
  }, [minesCount]);

  return [flagsAvailable, setFlagsAvailable] as const;
}

export { useFlags };
