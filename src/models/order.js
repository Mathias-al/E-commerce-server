const mongoose = require("mongoose")

const orderSchema =new mongoose.Schema({
    orderId:String,
    order_status:String,
    userId:String,
    name:String,
    email:String,  
    delivery_address:String,
    order_item:Array,     
    discount:Number,
    discount_code:String,
    total_price:Number,
    payment_method:String,
    payment_status:{
        default:"Paid",
        type:String
    },
    payment_date:Date,
    cancel:{
        default:'Cancel',
        type:String
    }
},{
    timestamps:true  
})

const Order = mongoose.model('order',orderSchema )
module.exports = Order 