// Dependencies
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const hbs = require('hbs');

// Database
require('./db');
const User = mongoose.model('User');
const GameMode = mongoose.model('GameMode');
const Replay = mongoose.model('Replay');

// app
const app = express();

// View engine
app.set('view engine', 'hbs');
hbs.registerHelper('avg', (array) => {
    const sum = array.reduce((a, b) => a + b, 0);
    return sum / (array.length || 1);
})
hbs.registerHelper('df', (number) => {
    return number.toFixed(1);
})

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'tetris',
    resave: false,
    saveUninitialized: true,
}));

// Routes
app.get('/', (req, res) => {
    res.render('index', {sessionUser: req.session.user});
});

// Watch
app.get('/watch/', (req, res) => {
    res.render('watch-dir', {sessionUser: req.session.user});
})

app.get('/watch/:slug/', (req, res) => {
    Replay.findOne({slug: req.params.slug}, (err, replay) => {
        if (err) {
            console.log(err);
        }
        else {
            replay.plays += 1;
            replay.save((err, replay) => {
                GameMode.findOne({slug: replay.gameModeSlug}, (err, gameMode) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.render('watch', {sessionUser: req.session.user, replay: replay, gameMode: gameMode}); 
                    }
                })
            })
        }
    })
})

// Play
app.get('/play/', (req, res) => {
    res.render('play-dir', {sessionUser: req.session.user});
})

app.get('/play/:slug/', (req, res) => {
    GameMode.findOne({slug: req.params.slug}, (err, gameMode) => {
        if (err) {
            console.log(err);
        }
        else {
            gameMode.plays += 1;
            gameMode.save((err, gameMode) => {
                res.render('play', {sessionUser: req.session.user, gameMode: gameMode});
            })
        }
    })
})

// Create
app.get('/create/', (req, res) => {
    res.render('create', {sessionUser: req.session.user});
})

app.post('/create/', (req, res) => {
    // Create game mode
    gameMode = new GameMode({
        name: req.body.name,
        description: req.body.description,
        icon: req.body.icon,
        options: {normalGravity: req.body.normalGravity, downGravity: req.body.downGravity, hoverFrames: req.body.hoverFrames,
            das: req.body.das, autoshift: req.body.autoshift,
            clearGoal: req.body.clearGoal, timeGoal: req.body.timeGoal,
            junkTime: req.body.junkTime, junkAmount: req.body.junkAmount,
            seed: req.body.seed},
        creator: req.session.user,
        date: Date.now()
    })
    // Save game mode
    gameMode.save((err, gameMode) => {
        if (err) {
            // Error saving game mode
        }
        else {
            // Success -- redirect to play
            res.redirect('/play/' + gameMode.slug + '/');
        }
    })
})

// Game Modes API
app.get('/api/game-modes/', (req, res) => {
    GameMode.find({}, (err, gameModes) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(gameModes);
        }
    })
})

app.get('/api/game-modes/:slug/', (req, res) => {
    GameMode.findOne({slug: req.params.slug}, (err, gameMode) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(gameMode);
        }
    })
})

// Replay API
app.get('/api/replays/', (req, res) => {
    Replay.find({}, (err, replays) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(replays);
        }
    })
})

app.post('/api/replays/', (req, res) => {
    // Create replay
    replay = new Replay({     
        name: req.body.name,
        gameModeSlug: req.body.gameModeSlug,
        events: JSON.parse(req.body.events),
        creator: req.session.user
    })
    // Save replay
    replay.save((err, replay) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(replay);
        }
    })
})

app.get('/api/replays/:slug/', (req, res) => {
    Replay.findOne({slug: req.params.slug}, (err, replay) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(replay);
        }
    })
})

// Rating API
app.post('/api/game-modes/rate/:slug/', (req, res) => {
    GameMode.findOne({slug: req.params.slug}, (err, gameMode) => {
        if (err) {
            console.log(err);
        }
        else {
            const rating = Number(req.body.rating);
            if (rating > 0 && rating <= 5) { 
                gameMode.ratings.push(rating);
                gameMode.save((err) => {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        }
    })
})

app.post('/api/replays/rate/:slug/', (req, res) => {
    Replay.findOne({slug: req.params.slug}, (err, replay) => {
        if (err) {
            console.log(err);
        }
        else {
            const rating = Number(req.body.rating);
            if (rating > 0 && rating <= 5) { 
                replay.ratings.push(rating);
                replay.save((err) => {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        }
    })
})

// Login
app.get('/login/', (req, res) => {
    res.render('login', {sessionUser: req.session.user});
})

app.post('/login/', (req, res) => {
    // Check for user
    User.findOne({username: req.body.username}, (err, user) => {
        if (err || !user) {
            // No user found
            res.render('login', {sessionUser: req.session.user, error: 'Username not found.'});
        }
        else {
            // Success -- check password
            bcrypt.compare(req.body.password, user.password, (err, passwordMatch) => {
                if (!passwordMatch) {
                    // Passwords don't match
                    res.render('login', {sessionUser: req.session.user, error: 'Incorrect password.'});
                }
                else {
                    // Success -- set session user and redirect to home
                    req.session.user = user;
                    res.redirect('/');
                }
            })
        }
    })
})

// Register
app.get('/register/', (req, res) => {
    res.render('register');
})

app.post('/register/', (req, res) => {
    // Check for existing username
    User.findOne({username: req.body.username}, (err, result) => {
        if (err || result) {
            // Existing username
            res.render('register', {sessionUser: req.session.user, error: 'Username already exists.'})
        }
        else {
            // Success -- hash password
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    // Error hashing
                    res.render('register', {sessionUser: req.session.user, error: 'Error creating user.'})
                }
                else {
                    // Success -- create user
                    user = new User({
                        username: req.body.username,
                        password: hash
                    })
                    user.save((err, user) => {
                        if (err) {
                            // Error saving user
                            res.render('register', {sessionUser: req.session.user, error: 'Error creating user.'})                     
                        }
                        else {
                            // Success -- set session user and redirect to home
                            req.session.user = user;
                            res.redirect('/');
                        }
                    })
                }
            })
        }
    })
})

// Listen
app.listen(5001);