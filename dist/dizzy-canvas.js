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
            var globalSinAngel = Math.sin(global.skewX);
            var globalCosAngel = Math.cos(global.skewY);
            var posX = local.x * globalCosAngel - local.y * globalSinAngel;
            var posY = local.x * globalSinAngel + local.y * globalCosAngel;
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
            var m1 = local.matrix;
            var m2 = global.matrix;
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

class Sprite {
    constructor(texture, atlas, frameId) {
        this.name = "Sprite";
        this.layer = null;
        this.texture = null;
        this.rect = null;
        this.mesh = { vertexes: [], uv: [] };
        this.meshUpdated = false;
        this.globalVisible = false;
        this.globalAlpha = 1;
        this.width = 0;
        this.height = 0;
        this.pivotX = 0;
        this.pivotY = 0;
        this.visibleUpdated = false;
        this.localVisible = true;
        this.localAlpha = 1;
        this.globalTransform = new Transform();
        this.localTransform = new Transform();
        this.transformUpdated = false;
        this.parent = null;
        this.childrens = [];
        this.hierarchy = [];
        if (texture) {
            this.setTexture(texture, atlas, frameId);
        }
    }
    set x(value) {
        this.localTransform.x = value;
        this.pokeTransform();
    }
    get x() {
        return this.localTransform.x;
    }
    set y(value) {
        this.localTransform.y = value;
        this.pokeTransform();
    }
    get y() {
        return this.localTransform.y;
    }
    set scaleX(value) {
        this.localTransform.scaleX = value;
        this.pokeTransform();
    }
    get scaleX() {
        return this.localTransform.scaleX;
    }
    set scaleY(value) {
        this.localTransform.scaleY = value;
        this.pokeTransform();
    }
    get scaleY() {
        return this.localTransform.scaleY;
    }
    set rotation(value) {
        this.localTransform.skewX = this.localTransform.skewY = value * Math.PI / 180;
        this.localTransform.rotation = value % 360;
        this.pokeTransform();
    }
    get rotation() {
        return this.localTransform.rotation;
    }
    set alpha(value) {
        this.localAlpha = Math.min(1, Math.max(0, value));
        this.updateGlobalAlpha();
    }
    get alpha() {
        return this.localAlpha;
    }
    set visible(value) {
        this.localVisible = value;
        this.pokeVisible();
    }
    get visible() {
        return this.localVisible;
    }
    setTexture(texture, atlas, frameId) {
        if (frameId && atlas && !atlas[frameId]) {
            console.log("no sprite " + frameId + " in atlas", atlas);
            return;
        }
        this.texture = texture;
        if (atlas && frameId) {
            this.setRect(atlas[frameId]);
        }
        else {
            this.setRect([0, 0, this.texture.width, this.texture.height]);
        }
    }
    setRect(rect) {
        this.rect = rect;
        this.width = this.rect[2];
        this.height = this.rect[3];
        this.meshUpdated = false;
        this.updateRootLayer();
    }
    updateMesh() {
        this.mesh.vertexes = [
            -this.width / 2, this.height / 2,
            this.width / 2, this.height / 2,
            this.width / 2, -this.height / 2,
            -this.width / 2, -this.height / 2
        ];
        if (this.rect && this.texture) {
            let uv0 = this.rect[0] / this.texture.width;
            let uv1 = this.rect[1] / this.texture.height;
            let uv2 = (this.rect[0] + this.width) / this.texture.width;
            let uv3 = (this.rect[1] + this.height) / this.texture.height;
            this.mesh.uv = [uv0, uv1, uv2, uv1, uv2, uv3, uv0, uv3];
        }
        this.meshUpdated = true;
    }
    pokeTransform() {
        this.localTransform.matrixUpdated = false;
        this.transformUpdated = false;
        this.updateRootLayer();
        this.childrens.forEach(children => children.transformUpdated = false);
    }
    pokeVisible() {
        this.visibleUpdated = false;
        this.updateRootLayer();
        this.childrens.forEach(children => children.visibleUpdated = false);
    }
    updateRootLayer() {
        if (this.parent) {
            this.parent.updateRootLayer();
        }
        if (this.layer) {
            this.layer.redraw = true;
        }
    }
    addChild(node) {
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        node.updateHierarchy();
        node.updateGlobalAlpha();
        this.childrens.push(node);
        this.updateRootLayer();
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
        this.updateRootLayer();
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
        this.childrens.forEach(children => children.updateHierarchy());
        this.transformUpdated = false;
    }
    updateTransform() {
        if (!this.transformUpdated) {
            if (this.parent) {
                this.globalTransform.concat(this.localTransform, this.parent.globalTransform);
            }
            else {
                this.globalTransform.copy(this.localTransform);
            }
            this.transformUpdated = true;
        }
    }
    updateGlobalTransform() {
        if (!this.transformUpdated) {
            this.hierarchy.forEach(children => children.updateTransform());
            this.updateTransform();
        }
    }
    ;
    updateVisible() {
        if (!this.visibleUpdated) {
            if (this.parent && this.parent.globalVisible === false) {
                this.globalVisible = false;
            }
            else {
                this.globalVisible = this.localVisible;
            }
            this.visibleUpdated = true;
        }
    }
    updateGlobalVisible() {
        if (!this.visibleUpdated) {
            this.hierarchy.forEach(children => children.updateVisible());
            this.updateVisible();
        }
    }
    updateGlobalAlpha() {
        if (this.parent) {
            this.globalAlpha = this.localAlpha * this.parent.globalAlpha;
        }
        else {
            this.globalAlpha = this.localAlpha;
        }
        this.childrens.forEach(children => children.updateGlobalAlpha());
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

class Layer {
    constructor(id, width, height) {
        this.root = new Sprite();
        this.redraw = false;
        this.maskX = 0;
        this.maskY = 0;
        this.maskLeftBound = 0;
        this.maskBottomBound = 0;
        this.root.layer = this;
        this.root.name = id;
        this.id = id;
        this.gameHeight = this.maskHeight = this.maskTopBound = height;
        this.gameWidth = this.maskWidth = this.maskRightBound = width;
    }
    set x(value) {
        this.maskX = value;
        this.updateMaskBounds();
    }
    get x() {
        return this.maskX;
    }
    set y(value) {
        this.maskY = value;
        this.updateMaskBounds();
    }
    get y() {
        return this.maskY;
    }
    set width(value) {
        this.maskWidth = value;
        this.updateMaskBounds();
    }
    get width() {
        return this.maskWidth;
    }
    set height(value) {
        this.maskHeight = value;
        this.updateMaskBounds();
    }
    get height() {
        return this.maskHeight;
    }
    updateMaskBounds() {
        this.maskLeftBound = this.maskX;
        this.maskRightBound = this.maskX + this.maskWidth;
        this.maskTopBound = this.gameHeight - this.maskY;
        this.maskBottomBound = this.gameHeight - (this.maskY + this.maskHeight);
    }
    addChild(sprite) {
        this.root.addChild(sprite);
        this.redraw = true;
        return sprite;
    }
    removeChild(sprite) {
        this.root.removeChild(sprite);
        this.redraw = true;
    }
    kill() {
        this.root.kill();
    }
}

const MAX_SPRITES = 100000;
const VERTEX_DATA_LENGTH = (4 + 4 + 3) * 4;
const INDEX_DATA_LENGTH = 6;
class Renderer {
    constructor(canvas) {
        this.layers = [];
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
        this.sceneWidth = this.canvas.width;
        this.sceneHeight = this.canvas.height;
        this.ratio = {
            x: 2 / this.canvas.width,
            y: 2 / this.canvas.height
        };
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
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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
                this.gl.uniform2f(this.vec2UniformLoc, this.ratio.x, this.ratio.y);
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
    getLayer(id) {
        let layer;
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id == id) {
                layer = this.layers[i];
            }
        }
        if (!layer) {
            layer = new Layer(id, this.sceneWidth, this.sceneHeight);
            this.layers.push(layer);
        }
        return layer;
    }
    removeLayer(id) {
        let layer;
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id == id) {
                layer = this.layers[i];
                this.layers.splice(i, 1);
            }
        }
        if (layer) {
            layer.kill();
        }
    }
    addTexture(image) {
        if (!image.id) {
            console.log("no texture id", image);
        }
        if (!this.gl) {
            console.log("addTexture error: no web bg contex");
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
        let i;
        let draw = true;
        for (i = 0; i < this.layers.length; i++) {
            if (this.layers[i].redraw) {
                draw = true;
            }
        }
        if (draw) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            for (i = 0; i < this.layers.length; i++) {
                let layer = this.layers[i];
                this.draw(layer.root, layer.maskX, layer.maskY);
                layer.redraw = false;
                this.drawTriangles();
            }
        }
    }
    draw(sprite, offsetX, offsetY) {
        sprite.updateGlobalVisible();
        if (sprite.globalVisible) {
            sprite.updateGlobalTransform();
            if (sprite.texture) {
                if (this.currentTexture != sprite.texture) {
                    this.drawTriangles();
                    this.addTexture(sprite.texture);
                    this.currentTexture = sprite.texture;
                }
                if (this.indexOffset >= this.indexData.length) {
                    this.drawTriangles();
                }
                if (!sprite.meshUpdated) {
                    sprite.updateMesh();
                }
                let vertexes = sprite.mesh.vertexes;
                let uv = sprite.mesh.uv;
                let tr = sprite.globalTransform;
                let i;
                for (i = 0; i < vertexes.length; i += 2) {
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
        }
        for (let k = 0; k < sprite.childrens.length; k++) {
            this.draw(sprite.childrens[k], offsetX, offsetY);
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

export { Layer, Renderer, Sprite, Transform };
