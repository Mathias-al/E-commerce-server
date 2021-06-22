const User =require('../models/user')
const Product =require('../models/product')

const sharp =require('sharp')
const validator = require('validator')
const jwt =require('jsonwebtoken')
const svgCaptcha = require('svg-captcha')
const { sendResetPasswordLink  } = require('../email/account')


class UserControl {
  //login feature for react native
   async rnLogin(req, res) {
        const { email, password } = req.body
        try {
            
           //method will throw error
           const user = await User.findByCredentials(email, password)
      
           const token = await user.generateAuthToken()
      
           res.status(200).send(
             { 
               msg:'success', 
               result: {
                    user,
                    token, 
            }}
          )  
        }catch(e) {
          res.status(400).send({msg:e.message}) 
        }
      }
    async getCaptcha(req, res) {
        const captcha = await svgCaptcha.createMathExpr({
          size:5,
          mathMin:1,
          mathMax:11,
          noise:8,
          ignoreChars:'0o1iLlI',
          background:'#fdbb2d',
          mathOperator: "+"
        })
        /*Generate a token for user , user should bring it back when calling  '/login' API , so server can decode it and get the captcha text,then compare it to the value from front-end. 
        */
        const token = jwt.sign({ text: captcha.text }, process.env.JWT_SECRET, {expiresIn: '1d'})
      
        res.status(200).send({
          img:captcha.data,
          token
        })
    }
    async login(req, res) {
        const { email, password,captchaToken,captchaText } = req.body
        try {
            const decoded = jwt.verify( captchaToken, process.env.JWT_SECRET)
      
            if(decoded.text !== captchaText) {
               throw new Error('Wrong captcha')
              }
      
           //method will throw error
           const user = await User.findByCredentials(email, password)
      
           const token = await user.generateAuthToken()
           const refreshToken = await user.generateRefreshToken()
      
           res.status(200).send(
             { 
               msg:'success', 
               result: {
                    user,
                    token, 
                    refreshToken
            }}
          )  
        }catch(e) {
          res.status(400).send({msg:e.message}) 
        }
      }
      async googleLogin(req, res) {
        try {
         const { email } = req.body
         const user = await User.findOne({email})
         if(!user) {
           //need email and name
           const newUser = new User(req.body)
           await newUser.save()
           const token = await newUser.generateAuthToken()
          
          res.status(200).send(
            { 
              msg:'success', 
              result: { token }
            }         
          )  
         }else {
          const token = await user.generateAuthToken() 
           res.status(200).send(
            { 
              msg:'exist user!', 
              result: { token }
            }         
          )  
         }       
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }
      async getNewToken(req, res) {
        try {
          //get original refreshtoken
         const { refresh } = req.body
         //verify user
         const decoded = jwt.verify( refresh, process.env.JWT_REFRESH_SECRET)
      
         const user =await User.findOne(
          { _id: decoded._id })
         
          const token = await user.generateAuthToken()
      
          const refreshToken = await user.generateRefreshToken()       
             
        res.status(200).send({ 
            msg:'success',          
            token,
            refreshToken
          })
        }catch(e) {
          res.status(401).send({msg:e.message})
        }
      }
      async register(req, res) {
        const user = new User(req.body)
         try{
             const random1 = Math.floor(Math.random() * 10);
             const random2 = Math.floor(Math.random() * 10);
             const userId = `${ random1 }${Date.now()}${ random2 }`
             
             user.userId = userId
             await user.save()
             
             const token = await user.generateAuthToken()
             const refreshToken = await user.generateRefreshToken()        
            
             res.status(201).send({ 
               msg:'Registration success!', 
               result: {
                 token, 
                 refreshToken,
                 user
     }})
         } catch(e){
            res.status(400).send({
              msg:e.message
           })
         } 
     }
     async logout(req,res) {
        try{
         req.user.tokens = req.user.tokens
         .filter(token=>token.token !== req.token ) 
                              
        await req.user.save()
   
        res.status(200).send()
   
        }catch(e) {
          res.status(500).send()
        }
      }
      async uploadAvatar(req, res) {
          console.log(req.file)
        try {
          //adjust image's size
        const buffer = await sharp(req.file.buffer).resize({
            width: 150,
            height: 150, 
            position: sharp.gravity.north
           }).png().toBuffer(); //in order to save into db
           
            const base64 = buffer.toString('base64')
       
            req.user.avatarUpload = base64
       
            await req.user.save()  
       
            res.status(200).send({ 
                msg:'success',
                base64,
                user:req.user 
               })           
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async forgotPass(req, res) {
        try {
          const { email } = req.body
          const user =await User.findOne( { email } ) 
          if(!validator.isEmail(email)) {
            throw new Error("Email  is invalid!")
         } 
          if(!user) {
            throw new Error("No user with that email!")
         } 
      
         const token = jwt.sign( {_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'} )
         const link = `http://localhost:8080/#/reset-pass/${token}`;
         
         sendResetPasswordLink(email,link)
      
         res.send({ 
           message: 'Successfully sent email' 
          })
      
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }
      async resetPass(req, res) {
        try {
          const { token } = req.params
      
          if(!token) {
            throw new Error("Token has expired!")
          }
      
          const { password } = req.body
      
          if( password.includes('password')) {
             throw new Error('Password can not include the term like password!')
           }
      
           if(password.length < 7 ) {
             throw new Error ('password is too short!')
           }
      
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          
          const user =await User.findOne( { _id: decoded._id } )
          
          if(!user) {
            throw new Error("User does not exist")
         } 
      
         user.password = password 
      
         await user.save()
         
         res.status(200).send({
            msg:'Reset password successfully!',
            p:user.password
          })
      
        }catch(e) {
          res.status(400).send({
            msg:e.message
          })  
        }
      }  
      async getUser(req,res) {
        res.send(req.user)
      } 
      async logoutAll(req,res) {  
        try{  
         req.user.tokens =[]
    
         await req.user.save()
    
         res.send({msg:'log out successfully!'})
     
        }catch(e){
         res.status(401).send({msg:'log out fail!'})
        }
      }
      async userInfoModify(req, res) {
        try {
          const { name, email, county, district , road } =req.body
          
          if(email) {
            const user =await User.findOne( { email }  ) 
            if(user) {
              throw new Error("duplicate email!")
            }
            req.user.email =email
          }
          req.user.name =name
          
          
          if( county && district && road ) {
            req.user.county = county 
            req.user.district = district 
            req.user.road = road 
         }
     
         await req.user.save()
     
         res.status(200).send({
            msg:'success',
            user:req.user,
            county:req.user.county,
            district:req.user.district,
            road:req.user.road
          })
           
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
         
     }
     async userPassModify(req, res) {
        const { password } = req.body
        try {
           req.user.password = password
     
           await req.user.save()
           
           res.status(200).send({msg:'success'})
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
     }
     async addToFav(req, res) {
        const { productId } = req.body
          try {
            const item = await Product.find( { productId } )
            console.log(item[0])// item = array of object
          
            req.user.favList.push(item[0]) 
              
            await req.user.save() 
      
            res.status(200).send({
                msg:'success',
                favList:req.user.favList
                })      
            }catch(e) {
              res.status(400).send({msg:e.message})          
            }
     }
     async removeFav(req, res) {
        const { productId, favlist } = req.body
        try {
          req.user.favList = favlist.filter(product=> product.productId !== productId)
               
          await req.user.save()
      
          res.status(200).send({
           msg:'success',
           favList:req.user.favList
          })
      
        }catch(e) {
          res.status(400).send({msg:e.message})      
        }
      }
      async getAllUser(req, res) {
        try{
          const users = await User.find({})
      
          res.status(200).send({
            msg:'success',
            users
            })
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }
      async getCartList(req, res) {
        const list = req.user.cartList
        res.status(200).send({
          msg:'success',
          list
        })
      }
      async addToCart(req, res) {
        const { productId , qty } = req.body
        console.log(req)
        try {
            const product = await Product.findOne( { productId } )
            
            //const productProperty = Object.keys(product)
            const index = req.user.cartList.findIndex(good=> good.productId === productId )
    
            //If cart is empty or can not find the product
            if(!req.user.cartList.length || index === -1) {
            const item = new Product(product)
            item.qty =qty
            req.user.cartList.push(item)
            }else if( req.user.cartList.length ){
            //If cart already have products 
            if(index !== -1) {  //if find the product,then 
                throw new Error("Item already exists in cart!")
              }       
            }
            await req.user.save()
            res.status(200).send({
              msg:'success',
              cartList:req.user.cartList
            })
     }catch(e) {
            res.status(400).send({msg:e.message})
     }
   }
        async updateQty(req ,res) {
            const  { productId , qty , cartList }  = req.body
            try {  
                const itemIndex = cartList.findIndex(item=> item.productId === productId)

                if( itemIndex > -1 ) {
                    const productItem =  cartList[itemIndex]
                    productItem.qty = qty
                    //cartList.set(itemIndex, productItem)   
                }
                req.user.cartList = cartList

                await req.user.save()

                res.status(200).send({
                    msg:'success',
                    cartList:req.user.cartList
                })
        }catch(e) {
        res.status(400).send({msg:e.message})
        }
     }
     async clearCart(req, res) {
        try {
          req.user.cartList = []
          req.user.save()
          res.status(200).send({msg:'success'})
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }
      async removeOneItem(req, res) {
        const { productId,cartList } = req.body
        try {
          const filteredProduct = cartList.filter(item=> item.productId !== productId)
      
          req.user.cartList = filteredProduct
      
          await req.user.save()
      
          res.status(200).send({
            msg:'success',
            cartList:req.user.cartList
          })
      
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }
      async removeMany(req, res) {
        const { deleteProducts } = req.body 
        try {
           //turn string back into array
          const batch = deleteProducts.split(',')
          //this will return a cartList that does not have those products from the request
          const result = req.user.cartList.filter(item=> !batch.includes(item.productId) )
      
          req.user.cartList = result
         
          await req.user.save();
      
          res.status(200).send({msg:'success'})
        
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }  
      
      
              
}





   module.exports = new UserControl()