type Chip8Type = {
    videoMem: Uint8Array,
    mem: Uint8Array,
    vRegisters: Uint8Array,
    keyboard: Array<number>,
    I: number,
    delay: number,
    sound: number,
    pc: number,
    sp: number,
    stack: Int16Array
}

//VIEW using 2 canvas to scale the image
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
//

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


function render(chip8: Chip8Type){
    for (let i = 0, j = 0; i < chip8.videoMem.length; i++, j += 4) {
        videoBuff.setUint32(j, chip8.videoMem[i] === 1 ? PIXEL_SET_COLOR : PIXEL_UNSET_COLOR);
    }
    dctx.putImageData(image, 0, 0)
    sctx.drawImage(dcanvas, 0, 0)
}

function drawSprite(chip8: Chip8Type, x0: number, y0: number, height: number){
    let collision = 0
    
    for (let y = 0; y < height; y += 1) {
        const sprite = chip8.mem[chip8.I + y]
        for (let x = 0; x < 8; x += 1) {
            if((sprite & (0x80 >> x)) != 0){
                if(chip8.videoMem[x0 + x + ((y0 + y) * width)] == 1)
                    collision = 1
                chip8.videoMem[x0 + x + ((y0 + y) * width)] ^= 1
            }
        } 
    }

    return collision
}

function execute(chip8: Chip8Type){
    const opcode = chip8.mem[chip8.pc] << 8 | chip8.mem[chip8.pc+1]
    const id = opcode & 0xF000
    const addr = opcode & 0x0FFF
    const nibble = opcode & 0x000F
    const x = opcode >> 8 & 0xF //x needs to be a single hexadecimal digit to access registers
    const y = opcode >> 4 & 0xF //y needs to be a single hexadecimal digit to access registers
    const byte = opcode & 0x00FF
    
    chip8.pc += 2 // take two opcodes from ROM
    switch(id){
        case 0x0000:
            switch(byte){
                case 0xE0:
                    chip8.videoMem = chip8.videoMem.map(_ => 0x00)
                    break
                case 0xEE:
                    chip8.sp--
                    chip8.pc = chip8.stack[chip8.sp]
                    break
            }    
            break
        
        case 0x1000:
            chip8.pc = addr
            break
        
        case 0x2000:
            chip8.stack[chip8.sp] = chip8.pc
            chip8.sp++
            chip8.pc = addr
            break

        case 0x3000:
            if(chip8.vRegisters[x] == byte) chip8.pc += 2
            break
        
        case 0x4000:
            if(chip8.vRegisters[x] != byte) chip8.pc += 2
            break
        
        case 0x5000:
            if(chip8.vRegisters[x] == chip8.vRegisters[y]) chip8.pc += 2
            break
        
        case 0x6000:
            chip8.vRegisters[x] = byte
            break

        case 0x7000:
            chip8.vRegisters[x] += byte
            break
        
        case 0x8000:
            switch(nibble){
                case 0x0:
                    chip8.vRegisters[x] = chip8.vRegisters[y]
                    break
                case 0x1:
                    chip8.vRegisters[x] |= chip8.vRegisters[y]
                    break
                case 0x2:
                    chip8.vRegisters[x] &= chip8.vRegisters[y]
                    break
                case 0x3:
                    chip8.vRegisters[x] ^= chip8.vRegisters[y]
                    break
                case 0x4:
                    chip8.vRegisters[0xF] = chip8.vRegisters[x] + chip8.vRegisters[y] > 0xFF ? 1 : 0
                    chip8.vRegisters[x] += chip8.vRegisters[y]
                    break
                case 0x5:
                    chip8.vRegisters[0xF] = chip8.vRegisters[x] > chip8.vRegisters[y] ? 1 : 0
                    chip8.vRegisters[x] -= chip8.vRegisters[y]
                    break
                case 0x6:
                    chip8.vRegisters[0xF] = chip8.vRegisters[x] & 0x01
                    chip8.vRegisters[x] >>= 1
                    break
                case 0x7:
                    chip8.vRegisters[0xF] = chip8.vRegisters[y] > chip8.vRegisters[x] ? 1 : 0
                    chip8.vRegisters[x] = chip8.vRegisters[y] - chip8.vRegisters[x]
                    break
                case 0xE:
                    chip8.vRegisters[0xF] = (chip8.vRegisters[x] & 0x80) >> 7
                    chip8.vRegisters[x] <<= 1 
                    break
            }
            break
        
        case 0x9000:
            if(chip8.vRegisters[x] != chip8.vRegisters[y]) chip8.pc += 2
            break
        
        case 0xA000:
            chip8.I = addr
            break

        case 0xB000:
            chip8.pc = addr + chip8.vRegisters[0]
            break

        case 0xC000:
            chip8.vRegisters[x] = byte & Math.floor(Math.random() * 0xFF)
            break
        
        case 0xD000:
            chip8.vRegisters[0xF] = drawSprite(chip8, chip8.vRegisters[x], chip8.vRegisters[y], nibble)
            break

        case 0xE000:
            switch(byte){
                case 0x9E:
                    if(chip8.keyboard.includes(chip8.vRegisters[x])) chip8.pc += 2
                    break
                case 0xA1:
                    if(!chip8.keyboard.includes(chip8.vRegisters[x])) chip8.pc += 2
                    break
            }
            break
        
        case 0xF000:
            switch(byte){
                case 0x07:
                    chip8.vRegisters[x] = chip8.delay
                    break
                case 0x0A:
                    if(chip8.keyboard.length !== 0){
                        const lastKeyPressed = chip8.keyboard.pop()
                        chip8.keyboard.unshift(lastKeyPressed)
                        chip8.vRegisters[x] = lastKeyPressed
                    } 
                    else  
                        chip8.pc -= 2
                    break
                case 0x15:
                    chip8.delay = chip8.vRegisters[x]
                    break
                case 0x18:
                    chip8.sound = chip8.vRegisters[x]
                    break
                case 0x1E:
                    chip8.I += chip8.vRegisters[x]
                    break
                case 0x29:
                    chip8.I = chip8.vRegisters[x] * 5 //(8(1Byte) x 5 sprites)
                    break
                case 0x33:
                    chip8.mem[chip8.I] = Math.floor(chip8.vRegisters[x] / 100)
                    chip8.mem[chip8.I+1] = Math.floor(chip8.vRegisters[x] / 10) % 10
                    chip8.mem[chip8.I+2] = chip8.vRegisters[x] % 10
                    break
                case 0x55:
                    for(let i = 0; i <= x; i++){
                        chip8.mem[chip8.I + i] = chip8.vRegisters[i]
                    }
                    break
                case 0x65:
                    for(let i = 0; i <= x; i++){
                        chip8.vRegisters[i] = chip8.mem[chip8.I + i]
                    }
                    break
            }
            break

        default:
            console.log("Panic, instruction not recognized!")
    }

    if(chip8.delay > 0) chip8.delay--

    if(chip8.sound > 0) {
        if(chip8.sound)
            console.log("Beep!")
        chip8.sound--
    }
}

document.getElementById("playBtn").onclick = function(e) {
    loadROM()
}

function loadROM(){
    const romInput = document.getElementById("romInput") as HTMLInputElement
    const fr = new FileReader()
    fr.onload = () => {const rom = new Uint8Array(fr.result as ArrayBuffer); play(rom)}
    fr.readAsArrayBuffer(romInput.files[0])
}

function play(rom){
    const chip8: Chip8Type = {
        videoMem: new Uint8Array(width * height), //active and not active bits (0s and 1s)
        mem: new Uint8Array(4096),
        vRegisters: new Uint8Array(16),
        keyboard: new Array<number>(),
        I: 0,
        delay: 0,
        sound: 0,
        pc: 0x200,
        sp: 0,
        stack: new Int16Array(16)
    }

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

    chip8.mem.set(fontSet, 0x00) // load font
    chip8.mem.set(rom, 0x200) // load rom into memory

    window.setInterval(() => {execute(chip8); render(chip8);}, 10)

    window.onkeydown = (event) => {
        if(!chip8.keyboard.includes(keyMapper[event.key]))
            chip8.keyboard.push(keyMapper[event.key])
    }
    
    window.onkeyup = (event) => {
        chip8.keyboard.splice(chip8.keyboard.indexOf(keyMapper[event.key]), 1)
    }
}
