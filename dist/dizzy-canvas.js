class Transform {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.skewX = 0;
        this.skewY = 0;
        this.rotation = 0;
        this.matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
        this.matrixUpdated = false;
        this.equalScale = true;
        this.noScale = true;
        this.equalSkew = true;
        this.noSkew = true;
    }
    updateInfo() {
        this.equalScale = (this.scaleX == this.scaleX);
        this.noScale = (this.scaleX == 1 && this.scaleY == 1);
        this.equalSkew = (this.skewX == this.skewY);
        this.noSkew = (this.skewX === 0 && this.skewY === 0);
        if (this.equalSkew) {
            this.rotation = this.skewX;
        }
    }
    updateMatrix() {
        if (!this.matrixUpdated) {
            this.matrix.a = this.scaleX * Math.cos(this.skewY);
            this.matrix.b = this.scaleX * Math.sin(this.skewY);
            this.matrix.c = this.scaleY * Math.sin(-this.skewX);
            this.matrix.d = this.scaleY * Math.cos(this.skewX);
            this.matrix.tx = this.x;
            this.matrix.ty = this.y;
            this.matrixUpdated = true;
        }
    }
    concat(local, global) {
        if (global.noSkew && global.noScale) {
            this.x = local.x + global.x;
            this.y = local.y + global.y;
            this.scaleX = local.scaleX;
            this.scaleY = local.scaleY;
            this.skewX = local.skewX;
            this.skewY = local.skewY;
            this.matrixUpdated = false;
        }
        else if (global.equalScale && global.noSkew) {
            this.x = local.x * global.scaleX + global.x;
            this.y = local.y * global.scaleY + global.y;
            this.scaleX = local.scaleX * global.scaleX;
            this.scaleY = local.scaleY * global.scaleY;
            this.skewX = local.skewX;
            this.skewY = local.skewY;
            this.matrixUpdated = false;
        }
        else if (global.equalSkew && global.noScale) {
            let globalSinAngel = Math.sin(global.skewX);
            let globalCosAngel = Math.cos(global.skewY);
            let posX = local.x * globalCosAngel - local.y * globalSinAngel;
            let posY = local.x * globalSinAngel + local.y * globalCosAngel;
            this.x = posX * global.scaleX + global.x;
            this.y = posY * global.scaleY + global.y;
            this.skewX = local.skewX + global.skewX;
            this.skewY = local.skewY + global.skewY;
            this.scaleX = local.scaleX * global.scaleX;
            this.scaleY = local.scaleY * global.scaleY;
            this.matrixUpdated = false;
        }
        else {
            local.updateMatrix();
            global.updateMatrix();
            let m1 = local.matrix;
            let m2 = global.matrix;
            this.matrix.a = m1.a * m2.a + m1.b * m2.c;
            this.matrix.c = m1.c * m2.a + m1.d * m2.c;
            this.matrix.tx = m1.tx * m2.a + m1.ty * m2.c + m2.tx;
            this.matrix.b = m1.a * m2.b + m1.b * m2.d;
            this.matrix.d = m1.c * m2.b + m1.d * m2.d;
            this.matrix.ty = m1.tx * m2.b + m1.ty * m2.d + m2.ty;
            this.x = this.matrix.tx;
            this.y = this.matrix.ty;
            this.scaleX = Math.sqrt(this.matrix.a * this.matrix.a + this.matrix.b * this.matrix.b);
            this.scaleY = Math.sqrt(this.matrix.c * this.matrix.c + this.matrix.d * this.matrix.d);
            this.skewX = Math.atan2(-this.matrix.c, this.matrix.d);
            this.skewY = Math.atan2(this.matrix.b, this.matrix.a);
            this.matrixUpdated = true;
        }
        this.updateInfo();
    }
    copy(target) {
        this.x = target.x;
        this.y = target.y;
        this.scaleX = target.scaleX;
        this.scaleY = target.scaleY;
        this.skewX = target.skewX;
        this.skewY = target.skewY;
        this.rotation = target.rotation;
        this.matrixUpdated = false;
        this.updateInfo();
    }
}

class Node {
    constructor(id) {
        this.transform = { local: new Transform(), global: new Transform(), globalTransformUpdated: false };
        this.childrens = [];
        this.hierarchy = [];
        this.parent = null;
        this.name = id || "node";
        return this;
    }
    set x(value) {
        if (this.transform.local.x !== value) {
            this.transform.local.x = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get x() {
        return this.transform.local.x;
    }
    set y(value) {
        if (this.transform.local.y !== value) {
            this.transform.local.y = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get y() {
        return this.transform.local.y;
    }
    set scaleX(value) {
        if (this.transform.local.scaleX !== value) {
            this.transform.local.scaleX = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get scaleX() {
        return this.transform.local.scaleX;
    }
    set scaleY(value) {
        if (this.transform.local.scaleY !== value) {
            this.transform.local.scaleY = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get scaleY() {
        return this.transform.local.scaleY;
    }
    set skewX(value) {
        if (this.transform.local.skewX !== value) {
            this.transform.local.rotation = this.transform.local.skewY === this.transform.local.skewX ? this.transform.local.skewX : 0;
            this.transform.local.skewX = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get skewX() {
        return this.transform.local.skewX;
    }
    set skewY(value) {
        if (this.transform.local.skewY !== value) {
            this.transform.local.rotation = this.transform.local.skewY === this.transform.local.skewX ? this.transform.local.skewX : 0;
            this.transform.local.skewY = value;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get skewY() {
        return this.transform.local.skewY;
    }
    set rotation(value) {
        let rotation = value % 360;
        if (this.transform.local.rotation !== rotation) {
            this.transform.local.skewX = this.transform.local.skewY = value * Math.PI / 180;
            this.transform.local.rotation = rotation;
            this.transform.local.matrixUpdated = false;
            this.poke();
        }
    }
    get rotation() {
        return this.transform.local.rotation;
    }
    setPosition(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    setScale(x = 1, y = 1) {
        this.scaleX = x;
        this.scaleY = y;
    }
    setSkew(x = 0, y = 0) {
        this.skewX = x;
        this.skewY = y;
    }
    addChild(node) {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        node.updateHierarchy();
        this.childrens.push(node);
        return node;
    }
    removeChild(node) {
        for (let i = 0; i < this.childrens.length; i++) {
            if (this.childrens[i] === node) {
                this.childrens.splice(i, 1);
            }
        }
        if (this.parent) {
            this.parent.removeChild(node);
        }
        else {
            node.parent = null;
            node.updateHierarchy();
        }
    }
    updateHierarchy() {
        this.hierarchy.length = 0;
        let node = this;
        while (true) {
            if (node.parent) {
                node = node.parent;
                this.hierarchy.unshift(node);
            }
            else {
                break;
            }
        }
        for (let i = 0; i < this.childrens.length; i++) {
            this.childrens[i].updateHierarchy();
        }
        this.poke();
    }
    poke() {
        this.transform.globalTransformUpdated = false;
    }
    updateHierarchyGlobalTransform() {
        let poked = false;
        for (let i = 0; i < this.hierarchy.length; i++) {
            let node = this.hierarchy[i];
            poked = poked || !node.transform.globalTransformUpdated;
            node.updateGlobalTransform(poked);
        }
        return poked;
    }
    updateChildrensGlobalTransform(poked) {
        for (let i = 0; i < this.childrens.length; i++) {
            let node = this.childrens[i];
            poked = poked || !node.transform.globalTransformUpdated;
            node.updateGlobalTransform(poked);
            node.updateChildrensGlobalTransform(poked);
        }
    }
    pokeChildrens(poked) {
        for (let i = 0; i < this.childrens.length; i++) {
            let node = this.childrens[i];
            poked = poked || !node.transform.globalTransformUpdated;
            if (poked) {
                node.poke();
                node.pokeChildrens(poked);
            }
        }
    }
    updateGlobalTransform(poked) {
        poked = poked || !this.transform.globalTransformUpdated;
        if (poked) {
            if (this.parent) {
                this.transform.global.concat(this.transform.local, this.parent.transform.global);
            }
            else {
                this.transform.global.copy(this.transform.local);
            }
            this.transform.globalTransformUpdated = true;
        }
        return poked;
    }
    kill() {
        this.childrens.forEach(children => children.parent = null);
        this.childrens.length = 0;
        this.hierarchy.length = 0;
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.parent = null;
    }
}

class Sprite extends Node {
    constructor(texture, frame) {
        super("sprite");
        this.texture = null;
        this.bounds = null;
        this.anchor = { x: 0, y: 0 };
        this.mesh = null;
        this.display = { visible: true, alpha: 1 };
        if (texture) {
            this.setTexture(texture, frame);
        }
    }
    set width(value) {
        if (this.texture) {
            this.scaleX = value / this.texture.rect.width;
        }
    }
    get width() {
        return this.texture ? this.texture.rect.width * this.scaleX : 0;
    }
    set height(value) {
        if (this.texture) {
            this.scaleY = value / this.texture.rect.height;
        }
    }
    get height() {
        return this.texture ? this.texture.rect.height * this.scaleY : 0;
    }
    set visible(value) {
        this.display.visible = value;
    }
    get visible() {
        return this.display.visible;
    }
    set alpha(value) {
        this.display.alpha = Math.min(1, Math.max(0, value));
    }
    get alpha() {
        return this.display.alpha;
    }
    set anchorX(value) {
        this.anchor.x = Math.min(1, Math.max(0, value));
        if (this.mesh) {
            this.mesh.meshUpdated = false;
        }
    }
    get anchorX() {
        return this.anchor.x;
    }
    set anchorY(value) {
        this.anchor.y = Math.min(1, Math.max(0, value));
        if (this.mesh) {
            this.mesh.meshUpdated = false;
        }
    }
    get anchorY() {
        return this.anchor.y;
    }
    setTexture(img, frame) {
        if (!this.texture) {
            this.texture = {};
        }
        this.texture.img = img;
        if (frame) {
            this.setFrame(frame);
        }
        else {
            this.setFrame({ x: 0, y: 0, width: img.width, height: img.height });
        }
    }
    getTexture() {
        return this.texture ? this.texture.img : null;
    }
    setFrame(rect) {
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
    setAnchor(x = 0, y = 0) {
        this.anchorX = x;
        this.anchorY = y;
    }
    getMesh() {
        this.updateMesh();
        return this.mesh;
    }
    updateMesh() {
        if (!this.texture) {
            return;
        }
        if (!this.mesh) {
            this.mesh = { meshUpdated: false };
        }
        if (!this.mesh.meshUpdated) {
            let rect = this.texture.rect;
            let offsetX = rect.width * this.anchor.x;
            let offsetY = rect.height * this.anchor.y;
            this.mesh.vertexes = [
                -offsetX, offsetY,
                rect.width - offsetX, offsetY,
                rect.width - offsetX, -rect.height + offsetY,
                -offsetX, -rect.height + offsetY
            ];
            let uv0 = rect.x / this.texture.img.width;
            let uv1 = rect.y / this.texture.img.height;
            let uv2 = (rect.x + rect.width) / this.texture.img.width;
            let uv3 = (rect.y + rect.height) / this.texture.img.height;
            this.mesh.uv = [uv0, uv1, uv2, uv1, uv2, uv3, uv0, uv3];
            this.mesh.meshUpdated = true;
        }
    }
    updateBounds() {
        if (!this.visible || (this.bounds && this.bounds.boundsUpdated)) {
            return;
        }
        if (this.texture) {
            if (!this.bounds) {
                this.bounds = { rect: { x: 0, y: 0, width: 0, height: 0 } };
            }
            let w = this.width;
            let h = this.height;
            let vec1X = Math.cos(this.transform.global.skewY) * w;
            let vec1Y = Math.sin(this.transform.global.skewY) * w;
            let vec2X = Math.cos(this.transform.global.skewX + Math.PI * 0.5) * h;
            let vec2Y = Math.sin(this.transform.global.skewX + Math.PI * 0.5) * h;
            let vec3X = vec1X + vec2X;
            let vec3Y = vec1Y + vec2Y;
            let minX = Math.min(0, Math.min(vec1X, Math.min(vec2X, vec3X)));
            let minY = Math.min(0, Math.min(vec1Y, Math.min(vec2Y, vec3Y)));
            let maxX = Math.max(0, Math.max(vec1X, Math.max(vec2X, vec3X)));
            let maxY = Math.max(0, Math.max(vec1Y, Math.max(vec2Y, vec3Y)));
            this.bounds.rect.x = this.transform.global.x + minX - vec3X * this.anchor.x;
            this.bounds.rect.y = this.transform.global.y + minY - vec3Y * this.anchor.y;
            this.bounds.rect.width = maxX - minX;
            this.bounds.rect.height = maxY - minY;
            this.bounds.boundsUpdated = true;
        }
    }
    getBounds() {
        let poked = this.updateHierarchyGlobalTransform();
        poked = this.updateGlobalTransform(poked);
        this.pokeChildrens(poked);
        if (poked && this.bounds) {
            this.bounds.boundsUpdated = false;
        }
        this.updateBounds();
        return this.bounds ? this.bounds.rect : null;
    }
}

const MAX_SPRITES = 100000;
const VERTEX_DATA_LENGTH = (4 + 4 + 3) * 4;
const INDEX_DATA_LENGTH = 6;
class Renderer {
    constructor(canvas) {
        this.vertexOffset = 0;
        this.indexOffset = 0;
        this.textures = {};
        this.vs = null;
        this.fs = null;
        this.program = null;
        this.vec2UniformLoc = null;
        this.indexBuffer = null;
        this.vertBuffer = null;
        this.canvas = canvas;
        this.stage = new Node("stage");
        this.sceneWidth = this.canvas.width;
        this.sceneHeight = this.canvas.height;
        this.vertexData = new Float32Array(MAX_SPRITES * VERTEX_DATA_LENGTH);
        this.indexData = new Uint16Array(MAX_SPRITES * INDEX_DATA_LENGTH);
        for (let i = 0; i < MAX_SPRITES; i++) {
            let index = i * INDEX_DATA_LENGTH;
            let offset = i * 4;
            this.indexData[index + 0] = 0 + offset;
            this.indexData[index + 1] = 3 + offset;
            this.indexData[index + 2] = 1 + offset;
            this.indexData[index + 3] = 2 + offset;
            this.indexData[index + 4] = 1 + offset;
            this.indexData[index + 5] = 3 + offset;
        }
        this.gl = this.createContext();
        if (this.gl) {
            this.gl.viewport(0, 0, this.sceneWidth, this.sceneHeight);
            this.gl.clearColor(0, 0, 0, 1);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.enable(this.gl.BLEND);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.disable(this.gl.CULL_FACE);
            this.gl.disable(this.gl.STENCIL_TEST);
            this.vertexShader = [
                "uniform vec2 uRatio;",
                "attribute vec4 aPos;",
                "attribute vec4 aTrans;",
                "attribute vec3 aTex;",
                "varying vec2 vTextureCoord;",
                "varying float vAlpha;",
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
                "}",
            ].join("\n");
            this.fragmentShader = [
                "precision mediump float;",
                "uniform sampler2D uImage;",
                "uniform vec4 uClip;",
                "varying vec2 vTextureCoord;",
                "varying float vAlpha;",
                "void main() {",
                "gl_FragColor = texture2D(uImage, vTextureCoord);",
                "}"
            ].join("\n");
            this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
            if (this.vs) {
                this.gl.shaderSource(this.vs, this.vertexShader);
                this.gl.compileShader(this.vs);
            }
            this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            if (this.fs) {
                this.gl.shaderSource(this.fs, this.fragmentShader);
                this.gl.compileShader(this.fs);
            }
            this.program = this.gl.createProgram();
            if (this.program && this.vs && this.fs) {
                this.gl.attachShader(this.program, this.vs);
                this.gl.attachShader(this.program, this.fs);
                this.gl.linkProgram(this.program);
                this.gl.useProgram(this.program);
                this.vec2UniformLoc = this.gl.getUniformLocation(this.program, "uRatio");
                this.gl.uniform2f(this.vec2UniformLoc, 2 / this.sceneWidth, 2 / this.sceneHeight);
                let positionLocation = this.gl.getAttribLocation(this.program, "aPos");
                this.gl.enableVertexAttribArray(positionLocation);
                let texCoordLocation = this.gl.getAttribLocation(this.program, "aTex");
                this.gl.enableVertexAttribArray(texCoordLocation);
                this.matABCDCoordLocation = this.gl.getAttribLocation(this.program, "aTrans");
                this.gl.enableVertexAttribArray(this.matABCDCoordLocation);
                this.indexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexData, this.gl.STATIC_DRAW);
                this.vertBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
                this.gl.vertexAttribPointer(positionLocation, 4, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 0);
                this.gl.vertexAttribPointer(this.matABCDCoordLocation, 4, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 16);
                this.gl.vertexAttribPointer(texCoordLocation, 3, this.gl.FLOAT, false, VERTEX_DATA_LENGTH, 32);
            }
        }
    }
    resize(width, height) {
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
    createContext() {
        let names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        let context = null;
        for (let i = 0; i < names.length; i++) {
            context = this.canvas.getContext(names[i], {
                alpha: false
            });
            if (context) {
                break;
            }
        }
        return context;
    }
    addTexture(image) {
        if (!image.id) {
            console.warn("no texture id", image);
        }
        if (!this.gl) {
            console.warn("addTexture error: no webgl contex");
            return;
        }
        if (!this.textures[image.id]) {
            let texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.textures[image.id] = texture;
        }
        else {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[image.id]);
        }
    }
    present() {
        if (!this.gl) {
            return;
        }
        this.stage.updateChildrensGlobalTransform();
        this.draw(this.stage.childrens);
        this.drawTriangles();
    }
    draw(childrens) {
        for (let i = 0; i < childrens.length; i++) {
            let sprite = childrens[i];
            if (!sprite.visible) {
                continue;
            }
            let texture = sprite.getTexture();
            if (texture) {
                if (this.currentTexture !== texture) {
                    this.drawTriangles();
                    this.addTexture(texture);
                    this.currentTexture = texture;
                }
                if (this.indexOffset >= this.indexData.length) {
                    this.drawTriangles();
                }
                let mesh = sprite.getMesh();
                let vertexes = mesh.vertexes;
                let uv = mesh.uv;
                let tr = sprite.transform.global;
                for (let i = 0; i < vertexes.length; i += 2) {
                    this.vertexData[this.vertexOffset++] = vertexes[i];
                    this.vertexData[this.vertexOffset++] = vertexes[i + 1];
                    this.vertexData[this.vertexOffset++] = tr.x;
                    this.vertexData[this.vertexOffset++] = tr.y;
                    this.vertexData[this.vertexOffset++] = tr.scaleX;
                    this.vertexData[this.vertexOffset++] = tr.scaleY;
                    this.vertexData[this.vertexOffset++] = tr.skewX;
                    this.vertexData[this.vertexOffset++] = tr.skewY;
                    this.vertexData[this.vertexOffset++] = uv[i];
                    this.vertexData[this.vertexOffset++] = uv[i + 1];
                    this.vertexData[this.vertexOffset++] = sprite.alpha;
                }
                this.indexOffset += INDEX_DATA_LENGTH;
            }
            this.draw(sprite.childrens);
        }
    }
    drawTriangles() {
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

class Timer {
    constructor(cb) {
        this.onEnterFrame = cb;
        this.oldTime = Date.now();
        return this;
    }
    start() {
        this.oldTime = Date.now();
        this.onRequestAnimationFrame();
    }
    stop() {
        cancelAnimationFrame(this.requestAnimationFrameId);
    }
    onRequestAnimationFrame() {
        const delta = Date.now() - this.oldTime;
        this.requestAnimationFrameId = requestAnimationFrame(this.onRequestAnimationFrame.bind(this));
        this.oldTime += delta;
        this.onEnterFrame(delta);
    }
}

export { Node, Renderer, Sprite, Timer, Transform };
