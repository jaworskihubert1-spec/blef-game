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

  return (
    <div className="onlineRoomScreen">
      <h1>Gra online</h1>

      <p>
        Runda: <strong>{gameState.round}</strong>
      </p>

      <p>
        Tura: <strong>{currentPlayer?.name || "brak"}</strong>
      </p>

      <p>
        Deklaracja: <strong>{gameState.declaredCard || "brak"}</strong>
      </p>

      <p>
        Ty grasz jako: <strong>{myPlayer?.name}</strong>
      </p>

      <div className="onlineTableSlots">
        {players.map((player) => (
          <div
            key={player.id}
            className={`onlineSlot ${
              player.id === gameState.currentPlayerIndex ? "taken" : ""
            }`}
          >
            <strong>{player.name}</strong>
            <span>{player.cardsCount} kart</span>
            {player.eliminated && <span>Odpadł</span>}
          </div>
        ))}
      </div>

      <div className="rulesBox">
        <h3>Historia</h3>

        {gameState.history?.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>

      <p>Tu zaraz podepniemy prawdziwe ruchy graczy online.</p>
    </div>
  );
}

export default OnlineGame;