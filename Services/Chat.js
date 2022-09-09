const e = require("express");
const common = require("./Common");
const UserSchema = require("../Models/UserSchema");
const SingleChat = require("../Models/SingleChatSchema");
const SingleChatSchema = require("../Models/SingleChatSchema");

exports.CurrentContacts = async (req, res) => {
  var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  try {
    let user = await UserSchema.findOne({ _id: userid });
    // let user = await UserSchema.findOne({ _id: req.body.userid });

    if (user) {
      var singlecontacts = user.singlecontacts.sort((a, b) => {
        return b.order - a.order;
      });

      // var groupcontacts = user.groupcontacts;

      var singlecontactArray = [];
      // var groupcontactArray = [];

      for (const contact of singlecontacts) {
        let singleContactObj = {};
        var contactuser = await UserSchema.findOne({ _id: contact.contactid });
        var contactChat = await SingleChat.findOne(
          { _id: contact.chatid },
          { messageArray: { $slice: 1 } }
        );

        singleContactObj["userid"] = contact.contactid;
        singleContactObj["username"] = contactuser.userName;
        singleContactObj["profileImg"] = contactuser.profileImg;
        singleContactObj["chatid"] = contact.chatid;
        singleContactObj["lastMessage"] =
          contactChat.messageArray.length !== 0
            ? contactChat.messageArray[0].message
            : "";
        singleContactObj["timestamp"] =
          contactChat.messageArray.length !== 0
            ? contactChat.messageArray[0].timestamp
            : "";
        singleContactObj["sent"] =
          contactChat.messageArray.length !== 0
            ? userid === contactChat.messageArray[0].senderid
              ? true
              : false
            : false;

        singlecontactArray.push(singleContactObj);
      }

      res.send(singlecontactArray);
    }
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.LoadChat = async (req, res) => {
  try {
    let chat = await SingleChat.findOne(
      { _id: req.body.chatid },
      { messageArray: { $slice: [req.body.start, req.body.end] } }
    );

    if (chat) {
      res.send({ messageArray: chat.messageArray, chatInfo: chat.chatInfo });
    }
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.updateMessageArray = async (req, res) => {
  var userid = common.Decrypt(req.body.senderid, process.env.SECERET_KEY);

  if (req.body.updateOrder) {
    await UserSchema.updateOne(
      { _id: userid, "singlecontacts.contactid": req.body.receiverid },
      { $set: { "singlecontacts.$.order": req.body.order } }
    );
  }

  let messagePayload = {
    message: req.body.message,
    senderid: userid,
    receiverid: req.body.receiverid,
    type: req.body.type,
    timestamp: Date.now(),
  };

  if (req.body.key != undefined || req.body.key != null) {
    messagePayload.key = req.body.key;
  }

  try {
    let update = await SingleChat.updateOne(
      { _id: req.body.chatid },
      { $push: { messageArray: { $each: [messagePayload], $position: 0 } } }
    );

    if (update.acknowledged) {
      res.send(messagePayload);
    } else {
      let response = { statusCode: 201, message: "Something went wrong!" };
      res.send(response);
    }
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.searchContacts = async (req, res) => {
  let text = req.body.text;
  var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
  try {
    // let users = await UserSchema.find({'phoneNumber': /.*  .*/});
    let users = await UserSchema.find({
      phoneNumber: { $regex: text, $options: "i" },
    });
    filteredUsers = users.filter((item) => {
      return item._id != userid;
    });

    res.send(filteredUsers);
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.addChat = async (req, res) => {
  var userid = common.Decrypt(req.body.createrid, process.env.SECERET_KEY);

  let singlechatbody = {
    membersArray: [userid, req.body.otheruser],
    messageArray: [],
    imagesArray: [],
    documentArray: [],
    chatInfo: {
      initial: true,
      senderaddedtoreceiver: false,
      initialsender: userid,
      initialreceiver: req.body.otheruser,
      blocked: false,
      blockedby: "",
    },
  };

  try {
    let newChat = await new SingleChatSchema(singlechatbody).save();

    if (newChat) {
      let singlecontactobj = {
        contactid: req.body.otheruser,
        chatid: newChat._id,
        order: 0,
        staredMessages: [],
      };

      let update = await UserSchema.updateOne(
        { _id: userid },
        { $push: { singlecontacts: { $each: [singlecontactobj] } } }
      );

      if (update.acknowledged) {
        let response = {
          statusCode: 200,
          chatid: newChat._id,
          message: "Chat Created Successfully",
        };
        res.send(response);
      }

      //   throw new Error('')
    }

    // throw new Error('');
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.addSenderToReceiver = async (req, res) => {
  let userid = common.Decrypt(req.body.senderid, process.env.SECERET_KEY);

  try {
    // let newChat = await new SingleChatSchema(singlechatbody).save();
    let singlecontactobj = {
      contactid: userid,
      chatid: req.body.chatid,
      order: 0,
      staredMessages: [],
    };
    let update = await UserSchema.updateOne(
      { _id: req.body.receiverid },
      { $push: { singlecontacts: { $each: [singlecontactobj] } } }
    );

    if (update.acknowledged) {
      let updatechat = await SingleChatSchema.updateOne(
        { _id: req.body.chatid },
        { $set: { "chatInfo.senderaddedtoreceiver": true } }
      );

      if (updatechat.acknowledged) {
        let response = {
          statusCode: 200,
          message: "sender added successfully to receivers contact",
        };
        res.send(response);
      } else {
        let response = { statusCode: 202, message: "Something went wrong!" };
        res.send(response);
      }
    } else {
      let response = { statusCode: 201, message: "Something went wrong!" };
      res.send(response);
    }
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.StarMarkMessage = async (req, res) => {
  let userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  try {
    let starMessageObj = {
      message: req.body.message,
      timestamp: req.body.timestamp,
      type: req.body.type,
    };

    new Promise(async (resolve, reject) => {
      let user = await UserSchema.findOne({
        _id: userid,
        "singlecontacts.staredMessages.timestamp": req.body.timestamp,
      });

      if (user === null) resolve();
      else reject();
    })
      .then(async () => {
        await UserSchema.updateOne(
          { _id: userid, "singlecontacts.contactid": req.body.contactid },
          {
            $push: {
              "singlecontacts.$.staredMessages": { $each: [starMessageObj] },
            },
          }
        );

        let response = {
          statusCode: 200,
          message: "Star Marked Successfully..",
        };
        res.send(response);
      })
      .catch(() => {
        let response = { statusCode: 200, message: "Already Added.." };
        res.send(response);
      });
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    res.send(response);
  }
};

exports.LoadStarMessages = async (req, res) => {
  let userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  try {
    let user = await UserSchema.find({ _id: userid });
    let contactsArray = user[0].singlecontacts;

    var starMessageArray = [];
    contactsArray.map((contact) => {
      if (contact.chatid == req.body.chatid) {
        starMessageArray = contact.staredMessages;
      }
    });

    res.send(starMessageArray);
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.GetImagesArray = async (req, res) => {
  try {
    let chatObj = await SingleChat.find({ _id: req.body.chatid });

    res.send(chatObj[0].imagesArray);
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.UpdateImagesArray = async (req, res) => {
  try {
    let imageObj = {
      key: req.body.key,
      timestamp: Date.now(),
    };

    let update = await SingleChat.updateOne(
      { _id: req.body.chatid },
      { $push: { imagesArray: { $each: [imageObj], $position: 0 } } }
    );

    if (update.modifiedCount === 1) {
      let response = { statusCode: 200 };
      res.send(response);
    } else {
      let response = { statusCode: 201 };
      res.send(response);
    }
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.getDocumentsArray = async (req, res) => {
  try {
    let chatObj = await SingleChat.find({ _id: req.body.chatid });

    res.send(chatObj[0].documentArray);
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};

exports.updateDocumentsArray = async (req, res) => {
  try {
    let documentObj = {
      key: req.body.key,
      name: req.body.name,
      size: req.body.size,
      timestamp: Date.now(),
    };

    let update = await SingleChat.updateOne(
      { _id: req.body.chatid },
      { $push: { documentArray: { $each: [documentObj], $position: 0 } } }
    );

    if (update.modifiedCount === 1) {
      let response = { statusCode: 200 };
      res.send(response);
    } else {
      let response = { statusCode: 201 };
      res.send(response);
    }
  } catch (err) {
    let response = { statusCode: 201, message: "Something went wrong!" };
    console.log(err);
    res.send(response);
  }
};
