const express = require("express");

const router = express.Router();

const group = require("../Services/GroupChat");

router.post("/currentgroups", group.currentGroups);
router.post("/loadgroupchat", group.loadGroupChat);
router.post("/creategroup", group.createGroup);
router.post("/updategroupmessagearray", group.updateMessageArray);
router.post("/addParticipant", group.addParticipant);
router.post("/removeParticipant", group.removeParticipant);
router.post("/addAdmin", group.addGroupAdmin);
router.post("/removeAdmin", group.removeGroupAdmin);
router.post("/starmarkmessage", group.StarMarkMessage);
router.post("/loadstarmessages", group.LoadStarMessages);
router.post("/getimagesarray", group.GetImagesArray);
router.post("/updateimagesarray", group.UpdateImagesArray);
router.post("/updatedocumentsarray", group.updateDocumentsArray);
router.post("/getdocumentsarray", group.getDocumentsArray);
router.post("/getgroupmembers", group.getGroupMembers);
router.post("/updateprofilepic", group.updateProfilePic);

module.exports = router;
