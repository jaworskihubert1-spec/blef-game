import { useState } from "react";
import {
  getAllBidOptions,
  getCurrentHandTypes,
  generateBidOptions,
  getActiveCardValues,
} from "../game/bids";
import { makeOnlineBid, makeOnlineCheck } from "../online/rooms";



function OnlineGame({ room, nick }) {
const [message, setMessage] = useState("");
const [showFullHistory, setShowFullHistory] = useState(false);
const [showBidModal, setShowBidModal] = useState(false);
const [selectedHandType, setSelectedHandType] = useState(null);
const [pendingBid, setPendingBid] = useState(null);

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

function chooseOnlineBid(option, handName) {
  setPendingBid({
    ...option,
    handName,
  });

  
  setSelectedHandType(null);
  setShowBidModal(false);
}

async function handleOnlineBid() {
  if (!pendingBid) {
    setMessage("Najpierw wybierz deklarację.");
    return;
  }

  try {
    await makeOnlineBid(room.id, nick, pendingBid);

    setPendingBid(null);
    
    setShowBidModal(false);
    setMessage("");
  } catch (error) {
    setMessage(error.message || "Nie udało się wykonać ruchu.");
  }
}

async function handleOnlineCheck() {
  try {
    await makeOnlineCheck(room.id, nick);
    
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

        <button
  disabled={!isMyTurn}
  onClick={() => setShowBidModal(true)}
>
  {pendingBid ? `Podbij: ${pendingBid.label}` : "Podbij"}
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

{showBidModal && (
  <div className="bidSheetOverlay">
    <div className="bidSheet">
      <div className="bidHeader">
        <h2>PODBIJ</h2>
        <p>
          Aktualna deklaracja:{" "}
          <strong>{gameState.declaredCard || "brak"}</strong>
        </p>
        <span>Musisz przebić wyżej</span>
      </div>

      {!selectedHandType ? (
        <div className="bidTypeGrid">
          {getCurrentHandTypes(totalCardsOnTable).map((type) => {
            const options = generateBidOptions(type, totalCardsOnTable);
            const availableOptions = options.filter(
              (option) => option.power > gameState.currentBidPower
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
                  {disabled ? "niedostępne" : `od ${availableOptions[0].label}`}
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
                ? `dense cards-${getActiveCardValues(totalCardsOnTable).length}`
                : ""
            }`}
          >
            {generateBidOptions(selectedHandType, totalCardsOnTable).map(
              (option) => {
                const disabled = option.power <= gameState.currentBidPower;
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
                    onClick={() => chooseOnlineBid(option, selectedHandType.name)}
                  >
                    {option.label}
                  </button>
                );
              }
            )}
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
          onClick={handleOnlineBid}
        >
          Zatwierdź
        </button>
      </div>
    </div>
  </div>
)}

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