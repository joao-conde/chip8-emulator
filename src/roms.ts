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
  "test/BC_test"
]

export function displayStoredROMs(romList: HTMLUListElement) {
  storedROMs.forEach(romName => {
    const item: HTMLLIElement = document.createElement("li")
    item.innerHTML = romName
    romList.appendChild(item)
  })
}

export function getStoredROM(rom: string): Promise<ArrayBuffer|string> {
  return new Promise(resolve => {
    const request = new XMLHttpRequest();
    request.open("GET", `res/roms/${rom}`, true); 
    request.responseType = 'arraybuffer'
    request.onload = () => {
      const result = request.response as ArrayBuffer; 
      resolve(result)
    }
    request.send()
  })
}
