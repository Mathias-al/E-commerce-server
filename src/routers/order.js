const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const OrderControl = require('../controller/order')

//user
router.post('/create_order', auth , OrderControl.createOrder)
router.patch('/user/order/modify', auth , OrderControl.modifyOrder)
router.post('/order/cancel', auth , OrderControl.cancelOrder)
router.get('/user/orderList', auth , OrderControl.getUserOrders)
router.post('/order/detail', auth , OrderControl.getOrderDetail )

//admin
router.patch('/admin/order/modify', auth , OrderControl.adminModifyOrder)
router.get('/admin/orderList', auth , OrderControl.getAllOrders)
router.delete('/admin/order/delete', auth , OrderControl.deleteOrder)
router.delete('/admin/order/deleteMany', auth , OrderControl.deleteMany)

module.exports = router