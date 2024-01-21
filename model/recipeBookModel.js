const mongoose = require ("mongoose")

const recipeSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    ingredients:{
        type: String,
        required: true
    },
    instructions:{
        type: String,
        required: true
    },
  
   profilePicture:{
    public_id:{
        type: String,
    },
    url:{
    type: String,

},
createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'user'
    },
   }, 


},{timestamps:true})


const recipeModel = mongoose.model("recipe", recipeSchema)

module.exports = {recipeModel} 