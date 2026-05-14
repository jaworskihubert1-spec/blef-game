function RulesScreen({ onBack }) {
  return (
    <div className="rulesScreen">
      <h1>Zasady gry</h1>

      <p>
        Celem gry jest przetrwać jak najdłużej. Gracze po kolei deklarują coraz
        mocniejsze układy kart albo sprawdzają poprzednią deklarację.
      </p>

      <div className="rulesBox">
        <h3>Przebieg rundy</h3>
        <p>Każdy aktywny gracz dostaje tyle kart, ile ma punktów karnych.</p>
        <p>Pierwszy gracz składa deklarację, np. A, para 10, strit albo full.</p>
        <p>Następny gracz musi przebić deklarację albo powiedzieć „Sprawdzam”.</p>
      </div>

      <div className="rulesBox">
        <h3>Sprawdzanie</h3>
        <p>
          Jeśli deklaracja była fałszywa, karę dostaje deklarujący. Jeśli była
          prawdziwa, karę dostaje sprawdzający.
        </p>
      </div>

      <div className="rulesBox">
        <h3>Odpadanie</h3>
        <p>Gracz odpada po osiągnięciu 5 kart karnych.</p>
        <p>Wygrywa ostatni gracz, który zostanie w grze.</p>
      </div>

      <button className="back" onClick={onBack}>
        Powrót
      </button>
    </div>
  );
}

export default RulesScreen;