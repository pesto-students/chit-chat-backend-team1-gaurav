const e = require("express");
const common = require("./Common");
const UserSchema = require("../Models/UserSchema");
const SingleChat = require("../Models/SingleChatSchema");
const SingleChatSchema = require("../Models/SingleChatSchema");



exports.CurrentContacts = async (req, res) => {
  var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

  try {
    let user = await UserSchema.findOne({ _id: userid });

    if (user) {
      var singlecontacts = user.singlecontacts.sort((a, b) => 
      {
        return b.order - a.order
      });
     
      // var groupcontacts = user.groupcontacts;

      var singlecontactArray = [];
      // var groupcontactArray = [];

      for (const contact of singlecontacts) {
        let singleContactObj = {};
        var contactuser = await UserSchema.findOne({ _id: contact.contactid });
        singleContactObj["userid"] = contact.contactid;
        singleContactObj["username"] = contactuser.userName;
        singleContactObj["chatid"] = contact.chatid;

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
    let chat = await SingleChat.findOne({ _id: req.body.chatid });

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


  if(req.body.updateOrder){
    await UserSchema.updateOne({ _id:userid,"singlecontacts.contactid" : req.body.receiverid },
                               { $set: { "singlecontacts.$.order" : req.body.order }});
  
  }

  let messagePayload = {
    message: req.body.message,
    senderid: userid,
    receiverid: req.body.receiverid,
    senderstatus: "sent",
    type: req.body.type,
    timestamp: Date.now(),
  };

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
  console.log('user id received',userid);
  try {
    // let users = await UserSchema.find({'phoneNumber': /.*  .*/});
    let users = await UserSchema.find({
      phoneNumber: { $regex: text, $options: "i" },
    });
    filteredUsers=users.filter((item)=>{return (item._id!=userid)})
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
        order:0
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
    let singlecontactobj = { contactid: userid, chatid: req.body.chatid,order:0 };
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
