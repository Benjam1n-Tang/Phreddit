/********************** Link Flair Document Schema **********************/ 

const mongoose = require("mongoose");

const LinkFlair = mongoose.model('LinkFlair',{
    content: { type: String, maxLength: 30, required: true },
    url:{ type:String, get(){ return `linkFlairs/${this._id}`; } }
}, 'linkflairs');


module.exports = LinkFlair;
