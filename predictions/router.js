'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const {Predictions} = require('./models')

const {User} = require('../users/models');

const jsonParser = bodyParser.json();

router.get('/', (req, res) => {
  Predictions
    .find()
    .then(predictions => {
      res.json(predictions.map(prediction => prediction.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

router.get('/:id', (req, res) => {
  Predictions
    .findById(req.params.id)
    .then(predict => res.json(predict.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['resultPred'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Predictions
    .create({
      user_id: req.body.user_id,
      fight_id: req.body.fight_id,
      fighter: req.body.fighter,
      resultPred: req.body.resultPred,
      roundPred: req.body.roundPred
    })
    .then(Predictions => res.status(201).json(Predictions.serialize()))
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
  const updateableFields = ['user_id', 'fight_id', 'resultPred', 'roundPred'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Predictions
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPred => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

router.delete('/:id', (req, res) => {
  Predictions
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted prediction record with id \`${req.params.id}\``);
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


module.exports = {router};
