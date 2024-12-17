/********************** User Document Schema **********************/ 

const mongoose = require("mongoose");

const User = mongoose.model('User',{
  firstName: { type:String, trim: true, required: true },
  lastName: { type:String, trim: true, required: true },
  email: { type:String, unique: true, trim: true, required: true },
  password: { type:String, required: true },
  displayName: { type:String, unique: true, trim: true, required: true },
  startDate: { type: Date, default: Date.now },
  communityIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  postIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LinkFlair' }],
  reputation: { type: Number, default: 100 },
  admin: { type: Boolean, default: false },
  url: { type:String, get(){ return `users/${this._id}` } }
}, 'users');

module.exports = User;