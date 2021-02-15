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
    dude1.setPosition(340, 300);
    dude1.setScale(2);
    dude1.setAnchor(0.5);
    dude1.setBlendMode(Renderer.BLEND_MODE.ADD);
    bg.addChild(dude1);

    const dude2 = new Sprite(dudeImg);
    dude2.setPosition(460, 300);
    dude2.setScale(2);
    dude2.setAnchor(0.5);
    dude2.setBlendMode("add");
    bg.addChild(dude2);

    const dude3 = new Sprite(dudeImg);
    dude3.setPosition(400, 400);
    dude3.setScale(2);
    dude3.setAnchor(0.5);
    dude3.setBlendMode(Renderer.BLEND_MODE.MULTIPLY);
    bg.addChild(dude3);

    new Timer(() => {
        dude1.rotation += 1;
        dude2.rotation += 1.5;
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
