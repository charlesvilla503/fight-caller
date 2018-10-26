'use strict';

const mongoose = require('mongoose');


// same schema for the results model
const predictionSchema = mongoose.Schema({

        user_id     : {type: String},
        fight_id    : {type: String},
        fighter     : {type: String},
        resultPred  : {type: String},
        roundPred   : {type: String}

},
      {collection: 'predictions'}
);

predictionSchema.methods.serialize = function () {
  return {
    id: this._id,
    user_id: this.user_id,
    fight_id: this.fight_id,
    fighter: this.fighter,
    resultPred: this.resultPred,
    roundPred: this.roundPred

  };
};

const Predictions = mongoose.model('Predictions', predictionSchema);

module.exports = {Predictions};
