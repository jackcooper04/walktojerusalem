const mongoose = require('mongoose');
const distanceSchema = mongoose.Schema({
  distance: { type: Number, required: true },
  initials: {type: String, required:true},
  timestamp:{type:Date,require:true}

});

module.exports =  mongoose.model('distance', distanceSchema);
