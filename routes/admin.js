var express = require('express');
const app = express();
var router = express.Router();
const admincontroller = require('../controllers/admincontroller')
const adminauth = require('../middlewares/middleware');
const adminHelpers = require('../helpers/adminHelper')
const imageUploader = require('../multer/multer')



router.get('/', admincontroller.getAdminLogin)
router.post('/', admincontroller.postAdminLogin)

router.use(adminauth.adminAuth)

router.get('/admin-dashboard', admincontroller.getAdminDashboard)

router.get('/salesReport', admincontroller.getSalesReport)

router.post('/filteredsalesReport', admincontroller.getfilteredSalesReport)

router.get('/view-users', admincontroller.getAdminViewUsers)

router.get('/unblock-users/:id', admincontroller.getunblockUser)

router.get('/block-users/:id', admincontroller.getblockUser)

//category-section

router.get('/add-category', admincontroller.getAdminAddCategory)

router.post('/add-category', admincontroller.postAdminAddCategory)

router.get('/edit-category', admincontroller.editCategory)

router.post('/edit-category', admincontroller.posteditCategory)

router.get('/delete-category', admincontroller.deleteCategory)


//Product-section

router.get('/add-product', admincontroller.getAdminAddProducts)

router.get('/getAddProductAjaxValues', admincontroller.getAddProductAjaxValues)

router.post('/add-product', imageUploader.uploads, admincontroller.postAdminAddProducts)

router.get('/view-products', admincontroller.getAdminViewProducts)

router.get('/edit-products/:id', admincontroller.getAdminEditProducts)

router.post('/edit-products/:id', imageUploader.editeduploads, admincontroller.postAdminEditProducts)

router.get('/unlist-product/:id', admincontroller.getAdminUnlistProducts)

router.get('/list-product/:id', admincontroller.getAdminlistProducts)

//orders
router.get('/orders', admincontroller.getOrderDetails)

router.get('/order-proDetails', admincontroller.orderProDetails)

router.post('/amendOrderStatus', admincontroller.amendOrderStatus)

//offers
router.route('/offers')
    .get(admincontroller.getofferPage)
    .post(admincontroller.postofferPage)

router.route('/offerList')
    .get(admincontroller.getofferList)

router.get('/offerExist', admincontroller.ajaxOfferExist)
router.post('/unlistOffer', admincontroller.ajaxOfferUnlist)

//product-Offers

router.route('/productOffers')
    .get(admincontroller.getProductofferPage)
    .post(admincontroller.postProductofferPage)
router.post('/OfferProductList', admincontroller.OfferProductList)
router.post('/OfferProductUnList', admincontroller.unListProductOffer)
router.post('/OfferProductSort', admincontroller.OfferProductSort)



//coupons
router.route('/coupons')
    .get(admincontroller.getCouponPage)
    .post(admincontroller.postCoupon)
router.post('/unlistCoupon', admincontroller.ajaxUnlistCoupon)


//logout

router.get('/logout', adminauth.adminAuth, admincontroller.getAdminLogout)



module.exports = router;
