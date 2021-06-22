const mongoose = require("mongoose")

const productSchema =new mongoose.Schema({
    productId:String,
    productName:String,
    image:Array,
    price:Number,
    sale_price:Number,
    type:String,
    category:String,
    sub_category:String,
    description:String,
    origin:String,
    stock:Number,
    availability:String,
    sales:Number,
    qty:Number,
    isChecked:Boolean
},{
    timestamps:true  
})

const Product = mongoose.model('product',productSchema )
module.exports = Product 