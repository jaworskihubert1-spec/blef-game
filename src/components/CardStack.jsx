function CardStack({
  cardsArray,
  globalStartIndex = 0,
  highlightedCardIndexes = [],
  cardsWereChecked = false,
}) {
  function renderCard(card, localIndex = 0, globalIndex = 0) {
    let suitClass = "cardBlack";

    if (card.includes("♥")) suitClass = "cardRed";
    if (card.includes("♦")) suitClass = "cardBlue";
    if (card.includes("♣")) suitClass = "cardGreen";
    if (card.includes("♠")) suitClass = "cardBlack";

    const isHighlighted = highlightedCardIndexes.includes(globalIndex);

    let resultClass = "";

    if (cardsWereChecked) {
      resultClass = isHighlighted ? "highlightedCard" : "dimmedCard";
    }

    return (
      <span
        key={`${card}-${globalIndex}`}
        className={`gameCard ${suitClass} ${resultClass}`}
        style={{
          transform: `translateX(${localIndex * -10}px) rotate(${
            (localIndex - 1) * 3
          }deg)`,
          zIndex: localIndex + 1,
        }}
      >
        {card}
      </span>
    );
  }

  return (
    <div className="cardsStack">
      {cardsArray.map((card, index) =>
        renderCard(card, index, globalStartIndex + index)
      )}
    </div>
  );
}

export default CardStack;