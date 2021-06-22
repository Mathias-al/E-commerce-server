require('./db/mongoose');
const express =require('express');
const app = express();
const cors =require('cors');

const port = process.env.PORT || 5000

app.use(express.json());
app.use(cors());

const userRouter =require("../src/routers/user")
const couponRouter = require("../src/routers/coupon")
const productRouter = require("../src/routers/product")
const orderRouter = require("../src/routers/order")
const gameRouter = require("../src/routers/game")

app.use("/api",userRouter); 
app.use("/api",couponRouter); 
app.use("/api",productRouter); 
app.use("/api",orderRouter); 
app.use("/api",gameRouter); 

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(400).send({
        msg:'File must be jpg,jpeg or png'
    })
  })
app.listen(port, 
    () => console.log(`Server is up on the ${port}`)
   )
