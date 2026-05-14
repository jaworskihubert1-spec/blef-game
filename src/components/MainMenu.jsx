function MainMenu({ onStartGame, onShowRules }) {
  return (
    <div className="menu">
      <h1>BLEF GAME</h1>
      <p>5 graczy. Jedna karta. Blef albo prawda.</p>

      <div className="menuButtons">
        <button onClick={onStartGame}>♠ Graj z botami</button>
        <button disabled>🌐 Online — wkrótce</button>
        <button onClick={onShowRules}>📖 Zasady</button>
        <button disabled>⚙ Ustawienia — wkrótce</button>
      </div>
    </div>
  );
}

export default MainMenu;