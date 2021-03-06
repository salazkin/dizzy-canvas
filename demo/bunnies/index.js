import { Sprite, Renderer, Timer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

const maxX = renderer.sceneWidth;
const minX = 0;
const maxY = renderer.sceneHeight;
const minY = 0;
const gravity = 0.5;
const bunniesData = [];

const bunnyImg = new Image();
bunnyImg.src = "../assets/bunny.png";
bunnyImg.id = "bunny";
bunnyImg.addEventListener('load', () => {
    new Timer(() => {
        addTestBunnies();
        updateBunnies();
        renderer.present();
    }).start();
});

function addTestBunnies() {
    for (let i = 0; i < 10; i++) {
        const bunny = new Sprite(bunnyImg);
        bunny.scaleX = bunny.scaleY = 0.5 + Math.random() * 0.5;
        bunny.rotation = (Math.random() - 0.5) * 360;
        renderer.stage.addChild(bunny);
        bunniesData.push({ bunny: bunny, speedX: Math.random() * 10, speedY: (Math.random() * 10) - 5 });
    }
}

function updateBunnies() {
    bunniesData.forEach(data => {
        const bunny = data.bunny;
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
