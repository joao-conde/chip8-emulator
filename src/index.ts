import {Chip8} from './Chip8.js'
import {Chip8CanvasView} from './Chip8CanvasView.js'

const pixelSetColor = 0xFFFFFFFF  //white
const pixelUnsetColor = 0x000000FF //black
const beepAudioPath = "res/beep.mp3"
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

const delayTimerFreq = 60 //Hz
const soundTimerFreq = 60 //Hz
const clockFreq = 500 //Hz
const fps = 144 //frames per second

const chip8 = new Chip8(beepAudioPath)
const chip8CanvasView = new Chip8CanvasView(chip8, pixelSetColor, pixelUnsetColor)

async function play(){ 
  const romInput: HTMLInputElement = document.querySelector("input#rom")
  const arrayBuffer = await getInputFile(romInput.files[0]);
  
  // const romInput: HTMLSelectElement = document.querySelector("select#romSelector")
  // const arrayBuffer = await getStoredROM(romInput.options[romInput.selectedIndex].value);
  
  const gameROM = new Uint8Array(arrayBuffer as ArrayBuffer)
  
  chip8.init(beepAudioPath)  
  chip8.loadROM(gameROM)
}

(document.querySelector("button#playBtn") as HTMLButtonElement).onclick = play

window.onkeydown = (event) => {
  const kc = chip8.getKeyboardController()
  if(!kc.isActive(keyMapper[event.key])) kc.addActiveKey(keyMapper[event.key])
}
window.onkeyup = (event) => chip8.getKeyboardController().removeActiveKey(keyMapper[event.key])

window.setInterval(() => chip8.processOpcode(), 1000 / clockFreq)
window.setInterval(() => chip8.handleDT(), 1000 / delayTimerFreq)
window.setInterval(() => chip8.handleST(), 1000 / soundTimerFreq)
window.setInterval(() => chip8CanvasView.render(), 1000 / fps)

function getStoredROM(rom: string): Promise<ArrayBuffer|string> {
  return new Promise(resolve => {
    const request = new XMLHttpRequest();
    request.open("GET", `res/roms/${rom}`, true); 
    request.responseType = 'arraybuffer'
    request.onload = () => {
      const result = request.response as ArrayBuffer; 
      resolve(result)
    }
    request.send()
  })
}

function getInputFile(file: File): Promise<ArrayBuffer|string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsArrayBuffer(file);
  })
}


const storedROMs = [
  "Blitz.ch8",
  "Breakout.ch8",
  "Brix.ch8",
  "Connect4.ch8",
  "Flightrunner.ch8",
  "Hidden.ch8",
  "Merlin.ch8",
  "Missile.ch8",
  "Outlaw.ch8",
  "Pong.ch8",
  "Space Invaders.ch8",
  "Tank.ch8",
  "Tetris.ch8",
  "TicTac.ch8",
  "UFO.ch8",
  "Vers.ch8"
]

const romSelector: HTMLSelectElement = document.querySelector("select#romSelector")
storedROMs.forEach(romName => {
  const option: HTMLOptionElement = document.createElement("option")
  option.value = romName
  option.text = romName
  romSelector.add(option)
})