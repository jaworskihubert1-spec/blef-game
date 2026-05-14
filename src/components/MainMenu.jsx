function MainMenu({ onStartGame }) {
  return (
    <div className="menu">
      <h1>BLEF GAME</h1>
      <p>5 graczy. Jedna karta. Blef albo prawda.</p>
      <button onClick={onStartGame}>Graj z botami</button>
    </div>
  );
}

export default MainMenu;