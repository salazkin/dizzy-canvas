import Sprite from "./Sprite";
import Node from "./Node";
import { Vec4 } from "Types";

const MAX_SPRITES = 100000;
const VERTEX_DATA_LENGTH = (4 + 4 + 4 + 3) * 4; //(x, y, tx, ty) + (a, b, c, d) + (tintR, tintG, tintB, tintA) + (u, v, alpha)
const INDEX_DATA_LENGTH = 6;

export default class Renderer {
    static BLEND_MODE = {
        NORMAL: "normal",
        ADD: "add",
        MULTIPLY: "multiply"
    };

    public readonly stage: Node;
    public sceneWidth: number;
    public sceneHeight: number;
    private canvas: HTMLCanvasElement;
    private readonly vertexData: Float32Array;
    private readonly indexData: Uint16Array;
    private vertexOffset: number = 0;
    private indexOffset: number = 0;
    private readonly textures: { [key: string]: WebGLTexture | null; } = {};
    private readonly gl: WebGLRenderingContext | null;
    private readonly vertexShader: undefined | string;
    private readonly fragmentShader: undefined | string;
    private readonly vs: WebGLShader | null = null;
    private readonly fs: WebGLShader | null = null;
    private readonly program: WebGLProgram | null = null;
    private readonly vec2UniformLoc: WebGLUniformLocation | null = null;
    private readonly indexBuffer: WebGLBuffer | null = null;
    private readonly vertBuffer: WebGLBuffer | null = null;
    private currentTexture: undefined | HTMLImageElement;
    private currentBlendMode: string = Renderer.BLEND_MODE.NORMAL;
    private readonly blendModes: { [key: string]: GLenum[]; } = {};
    private readonly defaultTint: Vec4 = [0, 0, 0, 0];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.stage = new Node("stage");

        this.sceneWidth = this.canvas.width;
        this.sceneHeight = this.canvas.height;

        this.vertexData = new Float32Array(MAX_SPRITES * VERTEX_DATA_LENGTH);
        this.indexData = new Uint16Array(MAX_SPRITES * INDEX_DATA_LENGTH);

        for (let i = 0; i < MAX_SPRITES; i++) {
            let index = i * INDEX_DATA_LENGTH;
            let offset = i * 4;
            this.indexData[index++] = offset;
            this.indexData[index++] = offset + 3;
            this.indexData[index++] = offset + 1;
            this.indexData[index++] = offset + 2;
            this.indexData[index++] = offset + 1;
            this.indexData[index++] = offset + 3;
        }

        this.gl = this.createContext();

        if (this.gl) {

            this.blendModes[Renderer.BLEND_MODE.NORMAL] = [this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA];
            this.blendModes[Renderer.BLEND_MODE.ADD] = [this.gl.ONE, this.gl.ONE];
            this.blendModes[Renderer.BLEND_MODE.MULTIPLY] = [this.gl.DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA];

            this.gl.viewport(0, 0, this.sceneWidth, this.sceneHeight);
            this.gl.clearColor(0, 0, 0, 1);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendEquation(this.gl.FUNC_ADD);
            this.gl.blendFunc(this.blendModes[Renderer.BLEND_MODE.NORMAL][0], this.blendModes[Renderer.BLEND_MODE.NORMAL][1]);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.disable(this.gl.CULL_FACE);
            this.gl.disable(this.gl.STENCIL_TEST);
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

            this.vertexShader = [
                "uniform vec2 uRatio;",
                "attribute vec4 aPos;",
                "attribute vec4 aTrans;",
                "attribute vec4 aTint;",
                "attribute vec3 aTex;",

                "varying vec2 vTextureCoord;",
                "varying float vAlpha;",
                "varying vec4 vTint;",

                "void main() {",
                "float a = (aTrans.x * cos(aTrans.w)) * uRatio.x;",
                "float c = (aTrans.y * sin(-aTrans.z)) * -uRatio.x;",
                "float b = (aTrans.x * sin(aTrans.w)) * -uRatio.y;",
                "float d = (aTrans.y * cos(aTrans.z)) * uRatio.y;",
                "float tx = aPos.z * uRatio.x - 1.0;",
                "float ty = aPos.w * -uRatio.y + 1.0;",
                "mat3 outMatrix = mat3(a, b, 0.0, c, d, 0.0, tx, ty, 1.0);",
                "gl_Position = vec4(outMatrix * vec3(aPos.xy, 1.0), 1.0);",
                "vTextureCoord = aTex.xy;",
                "vAlpha = aTex.z;",
                "vTint = aTint;",
                "}",
            ].join("\n");

            this.fragmentShader = [
                "precision mediump float;",
                "uniform sampler2D uImage;",

                "uniform vec4 uClip;",
                "varying vec2 vTextureCoord;",
                "varying float vAlpha;",
                "varying vec4 vTint;",

                "void main() {",
                "vec4 color = texture2D(uImage, vTextureCoord);",
                "float alpha = color.a * vAlpha;",
                "gl_FragColor = vec4(mix(color.rgb, vTint.rgb, vTint.a) * alpha, alpha);",
                "}"
            ].join("\n");

            this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(this.vs, this.vertexShader);
            this.gl.compileShader(this.vs);

            this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(this.fs, this.fragmentShader);
            this.gl.compileShader(this.fs);

            this.program = this.gl.createProgram();
            this.gl.attachShader(this.program, this.vs);
            this.gl.attachShader(this.program, this.fs);
            this.gl.linkProgram(this.program);

            this.gl.useProgram(this.program);

            this.vec2UniformLoc = this.gl.getUniformLocation(this.program, "uRatio");
            this.gl.uniform2f(this.vec2UniformLoc, 2 / this.sceneWidth, 2 / this.sceneHeight);

            const positionLocation = this.gl.getAttribLocation(this.program, "aPos");
            this.gl.enableVertexAttribArray(positionLocation);

            const texCoordLocation = this.gl.getAttribLocation(this.program, "aTex");
            this.gl.enableVertexAttribArray(texCoordLocation);

            const matABCDCoordLocation = this.gl.getAttribLocation(this.program, "aTrans");
            this.gl.enableVertexAttribArray(matABCDCoordLocation);

            const tintLocation = this.gl.getAttribLocation(this.program, "aTint");
            this.gl.enableVertexAttribArray(tintLocation);

            this.indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexData, this.gl.STATIC_DRAW);

            this.vertBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);

            this.gl.vertexAttribPointer(positionLocation, 4, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 0); // x, y, tx, ty -> 16
            this.gl.vertexAttribPointer(matABCDCoordLocation, 4, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 16); //a, b, c, d -> 32
            this.gl.vertexAttribPointer(tintLocation, 4, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 32); // u, v, alpha -> 48
            this.gl.vertexAttribPointer(texCoordLocation, 3, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 48); // u, v, alpha -> 60
        }
    }

    public resize(width: number, height: number): void {
        if (this.sceneWidth !== width || this.sceneHeight !== height) {
            this.sceneWidth = this.canvas.width = width;
            this.sceneHeight = this.canvas.height = height;
            if (this.gl) {
                this.gl.viewport(0, 0, this.sceneWidth, this.sceneHeight);
                if (this.vec2UniformLoc) {
                    this.gl.uniform2f(this.vec2UniformLoc, 2 / this.sceneWidth, 2 / this.sceneHeight);
                }
            }
        }
    }

    public createContext(): null | WebGLRenderingContext {
        const names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        let context = null;
        for (let i = 0; i < names.length; i++) {
            context = this.canvas.getContext(names[i], { alpha: false, premultipliedAlpha: false });
            if (context) {
                break;
            }
        }
        return context as WebGLRenderingContext;
    }

    public addTexture(image: HTMLImageElement): void {
        if (!image.id) {
            console.warn("no texture id", image);
        }
        if (!this.gl) {
            console.warn("addTexture error: no webgl contex");
            return;
        }
        if (!this.textures[image.id]) {
            const texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.textures[image.id] = texture;
        } else {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[image.id]);
        }
    }

    public present(): void {
        if (!this.gl) {
            return;
        }
        for (let i = 0; i < this.stage.children.length; i++) {
            this.draw(this.stage.children[i] as Sprite);
        }
        this.drawTriangles();
    }

    public draw(sprite: Sprite, alpha?: number, tint?: Vec4, blend?: string, poked?: boolean): void {
        if (!sprite.visible) {
            return;
        }
        alpha = (alpha || 1) * sprite.alpha;
        tint = sprite.getTint() || tint || this.defaultTint;
        blend = sprite.getBlendMode() || blend || Renderer.BLEND_MODE.NORMAL;
        poked = sprite.updateGlobalTransform(poked);

        const texture = sprite.getTexture();

        if (texture) {
            if (this.currentTexture !== texture) {
                this.drawTriangles();
                this.addTexture(texture);
                this.currentTexture = texture;
            }

            if (this.indexOffset >= this.indexData.length) {
                this.drawTriangles();
            }

            if (this.currentBlendMode !== blend) {
                this.drawTriangles();
                if (this.blendModes[blend]) {
                    this.currentBlendMode = blend;
                } else {
                    console.warn(`blend mode error: \"${blend}\" is not valid blend mode.`);
                    this.currentBlendMode = Renderer.BLEND_MODE.NORMAL;
                }
                const blendMode = this.blendModes[this.currentBlendMode];
                if (blendMode.length > 2) {
                    this.gl.blendFuncSeparate(blendMode[0], blendMode[1], blendMode[2], blendMode[3]);
                } else {
                    this.gl.blendFunc(blendMode[0], blendMode[1]);
                }
            }

            const mesh = sprite.getMesh();
            const vertexes = mesh.vertexes;
            const uv = mesh.uv;
            const tr = sprite.transform.global;

            for (let i = 0; i < vertexes.length; i += 2) {
                this.vertexData[this.vertexOffset++] = vertexes[i];
                this.vertexData[this.vertexOffset++] = vertexes[i + 1];
                this.vertexData[this.vertexOffset++] = tr.x;
                this.vertexData[this.vertexOffset++] = tr.y;

                this.vertexData[this.vertexOffset++] = tr.scaleX;
                this.vertexData[this.vertexOffset++] = tr.scaleY;
                this.vertexData[this.vertexOffset++] = tr.skewX;
                this.vertexData[this.vertexOffset++] = tr.skewY;

                this.vertexData[this.vertexOffset++] = tint[0];
                this.vertexData[this.vertexOffset++] = tint[1];
                this.vertexData[this.vertexOffset++] = tint[2];
                this.vertexData[this.vertexOffset++] = tint[3];

                this.vertexData[this.vertexOffset++] = uv[i];
                this.vertexData[this.vertexOffset++] = uv[i + 1];
                this.vertexData[this.vertexOffset++] = alpha;
            }
            this.indexOffset += INDEX_DATA_LENGTH;
        }

        for (let i = 0; i < sprite.children.length; i++) {
            this.draw(sprite.children[i] as Sprite, alpha, tint, blend, poked);
        }
    }

    public drawTriangles(): void {
        if (!this.gl) {
            return;
        }
        if (this.indexOffset > 0) {
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexOffset), this.gl.STATIC_DRAW);
            this.gl.drawElements(this.gl.TRIANGLES, this.indexOffset, this.gl.UNSIGNED_SHORT, 0);
        }
        this.vertexOffset = 0;
        this.indexOffset = 0;
    }
}
