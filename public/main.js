const suiteCards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];

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
        this.players.push(new Player());
      }
    }

    // Shuffles every single deck.
    this.shuffleDecks = () => {
      for(let i = 0 ; i < this.decks.length; i++) {
        this.decks[i].shuffleDeck();
      }
    }

    this.dealCards = (playerNum, deckNum, count) => {
      console.log(this.players[playerNum], this.decks[deckNum]);
      let temp = this.decks[deckNum].dealCards(2);
      console.log(temp);
      this.players[playerNum].hand = this.players[playerNum].hand.concat(temp);
      console.log(this.players[playerNum].hand);
    }

  }
}

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
  }
}

// The house is always going to exist.
// const house = new Player();

// let testDeck = new Deck();

// console.log(testDeck.deck);

let blackJack = new Game();

blackJack.createDecks(1);

blackJack.dealCards(0, 0, 2);

console.log(blackJack.players[0]);

const main = () => {
  document.querySelector('h1').textContent += '?';
}

document.addEventListener('DOMContentLoaded', main);
