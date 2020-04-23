import Node from "./Node";
import { Rect, Atlas } from "Types";

export default class Sprite extends Node {

    public texture: HTMLImageElement | null = null;
    protected rect: Rect | null = null;
    protected bounds: Rect | null = null;
    protected boundsUpdated: boolean = false;

    public readonly mesh: { vertexes: number[], uv: number[]; } = { vertexes: [], uv: [] };
    protected meshUpdated: boolean = false;

    protected localVisible: boolean = true;
    protected localAlpha = 1;

    constructor(texture?: HTMLImageElement, atlas?: Atlas, frameId?: string) {
        super("sprite");
        if (texture) {
            this.setTexture(texture, atlas, frameId);
        }
    }

    set width(value: number) {
        if (this.rect) {
            this.scaleX = value / this.rect.width;
        }
    }

    get width(): number {
        return this.rect ? this.rect.width * this.scaleX : 0;
    }

    set height(value: number) {
        if (this.rect) {
            this.scaleY = value / this.rect.height;
        }
    }

    get height(): number {
        return this.rect ? this.rect.height * this.scaleY : 0;
    }

    set alpha(value: number) {
        this.localAlpha = Math.min(1, Math.max(0, value));
    }

    get alpha(): number {
        return this.localAlpha;
    }

    set visible(value: boolean) {
        this.localVisible = value;
    }

    get visible(): boolean {
        return this.localVisible;
    }

    public setTexture(texture: HTMLImageElement, atlas?: Atlas, frameId?: string): void {
        if (frameId && atlas && !atlas[frameId]) {
            console.warn("no sprite " + frameId + " in atlas", atlas);
            return;
        }

        this.texture = texture;
        if (atlas && frameId) {
            this.setRect(atlas[frameId]);
        } else {
            this.setRect({ x: 0, y: 0, width: this.texture.width, height: this.texture.height });
        }
    }

    public setRect(rect: Rect): void {
        this.rect = rect;
        this.meshUpdated = false;
        this.boundsUpdated = false;
    }

    public updateMesh(): void {
        if (!this.meshUpdated) {
            if (this.rect && this.texture) {
                this.mesh.vertexes = [0, 0, this.rect.width, 0, this.rect.width, -this.rect.height, 0, -this.rect.height];

                let uv0 = this.rect.x / this.texture.width;
                let uv1 = this.rect.y / this.texture.height;
                let uv2 = (this.rect.x + this.rect.width) / this.texture.width;
                let uv3 = (this.rect.y + this.rect.height) / this.texture.height;
                this.mesh.uv = [uv0, uv1, uv2, uv1, uv2, uv3, uv0, uv3];
            }
            this.meshUpdated = true;
        }
    }

    public updateBounds(): void {
        if (!this.visible || this.boundsUpdated) {
            return;
        }

        if (this.rect) {
            if (!this.bounds) {
                this.bounds = { x: 0, y: 0, width: 0, height: 0 };
            }

            let w = this.width;
            let h = this.height;

            let vec1X = Math.cos(this.globalTransform.skewX) * w;
            let vec1Y = Math.sin(this.globalTransform.skewX) * w;
            let vec2X = Math.cos(this.globalTransform.skewY + Math.PI * 0.5) * h; //todo optimize
            let vec2Y = Math.sin(this.globalTransform.skewY + Math.PI * 0.5) * h;
            let vec3X = vec1X + vec2X;
            let vec3Y = vec1Y + vec2Y;

            let minX = Math.min(0, Math.min(vec1X, Math.min(vec2X, vec3X)));
            let minY = Math.min(0, Math.min(vec1Y, Math.min(vec2Y, vec3Y)));
            let maxX = Math.max(0, Math.max(vec1X, Math.max(vec2X, vec3X)));
            let maxY = Math.max(0, Math.max(vec1Y, Math.max(vec2Y, vec3Y)));

            this.bounds.x = this.globalTransform.x + minX;
            this.bounds.y = this.globalTransform.y + minY;
            this.bounds.width = maxX - minX;
            this.bounds.height = maxY - minY;
        }

        this.boundsUpdated = true;
    }

    public updateGlobalTransform(poked?: boolean): boolean {
        if (poked) {
            this.boundsUpdated = false;
        }
        return super.updateGlobalTransform(poked);
    }

    public getBounds(): Rect | null {
        let poked = this.updateHierarchyGlobalTransform();
        poked = this.updateGlobalTransform(poked);
        this.pokeChildrens(poked);
        this.updateBounds();
        return this.bounds;
    }

}
