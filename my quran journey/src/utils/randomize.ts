export const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

export const takeRandom = <T,>(items: T[], count: number): T[] => shuffle(items).slice(0, count);
