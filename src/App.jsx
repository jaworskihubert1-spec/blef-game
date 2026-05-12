import { useState } from "react";
import "./App.css";
import "./Mobile.css";

const allCardValues = ["9", "10", "J", "Q", "K", "A", "8", "7", "6"];
const cardHighToLow = ["A", "K", "Q", "J", "10", "9", "8", "7", "6"];
const cardLowToHigh = ["6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const suits = [
  { name: "Kier", symbol: "♥" },
  { name: "Karo", symbol: "♦" },
  { name: "Trefl", symbol: "♣" },
  { name: "Pik", symbol: "♠" },
];

const botPersonalities = {
  1: {
    label: "Ostrożny",
    baseCheckChance: 0.24,
    bluffChance: 0.02,
    raiseRange: 2,
  },

  2: {
    label: "Agresywny",
    baseCheckChance: 0.12,
    bluffChance: 0.09,
    raiseRange: 4,
  },

  3: {
    label: "Chaos",
    baseCheckChance: 0.16,
    bluffChance: 0.12,
    raiseRange: 5,
  },

  4: {
    label: "Cwaniak",
    baseCheckChance: 0.24,
    bluffChance: 0.04,
    raiseRange: 3,
  },
};

const handTypes5Cards = [
  { name: "Wysoka karta", rank: 0 },
  { name: "Para", rank: 1 },
  { name: "Dwie pary", rank: 2 },
  { name: "Trójka", rank: 3 },
  { name: "Strit", rank: 4 },
  { name: "Full", rank: 5 },
  { name: "Kolor", rank: 6 },
  { name: "Kareta", rank: 7 },
  { name: "Poker", rank: 8 },
];

const handTypes6PlusCards = [
  { name: "Wysoka karta", rank: 0 },
  { name: "Para", rank: 1 },
  { name: "Strit", rank: 2 },
  { name: "Dwie pary", rank: 3 },
  { name: "Trójka", rank: 4 },
  { name: "Full", rank: 5 },
  { name: "Kolor", rank: 6 },
  { name: "Kareta", rank: 7 },
  { name: "Poker", rank: 8 },
];

function cardPower(card) {
  return cardLowToHigh.indexOf(card);
}

function getCurrentHandTypes(totalCardsOnTable) {
  if (totalCardsOnTable === 5) {
    return handTypes5Cards;
  }

  return handTypes6PlusCards;
}

function getActiveCardValues(totalCardsOnTable) {
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

function generateBidOptions(type, totalCardsOnTable = 5) {
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

    return straights.sort((a, b) => cardPower(b.highCard) - cardPower(a.highCard));
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
          power: type.rank * 10000 + cardPower(straight.highCard) * 10 + suitIndex,
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
          power: type.rank * 10000 + cardPower(high) * 100 + cardPower(low),
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
            power: type.rank * 10000 + cardPower(three) * 100 + cardPower(pair),
          });
        }
      });
    });

    return options;
  }

  return [];
}

function getAllBidOptions(totalCardsOnTable = 5) {
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

function getStarterIndex(preferredIndex, counts) {
  const aliveIndexes = getAliveIndexes(counts);

  if (aliveIndexes.length === 0) return -1;

  if (preferredIndex !== null && counts[preferredIndex] < 5) {
    return preferredIndex;
  }

  return aliveIndexes[0];
}

function getCardValue(card) {
  return card.replace("♥", "").replace("♦", "").replace("♣", "").replace("♠", "");
}

function countValues(allCards) {
  const counts = {};

  allCards.forEach((card) => {
    const value = getCardValue(card);
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}

function hasStraight(values, straightCards) {
  return straightCards.every((card) => values.includes(card));
}

function getRepeatedValue(group) {
  if (group === "1010") return { value: "10", count: 2 };
  if (group === "101010") return { value: "10", count: 3 };
  if (group === "10101010") return { value: "10", count: 4 };

  const value = group[0];
  return { value, count: group.length };
}

function getMatchingCardIndexesForDeclaration(declaredCard, allCards) {
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
        (item) =>
          item.value === value &&
          !result.includes(item.index)
      );

      if (found) {
        result.push(found.index);
      }
    });

    return result.length === straightValues.length ? result : [];
  }

  // Kolor / Poker
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

  // Wysoka karta
  if (cardHighToLow.includes(declaredCard)) {
    return takeByValue(declaredCard, 1);
  }

  // Strit / dwie pary / full
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

  // Para / Trójka / Kareta
  const repeated = getRepeatedValue(declaredCard);

  if (repeated.count >= 2) {
    return takeByValue(repeated.value, repeated.count);
  }

  return [];
}

function checkDeclaration(declaredCard, allCards) {
  const values = allCards.map(getCardValue);
  const counts = countValues(allCards);

  // Kolor i poker
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

    // Sam kolor
    if (
      declaredCard === "Kier ♥" ||
      declaredCard === "Karo ♦" ||
      declaredCard === "Trefl ♣" ||
      declaredCard === "Pik ♠"
    ) {
      return suitCards.length >= 5;
    }

    // Poker, np. Q J 10 9 8 (Kier ♥)
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

  // Wysoka karta
  if (cardHighToLow.includes(declaredCard)) {
    return values.includes(declaredCard);
  }

  // Strit dynamiczny, np. A K Q J 10 / Q J 10 9 8 / 10 9 8 7 6
  const straightParts = declaredCard.split(" ");

  const isStraight =
    straightParts.length === 5 &&
    straightParts.every((card) => cardLowToHigh.includes(card));

  if (isStraight) {
    return hasStraight(values, straightParts);
  }

  // Dwie pary / Full
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

  // Para / Trójka / Kareta
  const repeated = getRepeatedValue(declaredCard);

  if (repeated.count >= 2) {
    return counts[repeated.value] >= repeated.count;
  }

  return false;
}

function createDeck(totalCardsOnTable = 5) {
  const activeCards = getActiveCardValues(totalCardsOnTable);
  const deck = [];

  activeCards.forEach((card) => {
    suits.forEach((suit) => {
      deck.push(card + suit.symbol);
    });
  });

  return deck.sort(() => Math.random() - 0.5);
}

function getAliveIndexes(counts) {
  return counts
    .map((count, index) => (count < 5 ? index : null))
    .filter((index) => index !== null);
}

function dealCardsForCounts(counts) {
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

function getTotalCardsOnTable(counts) {
  return counts.reduce((sum, count) => {
    if (count >= 5) return sum;
    return sum + count;
  }, 0);
}



function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}




function App() {
  const [screen, setScreen] = useState("menu");
  const [history, setHistory] = useState([]);
  const [playerCard, setPlayerCard] = useState([]);
  const [bots, setBots] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("Ty");
  const [message, setMessage] = useState("");
  const [declaredCard, setDeclaredCard] = useState("");

const [gameFinished, setGameFinished] = useState(false);
const [finalResults, setFinalResults] = useState([]);

const [eliminatedPlayers, setEliminatedPlayers] = useState([]);

  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedHandType, setSelectedHandType] = useState(null);

  const [currentBidPower, setCurrentBidPower] = useState(-1);
  const [pendingBid, setPendingBid] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const [checking, setChecking] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  
  const players = ["Ty", "Bot 1", "Bot 2", "Bot 3", "Bot 4"];
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [roundResult, setRoundResult] = useState("");

  const [roundFinished, setRoundFinished] = useState(false);

  const [cardCounts, setCardCounts] = useState([1, 1, 1, 1, 1]);
  const [lastDeclarerIndex, setLastDeclarerIndex] = useState(null);

  const [roundOverlay, setRoundOverlay] = useState(false);

  const [nextStarterIndex, setNextStarterIndex] = useState(null);

  const [roundOverlayStarter, setRoundOverlayStarter] = useState("");

  const [highlightedCardIndexes, setHighlightedCardIndexes] = useState([]);
const [cardsWereChecked, setCardsWereChecked] = useState(false);

const [playerStats, setPlayerStats] = useState(
  players.map(() => ({
    bids: 0,
    checks: 0,
    bluffs: 0,
    truths: 0,
    highBids: 0,
    lowRaises: 0,
    totalBidPower: 0,
  }))
);



function getLiveTableCards(counts = cardCounts) {
  const liveCards = [];

  if (counts[0] < 5) {
    liveCards.push(...playerCard);
  }

  bots.forEach((botCards, botArrayIndex) => {
    const playerIndex = botArrayIndex + 1;

    if (counts[playerIndex] < 5) {
      liveCards.push(...botCards);
    }
  });

  return liveCards;
}

function getMinCardsNeededForLabel(label) {
  if (!label) return 0;

  if (
    label.includes("Kier") ||
    label.includes("Karo") ||
    label.includes("Trefl") ||
    label.includes("Pik")
  ) {
    return 5;
  }

  if (cardHighToLow.includes(label)) {
    return 1;
  }

  if (label.includes(" ")) {
    const parts = label.split(" ");

    const isStraight =
      parts.length === 5 &&
      parts.every((value) => cardLowToHigh.includes(value));

    if (isStraight) return 5;

    if (parts.length === 2) {
      const first = getRepeatedValue(parts[0]);
      const second = getRepeatedValue(parts[1]);
      return first.count + second.count;
    }
  }

  const repeated = getRepeatedValue(label);

  if (repeated.count >= 2) {
    return repeated.count;
  }

  return 1;
}

function isOptionPossibleByCards(option, liveCardsCount) {
  return getMinCardsNeededForLabel(option.label) <= liveCardsCount;
}

function getOptionRank(option) {
  return Math.floor(option.power / 10000);
}



function getOwnCardsForBot(botIndex) {
  return bots[botIndex - 1] || [];
}

function getLabelValues(label) {
  return label?.match(/A|K|Q|J|10|9|8|7|6/g) || [];
}

function getOwnSupportForLabel(label, ownCards) {
  if (!label) return 0;

  const labelValues = getLabelValues(label);
  const ownValues = ownCards.map(getCardValue);

  if (labelValues.length === 0) {
    return 0;
  }

  let support = 0;
  const used = [];

  labelValues.forEach((value) => {
    const foundIndex = ownValues.findIndex(
      (ownValue, index) => ownValue === value && !used.includes(index)
    );

    if (foundIndex !== -1) {
      support++;
      used.push(foundIndex);
    }
  });

  return support / labelValues.length;
}


function updatePlayerStats(playerIndex, updater) {
  setPlayerStats((prev) =>
    prev.map((stats, index) =>
      index === playerIndex ? updater(stats) : stats
    )
  );
}

function recordBid(playerIndex, bid, previousBidPower) {
  const raiseSize = bid.power - previousBidPower;

  updatePlayerStats(playerIndex, (stats) => ({
    ...stats,
    bids: stats.bids + 1,
    highBids: stats.highBids + (bid.power >= 50000 ? 1 : 0),
    lowRaises: stats.lowRaises + (raiseSize > 0 && raiseSize <= 12000 ? 1 : 0),
    totalBidPower: stats.totalBidPower + bid.power,
  }));
}

function recordCheck(playerIndex) {
  updatePlayerStats(playerIndex, (stats) => ({
    ...stats,
    checks: stats.checks + 1,
  }));
}

function recordBluff(playerIndex) {
  updatePlayerStats(playerIndex, (stats) => ({
    ...stats,
    bluffs: stats.bluffs + 1,
  }));
}

function recordTruth(playerIndex) {
  updatePlayerStats(playerIndex, (stats) => ({
    ...stats,
    truths: stats.truths + 1,
  }));
}

function getPlayerProfile(playerIndex) {
  const stats = playerStats[playerIndex];
  const checked = stats.bluffs + stats.truths;

  return {
    bluffRate: checked > 0 ? stats.bluffs / checked : 0,
    truthRate: checked > 0 ? stats.truths / checked : 0,
    highBidRate: stats.bids > 0 ? stats.highBids / stats.bids : 0,
    lowRaiseRate: stats.bids > 0 ? stats.lowRaises / stats.bids : 0,
    checkRate:
      stats.bids + stats.checks > 0
        ? stats.checks / (stats.bids + stats.checks)
        : 0,
  };
}







function getSmartCheckChance({
  botIndex,
  lastBidLabel,
  lastBidDeclarerIndex,
  bidPower,
  totalCardsOnTable,
  countsSnapshot,
}) {
  if (!lastBidLabel || lastBidDeclarerIndex === null) return 0;

  const personality = botPersonalities[botIndex];
  const liveCards = getLiveTableCards(countsSnapshot);
  const ownCards = getOwnCardsForBot(botIndex);
  const declarerProfile = getPlayerProfile(lastBidDeclarerIndex);

  const isActuallyTrue = checkDeclaration(lastBidLabel, liveCards);
  const ownSupport = getOwnSupportForLabel(lastBidLabel, ownCards);
  const minNeeded = getMinCardsNeededForLabel(lastBidLabel);

  let chance = personality.baseCheckChance;

  // Jeżeli układ jest niemożliwy przez liczbę kart, sprawdzaj prawie zawsze.
  if (minNeeded > liveCards.length) {
    return 0.95;
  }

  // Bot trochę "wie" z własnych kart i historii, ale niech nie będzie perfekcyjny.
  if (isActuallyTrue) {
    chance -= 0.18;
  } else {
    chance += 0.28;
  }

  // Jeśli deklarujący często blefował, bot bardziej podejrzewa.
  chance += declarerProfile.bluffRate * 0.35;

  // Jeśli deklarujący często wysoko podbijał, bot jest czujniejszy.
  chance += declarerProfile.highBidRate * 0.18;

  // Jeśli bot ma kartę pasującą do deklaracji, mniej chętnie sprawdza.
  chance -= ownSupport * 0.22;

  // Im wyższy układ, tym większa chęć sprawdzania.
  if (bidPower >= 30000) chance += 0.08;
  if (bidPower >= 50000) chance += 0.12;
  if (bidPower >= 70000) chance += 0.16;

  // Im więcej kart gra, tym więcej układów jest realnych.
  if (totalCardsOnTable >= 10) chance -= 0.06;
  if (totalCardsOnTable >= 14) chance -= 0.06;
  if (totalCardsOnTable >= 18) chance -= 0.04;

  // Cwaniak mocniej poluje na blefiarzy.
  if (personality.label === "Cwaniak") {
    chance += declarerProfile.bluffRate * 0.15;
  }

  // Ostrożny częściej sprawdza, chaos ma większy szum.
  if (personality.label === "Ostrożny") chance += 0.04;
  if (personality.label === "Chaos") chance += (Math.random() - 0.5) * 0.18;

  return clamp(chance, 0.03, 0.92);
}

function chooseSmartBid({
  botIndex,
  possibleOptions,
  bidPower,
  totalCardsOnTable,
  countsSnapshot,
}) {
  if (possibleOptions.length === 0) return null;

  const personality = botPersonalities[botIndex];
  const ownCards = getOwnCardsForBot(botIndex);
  const ownValues = ownCards.map(getCardValue);

  const liveCards = getLiveTableCards(countsSnapshot);
  const liveCardsCount = liveCards.length;

  function getOptionValues(option) {
    return option.label.match(/A|K|Q|J|10|9|8|7|6/g) || [];
  }

  function getOptionRankLocal(option) {
    return Math.floor(option.power / 10000);
  }

  function ownSupportCount(option) {
    const values = getOptionValues(option);
    const used = [];
    let support = 0;

    values.forEach((value) => {
      const foundIndex = ownValues.findIndex(
        (ownValue, index) => ownValue === value && !used.includes(index)
      );

      if (foundIndex !== -1) {
        support++;
        used.push(foundIndex);
      }
    });

    return support;
  }

  function ownSupportRatio(option) {
    const values = getOptionValues(option);
    if (values.length === 0) return 0;
    return ownSupportCount(option) / values.length;
  }

  function isHighCardOption(option) {
    return cardHighToLow.includes(option.label);
  }

  function isPairOption(option) {
    const repeated = getRepeatedValue(option.label);
    return repeated.count === 2 && !option.label.includes(" ");
  }

  function isThreeOption(option) {
    const repeated = getRepeatedValue(option.label);
    return repeated.count === 3 && !option.label.includes(" ");
  }

  function isTwoPairsOption(option) {
    if (!option.label.includes(" ")) return false;
    const parts = option.label.split(" ");
    if (parts.length !== 2) return false;

    const first = getRepeatedValue(parts[0]);
    const second = getRepeatedValue(parts[1]);

    return first.count === 2 && second.count === 2;
  }

  function isStraightOption(option) {
    const parts = option.label.split(" ");
    return (
      parts.length === 5 &&
      parts.every((value) => cardLowToHigh.includes(value))
    );
  }

  function isFullOrHigher(option) {
    return getOptionRankLocal(option) >= 5;
  }

  function isOptionReasonableNow(option) {
    const rank = getOptionRankLocal(option);
    const minNeeded = getMinCardsNeededForLabel(option.label);
    const support = ownSupportCount(option);
    const isTrueOnLiveTable = checkDeclaration(option.label, liveCards);

    if (minNeeded > liveCardsCount) return false;

    // 5-6 kart na stole: żadnych fulli/kolorów/karet/pokerów.
    // Trójka tylko jeśli bot ma przynajmniej jedną kartę tej wartości
    // albo układ realnie istnieje na stole.
    if (liveCardsCount <= 6) {
      if (isFullOrHigher(option)) return false;
      if (isStraightOption(option)) return false;
      if (isTwoPairsOption(option)) return false;

      if (isThreeOption(option)) {
        return support >= 1 && isTrueOnLiveTable;
      }

      if (isPairOption(option)) {
        return support >= 1 || isTrueOnLiveTable;
      }

      if (isHighCardOption(option)) {
        return support >= 1 || rank === 0;
      }

      return false;
    }

    // 7-8 kart: można pary, dwie pary, czasem trójkę.
    // Dalej bez fulli.
    if (liveCardsCount <= 8) {
      if (isFullOrHigher(option)) return false;
      if (isStraightOption(option) && !isTrueOnLiveTable && support < 2) return false;
      if (isThreeOption(option) && !isTrueOnLiveTable && support < 1) return false;
      return true;
    }

    // 9-11 kart: strity i trójki ok, full tylko jeśli realny na stole.
    if (liveCardsCount <= 11) {
      if (getOptionRankLocal(option) >= 6) return false;
      if (getOptionRankLocal(option) === 5 && !isTrueOnLiveTable) return false;
      return true;
    }

    // 12-15 kart: full może być blefem, ale kolor+ raczej tylko jak realny/wsparcie.
    if (liveCardsCount <= 15) {
      if (getOptionRankLocal(option) >= 7 && !isTrueOnLiveTable) return false;
      return true;
    }

    return true;
  }

  const legalOptions = possibleOptions.filter(isOptionReasonableNow);

  if (legalOptions.length === 0) {
    return null;
  }

  // Start/mało kart: jeżeli bot może podać swoją kartę, robi to.
  if (liveCardsCount <= 6) {
    const ownValueOption = legalOptions.find((option) =>
      ownValues.includes(option.label)
    );

    if (ownValueOption) {
      return ownValueOption;
    }
  }

  const analysisLimit = Math.min(
    legalOptions.length,
    personality.raiseRange + 5
  );

  const candidates = legalOptions.slice(0, analysisLimit);

  let bestOption = candidates[0];
  let bestScore = -9999;

  candidates.forEach((option, index) => {
    const rank = getOptionRankLocal(option);
    const supportRatio = ownSupportRatio(option);
    const supportCount = ownSupportCount(option);
    const isTrueOnLiveTable = checkDeclaration(option.label, liveCards);

    let score = 0;

    // Najważniejsze: bot gra to, co ma albo co realnie jest na stole.
    score += supportRatio * 5.0;
    if (supportCount > 0) score += 1.2;
    if (isTrueOnLiveTable) score += 2.6;

    // Naturalność przebicia.
    score -= index * 0.35;

    // Mocna kara za wysokie układy bez wsparcia.
    if (!isTrueOnLiveTable && supportCount === 0 && rank >= 2) score -= 2.0;
    if (!isTrueOnLiveTable && supportCount === 0 && rank >= 3) score -= 3.0;
    if (!isTrueOnLiveTable && rank >= 5) score -= 4.0;

    // Przy 5-6 kartach mocno premiuj proste deklaracje.
    if (liveCardsCount <= 6) {
      if (isHighCardOption(option)) score += 3.0;
      if (isPairOption(option)) score += 1.4;
      if (isThreeOption(option)) score -= 5.0;
    }

    // Osobowości, ale tylko jako korekta.
    if (personality.label === "Ostrożny") {
      score -= index * 0.16;
      score -= rank * 0.12;
    }

    if (personality.label === "Agresywny") {
      score += index * 0.05;
      score += supportRatio * 0.5;
    }

    if (personality.label === "Chaos") {
      score += Math.random() * 0.55;
    }

    if (personality.label === "Cwaniak") {
      score += supportRatio * 0.8;
      if (isTrueOnLiveTable) score += 0.8;
      score -= index * 0.08;
    }

    score += Math.random() * 0.08;

    if (score > bestScore) {
      bestScore = score;
      bestOption = option;
    }
  });

  return bestOption;
}

function renderCard(card, localIndex = 0, globalIndex = 0) {
  let suitClass = "cardBlack";

  if (card.includes("♥")) suitClass = "cardRed";
  if (card.includes("♦")) suitClass = "cardBlue";
  if (card.includes("♣")) suitClass = "cardGreen";
  if (card.includes("♠")) suitClass = "cardBlack";

  const isHighlighted = highlightedCardIndexes.includes(globalIndex);

  let resultClass = "";

  if (cardsWereChecked) {
    resultClass = isHighlighted ? "highlightedCard" : "dimmedCard";
  }

  return (
    <span
      key={`${card}-${globalIndex}`}
      className={`gameCard ${suitClass} ${resultClass}`}
      style={{
        transform: `translateX(${localIndex * -10}px) rotate(${(localIndex - 1) * 3}deg)`,
        zIndex: localIndex + 1,
      }}
    >
      {card}
    </span>
  );
}

function renderCards(cardsArray, globalStartIndex = 0) {
  return (
    <div className="cardsStack">
      {cardsArray.map((card, index) =>
        renderCard(card, index, globalStartIndex + index)
      )}
    </div>
  );
}


function startGame() {
  const randomStarter = Math.floor(Math.random() * players.length);
  const initialCounts = [1, 1, 1, 1, 1];

  setRoundOverlayStarter(players[randomStarter]);
  setNextStarterIndex(randomStarter);
  setCurrentPlayerIndex(randomStarter);
  setCurrentTurn(players[randomStarter]);

  setRoundResult("");
  setCardCounts(initialCounts);

  const dealt = dealCardsForCounts(initialCounts);

  setPlayerCard(dealt.player);
  setBots(dealt.bots);

  setMessage(`Zaczyna: ${players[randomStarter]}.`);
  setDeclaredCard("");

  setShowBidModal(false);
  setSelectedHandType(null);
  setCurrentBidPower(-1);
  setPendingBid(null);
  setSelectedAction(null);

  setHistory([]);
  setChecking(false);
  setShowAllCards(false);
  setHighlightedCardIndexes([]);
setCardsWereChecked(false);
  setScreen("game");
  setRoundFinished(false);

  setGameFinished(false);
setFinalResults([]);

  setRoundOverlay(true);

  setTimeout(() => {
    setRoundOverlay(false);

    setEliminatedPlayers([]);

    setPlayerStats(
  players.map(() => ({
    bids: 0,
    checks: 0,
    bluffs: 0,
    truths: 0,
    highBids: 0,
    lowRaises: 0,
    totalBidPower: 0,
  }))
);

    if (randomStarter !== 0) {
      botMove(randomStarter, -1, "", null, initialCounts);
    }
  }, 1800);
}

function finishGame(finalCounts, eliminatedOrder = eliminatedPlayers) {
  const aliveIndexes = finalCounts
    .map((count, index) => (count < 5 ? index : null))
    .filter((index) => index !== null);

  const winnerIndex = aliveIndexes[0];

  const finalRankingIndexes = [
    winnerIndex,
    ...eliminatedOrder.slice().reverse(),
  ];

  const results = finalRankingIndexes.map((index, place) => ({
    name: players[index],
    cards: finalCounts[index],
    place: place + 1,
  }));

  setFinalResults(results);
  setGameFinished(true);
  setRoundFinished(true);
}

function endGameToMenu() {
  setGameFinished(false);
  setFinalResults([]);
  setScreen("menu");
}

  function addHistory(text) {
  setHistory((prev) => [text, ...prev]);
}

  function chooseBid(option) {
    setPendingBid({
      ...option,
      handName: selectedHandType.name,
    });

    setSelectedAction("bid");
    setMessage(`Wybrano: ${option.label}. Kliknij „Zakończ turę”, żeby zatwierdzić.`);
    setSelectedHandType(null);
    setShowBidModal(false);
  }

function addPenaltyCard(playerIndex, baseCounts = cardCounts) {
  const currentCount = baseCounts[playerIndex];
  const newCount = Math.min(currentCount + 1, 5);

  const updatedCounts = baseCounts.map((count, index) =>
    index === playerIndex ? newCount : count
  );

  setCardCounts(updatedCounts);

let newEliminatedPlayers = eliminatedPlayers;

if (newCount >= 5 && currentCount < 5) {
  addHistory(`${players[playerIndex]} odpada z gry!`);

  newEliminatedPlayers = [...eliminatedPlayers, playerIndex];
  setEliminatedPlayers(newEliminatedPlayers);
  } else if (currentCount < 5) {
    addHistory(`${players[playerIndex]} dostaje kartę karną`);
  }

  const alive = updatedCounts.filter((c) => c < 5).length;

  if (alive === 1) {
  const winnerIndex = updatedCounts.findIndex((c) => c < 5);
  addHistory(`${players[winnerIndex]} WYGRYWA CAŁĄ GRĘ!`);
  setMessage(`${players[winnerIndex]} wygrywa całą grę!`);
  finishGame(updatedCounts, newEliminatedPlayers);
}

  return updatedCounts;
}

function getNextAlivePlayerIndex(fromIndex, counts) {
  const aliveIndexes = getAliveIndexes(counts);

  if (aliveIndexes.length <= 1) {
    return -1;
  }

  let nextIndex = (fromIndex + 1) % players.length;
  let safety = 0;

  while (counts[nextIndex] >= 5 && safety < players.length) {
    nextIndex = (nextIndex + 1) % players.length;
    safety++;
  }

  if (safety >= players.length) {
    return -1;
  }

  return nextIndex;
}

function scheduleNewRound(preferredStarterIndex, updatedCounts) {
  const aliveIndexes = getAliveIndexes(updatedCounts);

  if (aliveIndexes.length <= 1) {
    return;
  }

  const starter = getStarterIndex(preferredStarterIndex, updatedCounts);

  if (starter === -1) return;

  let seconds = 5;

  setMessage(`Nowa runda za ${seconds}s...`);

  const countdown = setInterval(() => {
    seconds--;

    if (seconds > 0) {
      setMessage(`Nowa runda za ${seconds}s...`);
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(countdown);

    setRoundOverlayStarter(players[starter]);
    setRoundOverlay(true);

    setTimeout(() => {
      dealNewRound(starter, updatedCounts);
      setRoundOverlay(false);
    }, 1800);
  }, 5000);
}

function handleCheck(
  checkerName = currentTurn,
  checkedDeclaration = declaredCard,
  checkerIndex = currentPlayerIndex,
  declarerIndex = lastDeclarerIndex,
  countsSnapshot = cardCounts
) {
  if (!checkedDeclaration) {
    setMessage("Nie ma jeszcze deklaracji do sprawdzenia.");
    return;
  }

  if (checking || showAllCards) {
    return;
  }

  addHistory(`${checkerName}: Sprawdzam`);
  recordCheck(checkerIndex);
  setRoundResult("");
  setChecking(true);

  setTimeout(() => {
    const allCards = getLiveTableCards(countsSnapshot);
const isBluff = !checkDeclaration(checkedDeclaration, allCards);

if (!isBluff) {
  setHighlightedCardIndexes(
  getMatchingCardIndexesForDeclaration(checkedDeclaration, allCards)
);
} else {
  setHighlightedCardIndexes([]);
}

setCardsWereChecked(true);

    setChecking(false);
    setShowAllCards(true);

    let loserIndex;
    let winnerIndex;

    if (isBluff) {
      loserIndex = declarerIndex;
      winnerIndex = checkerIndex;

      setRoundResult("BLEF! Deklarujący przegrywa rundę.");
      setMessage(`BLEF! Deklaracja ${checkedDeclaration} była fałszywa.`);
      addHistory(`Wynik: BLEF — ${players[checkerIndex]} wygrał sprawdzenie`);

      recordBluff(declarerIndex);
    } else {
      loserIndex = checkerIndex;
      winnerIndex = declarerIndex;

      setRoundResult("PRAWDA! Sprawdzający przegrywa rundę.");
      setMessage(`PRAWDA! Deklaracja ${checkedDeclaration} była poprawna.`);
      addHistory(`Wynik: PRAWDA — ${players[checkerIndex]} przegrał sprawdzenie`);

      recordTruth(declarerIndex);
    }

    const updatedCounts = addPenaltyCard(loserIndex, countsSnapshot);

    setRoundFinished(true);

    const alive = updatedCounts.filter((c) => c < 5).length;

    if (alive > 1) {
      const starterIndex =
        updatedCounts[loserIndex] < 5 ? loserIndex : winnerIndex;

      scheduleNewRound(starterIndex, updatedCounts);
    }
  }, 2200);
}

function botMove(
  botIndex,
  bidPower,
  lastBidLabel,
  lastBidDeclarerIndex,
  countsSnapshot = cardCounts
) {
  const aliveIndexes = getAliveIndexes(countsSnapshot);

  if (aliveIndexes.length <= 1) return;

  if (countsSnapshot[botIndex] >= 5) {
    const nextIndex = getNextAlivePlayerIndex(botIndex, countsSnapshot);

    if (nextIndex === -1) return;

    if (nextIndex === 0) {
      setCurrentPlayerIndex(0);
      setCurrentTurn("Ty");
      setMessage("Twoja tura.");
    } else {
      botMove(nextIndex, bidPower, lastBidLabel, lastBidDeclarerIndex, countsSnapshot);
    }

    return;
  }

  setTimeout(() => {
    const botName = players[botIndex];
    const personality = botPersonalities[botIndex];
    const totalCardsOnTable = getTotalCardsOnTable(countsSnapshot);

    const allOptions = getAllBidOptions(totalCardsOnTable);
    const possibleOptions = allOptions.filter(
      (option) => option.power > bidPower
    );

    const checkChance = getSmartCheckChance({
  botIndex,
  lastBidLabel,
  lastBidDeclarerIndex,
  bidPower,
  totalCardsOnTable,
  countsSnapshot,
});

    const shouldCheck =
      lastBidLabel &&
      (Math.random() < checkChance || possibleOptions.length === 0);

    if (shouldCheck) {
      setMessage(`${botName} (${personality.label}) sprawdza.`);
      handleCheck(
        botName,
        lastBidLabel,
        botIndex,
        lastBidDeclarerIndex,
        countsSnapshot
      );
      return;
    }

    const finalOption = chooseSmartBid({
  botIndex,
  possibleOptions,
  bidPower,
  totalCardsOnTable,
  countsSnapshot,
});

    if (!finalOption) {
      setMessage(`${botName} nie ma czym przebić. Sprawdza.`);
      handleCheck(
        botName,
        lastBidLabel,
        botIndex,
        lastBidDeclarerIndex,
        countsSnapshot
      );
      return;
    }

    addHistory(`${botName} (${personality.label}): ${finalOption.label}`);
    recordBid(botIndex, finalOption, bidPower);

    setDeclaredCard(finalOption.label);
    setCurrentBidPower(finalOption.power);
    setLastDeclarerIndex(botIndex);
    setMessage(`${botName} (${personality.label}) deklaruje: ${finalOption.label}`);

    const nextIndex = getNextAlivePlayerIndex(botIndex, countsSnapshot);

    if (nextIndex === -1) return;

    setCurrentPlayerIndex(nextIndex);
    setCurrentTurn(players[nextIndex]);

    if (nextIndex !== 0) {
      botMove(
        nextIndex,
        finalOption.power,
        finalOption.label,
        botIndex,
        countsSnapshot
      );
    }
  }, 1200);
}

  function endTurn() {
    if (cardCounts[0] >= 5) {
  setMessage("Odpadłeś z gry.");
  return;
}
    if (!selectedAction) {
      setMessage("Najpierw wybierz akcję: Podbij albo Sprawdzam.");
      return;
    }

    if (selectedAction === "bid") {
      if (!pendingBid) {
        setMessage("Najpierw wybierz deklarację przez „Podbij”.");
        return;
      }

      addHistory(`Ty: ${pendingBid.label}`);
      recordBid(0, pendingBid, currentBidPower);
      setDeclaredCard(pendingBid.label);
      setCurrentBidPower(pendingBid.power);
      setLastDeclarerIndex(0);
      setMessage(`Zatwierdzono: ${pendingBid.label}. Teraz ruch Bot 1.`);
setPendingBid(null);
setSelectedAction(null);

const nextIndex = getNextAlivePlayerIndex(0, cardCounts);

if (nextIndex === -1) return;

setCurrentPlayerIndex(nextIndex);
setCurrentTurn(players[nextIndex]);

if (nextIndex !== 0) {
  botMove(nextIndex, pendingBid.power, pendingBid.label, 0, cardCounts);
}

return;
    }

    if (selectedAction === "check") {
      setSelectedAction(null);
      handleCheck("Ty", declaredCard, 0, lastDeclarerIndex, cardCounts);
    }
  }

  function resetChoices() {
  setSelectedAction(null);
  setPendingBid(null);
  setMessage("Wybory wyzerowane.");
}

function dealNewRound(forcedStarterIndex = nextStarterIndex, countsOverride = cardCounts) {
  const aliveIndexes = getAliveIndexes(countsOverride);

  if (aliveIndexes.length <= 1) {
    return;
  }
  setCardCounts(countsOverride);

  const dealt = dealCardsForCounts(countsOverride);

  setPlayerCard(dealt.player);
  setBots(dealt.bots);

  let starter = forcedStarterIndex ?? aliveIndexes[0];

  if (countsOverride[starter] >= 5) {
    starter = aliveIndexes[0];
  }

  setCurrentPlayerIndex(starter);
  setCurrentTurn(players[starter]);

  setDeclaredCard("");
  setCurrentBidPower(-1);
  setPendingBid(null);
  setSelectedAction(null);

  setShowBidModal(false);
  setSelectedHandType(null);

  setChecking(false);
  setShowAllCards(false);
  setHighlightedCardIndexes([]);
setCardsWereChecked(false);
  setRoundResult("");
  setRoundFinished(false);

  setMessage(`Nowa runda. Zaczyna: ${players[starter]}.`);
  addHistory("— Nowa runda —");

  if (starter !== 0) {
    setTimeout(() => {
      botMove(starter, -1, "", null, countsOverride);
    }, 500);
  }
}

  return (
    <div className="app">

      {message.includes("Nowa runda za") && (
  <div className="roundTimer">
    ⏳ {message}
  </div>
)}
      {screen === "menu" && (
        <div className="menu">
          <h1>BLEF GAME</h1>
          <p>5 graczy. Jedna karta. Blef albo prawda.</p>
          <button onClick={startGame}>Graj</button>
        </div>
      )}

      {screen === "game" && (
        <div className="table">
          
          <div className="historyPanel">
            <h3>Historia</h3>
            {history.length === 0 ? (
              <p>Brak ruchów</p>
            ) : (
              history.map((item, index) => (
                <div key={index} className="historyItem">
                  {item}
                </div>
              ))
            )}
          </div>
          <div className={`bot top ${currentPlayerIndex === 2 ? "activeTurn" : ""}`}>
  <div className="botName">Bot 2<br /><span>Agresywny</span></div>
  <div className="backCard">{showAllCards ? renderCards(bots[1], playerCard.length + bots[0].length) : `🂠 x${cardCounts[2]}`}</div>
</div>

          <div className="middleRow">
            <div className={`bot left ${currentPlayerIndex === 1 ? "activeTurn" : ""}`}>
  <div className="botName">Bot 1<br /><span>Ostrożny</span></div>
  <div className="backCard">{showAllCards ? renderCards(bots[0], playerCard.length) : `🂠 x${cardCounts[1]}`}</div>
</div>

            <div className="centerTable">
              <div>
                <h3>STÓŁ</h3>
                <p>{message}</p>
                <p>Tura: {currentTurn}</p>
                <p>Deklaracja: {declaredCard || "brak"}</p>
                <p>Wybrane: {pendingBid?.label || selectedAction || "brak"}</p>
                {roundResult && <p className="roundResult">{roundResult}</p>}
              </div>
            </div>

           <div className={`bot right ${currentPlayerIndex === 4 ? "activeTurn" : ""}`}>
  <div className="botName">Bot 4<br /><span>Cwaniak</span></div>
  <div className="backCard">{showAllCards ? renderCards(bots[3], playerCard.length + bots[0].length + bots[1].length + bots[2].length) : `🂠 x${cardCounts[4]}`}</div>
</div>
          </div>

          <div className={`bot top2 ${currentPlayerIndex === 3 ? "activeTurn" : ""}`}>
  <div className="botName">Bot 3<br /><span>Chaos</span></div>
  <div className="backCard">{showAllCards ? renderCards(bots[2], playerCard.length + bots[0].length + bots[1].length) : `🂠 x${cardCounts[3]}`}</div>
</div>

          <div className={`you ${currentPlayerIndex === 0 ? "activeTurnPlayer" : ""}`}>
            <p>Twoja karta</p>
            <p>Karty: {cardCounts[0]}</p>
            <div className="playerCards">
  {renderCards(playerCard, 0)}
</div>
            
            <div className="buttons">
              <button
  className={selectedAction === "bid" ? "selectedAction" : ""}
  disabled={currentPlayerIndex !== 0 || roundFinished || checking || showAllCards}
  onClick={() => setShowBidModal(true)}
>
  Podbij
</button>

              <button
  className={selectedAction === "check" ? "selectedAction" : ""}
  disabled={
    currentPlayerIndex !== 0 ||
    roundFinished ||
    checking ||
    showAllCards ||
    !declaredCard
  }
  onClick={() => {
    setSelectedAction("check");
    setPendingBid(null);
    setMessage("Wybrano: Sprawdzam. Kliknij „Zakończ turę”, żeby zatwierdzić.");
  }}
>
  Sprawdzam
</button>

              <button
  className="endTurn"
  disabled={currentPlayerIndex !== 0 || roundFinished || checking || showAllCards}
  onClick={endTurn}
>
  Zakończ turę
</button>
              
              <button className="resetBtn" onClick={resetChoices}>
                Wyzeruj wybory
              </button>
            </div>
          </div>

          <div className="bottomMenuButtons">
  <button className="back" onClick={() => setScreen("menu")}>
    Powrót
  </button>

  <button
  className="finishGameBtn"
  onClick={() => {
    const aliveIndexes = getAliveIndexes(cardCounts);
    const notEliminatedYet = aliveIndexes
      .filter((index) => !eliminatedPlayers.includes(index))
      .sort((a, b) => cardCounts[a] - cardCounts[b]);

    const manualOrder = [
      ...eliminatedPlayers,
      ...notEliminatedYet.slice(1).reverse(),
    ];

    finishGame(cardCounts, manualOrder);
  }}
>
  Zakończ grę
</button>
</div>

{gameFinished && (
  <div className="summaryOverlay">
    <div className="summaryPanel">
      <h2>Koniec gry</h2>

      {finalResults.length > 0 && (
        <div className="winnerBox">
          🏆 Wygrał: {finalResults[0].name}
          <span>Zostało kart: {finalResults[0].cards}</span>
        </div>
      )}

      <div className="resultsList">
        {finalResults.map((result, index) => (
          <div
            key={result.name}
            className={`resultRow ${index === 0 ? "winnerRow" : ""}`}
          >
            <span>{index + 1}. miejsce</span>
            <strong>{result.name}</strong>
            <em>{result.cards} kart</em>
          </div>
        ))}
      </div>

      <div className="summaryButtons">
        <button onClick={startGame}>Nowa gra</button>
        <button className="finishGameBtn" onClick={endGameToMenu}>
          Zakończ grę
        </button>
      </div>
    </div>
  </div>
)}

          {showBidModal && (
  <div className="bidSheetOverlay">
    <div className="bidSheet">
      <div className="bidHeader">
        <h2>PODBIJ</h2>
        <p>Aktualna deklaracja: <strong>{declaredCard || "brak"}</strong></p>
        <span>Musisz przebić wyżej</span>
      </div>

      {!selectedHandType ? (
        <div className="bidTypeGrid">
          {getCurrentHandTypes(getTotalCardsOnTable(cardCounts)).map((type) => {
            const totalCardsOnTable = getTotalCardsOnTable(cardCounts);
            const options = generateBidOptions(type, totalCardsOnTable);
            const availableOptions = options.filter(
              (option) => option.power > currentBidPower
            );

            const disabled = availableOptions.length === 0;
            const selected = pendingBid?.handName === type.name;

            return (
              <button
                key={type.name}
                className={[
                  "bidTypeCard",
                  disabled ? "disabled" : "",
                  selected ? "selected" : "",
                ].join(" ")}
                disabled={disabled}
                onClick={() => setSelectedHandType(type)}
              >
                <span>{type.name}</span>
                <small>
                  {disabled
                    ? "niedostępne"
                    : `od ${availableOptions[0].label}`}
                </small>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="bidSubHeader">
            <h3>{selectedHandType.name}</h3>
            <button
              className="smallBackBtn"
              onClick={() => setSelectedHandType(null)}
            >
              Wróć do układów
            </button>
          </div>

          <div
            className={`bidOptionsGrid ${
  selectedHandType.name === "Dwie pary" ||
  selectedHandType.name === "Full" ||
  selectedHandType.name === "Poker"
    ? `dense cards-${getActiveCardValues(
        getTotalCardsOnTable(cardCounts)
      ).length}`
    : ""
}`}
          >
            {generateBidOptions(
              selectedHandType,
              getTotalCardsOnTable(cardCounts)
            ).map((option) => {
              const disabled = option.power <= currentBidPower;
              const selected = pendingBid?.label === option.label;

              return (
                <button
                  key={option.label}
                  className={[
                    "bidOptionChip",
                    disabled ? "disabled" : "",
                    selected ? "selected" : "",
                  ].join(" ")}
                  disabled={disabled}
                  onClick={() => chooseBid(option)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="bidSelectedBox">
        <span>Wybrano:</span>
        <strong>{pendingBid?.label || "brak"}</strong>
      </div>

      <div className="bidFooter">
        <button
          className="bidBackBtn"
          onClick={() => {
            setSelectedHandType(null);
            setShowBidModal(false);
          }}
        >
          Wróć
        </button>

        <button
          className="bidConfirmBtn"
          disabled={!pendingBid}
          onClick={() => {
            setShowBidModal(false);
            setMessage(
              `Wybrano: ${pendingBid.label}. Kliknij „Zakończ turę”, żeby zatwierdzić.`
            );
          }}
        >
          Zatwierdź
        </button>
      </div>
    </div>
  </div>
)}

          {checking && <div className="checkOverlay">SPRAWDZAM!</div>}

          {roundOverlay && (
  <div className="checkOverlay">
    NOWA RUNDA<br />
    Zaczyna: {roundOverlayStarter}
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default App;