import { useEffect, useState } from "react";
import { leaveRoom, listenToRoom, startRoomGame } from "../online/rooms";
import OnlineGame from "./OnlineGame";

function OnlineRoom({ roomId, nick, onLeave }) {
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = listenToRoom(roomId, (roomFromDb) => {
      setRoom(roomFromDb);
    });

    return () => unsubscribe();
  }, [roomId]);

 async function handleLeave() {
  await leaveRoom(roomId, nick);
  onLeave();
}



  if (!room) {
    return (
      <div className="rulesScreen">
        <h1>Pokój nie istnieje</h1>
        <button className="back" onClick={onLeave}>
          Powrót
        </button>
      </div>
    );
  }

  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 5;
  const slots = Array.from({ length: maxPlayers }, (_, index) => players[index] || null);
  const isHost = room.host === nick;

  async function handleStartGame() {
  if (!isHost) return;

  await startRoomGame(roomId);
}

if (room.status === "playing") {
  return <OnlineGame room={room} nick={nick} />;
}

  return (
    <div className="onlineRoomScreen">
      <h1>Pokój online</h1>

      <p>
        Host: <strong>{room.host}</strong>
      </p>

      <p>
        Gracze: {players.length}/{maxPlayers}
      </p>

      <div className="onlineTableSlots">
        {slots.map((player, index) => (
          <div
            key={index}
            className={`onlineSlot ${player ? "taken" : "empty"}`}
          >
            {player ? (
              <>
                <strong>{player.name}</strong>
                {player.name === room.host && <span>Host</span>}
              </>
            ) : (
              <span className="plusSlot">+</span>
            )}
          </div>
        ))}
      </div>

      {isHost ? (
        <button
          className="endTurn"
          disabled={players.length < 2}
          onClick={handleStartGame}
        >
          Start gry
        </button>
      ) : (
        <p>Czekasz, aż host rozpocznie grę.</p>
      )}

      {message && <p>{message}</p>}

      <button className="back" onClick={handleLeave}>
        Opuść pokój
      </button>
    </div>
  );
}

export default OnlineRoom;