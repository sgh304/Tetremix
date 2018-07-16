# AITetris

## Overview

AITetris is a web app that lets users play variants of the popular puzzle game Tetris. Not only that, all of those variants are created by other users. On the site, users can create their own Tetris game modes and explore game modes that others have created, viewing replays of previous Tetris games or trying the modes out themselves.

## Data Model

The application will store Users, Game Modes, and Replays

* Game Modes and Replays are created by Users (reference)
* Replays are of games in a certain Game Mode (reference)
* Game Modes contain an options object, which is used to tweak a base Game object with some desired settings (speed of blocks, win conditions, etc.)
* Replays contain an events array, which stores events that happened in the recorded game so that it can be recreated 

An Example User:

```javascript
{
  username: 'username',
  password: // a hashed password
}
```

An Example Game Mode:

```javascript
{
  name: 'Sprint',
  description: 'Clear 40 lines as fast as possible.',
  options: {clearGoal: 40},
  creator: //User reference,
  date: 4/2/18,
  plays: 1,
  ratings: [5, 5, 5],
  slug: 'testuser-sprint'
}
```

An Example Replay:
```javascript
{
  name: 'My Sprint Game',
  events: [{frame: 10, event: EVENT.MOVE_LEFT}, {frame: 60, event: EVENT.HARD_DROP}],
  gameModeSlug: //Game Mode slug,
  creator: //User reference,
  slug: 'testuser-sprint-my-sprint-game'
}
```

## [Link to Commented First Draft Schema](src/db.js) 

## Wireframes

/ (index), /watch (replay directory), and /watch/slug (watch screen for a specific replay)
![index, watch](documentation/index-watch.png)

/play (game mode directory), /play/slug (game screen for a specific game mode), and /create (page for creating game modes)
![play, create](documentation/play-create.png)

/login and /register (self explanatory)
![login, register](documentation/login-register.png)

## Site map

![sitemap](documentation/sitemap.png)

## User Stories or Use Cases

1. As a non-registered user, I can play game modes and replays that others have created
2. As a non-registered user, I can register
3. As a registered user, I can login
4. As a registered user, I can create my own game modes
5. As a registered user, I can create replays of games I play

## Research Topics

* (3 points) Client side form validation
  * I want client-side form validation for my game mode creation form so that users can get instant feedback when something's not right with their game mode parameters (if they put 'slow' instead of a number value for falling block speed, for example)
* (2 points) jQuery
  * I'm using jQuery for DOM manipulation and my AJAX requests.
* (3 points) p5
  * I'm using p5.js as a framework for my Tetris game frontend

8/8 required points

## [Link to Initial Main Project File](src/app.js) 

## Annotations / References Used

1. [p5 documentation](https://p5js.org/reference/) - [Game frontend](src/public/script/play.js)
2. [jQuery documentation](https://api.jquery.com/)