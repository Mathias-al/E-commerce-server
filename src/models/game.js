const mongoose = require("mongoose")

const gameSchema =new mongoose.Schema({
    productId:String,
    productName:String,
    image:Array,
    price:Number,
    rating:Number,
    category:String,   
    description:String,
    stock:Number,
    sales:Number,
    qty:Number,
    isChecked:Boolean
},{
    timestamps:true  
})

const Game = mongoose.model('game',gameSchema )
module.exports = Game