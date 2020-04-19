import Sprite from "./Sprite";

export default class Layer {

    public readonly root = new Sprite();
    public id: string;

    public redraw: boolean = false;

    public gameHeight: number;
    public gameWidth: number;

    public maskX: number = 0;
    public maskY: number = 0;

    public maskWidth: number;
    public maskHeight: number;

    public maskLeftBound: number = 0;
    public maskRightBound: number;
    public maskTopBound: number;
    public maskBottomBound: number = 0;

    constructor(id: string, width: number, height: number) {
        this.root.layer = this;
        this.root.name = id;
        this.id = id;
        this.gameHeight = this.maskHeight = this.maskTopBound = height;
        this.gameWidth = this.maskWidth = this.maskRightBound = width;
    }

    set x(value: number) {
        this.maskX = value;
        this.updateMaskBounds();
    }

    get x(): number {
        return this.maskX;
    }

    set y(value: number) {
        this.maskY = value;
        this.updateMaskBounds();
    }

    get y(): number {
        return this.maskY;
    }

    set width(value: number) {
        this.maskWidth = value;
        this.updateMaskBounds();
    }
    get width(): number {
        return this.maskWidth;
    }

    set height(value: number) {
        this.maskHeight = value;
        this.updateMaskBounds();
    }

    get height(): number {
        return this.maskHeight;
    }

    public updateMaskBounds(): void {
        this.maskLeftBound = this.maskX;
        this.maskRightBound = this.maskX + this.maskWidth;
        this.maskTopBound = this.gameHeight - this.maskY;
        this.maskBottomBound = this.gameHeight - (this.maskY + this.maskHeight);
    }

    public addChild(sprite: Sprite): Sprite {
        this.root.addChild(sprite);
        this.redraw = true;
        return sprite;
    }

    public removeChild(sprite: Sprite): void {
        this.root.removeChild(sprite);
        this.redraw = true;
    }

    public kill(): void {
        this.root.kill();
    }

}
