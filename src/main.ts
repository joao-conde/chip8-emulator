const testRom: number[] = [
    0x22, 0xfc, 0x6b, 0x0c, 0x6c, 0x3f, 0x6d, 0x0c, 0xa2, 0xea, 0xda, 0xb6, 0xdc, 0xd6, 0x6e, 0x00,
    0x22, 0xd4, 0x66, 0x03, 0x68, 0x02, 0x60, 0x60, 0xf0, 0x15, 0xf0, 0x07, 0x30, 0x00, 0x12, 0x1a,
    0xc7, 0x17, 0x77, 0x08, 0x69, 0xff, 0xa2, 0xf0, 0xd6, 0x71, 0xa2, 0xea, 0xda, 0xb6, 0xdc, 0xd6,
    0x60, 0x01, 0xe0, 0xa1, 0x7b, 0xfe, 0x60, 0x04, 0xe0, 0xa1, 0x7b, 0x02, 0x60, 0x1f, 0x8b, 0x02,
    0xda, 0xb6, 0x60, 0x0c, 0xe0, 0xa1, 0x7d, 0xfe, 0x60, 0x0d, 0xe0, 0xa1, 0x7d, 0x02, 0x60, 0x1f,
    0x8d, 0x02, 0xdc, 0xd6, 0xa2, 0xf0, 0xd6, 0x71, 0x86, 0x84, 0x87, 0x94, 0x60, 0x3f, 0x86, 0x02,
    0x61, 0x1f, 0x87, 0x12, 0x46, 0x00, 0x12, 0x78, 0x46, 0x3f, 0x12, 0x82, 0x47, 0x1f, 0x69, 0xff,
    0x47, 0x00, 0x69, 0x01, 0xd6, 0x71, 0x12, 0x2a, 0x68, 0x02, 0x63, 0x01, 0x80, 0x70, 0x80, 0xb5,
    0x12, 0x8a, 0x68, 0xfe, 0x63, 0x0a, 0x80, 0x70, 0x80, 0xd5, 0x3f, 0x01, 0x12, 0xa2, 0x61, 0x02,
    0x80, 0x15, 0x3f, 0x01, 0x12, 0xba, 0x80, 0x15, 0x3f, 0x01, 0x12, 0xc8, 0x80, 0x15, 0x3f, 0x01,
    0x12, 0xc2, 0x60, 0x20, 0xf0, 0x18, 0x22, 0xd4, 0x8e, 0x34, 0x22, 0xd4, 0x66, 0x3e, 0x33, 0x01,
    0x66, 0x03, 0x68, 0xfe, 0x33, 0x01, 0x68, 0x02, 0x12, 0x16, 0x79, 0xff, 0x49, 0xfe, 0x69, 0xff,
    0x12, 0xc8, 0x79, 0x01, 0x49, 0x02, 0x69, 0x01, 0x60, 0x04, 0xf0, 0x18, 0x76, 0x01, 0x46, 0x40,
    0x76, 0xfe, 0x12, 0x6c, 0xa2, 0xf2, 0xfe, 0x33, 0xf2, 0x65, 0xf1, 0x29, 0x64, 0x14, 0x65, 0x02,
    0xd4, 0x55, 0x74, 0x15, 0xf2, 0x29, 0xd4, 0x55, 0x00, 0xee, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0xc0, 0xc0, 0x00, 0xff, 0x00, 0x6b, 0x20, 0x6c, 0x00,
    0xa2, 0xf6, 0xdb, 0xc4, 0x7c, 0x04, 0x3c, 0x20, 0x13, 0x02, 0x6a, 0x00, 0x6b, 0x00, 0x6c, 0x1f,
    0xa2, 0xfa, 0xda, 0xb1, 0xda, 0xc1, 0x7a, 0x08, 0x3a, 0x40, 0x13, 0x12, 0xa2, 0xf6, 0x6a, 0x00,
    0x6b, 0x20, 0xdb, 0xa1, 0x00, 0xee
]

type Chip8Type = {
    videoMem: Uint8Array,
    mem: Uint8Array,
    vRegisters: Uint8Array,
    I: number,
    delay: number,
    sound: number,
    pc: number,
    sp: number,
    stack: Int16Array
}

//VIEW
const PIXEL_SET_COLOR = 0xFF0000FF  //red
const PIXEL_UNSET_COLOR = 0x00FF00FF //green
const canvas = <HTMLCanvasElement> document.getElementById("screen")
const ctx = canvas.getContext("2d")
const image = ctx.createImageData(canvas.width, canvas.height)
const videoBuff = new DataView(image.data.buffer); //interface to manipulate pixels (R,G,B,A format i.e. 4 bytes or 32 bits)
//

function render(chip8: Chip8Type){
    for (let i = 0, j = 0; i < chip8.videoMem.length; i++, j += 4) {
        videoBuff.setUint32(j, chip8.videoMem[i] === 1 ? PIXEL_SET_COLOR : PIXEL_UNSET_COLOR);
    }
    ctx.putImageData(image, 0, 0)
}

function drawSprite(chip8: Chip8Type, x0: number, y0: number, height: number){
    let collision = 0
    
    for (let y = 0; y < height; y += 1) {
        const sprite = chip8.mem[chip8.I + y]
        for (let x = 0; x < 8; x += 1) {
            if((sprite & (0x80 >> x)) != 0){
                if(chip8.videoMem[x0 + x + ((y0 + y) * 640)] == 1)
                    collision = 1
                chip8.videoMem[x0 + x + ((y0 + y) * 640)] ^= 1
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
    const x = opcode & 0x0F00
    const y = opcode & 0x00F0
    const byte = opcode & 0x00FF
    
    chip8.pc += 2 // take two opcodes from ROM
    switch(id){
        case 0x0000:
            switch(byte){
                case 0xE0:
                    //chip8.videoMem.map(_ => 0)
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
            chip8.vRegisters[x] = chip8.vRegisters[x] + byte //TODO what if it overflows?
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
                    chip8.vRegisters[x] = chip8.vRegisters[x] + chip8.vRegisters[y]
                    break
                case 0x5:
                    chip8.vRegisters[x] = chip8.vRegisters[x] - chip8.vRegisters[y]
                    //TODO VF = borrow
                    break
                case 0x6:
                    chip8.vRegisters[x] = chip8.vRegisters[x] >> 1
                    //TODO VF = ?
                    break
                case 0x7:
                    chip8.vRegisters[x] = chip8.vRegisters[y] - chip8.vRegisters[x]
                    //TODO VF = borrow
                    break
                case 0xE:
                    chip8.vRegisters[x] = chip8.vRegisters[x] << 1
                    //TODO VF = ?
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
            //TODO needs keyboard state
            break
        
        case 0xF000:
            switch(byte){
                case 0x07:
                    chip8.vRegisters[x] = chip8.delay
                    break
                case 0x0A:
                    // TODO execution must stop
                    break
                case 0x15:
                    chip8.delay = chip8.vRegisters[x]
                    break
                case 0x18:
                    chip8.sound = chip8.vRegisters[x]
                    break
                case 0x1E:
                    chip8.I = chip8.I + chip8.vRegisters[x]
                    break
                case 0x29:
                    // view stuff requires sprite map
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
    
    rom = testRom;

    const chip8: Chip8Type = {
        videoMem: new Uint8Array(canvas.width * canvas.height), //active and not active bits (0s and 1s)
        mem: new Uint8Array(4096),
        vRegisters: new Uint8Array(16),
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

    window.setInterval(() => {execute(chip8); render(chip8);}, 100)
    window.setInterval(() => {console.log(chip8.videoMem)}, 3000)
}
