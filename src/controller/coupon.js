const Coupon = require('../models/coupon')

class CouponControl {
    async createCoupon(req, res) {
        const coupon = new Coupon(req.body)
        try {
           await coupon.save()
           res.status(201).send({
               msg:'Coupon has been created !'
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async deleteCoupon(req, res) {
        const { code } = req.body
        try {
            const coupon = await Coupon.findOne( { code } )
    
            await coupon.remove()
    
            res.status(200).send({msg:'success'})
        }catch(e) {       
            res.status(400).send({msg:e.message})
        }
    }
    async deleteMany(req, res) {
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
        
    }
    async modifyCoupon(req, res) {
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
    }
    async applyCoupon(req, res) {
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
                    final:finalPrice,
                    discount,
                    code
                }           
            })
    
        }catch(e) {
            res.status(400).send({msg:e.message})
        }   
    }
    async redeemCoupon(req, res) {
        const { code } = req.body
       try {
           const coupon = await Coupon.findOne( { code } )
           console.log(coupon)
           req.user.couponList.push( coupon )
   
           await req.user.save()
           
           res.status(200).send({msg:'Success!'})
       }catch(e) {
           res.status(400).send({msg:e.message})
       }
   }
    async getCouponList(req, res) {
        try {
            const coupons = await Coupon.find({})

            res.status(200).send({
                msg:'success',
                coupons
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
     }
     async getUserCoupon(req, res) {
        try {
           res.status(200).send({
               msg:'uccess',
               couponList:req.user.couponList
            }
          )
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
}
module.exports = new CouponControl()