import Transform from "./Transform";

class Node {

    public transform: { local: Transform, global: Transform, globalTransformUpdated: boolean; } = { local: new Transform(), global: new Transform(), globalTransformUpdated: false };
    public readonly childrens: Node[] = [];
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
            this.transform.local.rotation = 0;
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
            this.transform.local.rotation = 0;
            this.transform.local.skewY = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }

    get skewY(): number {
        return this.transform.local.skewY;
    }

    set rotation(value: number) {
        let rotation = value % 360;
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
        this.transform.globalTransformUpdated = false;
    }

    public updateHierarchyGlobalTransform(): boolean {
        let poked = false;
        for (let i = 0; i < this.hierarchy.length; i++) {
            let node = this.hierarchy[i];
            poked = poked || !node.transform.globalTransformUpdated;
            node.updateGlobalTransform(poked);
        }
        return poked;
    }

    public updateChildrensGlobalTransform(poked?: boolean): void {
        for (let i = 0; i < this.childrens.length; i++) {
            let node = this.childrens[i];
            poked = poked || !node.transform.globalTransformUpdated;
            node.updateGlobalTransform(poked);
            node.updateChildrensGlobalTransform(poked);
        }
    }

    public pokeChildrens(poked?: boolean) {
        for (let i = 0; i < this.childrens.length; i++) {
            let node = this.childrens[i];
            poked = poked || !node.transform.globalTransformUpdated;
            if (poked) {
                node.poke();
                node.pokeChildrens(poked);
            }
        }
    }

    public updateGlobalTransform(poked?: boolean): boolean {
        poked = poked || !this.transform.globalTransformUpdated;
        if (poked) {
            if (this.parent) {
                this.transform.global.concat(this.transform.local, this.parent.transform.global);
            } else {
                this.transform.global.copy(this.transform.local);
            }
            this.transform.globalTransformUpdated = true;
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
