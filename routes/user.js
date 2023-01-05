var express = require('express');
var router = express.Router();
const controller = require('../controllers/usercontroller')
const userauths = require('../middlewares/middleware')

/* GET home page. */
router.get('/', controller.getHome)

router.get('/login',userauths.userNotLogged, controller.getUserLogin)

router.post('/login',controller.postUserLogin)

router.get('/signup',userauths.userNotLogged,controller.getUserSignup)

router.post('/signup',controller.postUserSignup)

router.get('/shop',controller.getUserShop)


router.get('/logout',userauths.userAuth,controller.getLogout)


module.exports = router;
