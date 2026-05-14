import { cardHighToLow, cardLowToHigh } from "../data/cards";

import {
  getCardValue,
  countValues,
  hasStraight,
  getRepeatedValue,
} from "./helpers";

export function getMatchingCardIndexesForDeclaration(declaredCard, allCards) {
  if (!declaredCard) return [];

  const indexedCards = allCards.map((card, index) => ({
    card,
    index,
    value: getCardValue(card),
  }));

  function takeByValue(value, amount, cardsPool = indexedCards) {
    return cardsPool
      .filter((item) => item.value === value)
      .slice(0, amount)
      .map((item) => item.index);
  }

  function takeStraight(straightValues, cardsPool = indexedCards) {
    const result = [];

    straightValues.forEach((value) => {
      const found = cardsPool.find(
        (item) => item.value === value && !result.includes(item.index)
      );

      if (found) result.push(found.index);
    });

    return result.length === straightValues.length ? result : [];
  }

  if (
    declaredCard.includes("Kier") ||
    declaredCard.includes("Karo") ||
    declaredCard.includes("Trefl") ||
    declaredCard.includes("Pik")
  ) {
    let suitSymbol = "";

    if (declaredCard.includes("Kier")) suitSymbol = "♥";
    if (declaredCard.includes("Karo")) suitSymbol = "♦";
    if (declaredCard.includes("Trefl")) suitSymbol = "♣";
    if (declaredCard.includes("Pik")) suitSymbol = "♠";

    const suitCards = indexedCards.filter((item) =>
      item.card.includes(suitSymbol)
    );

    if (
      declaredCard === "Kier ♥" ||
      declaredCard === "Karo ♦" ||
      declaredCard === "Trefl ♣" ||
      declaredCard === "Pik ♠"
    ) {
      return suitCards.slice(0, 5).map((item) => item.index);
    }

    const straightValues = declaredCard.match(/A|K|Q|J|10|9|8|7|6/g);

    if (straightValues && straightValues.length === 5) {
      return takeStraight(straightValues, suitCards);
    }

    return [];
  }

  if (cardHighToLow.includes(declaredCard)) {
    return takeByValue(declaredCard, 1);
  }

  if (declaredCard.includes(" ")) {
    const parts = declaredCard.split(" ");

    const isStraight =
      parts.length === 5 &&
      parts.every((value) => cardLowToHigh.includes(value));

    if (isStraight) {
      return takeStraight(parts);
    }

    if (parts.length === 2) {
      const first = getRepeatedValue(parts[0]);
      const second = getRepeatedValue(parts[1]);

      return [
        ...takeByValue(first.value, first.count),
        ...takeByValue(second.value, second.count),
      ];
    }
  }

  const repeated = getRepeatedValue(declaredCard);

  if (repeated.count >= 2) {
    return takeByValue(repeated.value, repeated.count);
  }

  return [];
}

export function checkDeclaration(declaredCard, allCards) {
  const values = allCards.map(getCardValue);
  const counts = countValues(allCards);

  if (
    declaredCard.includes("Kier") ||
    declaredCard.includes("Karo") ||
    declaredCard.includes("Trefl") ||
    declaredCard.includes("Pik")
  ) {
    let suitSymbol = "";

    if (declaredCard.includes("Kier")) suitSymbol = "♥";
    if (declaredCard.includes("Karo")) suitSymbol = "♦";
    if (declaredCard.includes("Trefl")) suitSymbol = "♣";
    if (declaredCard.includes("Pik")) suitSymbol = "♠";

    const suitCards = allCards
      .filter((card) => card.includes(suitSymbol))
      .map(getCardValue);

    if (
      declaredCard === "Kier ♥" ||
      declaredCard === "Karo ♦" ||
      declaredCard === "Trefl ♣" ||
      declaredCard === "Pik ♠"
    ) {
      return suitCards.length >= 5;
    }

    const straightParts = declaredCard.match(/A|K|Q|J|10|9|8|7|6/g);

    const isStraight =
      straightParts &&
      straightParts.length === 5 &&
      straightParts.every((card) => cardLowToHigh.includes(card));

    if (isStraight) {
      return hasStraight(suitCards, straightParts);
    }

    return false;
  }

  if (cardHighToLow.includes(declaredCard)) {
    return values.includes(declaredCard);
  }

  const straightParts = declaredCard.split(" ");

  const isStraight =
    straightParts.length === 5 &&
    straightParts.every((card) => cardLowToHigh.includes(card));

  if (isStraight) {
    return hasStraight(values, straightParts);
  }

  if (declaredCard.includes(" ")) {
    const parts = declaredCard.split(" ");

    if (parts.length === 2) {
      const first = getRepeatedValue(parts[0]);
      const second = getRepeatedValue(parts[1]);

      return (
        counts[first.value] >= first.count &&
        counts[second.value] >= second.count
      );
    }
  }

  const repeated = getRepeatedValue(declaredCard);

  if (repeated.count >= 2) {
    return counts[repeated.value] >= repeated.count;
  }

  return false;
}