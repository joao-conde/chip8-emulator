import {Chip8} from './Chip8.js'
import {Chip8CanvasView} from './Chip8CanvasView.js'

(document.querySelector("button#playBtn") as HTMLButtonElement).onclick = play

const originalCanvas = <HTMLCanvasElement> document.querySelector('canvas#original')
const scaledCanvas = <HTMLCanvasElement> document.querySelector('canvas#scaled')

const xScale: number = scaledCanvas.width / originalCanvas.width
const yScale: number = scaledCanvas.height / originalCanvas.height

const octx: CanvasRenderingContext2D  = originalCanvas.getContext('2d')
const sctx: CanvasRenderingContext2D  = scaledCanvas.getContext('2d')

sctx.scale(xScale, yScale)
sctx.imageSmoothingEnabled = false

const pixelSetColor = 0xFFFFFFFF  //white
const pixelUnsetColor = 0x000000FF //black

let handlers: number[] = []
async function play(){
  octx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
  sctx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
  
  handlers.forEach(clearInterval)

  const romInput: HTMLInputElement = document.querySelector("input#rom")
  const arrayBuffer = await readFileAsync(romInput.files[0]);
  const gameROM = new Uint8Array(arrayBuffer as ArrayBuffer)
  
  const chip8 = new Chip8(gameROM)
  const chip8CanvasView = new Chip8CanvasView(chip8, scaledCanvas, originalCanvas, pixelSetColor, pixelUnsetColor)

  handlers = [
    window.setInterval(() => chip8.executeOp(), 10),
    window.setInterval(() => chip8.handleDT(), 1),
    window.setInterval(() => chip8.handleST(), 1),
    window.setInterval(() => chip8CanvasView.render(), 1),
  ]

  window.onkeydown = (event) => {
    if(!chip8.getKeyboardController().isPressed(event.key))
      chip8.getKeyboardController().addPressedKey(event.key)
  }

  window.onkeyup = (event) => {
    chip8.getKeyboardController().removePressedKey(event.key)
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
