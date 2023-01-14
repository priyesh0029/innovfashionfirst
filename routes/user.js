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

// router.route('/otpverify').get(controller.getOtpverify).post(controller.postOtpverify)

router.post('/otpverify',controller.postOtpverify)

    

    router.get('/shop',controller.getUserShop)
 
    router.get('/product-details/:id',controller.getproductDetails)

    router.get('/cart',userauths.userAuth,controller.userCart)

    router.get('/postaddcart',userauths.userAuth,controller.postAjaxuserCart)


    router.get('/logout',controller.getLogout)


module.exports = router;
