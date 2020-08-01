import {Chip8} from './Chip8.js'

document.getElementById("playBtn").onclick = play 

async function play(){
  const romInput = document.getElementById("romInput") as HTMLInputElement
  const arrayBuffer = await readFileAsync(romInput.files[0]);

  const chip8 = new Chip8()
  chip8.loadROM(new Uint8Array(arrayBuffer as ArrayBuffer)) 

  window.setInterval(() => chip8.executeOp(), 1)
  window.setInterval(() => chip8.handleDT(), 1)
  window.setInterval(() => chip8.handleST(), 1)
  window.setInterval(() => render(chip8), 1)
  
  window.onkeydown = (event) => {
    if(!chip8.keys.includes(keyMapper[event.key]))
        chip8.keys.push(keyMapper[event.key])
  }

  window.onkeyup = (event) => {
      chip8.keys.splice(chip8.keys.indexOf(keyMapper[event.key]), 1)
  }
}


//VIEW
const PIXEL_SET_COLOR = 0xFFFFFFFF  //white
const PIXEL_UNSET_COLOR = 0x000000FF //black
const width = 64
const height = 32
const scaledWidth = 640
const scaledHeight = 320
const xScale = scaledWidth / width
const yScale = scaledHeight / height

const scanvas = <HTMLCanvasElement> document.getElementById('screen')
const dcanvas = <HTMLCanvasElement> document.createElement('canvas')

const sctx = scanvas.getContext('2d')
const dctx = dcanvas.getContext('2d')

dcanvas.width = width
dcanvas.height = height
sctx.scale(xScale, yScale)
sctx.imageSmoothingEnabled = false

const image = dctx.createImageData(width, height)
const videoBuff = new DataView(image.data.buffer); //interface to manipulate pixels (R,G,B,A format i.e. 4 bytes or 32 bits)
function render(chip8: Chip8){
  for (let i = 0, j = 0; i < chip8.vram.length; i++, j += 4) {
      videoBuff.setUint32(j, chip8.vram[i] === 1 ? PIXEL_SET_COLOR : PIXEL_UNSET_COLOR);
  }
  dctx.putImageData(image, 0, 0)
  sctx.drawImage(dcanvas, 0, 0)
}
//


//User Input
const keyMapper = {
  "1": 0x1,
  "2": 0x2,
  "3": 0x3,
  "4": 0xC,
  "q": 0x4,
  "w": 0x5,
  "e": 0x6,
  "r": 0xD,
  "a": 0x7,
  "s": 0x8,
  "d": 0x9, 
  "f": 0xE,
  "z": 0xA,
  "x": 0x0,
  "c": 0xB,
  "v": 0xF
}

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  })
}