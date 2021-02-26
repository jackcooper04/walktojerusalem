const mongoose = require('mongoose');
const distanceSchema = mongoose.Schema({
  distance: { type: Number, required: true },
  name: {type: String, required:true},
  takeoff:{type:Number,required:true},
  info : {type:Object,required:true}
});

module.exports =  mongoose.model('checkpoint', distanceSchema);
