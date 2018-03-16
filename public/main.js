// The name of the game!
let blackJackGames = [];

let gameNum = 0;

// Values used for calculations.

const suiteCards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];

const valueMap = {
  'J': 10,
  'Q': 10,
  'K': 10,
  'A': 11
};

// Elements used for DOM manipulation.

// For the home menu:
const introScreen = document.querySelector(".introduction-screen");

// For the players and their sections:
const playerCountInput = document.querySelector(".players-count");
const deckCountInput = document.querySelector(".decks-count");
const gameScreen = document.querySelector(".game-screen");

// The game class. Represents game meta-data such as the amount of players, the amount decks in play, and
// has methods to create those objects.
class Game {
  constructor() {

    // The current list of players
    // The first player is always the house.
    this.players = [new Player(),];

    // The current list of decks
    this.decks = [];

    // Recording the players' turns.
    this.currentTurn = 0;

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
        
        gameScreen.innerHTML += newPlayer.createTile();
      }
      // Grab all DOM elements.
      // Place them into their respective player objects.
      this.createDOMElements();
    }

    // Creates individual DOM elements, and places them in the individual player class.
    this.createDOMElements = () => {
      let domElements = document.querySelectorAll('.player-board');
      for(let i = 1; i <= domElements.length; i++) {
        this.players[i].playerElement = domElements[i - 1];
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
      let temp = this.decks[deckNum].dealCards(count);
      this.players[playerNum].hand = this.players[playerNum].hand.concat(temp);
    }

    this.startGame = (playerCount, deckCount) => {
      this.createPlayers(playerCount);
      this.createDecks(deckCount);
      this.shuffleDecks();
      for(let i = 0; i < playerCount + 1; i++) {
        this.dealCards(i, 0, 2);
      }
      this.currentTurn++;
      this.enablePlayer();
    }
    this.enablePlayer = () => {
      this.players[this.currentTurn].playerElement.childNodes[1][0].removeAttribute("disabled");
      this.players[this.currentTurn].playerElement.childNodes[1][1].removeAttribute("disabled");
    }

    this.disablePlayer = () => {
      this.players[this.currentTurn].playerElement.childNodes[1][0].setAttribute("disabled", "disabled");
      this.players[this.currentTurn].playerElement.childNodes[1][1].setAttribute("disabled", "disabled");
      console.log("disabling: " + this.currentTurn);
      // this.checkGame();
    }

    this.checkScore = () => {
      let scoreArray = this.players.map( (player) => {
        player.calculateScore();
        console.log(player.score);
        return player.score;
      });
      return scoreArray;    
    }

    this.checkGame = () => {
      this.disablePlayer();
      if(this.players.length === this.currentTurn + 1) {
        console.log("Game ending! It's the house's turn!");
        this.calculateWinners();
      } else {
        this.currentTurn++;
        this.enablePlayer();
      }
    }

    this.calculateWinners = () => {
      let scoreArray = this.checkScore();

      // let winner = "";
      let winners = [];
      let dealer = this.players[0].score;
      console.log(dealer);
      for(let i = 0; i < scoreArray.length; i++) {
        if(scoreArray[i] !== "bust") {
          if(scoreArray[i] > dealer) {
            winners.push(i);
          }
        }
      }
      // console.log(winners);

      let winString = `${winners.length === 0 ? 'The house' : `player(s) ${winners} win!!!`}`;

      console.log(winString);


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

    this.hasTakenTurn = false;

    this.isCurrentlyTurn = false;

    this.hit = (gameObj) => {
      if(this.hand.length < 5 && this.score !== "bust") {
        gameObj.dealCards(this.index, 0, 1);
      }
      this.calculateScore();
    }

    this.calculateScore = () => {
      // Reset the score to 0...
      this.score = 0;
      this.hand.forEach((card) => {
        this.score += valueMap[card.value] || card.value;
      });
      console.log(this.score);
      if(this.score > 21) {
        // If they bust, immediately check and end their turn.
        this.score = "bust";
        this.hasTakenTurn = true;
        blackJackGames[gameNum].disablePlayer();
        console.log(`on turn: ${blackJackGames[gameNum].currentTurn}`);
      }
      console.log("Ends here!");
    }

    this.createTile = () => {
      // create a tile for a player with their id, and then return it.
      let tile = `<section class="player-board" data-playerId='${this.index}'>
                      <form>
                      <button type="button" onclick="hit(event)" data-playerId="${this.index}" disabled >Hit</button>
                      <button type="button" onclick="stay(event)" data-playerId="${this.index}" disabled >Stay</button>
                    </form>
                  </section>`;
      return tile;
    }
  }
}

// The game logic starts here:
const beginGame = () => {
  resetGame();
  let players = Number(playerCountInput.value);
  let decks = Number(deckCountInput.value);
  console.log(`${players} player(s) and ${decks} deck(s)! Let's go!`);
  // create game
  let blackJack = new Game();
  blackJackGames.push(blackJack);
  gameNum = blackJackGames.length - 1;
  // start game
  blackJackGames[gameNum].startGame(players, decks);
  console.log(blackJackGames[gameNum]);
  //TODO: move form out of the way

}

const hit = (event) => {
  playerInd = event.target.getAttribute('data-playerId');
  if(!blackJackGames[gameNum].players[playerInd].hasTakenTurn) {

    // "hit" a particular player.
    blackJackGames[gameNum].players[playerInd].hit(blackJackGames[gameNum]);
    if(blackJackGames[0].players.length === blackJackGames[0].currentTurn + 1) {
      stay(event);
    } else if(blackJackGames[gameNum].players[blackJackGames[gameNum].currentTurn].score === "bust"){
      blackJackGames[gameNum].currentTurn++;
      blackJackGames[gameNum].enablePlayer();
      console.log("That player bust! Moving on to the next one!");
    }
  } else {
    console.log("Player has already finished their turn!");
      stay(event);
  }
}

const stay = (event) => {
  playerInd = event.target.getAttribute('data-playerId');

  blackJackGames[gameNum].players[playerInd].hasTakenTurn = true;
  blackJackGames[gameNum].checkGame();
}

// A function that resets the game
const resetGame = () => {
  gameScreen.innerHTML = "";
}

const main = () => {
  // document.querySelector('h1').textContent += '?';

}

document.addEventListener('DOMContentLoaded', main);
