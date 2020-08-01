import {Chip8AudioController} from './Chip8AudioController.js'
import {Chip8KeyboardController} from './Chip8KeyboardController.js'

export class Chip8 {
  private vram: Uint8Array
  private ram: Uint8Array
  private registers: Uint8Array
  private stack: Int16Array
  private I: number
  private DT: number
  private ST: number
  private PC: number
  private SP: number 

  private audioController: Chip8AudioController
  private keyboardController: Chip8KeyboardController
  
  public constructor() {
    this.vram = new Uint8Array(64 * 32)
    this.ram = new Uint8Array(4096)
    this.registers = new Uint8Array(16)
    this.I = 0
    this.DT = 0
    this.ST = 0
    this.PC = 0x200
    this.SP = 0
    this.stack = new Int16Array(16)

    this.audioController = new Chip8AudioController("src/beep.mp3")
    this.keyboardController = new Chip8KeyboardController()

    this.loadFont()
  } 

  public loadROM(rom: Uint8Array) {
    this.ram.set(rom, 0x200) // load rom into memory
  }

  public executeOp() {
    const opcode = this.ram[this.PC] << 8 | this.ram[this.PC+1]
    const id = opcode & 0xF000
    const addr = opcode & 0x0FFF
    const nibble = opcode & 0x000F
    const x = opcode >> 8 & 0xF //x needs to be a single hexadecimal digit to access registers
    const y = opcode >> 4 & 0xF //y needs to be a single hexadecimal digit to access registers
    const byte = opcode & 0x00FF
    
    this.PC += 2 // take two opcodes from ROM
    switch(id){
        case 0x0000:
            switch(byte){
                case 0xE0:
                    this.vram = this.vram.map(_ => 0x00)
                    break
                case 0xEE:
                    this.SP--
                    this.PC = this.stack[this.SP]
                    break
            }    
            break
        
        case 0x1000:
            this.PC = addr
            break
        
        case 0x2000:
            this.stack[this.SP] = this.PC
            this.SP++
            this.PC = addr
            break

        case 0x3000:
            if(this.registers[x] == byte) this.PC += 2
            break
        
        case 0x4000:
            if(this.registers[x] != byte) this.PC += 2
            break
        
        case 0x5000:
            if(this.registers[x] == this.registers[y]) this.PC += 2
            break
        
        case 0x6000:
            this.registers[x] = byte
            break

        case 0x7000:
            this.registers[x] += byte
            break
        
        case 0x8000:
            switch(nibble){
                case 0x0:
                    this.registers[x] = this.registers[y]
                    break
                case 0x1:
                    this.registers[x] |= this.registers[y]
                    break
                case 0x2:
                    this.registers[x] &= this.registers[y]
                    break
                case 0x3:
                    this.registers[x] ^= this.registers[y]
                    break
                case 0x4:
                    this.registers[0xF] = this.registers[x] + this.registers[y] > 0xFF ? 1 : 0
                    this.registers[x] += this.registers[y]
                    break
                case 0x5:
                    this.registers[0xF] = this.registers[x] > this.registers[y] ? 1 : 0
                    this.registers[x] -= this.registers[y]
                    break
                case 0x6:
                    this.registers[0xF] = this.registers[x] & 0x01
                    this.registers[x] >>= 1
                    break
                case 0x7:
                    this.registers[0xF] = this.registers[y] > this.registers[x] ? 1 : 0
                    this.registers[x] = this.registers[y] - this.registers[x]
                    break
                case 0xE:
                    this.registers[0xF] = (this.registers[x] & 0x80) >> 7
                    this.registers[x] <<= 1 
                    break
            }
            break
        
        case 0x9000:
            if(this.registers[x] != this.registers[y]) this.PC += 2
            break
        
        case 0xA000:
            this.I = addr
            break

        case 0xB000:
            this.PC = addr + this.registers[0]
            break

        case 0xC000:
            this.registers[x] = byte & Math.floor(Math.random() * 0xFF)
            break
        
        case 0xD000:
            this.registers[0xF] = this.drawSprite(this.registers[x], this.registers[y], nibble)
            break

        case 0xE000:
            switch(byte){
                case 0x9E:
                    if(this.keyboardController.isPressed(this.registers[x])) this.PC += 2
                    break
                case 0xA1:
                    if(!this.keyboardController.isPressed(this.registers[x])) this.PC += 2
                    break
            }
            break
        
        case 0xF000:
            switch(byte){
                case 0x07:
                    this.registers[x] = this.DT
                    break
                case 0x0A:
                    if(!this.keyboardController.noKeyPressed())
                        this.registers[x] = this.keyboardController.getLastKeyPressed()
                    else  
                        this.PC -= 2
                    break
                case 0x15:
                    this.DT = this.registers[x]
                    break
                case 0x18:
                    this.ST = this.registers[x]
                    break
                case 0x1E:
                    this.I += this.registers[x] 
                    break
                case 0x29:
                    this.I = this.registers[x] * 5 //(8(1Byte) x 5 sprites)
                    break
                case 0x33:
                    this.ram[this.I] = Math.floor(this.registers[x] / 100)
                    this.ram[this.I+1] = Math.floor(this.registers[x] / 10) % 10
                    this.ram[this.I+2] = this.registers[x] % 10
                    break
                case 0x55:
                    for(let i = 0; i <= x; i++){
                        this.ram[this.I + i] = this.registers[i]
                    }
                    break
                case 0x65:
                    for(let i = 0; i <= x; i++){
                        this.registers[i] = this.ram[this.I + i]
                    }
                    break
            }
            break

        default:
            console.log("Panic, instruction not recognized!")
    }
  }

  public handleDT(){
    if(this.DT > 0) this.DT--
  }

  public handleST(){
    if(this.ST > 0) {
      this.audioController.beep()
      this.ST--
    }
  }

  public getVRAM() {
    return this.vram
  }

  public getKeyboardController() {
    return this.keyboardController
  }

  private loadFont() {
    const fontSet = [ 
      0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
      0x20, 0x60, 0x20, 0x20, 0x70, // 1
      0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
      0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
      0x90, 0x90, 0xF0, 0x10, 0x10, // 4
      0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
      0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
      0xF0, 0x10, 0x20, 0x40, 0x40, // 7
      0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
      0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
      0xF0, 0x90, 0xF0, 0x90, 0x90, // A 
      0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
      0xF0, 0x80, 0x80, 0x80, 0xF0, // C
      0xE0, 0x90, 0x90, 0x90, 0xE0, // D
      0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
      0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    this.ram.set(fontSet, 0x00)
  }

  private drawSprite(x0: number, y0: number, height: number){
    let collision = 0
    
    for (let y = 0; y < height; y += 1) {
        const sprite = this.ram[this.I + y]
        for (let x = 0; x < 8; x += 1) {
            if((sprite & (0x80 >> x)) != 0){
                if(this.vram[x0 + x + ((y0 + y) * 64)] == 1)
                  collision = 1
                this.vram[x0 + x + ((y0 + y) * 64)] ^= 1
            }
        } 
    }

    return collision
  }
}