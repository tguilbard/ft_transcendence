import store from '@/store';
import Phaser from 'phaser';
import Button from './Button';
import shared from '../../../mixins/Mixins'
import router from '@/router';
import { UserEntity } from '@/interface/interface';

const Width = 800;
const Height = 620;

let background: Phaser.GameObjects.Image;
let backgroundC: Phaser.GameObjects.Image;
let ball: Phaser.GameObjects.Sprite;
let player1: Phaser.GameObjects.Sprite;
let player2: Phaser.GameObjects.Sprite;
let star: Phaser.GameObjects.Sprite;

let keysUP: Phaser.Input.Keyboard.Key;
let keysDOWN: Phaser.Input.Keyboard.Key;

let gameStarted = false;

let buttonPong: Button;
let buttonCustom: Button;
let buttonReturn: Button;
let buttonObs: Button;
let returnText: Phaser.GameObjects.Text;
let customText: Phaser.GameObjects.Text;
let openingText: Phaser.GameObjects.Text;
let TimerText: Phaser.GameObjects.Text;
let player1ScoreText: Phaser.GameObjects.Text;
let player2ScoreText: Phaser.GameObjects.Text;
let player1Name: Phaser.GameObjects.Text;
let player2Name: Phaser.GameObjects.Text;

let oldMsg1Score: string;
let oldMsg2Score: string;
let oldMsgtTime: string;
let myUser: UserEntity;
let origin: number;

const lGrey = 0xdcdcdc;
const Grey = 0xb8b8b8;
const lRed = 0xff0000;
const Red = 0x8b0000;

(async ()=>{

if (await shared.isLogin())
{
    myUser = await shared.getMyUser();
    if (!store.state.sock_init)
        store.commit("SET_SOCKET");
}
while (store.state.socket.disconnected)
{
    await delay(100);
}

class Pong extends Phaser.Scene {

    lock = false;
    flag = 0;
    p1Name: string;
    p2Name: string;



    constructor () {
        super({ key: 'Pong' });
    }

    preload() {
        this.load.image('ball', './assets/ball.png');
        this.load.image('paddle', './assets/paddle.png');
        this.load.image('ground', './assets/ground.png');
        this.load.image('button', './assets/button.png');
        this.load.image('star', './assets/astre.png');
        this.load.image('groundC', './assets/groundCustom.png');
        this.load.image('close', './assets/close2.png');
    }
   
    create() {
            background = this.add.image(Width / 2, Height / 2, 'ground');
            backgroundC = this.add.image(Width / 2, Height / 2, 'groundC');
    
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
        
            star = this.add.sprite(
                (ball.width / 2 + 1), // x position
                Height / 2, // y position
                'star', // key of image for the sprite
            );
            star.setDisplaySize(100, 100);
    
            keysUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            keysDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        
            buttonCustom = new Button(this, Width / 2, Height * 0.25, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
            buttonCustom.setDisplaySize(500, 100);
    
            buttonPong = new Button(this, Width / 2, Height * 0.5, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
            buttonPong.setDisplaySize(500, 100);
    
            buttonReturn = new Button(this, Width / 2, Height * 0.75, 'button', lGrey).setDownTexture('button').setOverTint(Grey);
            buttonReturn.setDisplaySize(500, 100);

            buttonObs = new Button(this, Width - 20, 20, 'close', lGrey).setDownTexture('close').setOverTint(lRed);
            buttonObs.setDisplaySize(40, 40);
    
            buttonPong = this.add.existing(buttonPong);
            buttonCustom = this.add.existing(buttonCustom);
            buttonReturn = this.add.existing(buttonReturn);
            buttonObs = this.add.existing(buttonObs);
    
            returnText = this.add.text(
                Width / 2,
                Height * 0.75,
                'Return',
                {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '50px',
                }
            );
            returnText.setStroke('#000', 5);
            returnText.setOrigin(0.5);
    
            customText = this.add.text(
                Width / 2,
                Height * 0.25,
                'Pong',
                {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '50px',
                }
            );
            customText.setStroke('#000', 5);
            customText.setOrigin(0.5);
    
            openingText = this.add.text(
                Width / 2,
                Height / 2,
                'Press to Search',
                {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '50px',
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
                }
            );
        
            player2Name.setOrigin(1, 0.5);

            background.setVisible(false);
            backgroundC.setVisible(false);
            player1.setVisible(false);
            player2.setVisible(false);
            star.setVisible(false);
            TimerText.setVisible(false);
            player1ScoreText.setVisible(false);
            player2ScoreText.setVisible(false);
            player1Name.setVisible(false);
            player2Name.setVisible(false);
            buttonObs.setVisible(false);

            buttonPong.onClick().subscribe(() => {
                if (this.lock === false)
                {
                    store.state.socket.emit('matching', this.flag);
                    openingText.setText("Matching...");
                    this.lock = true;
                }
                else
                {
                    store.state.socket.emit('unmatching', this.flag);
                    openingText.setText("Press to Search");
                    this.lock = false;
                }
            })
    
            buttonCustom.onClick().subscribe(() => {
                if (this.flag === 0 && this.lock === false)
                {
                    customText.setText("Astro Pong");
                    this.flag++;
                }
                else if (this.flag === 1 && this.lock === false)
                {
                    customText.setText("Pong");
                    this.flag = 0;
                }
            })
            
            buttonReturn.onClick().subscribe(() => {
                gameStarted = false;
                store.dispatch("SET_DUEL", false);
                let check = document.getElementById("grid");
                if (check !== null) check.style.removeProperty("display");
                check = document.getElementById("menu");
                if (check !== null) check.style.removeProperty("display");
                check = document.getElementById("PongBorder");
                if (check !== null) check.style.setProperty("display", "none");
            })

            buttonObs.onClick().subscribe(() => {
                ball.setVisible(false);
                background.setVisible(false);
                backgroundC.setVisible(false);
                player1.setVisible(false);
                player2.setVisible(false);
                star.setVisible(false);
                TimerText.setVisible(false);
                player1ScoreText.setVisible(false);
                player2ScoreText.setVisible(false);
                player1Name.setVisible(false);
                player2Name.setVisible(false);
                buttonObs.setVisible(false);
                returnText.setVisible(true);
                buttonPong.setVisible(true);
                buttonCustom.setVisible(true);
                buttonReturn.setVisible(true);
                customText.setVisible(true);
                openingText.setVisible(true);
            
                openingText.setText('Press to Search');
                player1ScoreText.setText('0');
                player2ScoreText.setText('0');
                TimerText.setText('0:00');
                gameStarted = false;
                store.dispatch("SET_DUEL", false);
                store.state.socket.emit("unspec");
                let check = document.getElementById("grid");
                if (check !== null) check.style.removeProperty("display");
                check = document.getElementById("menu");
                if (check !== null) check.style.removeProperty("display");
                check = document.getElementById("PongBorder");
                if (check !== null) check.style.setProperty("display", "none");
            })
        
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

        store.state.socket.off("star").on("star", (x, y) => {
            star.x = x;
            star.y = y;
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
            player1Name.setText(p1);
            player2Name.setText(p2);
            this.p1Name = p1;
            this.p2Name = p2;
        })

        store.state.socket.off("openText").on("openText", (message, flag) => {
            if (gameStarted === false)
            {
                if (flag === 0)
                {
                    background.setVisible(true);
                }
                else if (flag === 1)
                {
                    backgroundC.setVisible(true);
                    star.setVisible(true);
                }
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
                customText.setVisible(false);

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
    
        store.state.socket.on("START", (message) => {
            if (message === 1)
            {
                background.setVisible(false);
                backgroundC.setVisible(true);
                star.setVisible(true);
            }
            else if (message === 0)
            {
                background.setVisible(true);
                backgroundC.setVisible(false);
                star.setVisible(false);
            }
            Start();
        });
        
        store.state.socket.off("1Victory").on("1Victory", () => {
            openingText.setVisible(true);
            openingText.setText(`${this.p1Name } WINS !`);
            this.lock = false;
            End();
        });
        store.state.socket.off("2Victory").on("2Victory", () => {
            openingText.setVisible(true);
            openingText.setText(`${this.p2Name} WINS !`);
            this.lock = false;
            End();
        });

        store.state.socket.off("buttonObs").on("buttonObs", () => {
            buttonObs.setVisible(true);
        });

        if (myUser && myUser.state === 'in match')
        {
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
            customText.setVisible(false);
    
            gameStarted = true;
            store.state.socket.emit("init_score");
        }
    }
   


    public update() {
        if (gameStarted === true)
        {
            if (keysUP.isDown) {
                store.state.socket.emit("players", "UP");
            } else if (keysDOWN.isDown) {
                store.state.socket.emit("players", "DOWN");
            }

            if (game.input.activePointer.isDown)
            { 
                if (game.input.activePointer.y - (Height / 2) < 0) {
                    store.state.socket.emit("players", "UP");
                } else if (game.input.activePointer.y - (Height / 2) > 0) {
                    store.state.socket.emit("players", "DOWN");
                }
            }
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
    backgroundC.setVisible(false);
    player1.setVisible(false);
    player2.setVisible(false);
    star.setVisible(false);
    TimerText.setVisible(false);
    player1ScoreText.setVisible(false);
    player2ScoreText.setVisible(false);
    player1Name.setVisible(false);
    player2Name.setVisible(false);
    buttonObs.setVisible(false);
    returnText.setVisible(true);
    buttonPong.setVisible(true);
    buttonCustom.setVisible(true);
    buttonReturn.setVisible(true);
    customText.setVisible(true);

    openingText.setText('Press to Search');
    player1ScoreText.setText('0');
    player2ScoreText.setText('0');
    TimerText.setText('0:00');

    gameStarted = false;
    store.dispatch("SET_DUEL", false);
    let check = document.getElementById("grid");
    if (check !== null) check.style.removeProperty("display");
    check = document.getElementById("menu");
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