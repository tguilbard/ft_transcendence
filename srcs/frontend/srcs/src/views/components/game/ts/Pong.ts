import store from '@/store';
import Phaser from 'phaser';
import Button from './Button';

let id: string;

store.state.socket.off("connect").on("connect", () => {
    id = store.state.socket.id;
});

const Width = 800;
const Height = 620;

let background: Phaser.GameObjects.Image;
let ball: Phaser.GameObjects.Sprite;
let player1: Phaser.GameObjects.Sprite;
let player2: Phaser.GameObjects.Sprite;

let keysUP: Phaser.Input.Keyboard.Key;
let keysDOWN: Phaser.Input.Keyboard.Key;

let gameStarted = false;

let button: Button;
let openingText: Phaser.GameObjects.Text;
let TimerText: Phaser.GameObjects.Text;
let player1ScoreText: Phaser.GameObjects.Text;
let player2ScoreText: Phaser.GameObjects.Text;

let oldMsg1Score: string;
let oldMsg2Score: string;
let oldMsgtTime: string;
let oldMsg: string;

const lGrey = 0xdcdcdc;
const Grey = 0xb8b8b8;

class Pong extends Phaser.Scene {

    lock = false;

    constructor () {
        super({ key: 'Pong' });
    }

    preload() {
        this.load.image('ball', './assets/ball.png');
        this.load.image('paddle', './assets/paddle.png');
        this.load.image('ground', './assets/ground.png');
        this.load.image('button', './assets/button.png');
    }
   
    create() {
        background = this.add.image(Width / 2, Height / 2, 'ground');

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
    
    
        keysUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keysDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    
        button = new Button(this, Width / 2, Height / 2, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
        button.setDisplaySize(500, 100);

        button = this.add.existing(button);

        openingText = this.add.text(
            Width / 2,
            Height / 2,
            'Press to Search',
            {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '50px',
                // fill: '#fff'
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
                // fill: '#fff'
            }
        );
        TimerText.setStroke('#000', 1);
    
        TimerText.setOrigin(0.5);

        player1ScoreText = this.add.text(
            Width * 0.20,
            50,
            '0',
            {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '50px',
                // fill: '#fff'
            }
        );
    
        player1ScoreText.setOrigin(0.5);
    
        player2ScoreText = this.add.text(
            Width * 0.80,
            50,
            '0',
            {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '50px',
                // fill: '#fff'
            }
        );
    
        player2ScoreText.setOrigin(0.5);

        button.onClick().subscribe(() => {
            if (this.lock === false)
            {
                store.state.socket.emit('matching', "");
                openingText.setText("Matching...");
                this.lock = true;
            }
            else
            {
                store.state.socket.emit('unmatching', "");
                openingText.setText("Press to Search");
                this.lock = false;
            }
        })

        background.setVisible(false);
        player1.setVisible(false);
        player2.setVisible(false);
        TimerText.setVisible(false);
        player1ScoreText.setVisible(false);
        player2ScoreText.setVisible(false);

        store.state.socket.off(id + "ball").on(id + "ball", (x, y) => {
            ball.x = x;
            ball.y = y;
        })
    
        store.state.socket.off(id + "player1").on(id + "player1", (y) => {
            player1.y = y;
        })
    
        store.state.socket.off(id + "player2").on(id + "player2", (y) => {
            player2.y = y;
        })

        store.state.socket.off(id + "1Score").on(id + "1Score", (message) => {
            if (oldMsg1Score != message && gameStarted === true) {
                player1ScoreText.setText(message);
                oldMsg1Score = message;
            }
        })

        store.state.socket.off(id + "2Score").on(id + "2Score", (message) => {
            if (oldMsg2Score != message && gameStarted === true) {
                player2ScoreText.setText(message);
                oldMsg2Score = message;
            }
        })
    
        store.state.socket.off(id + "openText").on(id + "openText", (message) => {
            if (gameStarted === false)
            {
                background.setVisible(true);
                player1.setVisible(true);
                player2.setVisible(true);
                TimerText.setVisible(true);
                player1ScoreText.setVisible(true);
                player2ScoreText.setVisible(true);
                button.setVisible(false);

                gameStarted = true;
            }
            openingText.setText('Game START in ' + message);
        })

        store.state.socket.off(id + "tText").on(id + "tText", (message) => {
            if (oldMsgtTime != message && gameStarted === true) {
                TimerText.setText(message);
                oldMsgtTime == message;
            }
        })
    
        store.state.socket.off(id).on(id, (message) => {
            if (oldMsg != message && gameStarted === true) {
                if (message == "START") {
                    Start();
                }
                else if (message == "1Victory") {
                    openingText.setVisible(true);
                    openingText.setText('Player 1 WIN!');
                    this.lock = false;
                    End();
                }
                else if (message == "2Victory") {
                    openingText.setVisible(true);
                    openingText.setText('Player 2 WIN!');
                    this.lock = false;
                    End();
                }
                oldMsg == message;
            }
        })
    }
   
    public update() {

       
    
        if (keysUP.isDown) {
            console.log("W");
            store.state.socket.emit("pong", id, "UP");
        } else if (keysDOWN.isDown) {
            console.log("S");
            store.state.socket.emit("pong", id, "DOWN");
        }
    }
}

function Start() {
    ball.setVisible(true);
    openingText.setVisible(false);
}

async function End() {
    ball.setVisible(false);
    await delay(3000);
    background.setVisible(false);
    player1.setVisible(false);
    player2.setVisible(false);
    TimerText.setVisible(false);
    player1ScoreText.setVisible(false);
    player2ScoreText.setVisible(false);
    button.setVisible(true);

    openingText.setText('Press to Search');
    player1ScoreText.setText('0');
    player2ScoreText.setText('0');
    TimerText.setText('0:00');

    gameStarted = false;
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: Width,
        height: Height,
    },
    scene: [Pong],
    physics: {
        default: 'arcade',
        arcade: {
			gravity: { x: 0, y: 0 },
		}
    },

    parent: 'Pong',
    backgroundColor: '#000000',
};

const game = new Phaser.Game(config);

export default {}