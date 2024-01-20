//import express
const express = require("express")

const router = express.Router();

const{
    createRecipe,
    getRecipe,
    viewAllRecipe,
    editRecipe, 
deleteRecipe, 
shareRecipe, 
shareRecipeOnTwitter,

    
} = require("../controller/recipeController");
const { authenticate, admin } = require("../middleware/authetication");



///endpoint to create a recipe
router.post("/create", admin, createRecipe),

//endpoint to view recipe
router.get("/view/:id", getRecipe),

//endpoint to view  allrecipe
router.get("/viewall", viewAllRecipe),
 
//endpoint to edit a recipe
router.put("/edit/:id", admin, editRecipe),

//endpoint to delete a recipe
router.delete("/delete/:id", admin, deleteRecipe),



//endpoint to share recipe on twitter 
router.get("/sharetwi", shareRecipeOnTwitter),


module.exports = router       


