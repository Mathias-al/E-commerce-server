const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const Coupon = require('../models/coupon')

//create new coupon
router.post('/create-coupon', auth  , async(req, res) => {
    const coupon = new Coupon(req.body)
    try {
       await coupon.save()
       res.status(201).send({
           msg:'Coupon has been created !'
        })
    }catch(e) {
        res.send(400).send({msg:e.message})
    }
})

//delete coupon
router.delete('/coupon/delete', auth , async(req, res)=> {
    const { code } = req.body
    try {
        const coupon = await Coupon.findOne( { code } )

        await coupon.remove()

        res.status(200).send({msg:'success'})
    }catch(e) {       
        res.status(400).send({msg:e.message})
    }
})

//delete multiple coupons
router.post('/coupon/deleteMany', auth , async(req, res)=> {
    const  { deleteCodes }  = req.body 
    try {
        const batch = deleteCodes.split(",")
        
        await Coupon.deleteMany(
            { 
             code:{
                  $in: [...batch ]
                  }             
             } 
        )

        res.status(200).send({msg:"Delete successfully!"})

        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    
})


//modify coupon 
router.patch('/coupon/modify', auth , async(req, res)=> {
    const { codeUpdate } = req.body
    const { code } = codeUpdate
    try {
        const coupon = await Coupon.findOne( { code } )

        const updates = Object.keys( codeUpdate )
        
        updates.forEach(update=> 
            coupon[update] = codeUpdate[update] 
            )
        
        await coupon.save()

        res.status(200).send({msg:"Modify successfully!"})

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//apply coupon code
router.post('/applycoupon', auth , async (req, res) => {
    const  { totalPrice, code } = req.body
    try {       
        const coupon = await Coupon.findOne({code})

        if(!coupon) {
            throw new Error("Code does not exist!")
        }
        
        const { expiry_date } =coupon 
        const now = Date.now()/1000
        const expire = Math.floor(new Date(expiry_date)/1000)     
        const compare = expire - now 
        if(compare < 0) {
            throw new Error('This code is already expired!')
        }

    
        //if the coupon need to be redeemed
        if(coupon.individual_use === true) {           
          req.user.couponList.forEach(myCoupon=> {
              if(myCoupon.code !== coupon.code) {
                  throw new Error("You can not use this code!")
              }
          })
        }

      
        const { minimum_amount } = coupon

        //if code has the consumption threshold    
        if( minimum_amount ) {
            //if user does not achieve the threshold 
            if(totalPrice <  minimum_amount) {
            throw new Error(`You are ${ minimum_amount - totalPrice } dollars short!`)
            }        
        }
            
        const finalPrice = coupon.discount_type ==="rebate"  ? totalPrice-coupon.amount : Math.round(totalPrice*(coupon.amount*0.01))
      
        const discount =totalPrice - finalPrice
        res.send({
            msg:"success",
            result:{
                finalPrice,
                discount,
                code
            }           
        })

    }catch(e) {
        res.send({msg:e.message})
    }   
})

//redeem coupon 
router.get('/coupon/redeem', auth , async(req, res)=> {
     const { code } = req.body
    try {
        const coupon = await Coupon.findOne( { code } )
        console.log(coupon)
        req.user.couponList.push( { coupon } )

        await req.user.save()
        
        res.status(200).send({msg:'Success!'})
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})
//get coupon list(all)
router.get('/allCoupon', auth , async(req, res)=> {
    try {
        const coupons = await Coupon.find({})

        res.status(200).send({
            msg:'success',
            coupons
        })
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})
// get user's couponList
router.get('/user/couponList', auth , async(req, res)=> {
    try {

       res.status(200).send({
           msg:'Success!',
           couponList:req.user.couponList
        }
    )
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

module.exports = router