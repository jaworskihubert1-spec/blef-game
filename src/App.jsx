import { useRef, useState } from "react";
import "./App.css";

import { cardHighToLow, cardLowToHigh, suits } from "./data/cards";
import { botPersonalities } from "./data/bots";

import {
  cardPower,
  getCardValue,
  countValues,
  hasStraight,
  getRepeatedValue,
  getAliveIndexes,
  getStarterIndex,
  getTotalCardsOnTable,
  clamp,
} from "./game/helpers";

import {
  getCurrentHandTypes,
  getActiveCardValues,
  generateBidOptions,
  getAllBidOptions,
} from "./game/bids";

import { dealCardsForCounts } from "./game/deck";

import {
  checkDeclaration,
  getMatchingCardIndexesForDeclaration,
} from "./game/rules";

import CardStack from "./components/CardStack";

import MainMenu from "./components/MainMenu";

import RulesScreen from "./components/RulesScreen";

function App() {
  const [screen, setScreen] = useState("menu");
  const [history, setHistory] = useState([]);
  const [playerCard, setPlayerCard] = useState([]);
  const [bots, setBots] = useState([]);
  const playerCardRef = useRef([]);
const botsRef = useRef([]);
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

  const currentPlayerCard = playerCardRef.current;
  const currentBots = botsRef.current;

  if (counts[0] < 5) {
    liveCards.push(...currentPlayerCard);
  }

  currentBots.forEach((botCards, botArrayIndex) => {
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
  if (!label) return [];

  const onlyCardsPart = label.split("(")[0].trim();

  return onlyCardsPart.match(/10|A|K|Q|J|9|8|7|6/g) || [];
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

  playerCardRef.current = dealt.player;
  botsRef.current = dealt.bots;

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

    const botIsStartingRound = !lastBidLabel || lastBidDeclarerIndex === null;

const shouldCheck =
  !botIsStartingRound &&
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
  if (botIsStartingRound) {
    const fallbackOption = possibleOptions[0];

    addHistory(`${botName} (${personality.label}): ${fallbackOption.label}`);
    recordBid(botIndex, fallbackOption, bidPower);

    setDeclaredCard(fallbackOption.label);
    setCurrentBidPower(fallbackOption.power);
    setLastDeclarerIndex(botIndex);
    setMessage(`${botName} (${personality.label}) deklaruje: ${fallbackOption.label}`);

    const nextIndex = getNextAlivePlayerIndex(botIndex, countsSnapshot);

    if (nextIndex === -1) return;

    setCurrentPlayerIndex(nextIndex);
    setCurrentTurn(players[nextIndex]);

    if (nextIndex !== 0) {
      botMove(
        nextIndex,
        fallbackOption.power,
        fallbackOption.label,
        botIndex,
        countsSnapshot
      );
    }

    return;
  }

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

  playerCardRef.current = dealt.player;
  botsRef.current = dealt.bots;

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
  <MainMenu
    onStartGame={startGame}
    onShowRules={() => setScreen("rules")}
  />
)}

{screen === "rules" && (
  <RulesScreen onBack={() => setScreen("menu")} />
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
  <div className="backCard">{showAllCards ? (
  <CardStack
    cardsArray={bots[1]}
    globalStartIndex={playerCard.length + bots[0].length}
    highlightedCardIndexes={highlightedCardIndexes}
    cardsWereChecked={cardsWereChecked}
  />
) : (
  `🂠 x${cardCounts[2]}`
)}</div>
</div>

          <div className="middleRow">
            <div className={`bot left ${currentPlayerIndex === 1 ? "activeTurn" : ""}`}>
  <div className="botName">Bot 1<br /><span>Ostrożny</span></div>
  <div className="backCard">{showAllCards ? (
  <CardStack
    cardsArray={bots[0]}
    globalStartIndex={playerCard.length}
    highlightedCardIndexes={highlightedCardIndexes}
    cardsWereChecked={cardsWereChecked}
  />
) : (
  `🂠 x${cardCounts[1]}`
)}</div>
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
  <div className="backCard">{showAllCards ? (
  <CardStack
    cardsArray={bots[3]}
    globalStartIndex={
      playerCard.length + bots[0].length + bots[1].length + bots[2].length
    }
    highlightedCardIndexes={highlightedCardIndexes}
    cardsWereChecked={cardsWereChecked}
  />
) : (
  `🂠 x${cardCounts[4]}`
)}</div>
</div>
          </div>

          <div className={`bot top2 ${currentPlayerIndex === 3 ? "activeTurn" : ""}`}>
  <div className="botName">Bot 3<br /><span>Chaos</span></div>
  <div className="backCard">{showAllCards ? (
  <CardStack
    cardsArray={bots[2]}
    globalStartIndex={playerCard.length + bots[0].length + bots[1].length}
    highlightedCardIndexes={highlightedCardIndexes}
    cardsWereChecked={cardsWereChecked}
  />
) : (
  `🂠 x${cardCounts[3]}`
)}</div>
</div>

          <div className={`you ${currentPlayerIndex === 0 ? "activeTurnPlayer" : ""}`}>
            <p>Twoja karta</p>
            <p>Karty: {cardCounts[0]}</p>
            <div className="playerCards">
  <CardStack
  cardsArray={playerCard}
  globalStartIndex={0}
  highlightedCardIndexes={highlightedCardIndexes}
  cardsWereChecked={cardsWereChecked}
/>
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


