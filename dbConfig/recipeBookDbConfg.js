//import mongoose
const mongoose = require('mongoose')    

require('dotenv').config();

//connect to database
const db = process.env.db;

mongoose.connect(db).then(()=>{
    console.log("Connection established successfully")
})
.catch((err)=>{
    console.log("Failed to connect to database " +err.message) 
 
});


