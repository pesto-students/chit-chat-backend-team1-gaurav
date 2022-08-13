const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const authentication = require('./Routes/Authentication');
const chat = require('./Routes/Chat');
const mongo = require('./Models/Mongo');
const common = require("./Services/Common");

const app = express(); 

const port = process.env.PORT || 5000;

require('dotenv').config({ path: './.env' }); 

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.get('/',(req,res)=>{
    res.send('Welcome to Chit Chat!');
})

app.use('/authentication',authentication);
app.use('/chat',chat);


const connectToMongo = async() => {
    await mongo().then((mongoose) => {
        console.log('mongo db connected');
    })
    .catch(err =>{
        console.log(err);
    })
}

connectToMongo();


const server = app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})




















let onlineUserArray = [];

const removeUser =(socketid) =>{
   onlineUserArray = onlineUserArray.filter(user=>user.socketid != socketid);
}


const io = socket(server,{cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }})


  
io.on('connection',(socket)=>{
        console.log('user connected',socket.id);

     socket.on('add-user',(data)=>{
        let decrypteduserid = common.Decrypt(data, process.env.SECERET_KEY);

        onlineUserArray.push({userid:decrypteduserid,socketid:socket.id});
        io.emit('online-users',onlineUserArray);

     socket.on('send-message',(data) =>{
         onlineUserArray.map(user =>{
            if(user.userid === data.receiverid){
                console.log(user,data);
                io.to(user.socketid).emit('receive-message',data);
            }
        })
     })

     })

     socket.on('disconnect',()=>{
        removeUser(socket.id);
        io.emit('online-users',onlineUserArray);
     })

     socket.on('join-group',groupid=>{
        socket.join(groupid);
     })
})

