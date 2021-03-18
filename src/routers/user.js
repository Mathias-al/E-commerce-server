const express =require('express')
const router =new express.Router()
const User =require('../models/user')
const Product =require('../models/product')
const auth =require('../middleware/auth')
const multer = require('multer')
const sharp =require('sharp')
const validator = require('validator')
const jwt =require('jsonwebtoken')
const bcrypt =require('bcryptjs')
const svgCaptcha = require('svg-captcha')
const { sendResetPasswordLink  } = require('../email/account')

//captcha
router.get('/captcha', async(req, res)=> {
  const captcha = svgCaptcha.createMathExpr({
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
})

//log in
router.post('/login', async (req, res)=>{
  const { email, password,captchaToken,captchaText  } = req.body
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
})

//get refresh token 
router.post('/getNewToken', async (req, res) => {
  try {
    //get original refreshtoken
  const { refresh } = req.body
   //verify user
  const decoded = jwt.verify( refresh, process.env.JWT_SECRET)
  
  const user = await User.find({_id : decoded._id})
   
  const token = await user.generateAuthToken()

  const refreshToken = await user.generateRefreshToken()        
       
  res.status(200).send({ 
      msg:'success', 
      result: {
        token, 
        refreshToken
      }
    })
  }catch(e) {
    res.status(401).send({msg:e.message})
  }
})

//user register 
router.post('/register', async (req, res) => {
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
})

   //log out
   router.post("/logout", auth , async (req,res)=>{
     try{
      req.user.tokens = req.user.tokens
      .filter(token=>token.token !== req.token ) 
                           
     await req.user.save()

     res.status(200).send()

     }catch(e) {
       res.status(500).send()
     }
   })

 //upload avatar
 const upload =multer({
  limits:{
    fileSize:500000
  },
  filename(req, file, cb) {
    cb(undefined, file.filename+'-'+ Date.now())
  } , 
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be jpg,jpeg or png"))
    }
    //accept this file
    cb(undefined,true) 

  }
})

router.post('/user/upload', auth ,upload.single('avatar'),
async (req, res)=> {

     console.log(req.file)

     //adjust image's size
     const buffer = await sharp(req.file.buffer).resize({
     width: 350 ,
     height: 350, 
     position: sharp.gravity.north
    }).png().toBuffer(); //in order to save into db
    
     const base64 = buffer.toString('base64')

     req.user.avatarUpload = base64

     await req.user.save()  

     res.status(200).send({ 
        msg:'image upload successfully!',
        base64    
        })              
      },
       (err,req,res,next)=> {
            res.status(400).send({msg:err.message})
      })

//delete avatar
router.delete('/user/avatar', auth, async (req,res)=>{
  req.user.avatarUpload = undefined
  await req.user.save()
  res.send({mag:'Delete successfully!'})
})



//send reset email 
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user =await User.findOne( { email } ) 
    if(!validator.isEmail(email)) {
      throw new Error("Email  is invalid!")
   } 
    if(!user) {
      throw new Error("No user with that email!")
   } 

   const token = jwt.sign( {_id: user._id}, process.env.JWT_SECRET, {expiresIn: '20m'} )
   const link = `http://${req.headers.host}/reset-password/${token}`;
   
   sendResetPasswordLink(email,link)

   res.send({ 
     message: 'Successfully sent email' 
    })

  }catch(e) {
    res.status(401).send({msg:e.message})
  }
})

//reset password
router.post('/reset-password/:token', async (req, res) => {
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

   user.password =await bcrypt.hash(password ,10)

   await user.save()

   res.send({msg:'Reset password successfully!'})

  }catch(e) {
    res.status(400).send({
      msg:e.message
    })  
  }
  
})

//read the user info
 router.get("/user/me", auth , async (req,res) =>{
      res.send(req.user)
  })

//log out all the devices 
router.post("/user/logoutAll", auth , async (req,res)=>{  
    try{  
     req.user.tokens =[]

     await req.user.save()

     res.send({msg:'log out successfully!'})
 
    }catch(e){
     res.status(401).send({msg:'log out fail!'})
    }

})

//modify uesr info
router.patch('/user/info-modify' , auth ,  async (req, res) => {
   try {
     const { name, email, gender, county, township , road} =req.body
   
     req.user.name =name
     req.user.email =email
     req.user.gender =gender

     if( county && township && road ) {
       const address = `${county}${township}${road}`;
       req.user.address = address 
    }

    await req.user.save()

    res.status(200).send({msg:'success'})
      
   }catch(e) {
     res.send({msg:e.message})
   }
    
})

//modify user password 
router.post('/user/password-modify', auth ,async (req, res) => {
   const { password } = req.body
   try {
      req.user.password = password

      await req.user.save()
      
      res.send({msg:'modify successfully!'})
   }catch(e) {
     res.send({msg:e.message})
   }
})

// add/remove product to the favorite list
router.post('/user/favlist/add_remove', auth , async (req, res) => {
  const { productId } = req.body
    try {
      const new_product = Product.findOne( {productId} )

      /*If this product does not in the favList,
      find the product by Id in the Product Modal and add it to the favlist.
       If product already in the favList, remove it.
      */
       const index = req.user.favList.findIndex(product=> product.new_product.productId === productId)

       //if can not find the Id
       if(index === -1) { 
        req.user.favList.push( {new_product} ) 
       } else if (index !== -1 ) { 
        //if find the same Id
        req.user.favList = req.user.favList.filter(product=> product.new_product.productId !== productId)
         }    
        
       await req.user.save()   
       res.status(200).send({
          msg:'Success!'
          })      
      }catch(e) {
        res.status(400).send({msg:e.message})          
      }
    })  
     
//delete favorite product
router.post('/user/favlist/delete', auth , async (req, res) => {
  const { productId } = req.body
  try {
    req.user.favList = req.user.favList.filter(product=> product.newproduct.productId !== productId)
         
    await req.user.save()

    res.status(200).send({
     msg:'Delete successfully!'
    })

  }catch(e) {
    res.status(400).send({msg:e.message})      
  }
})

//admin
//get all users
router.get('/admin/allUser', auth , async(req, res)=> {
  try{
    const users = await User.find({})

    res.status(200).send({
      msg:'success',
      users
      })
  }catch(e) {
    res.status(400).send({msg:e.message})
  }
})

//get cartlist
router.get('/cartList', auth ,  async (req, res)=> {
  const { cartList } = req.user
  res.status(200).send({
    msg:'success',
    cartList,
    count:cartList.length

  })
})

//add product to cart 
router.post('/addToCart', auth , async(req, res)=> {
     const { productId , qty } = req.body.cart 
  try {
     const product = await Product.findOne( { productId } )
     
    //  const productProperty = Object.keys(product)
     const index = req.user.cartList.findIndex(good=> good.productId === productId )

     //If cart is empty or can not find the product
     if(!req.user.cartList.length || index === -1) {
       const item = new Product(product)
       item.qty =qty
        // const item = {
        //   productId: product.productId,
        //   productName:product.productName,

        // }  
        req.user.cartList.push(item)
     }else if( req.user.cartList.length ){
       //If cart already have products 
       if(index !== -1) {  //if find the product,then 
         throw new Error("Item already exists in cart!")
       }       
     }
     req.user.save()
     res.status(200).send({msg:'success'})
  }catch(e) {
    res.status(400).send({msg:e.message})
  }
})


// reduce  & increase product qty

//find the target product, increase/reduce its qty,then remove the original one,and add the new one the qty's been updated into array.

router.get('/cart/:productId/:operator/incAndReduce', auth , async(req ,res)=> {
  const  productId  = req.params.productId
  const  operator  = req.params.operator
  try {  
    const item = req.user.cartList.find(item=> item.productId === productId)
    
    operator==='increase' ? item.qty += 1 :item.qty -= 1
    
    const filter = req.user.cartList.filter(item=> item.productId !== productId)
    req.user.cartList = filter

    req.user.cartList.push(item)

    await req.user.save()
 
    res.status(200).send({
        msg:'success',
        cart:req.user.cartList
    })
  }catch(e) {
    res.status(400).send({msg:e.message})
  }
})

//clear cart
router.delete('/clearCart', auth , async(req, res) => {
  try {
    req.user.cartList = []
    req.user.save()
    res.status(200).send({msg:'success'})
  }catch(e) {
    res.status(400).send({msg:e.message})
  }
})

//delete one product 
router.delete('/cart/delete', auth , async(req, res)=> {
  const { productId } = req.body
  try {
    const filteredProduct = req.user.cartList.filter(item=> item.productId !== productId)

    req.user.cartList = filteredProduct

    req.user.save()

    res.status(200).send({msg:'success'})

  }catch(e) {
    res.status(400).send({msg:e.message})
  }
})

//delete multiple products
router.post('/cart/deleteMany', auth , async(req, res)=> {
  const { deleteProducts } = req.body 
  try {
     //turn string back into array
    const batch = deleteProducts.split(',')
    //this will return a cartList that does not have those products from the request
    const result = req.user.cartList.filter(item=> !batch.includes(item.productId) )

    req.user.cartList = result
   
    req.user.save();

    res.status(200).send({msg:'success'})
  
  }catch(e) {
    res.status(400).send({msg:e.message})
  }
})
module.exports = router
