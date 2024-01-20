const hapiJoiValidator = require("@hapi/joi")

const validatesignUp =(data) => {

    const validateRecipe = hapiJoiValidator.object({ 
        fullName: hapiJoiValidator.string().min(3).max(40).trim().pattern(/^[a-zA-Z]+ [a-zA-Z]+$/).required().messages({  
            "string.empty":"Full name cannot be left empty",
            "string.min": "minimum of 3 characters",
           "string.pattern.base": "Full name must contain both first name and last name separated by a space"
            
        }), 

        userName: hapiJoiValidator.string().min(3).max(40).trim().pattern(/^[A-Za-z/s]+$/).required().messages({  
            "string.empty":"Username cannot be left empty",
            "string.min": "minimum of 3 characters",
             "string.pattern.base": "Username must contain characters"
            
        }), 

        email: hapiJoiValidator.string().email({ tlds: { allow: false } }).min(5).pattern(new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).trim().required().messages({
            "string.empty":"email cannot be left empty",
            "string.pattern.base": "Invalid email format"
             
        }),  

        password: hapiJoiValidator.string().min(8).max(30).trim().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )).required().messages({
                "string.empty":"password cannot be left empty",
                "string.pattern.base":  "Password must contain at eight character long, one uppercase letter,one uppercase letter,one digit, one special character" 
            
                
            }),  
    
       
    })
    return validateRecipe.validate(data);


}

const validatelogIn = (data) => {  
    try{
        
  
        const validateUser= hapiJoiValidator.object({
            email: hapiJoiValidator.string().email({ tlds: { allow: false } }).trim().min(5).pattern(new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)).required().messages({
                "string.empty":"email cannot be left empty",
                "string.pattern.base": "Invalid email format"
            }),
            password: hapiJoiValidator.string().min(8).max(30).trim().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )).required().messages({
                "string.empty":"password cannot be left empty",
                "string.pattern.base": "Password must contain at eight character long, one uppercase letter,one uppercase letter,one digit, one special character" 
            
                
            }), 
          
      
     })

   return validateUser.validate(data);

     } catch (err) {
        console.log(err.message);
        }
    };

module.exports = {validatesignUp,
    validatelogIn
    
};