import perlinNoise from "./modules/perlin.js";
import { outlineCircle, solidCircle, Color } from "./modules/drawing.js";

function startApp() {
  const canvas1 = document.getElementById('canvas1');
  const W = canvas1.width = 512;
  const H = canvas1.height = W;
  const ctx = canvas1.getContext("2d");
  const RADIUS = W/3;
  const STEPS = 360;
  let step = 0;

  const canvas2 = document.getElementById('canvas2');
  canvas2.width = 255;
  canvas2.height = 12;

  let imageData = ctx.getImageData(0, 0, W, H);
  let data = imageData.data;
  let elev = perlinNoise(W, H, 16, 16);  //Uint8Array(W * H);

  window.setInterval(tick, 20);
  function findCircleX() {return RADIUS * Math.cos(Math.PI * step/STEPS) + W/2;}
  function findCircleY() {return RADIUS * Math.sin(Math.PI * step/STEPS) + H/2;}

  function tick() {
    step++;
    if (step >= STEPS*2) step = 0;
    ctx.clearRect(0, 0, W, H);
    printBackground();
    let x = Math.floor(findCircleX());
    let y = Math.floor(findCircleY());
    solidCircle(x, y, 5, new Color(255, 255, 255).returnRGB(), ctx);
    let gN = elev[y * W + x];
    const ctx2 = canvas2.getContext("2d");
    ctx2.clearRect(0, 0, 255, 12);
    solidCircle(gN, 6, 5, new Color(40,40,40).returnRGB(), ctx2);
  }

  function printBackground() {
    for (let i = 0; i < data.length; i += 4) {
      //    this puts a red grid overlay so you can see the unit grid
      //    if ((i/4) % 32 === 0 || Math.floor((i/4)/512) % 32 === 0) {
      //      data[i] = 255;
      //      data[i + 1] = 0;
      //      data[i + 2] = 0;
      //    } else {
      data[i] = data[i + 1] = data[i + 2] = elev[i/4];
      //    }
      data[i + 3] = 255;
    };
    ctx.putImageData(imageData, 0, 0);
  }
}

export default startApp;
