const e = require("express");
const common = require("./Common");
const UserSchema = require("../Models/UserSchema");
const SingleChat = require("../Models/SingleChatSchema");
const GroupChat = require("../Models/GroupChatSchema");



exports.CurrentContacts = async (req, res) => {
  
    var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

    try{

        let user = await UserSchema.findOne({ _id: userid });

        if(user){
           
            var singlecontacts = user.singlecontacts;
            // var groupcontacts = user.groupcontacts;

            var singlecontactArray = [];
            // var groupcontactArray = [];

            for (const contact of singlecontacts) {
                let singleContactObj = {};
                var contactuser =  await UserSchema.findOne({ _id: contact.contactid });
                singleContactObj['userid'] = contact.contactid;
                singleContactObj['username'] = contactuser.userName;
                singleContactObj['chatid'] = contact.chatid;
                
                singlecontactArray.push(singleContactObj);
            }

        
            res.send(singlecontactArray);

        }
      

    }
    catch (err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }

};


exports.LoadChat = async (req, res) => {
  

    try{

        let chat = await SingleChat.findOne({ _id: req.body.chatid });

        if(chat){
            res.send(chat.messageArray);
        }
      

    }
    catch (err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }

};


exports.updateMessageArray = async (req, res) => {
  
    var userid = common.Decrypt(req.body.senderid, process.env.SECERET_KEY);

    let messagePayload = {
        message : req.body.message,
        senderid: userid,
        receiverid:req.body.receiverid,
        senderstatus:'sent',
        type:req.body.type,
        timestamp:Date.now()
    }

    try{

        let update = await SingleChat.updateOne(
            { _id: req.body.chatid },{$push: {messageArray: {$each: [messagePayload],$position: 0}}}
         )
      
        if(update.acknowledged){
            res.send(messagePayload);
        }
        else{
            let response = { statusCode: 201, message: "Something went wrong!" };
            res.send(response);
        }

    }
    catch (err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }

};




