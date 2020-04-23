import { Sprite, Renderer, Timer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

let bunnyImg = new Image();
bunnyImg.src = "../assets/bunny.png";
bunnyImg.id = "bunny";

bunnyImg.addEventListener('load', () => {
    let bunny = new Sprite(bunnyImg);
    bunny.x = 400;
    bunny.y = 300;
    bunny.scaleX = bunny.scaleY = 3;
    bunny.setAnchor(0.5, 0.5);
    renderer.stage.addChild(bunny);

    new Timer(() => {
        bunny.rotation++;
        renderer.present();
    }).start();
}, false);
