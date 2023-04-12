const adminHelpers = require('../helpers/adminHelper')
const multer = require('../multer/multer')

module.exports = {

    getAdminLogin: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin/admin-dashboard')
        } else {
            res.render('admin/login', { adminStatus: false, layout: "adminLayout2" })
        }

    },

    postAdminLogin: (req, res) => {

        adminHelpers.adminLogin(req.body).then((response) => {

            console.log("response login admin  : ",response);
            req.session.admin = response

            if (req.session.admin) {
                adminStatus = req.session.admin.status
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
             const catError = req.session.admin.error
             console.log("catError : ",catError,typeof(catError));
             res.render('admin/add-category', { adminStatus, layout: "adminLayout",id,category,catError})
             req.session.admin.error = null
             console.log("catError2 : ",req.session.admin.error);
         })
       
    },

    postAdminAddCategory: (req, res) => {
        adminHelpers.addCategory(req.body).then((response) => {
            res.status(200).json({status:true})
        }).catch((err)=>{
            res.status(400).json(err) 
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
        console.log(req.files);
        let image = req.files.map(files=>(files.filename))
          console.log(image);
        
        adminHelpers.addProduct(req.body,image).then((response) => {

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

    postAdminEditProducts  : async(req,res)=>{
        console.log("hellodfjdklfjkdf",req.files)
        let oldProductDetails = await adminHelpers.editProduct(req.params.id)

        let oldImageArray=oldProductDetails.Image
        let Editedimages = []
        console.log(oldImageArray);

      
        if(req.files.image1){
          Editedimages[0]=req.files.image1[0].filename
        }else{
          Editedimages[0]=oldImageArray[0]
        }

        if(req.files.image2){
          Editedimages[1]=req.files.image2[0].filename
        }else{
          Editedimages[1]=oldImageArray[1]
        }

        if(req.files.image3){
          Editedimages[2]=req.files.image3[0].filename
        }else{
          Editedimages[2]=oldImageArray[2]
        }

        if(req.files.image4){
          Editedimages[3]=req.files.image4[0].filename
        }else{
          Editedimages[3]=oldImageArray[3]
        }
      
        adminHelpers.postEditProducts(req.body,req.params.id,Editedimages).then((response) => {
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

    getOrderDetails : (req,res)=>{
        adminHelpers.getOrderDetails().then((response) => {
            
            res.render('admin/orders',{adminStatus, layout: "adminLayout",response})
        })
    },
    orderProDetails : (req,res)=>{
        const orderID = req.query.orderid
        const email = req.query.email
        console.log(req.query);
        adminHelpers.orderProDetails(orderID,email).then((response) => {
            console.log("resonse order history sggregation: ",response);
            res.render('admin/order-proDetails',{adminStatus, layout: "adminLayout",response})
        })
    },

    amendOrderStatus: (req,res)=>{
        const orderStatus = req.body.orderStatus
        const orderId = req.body.orderId
        const userId = req.body.userId
        const reason = req.body.reason
        console.log(orderStatus,orderId,userId,reason);
        adminHelpers.amendOrderStatus(userId,orderId,orderStatus,reason).then((response) => {
            res.status(200).json(true)
        })
    },

//admin-Logout    
    getAdminLogout: (req, res) => {
        req.session.admin = null
        res.redirect('/admin')
    }
}