import { Sprite, Renderer, Timer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

const container = renderer.stage.addChild(new Sprite());

createSprites();
async function createSprites() {
    let bgImg = await loadImg("bg", "../assets/bg.jpg");
    let dudeImg = await loadImg("dude", "../assets/dude.png");
    let boundsImg = await drawCanvasSprite("bounds", 5, 5, "#ffffff");

    container.addChild(new Sprite(bgImg));

    let bounds = new Sprite(boundsImg);
    bounds.alpha = 0.2;
    container.addChild(bounds);

    const dude = new Sprite(dudeImg);
    dude.setPosition(400, 300)
    dude.setAnchor(0.5);
    dude.setScale(2);
    container.addChild(dude);

    new Timer(() => {
        dude.rotation++;
        bounds = Object.assign(bounds, dude.getBounds());
        renderer.present();
    }).start();
}

function loadImg(id, src) {
    let img = new Image();
    img.id = id;
    img.src = src;
    return new Promise(resolve => {
        img.addEventListener("load", () => { resolve(img) });
    });
}

function drawCanvasSprite(id, width, height, color) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    let context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    let img = new Image();
    img.id = id;
    img.src = canvas.toDataURL("image/png");

    return new Promise(resolve => {
        img.addEventListener("load", () => { resolve(img) });
    });
}
