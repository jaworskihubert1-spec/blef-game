import { cardPower, getRepeatedValue } from "./helpers";

import {
  cardHighToLow,
  cardLowToHigh,
  suits,
} from "../data/cards";

import {
  handTypes5Cards,
  handTypes6PlusCards,
} from "../data/hands";

export function getCurrentHandTypes(totalCardsOnTable) {
  if (totalCardsOnTable === 5) {
    return handTypes5Cards;
  }

  return handTypes6PlusCards;
}

export function getActiveCardValues(totalCardsOnTable) {
  if (totalCardsOnTable >= 20) {
    return ["9", "10", "J", "Q", "K", "A", "8", "7", "6"];
  }

  if (totalCardsOnTable >= 16) {
    return ["9", "10", "J", "Q", "K", "A", "8", "7"];
  }

  if (totalCardsOnTable >= 12) {
    return ["9", "10", "J", "Q", "K", "A", "8"];
  }

  return ["9", "10", "J", "Q", "K", "A"];
}

export function generateBidOptions(type, totalCardsOnTable = 5) {
  const activeHighToLow = getActiveCardValues(totalCardsOnTable)
    .slice()
    .sort((a, b) => cardPower(b) - cardPower(a));

  const activeLowToHigh = activeHighToLow.slice().reverse();

  function generateStraights() {
    const straights = [];

    for (let i = 0; i <= activeLowToHigh.length - 5; i++) {
      const straightLowToHigh = activeLowToHigh.slice(i, i + 5);
      const straightHighToLow = straightLowToHigh.slice().reverse();

      straights.push({
        label: straightHighToLow.join(" "),
        highCard: straightHighToLow[0],
      });
    }

    return straights.sort(
      (a, b) => cardPower(b.highCard) - cardPower(a.highCard)
    );
  }

  if (type.name === "Wysoka karta") {
    return activeHighToLow.map((card) => ({
      label: card,
      power: type.rank * 10000 + cardPower(card),
    }));
  }

  if (type.name === "Para") {
    return activeHighToLow.map((card) => ({
      label: `${card}${card}`,
      power: type.rank * 10000 + cardPower(card),
    }));
  }

  if (type.name === "Trójka") {
    return activeHighToLow.map((card) => ({
      label: `${card}${card}${card}`,
      power: type.rank * 10000 + cardPower(card),
    }));
  }

  if (type.name === "Kareta") {
    return activeHighToLow.map((card) => ({
      label: `${card}${card}${card}${card}`,
      power: type.rank * 10000 + cardPower(card),
    }));
  }

  if (type.name === "Strit") {
    return generateStraights().map((straight) => ({
      label: straight.label,
      power: type.rank * 10000 + cardPower(straight.highCard),
    }));
  }

  if (type.name === "Kolor") {
    return suits.map((suit, i) => ({
      label: `${suit.name} ${suit.symbol}`,
      power: type.rank * 10000 + i,
    }));
  }

  if (type.name === "Poker") {
    const options = [];

    generateStraights().forEach((straight) => {
      suits.forEach((suit, suitIndex) => {
        options.push({
          label: `${straight.label} (${suit.name} ${suit.symbol})`,
          power:
            type.rank * 10000 +
            cardPower(straight.highCard) * 10 +
            suitIndex,
        });
      });
    });

    return options.sort((a, b) => a.power - b.power);
  }

  if (type.name === "Dwie pary") {
    const options = [];

    for (let i = 0; i < activeHighToLow.length; i++) {
      for (let j = i + 1; j < activeHighToLow.length; j++) {
        const high = activeHighToLow[i];
        const low = activeHighToLow[j];

        options.push({
          label: `${high}${high} ${low}${low}`,
          power:
            type.rank * 10000 +
            cardPower(high) * 100 +
            cardPower(low),
        });
      }
    }

    return options;
  }

  if (type.name === "Full") {
    const options = [];

    activeHighToLow.forEach((three) => {
      activeHighToLow.forEach((pair) => {
        if (three !== pair) {
          options.push({
            label: `${three}${three}${three} ${pair}${pair}`,
            power:
              type.rank * 10000 +
              cardPower(three) * 100 +
              cardPower(pair),
          });
        }
      });
    });

    return options;
  }

  return [];
}

export function getAllBidOptions(totalCardsOnTable = 5) {
  const currentHandTypes = getCurrentHandTypes(totalCardsOnTable);

  return currentHandTypes
    .flatMap((type) =>
      generateBidOptions(type, totalCardsOnTable).map((option) => ({
        ...option,
        handName: type.name,
      }))
    )
    .sort((a, b) => a.power - b.power);
}