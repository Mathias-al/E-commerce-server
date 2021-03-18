const mongoose = require("mongoose")
const couponSchema =new mongoose.Schema({
    code:{
        type:String,
        required:true,
    },
    description:String,
    individual_use:{  
        type:String,
        required:true,
    },
    discount_type:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    expiry_date:{
        type:Date,
        required:true
    },
    //Number of times the coupon has been used already.
    usage_count:Number,
    //How many times the coupon can be used.
    usage_time_limit:Number,
    //the consumption threshold
    minimum_amount:Number,
    created_by:String
},
{
    timestamps:true  
})

const Coupon = mongoose.model('coupon',couponSchema )
module.exports = Coupon