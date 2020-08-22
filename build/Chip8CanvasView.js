const originalWidth = 64;
const originalHeight = 32;
export class Chip8CanvasView {
    constructor(chip8, pixelSetColor, pixelUnsetColor) {
        this.scaledCanvas = document.querySelector('canvas#scaled');
        this.originalCanvas = document.createElement("canvas");
        this.sctx = this.scaledCanvas.getContext('2d');
        this.octx = this.originalCanvas.getContext('2d');
        this.chip8 = chip8;
        this.originalCanvas.width = originalWidth;
        this.originalCanvas.height = originalHeight;
        this.sctx.scale(this.scaledCanvas.width / this.originalCanvas.width, this.scaledCanvas.height / this.originalCanvas.height);
        this.sctx.imageSmoothingEnabled = false;
        this.pixelSetColor = pixelSetColor;
        this.pixelUnsetColor = pixelUnsetColor;
        this.image = this.octx.createImageData(this.originalCanvas.width, this.originalCanvas.height);
        this.videoBuff = new DataView(this.image.data.buffer);
    }
    render() {
        for (let i = 0, j = 0; i < this.chip8.getVRAM().length; i++, j += 4) {
            this.videoBuff.setUint32(j, this.chip8.getVRAM()[i] === 1 ? this.pixelSetColor : this.pixelUnsetColor);
        }
        this.octx.putImageData(this.image, 0, 0);
        this.sctx.drawImage(this.originalCanvas, 0, 0);
    }
}
