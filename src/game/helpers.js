import { cardLowToHigh } from "../data/cards";

export function cardPower(card) {
  return cardLowToHigh.indexOf(card);
}

export function getCardValue(card) {
  return card.replace("♥", "").replace("♦", "").replace("♣", "").replace("♠", "");
}

export function countValues(allCards) {
  const counts = {};

  allCards.forEach((card) => {
    const value = getCardValue(card);
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}

export function hasStraight(values, straightCards) {
  return straightCards.every((card) => values.includes(card));
}

export function getRepeatedValue(group) {
  if (group === "1010") return { value: "10", count: 2 };
  if (group === "101010") return { value: "10", count: 3 };
  if (group === "10101010") return { value: "10", count: 4 };

  const value = group[0];
  return { value, count: group.length };
}

export function getAliveIndexes(counts) {
  return counts
    .map((count, index) => (count < 5 ? index : null))
    .filter((index) => index !== null);
}

export function getStarterIndex(preferredIndex, counts) {
  const aliveIndexes = getAliveIndexes(counts);

  if (aliveIndexes.length === 0) return -1;

  if (preferredIndex !== null && counts[preferredIndex] < 5) {
    return preferredIndex;
  }

  return aliveIndexes[0];
}

export function getTotalCardsOnTable(counts) {
  return counts.reduce((sum, count) => {
    if (count >= 5) return sum;
    return sum + count;
  }, 0);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}