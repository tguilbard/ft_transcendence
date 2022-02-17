import store from '@/store';
import Phaser from 'phaser';
import Button from './Button';
import shared from '../../../mixins/Mixins'
import router from '@/router';

const Width = 800;
const Height = 620;

let background: Phaser.GameObjects.Image;
let ball: Phaser.GameObjects.Sprite;
let player1: Phaser.GameObjects.Sprite;
let player2: Phaser.GameObjects.Sprite;

let keysUP: Phaser.Input.Keyboard.Key;
let keysDOWN: Phaser.Input.Keyboard.Key;

let gameStarted = false;

let buttonPong: Button;
let buttonCustom: Button;
let buttonReturn: Button;
let returnText: Phaser.GameObjects.Text;
let openingText: Phaser.GameObjects.Text;
let TimerText: Phaser.GameObjects.Text;
let player1ScoreText: Phaser.GameObjects.Text;
let player2ScoreText: Phaser.GameObjects.Text;
let player1Name: Phaser.GameObjects.Text;
let player2Name: Phaser.GameObjects.Text;

let oldMsg1Score: string;
let oldMsg2Score: string;
let oldMsgtTime: string;
let oldMsg: string;

const lGrey = 0xdcdcdc;
const Grey = 0xb8b8b8;


(async ()=>{

if (!await shared.isLogin())
    return router.push('login');
if (!store.state.sock_init)
    store.commit("SET_SOCKET");

let id: string;

store.state.socket.off("connect").on("connect", () => {
    id = store.state.socket.id;
});

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
        player1.setDisplaySize(14, 100);
    
        player2 = this.add.sprite(
            (ball.width / 2 + 1), // x position
            Height / 2, // y position
            'paddle', // key of image for the sprite
        );
        player2.setDisplaySize(14, 100);
    
    
        keysUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keysDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    
        buttonCustom = new Button(this, Width / 2, Height * 0.25, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
        buttonCustom.setDisplaySize(500, 100);

        buttonPong = new Button(this, Width / 2, Height * 0.5, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
        buttonPong.setDisplaySize(500, 100);

        buttonReturn = new Button(this, Width / 2, Height * 0.75, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
        buttonReturn.setDisplaySize(500, 100);

        buttonPong = this.add.existing(buttonPong);
        buttonCustom = this.add.existing(buttonCustom);
        buttonReturn = this.add.existing(buttonReturn);

        returnText = this.add.text(
            Width / 2,
            Height * 0.75,
            'Return',
            {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '50px',
                // fill: '#fff'
            }
        );
        returnText.setStroke('#000', 5);
        returnText.setOrigin(0.5);

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

        player1Name = this.add.text(
            0,
            50,
            'player1',
            {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '20px',
                // fill: '#fff'
            }
        );
    
        player1Name.setOrigin(0, 0.5);

        player2Name = this.add.text(
            Width,
            50,
            'player2',
            {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '20px',
                // fill: '#fff'
            }
        );
    
        player2Name.setOrigin(1, 0.5);

        buttonPong.onClick().subscribe(() => {
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

        buttonReturn.onClick().subscribe(() => {
            gameStarted = false;
            store.dispatch("SET_DUEL", false);
            let check = document.getElementById("grid");
            if (check !== null) check.style.removeProperty("display");
            check = document.getElementById("PongBorder");
            if (check !== null) check.style.setProperty("display", "none");
        })

        background.setVisible(false);
        player1.setVisible(false);
        player2.setVisible(false);
        TimerText.setVisible(false);
        player1ScoreText.setVisible(false);
        player2ScoreText.setVisible(false);
        player1Name.setVisible(false);
        player2Name.setVisible(false);

        store.state.socket.off("ball").on("ball", (x, y) => {
            ball.x = x;
            ball.y = y;
        })
    
        store.state.socket.off("player1").on("player1", (y) => {
            player1.y = y;
        })
    
        store.state.socket.off("player2").on("player2", (y) => {
            player2.y = y;
        })
        
        store.state.socket.off("1Score").on("1Score", (message) => {
            if (oldMsg1Score != message && gameStarted === true) {
                player1ScoreText.setText(message);
                oldMsg1Score = message;
            }
        })

        store.state.socket.off("2Score").on("2Score", (message) => {
            if (oldMsg2Score != message && gameStarted === true) {
                player2ScoreText.setText(message);
                oldMsg2Score = message;
            }
        })
    
        store.state.socket.off("setName").on("setName", (p1, p2) => {
            console.log("TEST");
            player1Name.setText(p1);
            player2Name.setText(p2);
        })

        store.state.socket.off("openText").on("openText", (message) => {
            if (gameStarted === false)
            {
                background.setVisible(true);
                player1.setVisible(true);
                player2.setVisible(true);
                TimerText.setVisible(true);
                player1ScoreText.setVisible(true);
                player2ScoreText.setVisible(true);
                player1Name.setVisible(true);
                player2Name.setVisible(true);
                buttonPong.setVisible(false);
                buttonCustom.setVisible(false);
                buttonReturn.setVisible(false);
                returnText.setVisible(false);


                gameStarted = true;
            }
            openingText.setText('Game START in ' + message);
        })

        store.state.socket.off("tText").on("tText", (message) => {
            if (oldMsgtTime != message && gameStarted === true) {
                TimerText.setText(message);
                oldMsgtTime == message;
            }
        })
    
        store.state.socket.on("START", () => {
            Start();
        });
        
        store.state.socket.off("1Victory").on("1Victory", () => {
            openingText.setVisible(true);
            openingText.setText('Player 1 WIN!');
            this.lock = false;
            End();
        });
        store.state.socket.off("2Victory").on("2Victory", () => {
            openingText.setVisible(true);
            openingText.setText('Player 2 WIN!');
            this.lock = false;
            End();
        });
    }
   
    public update() {
        if (keysUP.isDown) {
            store.state.socket.emit("players", "UP");
        } else if (keysDOWN.isDown) {
            store.state.socket.emit("players", "DOWN");
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
    player1Name.setVisible(false);
    player2Name.setVisible(false);
    returnText.setVisible(true);
    buttonPong.setVisible(true);
    buttonCustom.setVisible(true);
    buttonReturn.setVisible(true);

    openingText.setText('Press to Search');
    player1ScoreText.setText('0');
    player2ScoreText.setText('0');
    TimerText.setText('0:00');

    gameStarted = false;
    store.dispatch("SET_DUEL", false);
    let check = document.getElementById("grid");
    if (check !== null) check.style.removeProperty("display");
    check = document.getElementById("PongBorder");
    if (check !== null) check.style.setProperty("display", "none");
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
})();

export default {}