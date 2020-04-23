import Transform from "./Transform";

class Node {

    public readonly globalTransform: Transform = new Transform();
    public readonly localTransform: Transform = new Transform();

    public readonly childrens: Node[] = [];
    protected readonly hierarchy: Node[] = [];
    public parent: Node | null = null;
    public name: string;
    protected globalTransformUpdated: boolean = false;

    constructor(id?: string) {
        this.name = id || "node";
        return this;
    }

    set x(value: number) {
        if (this.localTransform.x !== value) {
            this.localTransform.x = value;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get x(): number {
        return this.localTransform.x;
    }

    set y(value: number) {
        if (this.localTransform.y !== value) {
            this.localTransform.y = value;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get y(): number {
        return this.localTransform.y;
    }

    set scaleX(value: number) {
        if (this.localTransform.scaleX !== value) {
            this.localTransform.scaleX = value;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get scaleX(): number {
        return this.localTransform.scaleX;
    }

    set scaleY(value: number) {
        if (this.localTransform.scaleY !== value) {
            this.localTransform.scaleY = value;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get scaleY(): number {
        return this.localTransform.scaleY;
    }

    set skewX(value: number) {
        if (this.localTransform.skewX !== value) {
            this.localTransform.rotation = 0;
            this.localTransform.skewX = value;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get skewX(): number {
        return this.localTransform.skewX;
    }

    set skewY(value: number) {
        if (this.localTransform.skewY !== value) {
            this.localTransform.rotation = 0;
            this.localTransform.skewY = value;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get skewY(): number {
        return this.localTransform.skewY;
    }

    set rotation(value: number) {
        let rotation = value % 360;
        if (this.localTransform.rotation !== rotation) {
            this.localTransform.skewX = this.localTransform.skewY = value * Math.PI / 180;
            this.localTransform.rotation = rotation;
            this.localTransform.matrixUpdated = false;
            this.poke();
        }
    }

    get rotation(): number {
        return this.localTransform.rotation;
    }

    public addChild(node: Node): Node {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        node.updateHierarchy();
        this.childrens.push(node);
        return node;
    }

    public removeChild(node: Node): void {
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
        let node = this as Node;
        while (true) {
            if (node.parent) {
                node = node.parent;
                this.hierarchy.unshift(node);
            } else {
                break;
            }
        }
        for (let i = 0; i < this.childrens.length; i++) {
            this.childrens[i].updateHierarchy();
        }
        this.poke();
    }

    protected poke(): void {
        this.globalTransformUpdated = false;
    }

    public updateHierarchyGlobalTransform(): boolean {
        let poked = false;
        for (let i = 0; i < this.hierarchy.length; i++) {
            let node = this.hierarchy[i];
            poked = poked || !node.globalTransformUpdated;
            node.updateGlobalTransform(poked);
        }
        return poked;
    }

    public updateChildrensGlobalTransform(poked?: boolean): void {
        for (let i = 0; i < this.childrens.length; i++) {
            let node = this.childrens[i];
            poked = poked || !node.globalTransformUpdated;
            node.updateGlobalTransform(poked);
            node.updateChildrensGlobalTransform(poked);
        }
    }

    public pokeChildrens(poked?: boolean) {
        for (let i = 0; i < this.childrens.length; i++) {
            let node = this.childrens[i];
            poked = poked || !node.globalTransformUpdated;
            if (poked) {
                node.poke();
                node.pokeChildrens(poked);
            }
        }
    }

    public updateGlobalTransform(poked?: boolean): boolean {
        poked = poked || !this.globalTransformUpdated;
        if (poked) {
            if (this.parent) {
                this.globalTransform.concat(this.localTransform, this.parent.globalTransform);
            } else {
                this.globalTransform.copy(this.localTransform);
            }
            this.globalTransformUpdated = true;
        }
        return poked;
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

export default Node;
