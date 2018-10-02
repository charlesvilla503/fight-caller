'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { FightSched } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

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
      television: req.body.television
    })
    .then(fightSched => res.status(201).json(fightSched.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });

});


app.delete('/matches/:id', (req, res) => {
  FightSched
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
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

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
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

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
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

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
