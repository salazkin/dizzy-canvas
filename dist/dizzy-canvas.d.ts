// Generated by dts-bundle-generator v4.2.0

export declare type Matrix = {
	a: number;
	b: number;
	c: number;
	d: number;
	tx: number;
	ty: number;
};
export declare class Transform {
	x: number;
	y: number;
	scaleX: number;
	scaleY: number;
	skewX: number;
	skewY: number;
	rotation: number;
	matrix: Matrix;
	matrixUpdated: boolean;
	equalScale: boolean;
	noScale: boolean;
	equalSkew: boolean;
	noSkew: boolean;
	updateInfo(): void;
	updateMatrix(): void;
	concat(local: Transform, global: Transform): void;
	copy(target: Transform): void;
}
export declare class Layer {
	readonly root: Sprite;
	id: string;
	redraw: boolean;
	gameHeight: number;
	gameWidth: number;
	maskX: number;
	maskY: number;
	maskWidth: number;
	maskHeight: number;
	maskLeftBound: number;
	maskRightBound: number;
	maskTopBound: number;
	maskBottomBound: number;
	constructor(id: string, width: number, height: number);
	set x(value: number);
	get x(): number;
	set y(value: number);
	get y(): number;
	set width(value: number);
	get width(): number;
	set height(value: number);
	get height(): number;
	updateMaskBounds(): void;
	addChild(sprite: Sprite): Sprite;
	removeChild(sprite: Sprite): void;
	kill(): void;
}
export declare class Sprite {
	name: string;
	layer: Layer | null;
	texture: HTMLImageElement | null;
	protected rect: number[] | null;
	readonly mesh: {
		vertexes: number[];
		uv: number[];
	};
	meshUpdated: boolean;
	globalVisible: boolean;
	globalAlpha: number;
	protected width: number;
	protected height: number;
	protected pivotX: number;
	protected pivotY: number;
	protected visibleUpdated: boolean;
	protected localVisible: boolean;
	protected localAlpha: number;
	readonly globalTransform: Transform;
	protected readonly localTransform: Transform;
	protected transformUpdated: boolean;
	parent: Sprite | null;
	readonly childrens: Sprite[];
	protected readonly hierarchy: Sprite[];
	set x(value: number);
	get x(): number;
	set y(value: number);
	get y(): number;
	set scaleX(value: number);
	get scaleX(): number;
	set scaleY(value: number);
	get scaleY(): number;
	set rotation(value: number);
	get rotation(): number;
	set alpha(value: number);
	get alpha(): number;
	set visible(value: boolean);
	get visible(): boolean;
	setTexture(texture: HTMLImageElement, atlas?: {
		[key: string]: number[];
	}, spriteId?: string): void;
	setRect(rect: number[]): void;
	updateMesh(): void;
	pokeTransform(): void;
	pokeVisible(): void;
	updateRootLayer(): void;
	addChild(node: Sprite): Sprite;
	removeChild(node: Sprite): void;
	updateHierarchy(): void;
	updateTransform(): void;
	updateGlobalTransform(): void;
	updateVisible(): void;
	updateGlobalVisible(): void;
	updateGlobalAlpha(): void;
	kill(): void;
}
export declare class Renderer {
	private readonly layers;
	sceneWidth: number;
	sceneHeight: number;
	private canvas;
	private readonly vertexData;
	private readonly indexData;
	private vertexOffset;
	private indexOffset;
	private readonly textures;
	private readonly gl;
	private readonly vertexShader;
	private readonly fragmentShader;
	private readonly vs;
	private readonly fs;
	private readonly program;
	private readonly ratio;
	private readonly vec2UniformLoc;
	private readonly matABCDCoordLocation;
	private readonly indexBuffer;
	private readonly vertBuffer;
	private currentTexture;
	constructor(canvas: HTMLCanvasElement);
	createContext(): null | WebGLRenderingContext;
	getLayer(id: string): Layer;
	removeLayer(id: string): void;
	addTexture(image: HTMLImageElement): void;
	present(): void;
	draw(sprite: Sprite, offsetX: number, offsetY: number): void;
	drawTriangles(): void;
}

export {};
