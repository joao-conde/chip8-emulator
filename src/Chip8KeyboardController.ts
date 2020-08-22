export class Chip8KeyboardController {
  private activeKeys: Array<number> = new Array<number>()
 
  public isActive(val: number): boolean {
    return this.activeKeys.includes(val)
  }

  public noActiveKey(): boolean {
    return this.activeKeys.length === 0
  }

  public getLastActiveKey(): number {
    const lastActiveKey = this.activeKeys.pop()
    this.activeKeys.unshift(lastActiveKey)
    return lastActiveKey
  }

  public addActiveKey(key: string): void {
    this.activeKeys.push(parseInt(key))
  }

  public removeActiveKey(key: string): void {
    this.activeKeys.splice(this.activeKeys.indexOf(parseInt(key)), 1)
  }
}
