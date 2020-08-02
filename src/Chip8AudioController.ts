export class Chip8AudioController {
  private beeper: HTMLAudioElement

  constructor(audioFilePath: string){
    this.beeper = new Audio(audioFilePath)
    this.beeper.volume = 0.1
  }

  public beep(): void {
    this.beeper.play()
  }
}