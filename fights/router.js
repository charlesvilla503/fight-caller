'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const {FightSched} = require('./models')

const jsonParser = bodyParser.json();

router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
  FightSched
    .findById(req.params.id)
    .then(fight => res.json(fight.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

router.post('/', (req, res) => {
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


router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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


module.exports = {router};
