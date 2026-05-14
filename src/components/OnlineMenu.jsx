import { useEffect, useState } from "react";

import {
  createRoom,
  deleteRoom,
  joinRoom,
  listenToRooms,
} from "../online/rooms";

function OnlineMenu({ onBack }) {
  const [nick, setNick] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = listenToRooms((roomsFromDb) => {
      setRooms(roomsFromDb);
    });

    return () => unsubscribe();
  }, []);

  async function handleCreateRoom() {
    if (!nick.trim()) {
      setMessage("Najpierw wpisz nick.");
      return;
    }

    setMessage("Tworzę pokój...");

    try {
      const newRoomId = await createRoom(nick.trim());

      setCurrentRoomId(newRoomId);
      setMessage(`Pokój utworzony. Kod: ${newRoomId}`);
    } catch (error) {
      setMessage(error.message || "Nie udało się utworzyć pokoju.");
    }
  }

  async function handleJoinRoom(roomId) {
    if (!nick.trim()) {
      setMessage("Najpierw wpisz nick.");
      return;
    }

    setMessage("Dołączam do pokoju...");

    try {
      await joinRoom(roomId, nick.trim());

      setCurrentRoomId(roomId);
      setMessage("Dołączono do pokoju.");
    } catch (error) {
      setMessage(error.message || "Nie udało się dołączyć do pokoju.");
    }
  }

  async function handleBack() {
    if (currentRoomId) {
      const currentRoom = rooms.find((room) => room.id === currentRoomId);
      const isHost = currentRoom?.host === nick.trim();

      if (isHost) {
        await deleteRoom(currentRoomId);
      }
    }

    onBack();
  }

  return (
    <div className="rulesScreen">
      <h1>Gra online</h1>

      <div className="rulesBox">
        <h3>Twój nick</h3>

        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="Wpisz nick"
        />
      </div>

      <div className="rulesBox">
        <h3>Utwórz pokój</h3>

        <button onClick={handleCreateRoom}>♠ Utwórz pokój</button>

        {currentRoomId && (
          <p>
            Twój pokój: <strong>{currentRoomId}</strong>
          </p>
        )}
      </div>

      <div className="rulesBox">
        <h3>Aktywne pokoje</h3>

        {rooms.length === 0 ? (
          <p>Brak aktywnych pokoi.</p>
        ) : (
          <div className="roomList">
            {rooms.map((room) => {
              const playersCount = room.players?.length || 0;
              const maxPlayers = room.maxPlayers || 5;
              const isFull = playersCount >= maxPlayers;
              const isCurrentRoom = room.id === currentRoomId;

              return (
                <div key={room.id} className="roomItem">
                  <div>
                    <strong>Pokój: {room.host}</strong>
                    <p>
                      Gracze: {playersCount}/{maxPlayers}
                    </p>
                    <small>Kod: {room.id}</small>
                  </div>

                  <button
                    disabled={isFull || isCurrentRoom}
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    {isCurrentRoom ? "Jesteś w pokoju" : isFull ? "Pełny" : "Dołącz"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {message && <p>{message}</p>}

      <button className="back" onClick={handleBack}>
        Powrót
      </button>
    </div>
  );
}

export default OnlineMenu;