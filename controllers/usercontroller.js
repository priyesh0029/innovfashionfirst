const { response } = require('express');
const userhelpers = require('../helpers/userHelper')
const twilio = require('../middlewares/twilio')
const ObjectId = require('mongodb').ObjectId

var headerStatus, loginStatus,user,mobile

module.exports = {

    getHome: (req, res) => {
        if (req.session.user!=null) {
            user =req.session.user.username
           
            res.render('user/user',{headerStatus:true,user});
        } else {
            res.render('user/user',{headerStatus:false});
        }
        
    },

    getUserLogin: (req, res) => {
        if (req.session.user!=null){
            res.redirect('/')

        }else{
            res.render('user/login',{headerStatus:false})

        }
       
    },

    postUserLogin: (req, res) => {
        userhelpers.doLogin(req.body).then((response) => {

            
             
             if(response.status==true){
             req.session.user= response


             console.log("mannual login : ",response);
             }else if(response.status==false && response.userBlockStatus ==true){
                res.render('user/login',{userBlockStatus:true})
             }
             else if(response.status==false){
               
                res.render('user/login',{wrongPassword:true}) 
            
            }if (req.session.user) {

                res.redirect('/');

            }
        })
    },

    getUserSignup: (req, res) => {
        let emailStatus = true
        res.render('user/signup', {emailStatus,headerStatus:false})
    },

    postUserSignup: (req, res) => {

        userhelpers.doSignUp(req.body).then((response) => {
            var emailStatus = response.status
            console.log(response)
            if (emailStatus == true) {

                console.log(response.data);
                res.redirect('/login')

            } else {
                res.render('user/signup', { emailStatus,headerStatus:false})

            }
        })
    },

    getOtp : (req,res)=>{
        
        res.render('user/otp')
    },

    postOtp : (req,res)=>{
        
        userhelpers.otpLogin(req.body.phonenumber).then((response)=>{
            
            if(response !=null && response.userBlockStatus){
                
                res.render('user/otp',{userBlockStatus:true}) 
            
            }else if(response !=null){

                user = response.firstName

                mobile= response.phonenumber
                
               console.log("otp response :",response);
                
                twilio.send_otp(mobile).then((response)=>{

                    req.session.user = user 
                    res.render('user/otpverify')
                })
               
            }else{

                res.render('user/otp',{usernotExist:true})
            }
           
        })
        
        
    },

    

    postOtpverify :(req,res)=>{

        let otp = req.body.otpnumber
        

        console.log("otp = ",req.body.otpnumber, "let mobile =",mobile);
       
        twilio.verifying_otp(mobile,otp).then((response)=>{

            if(response.status ==  'approved'){
                
                res.redirect('/')
            }else{
                res.render('user/otpverify',{invalidOtp:true})
            }


        })

    },

    getUserShop: (req, res) => {
       
        userhelpers.ShopProducts().then((response)=>{

            console.log("getUserShop : ",response);
            
            if(req.session.user){
                res.render('user/shop',{headerStatus:true,user,response})
            }else{
                res.render('user/shop',{headerStatus:false,response})
            }
        })

       
    },

    getproductDetails : (req,res)=>{

        console.log("req.params.id : ",req.params.id);

        userhelpers.productDetails(req.params.id).then((response)=>{

            console.log("getproductDetails : ",response);

            if(req.session.user){
                res.render('user/product-details',{headerStatus:true,user,response})
            }else{
                res.render('user/product-details',{headerStatus:false,response})
            }
            
        })
    },
 
    userCart : (req,res)=>{

        let useremail = req.session.user.email

        console.log("useremail :",useremail);
        
        userhelpers.getuserCart(useremail).then((response)=>{

            if(response.count==null){
                let count = response.count
                res.render('user/cart',{headerStatus:true,user,count})
             }else{
                let count = response.count
                let cart= response.cart
                let grand_Total = response.total
     
                res.render('user/cart',{headerStatus:true,user,count,cart,grand_Total})
            }
        })

    },

    postAjaxuserCart : (req,res)=>{

        let quantity = parseInt (req.query.quantity)
        let proID  = req.query.proID
        let subTotal = parseInt(req.query.sub_total)


        const email = req.session.user.email
        console.log("req.query : ",quantity,proID,subTotal);
        console.log("req.session.user : ",req.session.user);

        userhelpers.createUserCart(proID,quantity,subTotal,email).then((response)=>{

            console.log("createUserCart response : ",response);

             res.json(response)
        })

       

    },

    postAjaxDeleteCartItem : (req,res)=>{

        console.log("ettittund",req.query);

        let proID  = req.query.proID
        const email = req.session.user.email

        console.log("postAjaxDeleteCartItem : ",proID,email);

        userhelpers.deleteUserCartItem(proID,email).then((response)=>{
            console.log("essponse of deletecrt :",response);

            res.json(response)

        })
    },

    getCheckOut : (req,res)=>{
        let useremail = req.session.user.email

        console.log("useremail :",useremail);
        
        userhelpers.getCheckOut(useremail).then((response)=>{

            if(response.count==null){
                let count = response.count
                res.render('user/cart',{headerStatus:true,user,count})
             }else{
                let count = response.count
                let cart= response.cart
                let userAddress = response.address
                let addressCount = response.addressCount
                let grand_Total = 0
                for(let i=0;i<response.count;i++){
                     grand_Total += response.cart.product[i].sub_total
                }
                console.log(" product_count : ",response.count);
                console.log("first product_name : ",cart.product[0].product_id._id);
     
                res.render('user/checkOut',{headerStatus:true,user,count,cart,grand_Total,userAddress,addressCount})
            }
        })
    },

    userProfile : (req,res)=>{
        const email = req.session.user.email
        userhelpers.userProfile(email).then((response)=>{
            if(response!==null){
                res.render('user/userProfile',{headerStatus:true,user,response})
            }
        })
    },
    orders :  (req,res)=>{
        const email = req.session.user.email
        userhelpers.userProfile(email).then((response)=>{
            if(response!==null){
                let orderId = req.query.orderId
                orderId = ObjectId(orderId)
                const order = response.find(obj => obj._id.equals(orderId));
                console.log(order);
                
                res.render('user/ordershistory',{headerStatus:true,user,order})
            }
        })
    },

    viewAddress: (req,res)=>{
        const email = req.session.user.email
        userhelpers.getuserAddress(email).then((response)=>{
            response = response.address
            res.json(response)
        })
    },

    checkPassword : (req,res)=>{
        const email = req.session.user.email
        const password = req.body.password
        const confpassword = req.body.cpassword
        console.log("password : ",password);
        userhelpers.checkPassword(email,password,confpassword).then((response)=>{
            
            res.json(response)
        })
    },

    postAddress : (req,res)=>{
        const pageInfo = req.query.pageInfo
        console.log(pageInfo);
        
        console.log("address : ",req.body);
        const email = req.session.user.email
        console.log(email);
        userhelpers.addUserAddress(req.body,email,pageInfo).then((response)=>{
            console.log("response",response);
            let userProfile = "userProfile"
            let checkout = "checkout"
            if(response=== userProfile){
                res.redirect('/userProfile')
            }else if(response === checkout){
                res.redirect('/checkOut')
            }
        })
    },

    posteditAddress : (req,res)=>{
        
        console.log("address : ",req.body);
        console.log("query addressid",req.query.addressId);
        const addressId = req.query.addressId
        const email = req.session.user.email
        console.log(email);
        userhelpers.editUserAddress(req.body,addressId,email).then((response)=>{
            res.redirect('/userProfile')
        })
    },

    postDeleteAddress :(req,res)=>{
        
        const addressId = req.query.addressID
        console.log("postDeleteAddress :",addressId);
        const email = req.session.user.email
        console.log(email);
        userhelpers.deleteUserAddress(addressId,email).then((response)=>{
            response="success"
            res.json(response)
        })
    },

    checkoutAddress : (req,res)=>{
        console.log("address : ",req.body.addressID);
        const email = req.session.user.email
        console.log(email);
        userhelpers.checkoutAddress(req.body.addressID,email).then((response)=>{
            res.json(response)
        })
    },

    placeOrder : (req,res)=>{
        const userId = req.query.userId;
        console.log("place order body and query : ",req.body,userId);
        userhelpers.placeOrder(userId,req.body).then((response)=>{
            res.render('user/orderPlaced',{headerStatus:true,user})
        })
    },

    getLogout :(req, res) => {

        req.session.user=null
        res.render('user/user',{headerStatus:false});
    }
}