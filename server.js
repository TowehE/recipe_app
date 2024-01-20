//import express
const express = require("express");

const cors = require("cors")

//import confg
require("./dbConfig/recipeBookDbConfg")

require("dotenv").config();
// import routers
const userRouter  = require("./router/userRouter");
const recipeRouter = require("./router/recipeRouter")
const fileUpload = require("express-fileupload")


// create an app from express module
const app = express();

// use the express middleware
app.use(express.json());

app.use(cors("*"))

app.use(fileUpload({
    useTempFiles: true,
    limits:{ fileSize: 5 * 1024 *1024}
}))

const port = process.env.port

app.get("/", (req,res)=>{
    res.send("You're welcome to the RECIPE API")
})

app.use("/api/v1", userRouter)
app.use("/api/v1", recipeRouter)




//listen to  the port
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})