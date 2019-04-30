import { Vector, dotProduct, indexFromVector, vectorFromIndex, bilinearInterpolation } from "./vectors.js"

/*
perlin noise: random noise where each point is related to the points around it
  three steps:
  1. create grid
    the grid has to be fewer points than the end result array (a 256x256 end result would want something between 8x8 and 64x64)
    this grid needs random normalized vectors on each node
  2. dot products for each point
    each point in the end result must have dot product for the surrounding 4 and the directional vector from large grid node to specific end result square (in 2d space) calculated (four dot products):
      dot product of two vectors = v1.x * v2.x + v1.y * v2.y
  3. bilinear interpolation of the four dot products to the end result point (better images with cosine interpolation)
  4. perlin noise actually uses a fade function--after final color is determined it is faded by the function: 6t^5 - 15t^4 + 10t^3
*/

function fade(value) {
  return ((6 * Math.pow(value, 5)) - (15 * Math.pow(value, 4)) + (10 * Math.pow(value, 3)));
}

function createOverlay(detail) {
  let randomVecs = {
    0: new Vector(1, 0), 
    1: new Vector(-1, 0), 
    2: new Vector(0, 1),
    3: new Vector(0, -1),
    4: new Vector(Math.sqrt(.5), Math.sqrt(.5)),
    5: new Vector(-Math.sqrt(.5), Math.sqrt(.5)),
    6: new Vector(Math.sqrt(.5), -Math.sqrt(.5)),
    7: new Vector(-Math.sqrt(.5), -Math.sqrt(.5))
  };

  let overlay = new Array(Math.pow(detail + 1, 2));
  for (let i = 0; i < overlay.length; i++) {
    overlay[i] = randomVecs[Math.floor(8 * Math.random())];
  }

  return overlay;
}

function generatePerlinArray(w, h, detail) {
  let perlinArray = new Uint8Array(w * h);

  // create a big overlay grid with random vectors
  let overlay = createOverlay(detail);

  //dot products, bilinear interpolation, and fade for each point
  for (let i = 0; i < w * h; i++) {

    let v = vectorFromIndex(i, w);

    //get x & y relative to big grid--this should always be between 0 & 1
    let relativeX = (v.x % Math.floor(w/detail))/(w/detail);
    let relativeY = (v.y % Math.floor(w/detail))/(w/detail);
    let relativeVector = new Vector(relativeX, relativeY);
    
    //get dot products
    let dPs = getDotProducts(v, w, relativeVector, overlay, detail);

    //bilinear interpolation of point from four corners
    let bI = bilinearInterpolation(relativeVector, ...dPs);
    bI = (bI + 1)/2;
    //fade value
    let gradient = fade(bI) * 255;
    //gradient = 6 * Math.pow(gradient, 5) - 15 * Math.pow(gradient, 4) + 10 * Math.pow(gradient, 3);
    //gradient = 6 * gradient - 15 * gradient + 10 * Math.pow(gradient, 3);
    //add value to small grid array
    perlinArray[i] = bI * 255;
  }
  return perlinArray;
}

function getDotProducts(v, w, relativeVector, overlay, detail) {
  //get big grid top left coord  -- this is where the problem is: the detail has an extra column/row and the overlayX/Y is getting fucked up
  let overlayX = Math.floor(v.x / detail + 1);
  let overlayY = Math.floor(v.y / detail + 1);

  //define four corners:
  let indexTL = overlayX + (overlayY * (detail + 1));
  let indexTR = overlayX + 1 + (overlayY * (detail + 1));
  let indexBL = overlayX + ((overlayY + 1) * (detail + 1));
  let indexBR = overlayX + 1 + ((overlayY + 1) * (detail + 1));

  let vTL = overlay[indexTL];
  let vTR = overlay[indexTR];
  let vBL = overlay[indexBL];
  let vBR = overlay[indexBR];

  if (!vBR) console.log(v, w, relativeVector, overlay, detail, indexTL, indexTR, indexBL, indexBR, overlayX, overlayY);
  //dot products for four corners:
  let dP1 = dotProduct(new Vector(relativeVector.x, relativeVector.y), vTL);
  let dP2 = dotProduct(new Vector((1 - relativeVector.x), relativeVector.y), vTR);
  let dP3 = dotProduct(new Vector(relativeVector.x, (1 - relativeVector.y)), vBL);
  let dP4 = dotProduct(new Vector((1 - relativeVector.x), (1 - relativeVector.y)), vBR);
  return [dP1, dP2, dP3, dP4];
}

export default generatePerlinArray;