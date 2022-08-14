const express  = require('express');

const router = express.Router();

const group = require('../Services/GroupChat');

router.post('/currentgroups',group.currentGroups);
router.get('/groupchat',group.loadGroupChat);

router.post('/creategroup',group.createGroup)
router.post('/updategroupmessagearray',group.updateMessageArray);

router.post('/addParticipant',group.addParticipant)
router.post('/removeParticipant',group.removeParticipant)

router.post('/addAdmin',group.addGroupAdmin)
router.post('/removeAdmin',group.removeGroupAdmin)

module.exports = router;