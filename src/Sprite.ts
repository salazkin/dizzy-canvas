import Transform from "./Transform";

type Atlas = { [key: string]: number[]; };

export default class Sprite {

    public name = "Sprite";

    public texture: HTMLImageElement | null = null;
    protected rect: number[] | null = null;
    public readonly mesh: { vertexes: number[], uv: number[]; } = { vertexes: [], uv: [] };
    public meshUpdated: boolean = false;

    public globalVisible: boolean = false;
    public globalAlpha: number = 1;

    protected width: number = 0;
    protected height: number = 0;

    protected pivotX: number = 0;
    protected pivotY: number = 0;

    protected visibleUpdated: boolean = false;
    protected localVisible: boolean = true;
    protected localAlpha = 1;

    public readonly globalTransform = new Transform();
    protected readonly localTransform = new Transform();
    protected transformUpdated: boolean = false;

    public parent: Sprite | null = null;
    public readonly childrens: Sprite[] = [];
    protected readonly hierarchy: Sprite[] = [];

    constructor(texture?: HTMLImageElement, atlas?: Atlas, frameId?: string) {
        if (texture) {
            this.setTexture(texture, atlas, frameId);
        }
    }

    set x(value: number) {
        this.localTransform.x = value;
        this.pokeTransform();
    }

    get x(): number {
        return this.localTransform.x;
    }

    set y(value: number) {
        this.localTransform.y = value;
        this.pokeTransform();
    }

    get y(): number {
        return this.localTransform.y;
    }

    set scaleX(value: number) {
        this.localTransform.scaleX = value;
        this.pokeTransform();
    }

    get scaleX(): number {
        return this.localTransform.scaleX;
    }

    set scaleY(value: number) {
        this.localTransform.scaleY = value;
        this.pokeTransform();
    }

    get scaleY(): number {
        return this.localTransform.scaleY;
    }

    set rotation(value: number) {
        this.localTransform.skewX = this.localTransform.skewY = value * Math.PI / 180;
        this.localTransform.rotation = value % 360;
        this.pokeTransform();
    }

    get rotation(): number {
        return this.localTransform.rotation;
    }

    set alpha(value: number) {
        this.localAlpha = Math.min(1, Math.max(0, value));
        this.updateGlobalAlpha();
    }

    get alpha(): number {
        return this.localAlpha;
    }

    set visible(value: boolean) {
        this.localVisible = value;
        this.pokeVisible();
    }

    get visible(): boolean {
        return this.localVisible;
    }

    public setTexture(texture: HTMLImageElement, atlas?: Atlas, frameId?: string): void {
        if (frameId && atlas && !atlas[frameId]) {
            console.log("no sprite " + frameId + " in atlas", atlas);
            return;
        }

        this.texture = texture;
        if (atlas && frameId) {
            this.setRect(atlas[frameId]);
        } else {
            this.setRect([0, 0, this.texture.width, this.texture.height]);
        }
    }

    public setRect(rect: number[]): void {
        this.rect = rect;
        this.width = this.rect[2];
        this.height = this.rect[3];
        this.meshUpdated = false;
    }

    public updateMesh(): void {
        this.mesh.vertexes = [
            -this.width / 2, this.height / 2,
            this.width / 2, this.height / 2,
            this.width / 2, -this.height / 2,
            -this.width / 2, -this.height / 2
        ];

        //this.mesh.vertexes = [0, 0, this.width, 0, this.width, -this.height, 0, -this.height];

        if (this.rect && this.texture) {
            let uv0 = this.rect[0] / this.texture.width;
            let uv1 = this.rect[1] / this.texture.height;
            let uv2 = (this.rect[0] + this.width) / this.texture.width;
            let uv3 = (this.rect[1] + this.height) / this.texture.height;
            this.mesh.uv = [uv0, uv1, uv2, uv1, uv2, uv3, uv0, uv3];
        }

        this.meshUpdated = true;
    }

    public pokeTransform(): void {
        this.localTransform.matrixUpdated = false;
        this.transformUpdated = false;
        this.childrens.forEach(children => children.transformUpdated = false);
    }

    public pokeVisible(): void {
        this.visibleUpdated = false;
        this.childrens.forEach(children => children.visibleUpdated = false);
    }

    public addChild(node: Sprite): Sprite {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;

        node.updateHierarchy();
        node.updateGlobalAlpha();
        this.childrens.push(node);

        return node;
    }

    public removeChild(node: Sprite): void {
        for (let i = 0; i < this.childrens.length; i++) {
            if (this.childrens[i] === node) {
                this.childrens.splice(i, 1);
            }
        }
        if (this.parent) {
            this.parent.removeChild(node);
        } else {
            node.parent = null;
            node.updateHierarchy();
        }
    }

    public updateHierarchy(): void {
        this.hierarchy.length = 0;
        let node = this as Sprite;
        while (true) {
            if (node.parent) {
                node = node.parent;
                this.hierarchy.unshift(node);
            } else {
                break;
            }
        }
        this.childrens.forEach(children => children.updateHierarchy());
        this.transformUpdated = false;
    }

    public updateTransform(): void {
        if (!this.transformUpdated) {
            if (this.parent) {
                this.globalTransform.concat(this.localTransform, this.parent.globalTransform);
            } else {
                this.globalTransform.copy(this.localTransform);
            }
            this.transformUpdated = true;
        }
    }

    public updateGlobalTransform(): void {
        if (!this.transformUpdated) {
            this.hierarchy.forEach(children => children.updateTransform());
            this.updateTransform();
        }
    };

    public updateVisible(): void {
        if (!this.visibleUpdated) {
            if (this.parent && this.parent.globalVisible === false) {
                this.globalVisible = false;
            } else {
                this.globalVisible = this.localVisible;
            }
            this.visibleUpdated = true;
        }
    }

    public updateGlobalVisible(): void {
        if (!this.visibleUpdated) {
            this.hierarchy.forEach(children => children.updateVisible());
            this.updateVisible();
        }
    }

    public updateGlobalAlpha(): void {
        if (this.parent) {
            this.globalAlpha = this.localAlpha * this.parent.globalAlpha;
        } else {
            this.globalAlpha = this.localAlpha;
        }
        this.childrens.forEach(children => children.updateGlobalAlpha());
    }

    public kill(): void {
        this.childrens.forEach(children => children.parent = null);
        this.childrens.length = 0;
        this.hierarchy.length = 0;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = null;
    }
}
