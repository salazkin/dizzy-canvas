import Node from "./Node";
import { Rect, Point } from "Types";

export default class Sprite extends Node {

    protected texture: { img?: HTMLImageElement, rect?: Rect; } | null = null;
    protected bounds: { rect?: Rect, boundsUpdated?: boolean; } | null = null;
    protected anchor: Point = { x: 0, y: 0 };
    protected mesh: { vertexes?: number[], uv?: number[], meshUpdated: boolean; } | null = null;
    protected display: { visible: boolean, alpha: number, blend?: string; } = { visible: true, alpha: 1 };

    constructor(texture?: HTMLImageElement, frame?: Rect) {
        super("sprite");
        if (texture) {
            this.setTexture(texture, frame);
        }
    }

    set width(value: number) {
        if (this.texture) {
            this.scaleX = value / this.texture.rect.width;
        }
    }

    get width(): number {
        return this.texture ? this.texture.rect.width * this.scaleX : 0;
    }

    set height(value: number) {
        if (this.texture) {
            this.scaleY = value / this.texture.rect.height;
        }
    }

    get height(): number {
        return this.texture ? this.texture.rect.height * this.scaleY : 0;
    }

    set visible(value: boolean) {
        this.display.visible = value;
    }

    get visible(): boolean {
        return this.display.visible;
    }

    set alpha(value: number) {
        this.display.alpha = Math.min(1, Math.max(0, value));
    }

    get alpha(): number {
        return this.display.alpha;
    }

    set anchorX(value: number) {
        this.anchor.x = Math.min(1, Math.max(0, value));
        if (this.mesh) {
            this.mesh.meshUpdated = false;
        }
    }

    get anchorX(): number {
        return this.anchor.x;
    }

    set anchorY(value: number) {
        this.anchor.y = Math.min(1, Math.max(0, value));
        if (this.mesh) {
            this.mesh.meshUpdated = false;
        }
    }

    get anchorY(): number {
        return this.anchor.y;
    }

    public setAnchor(x: number = 0, y?: number): void {
        y = y || x;
        this.anchorX = x;
        this.anchorY = y;
    }

    public setBlendMode(value: string) {
        this.display.blend = value;
    }

    public getBlendMode(): string {
        return this.display.blend;
    }

    public setTexture(img: HTMLImageElement, frame?: Rect): void {
        if (!this.texture) {
            this.texture = {};
        }
        this.texture.img = img;
        if (frame) {
            this.setFrame(frame);
        } else {
            this.setFrame({ x: 0, y: 0, width: img.width, height: img.height });
        }
    }

    public getTexture(): HTMLImageElement | null {
        return this.texture ? this.texture.img : null;
    }

    public setFrame(rect: Rect): void {
        if (!this.texture) {
            return;
        }
        this.texture.rect = rect;
        if (this.mesh) {
            this.mesh.meshUpdated = false;
        }
        if (this.bounds) {
            this.bounds.boundsUpdated = false;
        }
    }

    public getMesh(): { vertexes?: number[], uv?: number[], meshUpdated: boolean; } | null {
        this.updateMesh();
        return this.mesh;
    }

    public updateMesh(): void {
        if (!this.texture) {
            return;
        }
        if (!this.mesh) {
            this.mesh = { meshUpdated: false };
        }
        if (!this.mesh.meshUpdated) {
            const rect = this.texture.rect;
            const offsetX = rect.width * this.anchor.x;
            const offsetY = rect.height * this.anchor.y;

            this.mesh.vertexes = [
                -offsetX, offsetY,
                rect.width - offsetX, offsetY,
                rect.width - offsetX, -rect.height + offsetY,
                -offsetX, -rect.height + offsetY
            ];

            const uv0 = rect.x / this.texture.img.width;
            const uv1 = rect.y / this.texture.img.height;
            const uv2 = (rect.x + rect.width) / this.texture.img.width;
            const uv3 = (rect.y + rect.height) / this.texture.img.height;
            this.mesh.uv = [uv0, uv1, uv2, uv1, uv2, uv3, uv0, uv3];
            this.mesh.meshUpdated = true;
        }
    }

    public updateBounds(): void {

        if (!this.visible || (this.bounds && this.bounds.boundsUpdated)) {
            return;
        }

        if (this.texture) {
            if (!this.bounds) {
                this.bounds = { rect: { x: 0, y: 0, width: 0, height: 0 } };
            }

            const w = this.width;
            const h = this.height;

            const vec1X = Math.cos(this.transform.global.skewY) * w;
            const vec1Y = Math.sin(this.transform.global.skewY) * w;
            const vec2X = Math.cos(this.transform.global.skewX + Math.PI * 0.5) * h; //todo optimize
            const vec2Y = Math.sin(this.transform.global.skewX + Math.PI * 0.5) * h;
            const vec3X = vec1X + vec2X;
            const vec3Y = vec1Y + vec2Y;

            const minX = Math.min(0, Math.min(vec1X, Math.min(vec2X, vec3X)));
            const minY = Math.min(0, Math.min(vec1Y, Math.min(vec2Y, vec3Y)));
            const maxX = Math.max(0, Math.max(vec1X, Math.max(vec2X, vec3X)));
            const maxY = Math.max(0, Math.max(vec1Y, Math.max(vec2Y, vec3Y)));

            this.bounds.rect.x = this.transform.global.x + minX - vec3X * this.anchor.x;
            this.bounds.rect.y = this.transform.global.y + minY - vec3Y * this.anchor.y;
            this.bounds.rect.width = maxX - minX;
            this.bounds.rect.height = maxY - minY;

            this.bounds.boundsUpdated = true;
        }
    }

    protected updateTransformData(): void {
        super.updateTransformData();
        if (this.bounds) {
            this.bounds.boundsUpdated = false;
        }
    }

    public getBounds(): Rect | null {
        let poked = this.updateHierarchyGlobalTransform();
        poked = this.updateGlobalTransform(poked);
        this.pokeChildren(poked);
        this.updateBounds();
        return this.bounds ? this.bounds.rect : null;
    }


}
