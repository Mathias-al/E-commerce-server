const mongoose = require("mongoose")

const productSchema =new mongoose.Schema({
    productId:String,
    productName:String,
    image:Array,
    price:Number,
    sale_price:Number,
    category:String,
    sub_category:String,
    description:String,
    origin:String,
    stock:Number,
    availability:String,
    sales:Number,
    qty:Number,
    review: {
        ratingValue: Number,
        bestRating: Number
    }
},{
    timestamps:true  
})

const Product = mongoose.model('product',productSchema )
module.exports = Product 