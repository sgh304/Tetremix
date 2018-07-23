// Setup
function setup() {
    const canvas = createCanvas(800, 800);
    canvas.parent('game-parent');
    frameRate(60);
    game = new Game();
    $.get('/tetremix/api/game-modes/' + document.location.pathname.split('/')[3], (gameMode) => {
        game.setMode(gameMode);
        setModeInfo(gameMode)
        game.ready = true;
    });
    window.addEventListener("keydown", function(e) {
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
}

// Drawing
function draw() {
    if (game.won || game.lost) {
        $('#replay input').prop({disabled: false});
    }
    game.logic()
    game.draw()
}

// Input
function keyPressed() {
    if (game.acceptingReplayInput) {
        if (keyCode === ESCAPE) {
            game.start();
        }
        else if (keyCode === ENTER) {
            submitReplay();
        }
        else if (keyCode === BACKSPACE) {
            game.replayInput = game.replayInput.slice(0, -1);
        }
        else if (game.replayInput.length < 15) {
            let char = String.fromCharCode(keyCode);
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (letters.includes(char)) {
                if (!keyIsDown(SHIFT)) {
                    char = String.fromCharCode(keyCode + 32);
                }
            }
            const accepted = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ- ';
            if (accepted.includes(char)) {
                game.replayInput += char;
            }
        }
    }
    else {
        if (keyCode === ENTER) {
            if (!game.started) {
                game.start();
            }
            else if (game.paused) {
                game.unpause();
            }
        }
        else if (keyCode == ESCAPE) {
            if (game.started) {
                game.pause();
            }
        }
        else if (keyCode === UP_ARROW) {
            game.postEvent(EVENT.HARD_DROP);
        }
        else if (keyCode === DOWN_ARROW) {
            game.postEvent(EVENT.SET_GRAVITY_DOWN);
        }
        else if (keyCode === LEFT_ARROW) {
            game.postEvent(EVENT.START_MOVE_LEFT);
        }
        else if (keyCode === RIGHT_ARROW) {
            game.postEvent(EVENT.START_MOVE_RIGHT);
        }
        else if (key === 'Z') {
            game.postEvent(EVENT.ROTATE_CLOCKWISE);
        }
        else if (key === 'X') {
            game.postEvent(EVENT.ROTATE_COUNTERCLOCKWISE);
        }
        else if (keyCode === SHIFT) {
            game.postEvent(EVENT.HOLD);
        }    
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        game.postEvent(EVENT.END_MOVE_LEFT);
    }
    else if (keyCode === RIGHT_ARROW) {
        game.postEvent(EVENT.END_MOVE_RIGHT);
    }
    else if (keyCode === DOWN_ARROW) {
        game.postEvent(EVENT.SET_GRAVITY_NORMAL);
    }
}

// Mode info
function setModeInfo(gameMode) {
    const info = $('#info');
    let key
    const appendInfo = (name) => {
        info.append('<div><strong>' + name + ':</strong> ' + gameMode.options[key] + '</div>')
    }
    for (key in gameMode.options) {
        if (gameMode.options[key]) {
            switch (key) {
                case 'normalGravity':
                    appendInfo('Normal Gravity');
                    break;
                case 'downGravity':
                    appendInfo('Down Graviy');
                    break;
                case 'autoshift':
                    appendInfo('Autoshift');
                    break;
                case 'das':
                    appendInfo('DAS');
                    break
                case 'hoverFrames':
                    appendInfo('Hover Frames');
                    break;
                case 'clearGoal':
                    appendInfo('Clear Goal');
                    break;
                case 'timeGoal':
                    appendInfo('Time Goal');
                    break;
            }
        }
    }
}

// Rating
function submitRating() {
    const rating = Number($('input[name=\'rating\']:checked').val());
    $.post('/tetremix/api/game-modes/rate/' + document.location.pathname.split('/')[2], {rating: rating});
    $('#rating input').prop({disabled: true});
}

// Replay
function submitReplay() {
    const name = game.replayInput;
    if (name != '') {
        $.post('/tetremix/api/replays', {name: name, gameModeSlug: document.location.pathname.split('/')[2], events: JSON.stringify(game.events)}, (res) => {
            window.location.href = '/watch/' + res.slug;
        })
    }
}