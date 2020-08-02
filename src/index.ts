import {Chip8} from './Chip8.js'
import {Chip8CanvasView} from './Chip8CanvasView.js'

document.getElementById("playBtn").onclick = play 
const scanvas = <HTMLCanvasElement> document.getElementById('screen')
const dcanvas = <HTMLCanvasElement> document.createElement('canvas')

async function play(){
  const romInput = document.getElementById("romInput") as HTMLInputElement
  const arrayBuffer = await readFileAsync(romInput.files[0]);
  const gameROM = new Uint8Array(arrayBuffer as ArrayBuffer)
  
  const chip8 = new Chip8(gameROM)
  const chip8CanvasView = new Chip8CanvasView(chip8, scanvas, dcanvas)

  window.setInterval(() => chip8.executeOp(), 1)
  window.setInterval(() => chip8.handleDT(), 1)
  window.setInterval(() => chip8.handleST(), 1)
  window.setInterval(() => chip8CanvasView.render(), 1)
  
  window.onkeydown = (event) => {
    if(!chip8.getKeyboardController().isPressed(event.key))
      chip8.getKeyboardController().addPressedKey(event.key)
  }

  window.onkeyup = (event) => {
    chip8.getKeyboardController().removePressedKey(event.key)
  }
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