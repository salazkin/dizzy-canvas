import { Sprite, Renderer } from "../dist/dizzy-canvas.js";

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
let maxX = renderer.sceneWidth;
let minX = 0;
let maxY = renderer.sceneHeight;
let minY = 0;
let gravity = 0.5;
let bunnysData = [];
let layer = renderer.getLayer("GameLayer");


let bunnyImg = new Image();
bunnyImg.src = "bunny.png";
bunnyImg.id = "bunny";
bunnyImg.addEventListener('load', () => {
    requestAnimationFrame(onEnterFrame);
}, false);
function onEnterFrame() {
    addTestBunnys();
    updateBunnys();
    renderer.present();
    requestAnimationFrame(onEnterFrame);
}
function addTestBunnys() {
    for (let i = 0; i < 10; i++) {
        let bunny = new Sprite();
        bunny.setTexture(bunnyImg);
        bunny.scaleX = bunny.scaleY = 0.5 + Math.random() * 0.5;
        bunny.rotation = (Math.random() - 0.5) * 360;
        layer.addChild(bunny);
        bunnysData.push({ bunny: bunny, speedX: Math.random() * 10, speedY: (Math.random() * 10) - 5 });
    }
}
;
function updateBunnys() {
    bunnysData.forEach(data => {
        let bunny = data.bunny;
        bunny.x += data.speedX;
        bunny.y += data.speedY;
        data.speedY += gravity;
        if (bunny.x > maxX) {
            data.speedX *= -1;
            bunny.x = maxX;
        }
        else if (bunny.x < minX) {
            data.speedX *= -1;
            bunny.x = minX;
        }
        if (bunny.y > maxY) {
            data.speedY *= -0.85;
            bunny.y = maxY;
            if (Math.random() > 0.5) {
                data.speedY -= Math.random() * 6;
            }
        }
        else if (bunny.y < minY) {
            data.speedY = 0;
            bunny.y = minY;
        }
    });
}
function onResize() {
    let sceneWidth = renderer.sceneWidth;
    let sceneHeight = renderer.sceneHeight;
    let stageWidth = window.innerWidth;
    let stageHeight = window.innerHeight;
    let scale = 1;
    if (stageWidth / stageHeight <= sceneWidth / sceneHeight) {
        scale = stageWidth / sceneWidth;
        updateGameContainer(0, (stageHeight - (sceneHeight * scale)) / 2, sceneWidth * scale, sceneHeight * scale);
    }
    else {
        scale = stageHeight / sceneHeight;
        updateGameContainer((stageWidth - (sceneWidth * scale)) / 2, 0, sceneWidth * scale, sceneHeight * scale);
    }
}
window.addEventListener('resize', onResize, false);
onResize();
function updateGameContainer(x, y, width, height) {
    document.body.style.position = "fixed";
    document.body.style.left = x.toFixed(2) + "px";
    document.body.style.top = y.toFixed(2) + "px";
    document.body.style.width = width.toFixed(0) + "px";
    document.body.style.height = height.toFixed(0) + "px";
}
