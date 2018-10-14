var mongoose = require('mongoose');

var userScoreSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    scoredate: Date,
    score: Number
  });
  

module.exports = mongoose.model('UserScore', userScoreSchema);