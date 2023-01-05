const adminHelpers = require('../helpers/adminHelper')
const multer = require('../multer/multer')

module.exports = {

    getAdminLogin: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin/admin-dashboard')
        } else {
            res.render('admin/login', { adminStatus: false, layout: "adminLayout" })
        }

    },

    postAdminLogin: (req, res) => {

        adminHelpers.adminLogin(req.body).then((response) => {


            req.session.admin = response.status

            if (req.session.admin) {
                adminStatus = req.session.admin
                res.redirect('/admin/admin-dashboard')
            }
        })

    },

    getAdminViewUsers: (req, res) => {

        adminHelpers.viewUsers().then((response) => {

            allUsers = response.users

            if (response.status)

                res.render('admin/view-users', { adminStatus, layout: "adminLayout", allUsers })
        })

    },

    getAdminDashboard: (req, res) => {

        res.render('admin/admin-dashboard', { adminStatus, layout: "adminLayout" })
    },

    getunblockUser: (req, res) => {
        adminHelpers.unblockUser(req.params.id).then((response) => {
            res.redirect('/admin/view-users')
        })
    },

    getblockUser: (req, res) => {
        adminHelpers.blockUser(req.params.id).then((response) => {
            res.redirect('/admin/view-users')
        })
    },



    //Category-section    

    getAdminAddCategory: (req, res) => {
        adminHelpers.showcategory().then((response) => {

            let id = response[0]._id
            let category = response[0].category
            res.render('admin/add-category', { adminStatus, layout: "adminLayout", category, id })
        })

    },

    postAdminAddCategory: (req, res) => {

        adminHelpers.addCategory(req.body.categoryname).then((response) => {

            let id = response[0]._id
            let category = response[0].category
            console.log(category)

            res.render('admin/add-category', { adminStatus, layout: "adminLayout", category, id })
        })
    },

    editCategory: (req, res) => {
        details = req.query
        id = details.id
        item = details.item
        res.render('admin/edit-category', { adminStatus, layout: "adminLayout", item, id })

    },

    posteditCategory: (req, res) => {


        adminHelpers.editCrudCategory(req.query, req.body.categoryname).then((response) => {
            res.redirect('/admin/add-category')
        })
    },

    deleteCategory: (req, res) => {

        adminHelpers.deleteCrudCategory(req.query).then((response) => {
            res.redirect('/admin/add-category')
        })
    },


    //sub-category-section

    getAdminAddSubCategory: (req, res) => {
        adminHelpers.showSubcategory().then((response) => {

            let id = response[0]._id
            let subcategory = response[0].subcategory
            res.render('admin/add-subcategory', { adminStatus, layout: "adminLayout", subcategory, id })
        })

    },

    postAdminAddSubcategory: (req, res) => {

        console.log("req.body.subname  =", req.body.subname)
        adminHelpers.addSubCategory(req.body.subname).then((response) => {

            let id = response[0]._id
            let subcategory = response[0].subcategory
            console.log(subcategory)

            res.render('admin/add-subcategory', { adminStatus, layout: "adminLayout", subcategory, id })
        })
    },

    editSubCategory: (req, res) => {
        details = req.query
        id = details.id
        item = details.item
        res.render('admin/edit-subcategory', { adminStatus, layout: "adminLayout", item, id })

    },

    posteditSubCategory: (req, res) => {


        adminHelpers.editCrudSubCategory(req.query, req.body.subcategoryname).then((response) => {
            res.redirect('/admin/add-subcategory')
        })
    },

    deleteSubCategory: (req, res) => {

        adminHelpers.deleteCrudSubCategory(req.query).then((response) => {
            res.redirect('/admin/add-subcategory')
        })
    },



    //Product-section    

    getAdminAddProducts: (req, res) => {
        
        adminHelpers.showMainAndSubcategory().then((response) => {

           let category = response[0].category 
           let subcategory = response[0].subcategory

            console.log(category);
            console.log(subcategory);
            
            res.render('admin/add-product', { adminStatus, layout: "adminLayout",category,subcategory})
        })

    },

    postAdminAddProducts: (req, res) => {

        
        adminHelpers.addProduct(req.body,req.file.filename).then((response) => {

          res.redirect('/admin/add-product') 
        })
    },

    getAdminViewProducts: (req, res) => {

        adminHelpers.viewProducts().then((response) => {
            console.log(response);
            res.render('admin/view-products',{adminStatus, layout: "adminLayout",response})
          })
        
    },
    getAdminEditProducts : (req, res) => {
        adminHelpers.editProducts().then((response) => {
            console.log(response);
            res.render('admin/edit-products',{adminStatus, layout: "adminLayout",response})
          })

    },



//admin-Logout    
    getAdminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin')
    }
}