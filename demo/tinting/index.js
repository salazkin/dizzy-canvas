import { Sprite, Renderer, Timer } from "../../dist/dizzy-canvas.js";

const renderer = new Renderer(document.getElementById("canvas"));

const container = renderer.stage.addChild(new Sprite());

createSprites();
async function createSprites() {
    const bgImg = await loadImg("bg", "../assets/bg.jpg");
    const dudeImg = await loadImg("dude", "../assets/dude.png");

    const bg = new Sprite(bgImg);
    container.addChild(bg);

    const dude1 = new Sprite(dudeImg);
    dude1.setPosition(400, 300);
    dude1.setScale(2);
    dude1.setAnchor(0.5);
    dude1.setTint(0xff00ff, 0);

    renderer.stage.addChild(dude1);

    const tint = dude1.getTint();
    let a = 0;

    new Timer(() => {

        tint[3] = Math.sin(a);

        a += 0.05;
        if (a > Math.PI) { a = 0; }

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
