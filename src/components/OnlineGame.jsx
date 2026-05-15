import { useState } from "react";
import { getAllBidOptions } from "../game/bids";
import { makeOnlineBid } from "../online/rooms";

function OnlineGame({ room, nick }) {
    const [selectedBidPower, setSelectedBidPower] = useState("");
const [message, setMessage] = useState("");
  const gameState = room.gameState;

  if (!gameState) {
    return (
      <div className="onlineRoomScreen">
        <h1>Ładowanie gry...</h1>
      </div>
    );
  }

  const players = gameState.players || [];
  const currentPlayer = players[gameState.currentPlayerIndex];
  const myPlayer = players.find((player) => player.name === nick);
  const isMyTurn = myPlayer?.id === gameState.currentPlayerIndex;

  const totalCardsOnTable = players.reduce(
  (sum, player) => sum + (player.eliminated ? 0 : player.cardsCount),
  0
);

const bidOptions = getAllBidOptions(totalCardsOnTable).filter(
  (option) => option.power > gameState.currentBidPower
);

async function handleOnlineBid() {
  if (!selectedBidPower) {
    setMessage("Najpierw wybierz deklarację.");
    return;
  }

  const selectedBid = bidOptions.find(
    (option) => String(option.power) === selectedBidPower
  );

  if (!selectedBid) {
    setMessage("Nieprawidłowa deklaracja.");
    return;
  }

  try {
    await makeOnlineBid(room.id, nick, selectedBid);
    setSelectedBidPower("");
    setMessage("");
  } catch (error) {
    setMessage(error.message || "Nie udało się wykonać ruchu.");
  }
}

return (
  <div className="table">
    <div className="historyPanel">
      <h3>Historia</h3>

      {gameState.history?.length ? (
        gameState.history.map((item, index) => (
          <div key={index} className="historyItem">
            {item}
          </div>
        ))
      ) : (
        <p>Brak ruchów</p>
      )}
    </div>

    <div className="centerTable">
      <div>
        <h3>STÓŁ ONLINE</h3>
        <p>Runda: {gameState.round}</p>
        <p>Tura: {currentPlayer?.name || "brak"}</p>
        <p>Deklaracja: {gameState.declaredCard || "brak"}</p>
        <p>Ty: {myPlayer?.name}</p>
      </div>
    </div>

    <div className="onlinePlayersRow">
      {players.map((player) => (
        <div
          key={player.id}
          className={`onlinePlayerPanel ${
            player.id === gameState.currentPlayerIndex ? "activeTurn" : ""
          }`}
        >
          <strong>{player.name}</strong>
          <span>{player.cardsCount} kart</span>
          {player.name === nick ? <em>Ty</em> : <em>🂠</em>}
        </div>
      ))}
    </div>

    <div className="you activeTurnPlayer">
  <p>Twoja karta</p>
  <p>Karty: {myPlayer?.cardsCount || 0}</p>

  <div className="playerCards">
    {myPlayer?.hand?.length ? (
      myPlayer.hand.map((card) => (
        <span key={card} className="gameCard">
          {card}
        </span>
      ))
    ) : (
      <span>Brak kart</span>
    )}
  </div>

  <div className="buttons">
    <select
  disabled={!isMyTurn}
  value={selectedBidPower}
  onChange={(e) => setSelectedBidPower(e.target.value)}
>
  <option value="">Wybierz deklarację</option>

  {bidOptions.map((option) => (
    <option key={`${option.label}-${option.power}`} value={option.power}>
      {option.label}
    </option>
  ))}
</select>

<button disabled={!isMyTurn || !selectedBidPower} onClick={handleOnlineBid}>
  Podbij
</button>

{message && <p>{message}</p>}


    <button disabled={!isMyTurn || !gameState.declaredCard}>Sprawdzam</button>
    <button disabled={!isMyTurn} className="endTurn">
      Zakończ turę
    </button>
  </div>
</div>
  </div>
);
}

export default OnlineGame;