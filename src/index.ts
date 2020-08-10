import {Chip8} from './Chip8.js'
import {Chip8CanvasView} from './Chip8CanvasView.js'

(document.querySelector("button#playBtn") as HTMLButtonElement).onclick = play

const pixelSetColor = 0xFFFFFFFF  //white
const pixelUnsetColor = 0x000000FF //black
const beepAudioPath = "res/beep.mp3"


const originalCanvas = <HTMLCanvasElement> document.querySelector('canvas#original')
const scaledCanvas = <HTMLCanvasElement> document.querySelector('canvas#scaled')

const octx: CanvasRenderingContext2D  = originalCanvas.getContext('2d')
const sctx: CanvasRenderingContext2D  = scaledCanvas.getContext('2d')

sctx.scale(scaledCanvas.width / originalCanvas.width, scaledCanvas.height / originalCanvas.height)
sctx.imageSmoothingEnabled = false

const chip8 = new Chip8(beepAudioPath)
const chip8CanvasView = new Chip8CanvasView(chip8, scaledCanvas, originalCanvas, pixelSetColor, pixelUnsetColor)

let handlers: number[] = []
async function play(){
  octx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  sctx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
  
  handlers.forEach(clearInterval)

  const romInput: HTMLInputElement = document.querySelector("input#rom")
  const arrayBuffer = await readFileAsync(romInput.files[0]);
  const gameROM = new Uint8Array(arrayBuffer as ArrayBuffer)
  
  chip8.init(beepAudioPath)  
  chip8.loadROM(gameROM)

  handlers = [
    window.setInterval(() => chip8.processOpcode(), 10),
    window.setInterval(() => chip8.handleDT(), 1),
    window.setInterval(() => chip8.handleST(), 1),
    window.setInterval(() => chip8CanvasView.render(), 1),
  ]

  window.onkeydown = (event) => {
    const kc = chip8.getKeyboardController()
    if(!kc.isActive(keyMapper[event.key])) kc.addActiveKey(keyMapper[event.key])
  }

  window.onkeyup = (event) => {
    chip8.getKeyboardController().removeActiveKey(keyMapper[event.key])
  }
}

function readFileAsync(file: File): Promise<ArrayBuffer|string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsArrayBuffer(file);
  })
}

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

// let arrayBuffer
// var oReq = new XMLHttpRequest();
// oReq.open("GET", "res/roms/BC_test.ch8", true);
// oReq.responseType = "arraybuffer";
// oReq.onload = function(e) {
//   arrayBuffer = oReq.response; 
// }
// oReq.send();