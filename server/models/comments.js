/********************** Comment Document Schema **********************/ 

const mongoose = require("mongoose");

const Comment = mongoose.model('Comment',{
    content: { type: String, maxLength: 500, required: true },
    commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    commentedBy: { type: String, required: true },
    commentedDate: { type: Date, default: Date.now },
    upVotes: {type: Number, default: 0 },
    downVotes: { type: Number, default: 0},
    url: { type: String, get() { return `comments/${this._id}`; }},
}, 'comments');

module.exports = Comment;
