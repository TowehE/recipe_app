const mongoose = require ("mongoose")

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
    
        required: true
    },
   
    
    isAdmin:{
        type:Boolean,
        default: false
    },
    token:{
        type: String,
       
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    recipe:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "recipe"
    }],
   
    blacklist:{
        type: Array,
        default:[],

    },
    
},{timestamps:true})


const userModel = mongoose.model("user", userSchema)

module.exports ={userModel}