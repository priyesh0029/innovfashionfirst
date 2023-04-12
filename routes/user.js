var express = require('express');
var router = express.Router();
const controller = require('../controllers/usercontroller')
const userauths = require('../middlewares/middleware')

/* GET home page. */
router.get('/', controller.getHome)

router.get('/login',controller.getUserLogin)

router.post('/login',controller.postUserLogin)

router.get('/signup',controller.getUserSignup)

router.post('/signup',controller.postUserSignup)

router.route('/otp').get(controller.getOtp).post(controller.postOtp)

//  router.route('/otpverify').get(controller.getOtpverify).post(controller.postOtpverify)

router.post('/otpverify',controller.postOtpverify)

    

    router.get('/shop',controller.getUserShop)
    //subCatFilter-start
    router.post('/subCatFilter',controller.subCatFilter)
    //subCatFilter-end
 
    router.get('/product-details/:id',controller.getproductDetails)

    router.get('/wishlist',userauths.userAuth,controller.getWishlist)

    router.post('/postaddtoWishlist',userauths.userAuth,controller.ajaxAddtoWishlist)

    router.post('/postDeleteWishlist',userauths.userAuth,controller.ajaxDeleteWishlist)

    router.get('/cart',userauths.userAuth,controller.userCart)

    router.get('/postaddcart',userauths.userAuth,controller.postAjaxuserCart)

    router.get('/deletecartItem',controller.postAjaxDeleteCartItem)

    router.get('/checkOut',userauths.userAuth,controller.getCheckOut)

    router.get('/userProfile',userauths.userAuth,controller.userProfile)

    router.post('/postAddress',userauths.userAuth,controller.postAddress)

    router.post('/posteditAddress',userauths.userAuth,controller.posteditAddress)

    router.get('/deleteAddress',userauths.userAuth,controller.postDeleteAddress)
    
    // router.post('/postcheckoutAddress',userauths.userAuth,controller.checkoutAddress)

    router.post('/placeOrder',userauths.userAuth,controller.placeOrder)

    router.post('/verify-payment',userauths.userAuth,controller.verifyPayment)

    router.get('/orderLandingPage',userauths.userAuth,controller.orderLandinPage)

    router.get('/orderlist',userauths.userAuth,controller.orderlist)
    
    router.get('/orders',userauths.userAuth,controller.orders)

    router.post('/orderCancellation',userauths.userAuth,controller.orderCancellation)

    router.get('/viewAddress',userauths.userAuth,controller.viewAddress)

    router.post('/checkPassword',userauths.userAuth,controller.checkPassword)



    router.get('/logout',controller.getLogout)


module.exports = router;
