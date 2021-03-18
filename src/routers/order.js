const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const Order = require('../models/order')
const Product = require('../models/product')

//create a new order meanwhile reduce the stock ,increase the sales and clear user's cart
router.post('/create_order', auth ,async(req, res)=> {
    try {
        //new order
        const order = new Order(req.body.orderDetails)

        const random1 = Math.floor(Math.random() * 10);
        const random2 = Math.floor(Math.random() * 10);
        const Id = `${ random1 }${Date.now()}${ random2 }`

        order.orderId = Id         
        order.name = req.user.name
        order.email = req.user.email 
        order.userId = req.user.userId
        
        await order.save()

        //get cart's items
        const cartItems = order.order_item

        //if there's only one item in the cart
        const qty = cartItems[0].qty

        if( cartItems.length === 1 ) {
            const product = await Product.findOne({ 
                productId : cartItems[0].productId 
            })     
            product.stock = product.stock - qty
            product.sales = product.sales + qty
            await product.save()     
        }

        //if there's more than one item, then find those products
        const idBatch = (cartItems.map( item=> item.productId ))
        const products = await Product.find({
                productId:{
                    $in:[ ...idBatch ]
                }
            })  

        products.forEach(item=> {
            cartItems.forEach(cart=> {
              if(item.productId === cart.productId) {
                 item.stock -= cart.qty
                 item.sales += cart.qty
                    }
                })
            })

       //remove the original one of product
        await Product.deleteMany(
                { 
                 productId:{
                      $in: [...idBatch ]
                      }             
                 } 
            )

       //and add the new one into modal
        await Product.insertMany(products)

        //clear cart
        req.user.cartList = ''
        await req.user.save()

        res.status(201).send({msg:'success'})
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//modify order
router.patch('/user/order/modify', auth , async(req, res)=> {
    const { delivery_address, orderId } = req.body
    try {
        const order = await Order.findOne( { orderId } )
        order.delivery_address =  delivery_address
        await order.save()
        res.status(200).send({msg:'success'})
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//modify order (admin)
router.patch('/admin/order/modify', auth , async(req, res)=> {
    const { orderUpdate } = req.body
    const { orderId  } = orderUpdate
    try {
        const order = await Order.findOne( { orderId } )

        const updates = Object.keys( orderUpdate )
        
        updates.forEach(update=> 
            order[update] = orderUpdate[update] 
            )
        
        await order.save()

        res.status(200).send({msg:"success"})

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//cancel order 
router.post('/order/cancel', auth , async(req, res)=> {
    const { orderId } = req.body
    try {
        const order = await Order.findOne({ orderId })
        order.order_status = "CANCELLED"
        await order.save()
        res.status(200).send({msg:'success'})

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//get all orders(admin)
router.get('/admin/orderList', auth , async(req ,res)=> {
    const orderList = await Order.find({})
    res.status(200).send(orderList)
})

//get orderlist(user)
router.get('/user/orderList', auth , async(req ,res)=> {
    const orderList =await  Order.find({ userId: req.user.userId })
    res.status(200).send(orderList)
})

//delete order
router.delete('/admin/order/delete', auth , async(req, res)=> {
    const { orderId } = req.body
    try {
        const order = await Order.findOne( { orderId } )

        await order.remove()

        res.status(200).send({msg:'success'})
    }catch(e) {       
        res.status(400).send({msg:e.message})
    }
})


//delete multiple orders
router.delete('/admin/order/deleteMany', auth , async(req, res)=> {
    const  { deleteOrders }  = req.body 
    try {
        const batch = deleteOrders.split(",")
        
        await Order.deleteMany(
            { 
             orderId:{
                  $in: [...batch ]
                  }             
             } 
        )

        res.status(200).send({msg:'success'})

        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    
})

module.exports = router