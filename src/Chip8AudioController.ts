export class Chip8AudioController {
  private beeper: HTMLAudioElement

  constructor(mp3FilePath: string){
    this.beeper = new Audio(mp3FilePath)
    this.beeper.volume = 0.1
  }

  public beep(): void {
    this.beeper.play()
  }
}