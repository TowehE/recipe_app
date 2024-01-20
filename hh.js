exports.shareRecipeOnTwitter = async (req, res) => {
 try{
  
      const { recipeId } = req.body;
      const createdBy = req.user._id; // Assuming user is authenticated
  
      // Check if the user owns the recipe
      const recipe = await Recipe.findOne({ _id: recipeId, createdBy });
  
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found or unauthorized' });
      }
  
      const tweetText = `Check out this amazing recipe: ${recipe.title}\nIngredients: ${recipe.ingredients}\nInstructions: ${recipe.instructions}`;
  
      // Post the tweet
      T.post('statuses/update', { status: tweetText }, (err, data, response) => {
        if (err) {
          return res.status(500).json({ message: 'error posting tweet on Twitter' });
        }
  
        res.json({ message: 'Recipe shared on Twitter successfully' });
      });
    }catch(error){
      res.status(500).json({
          error: error.message
      })
  }
  }


exports.shareRecipe = async (req, res) => {
    try {
      const { id: recipeId } = req.params;
      const { sharedWithUsername } = req.body;
  
      // Find the recipe by ID and populate the createdBy field
      const recipe = await Recipe.findById(recipeId).populate('createdBy');
  
      // Check if the recipe exists
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
  
      // Find the user to whom the recipe will be shared
      const sharedWithUser = await User.findOne({ username: sharedWithUsername });
  
      // Check if the user exists
      if (!sharedWithUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is trying to share the recipe with themselves
      if (recipe.createdBy.equals(sharedWithUser._id)) {
        return res.status(400).json({ message: 'Cannot share the recipe with yourself' });
      }
  
      // Assuming you have a 'sharedRecipes' field in the User model
      sharedWithUser.sharedRecipes.push(recipe);
      await sharedWithUser.save();
  
      res.status(200).json({ message: 'Recipe shared successfully', data: recipe });
    }catch(error){
      res.status(500).json({
          error: error.message
      })
  }
  }

  exports.shareRecipe = async (req, res) => {
    try {
      const recipeId = req.params.id;
      const sharedWithUsername = req.body.sharedWithUsername;
  
      const recipe = await Recipe.findById(recipeId).populate('createdBy');
  
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
  
      const sharedWithUser = await User.findOne({ username: sharedWithUsername });
  
      if (!sharedWithUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Assuming you have a 'sharedRecipes' field in the User model
      sharedWithUser.sharedRecipes.push(recipe);
      await sharedWithUser.save();
  
      res.json({ message: 'Recipe shared successfully', data: recipe });
    }catch(error){
      res.status(500).json({
          error: error.message
      })
  }
  }
