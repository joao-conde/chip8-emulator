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
    "Vers"
];
export function displayStoredROMs(romSelector) {
    storedROMs.forEach(romName => {
        const option = document.createElement("option");
        option.value = `${romName}.ch8`;
        option.text = romName;
        romSelector.add(option);
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
