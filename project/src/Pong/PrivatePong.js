const socket = io("http://localhost:3000");

var Width = 800;
var Height = 620;

const config = {
    type: Phaser.HEADLESS,
    scale: {
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
    },
    autoFocus: false,
};

const game = new Phaser.Game(config);

let player, ball, cursors;
const keys = {};
let gameStarted = false;
var player1Score = 0, player2Score = 0, VelocityX, VelocityY;
var Timer = 6;
var timedEvent;

function preload() {
}

function create() {
    timedEvent = this.time.addEvent({ delay: 1000, callback: OnEvent, callbackScope: this, loop: true });

    var rand = Phaser.Math.Between(1, 2);
    rand = (rand == 2) ? -1 : 1;
    ball = this.physics.add.sprite(Width / 2,
        (Height / 2) + ((Height / 2) * rand),
        'ball');
    ball.setSize(15, 15);

    player1 = this.physics.add.sprite(
        Width - (ball.body.width / 2 + 1), // x position
        Height / 2, // y position
        'paddle', // key of image for the sprite
    );
    player1.setSize(14, 175);

    player2 = this.physics.add.sprite(
        (ball.body.width / 2 + 1), // x position
        Height / 2, // y position
        'paddle', // key of image for the sprite
    );
    player2.setSize(14, 175);

    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);
    ball.setCollideWorldBounds(true);
    ball.setBounce(1);
    player1.setImmovable(true);
    player2.setImmovable(true);
    this.physics.add.collider(ball, player1, null, null, this);
    this.physics.add.collider(ball, player2, null, null, this);
}

function update() {
    socket.on(window.left, (message) => {
        if (message == "UP") {
            player1.body.setVelocityY(-350);
        }
        else if (message == "DOWN") {
            player1.body.setVelocityY(350);
        }
    })
    socket.on(window.right, (message) => {
        if (message == "UP") {
            player2.body.setVelocityY(-350);
        }
        else if (message == "DOWN") {
            player2.body.setVelocityY(350);
        }
    })

    if (isPlayer1Point()) {
        VelocityX = 400;
        player1Score++;
        socket.emit("msgToserver", window.left + "1Score", player1Score).emit("msgToserver", window.right + "1Score", player1Score);
        reset();
        return;
    }

    if (isPlayer2Point()) {
        VelocityX = -400;
        player2Score++;
        socket.emit("msgToserver", window.left + "2Score", player2Score).emit("msgToserver", window.right + "2Score", player2Score);
        reset();
        return;
    }

    if (player1Score >= 13) {
        socket.emit("msgToserver", window.left, "1Victory").emit("msgToserver", window.right, "1Victory").emit("ROOT", 1);
        End();
    }
    if (player2Score >= 13) {
        socket.emit("msgToserver", window.left, "2Victory").emit("msgToserver", window.right, "2Victory").emit("ROOT", 2);
        End();
    }
    player1.body.setVelocityY(0);
    player2.body.setVelocityY(0);

   emitDraw();
}

function emitDraw() {
    socket.emit("msgToserver", window.left + "ball", ball.x, ball.y).emit("msgToserver", window.right + "ball", ball.x, ball.y);
    socket.emit("msgToserver", window.left + "player1", player1.y).emit("msgToserver", window.right + "player1", player1.y);
    socket.emit("msgToserver", window.left + "player2", player2.y).emit("msgToserver", window.right + "player2", player2.y);
}

function Start() {
    gameStarted = true;
    socket.emit("msgToserver", window.left, "START").emit("msgToserver", window.right, "START");
    rand = Phaser.Math.Between(1, 2);
    rand = (rand == 2) ? -1 : 1;
    VelocityX = (Width / 2) * rand;
    VelocityY = Height / 2;
    ball.setVelocity(VelocityX, VelocityY);
}

async function End() {
    timedEvent.remove(false);
    ball.destroy();
    player1.body.setVelocityY(0);
    player2.body.setVelocityY(0);
    gameStarted = false;
    await new Promise(r => setTimeout(r, 2000));
    socket.destroy();
    game.destroy();
}

function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var partInSeconds = seconds % 60;
    partInSeconds = partInSeconds.toString().padStart(2, '0');
    return `${minutes}:${partInSeconds}`;
}

function OnEvent() {
    if (!gameStarted && Timer > 0) {
        Timer -= 1;
        socket.emit("msgToserver", window.left + 'openText', Timer).emit("msgToserver", window.right + 'openText', Timer);
        if (Timer == 0)
            Start();
    }
    else if (gameStarted) {
        Timer += 1;
        socket.emit("msgToserver", window.left + 'tText', formatTime(Timer)).emit("msgToserver", window.right + 'tText', formatTime(Timer));
    }
}

function isPlayer1Point() {
    return ball.x >= Width - 15;
}

function isPlayer2Point() {
    return ball.x <= 15;
}

function reset() {
    var rand = Phaser.Math.Between(1, 2);
    rand = (rand == 2) ? -1 : 1;
    ball.x = Width / 2;
    ball.y = (Height / 2) + ((Height / 2) * rand);
    ball.setVelocity(VelocityX, VelocityY);
}