const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const fs = require('fs');

// Schemas
const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

const gameModeSchema = new mongoose.Schema({
    name: String,
    description: String,
    icon: Number,
    options: Object,
    creator: userSchema,
    date: Date,
    plays: {type: Number, default: 0},
    ratings: {type: Array, default: []}
})

gameModeSchema.plugin(URLSlugs('creator.username name'));

const replaySchema = new mongoose.Schema({
    name: String,
    gameModeSlug: String,
    events: Array,
    creator: userSchema,
    plays: {type: Number, default: 0},
    ratings: {type: Array, default: []}
})

replaySchema.plugin(URLSlugs('gameModeSlug name'));

// Model registration
mongoose.model('User', userSchema);
mongoose.model('GameMode', gameModeSchema);
mongoose.model('Replay', replaySchema);

if (process.env.NODE_ENV == 'PRODUCTION') {
    mongoose.connect(JSON.parse(fs.readFileSync('config.json', {encoding: 'utf-8'})).dbString)
}
else {
    mongoose.connect('mongodb://localhost/aitetris');
}
