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
            console.log('showcategory :',response);
             let id = response[0]._id
             let category = response[0].category
             console.log("id : ",id);
             console.log("category : ",category);
             res.render('admin/add-category', { adminStatus, layout: "adminLayout",id,category})
         })
       
    },

    postAdminAddCategory: (req, res) => {

        adminHelpers.addCategory(req.body).then((response) => {

            console.log(response[0].category);

            res.redirect('/admin/add-category')
        })
    },

    editCategory: (req, res) => {
        details = req.query

        console.log("details  : ",details);
        
        id = details.id
        category = details.categoryobj
        subcategory = details.subcategory
        item = details.item

        console.log("category  : ",category);
        console.log("subcategory : ",subcategory); 

        res.render('admin/edit-category', { adminStatus, layout: "adminLayout", item, id,category,subcategory })

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

    getAddProductAjaxValues :(req,res)=>{

        console.log("req.query :",req.query);
        adminHelpers.addProductAjax(req.query).then((response) => {
            

            console.log("addProductAjax response : ",response)
         
        res.json(response)   
        })
    },

    postAdminAddProducts: (req, res) => {

        
        adminHelpers.addProduct(req.body,req.file.filename).then((response) => {

          res.redirect('/admin/add-product') 
        })
    },

    getAdminViewProducts: (req, res) => {

        adminHelpers.viewProducts().then((response) => {
            console.log("response",response);
            res.render('admin/view-products',{adminStatus, layout: "adminLayout",response})
          })
        
    },
    getAdminEditProducts : (req, res) => {
         console.log("req.params : ",req.params.id);
        
        adminHelpers.editProducts(req.params.id).then((response) => {
            console.log("getbackresponse =",response);
            res.render('admin/edit-product',{adminStatus, layout: "adminLayout",response})
          })

    },

    postAdminEditProducts  : (req,res)=>{
        console.log("postAdminEditProducts : ",req.params.id,req.body,req?.file?.filename);

        adminHelpers.postEditProducts(req.body,req.params.id,req?.file?.filename).then((response) => {
            res.redirect('/admin/view-products')
        })
        
    },

    getAdminUnlistProducts : (req,res)=>{

        adminHelpers.UnlistProduct(req.params.id).then((response) => {
            res.redirect('/admin/view-products')
        })
    },

    getAdminlistProducts : (req,res)=>{

        adminHelpers.listProduct(req.params.id).then((response) => {
            res.redirect('/admin/view-products')
        })
    },

//admin-Logout    
    getAdminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin')
    }
}