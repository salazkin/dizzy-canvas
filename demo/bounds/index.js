import { Sprite, Renderer, Timer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

const container = renderer.stage.addChild(new Sprite());

createSprites();
async function createSprites() {
    const bgImg = await loadImg("bg", "../assets/bg.jpg");
    const dudeImg = await loadImg("dude", "../assets/dude.png");
    const boundsImg = await drawCanvasSprite("bounds", 5, 5, "#ffffff");

    container.addChild(new Sprite(bgImg));

    const bounds = new Sprite(boundsImg);
    bounds.alpha = 0.2;
    container.addChild(bounds);

    const dude = new Sprite(dudeImg);
    dude.setPosition(400, 300);
    dude.setAnchor(0.5);
    dude.setScale(2);
    container.addChild(dude);

    new Timer(() => {
        dude.rotation++;
        const boundsRect = dude.getBounds();
        bounds.x = boundsRect.x;
        bounds.y = boundsRect.y;
        bounds.width = boundsRect.width;
        bounds.height = boundsRect.height;
        renderer.present();
    }).start();
}

function loadImg(id, src) {
    const img = new Image();
    img.id = id;
    img.src = src;
    return new Promise(resolve => {
        img.addEventListener("load", () => { resolve(img); });
    });
}

function drawCanvasSprite(id, width, height, color) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    const img = new Image();
    img.id = id;
    img.src = canvas.toDataURL("image/png");

    return new Promise(resolve => {
        img.addEventListener("load", () => { resolve(img); });
    });
}
