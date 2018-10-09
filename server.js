'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { FightSched } = require('./models');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

const app = express();

app.use(morgan('common'));
app.use(express.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'oh we good'
  });
});


app.get('/matches', (req, res) => {
  FightSched
    .find()
    .then(fights => {
      res.json(fights.map(fight => fight.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.get('/matches/:id', (req, res) => {
  FightSched
    .findById(req.params.id)
    .then(fight => res.json(fight.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

app.post('/matches', (req, res) => {
  const requiredFields = ['date', 'fighterA', 'fighterB'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  FightSched
    .create({
      date: req.body.date,
      fighterA: req.body.fighterA,
      fighterABoxrecID: req.body.fighterABoxrecID,
      fighterB: req.body.fighterB,
      fighterBBoxrecID: req.body.fighterBBoxrecID,
      location: req.body.location,
      television: req.body.television,
      comments: req.body.televison
    })
    .then(fightSched => res.status(201).json(fightSched.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });

});


app.put('/matches/:id', (req, res) => {
  if (!(req.params.id && req.body.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['date', 'fighterA', 'fighterB', 'fighterABoxrecID', 'fighterBBoxrecID', 'location', 'television'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  FightSched
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedFight => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.delete('/matches/:id', (req, res) => {
  FightSched
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted fight record with id \`${req.params.id}\``);
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});



app.delete('/:id', (req, res) => {
  FightSched
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted fight record with id \`${req.params.id}\``);
      res.status(204).end();
    });
});


app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
