const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const UserControl =require('../controller/user')
const multer = require('multer')

//upload avatar
const upload =multer({
  limits:{
    fileSize:9000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be jpg,jpeg or png"))
    }
    //accept this file
    cb(undefined,true) 

  }
})

//user
router.get('/captcha', UserControl.getCaptcha )
router.post('/login', UserControl.login)
router.post('/googleLogin', UserControl.googleLogin)
router.post('/getNewToken', UserControl.getNewToken)
router.post('/register', UserControl.register)
router.post("/logout", auth , UserControl.logout)
router.post('/user/upload', auth ,upload.single('avatar'),
UserControl.uploadAvatar)
router.post('/forgot-password',UserControl.forgotPass)
router.post('/reset-password/:token',UserControl.resetPass)
router.get("/user/me", auth ,UserControl.getUser)
router.post("/user/logoutAll", auth ,UserControl.logoutAll)
router.post('/user/info-modify' , auth ,UserControl.userInfoModify)
router.post('/user/password-modify', auth , UserControl.userPassModify)
router.post('/user/add/favlist', auth , UserControl.addToFav)  
router.post('/user/delete/favlist', auth , UserControl.removeFav)
router.get('/cartList', auth , UserControl.getCartList)
router.post('/addToCart', auth ,UserControl.addToCart)
router.post('/cart/product/updateQty', auth ,UserControl.updateQty )
router.delete('/clearCart', auth , UserControl.clearCart)
router.post('/cart/delete', auth , UserControl.removeOneItem)
router.post('/cart/deleteMany', auth , UserControl.removeMany)

//admin
router.get('/admin/allUser', auth , UserControl.getAllUser)

module.exports = router
