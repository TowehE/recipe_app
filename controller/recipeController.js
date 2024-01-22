const {recipeModel} = require("../model/recipeBookModel");

const twit = require("twit");
const { userModel } = require("../model/userRecipe");

const cloudinary = require("../middleware/cloudinary")
        


//create a recipe
exports.createRecipe = async (req, res) =>{
    try{
        const userId = req.user.userId
        const user = await userModel.findById(userId)
        const {title, ingredients, instructions } = req.body
        let createdBy;
        
    const profilePicture = req.files.profilePicture.tempFilePath
    
      const fileUploader = await cloudinary.uploader.upload(profilePicture, {folder: "FoodImages" }, ( error, profilePicture ) => {
      
       try{

        // Delete the temporary file
        fs.unlinkSync(req.files.profilePicture.tempFilePath)

          return profilePicture
      }
      catch{
          return error
      }
      })
        const recipes = await recipeModel.create({
            title,
            ingredients,
            instructions,
        profilePicture: { 
            public_id: fileUploader.public_id, 
            url: fileUploader.secure_url
        },
        createdBy :[user.fullName],
             
        })

        if(!recipes){
            return res.status(403).json({
                message: `Error creating recipe`
            })
        }
        recipes.createdBy = user.fullName
        await recipes.save()
        console.log("user fullName",recipes.createdBy)
        
        user.recipe.push(recipes)
        console.log("", recipes.createdBy)

        //recipes.createdBy.push(user._id)
        await user.save()
        // recipes.save()
       
        res.status(201).json({
            message: `You have successfully created a recipe`,
            data: recipes
        })

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}


//to get a recipe
exports.getRecipe = async (req, res) =>{
    try{
        const id = req.params.id

        const recipe = await recipeModel.findById(id)

        if(!recipe){
            return res.status(404).json({
                message: `recipe is not available`
            })
        }
        res.status(200).json({
            message: `recipe fetched successfully`,
            data: recipe
        })

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}


//to get all recipe
exports.viewAllRecipe = async (req, res) => {
    try {
  
        const recipe = await recipeModel.find()
        if(recipe.length === 0){
            return res.status(404).json({
                message: `There are no recipes present here`
            })
        }
        res.status(200).json({
            message: `recipes fetched successfully. There are ${recipe.length} recipes here`,
            data: recipe
        })

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}



//To edit a recipe
exports.editRecipe = async (req, res) => {
    try {
        //get the recipe id to be edited
        const id = req.params.id
    

        //find the recipe with the id
        const recipe = await recipeModel.findById(id);

        //(check if the recipe is available
        if (!recipe) {
            return res.status(404).json({
                message: `recipe not found`,
            })
        }

        //update the recipe
        const editedRecipe = {
            title: req.body.title || recipe.title,
            ingredients: req.body.ingredients || recipe.ingredients,
            instructions: req.body.instructions || recipe.instructions,
        }
        // console.log(editedRecipe)

        //update the database with the entered recipe
        const recipes = await recipeModel.findByIdAndUpdate(
            id,
            editedRecipe,
            { new: true }
        )

        // return a response
        return res.status(200).json({
            message: "recipe edited successfully",
            recipe: {
                title: recipes.title,
                ingredients: recipes.ingredients,
                instructions: recipes.instructions,
            }

        })
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}


//delete a recipe
exports.deleteRecipe = async (req, res) => {
    try{
    const recipeId = req.params.id;

    // Find all recipe related to the recipe
    const recipeToDelete = await recipeModel.find({ recipe: recipeId });


    // Delete the recipe
    const deletedrecipe = await recipeModel.findByIdAndDelete(recipeId);

    if (!deletedrecipe) {
        return res.status(404).json({
            message: `recipe ID not found to be deleted`
        });
    }

    res.status(200).json({
        message: `Recipe deleted successfully`,
       
    });

} catch (error) {
    res.status(404).json({
        message: error.message
    })
}
}


//post on twitter
exports.shareRecipeOnTwitter = async (req, res) => {
    try {
      
      const { recipeId } = req.body;
      const createdBy = req.user._id; // Assuming user is authenticated
  
      // Check if the user owns the recipe
      const recipe = await recipeModel.findOne({ _id: recipeId, createdBy });
  
      if (!recipe) {
        return res.status(404).json({
             message: 'Recipe not found or unauthorized' 
            });
      }
  
      const tweetText = `Check out this amazing recipe: ${recipe.title}\nIngredients: ${recipe.ingredients}\nInstructions: ${recipe.instructions}`;
  
      // Post the tweet
      T.post('statuses/update', { status: tweetText }, (error, data, response) => {
        if (error) {
          return res.status(500).json({
             message: 'Error posting tweet on Twitter' 
            });
        }
  
        res.json({
             message: 'Recipe shared on Twitter successfully' });
      });
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
    }


    