import { Sprite, Renderer } from "../../dist/dizzy-canvas.js";

const canvas = document.createElement('canvas');
canvas.style.position = "absolute";
canvas.style.left = "0%";
canvas.style.top = "0%";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.width = 800;
canvas.height = 600;

document.body.appendChild(canvas);

const renderer = new Renderer(canvas);

let container = renderer.stage.addChild(new Sprite());
container.x = 300;
container.y = 500;
container.name = "Container";

let rect1;
let rect2;
let boundsSprite;

createSprites();
async function createSprites() {
    let img1 = await drawCanvasSprite("rect1", 100, 50, "#ff0000");
    rect1 = new Sprite(img1)

    rect1.x = rect1.width * -0.5;
    rect1.y = rect1.height * -0.5;
    rect1.name = "rect1";
    container.addChild(rect1);

    let img2 = await drawCanvasSprite("rect2", 100, 50, "#00ff00");
    rect2 = new Sprite(img2)

    rect2.x = 50;
    rect2.y = 100;
    rect2.rotation = 45;
    rect2.name = "rect2";
    rect1.addChild(rect2);

    let img3 = await drawCanvasSprite("bounds", 5, 5, "#ffffff66");
    boundsSprite = renderer.stage.addChild(new Sprite(img3));
    boundsSprite.name = "boundsSprite";

    requestAnimationFrame(onEnterFrame);
}

function onEnterFrame() {
    container.rotation += 1;

    let bounds = rect1.getBounds();
    boundsSprite = Object.assign(boundsSprite, bounds);

    renderer.present();

    requestAnimationFrame(onEnterFrame);
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

function onResize() {
    renderer.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onResize, false);
onResize();

