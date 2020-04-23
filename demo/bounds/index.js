import { Sprite, Renderer, Timer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

const container = renderer.stage.addChild(new Sprite());

const rect1 = new Sprite();
rect1.x = 400;
rect1.y = 300;
rect1.setAnchor(0.5, 0.5);
rect1.skewX = 0.5;
rect1.scaleX = 1.5;
rect1.scaleY = 1.5;
container.addChild(rect1);

const rect2 = new Sprite();
rect2.x = 50;
rect2.y = 50;
rect2.rotation = 45;
rect1.addChild(rect2);

let boundsSprite = new Sprite();
renderer.stage.addChild(boundsSprite);

createSprites();
async function createSprites() {
    let img1 = await drawCanvasSprite("rect1", 100, 50, "#ff0000");
    rect1.setTexture(img1);

    let img2 = await drawCanvasSprite("rect2", 100, 50, "#00ff00");
    rect2.setTexture(img2);

    let img3 = await drawCanvasSprite("bounds", 5, 5, "#ffffff66");
    boundsSprite.setTexture(img3);

    new Timer(() => {
        rect1.rotation++;

        let bounds = rect1.getBounds();
        boundsSprite = Object.assign(boundsSprite, bounds);

        renderer.present();
    }).start();
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
