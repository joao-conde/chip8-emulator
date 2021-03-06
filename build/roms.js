const storedROMs = [
    "Blitz",
    "Breakout",
    "Brix",
    "Connect4",
    "Flightrunner",
    "Hidden",
    "Merlin",
    "Missile",
    "Outlaw",
    "Pong",
    "Space Invaders",
    "Tank",
    "Tetris",
    "TicTac",
    "UFO",
    "Vers",
    "test/BC_test",
    "test/c8_test",
    "test/Keypad Test [Hap, 2006]",
    "test/test_opcode"
];
export function displayStoredROMs(romList) {
    storedROMs.forEach(romName => {
        const item = document.createElement("li");
        item.innerHTML = romName;
        romList.appendChild(item);
    });
}
export function getStoredROM(rom) {
    return new Promise(resolve => {
        const request = new XMLHttpRequest();
        request.open("GET", `res/roms/${rom}`, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            const result = request.response;
            resolve(result);
        };
        request.send();
    });
}
