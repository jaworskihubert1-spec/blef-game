function OnlineGame({ room, nick }) {
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
    <button disabled={!isMyTurn}>Podbij</button>
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