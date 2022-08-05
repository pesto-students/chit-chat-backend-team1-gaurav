const express = require('express');
const cors = require('cors');

const authentication = require('./Routes/Authentication');
const mongo = require('./Models/Mongo')

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


app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})

const connectToMongo = async() => {
    await mongo().then((mongoose) => {
        console.log('mongo db connected');
    })
    .catch(err =>{
        console.log(err);
    })
}

connectToMongo();