'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const fightSchema = mongoose.Schema({
  date: {type: Date},
  fighterA: {
    firstName: String,
    lastName: String
  },
  fighterABoxrecID: {type: String},
  fighterB: {
    firstName: String,
    lastName: String
  },
  fighterBBoxrecID: {type: String},
  location: {type: String},
  television: {type: String}
},
  {collection: 'fights'}
);

fightSchema.virtual('fighterAName').get(function() {
  return `${this.fighterA.firstName} ${this.fighterA.lastName}`.trim();
});

fightSchema.virtual('fighterBName').get(function() {
  return `${this.fighterB.firstName} ${this.fighterB.lastName}`.trim();
});


fightSchema.methods.serialize = function() {
  return {
    id: this._id,
    date: this.date,
    fighterA: this.fighterAName,
    fighterABoxrecID: this.fighterABoxrecID,
    fighterB: this.fighterBName,
    fighterBBoxrecID: this.fighterBBoxrecID,
    location: this.location,
    television: this.television
  };
};

const FightSched = mongoose.model('FightSched', fightSchema);

module.exports = {FightSched};
