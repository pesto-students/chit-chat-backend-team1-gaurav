const e = require("express");
const common = require("./Common");
const UserSchema = require("../Models/UserSchema");
const SingleChat = require("../Models/SingleChatSchema");
const GroupChat = require("../Models/GroupChatSchema");

exports.currentGroups = async (req, res) => {

    // var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);

    try{
        // let user = await UserSchema.findOne({ _id: userid });
        let user = await UserSchema.findOne({ _id: '62f3e0a0e38d15bddb797599' });

        if(user){
           
            var groupcontacts = user.groupcontacts;

            var groupcontactArray = [];

            for (const contact of groupcontacts) {
                var group =  await GroupChat.findOne({ _id: contact});
                let {_id,name,members}=group;             
                groupcontactArray.push({_id,name,members});
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

        // let chat = await GroupChat.findOne({ _id: req.body.chatid });
        let chat = await GroupChat.findOne({ _id:"62f78b1d46c059027cf82fcf" });

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
    let admin='62f3e4d053ee948106c5cd70'
    let groupmembers=['62f6416652bfdbce5369db64','62f3e0a0e38d15bddb797599']
    let groupname='Testing 321 grp'

// let admin=common.Decrypt(req.body.userid, process.env.SECERET_KEY);
// let {groupmembers,groupname}=req.body
    try{
       let newGroup= await new GroupChat({
            name:groupname,
            membersArray: [...groupmembers,admin],
            messageArray : [],
            adminArray:[admin]
        }).save()
      
    for(let member of newGroup.membersArray){
     await addGroupToUser(member,newGroup._id)
    } 
        res.send('Group is created');
    }
    catch(err){
        let response = { statusCode: 201, message: "Something went wrong!" };
        console.log(err);
        res.send(response); 
    }
}

exports.addParticipant=async(req,res)=>{
    let addParticipant='00000000000000000000'
    let groupid='62f7b50f74c87885d345c8b6'
    // var userid = common.Decrypt(req.body.userid, process.env.SECERET_KEY);
    // let {addParticipant,groupid}=req.body
    //  let status=await checkGroupAdminStatus(userid,groupid);
   let status=await checkGroupAdminStatus('62f3e4d053ee948106c5cd70','62f7b50f74c87885d345c8b6');

   if(status){
    try{
        let update = await GroupChat.updateOne(
            { _id: groupid },{$push: {membersArray:addParticipant}}
         )
        if(update.acknowledged){
            await addGroupToUser(addParticipant,groupid);
            res.send({
                statusCode:204,
                message:'Member added'
             })
        } 
        else{
            throw new Error('Not able to add this number')
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



exports.updateMessageArray=async(req,res)=>{
    
}



checkGroupAdminStatus=async (userId,groupId)=>{
    try{
    let groupchat = await GroupChat.findOne({_id:groupId})
    console.log('group',groupchat);
    let find= groupchat.adminArray.find((user)=>{ return user===userId});
    console.log('find',find);
    
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
            { _id: userId },{$push: {groupcontacts:groupId}}
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
            { _id: userId },{$pull: {groupcontacts:groupId}}
         )
         return update.acknowledged
    }
    catch(err){
        console.log(err);
    }
}    
    