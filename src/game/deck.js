import { suits } from "../data/cards";
import { getActiveCardValues } from "./bids";

export function createDeck(totalCardsOnTable = 5) {
  const activeCards = getActiveCardValues(totalCardsOnTable);
  const deck = [];

  activeCards.forEach((card) => {
    suits.forEach((suit) => {
      deck.push(card + suit.symbol);
    });
  });

  return deck.sort(() => Math.random() - 0.5);
}

export function dealCardsForCounts(counts) {
  const totalCardsOnTable = counts.reduce((sum, count) => {
    if (count >= 5) return sum;
    return sum + count;
  }, 0);

  const deck = createDeck(totalCardsOnTable);

  const result = {
    player: [],
    bots: [[], [], [], []],
  };

  for (let i = 0; i < counts.length; i++) {
    if (counts[i] >= 5) continue;

    const cardsToGive = deck.splice(0, counts[i]);

    if (i === 0) {
      result.player = cardsToGive;
    } else {
      result.bots[i - 1] = cardsToGive;
    }
  }

  return result;
}