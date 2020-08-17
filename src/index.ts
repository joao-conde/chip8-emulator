import {Chip8} from './Chip8.js'
import {Chip8CanvasView} from './Chip8CanvasView.js'
import {displayStoredROMs, getStoredROM} from './roms.js'

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
const clockFreq = 240 //Hz
const fps = 144 //frames per second

const chip8 = new Chip8(beepAudioPath)
const chip8CanvasView = new Chip8CanvasView(chip8, pixelSetColor, pixelUnsetColor)

const romSelector: HTMLSelectElement = document.querySelector("select#romSelector")
displayStoredROMs(romSelector);

(document.querySelector("button#playBtn") as HTMLButtonElement).onclick = play
async function play(){ 
  const arrayBuffer = await getStoredROM(romSelector.options[romSelector.selectedIndex].value);
  const gameROM = new Uint8Array(arrayBuffer as ArrayBuffer)
  chip8.init(beepAudioPath)  
  chip8.loadROM(gameROM)
}

window.onkeydown = (event) => {
  const kc = chip8.getKeyboardController()
  if(!kc.isActive(keyMapper[event.key])) kc.addActiveKey(keyMapper[event.key])
}
window.onkeyup = (event) => chip8.getKeyboardController().removeActiveKey(keyMapper[event.key])

window.setInterval(() => chip8.processOpcode(), 1000 / clockFreq)
window.setInterval(() => chip8.handleDT(), 1000 / delayTimerFreq)
window.setInterval(() => chip8.handleST(), 1000 / soundTimerFreq)
window.setInterval(() => chip8CanvasView.render(), 1000 / fps)
