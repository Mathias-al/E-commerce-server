const Game = require('../models/game')

class GameControl {
    async createGame(req, res) {
        const game = new Game(req.body)
        try {
           await game.save()
           res.status(201).send({
               msg:'success'
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async getAllGames(req,res) {
        const allGames = await Game.find({}) 
         res.status(200).send({
             msg:'success',
             allGames
         })
    }
    async gameDetail(req, res) {
        const { productId } = req.body
        try {
           const product = await Game.findOne( { productId } )
           if(!product) {
               throw new Error("Product does not exist!")
           }
           res.status(200).send({
               msg:'success',
               productDetail:product
            })
    
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async addToCart(req, res) {
        const { productId , qty } = req.body
        
        try {
            const game = await Game.findOne( { productId } )
            const index = req.user.cartList.findIndex(good=> good.productId === productId )
            
            

            if(!req.user.cartList.length || index === -1) {     
                
              const item = new Game(game)  
              item.qty = qty
              req.user.cartList.push(item)
            }else if( req.user.cartList.length ){
              if(index !== -1) { 
                  throw new Error('Already exists')   
                
                }       
            }
            await req.user.save()
            res.status(200).send({
              msg:'success',
              cartList:req.user.cartList
            })
     }catch(e) {
            res.status(400).send({msg:e.message})
     }
   }
   async removeGame(req, res) {
        const { productId,cartList } = req.body
        try {
          const filteredProduct = cartList.filter(item=> item.productId !== productId)
      
          req.user.cartList = filteredProduct
      
          await req.user.save()
      
          res.status(200).send({
            msg:'success',
            cartList:req.user.cartList
          })
      
        }catch(e) {
          res.status(400).send({msg:e.message})
        }
      }
       async addToFav(req, res) {
        const { productId } = req.body
          try {
            const item = await Game.find( { productId } )
            console.log(item[0])// item = array of object
          
            req.user.favList.push(item[0]) 
              
            await req.user.save() 
      
            res.status(200).send({
                msg:'success',
                favList:req.user.favList
                })      
            }catch(e) {
              res.status(400).send({msg:e.message})          
            }
     }
      async removeFav(req, res) {
        const { productId, favlist } = req.body
        try {
          req.user.favList = favlist.filter(product=> product.productId !== productId)
               
          await req.user.save()
      
          res.status(200).send({
           msg:'success',
           favList:req.user.favList
          })
      
        }catch(e) {
          res.status(400).send({msg:e.message})      
        }
      }
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
    
            req.user.cartList = []
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
                user:req.user
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
}
module.exports = new GameControl()