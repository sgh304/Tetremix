// Color constants
COLOR = {I: [0, 168, 168], J: [62, 62, 209], L: [229, 105, 22], O: [242, 203, 12], S: [16, 165, 33], T: [96, 0, 145], Z: [229, 57, 57], JUNK: [255, 255, 255]}

// Event constants
EVENT = {START_MOVE_LEFT: 0, END_MOVE_LEFT: 1, START_MOVE_RIGHT: 2, END_MOVE_RIGHT: 3, ROTATE_CLOCKWISE: 4, ROTATE_COUNTERCLOCKWISE: 5, SET_GRAVITY_NORMAL: 6, SET_GRAVITY_DOWN: 7, HARD_DROP: 8}

// GAME LOGIC
class Block {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class Tetrimino {
    constructor(boxSize, blocks) {
        this.boxSize = boxSize;
        this.blocks = [];
        blocks.forEach((block) => {
            this.addBlock(block);
        });
        this.boxX = 0;
        this.boxY = 0;
        this.rotations = 0;
    }

    // Block management
    addBlock(block) {
        this.blocks.push(block);
        block.tetrimino = this;
    }

    // Movement
    move(movement) {
        this.blocks.forEach((block) => {
            if (movement.x) { block.x += movement.x; }
            if (movement.y) { block.y += movement.y; }
        })
        if (movement.x) { this.boxX += movement.x; }
        if (movement.y) { this.boxY += movement.y; }
    }

    rotate() {
        this.rotations += 1;
        const rotationPointX = (this.boxSize / 2) + this.boxX;
        const rotationPointY = (this.boxSize / 2) + this.boxY;
        this.blocks.forEach((block) => {
            const temp = block.x;
            block.x = -(block.y - rotationPointY) + rotationPointX;
            block.y = (temp - rotationPointX) + rotationPointY;
        })
    }

    returnToOriginal() {
        while (this.rotations % 4 != 0) {
            this.rotate();
        }
        this.blocks.forEach((block) => {
            block.x -= this.boxX;
            block.y -= this.boxY;
        })
        this.boxX = 0;
        this.boxY = 0;
    }
}

class ITetrimino extends Tetrimino {
    constructor() {
        super(3, [new Block(0, 1, COLOR.I), new Block(1, 1, COLOR.I), new Block(2, 1, COLOR.I), new Block(3, 1, COLOR.I)]);
    }
}

class JTetrimino extends Tetrimino {
    constructor() {
        super(2, [new Block(0, 0, COLOR.J), new Block(0, 1, COLOR.J), new Block(1, 1, COLOR.J), new Block(2, 1, COLOR.J)])
    }
}

class LTetrimino extends Tetrimino {
    constructor() {
        super(2, [new Block(2, 0, COLOR.L), new Block(0, 1, COLOR.L), new Block(1, 1, COLOR.L), new Block(2, 1, COLOR.L)])
    }
}

class OTetrimino extends Tetrimino {
    constructor() {
        super(1, [new Block(0, 0, COLOR.O), new Block(1, 0, COLOR.O), new Block(0, 1, COLOR.O), new Block(1, 1, COLOR.O)])
    }
}

class STetrimino extends Tetrimino {
    constructor() {
        super(2, [new Block(1, 0, COLOR.S), new Block(2, 0, COLOR.S), new Block(0, 1, COLOR.S), new Block(1, 1, COLOR.S)])
    }
}

class TTetrimino extends Tetrimino {
    constructor() {
        super(2, [new Block(1, 0, COLOR.T), new Block(0, 1, COLOR.T), new Block(1, 1, COLOR.T), new Block(2, 1, COLOR.T)])
    }
}

class ZTetrimino extends Tetrimino {
    constructor() {
        super(2, [new Block(0, 0, COLOR.Z), new Block(1, 0, COLOR.Z), new Block(1, 1, COLOR.Z), new Block(2, 1, COLOR.Z)]);
    }
}

const seededRandom = (seed) => {
    seed = Number(seed);
    return () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
}

class Game {
    constructor() {
        // Default options
        this.normalGravity = 60;
        this.downGravity = 10;
        this.das = 30;
        this.autoshift = 10;
        this.hoverFrames = 30;
        this.clearGoal = 2;
        this.seed = Math.floor(Math.random() * 9999);
        // Frames
        this.frame = 0;
        this.startMoveFrame = undefined;
        this.startHoverFrame = undefined;
        this.lastGravityFrame = 0;
        // State
        this.ready = false;
        this.started = false;
        this.paused = false;
        this.won = false;
        this.lost = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.holdLock = false;
        this.clears = 0;
        // Events
        this.waitingEvents = [];
        this.events = [];
        // Game objects
        this.well = {blocks: []};
        this.currentTetrimino = undefined;
        this.heldTetrimino = undefined;
        this.next = [];
        // Replay input
        this.disableReplayInput = false;
        this.acceptingReplayInput = false;
        this.replayInput = '';
    }

    // Start
    start() {
        if (this.ready) {
            this.random = seededRandom(this.seed);
            // Frames
            this.frame = 0;
            this.startMoveFrame = undefined;
            this.startHoverFrame = undefined;
            this.lastGravityFrame = 0;
            // State
            this.started = true;
            this.paused = false;
            this.won = false;
            this.lost = false;
            this.movingLeft = false;
            this.movingRight = false;
            this.holdLock = false;
            this.clears = 0;
            // Events
            this.waitingEvents = [];
            this.events = [];
            // Game objects
            this.well = {blocks: []};
            this.currentTetrimino = undefined;
            this.heldTetrimino = undefined;
            this.next = [];
            // Replay input
            this.acceptingReplayInput = false;
            this.replayInput = '';
            this.currentGravity = this.normalGravity;
            this.newCurrentTetrimino();
        }
    }

    // Mode
    setMode(mode) {
        this.mode = mode;
        Object.keys(this.mode.options).forEach((key) => {
            this[key] = this.mode.options[key];
        })
        this.currentGravity = this.normalGravity;
    }

    // Logic
    logic() {
        if (this.started && !this.paused) {
            this.frame += 1;
            // Time victory
            if (this.timeGoal && this.frame >= this.timeGoal * 60) {
                this.win();
            }
            else {
                // Handle events
                this.handleEvents();
                // Movement
                if (this.movingLeft) {
                    if ((this.frame === this.startMoveFrame || (this.frame - this.startMoveFrame) > this.das) && (this.frame - this.startMoveFrame) % this.autoshift == 0) {
                        if (!this.checkTetrimino(this.currentTetrimino, {x: -1})) {
                            this.currentTetrimino.move({x: -1});
                        }
                    }
                }
                else if (this.movingRight) {
                    if ((this.frame === this.startMoveFrame || (this.frame - this.startMoveFrame) > this.das) && (this.frame - this.startMoveFrame) % this.autoshift == 0) {
                        if (!this.checkTetrimino(this.currentTetrimino, {x: 1})) {
                            this.currentTetrimino.move({x: 1});
                        }
                    }
                }
                if (this.checkTetrimino(this.currentTetrimino, {y: 1})) {
                    // Hover
                    if (this.startHoverFrame === undefined) {
                        this.startHoverFrame = this.frame;
                    }
                    else if (this.frame - this.startHoverFrame >= this.hoverFrames) {
                        this.lockCurrentTetrimino();
                        this.startHoverFrame = undefined;
                    }
                }
                else {
                    // Gravity
                    if (this.frame - this.lastGravityFrame >= this.currentGravity) {
                        this.currentTetrimino.move({y: 1});
                        this.startHoverFrame = undefined;
                        this.lastGravityFrame = this.frame;
                    }
                }
                // Junk
                if (this.junkTime && (this.frame % (this.junkTime * 60) === 0)) {
                    this.generateJunk();
                }
            }
            
        }
    }

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    win() {
        if (!this.disableReplayInput) {
            this.acceptingReplayInput = true;
        }
        this.started = false;
        this.won = true;
    }

    lose() {
        if (!this.disableReplayInput) {
            this.acceptingReplayInput = true;
        }
        this.started = false;
        this.lost = true;
    }

    lockCurrentTetrimino() {
        this.currentTetrimino.blocks.forEach((block) => {
            this.well.blocks.push(block);
        })
        this.checkForClears();
        // Check win conditions
        if (this.clearGoal && this.clears >= this.clearGoal) {
            this.win();
        } 
        // Check lose conditions
        if (this.checkForTopOut()) {
            this.lose();
        }
        // Continue
        if (this.started) {
            this.newCurrentTetrimino();
        }
    }

    checkForTopOut() {
        return this.well.blocks.some((block) => {
            return (block.y < 0);
        })
    }

    checkForClears() {
        const counts = {};
        this.well.blocks.forEach((block) => {
            if (counts[block.y] === undefined) { counts[block.y] = 0; }
            counts[block.y] += 1;
        })
        Object.keys(counts).forEach((row) => {
            if (counts[row] >= 10) {
                this.clear(row);
            }
        })
    }

    clear(row) {
        const toRemove = [];
        this.well.blocks.forEach((block) => {
            if (block.y < row) {
                block.y += 1;
            }
            else if (block.y == row) {
                toRemove.push(block);
            }
        })
        toRemove.forEach((block) => {
            this.well.blocks.splice(this.well.blocks.indexOf(block), 1);
        })
        this.clears += 1;
    }

    newCurrentTetrimino() {
        while (this.next.length < 7) { this.generateNext(); }
        this.currentTetrimino = this.next.shift();
        // Place current tetrimino
        this.currentTetrimino.move({x: Math.floor((10 - this.currentTetrimino.boxSize) / 2), y: -1})
        this.holdLock = false;
    }

    generateNext() {
        // Create bag
        const bag = [new ITetrimino(), new JTetrimino(), new LTetrimino(), new OTetrimino(), new STetrimino(), new TTetrimino(), new ZTetrimino()];
        // Shuffle bag
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        // Add bag to next
        bag.forEach((tetrimino) => {
            this.next.push(tetrimino);
        })
    }

    generateJunk() {
        // Move all well blocks up
        this.well.blocks.forEach((block) => {
            block.y -= 1;
        })
        // Create junk row
        const junkRow = [
                            new Block(0, 19, COLOR.JUNK), new Block(1, 19, COLOR.JUNK), new Block(2, 19, COLOR.JUNK),
                            new Block(3, 19, COLOR.JUNK), new Block(4, 19, COLOR.JUNK), new Block(5, 19, COLOR.JUNK),
                            new Block(6, 19, COLOR.JUNK), new Block(7, 19, COLOR.JUNK), new Block(8, 19, COLOR.JUNK),
                            new Block(9, 19, COLOR.JUNK)
                        ]
        // Add random blocks to the well (depending on junkAmount)
        for (let i = 0; i < this.junkAmount; i++) {
            this.well.blocks.push(junkRow.splice(Math.floor(this.random() * (junkRow.length)), 1)[0]);
        }
    }

    // Events
    handleEvents() {
        this.waitingEvents.forEach((eventType) => {
            // Perform event logic
            this.eventLogic(eventType);
            // Save event to replay
            this.events.push({frame: this.frame, type: eventType});
        })
        this.waitingEvents = [];
    }

    eventLogic(eventType) {
        switch (eventType) {
            case EVENT.START_MOVE_LEFT:
                this.startMoveFrame = this.frame;
                this.movingLeft = true;
                this.movingRight = false;
                break;
            case EVENT.END_MOVE_LEFT:
                this.movingLeft = false;
                break;
            case EVENT.START_MOVE_RIGHT:
                this.startMoveFrame = this.frame;
                this.movingRight = true;
                this.movingLeft = false;
                break;
            case EVENT.END_MOVE_RIGHT:
                this.movingRight = false;
                break;
            case EVENT.ROTATE_CLOCKWISE:
                this.currentTetrimino.rotate();
                if (this.checkTetrimino(this.currentTetrimino)) {
                    this.currentTetrimino.rotate();
                    this.currentTetrimino.rotate();
                    this.currentTetrimino.rotate();
                }
                break;
            case EVENT.ROTATE_COUNTERCLOCKWISE:
                this.currentTetrimino.rotate();
                this.currentTetrimino.rotate();
                this.currentTetrimino.rotate();
                if (this.checkTetrimino(this.currentTetrimino)) {
                    this.currentTetrimino.rotate();
                }
                break;
            case EVENT.SET_GRAVITY_NORMAL:
                this.currentGravity = this.normalGravity;
                break;
            case EVENT.SET_GRAVITY_DOWN:
                this.currentGravity = this.downGravity;
                break;
            case EVENT.HARD_DROP:
                while (!this.checkTetrimino(this.currentTetrimino, {y: 1})) {
                    this.currentTetrimino.move({y: 1});
                }
                this.lockCurrentTetrimino();
                break;
            case EVENT.HOLD:
                if (!this.holdLock) {
                    this.currentTetrimino.returnToOriginal();
                    if (this.heldTetrimino) {
                        const temp = this.currentTetrimino;
                        this.currentTetrimino = this.heldTetrimino;
                        this.currentTetrimino.move({x: Math.floor((10 - this.currentTetrimino.boxSize) / 2), y: -1})
                        this.heldTetrimino = temp;
                    }
                    else {
                        this.heldTetrimino = this.currentTetrimino;
                        this.newCurrentTetrimino();
                    }
                    this.holdLock = true;
                }
                break;
        }
    }

    postEvent(type) {
        if (this.started) {
            this.waitingEvents.push(type);
        }
    }

    // Well
    checkTetrimino(tetrimino, offset = {}) {
        return tetrimino.blocks.some((block) => { return this.checkBlock(block, offset); });
    }

    checkBlock(block, offset = {}) {
        if (offset.x === undefined) { offset.x = 0; }
        if (offset.y === undefined) { offset.y = 0; }
        const collideWell = this.well.blocks.some((wellBlock) => { return (wellBlock.x === block.x + offset.x && wellBlock.y === block.y + offset.y); })
        const collideBounds = (block.x + offset.x < 0 || block.x + offset.x > 9 || block.y + offset.y > 19);
        return (collideWell || collideBounds);
    }

    // Rendering
    draw() {
        this.drawGame();
        this.drawInfo();
    }

    drawGame() {
        // Background
        stroke('#000');
        strokeWeight(3);
        fill('#70798C');
        rect(0, 0, 200, 200);
        rect(200, 0, 400, 800);
        rect(600, 0, 200, 200);
        // Hold
        if (this.heldTetrimino) {
            this.heldTetrimino.blocks.forEach((block) => {
                this.drawBlock(block, -200 + (200 - (this.heldTetrimino.boxSize + 1) * 40) / 2, (200 - (this.heldTetrimino.boxSize + 1) * 40) / 2);
            })
        }
        // Next
        if (this.next[0]) {
            this.next[0].blocks.forEach((block) => {
                this.drawBlock(block, 400 + (200 - (this.next[0].boxSize + 1) * 40) / 2, (200 - (this.next[0].boxSize + 1) * 40) / 2);
            })
        }
        // Well
        this.well.blocks.forEach((block) => {
            this.drawBlock(block);
        })
        // Current tetrimino
        if (this.currentTetrimino) {
            this.currentTetrimino.blocks.forEach((block) => {
                this.drawBlock(block);
            }) 
        }
    }

    drawBlock(block, xOffset = 0, yOffset = 0) {
        stroke('#e5e5e5');
        strokeWeight(4);
        fill(...block.color);
        rect(200 + block.x * 40 + xOffset, block.y * 40 + yOffset, 40, 40);
    }

    drawPopup(message) {
        stroke('#000');
        strokeWeight(1);
        fill('#241d1d');
        rect(240, 300, 320, 100);
        fill('#FFF');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(36);
        text('Hello', 240, 330, 320, 100);
    }

    drawInfo() {
        // Backgrounds
        stroke('#000');
        strokeWeight(3);
        fill('#1c3144');
        rect(0, 200, 200, 600);
        rect(600, 200, 200, 600);
        // Text
        fill('#e5e5e5');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(24);
        // Time
        text('Time', 0, 220, 200, 200);
        text(((this.frame % 60 / 60) + Math.floor(this.frame / 60)).toFixed(2).toString(), 0, 250, 200, 200);
        // Clears
        text('Clears', 0, 300, 200, 200);
        text(String(this.clears), 0, 330, 200, 200);
        // Current Gravity
        text('Current Gravity', 0, 380, 200, 200);
        text(String(this.currentGravity), 0, 410, 200, 200);
        if (this.ready) {
            if (!this.started) {
                this.drawStartMenu();
            }
            if (this.paused) {
                this.drawPauseMenu();
            }
            if (this.won) {
                this.drawWonMenu();
                if (this.acceptingReplayInput) {
                    this.drawReplayMenu();
                }
            }
            else if (this.lost) {
                this.drawLostMenu();
                if (this.acceptingReplayInput) {
                    this.drawReplayMenu();
                }
            }
        }
    }

    drawStartMenu() {
        // Box
        stroke('#000');
        strokeWeight(3);
        fill('#1c3144');
        rect(220, 300, 360, 100);
        // Text
        fill('#e5e5e5');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(32);
        text('Press ENTER to start!', 240, 330, 320, 100);
    }

    drawPauseMenu() {
        // Box
        stroke('#000');
        strokeWeight(3);
        fill('#1c3144');
        rect(220, 300, 360, 100);
        // Text
        fill('#e5e5e5');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(32);
        text('Press ENTER to unpause.', 240, 310, 320, 100);
    }

    drawWonMenu() {
        // Box
        stroke('#000');
        strokeWeight(3);
        fill('#1c3144');
        rect(220, 100, 360, 80);
        // Text
        fill('#e5e5e5');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(48);
        text('You won!', 240, 110, 320, 80);
    }

    drawLostMenu() {
        // Box
        stroke('#000');
        strokeWeight(3);
        fill('#1c3144');
        rect(220, 100, 360, 80);
        // Text
        fill('#e5e5e5');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(48);
        text('You lost.', 240, 110, 320, 80);
    }

    drawReplayMenu() {
        // Box
        stroke('#000');
        strokeWeight(3);
        fill('#1c3144');
        rect(220, 250, 360, 200);
        // Text
        fill('#e5e5e5');
        textAlign(CENTER);
        textFont('Roboto');
        textSize(32);
        text('Name your replay:', 240, 260, 320, 100);
        fill('#FFF');
        text(this.replayInput, 240, 305, 320, 100);
        fill('#e5e5e5');
        text('Press ENTER to save.', 240, 350, 320, 100)
        text('Press ESC to retry.', 240, 400, 320, 100)
    }
}