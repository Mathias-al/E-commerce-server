const mongoose = require("mongoose")
const validator = require("validator")
const jwt =require('jsonwebtoken')
const bcrypt =require('bcryptjs')

const userSchema =new mongoose.Schema({
    name: {             
        type:String,
        trim:true,
        lowercase:true
    },
    email: { 
        type:String,
        //ensure indexed field do not store duplicate values
        unique:true,  
        trim:true,
        lowercase:true,
        validate(value) { 
            if(!validator.isEmail(value)) {
                throw new Error("Email is invalid !")
            }
        }
    },
    userId: {
      type:String
    },
    password: {
        trim:true,
        type:String,
        minlength:7,
        validate(value) {
           if(value.includes("password")) {
               throw new Error("Password should not contain 'password' .etc term!")
           }
        }

    },
    gender: {
        default:'woman',
        type:String,
    },
    tokens: [{
        token:{
            type:String
        }
    }],
    avatarDefault: { 
        default:'https://upload.cc/i1/2021/04/08/yGs8hR.png',
        type:String
    },
    avatarRnDefault: {
        default:'https://upload.cc/i1/2021/06/26/q5zfGj.png',
        type:String
    },
    avatarUpload:{
        type:Buffer
    },
    county:String,
    district:String,
    road:String,
    couponList: [{
        type:Object
    }],
    favList: [{
        type:Object
    }],
    cartList: [{
        type:Object
    }]
},{
    timestamps:true  
})


userSchema.methods.generateAuthToken = async function(){
    const user =this 

    const token =jwt.sign( { _id: user._id.toString() },process.env.JWT_SECRET, {expiresIn: '7d'})  
    user.tokens =user.tokens.concat({token}) 
    
    await user.save() 

    return token 
}

userSchema.methods.generateRefreshToken = async function(){
    const user =this

    const RefreshToken =jwt.sign( { _id: user._id.toString() },process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})  

     return RefreshToken
}




userSchema.methods.toJSON = function() {
    const user =this 
    
    const userObject =user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject

}

userSchema.statics.findByCredentials = async (email, password) => {
    const user =await User.findOne( { email } ) 

    if(!user) {
        throw new Error("No user with that email!")
    }

    const isMatch =await bcrypt.compare(password, user.password)
    console.log(password,user.password)
    console.log(isMatch)
    if(!isMatch) {
         throw new Error("Incorrect Password ")
    }
  
    return user 
}

userSchema.pre('save',async function(next){
    const user =this

   if(user.isModified('password')) {
       user.password =await bcrypt.hash(user.password ,10)
   } 

    next();
})




const User = mongoose.model('user',userSchema )
module.exports = User 

