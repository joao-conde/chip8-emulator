import { Chip8 } from "./Chip8";

export class Chip8CanvasView {
  private chip8: Chip8

  private pixelSetColor: number
  private pixelUnsetColor: number

  private scaledCanvas: HTMLCanvasElement
  private originalCanvas: HTMLCanvasElement

  private sctx: CanvasRenderingContext2D
  private octx: CanvasRenderingContext2D

  private image: ImageData
  private videoBuff: DataView //interface to manipulate pixels (R,G,B,A format i.e. 4 bytes or 32 bits)

  constructor(chip8: Chip8, scaledCanvas: HTMLCanvasElement, originalCanvas: HTMLCanvasElement, pixelSetColor: number, pixelUnsetColor: number){
    this.chip8 = chip8

    this.pixelSetColor = pixelSetColor
    this.pixelUnsetColor = pixelUnsetColor

    this.scaledCanvas = scaledCanvas
    this.originalCanvas = originalCanvas

    this.sctx = this.scaledCanvas.getContext('2d')
    this.octx = this.originalCanvas.getContext('2d')
    
    this.image = this.octx.createImageData(this.originalCanvas.width, this.originalCanvas.height)
    this.videoBuff = new DataView(this.image.data.buffer);
  }

  public render(): void {
    for (let i = 0, j = 0; i < this.chip8.getVRAM().length; i++, j += 4) {
      this.videoBuff.setUint32(j, this.chip8.getVRAM()[i] === 1 ? this.pixelSetColor : this.pixelUnsetColor);
    }
    this.octx.putImageData(this.image, 0, 0)
    this.sctx.drawImage(this.originalCanvas, 0, 0)
  }
}