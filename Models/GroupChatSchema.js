const mongoose = require('mongoose');

let requiredstring  = {type: String, required: true}

const GroupChat = mongoose.Schema({
    name:requiredstring,
    membersArray: Array,
    messageArray : Array,
    adminArray:Array
})

module.exports = mongoose.model('groupChats',GroupChat);