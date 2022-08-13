const mongoose = require('mongoose');

let requiredstring  = {type: String, required: true}

const SingleChat = mongoose.Schema({

    membersArray: Array,
    messageArray : Array

})

module.exports = mongoose.model('singlechats',SingleChat);