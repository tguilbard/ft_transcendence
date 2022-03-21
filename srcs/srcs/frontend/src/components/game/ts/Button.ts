import Phaser from 'phaser'
import  { Subject } from 'rxjs'
import { Observable } from 'rxjs/internal/Observable';


const WHITE = 0xffffff

export default class Button extends Phaser.GameObjects.Image
{
	private upTexture: string
	private upTint: number
	private downTexture: string
	private downTint: number
	private overTexture: string
	private overTint: number
	private disabledTexture: string
	private disabledTint: number

    private clickSubject: Subject<Phaser.Input.Pointer> = new Subject()

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, tint: number = WHITE)
	{
		super(scene, x, y, texture)

		this.setTint(tint)

		this.upTexture = texture
		this.upTint = tint
		this.downTexture = texture
		this.downTint = tint
		this.overTexture = texture
		this.overTint = tint
		this.disabledTexture = texture
		this.disabledTint = tint

		this.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.handleUp, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this.handleOut, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.handleDown, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this.handleOver, this)
	}

    destroy(fromScene = false): void
	{
		this.clickSubject.complete()

		super.destroy(fromScene)
	}

    onClick(): Observable<Phaser.Input.Pointer>
	{
		return this.clickSubject.asObservable()
	}
	
	setUpTexture(texture: string): this
	{
		this.upTexture = texture
		return this
	}

	setUpTint(tint: number): this
	{
		this.upTint = tint
		return this
	}

	setDownTexture(texture: string): this
	{
		this.downTexture = texture
		return this
	}

	setDownTint(tint: number): this
	{
		this.downTint = tint
		return this
	}

	setOverTexture(texture: string): this
	{
		this.overTexture = texture
		return this
	}

	setOverTint(tint: number): this
	{
		this.overTint = tint
		return this
	}

	setDisabledTexture(texture: string): this
	{
		this.disabledTexture = texture
		return this
	}

	setDisabledTint(tint: number): this
	{
		this.disabledTint = tint
		return this
	}

	setDisabled(disabled: boolean): this
	{
		if (disabled)
		{
			this.setTexture(this.disabledTexture)
			this.setTint(this.disabledTint)
			this.disableInteractive()
			return this
		}

		this.setTexture(this.upTexture)
		this.setTint(this.disabledTint)
		this.setInteractive()

		return this
	}

    private handleUp(pointer: Phaser.Input.Pointer)
	{
		this.handleOver(pointer)

		this.clickSubject.next(pointer)
	}

	private handleOut(pointer: Phaser.Input.Pointer)
	{
		pointer;
		this.setTexture(this.upTexture)
		this.setTint(this.upTint)
	}

	private handleDown(pointer: Phaser.Input.Pointer)
	{
		pointer;
		this.setTexture(this.downTexture)
		this.setTint(this.downTint)
	}

	private handleOver(pointer: Phaser.Input.Pointer)
	{
		pointer;
		this.setTexture(this.overTexture)
		this.setTint(this.overTint)
	}
}