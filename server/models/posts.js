/********************** Post Document Schema **********************/ 

const mongoose = require("mongoose");

const Post = mongoose.model('Post',{
    title: { type: String, maxLength: 100, required: true },
    content: { type:String, required: true },
    linkFlairID: { type: mongoose.Schema.Types.ObjectId, ref: 'LinkFlair' },
    postedBy: { type:String, required: true },
    postedDate: { type:Date, default:Date.now },
    commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    allComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    views: { type: Number, default: 0 },
    upVotes: {type: Number, default: 0 },
    downVotes: {type: Number, default: 0 },
    url: { type:String, get() { return `posts/${this._id}`; } }
}, 'posts')

module.exports = Post;
