// The name of the game!
let blackJackGames = [];

let gameNum = 0;

let currentGame;

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
const startButton = document.querySelector(".start-form button");

// For the players and their sections:
const playerCountInput = document.querySelector(".players-count");
const deckCountInput = document.querySelector(".decks-count");
const gameScreen = document.querySelector(".game-screen");

// For the display of all winners:
const winDisplay = document.querySelector(".winners");

// The display for the house:
const houseDisplay = document.querySelector(".house-display");

// The game class. Represents game meta-data such as the amount of players, the amount decks in play, and
// has methods to create those objects.
class Game {
  constructor() {

    // The current list of players
    // The first player is always the house.
    this.players = [new Player(),];

    // The current list of decks
    this.decks = [];

    // An array of all player bets.
    this.bets = [];

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
      // setting the index for the dealer.
      this.players[0].index = 0;
      houseDisplay.innerHTML += this.players[0].createTile();
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
      this.players[0].playerElement = houseDisplay;
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
      this.players.forEach((player) => {
        player.calculateScore();
      });
      houseDisplay.style.display = "block";
      // houseDisplay.innerHTML = this.players[0].createTile();
      this.currentTurn++;
      this.enablePlayer();
    }

    // Should be faster to explicitly choose the node instead of relying on querySelector.
    // 1 : player card
    // 3,0: 'Hit' button.
    // 3,1: 'Stay' button.
    this.enablePlayer = () => {
      this.players[this.currentTurn].playerElement.childNodes[3][0].removeAttribute("disabled");
      this.players[this.currentTurn].playerElement.childNodes[3][1].removeAttribute("disabled");
    }

    this.disablePlayer = () => {
      this.players[this.currentTurn].playerElement.childNodes[3][0].setAttribute("disabled", "disabled");
      this.players[this.currentTurn].playerElement.childNodes[3][1].setAttribute("disabled", "disabled");
    }

    this.checkScore = () => {
      let scoreArray = this.players.map( (player) => {
        player.calculateScore();
        return player.score;
      });
      return scoreArray;    
    }

    this.checkGame = () => {
      this.disablePlayer();
      if(this.players.length === this.currentTurn + 1) {
        console.log("Game ending! It's the house's turn!");
        currentGame.houseTurn();
        this.calculateWinners();
      } else {
        this.currentTurn++;
        this.enablePlayer();
      }
    }

    // A function to calculate the house's score.
    // The house is always player[0].
    // The house will continually draw cards until it has more than 18 or busts.
    this.houseTurn = () => {
      while(currentGame.players[0].score < 18 && currentGame.players[0].score !== "bust") {
        currentGame.dealCards(0,0,1);
        currentGame.players[0].calculateScore();
      }
    }

    this.calculateWinners = () => {
      let scoreArray = this.checkScore();

      // let winner = "";
      let winners = [];
      let dealer = this.players[0].score;
      for(let i = 0; i < scoreArray.length; i++) {
        if(scoreArray[i] !== "bust") {
          if(scoreArray[i] > dealer || dealer === "bust") {
            winners.push(i);
          }
        }
      }

      let winString = `${winners.length === 0 ? 'The house wins!' : `player(s) ${winners} win!!!`}`;
      winDisplay.textContent = winString;
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

    this.sumScoreArray = (playingCard, arr) => {
      let temp;
      if(playingCard.value === "A") {

        temp = arr.map((val) => {
          return [val + 1, val + 11];
        })
        .reduce((a,b) => {
          return a.concat(b);
        });

      } else {
        temp = arr.map((val) => {
          return val += valueMap[playingCard.value] || playingCard.value;
        });
      }
      return temp;      
    }

    this.calculateScore = () => {

      // Reset the score to 0...
      let allScores = [0,];
      let scoreArray;
      this.hand.forEach((card) => {
          allScores = this.sumScoreArray(card, allScores);

          scoreArray = allScores.filter((value) => {
            return value <= 21;
          })
          .sort((a,b) => {
            return b - a;
          });

      });

      this.score = scoreArray[0] || "bust";

      if(this.score > 21 || this.score === "bust") {
        // If they bust, immediately check and end their turn.
        this.score = "bust";
        this.hasTakenTurn = true;
        currentGame.disablePlayer();
      }
      this.updateDOMScore();
    }

    this.createTile = () => {
      // create a tile for a player with their id, and then return it.
      let tile = `<section class="${this.index !== 0 ? 'player-board' : 'house-board'}" data-playerId='${this.index}'>
                      <section class="player-info" data-playerId='${this.index}'>
                        <section class="player-cards">
                        </section>
                        <section class="player-score">
                        </section>
                      </section>
                      ${this.index !== 0 ? `<form>
                      <button type="button" onclick="hit(event)" data-playerId="${this.index}" disabled >Hit</button>
                      <button type="button" onclick="stay(event)" data-playerId="${this.index}" disabled >Stay</button>
                    </form>` : ``}
                  </section>`;
      return tile;
    }


    // Desperately needs a refactor.
    this.updateDOMScore = () => {
      // Grab the appropriate DOM element, and then update it with the current score.
      if(this.index > 0) {
        let cardDisplay = this.hand.map((card) => {
          return([card.suite, card.value]);
        });
        let tempHTML = "<section class='playerCards'>";
        cardDisplay.forEach((card) => {
          tempHTML += `<section class="cardImage">
                        ${card[1]} of ${card[0] === "D" ? 'Diamonds' : card[0] === "C" ? 'Clubs' : card[0] === "S" ? 'Spades' : "Hearts"}
                      </section>`;
        });
        tempHTML += `</section>`;
        this.playerElement.children[0].children[0].innerHTML = tempHTML;
        this.playerElement.children[0].children[1].textContent = `Score: ${this.score}`;
      } else if(this.index === 0) {
          let cardDisplay = this.hand.map((card) => {
            return([card.suite, card.value]);
          });
          let tempHTML = "<section class='playerCards'>";
          cardDisplay.forEach((card, index) => {
            if(index === 0 && (currentGame.players.length !== currentGame.currentTurn + 1)) {
              tempHTML += `<section class="cardImage hidden">
              hidden
              </section>`
            } else {
              tempHTML += `<section class="cardImage">
              ${card[1]} of ${card[0] === "D" ? 'Diamonds' : card[0] === "C" ? 'Clubs' : card[0] === "S" ? 'Spades' : "Hearts"}
            </section>`;
            }
          });
          tempHTML += `</section>`;
          this.playerElement.children[0].children[0].innerHTML = tempHTML;
      }

    }
  }
}

// The game logic starts here:
const beginGame = () => {
  resetGame();
  // Change button
  startButton.textContent = "Play Again?";
  let players = Number(playerCountInput.value);
  let decks = Number(deckCountInput.value);
  // create game
  let blackJack = new Game();
  blackJackGames.push(blackJack);
  gameNum = blackJackGames.length - 1;
  // start game
  currentGame = blackJackGames[gameNum];
  // currentGame.startGame(players, decks);
  currentGame.startGame(players, decks);
  //TODO: move form out of the way

}

const hit = (event) => {
  playerInd = event.target.getAttribute('data-playerId');
  if(!currentGame.players[playerInd].hasTakenTurn) {

    // "hit" a particular player.
    currentGame.players[playerInd].hit(currentGame);
    // If we are on the last player, AND that player has gone bust, run the stay function.
    if(currentGame.players.length === currentGame.currentTurn + 1 && currentGame.players[currentGame.currentTurn].score === "bust") {
      stay(event);
    } else if(currentGame.players[currentGame.currentTurn].score === "bust"){
      currentGame.currentTurn++;
      currentGame.enablePlayer();
      console.log("That player bust! Moving on to the next one!");
    }
  } else {
    console.log("Player has already finished their turn!");
      stay(event);
  }
}

const stay = (event) => {
  playerInd = event.target.getAttribute('data-playerId');
  currentGame.players[playerInd].hasTakenTurn = true;
  currentGame.checkGame();
}

// A function that resets the game screen
const resetGame = () => {
  gameScreen.innerHTML = "";
  winDisplay.textContent = "";
}

const main = () => {

}

document.addEventListener('DOMContentLoaded', main);
