const Product = require('../models/product')

class ProductControl {
    async createItem(req , res) {
        const product = new Product(req.body)
        try {
           const random1 = Math.floor(Math.random() * 10);
           const random2 = Math.floor(Math.random() * 10);
           const productId = `${ random1 }${Date.now()}${ random2 }` 
    
           product.productId = productId 
           
           await product.save()
           res.status(201).send({
               msg:'success'
            })
        }catch(e) {
            res.send(400).send({msg:e.message})
        }
    }
     async deleteItem(req, res) {
        const { productId } = req.body
        try {
            const product = await Product.findOne( { productId } )
    
            await product.remove()
    
            res.status(200).send({msg:'Delete successfully!'})
        }catch(e) {       
            res.status(400).send({msg:e.message})
        }
    } 
    async deleteMany(req, res) {
        const  { deleteProducts }  = req.body 
        try {
            const batch = deleteProducts.split(",")
            
            await Product.deleteMany(
                { 
                 productId:{
                      $in: [...batch ]
                      }             
                 } 
            )
    
            res.status(200).send({msg:"Delete successfully!"})
    
            }catch(e) {
                res.status(400).send({msg:e.message})
            }
        
    }
    async modifyItem(req, res) {
        const { productUpdate } = req.body
        const { productId } = productUpdate
        try {
             const product = await Product.findOne( { productId } )
           
            //Extract each property in productUpdate(Object) and convert it to the array.
            const updates = Object.keys( productUpdate )
            
            updates.forEach(update=> 
                product[update] = productUpdate[update] 
                )     
            res.status(200).send({
                msg:"success",         
            })
    
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async getItemByCat(req, res) {
        const  category  = req.query.cat
        try {
            const productList = await Product.find( { category } ) 
            console.log(productList)
    
            res.status(200).send({
               msg:"success",
               productList
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async getAllItems(req,res) {
        const allProduct = await Product.find({}) 
         res.status(200).send({
             msg:'success',
             allProduct
         })
    }
    async itemDetail(req, res) {
        const { productId } = req.body
        try {
           const product = await Product.findOne( { productId } )
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
    async getBestSeller(req, res) {
        try {
            const best_seller = await Product.find({
                sales:{ 
                    $gte:200
                 }
            }).limit(2)
            
           if(!best_seller){
               throw new Error("Can not find anything!")
           }
           
            res.status(200).send({
                msg:'success!',
                best_seller
            })
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
        
    }
    async getItemBySubCat(req, res) {
        const { sub } = req.body
        try {
            const products = await Product.find( { sub_category:sub } )
            res.status(200).send({
                msg:'success',
                products
                })
    
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
    async getNewestItem(req, res) {
        try {
            const now = new Date().toISOString()
            const reduceTwoDay = new Date().setDate(new Date().getDate()-2)
            const  TwoDayAgo = new Date(reduceTwoDay).toISOString()
            const products =await Product.find({
                createdAt:{
                    $lt:now,
                    $gt:TwoDayAgo
                }
            }).limit(6)
         
            res.status(200).send({
                msg:'success',
                products
                })
    
        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    }
}

module.exports =new ProductControl()