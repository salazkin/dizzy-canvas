import Transform from "./Transform";

class Node {

    public transform: {
        local: Transform,
        global: Transform,
        globalTransformUpdated: boolean;
    } = { local: new Transform(), global: new Transform(), globalTransformUpdated: false };
    public readonly children: Node[] = [];
    protected readonly hierarchy: Node[] = [];
    public parent: Node | null = null;
    public name: string;

    constructor(id?: string) {
        this.name = id || "node";
        return this;
    }

    set x(value: number) {
        if (this.transform.local.x !== value) {
            this.transform.local.x = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get x(): number {
        return this.transform.local.x;
    }

    set y(value: number) {
        if (this.transform.local.y !== value) {
            this.transform.local.y = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get y(): number {
        return this.transform.local.y;
    }

    set scaleX(value: number) {
        if (this.transform.local.scaleX !== value) {
            this.transform.local.scaleX = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get scaleX(): number {
        return this.transform.local.scaleX;
    }

    set scaleY(value: number) {
        if (this.transform.local.scaleY !== value) {
            this.transform.local.scaleY = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get scaleY(): number {
        return this.transform.local.scaleY;
    }

    set skewX(value: number) {
        if (this.transform.local.skewX !== value) {
            this.transform.local.rotation = this.transform.local.skewY === this.transform.local.skewX ? this.transform.local.skewX : 0;
            this.transform.local.skewX = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get skewX(): number {
        return this.transform.local.skewX;
    }

    set skewY(value: number) {
        if (this.transform.local.skewY !== value) {
            this.transform.local.rotation = this.transform.local.skewY === this.transform.local.skewX ? this.transform.local.skewX : 0;
            this.transform.local.skewY = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get skewY(): number {
        return this.transform.local.skewY;
    }

    set rotation(value: number) {
        const rotation = value % 360;
        if (this.transform.local.rotation !== rotation) {
            this.transform.local.skewX = this.transform.local.skewY = value * Math.PI / 180;
            this.transform.local.rotation = rotation;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get rotation(): number {
        return this.transform.local.rotation;
    }

    public setPosition(x: number = 0, y: number): void {
        this.x = x;
        this.y = y;
    }

    public setScale(x: number = 1, y?: number): void {
        y = y || x;
        this.scaleX = x;
        this.scaleY = y;
    }

    public setSkew(x: number = 0, y: number): void {
        this.skewX = x;
        this.skewY = y;
    }

    public addChild(node: Node): Node {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        node.updateHierarchy();
        this.children.push(node);
        return node;
    }

    public removeChild(node: Node): void {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === node) {
                this.children.splice(i, 1);
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
        let node = this as Node;
        while (true) {
            if (node.parent) {
                node = node.parent;
                this.hierarchy.unshift(node);
            } else {
                break;
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updateHierarchy();
        }
        this.poke();
    }

    protected poke(): void {
        this.transform.globalTransformUpdated = false;
    }

    public updateHierarchyGlobalTransform(): boolean {
        let poked = false;
        for (let i = 0; i < this.hierarchy.length; i++) {
            const node = this.hierarchy[i];
            poked = poked || !node.transform.globalTransformUpdated;
            node.updateGlobalTransform(poked);
        }
        return poked;
    }

    public pokeChildren(poked?: boolean): void {
        for (let i = 0; i < this.children.length; i++) {
            const node = this.children[i];
            poked = poked || !node.transform.globalTransformUpdated;
            if (poked) {
                node.poke();
                node.pokeChildren(poked);
            }
        }
    }

    public updateGlobalTransform(poked?: boolean): boolean {
        poked = poked || !this.transform.globalTransformUpdated;
        if (poked) {
            this.updateTransformData();
        }
        return poked;
    }

    protected updateTransformData(): void {
        if (this.parent) {
            this.transform.global.concat(this.transform.local, this.parent.transform.global);
        } else {
            this.transform.global.copy(this.transform.local);
        }
        this.transform.globalTransformUpdated = true;
    }

    public kill(): void {
        this.children.forEach(children => children.parent = null);
        this.children.length = 0;
        this.hierarchy.length = 0;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = null;
    }
}

export default Node;
