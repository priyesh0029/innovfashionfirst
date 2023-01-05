var express = require('express');
var router = express.Router();
const admincontroller = require('../controllers/admincontroller')
const adminauth = require('../middlewares/middleware');
const adminHelpers = require('../helpers/adminHelper')
const imageUploader = require('../multer/multer')



router.get('/',admincontroller.getAdminLogin)
router.post('/',admincontroller.postAdminLogin)

 router.use(adminauth.adminAuth)
 
router.get('/admin-dashboard',adminauth.adminAuth, admincontroller.getAdminDashboard)

router.get('/view-users',adminauth.adminAuth, admincontroller.getAdminViewUsers)

router.get('/unblock-users/:id',adminauth.adminAuth,admincontroller.getunblockUser)

router.get('/block-users/:id',adminauth.adminAuth,admincontroller.getblockUser)

//category-section

router.get('/add-category',adminauth.adminAuth, admincontroller.getAdminAddCategory)

router.post('/add-category',adminauth.adminAuth, admincontroller.postAdminAddCategory)

router.get('/edit-category',adminauth.adminAuth,admincontroller.editCategory)

router.post('/edit-category',adminauth.adminAuth,admincontroller.posteditCategory)

router.get('/delete-category',adminauth.adminAuth,admincontroller.deleteCategory)

//Subcategory-section

router.get('/add-subcategory',adminauth.adminAuth, admincontroller.getAdminAddSubCategory)

router.post('/add-subcategory',adminauth.adminAuth, admincontroller.postAdminAddSubcategory)

router.get('/edit-subcategory',adminauth.adminAuth,admincontroller.editSubCategory)

router.post('/edit-subcategory',adminauth.adminAuth,admincontroller.posteditSubCategory)

router.get('/delete-subcategory',adminauth.adminAuth,admincontroller.deleteSubCategory)

//Product-section

router.get('/add-product',adminauth.adminAuth, admincontroller.getAdminAddProducts)

router.post('/add-product',adminauth.adminAuth,imageUploader.uploads, admincontroller.postAdminAddProducts)

router.get('/view-products',adminauth.adminAuth, admincontroller.getAdminViewProducts)

router.get('/edit-products/',adminauth.adminAuth, admincontroller.getAdminEditProducts)


//logout

router.get('/logout',adminauth.adminAuth,admincontroller.getAdminLogout)



module.exports = router;
