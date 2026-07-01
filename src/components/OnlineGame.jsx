import { useState } from "react";
import { getAllBidOptions } from "../game/bids";
import { makeOnlineBid, makeOnlineCheck } from "../online/rooms";

const [showFullHistory, setShowFullHistory] = useState(false);

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

async function handleOnlineCheck() {
  try {
    await makeOnlineCheck(room.id, nick);
    setSelectedBidPower("");
    setMessage("");
  } catch (error) {
    setMessage(error.message || "Nie udało się sprawdzić.");
  }
}

if (gameState.phase === "finished") {
  return (
    <div className="onlineRoomScreen">
      <h1>Koniec gry</h1>

      <div className="winnerBox">
        🏆 Wygrał: {gameState.winnerName}
      </div>

      <div className="resultsList">
        {players.map((player) => (
          <div key={player.id} className="resultRow">
            <strong>{player.name}</strong>
            <em>{player.cardsCount} kart</em>
          </div>
        ))}
      </div>
    </div>
  );
}

return (
  <div className="onlineGameTable">
    <div className="onlineTopBar">
      <strong>BLEF ONLINE</strong>
      <span>Runda {gameState.round}</span>
    </div>

    <div className="onlinePlayersGrid">
      {players.map((player) => {
        const isCurrent = player.id === gameState.currentPlayerIndex;
        const isMe = player.name === nick;

        return (
          <div
            key={player.id}
            className={`onlineSeat ${isCurrent ? "currentSeat" : ""} ${
              isMe ? "mySeat" : ""
            }`}
          >
            <strong>{player.name}</strong>
            <span>{player.cardsCount} kart</span>
            <em>{isMe ? "Ty" : "🂠"}</em>
          </div>
        );
      })}
    </div>

    <div className="onlineCenterTable">
      <h3>STÓŁ</h3>
      <p>
        Tura: <strong>{currentPlayer?.name || "brak"}</strong>
      </p>
      <p>
        Deklaracja: <strong>{gameState.declaredCard || "brak"}</strong>
      </p>
    </div>

    <div className="onlineActionPanel">
      <div className="onlineHand">
        <p>Twoje karty</p>

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
      </div>

      <div className="onlineControls">
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

        <button
          disabled={!isMyTurn || !gameState.declaredCard}
          onClick={handleOnlineCheck}
        >
          Sprawdzam
        </button>
      </div>

      {message && <p className="onlineMessage">{message}</p>}
    </div>

    <div className="onlineHistory">
  <div className="onlineHistoryHeader">
    <h3>Historia</h3>

    <button
      className="historyOpenBtn"
      onClick={() => setShowFullHistory(true)}
    >
      ⛶
    </button>
  </div>

  <div className="onlineHistoryList">
    {gameState.history?.slice(0, 4).map((item, index) => (
      <div key={index} className="historyItem">
        {item}
      </div>
    ))}
  </div>
</div>

{showFullHistory && (
  <div className="historyModalOverlay">
    <div className="historyModal">
      <div className="historyModalHeader">
        <h2>Pełna historia</h2>

        <button onClick={() => setShowFullHistory(false)}>
          Zamknij
        </button>
      </div>

      <div className="historyModalList">
        {gameState.history?.map((item, index) => (
          <div key={index} className="historyModalItem">
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
)}
  </div>
);
}

export default OnlineGame;