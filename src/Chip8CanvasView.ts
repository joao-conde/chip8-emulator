import { Chip8 } from "./Chip8";

export class Chip8CanvasView {
  private chip8: Chip8
  private PIXEL_SET_COLOR = 0xFFFFFFFF  //white
  private PIXEL_UNSET_COLOR = 0x000000FF //black

  private width = 64
  private height = 32
  private scaledWidth = 640
  private scaledHeight = 320
  private xScale
  private yScale

  private scanvas = <HTMLCanvasElement> document.getElementById('screen')
  private dcanvas = <HTMLCanvasElement> document.createElement('canvas')

  private sctx
  private dctx

  private image
  private videoBuff

  constructor(chip8: Chip8){
    this.chip8 = chip8
    this.xScale = this.scaledWidth / this.width
    this.yScale = this.scaledHeight / this.height
    this.sctx = this.scanvas.getContext('2d')
    this.dctx = this.dcanvas.getContext('2d')

    this.dcanvas.width = this.width
    this.dcanvas.height = this.height
    this.sctx.scale(this.xScale, this.yScale)
    this.sctx.imageSmoothingEnabled = false

    this.image = this.dctx.createImageData(this.width, this.height)
    this.videoBuff = new DataView(this.image.data.buffer); //interface to manipulate pixels (R,G,B,A format i.e. 4 bytes or 32 bits)


  }

  public render() {
    for (let i = 0, j = 0; i < this.chip8.getVRAM().length; i++, j += 4) {
      this.videoBuff.setUint32(j, this.chip8.getVRAM()[i] === 1 ? this.PIXEL_SET_COLOR : this.PIXEL_UNSET_COLOR);
    }
    this.dctx.putImageData(this.image, 0, 0)
    this.sctx.drawImage(this.dcanvas, 0, 0)
  }
}