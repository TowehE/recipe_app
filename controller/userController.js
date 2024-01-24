const {userModel} =require("../model/userRecipe")
const {recipeModel} = require("../model/recipeBookModel")
require("dotenv").config()
const {validatesignUp, validatelogIn} = require("../helpers/validation");
const jwt = require ("jsonwebtoken")
const bcrypt = require ("bcrypt")
const {sendEmail} = require('../email');
const { generateDynamicEmail } = require('../emailHTML');
require('dotenv').config();
const {resetFunc} = require("../resetHTML")




    //function to capitalize the first letter
    const capitalizeFirstLetter = (str) => {
        return str[0].toUpperCase() + str.slice(1);
    };



//Function to register a new user
exports.signUp = async (req, res) => {
    try {
        const { error } = validatesignUp(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {

            const { fullName, userName, email, password } = req.body;
           

            const userNameExists = await userModel.findOne({ userName: userName.toLowerCase() });
            if (userNameExists) {
                return res.status(403).json({
                    message: 'Username taken',
                })
            }
            const emailExists = await userModel.findOne({ email: email.toLowerCase() });
            if (emailExists) {
                return res.status(200).json({
                    message: 'Email already exists',
                })
            }
            const salt = bcrypt.genSaltSync(12)
            const hashpassword = bcrypt.hashSync(password, salt);
            
            


            const user = await new userModel({
                fullName: capitalizeFirstLetter(fullName).trim(),
                userName: capitalizeFirstLetter(userName).trim(),
                email: email.toLowerCase().trim(),
                password: hashpassword,
            

            });

            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                })
            
            }
            const token = jwt.sign({
                fullName,
                userName,
                email,
            }, process.env.secret, { expiresIn: "600s" });
            user.token = token;
            const subject = 'Email Verification'
            //jwt.verify(token, process.env.secret)
            const link = `${req.protocol}://${req.get('host')}/api/v1/verify/${user.id}/${user.token}`
            const html = generateDynamicEmail(userName, link)
            sendEmail({
                email: user.email,
                html,
                subject
            })
            await user.save()
            return res.status(200).json({
                message: 'User profile created successfully',
                data: user,
            })

        }
    }catch(error){
        res.status(500).json({
            error: error.message
        })
    }
    }

//Function to verify a new user with a link
exports.verify = async (req, res) => {
    try {
      const id = req.params.id;
      const token = req.params.token;
      const user = await userModel.findById(id);
  
      // Verify the token
      jwt.verify(token, process.env.secret);
  
      // Update the user if verification is successful
      const updatedUser = await userModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });
     
  
      if (updatedUser.isVerified === true) {
        return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");
      }
  

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        // Handle token expiration
        const id = req.params.id;
        const updatedUser = await userModel.findById(id);
        // const { fullName, userName, email } = updatedUser;
        const newtoken = jwt.sign({ email: updatedUser.email, fullName: updatedUser.fullName, userName: updatedUser.userName}, process.env.secret, {expiresIn: "120s"});
        updatedUser.token = newtoken;
        updatedUser.save();
  
        const link = `${req.protocol}://${req.get('host')}/api/v1/verify/${id}/${updatedUser.token}`;
        console.log(link)
        sendEmail({
          email: updatedUser.email,
          html: generateDynamicEmail(updatedUser.fullName, link),
          subject: "RE-VERIFY YOUR ACCOUNT"
        });
        return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");
      } else {
        return res.status(500).json({
          message: error.message,
        });
      }
    }


  };

//Function to login a verified user
exports.logIn = async (req, res) => {
    try {
        const { error } = validatelogIn(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {

            const { email, password } = req.body;
            const checkEmail = await userModel.findOne({ email: email.toLowerCase() });
            if (!checkEmail) {
                return res.status(404).json({
                    message: 'User not registered'
                });
            }
            const checkPassword = bcrypt.compareSync(password, checkEmail.password);
            if (!checkPassword) {
                return res.status(404).json({
                    message: "Password is incorrect"
                })
            }
            const token = jwt.sign({
                userId: checkEmail._id,
                email: checkEmail.email,
                isAdmin: checkEmail.isAdmin
            }, process.env.secret, { expiresIn: "5h" });

            const user = {
                fullName: checkEmail.fullName,
                userName: checkEmail.userName,
                email: checkEmail.email,
                isAdmin: checkEmail.isAdmin,
                isVerified: checkEmail.isVerified
            };
            if (checkEmail.isVerified === true) {
                res.status(200).json({
                    message: "Welcome " + checkEmail.userName,
                    data:user,
                    token: token
                   
                })
                checkEmail.token = token;
                await checkEmail.save();
            } else {
                res.status(400).json({
                    message: "Sorry user not verified yet."
                })
            }
        }

    }catch(error){
        res.status(500).json({
            error: error.message
        })
    }
    }

//Function for the user incase password is forgotten
exports.forgotPassword = async (req, res) => {
    try {
        const checkUser = await userModel.findOne({ email: req.body.email });
        if (!checkUser) {
            return res.status(404).json({
                message: 'Email does not exist'
            });
        }
        else {
            const subject = 'Kindly reset your password'
            const link = `${req.protocol}://${req.get('host')}/api/v1/reset/${checkUser.id}`
            const html = resetFunc(checkUser.fullName, link)
            sendEmail({
                email: checkUser.email,
                html,
                subject
            })
            return res.status(200).json({
                message: "Kindly check your email to reset your password",
            })
        }
    }catch(error){
        res.status(500).json({
            error: error.message
        })
    }
    }

//Funtion to send the reset Password page to the server
exports.resetPasswordPage = async (req, res) => {
    try {
        const userId = req.params.userId;
        const resetPage = resetHTML(userId);

        // Send the HTML page as a response to the user
        res.send(resetPage);
    }catch(error){
        res.status(500).json({
            error: error.message
        })
    }
    }



//Function to reset the user password
exports.resetPassword = async (req, res) => {
    try {
        const userId = req.params.userId;
        const password = req.body.password;

        if (!password) {
            return res.status(400).json({
                message: "Password cannot be empty",
            });
        }

        const salt = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(password, salt);

        const reset = await userModel.findByIdAndUpdate(userId, { password: hashPassword }, { new: true });
        return res.status(200).json({
            message: "Password reset successfully",
        });
    }catch(error){
        res.status(500).json({
            error: error.message
        })
    }
    }
//Function to signOut a user
exports.signOut = async (req, res) => {
    try {
        const userId = req.params.userId
        const user = await userModel.findById(userId)

        user.token = null;
        await user.save();
        res.status(201).json({
            message: `User has been signed out successfully`
        })
    
}catch(error){
    res.status(500).json({
        error: error.message
    })
}
}



//function for admin
exports.isAdmin = async(req,res)=>{
    try{
        //track the user id
    const adminId = req.params.adminId;
    
    // track admin with the id gotten
    const admin = await userModel.findById(adminId);
    
    // check for error
    if (!admin) {
      res.status(404).json({
        message: `Oops, you're not allowed to be an admin`,
      });
      return;
    }

  const updatedAdmin = await userModel.findByIdAndUpdate(
    adminId, 
   { isAdmin:true},
    {new:true}
  )
   
        res.status(200).json({
            message: `${admin.fullName} has been made an Admin`
        })
    
    
    
    }catch(error){
        res.status(500).json({
            message:"error"
 
    })
}
}


//get all users
exports. getAllUSers = async(req,res)=>{
    try{
      const user = await userModel.find()
   if(user.length == 0 ){
      res.status(200).json({
          message:"User database is empty"
      })
   }else{
      res.status(200).json({
          message:`list of all ${user.length} users in this database`,
          data:user
      })
   }
    }catch(error){
      res.status(404).json({
          message:error
      })
  } 
  }

  // get a user
exports.getAUser = async(req,res)=>{
    try{
      const userId = req.params.userId;
      const user = await userModel.findById(userId);
   if(!user){
      res.status(404).json({
          message:"User not found"
      })
   }else{
      res.status(200).json({
          message:`${user.fullName} details`,
          data:user
      })
   }
    }catch(error){
      res.status(404).json({
          message:error
      })
  } 
  }
  

  
   //delete the user
   exports.deleteuser = async(req,res)=>{
    try{
     //track the user id
        const userId = req.params.userId;

    //track the user with the ID gotten
    const user = await userModel.findById(userId);
//check for errors
if(!user){
    res.staus(404).json({
        message: `user with id ${userId} has not been found`
    })
}
//delete the user
await userModel.findByIdAndDelete(userId);
return res.status(200).json({
    message:`user with id ${userId} has been deleted`,

})

}catch(error){
    res.status(404).json({
        message:error
    })
} 
}




