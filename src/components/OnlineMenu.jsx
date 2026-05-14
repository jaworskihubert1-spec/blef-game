import { useEffect, useState } from "react";

import {
  createRoom,
  deleteRoom,
  joinRoom,
  listenToRooms,
} from "../online/rooms";

function OnlineMenu({ onBack }) {
  const [nick, setNick] = useState("");
  const [nickConfirmed, setNickConfirmed] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = listenToRooms((roomsFromDb) => {
      setRooms(roomsFromDb);
    });

    return () => unsubscribe();
  }, []);

  function handleConfirmNick() {
    const cleanNick = nick.trim();

    if (!cleanNick) {
      setMessage("Najpierw wpisz nick.");
      return;
    }

    const nickTaken = rooms.some((room) =>
      room.players?.some(
        (player) => player.name.toLowerCase() === cleanNick.toLowerCase()
      )
    );

    if (nickTaken) {
      setMessage("Ten nick jest już używany w aktywnym pokoju.");
      return;
    }

    setNickConfirmed(true);
    setMessage("");
  }

  async function handleCreateRoom() {
    try {
      setMessage("Tworzę pokój...");

      const newRoomId = await createRoom(nick.trim());

      setCurrentRoomId(newRoomId);
      setMessage("Pokój utworzony.");
    } catch (error) {
      setMessage(error.message || "Nie udało się utworzyć pokoju.");
    }
  }

  async function handleJoinRoom(roomId) {
    try {
      setMessage("Dołączam do pokoju...");

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

  if (!nickConfirmed) {
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

          <button onClick={handleConfirmNick}>Zatwierdź</button>

          {message && <p>{message}</p>}
        </div>

        <button className="back" onClick={onBack}>
          Powrót
        </button>
      </div>
    );
  }

  return (
    <div className="rulesScreen">
      <h1>Lobby online</h1>

      <p>
        Grasz jako: <strong>{nick}</strong>
      </p>

      <div className="rulesBox">
        <h3>Utwórz pokój</h3>

        <button onClick={handleCreateRoom} disabled={!!currentRoomId}>
          ♠ Utwórz pokój
        </button>

        {currentRoomId && (
          <p>
            Jesteś w pokoju: <strong>{currentRoomId}</strong>
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
                    disabled={isFull || isCurrentRoom || !!currentRoomId}
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