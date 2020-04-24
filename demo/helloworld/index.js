import { Sprite, Renderer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

let dudeImg = new Image();
dudeImg.src = "../assets/dude.png";
dudeImg.id = "dude";

dudeImg.addEventListener('load', () => {
    renderer.stage.addChild(new Sprite(dudeImg));
    renderer.present();
}, false);
