const e = require("express");
const common = require("./Common");
const UserSchema = require("../Models/UserSchema");
const SingleChat = require("../Models/SingleChatSchema");
const GroupChat = require("../Models/GroupChatSchema");

exports.currentGroups = async (req, res) => {
    var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    try{
        let user = await UserSchema.findOne({ _id: userid });
        // let user = await UserSchema.findOne({ _id: '62f3e0a0e38d15bddb797599' });

        if(user){
           
            var groupcontacts = user.groupcontacts.sort((a, b) => {
                                  return b.order - a.order;
                                });
        
            var groupcontactArray = [];

            for (const contact of groupcontacts) {
                var group =  await GroupChat.findOne({ _id: contact.groupId});
                if(group){
                    
                    let {_id,name,membersArray,messageArray}=group; 
                    
                    let filteredMemberArray = membersArray.filter((member) =>{
                        return member.userid !== userid; 
                    })

                    let lastMessage = (messageArray.length !== 0) ? messageArray[0].message: '';
                    let timestamp =(messageArray.length !== 0 )?messageArray[0].timestamp:'';
                    let sent =(messageArray.length !== 0 )?((userid === messageArray[0].senderid) ? true : false):false;
                    
                    groupcontactArray.push({groupid:_id,groupname:name,groupmembersarray:filteredMemberArray,lastMessage,timestamp,sent});
                }
            }
          
            res.send(groupcontactArray);
        }
    }
    catch (err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }

};

exports.loadGroupChat = async (req, res) => {
    try{
        let chat = await GroupChat.findOne({ _id: req.body.chatid },{messageArray:{$slice:[req.body.start,req.body.end]}});

        if(chat){
            res.send(chat);
        }
    }
    catch (err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }

};


exports.createGroup=async(req,res)=>{
    // let admin='62f3e4d053ee948106c5cd70'
    // let groupmembers=['62f6416652bfdbce5369db64','62f3e0a0e38d15bddb797599']
    // let groupname='Testing 321 grp'

req.body.user.userid=common.Decrypt(req.body.user.userid, process.env.SECERET_KEY);
let {user:admin,groupmembers,groupname}=req.body
    try{
       let newGroup= await new GroupChat({
            name:groupname,
            membersArray: [...groupmembers,admin],
            messageArray : [],
            adminArray:[admin],
            documentArray:[],
            imagesArray:[]
        }).save()
      
    for(let member of groupmembers){
     await addGroupToUser(member.userid,newGroup._id)
    } 
    await addGroupToUser(admin.userid,newGroup._id);
        res.send('Group is created');
    }
    catch(err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }
}

exports.addParticipant=async(req,res)=>{
 
    var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    let {addParticipants,groupid}=req.body
     let status=await checkGroupAdminStatus(userid,groupid);



   if(status){

    try{
        for (addParticipant of addParticipants){
            let update = await GroupChat.updateOne(
                { _id: groupid },{$push: {membersArray:{...addParticipant}}}
             )
            if(update.acknowledged){
                await addGroupToUser(addParticipant.userid,groupid);
                res.send({
                    statusCode:204,
                    message:'Member added'
                 })
            } 
            else{
                throw new Error('Not able to add this number')
            }
        }
    }
    catch(err){
        res.send({ statusCode: 201,
        message: "Something went wrong!" });
        console.log(err);
    }
   
   }
   else{
    res.send({
        statusCode:403,
        message:'You are not an admin'
    })
   }
    
}

exports.removeParticipant=async(req,res)=>{
    let removeParticipant='62f6416652bfdbce5369db64'
    let groupid='62f78b1d46c059027cf82fcf'
    // var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    // let {addParticipant,groupid}=req.body
    //  let status=await checkGroupAdminStatus(userid,groupid);
    let status=await checkGroupAdminStatus('62f3e4d053ee948106c5cd70','62f78b1d46c059027cf82fcf');

    if(status){
        try{
            let update = await GroupChat.updateOne(
                { _id: groupid },{$pull: {membersArray:removeParticipant}}
             )
            if(update.acknowledged){
                await removeGroupFromUser(removeParticipant, groupid);
                res.send({
                    statusCode:204,
                    message:'Member removed'
                 })
            } 
            else{
                throw new Error('Not able to remove this number')
            }
        }
        catch(err){
            res.send({ statusCode: 201,
            message: "Something went wrong!" });
            console.log(err);
        }
    }
    else{
     res.send({
         statusCode:403,
         message:'You are not an admin'
     })
    }
}

exports.addGroupAdmin=async(req,res)=>{
    let addAdmin='00000000000000000000'
    let groupid='62f7b50f74c87885d345c8b6'
    // var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    // let {addParticipant,groupid}=req.body
    //  let status=await checkGroupAdminStatus(userid,groupid);
    let status=await checkGroupAdminStatus('62f3e4d053ee948106c5cd7','62f7b50f74c87885d345c8b6');

    if(status){
        try{
            let update = await GroupChat.updateOne(
                { _id: groupid },{$push: {adminArray:addAdmin}}
             )
            if(update.acknowledged){
                res.send({
                    statusCode:204,
                    message:'Admin added'
                 })
            } 
            else{
                throw new Error('Not able to make this user Admin')
            }
        }
        catch(err){
            res.send({ statusCode: 201,
            message: "Something went wrong!" });
            console.log(err);
        }
    }
    else{
     res.send({
         statusCode:403,
         message:'You are not an admin'
     })
    }
}

exports.removeGroupAdmin=async(req,res)=>{
    let removeAdmin='62f6416652bfdbce5369db64'
    let groupid='62f78b1d46c059027cf82fcf'
    // var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    // let {addParticipant,groupid}=req.body
    //  let status=await checkGroupAdminStatus(userid,groupid);
    let status=await checkGroupAdminStatus('62f3e4d053ee948106c5cd7','62f7b50f74c87885d345c8b6');

    if(status){
        try{
            let update = await GroupChat.updateOne(
                { _id: groupid },{$pull: {adminArray:removeAdmin}}
             )
            if(update.acknowledged){
                res.send({
                    statusCode:204,
                    message:'Admin removed'
                 })
            } 
            else{
                throw new Error('Not able to remove this user as Admin')
            }
        }
        catch(err){
            res.send({ statusCode: 201,
            message: "Something went wrong!" });
            console.log(err);
        }
    }
    else{
     res.send({
         statusCode:403,
         message:'You are not an admin'
     })
    }
}


exports.updateMessageArray = async (req, res) => {
    var userid = common.Decrypt(req.body.senderid, process.env.SECERET_KEY);
    try {

    if (req.body.updateOrder) {
        let updaed = await UserSchema.updateOne(
          { _id: userid, "groupcontacts.groupId": req.body.groupid },
          { $set: { "groupcontacts.$.order": req.body.order } }
        );
            
      } 
  
    var messagePayload = {
      message: req.body.message,
      senderid: userid,
      type: req.body.type,
      timestamp: Date.now(),
    };

    console.log('req body',req.body)

    if(req.body.key)
    {
        messagePayload.key = req.body.key
        console.log('inside if',req.body.key)
        
    }
  


      let update = await GroupChat.updateOne(
        { _id: req.body.groupid },
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
  



checkGroupAdminStatus=async (userId,groupId)=>{
    try{
    let groupchat = await GroupChat.findOne({_id:groupId})
    let find= groupchat.adminArray.find((user)=>{ return user.userid===userId})
    
            if(find){
                return true
            }
            else{
                return false
            }
    
    }
    catch(err){
        console.log(err);
    }
}

addGroupToUser=async (userId,groupId)=>{
    try{
        let update = await UserSchema.updateOne(
            { _id: userId },{$push: {groupcontacts:{groupId:(groupId).toString(),order:0,staredMessages:[]}}}
         )
         return update.acknowledged
    }
    catch(err){
        console.log(err);
    }
    
}
removeGroupFromUser=async (userId,groupId)=>{
    try{
        let update = await UserSchema.updateOne(
            { _id: userId },{$pull: {groupcontacts:{groupId:groupId,order:0}}}
         )
         return update.acknowledged
    }
    catch(err){
        console.log(err);
    }
}    
    

exports.StarMarkMessage = async (req, res) => {
    let userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

    console.log('hello')
    
    try {
      var starMessageObj = {
        message: req.body.message,
        timestamp: req.body.timestamp,
        type: req.body.type,
      };
      
      if(req.body.senderid){
        starMessageObj.senderid = req.body.senderid
      }

  
      new Promise( async (resolve,reject) => {
  
        let user = await UserSchema.findOne({  _id: userid, "groupcontacts.staredMessages.timestamp": req.body.timestamp })
  
        if(user === null)
        resolve()
        else
        reject()
  
      })
      .then( async () => {
        
        console.log('inside resolve',userid,req.body.groupid,starMessageObj);

        await UserSchema.updateOne(
            { _id: userid, "groupcontacts.groupId": req.body.groupid },
            { $push: {
              "groupcontacts.$.staredMessages": { $each: [starMessageObj] },
            }}
          );
  
          let response = {statusCode: 200,message: "Star Marked Successfully..",};
          res.send(response);
      })
      .catch(() => {
        let response = {statusCode: 200,message: "Already Added..",};
          res.send(response);
      })
  
  
    } catch (err) {
      let response = { statusCode: 201, message: "Something went wrong!" };
      res.send(response);
    }
  };
  
  exports.LoadStarMessages = async (req, res) => {
    let userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
  
    try {
      let user = await UserSchema.find({ _id: userid });
      let contactsArray = user[0].groupcontacts;
  
      var starMessageArray = [];
      contactsArray.map((contact) => {
        if (contact.groupId == req.body.groupid) {
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
  
      let chatObj = await GroupChat.find(
        { _id: req.body.groupid }
      );
  
      res.send(chatObj[0].imagesArray);
  
    } catch (err) {
      let response = { statusCode: 201, message: "Something went wrong!" };
      console.log(err);
      res.send(response);
    }
  };
  
  exports.UpdateImagesArray = async (req, res) => {
  
    try {
  
      let imageObj={
        key:req.body.key,
        timestamp:Date.now()
      }
  
      console.clear();
      console.log(req.body);

      let update = await GroupChat.updateOne(
        { _id: req.body.groupid },
        { $push: { imagesArray: { $each: [imageObj], $position: 0 } } }
      );
  
     
      if(update.modifiedCount === 1){
        let response = { statusCode: 200 };
        res.send(response);
      }
      else{
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
  
      let chatObj = await GroupChat.find(
        { _id: req.body.groupid }
      );
  
      res.send(chatObj[0].documentArray);
  
    } catch (err) {
      let response = { statusCode: 201, message: "Something went wrong!" };
      console.log(err);
      res.send(response);
    }
  };
  
  
  exports.updateDocumentsArray = async (req, res) => {
  
    try {
  
      let documentObj={
        key:req.body.key,
        name:req.body.name,
        size:req.body.size,
        timestamp:Date.now()
      }
  
      let update = await GroupChat.updateOne(
        { _id: req.body.groupid },
        { $push: { documentArray: { $each: [documentObj], $position: 0 } } }
      );
  
     
      if(update.modifiedCount === 1){
        let response = { statusCode: 200 };
        res.send(response);
      }
      else{
        let response = { statusCode: 201 };
        res.send(response);
      }
  
    } catch (err) {
      let response = { statusCode: 201, message: "Something went wrong!" };
      console.log(err);
      res.send(response);
    }
  };

  exports.getGroupMembers=async(req,res)=>{
    try {
  
      let group = await GroupChat.find(
        { _id: req.body.groupid }
      );
  
      res.send(group.membersArray);
  
    } catch (err) {
      let response = { statusCode: 201, message: "Something went wrong!" };
      console.log(err);
      res.send(response);
    }
  };

  exports.updateProfilePic=async(req,res)=>{
    var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    try {
      let user = await UserSchema.findOne({ _id: userid });
      for(let group of user.groupcontacts){
        const query = { _id:group.groupId , "membersArray.userid": req.body.userid };
        const updateDocument = {
          $set: { "membersArray.profileImg": req.body.profileImg }
        };
        const result = await GroupChat.updateOne(query, updateDocument);
      }
      res.send({
        message:'Profile Image Updated Succesfully'
      })
     
     
    } catch (err) {
      let response = { statusCode: 201, message: "Something went wrong!" };
      console.log(err);
      res.send(response);
    }
  };