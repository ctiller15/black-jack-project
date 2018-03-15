const suiteCards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];

const valueMap = {
  'J': 10,
  'Q': 10,
  'K': 10,
  'A': 11
};

// The game class. Represents game meta-data such as the amount of players, the amount decks in play, and
// has methods to create those objects.
class Game {
  constructor() {

    // The current list of players
    // The first player is always the house.
    this.players = [new Player(),];

    // The current list of decks
    this.decks = [];

    // This function creates a bunch of new decks.
    this.createDecks = (count) => {
      for(var i = 0; i < count; i++) {
        this.decks.push(new Deck());
      }
    }

    this.createPlayers = (count) => {
      for(var i = 0; i < count; i++) {
        let newPlayer = new Player();
        newPlayer.index = i + 1;
        this.players.push(newPlayer);
      }
    }

    // Shuffles every single deck.
    this.shuffleDecks = () => {
      for(let i = 0 ; i < this.decks.length; i++) {
        this.decks[i].shuffleDeck();
      }
    }

    // Chooses a player and deals cards to them from a given deck.
    this.dealCards = (playerNum, deckNum, count) => {
      // console.log(this.players[playerNum], this.decks[deckNum]);
      let temp = this.decks[deckNum].dealCards(count);
      // console.log(temp);
      this.players[playerNum].hand = this.players[playerNum].hand.concat(temp);
      // console.log(this.players[playerNum].hand);
    }

    this.startGame = (playerCount, deckCount) => {
      this.createPlayers(playerCount);
      this.createDecks(deckCount);
      this.shuffleDecks();
      for(let i = 0; i < playerCount + 1; i++) {
        this.dealCards(i, 0, 2);
      }
    }

  }
}

// A deck class. Represents an individual deck of 52 cards.
class Deck {
  constructor() {

    // Creates each individual card object.
    this.generateCards = (suite) => {
      let cardArr = [];
      for(let i = 0; i < suiteCards.length; i++) {
        cardArr.push(new Card(suite, suiteCards[i]));
      }
      return cardArr;
    }

    // Takes all cards and creates a deck out of them.
    this.createDeck = () => {
      let tempArr = [];
      for(let suite in this.suites) {
        tempArr = tempArr.concat(this.suites[suite]);
      }
      return tempArr;
    }

    // Shuffles the current deck.
    // Uses the "Durstenfield shuffle".
    // Picks one random element, and swaps with the current element.
    // Then picks the next random element from the remainder.
    this.shuffleDeck = () => {
      for (let i = this.deck.length - 1; i > 0; i--) {
        // picking a random element.
        let j = Math.floor(Math.random() * (i + 1));
        // Swapping it with the current element.
        let temp = this.deck[i];
        this.deck[i] = this.deck[j];
        this.deck[j] = temp;
      }
    }

    // A function that deals cards.
    // 'num' is the amount of cards to be dealt.
    // Serves a dual purpose to both 'deal' cards and for when
    // A user wants to get 'hit' with new cards.
    this.dealCards = (num) => {
      let dealtCards = [];
      for(let i = 0; i < num; i++) {
        dealtCards.push(this.deck.pop());
      }
      return(dealtCards);
    }

    // All of the suites with their respective cards.
    this.suites = {
      hearts: this.generateCards('H'),
      clubs: this.generateCards('C'),
      spaces: this.generateCards('S'),
      diamonds: this.generateCards('D'),
    };

    // the current deck.
    this.deck = this.createDeck();

  }
}

class Card {
  constructor(suite, value) {
    this.suite = suite;
    this.value = value;
  }
}

class Player {
  constructor() {

    this.hand = [];

    this.score = 0;

    this.hit = (gameObj) => {
      gameObj.dealCards(this.index, 0, 1);
      this.calculateScore();
    }

    this.calculateScore = () => {
      // Reset the score to 0...
      this.score = 0;
      this.hand.forEach((card) => {
        this.score += valueMap[card.value] || card.value;
        // console.log(card.value, this.score);
      });
      if(this.score > 21) {
        this.score = "bust";
      }
    }
  }
}

// The house is always going to exist.
// const house = new Player();

let blackJack = new Game();
blackJack.startGame(2,1);


const main = () => {
  document.querySelector('h1').textContent += '?';
}

document.addEventListener('DOMContentLoaded', main);
