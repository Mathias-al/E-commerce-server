const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const ProductControl = require('../controller/product')

//admin
router.post('/admin/create-product',auth, ProductControl.createItem )
router.delete('/admin/product/delete', auth , ProductControl.deleteItem)
router.delete('/admin/product/deleteMany', auth , ProductControl.deleteMany)
router.patch('/admin/product/modify', auth, ProductControl.modifyItem)

//user
router.get('/product/list/category', ProductControl.getItemByCat)
router.get('/products/all', ProductControl.getAllItems)
router.post('/product/detail', ProductControl.itemDetail)
router.get('/product/feature/best_seller', ProductControl.getBestSeller)
router.post('/product/subCategory', ProductControl.getItemBySubCat)
router.get('/product/newest', ProductControl.getNewestItem)

module.exports = router