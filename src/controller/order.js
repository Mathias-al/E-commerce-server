const Order = require('../models/order')
const Product = require('../models/product')

class OrderControl {
    async createOrder(req, res) {
        try {
            //new order
            const order = new Order(req.body)
            //create order ID
            const random1 = Math.floor(Math.random() * 10);
            const random2 = Math.floor(Math.random() * 10);
            const Id = `${ random1 }${Date.now()}${ random2 }`
    
            order.orderId = Id         
            order.name = req.user.name
            order.email = req.user.email 
            order.userId = req.user.userId         
            order.payment_date = new Date()
            order.order_status = 'COMPLETED'
            
            await order.save()
    
            //get isChecked items
            const cartItems = order.order_item
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
    
            //remove checkout items
            req.user.cartList = req.user.cartList.filter(i=> {
              return  !products.find(item=> item.productId === i.productId)
            })
            await req.user.save()
    
    
            //if user have used coupon 
            if(order.discount_code) {        
                const coupon = req.user.couponList.find(i=> i.code === order.discount_code)
                
                if(coupon) {
                    coupon.usage_count = 1 
                }
                const filter = req.user.couponList.filter(i=> i.code!== coupon.code)
                
                req.user.couponList = filter
    
                req.user.couponList.push(coupon)
                
                await req.user.save()
            }  
            res.status(201).send({
                msg:'success',
                cartList:req.user.cartList,
                order,
                user:req.user
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async modifyOrder(req, res) {
        const { delivery_address, orderId } = req.body
        try {
            const order = await Order.findOne( { orderId } )
            order.delivery_address =  delivery_address
            await order.save()
            res.status(200).send({msg:'success'})
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async adminModifyOrder(req, res) {
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
    }
    async cancelOrder(req, res) {
        const { orderId } = req.body
        try {
            const order = await Order.findOne({ orderId })
            order.order_status = "CANCELLED"
            await order.save()
            res.status(200).send({msg:'success'})
    
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async getAllOrders(req ,res) {
        const orderList = await Order.find({})
        res.status(200).send(orderList)
    }
    async getUserOrders(req ,res) {
        const orderList =await  Order.find({ userId: req.user.userId })
        res.status(200).send({
            msg:'success',
            length:orderList.length,
            orderList
        })
    }
    async deleteOrder(req, res) {
        const { orderId } = req.body
        try {
            const order = await Order.findOne( { orderId } )
    
            await order.remove()
    
            res.status(200).send({msg:'success'})
        }catch(e) {       
            res.status(400).send({msg:e.message})
        }
    }
    async deleteMany(req, res) {
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
        
      }
      async getOrderDetail(req, res) {
        const { orderId } = req.body
        try {
            const order = await Order.findOne( { orderId } )

            res.status(200).send({
                msg:'success',
                order
            })
        }catch(e) {       
            res.status(400).send({msg:e.message})
        }
      } 
}
module.exports = new OrderControl()