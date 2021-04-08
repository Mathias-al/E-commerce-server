const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const CouponControl = require('../controller/coupon')

//admin
router.post('/admin/create-coupon', auth , CouponControl.createCoupon)
router.delete('/admin/coupon/delete', auth , CouponControl.deleteCoupon)
router.post('/admin/coupon/deleteMany', auth , CouponControl.deleteMany)
router.patch('/admin/coupon/modify', auth , CouponControl.modifyCoupon)
router.get('admin/allCoupon', auth , CouponControl.getCouponList)

//user
router.post('/applycoupon', auth, CouponControl.applyCoupon)
router.post('/coupon/redeem', auth , CouponControl.redeemCoupon)
router.get('/user/couponList', auth , CouponControl.getUserCoupon)

module.exports = router