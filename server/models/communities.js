/********************** Community Document Schema **********************/ 

const mongoose = require("mongoose");

const Community = mongoose.model('Community',{
  name: { type:String, maxLength:100, required: true },
  description: { type: String, maxLength: 500, required: true },
  postIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  startDate: { type: Date, default: Date.now },
  creator: {type: String, required: true },
  members: [String],
  url: { type:String, get(){ return `communities/${this._id}` } }
}, 'communities');

module.exports = Community;
