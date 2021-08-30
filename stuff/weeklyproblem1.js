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
`.split("\n").slice(1)

trackElement.innerText = tracks

let cart = {x: 0, y: 0, direction: RIGHT}
var interval;
changeSpeed(5)

function moveMinecart() {
    let track = tracks[cart.y][cart.x]
    if (cart.direction == RIGHT) {
        if (track == "╗") {
            cart.direction = DOWN
        } else if (track == "╝") {
            cart.direction = UP
        }
    } else if (cart.direction == DOWN) {
        if (track == "╝") {
            cart.direction = LEFT
        } else if (track == "╚") {
            cart.direction = RIGHT
        }
    } else if (cart.direction == LEFT) {
        if (track == "╔") {
            cart.direction = DOWN
        } else if (track == "╚") {
            cart.direction = UP
        }
    } else if (cart.direction == UP) {
        if (track == "╔") {
            cart.direction = RIGHT
        } else if (track == "╗") {
            cart.direction = LEFT
        }
    }

    if (cart.direction == RIGHT) {
        cart.x += 1
    } else if (cart.direction == DOWN) {
        cart.y += 1
    } else if (cart.direction == LEFT) {
        cart.x -= 1
    } else if (cart.direction == UP) {
        cart.y -= 1
    }

    renderTrack()
}

function changeSpeed(fps) {
    let delay = 1000 / fps
    clearInterval(interval)
    interval = setInterval(moveMinecart, delay)
}

function renderTrack() {
    let renderedTracks = tracks.map(line => line.split(""))
    renderedTracks[cart.y][cart.x] = CART
    trackElement.innerText = renderedTracks.map(line => line.join("")).join("\n")
}
