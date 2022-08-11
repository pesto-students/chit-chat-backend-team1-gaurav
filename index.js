const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const authentication = require('./Routes/Authentication');
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

app.use('/authentication',authentication)


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

        console.log(decrypteduserid);
        if(decrypteduserid === '62f3e4d053ee948106c5cd70'){
            var targetedid = onlineUserArray.filter(user => user.userid == '62f3e0a0e38d15bddb797599')
            io.to(targetedid[0].socketid).emit('alert','hardik connected');
            console.log(targetedid[0].socketid,targetedid[0].userid);
        }

     })

     socket.on('disconnect',()=>{
        removeUser(socket.id);
        io.emit('online-users',onlineUserArray);
     })

     socket.on('join-group',groupid=>{
        socket.join(groupid);
     })
})

