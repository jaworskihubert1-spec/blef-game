import { useState } from "react";
import { createRoom, deleteRoom } from "../online/rooms";

function OnlineMenu({ onBack }) {
  const [nick, setNick] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");

  async function handleCreateRoom() {
    if (!nick.trim()) {
      setMessage("Najpierw wpisz nick.");
      return;
    }

    setMessage("Tworzę pokój...");

    const newRoomId = await createRoom(nick.trim());

    setRoomId(newRoomId);
    setMessage(`Pokój utworzony. Kod: ${newRoomId}`);
  }

  async function handleBack() {
  if (roomId) {
    await deleteRoom(roomId);
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
        <h3>Pokój</h3>
        <button onClick={handleCreateRoom}>Utwórz pokój</button>

        {roomId && (
          <p>
            Kod pokoju: <strong>{roomId}</strong>
          </p>
        )}

        {message && <p>{message}</p>}
      </div>

      <button className="back" onClick={handleBack}>
  Powrót
</button>
    </div>
  );
}



export default OnlineMenu;