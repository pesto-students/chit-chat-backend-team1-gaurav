const express  = require('express');

const router = express.Router();

const Chat = require('../Services/Chat');

router.post('/currentcontacts',Chat.CurrentContacts);
router.post('/loadchat',Chat.LoadChat);
router.post('/updatemessagearray',Chat.updateMessageArray);
router.post('/searchcontacts',Chat.searchContacts);
router.post('/addchat',Chat.addChat);
router.post('/addsendertoreceiver',Chat.addSenderToReceiver);

module.exports = router;