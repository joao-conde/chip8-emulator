export class Chip8KeyboardController {
  private keys: Array<number> 
  private keyMapper

  constructor(){
    this.keys = new Array<number>()
    this.keyMapper = {
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
  }

  public isPressed(val: number): boolean {
    return this.keys.includes(this.keyMapper[val])
  }

  public noKeyPressed(): boolean {
    return this.keys.length === 0
  }

  public getLastKeyPressed(): number {
    const lastKeyPressed = this.keys.pop()
    this.keys.unshift(lastKeyPressed)
    return lastKeyPressed
  }

  public addPressedKey(key): void {
    this.keys.push(this.keyMapper[key])
  }

  public removePressedKey(key): void {
    this.keys.splice(this.keys.indexOf(this.keyMapper[key]), 1)
  }
}