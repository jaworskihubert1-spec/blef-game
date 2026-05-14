function RulesScreen({ onBack }) {
  return (
    <div className="rulesScreen">
      <h1>Zasady gry</h1>

      <p className="rulesIntro">
        Blefuj. Ryzykuj. Sprawdzaj innych.
        Ostatni gracz przy stole wygrywa.
      </p>

      <div className="rulesBox">
        <h3>🎴 Start rundy</h3>

        <p>
          Każdy aktywny gracz dostaje tyle kart,
          ile ma punktów karnych.
        </p>

        <p>
          Na początku wszyscy mają po 1 karcie.
        </p>
      </div>

      <div className="rulesBox">
  <h3>🃏 Deklaracje</h3>

  <p>
    Gracze po kolei deklarują układy kart:
    wysokie karty, pary, strity, fulla i więcej.
  </p>

  <p>
    Deklaracja dotyczy wszystkich kart
    rozdanych aktywnym graczom przy stole —
    nie tylko własnej ręki.
  </p>

  <p>
    Każda kolejna deklaracja musi być mocniejsza
    od poprzedniej.
  </p>

  <p>
    Możesz mówić prawdę...
    albo blefować.
  </p>
</div>

<div className="rulesBox">
  <h3>👀 Sprawdzam</h3>

  <p>
    Zamiast podbijać możesz powiedzieć:
    „Sprawdzam”.
  </p>

  <p>
    Wszystkie karty zostają odkryte
    i gra sprawdza,
    czy deklarowany układ naprawdę istnieje
    wśród wszystkich kart na stole.
  </p>

  <p>
    Jeśli deklaracja była fałszywa —
    karę dostaje blefujący.
  </p>

  <p>
    Jeśli deklaracja była prawdziwa —
    karę dostaje sprawdzający.
  </p>
</div>

      <div className="rulesBox">
        <h3>💀 Eliminacja</h3>

        <p>
          Po otrzymaniu 5 kart karnych
          odpadasz z gry.
        </p>

        <p>
          Wygrywa ostatni gracz,
          który pozostanie przy stole.
        </p>
      </div>

      <button className="back" onClick={onBack}>
        Powrót
      </button>
    </div>
  );
}

export default RulesScreen;