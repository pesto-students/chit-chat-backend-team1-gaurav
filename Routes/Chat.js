const express  = require('express');

const router = express.Router();

const Chat = require('../Services/Chat');

router.post('/currentcontacts',Chat.CurrentContacts);
router.post('/loadchat',Chat.LoadChat);
router.post('/updatemessagearray',Chat.updateMessageArray);

module.exports = router;