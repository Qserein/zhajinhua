const suits = ['♣', '♥', '♦', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck() {
  const deck = suits.flatMap(suit => values.map(value => ({ suit, value })));
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function dealCards(deck, playerCount) {
  const hands = Array(playerCount).fill().map(() => []);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < playerCount; j++) {
      hands[j].push(deck.pop());
    }
  }
  return hands;
}

export function compareHands(hand1, hand2) {
  const value1 = getHandValue(hand1);
  const value2 = getHandValue(hand2);
  
  if (value1.type !== value2.type) {
    return value1.type - value2.type;
  }
  
  // 如果牌型相同，比较值最高的
  return getHandSum(hand1) - getHandSum(hand2);
}

function getHandSum(hand) {
  const nums = hand.map(card => values.indexOf(card.value));
  const sumValue = nums.reduce((sum, num, index) => {
    return sum + num * Math.pow(10, nums.length - index - 1);
  }, 0);
  return sumValue;
}

function getHandValue(hand) {
  // 按牌面值排序
  hand.sort((a, b) => compareCards(b, a));
  
  // 检查特殊牌型
  if (isBomb(hand)) return { type: 7, cards: hand };
  if (isStraightFlush(hand)) return { type: 6, cards: hand };
  if (isFlush(hand)) return { type: 5, cards: hand };
  if (isStraight(hand)) return { type: 4, cards: hand };
  if (isPair(hand)) return { type: 3, cards: hand };
  if (isSpecial235(hand)) return { type: 1, cards: hand };
  
  // 如果没有特殊牌型，返回最高牌
  return { type: 2, cards: hand };
}

function isBomb(hand) {
  return hand[0].value === hand[1].value && hand[1].value === hand[2].value;
}

function isStraightFlush(hand) {
  return isFlush(hand) && isStraight(hand);
}

function isFlush(hand) {
  return hand[0].suit === hand[1].suit && hand[1].suit === hand[2].suit;
}

function isStraight(hand) {
  const indices = hand.map(card => values.indexOf(card.value)).sort((a, b) => a - b);
  return (indices[2] - indices[0] === 2) || 
         (indices[0] === 0 && indices[1] === 1 && indices[2] === 12); // A-2-3 顺子
}

function isPair(hand) {
  return hand[0].value === hand[1].value || hand[1].value === hand[2].value || hand[0].value === hand[2].value;
}

function isSpecial235(hand) {
  const sortedValues = hand.map(card => card.value).sort();
  return sortedValues.join('') === '235' && !isFlush(hand);
}

function compareCards(card1, card2) {
  return values.indexOf(card1.value) - values.indexOf(card2.value);
}

export function determineWinner(players) {
  return players.reduce((winner, player) => {
    if (!winner || compareHands(player.handCards, winner.handCards) > 0) {
      return player;
    }
    return winner;
  }, null);
}

