export class Chip8KeyboardController {
    constructor() {
        this.activeKeys = new Array();
    }
    isActive(val) {
        return this.activeKeys.includes(val);
    }
    noActiveKey() {
        return this.activeKeys.length === 0;
    }
    getLastActiveKey() {
        const lastActiveKey = this.activeKeys.pop();
        this.activeKeys.unshift(lastActiveKey);
        return lastActiveKey;
    }
    addActiveKey(key) {
        this.activeKeys.push(parseInt(key));
    }
    removeActiveKey(key) {
        this.activeKeys.splice(this.activeKeys.indexOf(parseInt(key)), 1);
    }
}
