const jwt =require("jsonwebtoken")
const User =require("../models/user")

const auth = async (req, res ,next)=>{

      try{
         //把Bearer(類型)去掉，只要token內容
        const token = req.body.token || req.header("Authorization").replace('Bearer ', '') 

        
        const decoded=jwt.verify(token ,process.env.JWT_SECRET) 
          
           const user =await User.findOne(
             { _id: decoded._id , 'tokens.token' : token })
              
            if(!user) {
              throw new Error("User does not exist!")
          }
        req.user =user
         next()  
        
      }catch(e) {
          res.status(401).send({msg:e.message})
                    
      }
}

module.exports = auth