actions = document.getElementById("actions");
dudoButton = document.getElementById("dudoButton");
calzaButton = document.getElementById("calzaButton");
validButton = document.getElementById("validButton");
upn1Button = document.getElementById("upn1");
downn1Button = document.getElementById("downn1");
dicePaco = document.getElementById("dicePaco");
dice2 = document.getElementById("dice2");
dice3 = document.getElementById("dice3");
dice4 = document.getElementById("dice4");
dice5 = document.getElementById("dice5");
dice6 = document.getElementById("dice6");
n1val = document.getElementById("n1value");
ready = document.getElementById("ready");
const loggeduser_id = document.getElementById("user_id").value;
let roomName = document.getElementById("game-name").innerHTML
// delete all the quote of the variable roomName
roomName = roomName.replace(/['"]+/g, '');



const gameSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/game/" + roomName + "/"
);

n1 = 1;
n2 = 0;
turn = 0;
turn1 = true;
palifico = false;

class Player {
  constructor(name, userid) {
    this.alreadyPalifico = false;
    this.name = name;
    this.userid = userid;
    this.dieList = [];
    this.numberOfDie = 5;
  }
  roll(n) {
    //clear the dieList
    this.dieList = [];

    let data = {
      'event': 'ROLL',
      'user': this.userid,
      'game_data': {
        'nb_dice': this.numberOfDie,
        'who': n,
      }
    };
    gameSocket.send(JSON.stringify(data));
  }
  loseDie() {
    let data = {
      'event': 'LOSE-DICE',
      'user': this.name,
      'game_data': {
        'nb_dice': this.numberOfDie
      }
    };
    gameSocket.send(JSON.stringify(data));
    this.numberOfDie--;
  }
  addDie() {
    if (this.numberOfDie < 5) {
      this.numberOfDie++;
    }
  }
  getDieList() {
    return this.dieList;
  }
  getName() {
    return this.name;
  }
  palifico() {
    if (this.alreadyPalifico == false){
        this.alreadyPalifico = true;
        return true;
    }
    else{
        return false;
    }
  }
}

eliminate = (p) => {
  //print eliminate player
  console.log(p.getName() + " a ??t?? ??limin?? :)");
  playersList.splice(p, 1);
};

countDice = (n) => {
  let count = 0;
  for (let i = 0; i < playersList.length; i++) {
    for (let k = 0; k < playersList[i].getDieList().length; k++) {
      if (playersList[i].getDieList()[k] == n) {
        count++;
      } else if (!palifico && playersList[i].getDieList()[k] == 1) {
        count++;
      }
    }
  }
  console.log("D??s compt??s : " + count);
  return count;
};

rollAll = () => {
  for (let i = 0; i < playersList.length; i++) {
    playersList[i].roll(i);
  }
  console.log("D??s lanc??s");
};

resetCall = (n) => {
  //reset all the values
  let data = {
    'event': 'RESET-CALL',
    'user': playersList[turn].userid,
    'game_data': {
      'winner': n,
      'nb_players': playersList.length-1
    }
  };
  gameSocket.send(JSON.stringify(data));
};

prev = () => {
  //print previous player
  if (turn == 0) {
    return playersList[playersList.length - 1];
  } else {
    return playersList[turn - 1];
  }
};

newTurn = () => {
  
  pacoTurn = false;
  numberTurn = false;
  console.log("Nouveau tour");
  //check if there is a looser
  if (playersList[turn].numberOfDie== 0) {
    eliminate(playersList[turn]);
  }
  //check if there is a winner
  if (playersList.length == 1) {
    console.log(playersList[0].getName() + " gan??... SHEEEEEEEEEEEESH !!!");
  } else {
    console.log(playersList[turn].getName() + ", ?? votre tour");
    console.log("Call actuel : " + n1 + " " + n2);
    console.log("Vos d??s : " + playersList[turn].getDieList());
    //check if the player is a palifico
    if (playersList[turn].getDieList().length == 1 && palifico == false) {
      palifico = playersList[turn].palifico();
      if (palifico) {
        console.log("Vous ??tes un palifico !");
      }
    }
  }
};

dudoButton.addEventListener("click", () => {
  if (!turn1) {
    console.log("Dudo");
    res = countDice(n2);
    palifico = false;
    if (res >= n1) {
      console.log(playersList[turn].getName() + " perd un d??! GROS CHEH!");
      playersList[turn].loseDie();
      resetCall(true);
    } else {
      console.log(prev().getName() + " perd un d??! GROS CHEH!");
      prev().loseDie();
      resetCall(false);
    }
  }
});

calzaButton.addEventListener("click", () => {
  if (!turn1) {
    console.log("Calza");
    res = countDice(n2);
    palifico = false;
    if (res == n1) {
      console.log(playersList[turn].getName() + " gagne un d?? quel BG wow !");
      playersList[turn].addDie();
      resetCall(true);
    } else {
      console.log(playersList[turn].getName() + " perd un d??! GROS CHEH!");
      playersList[turn].loseDie();
      resetCall(true);
    }
  }
});

validButton.addEventListener("click", () => {
  if (
    n1tmp > n1 ||
    n2tmp > n2 ||
    (n2 != 1 && n2tmp == 1 && n1tmp != 0 && n2tmp != 0)
  ) {
    turn1 = false;
    turn++;
    console.log("valid?? (turn++) : " + turn);
    let data = {
      'event': 'VALID',
      'game_data': {
        'nb_dice': n1tmp,
        'value_dice': n2tmp,
        'turn': turn+1,
        'nb_players': playersList.length-1
      },
      'user': playersList[turn].userid
      }
    gameSocket.send(JSON.stringify(data));
  }
});

upn1Button.addEventListener("click", () => {
  if (turn1) {
    n1tmp++;
    n1val.innerHTML = n1tmp;
  } else {
    if (palifico) {
      n1tmp++;
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
    } else {
      if (n2tmp == n2 || n2tmp == 1) {
        // on a le droit de changer qu'un seul chiffre
        n1tmp++;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    }
  }
});

downn1Button.addEventListener("click", () => {
  if (turn1 && n1tmp > 1) {
    n1tmp--;
    n1val.innerHTML = n1tmp;
  } else {
    if (palifico) {
      if (n1tmp > n1) {
        n1tmp--;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    } else {
      if (n2tmp == n2 || n2tmp == 1) {
        // on a le droit de changer qu'un seul chiffre
        if (pacoTurn == false) {
          if (n1tmp > 1 && n1tmp > n1) {
            n1tmp--;
            n1val.innerHTML = n1tmp;
            console.log("n1 : " + n1tmp);
          }
        } else {
          if (n1tmp > 1 && n1tmp > Math.ceil(n1 / 2)) {
            n1tmp--;
            n1val.innerHTML = n1tmp;
            console.log("n1 : " + n1tmp);
          }
        }
      }
    }
  }
});

dicePaco.addEventListener("click", () => {
  if (palifico) {
    if (n2 == 0) {
      n2tmp = 1;
      console.log("n2 : " + n2tmp);
    }
  } else {
    if (n2tmp != 1 && !turn1) {
      n2tmp = 1;
      console.log("n2 : paco");
      //n1tmp takes n1/2 round up
      n1tmp = Math.ceil(n1 / 2);
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
      pacoTurn = true;
    }
  }
});
dice2.addEventListener("click", () => {
  if (palifico) {
    if (n2 == 0) {
      n2tmp = 2;
      console.log("n2 : " + n2tmp);
    }
  } else {
    if (n2 == 1 && numberTurn == false) {
      n1tmp = n1 * 2 + 1;
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
      numberTurn = true;
    }
    if (n2 <= 2) {
      n2tmp = 2;
      console.log("n2 : 2");
      pacoTurn = false;
      if (numberTurn == false) {
        n1tmp = n1;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    }
  }
});
dice3.addEventListener("click", () => {
  if (palifico) {
    if (n2 == 0) {
      n2tmp = 3;
      console.log("n2 : " + n2tmp);
    }
  } else {
    if (n2 == 1 && numberTurn == false) {
      n1tmp = n1 * 2 + 1;
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
      numberTurn = true;
    }
    if (n2 <= 3) {
      n2tmp = 3;
      console.log("n2 : 3");
      pacoTurn = false;
      if (numberTurn == false) {
        n1tmp = n1;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    }
  }
});
dice4.addEventListener("click", () => {
  if (palifico) {
    if (n2 == 0) {
      n2tmp = 4;
      console.log("n2 : " + n2tmp);
    }
  } else {
    if (n2 == 1 && numberTurn == false) {
      n1tmp = n1 * 2 + 1;
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
      numberTurn = true;
    }
    if (n2 <= 4) {
      n2tmp = 4;
      console.log("n2 : 4");
      pacoTurn = false;
      if (numberTurn == false) {
        n1tmp = n1;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    }
  }
});
dice5.addEventListener("click", () => {
  if (palifico) {
    if (n2 == 0) {
      n2tmp = 5;
      console.log("n2 : " + n2tmp);
    }
  } else {
    if (n2 == 1 && numberTurn == false) {
      n1tmp = n1 * 2 + 1;
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
      numberTurn = true;
    }
    if (n2 <= 5) {
      n2tmp = 5;
      console.log("n2 : 5");
      pacoTurn = false;
      if (numberTurn == false) {
        n1tmp = n1;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    }
  }
});
dice6.addEventListener("click", () => {
  if (palifico) {
    if (n2 == 0) {
      n2tmp = 6;
      console.log("n2 : " + n2tmp);
    }
  } else {
    if (n2 == 1 && numberTurn == false) {
      n1tmp = n1 * 2 + 1;
      n1val.innerHTML = n1tmp;
      console.log("n1 : " + n1tmp);
      numberTurn = true;
    }
    if (n2 <= 6) {
      n2tmp = 6;
      console.log("n2 : 6");
      pacoTurn = false;
      if (numberTurn == false) {
        n1tmp = n1;
        n1val.innerHTML = n1tmp;
        console.log("n1 : " + n1tmp);
      }
    }
  }
});

ready.addEventListener("click", () => {
  let data = {
    'event': 'READY',
    'user': loggeduser_id,
    'game_data': {}
  }
  gameSocket.send(JSON.stringify(data));
});




gameSocket.onmessage = function (e) {
  let data = JSON.parse(e.data);
  data = data["payload"];
  let message = data["message"];
  let event = data["event"];
  switch (event) {
    case "START":
      let nbplayer = message["nb_players"];

      let playersList = message["players"];
      let userlist = message["userlist"];
      for (let i = 0; i < nbplayer; i++) {
        let name = playersList[i];
        let userid = userlist[i];
        playersList.push(new Player(name,userid));
      }
        rollAll();
        newTurn();
        break;
    
    case "ROLL":
      let user = message["user"];
      if (loggeduser_id = user) {
        let dice = message["dice"];
        let nbdice= message["nb_dice"];
        let who = message["who"];
        playersList[who].dice = dice;
        playersList[who].nbDice = nbdice;
      }
      
      break;

    case "VALID":
      n1tmp= n1 = message["nb_dice"];
      n2tmp=n2 = message["value_dice"];
      n1val.innerHTML = n1tmp;
      turn = message["turn"];
      newTurn();
      break;
    
    case "RESET-ALL":
      n1tmp= n1 = message["nb_dice"];
      n2tmp=n2 = message["value_dice"];
      n1val.innerHTML = n1tmp;
      turn = message["turn"];
      turn1 = message["turn1"];
      roll();
      newTurn();
      break;
    
    default:
      console.log("No event");
  }
};