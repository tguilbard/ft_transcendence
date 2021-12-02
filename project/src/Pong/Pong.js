const socket = io("http://localhost:3000");

let id;

socket.on("connect", () => {
    id = socket.id;
});

var Width = 800;
var Height = 620;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        //autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Width,
        height: Height,
    },
    scene: {
        preload,
        create,
        update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: false,
        }
    }
};

const game = new Phaser.Game(config);

let player, ball, cursors;
var gameStarted = false;
const keys = {};
let openingText, TimerText, player1VictoryText, player2VictoryText, player1ScoreText, player2ScoreText;

function preload() {
    this.load.image('ball', './Pong/ball.png');
    this.load.image('paddle', './Pong/paddle.png');
    this.load.image('ground', './Pong/ground.png');
}

function create() {
    this.add.image(Width / 2, Height / 2, 'ground');

    ball = this.add.sprite(Width / 2,
        Height / 2,
        'ball');
    ball.setVisible(false);
    ball.setDisplaySize(15, 15);

    player1 = this.add.sprite(
        Width - (ball.width / 2 + 1), // x position
        Height / 2, // y position
        'paddle', // key of image for the sprite
    );
    player1.setDisplaySize(14, 175);

    player2 = this.add.sprite(
        (ball.width / 2 + 1), // x position
        Height / 2, // y position
        'paddle', // key of image for the sprite
    );
    player2.setDisplaySize(14, 175);


    keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    openingText = this.add.text(
        Width / 2,
        Height / 2,
        'Matching',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        }
    );
    openingText.setStroke('#000', 5);

    openingText.setOrigin(0.5);

    TimerText = this.add.text(
        Width / 2,
        50,
        "0:00",
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        }
    );
    TimerText.setStroke('#000', 1);

    TimerText.setOrigin(0.5);

    // Create player 1 victory text
    player1VictoryText = this.add.text(
        Width / 2,
        Height / 2,
        'Player 1 WIN!',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        }
    );

    player1VictoryText.setOrigin(0.5);

    // Make it invisible until the player loses
    player1VictoryText.setVisible(false);
    player1VictoryText.setStroke('#000', 5);

    // Create the game won text
    player2VictoryText = this.add.text(
        Width / 2,
        Height / 2,
        'Player 2 WIN!',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        }
    );

    player2VictoryText.setOrigin(0.5);

    // Make it invisible until the player wins
    player2VictoryText.setVisible(false);
    player2VictoryText.setStroke('#000', 5);

    player1ScoreText = this.add.text(
        Width * 0.20,
        50,
        0,
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        }
    );

    player1ScoreText.setOrigin(0.5);

    player2ScoreText = this.add.text(
        Width * 0.80,
        50,
        0,
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        }
    );

    player2ScoreText.setOrigin(0.5);
    socket.emit('matching', "");
}

var oldMsg1Score, oldMsg2Score, oldMsgtTime;

function update() {
    socket.on(id + "1Score", (message) => {
        if (oldMsg1Score != message) {
            player1ScoreText.setText(message);
            oldMsg1Score = message;
        }
    })
    socket.on(id + "2Score", (message) => {
        if (oldMsg2Score != message) {
            player2ScoreText.setText(message);
            oldMsg2Score = message;
        }
    })

    socket.on(id + "openText", (message) => {
        openingText.setText('Game START in ' + message);
    })
    socket.on(id + "tText", (message) => {
        if (oldMsgtTime != message) {
            TimerText.setText(message);
            oldMsgtTime == message;
        }
    })

    socket.on(id, (message) => {
        if (message == "START") {
            Start();
        }
        else if (message == "1Victory") {
            player1VictoryText.setVisible(true);
            End();
        }
        else if (message == "2Victory") {
            player2VictoryText.setVisible(true);
            End();
        }
    })

    if (keys.w.isDown && gameStarted == true) {
        socket.emit("msgToserver", id, "UP");
    } else if (keys.s.isDown && gameStarted == true) {
        socket.emit("msgToserver", id, "DOWN");
    }

    socket.on(id + "ball", (x, y) => {
        ball.x = x;
        ball.y = y;
    })

    socket.on(id + "player1", (y) => {
        player1.y = y;
    })

    socket.on(id + "player2", (y) => {
        player2.y = y;
    })
}

function Start() {
    ball.setVisible(true);
    gameStarted = true;
    openingText.setVisible(false);
}

function End() {
    ball.destroy();
    gameStarted = false;
}