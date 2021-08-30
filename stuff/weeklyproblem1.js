const trackElement = document.getElementById("tracks")

const UP    = 0
const RIGHT = 1
const DOWN  = 2
const LEFT  = 3
const CART = "C"

const tracks = `
╔═══════════════╗
║        ╔══╗   ║
║        ╚══╬═══╝
║           ╚╗   
║   ╔══╗     ║   
║   ║  ╚═════╝   
╚═══╝            
`.split("\n")

trackElement.innerText = tracks


var minecart = {x: 0, y: 1}
var direction = RIGHT

setInterval(moveMinecart, 200)

function moveMinecart() {
    let track = tracks[minecart.y][minecart.x]

    if (direction == RIGHT) {
        if (track == "╗") {
            direction = DOWN
        } else if (track == "╝") {
            direction = UP
        }
    } else if (direction == DOWN) {
        if (track == "╝") {
            direction = LEFT
        } else if (track == "╚") {
            direction = RIGHT
        }
    } else if (direction == LEFT) {
        if (track == "╔") {
            direction = DOWN
        } else if (track == "╚") {
            direction = UP
        }
    } else if (direction == UP) {
        if (track == "╔") {
            direction = RIGHT
        } else if (track == "╗") {
            direction = LEFT
        }
    }

    if (direction == RIGHT) {
        minecart.x += 1
    } else if (direction == DOWN) {
        minecart.y += 1
    } else if (direction == LEFT) {
        minecart.x -= 1
    } else if (direction == UP) {
        minecart.y -= 1
    }

    renderTrack()
}

function renderTrack() {
    let renderedTracks = tracks.map(line => line.split(""))
    renderedTracks[minecart.y][minecart.x] = CART
    trackElement.innerText = renderedTracks.map(line => line.join("")).join("\n")
}
