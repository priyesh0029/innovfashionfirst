var express = require('express');
const app = express();
var router = express.Router();
const admincontroller = require('../controllers/admincontroller')
const adminauth = require('../middlewares/middleware');
const adminHelpers = require('../helpers/adminHelper')
const imageUploader = require('../multer/multer')



router.get('/',admincontroller.getAdminLogin)
router.post('/',admincontroller.postAdminLogin)

 router.use(adminauth.adminAuth)
 
router.get('/admin-dashboard', admincontroller.getAdminDashboard)

router.get('/view-users', admincontroller.getAdminViewUsers)

router.get('/unblock-users/:id',admincontroller.getunblockUser)

router.get('/block-users/:id',admincontroller.getblockUser)

//category-section

router.get('/add-category', admincontroller.getAdminAddCategory)

router.post('/add-category', admincontroller.postAdminAddCategory)

router.get('/edit-category',admincontroller.editCategory)

router.post('/edit-category',admincontroller.posteditCategory)

router.get('/delete-category',admincontroller.deleteCategory)


//Product-section

router.get('/add-product', admincontroller.getAdminAddProducts)

router.get('/getAddProductAjaxValues', admincontroller.getAddProductAjaxValues)

router.post('/add-product',imageUploader.uploads, admincontroller.postAdminAddProducts)

router.get('/view-products',admincontroller.getAdminViewProducts)

router.get('/edit-products/:id',admincontroller.getAdminEditProducts)

router.post('/edit-products/:id',imageUploader.editeduploads,admincontroller.postAdminEditProducts)

router.get('/unlist-product/:id',admincontroller.getAdminUnlistProducts)

router.get('/list-product/:id',admincontroller.getAdminlistProducts)


//logout

router.get('/logout',adminauth.adminAuth,admincontroller.getAdminLogout)



module.exports = router;
