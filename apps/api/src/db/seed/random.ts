/** Deterministic random numbers: the same seed always produces the same demo data. */
export type Random = {
  /** A number from 0 (included) to 1 (excluded). */
  next(): number;
  /** A whole number from `min` to `max`, both included. */
  integer(min: number, max: number): number;
  chance(probability: number): boolean;
  pick<Item>(items: readonly Item[]): Item;
  /** Picks an option with a probability proportional to its weight. */
  weighted<Item>(options: ReadonlyArray<readonly [Item, number]>): Item;
};

export function createRandom(seed: number): Random {
  let state = seed >>> 0;

  // A linear congruential generator with the constants from Numerical Recipes.
  // Useless for anything secret, and plenty for demo data.
  function next(): number {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  }

  function integer(min: number, max: number): number {
    return min + Math.floor(next() * (max - min + 1));
  }

  function pick<Item>(items: readonly Item[]): Item {
    const item = items[integer(0, items.length - 1)];
    if (item === undefined) {
      throw new Error("Cannot pick from an empty list.");
    }
    return item;
  }

  function weighted<Item>(options: ReadonlyArray<readonly [Item, number]>): Item {
    const totalWeight = options.reduce((sum, [, weight]) => sum + weight, 0);
    let remaining = next() * totalWeight;
    for (const [item, weight] of options) {
      if (remaining < weight) {
        return item;
      }
      remaining -= weight;
    }
    // Only reachable through floating-point rounding, where the last option is the right one.
    const lastOption = options.at(-1);
    if (!lastOption) {
      throw new Error("Cannot pick from an empty list.");
    }
    return lastOption[0];
  }

  return {
    next,
    integer,
    pick,
    weighted,
    chance: (probability) => next() < probability,
  };
}
