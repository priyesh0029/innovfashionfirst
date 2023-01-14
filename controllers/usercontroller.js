const { response } = require('express');
const userhelpers = require('../helpers/userHelper')
const twilio = require('../middlewares/twilio')

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
        res.render('user/signup', { emailStatus },{headerStatus:false})
    },

    postUserSignup: (req, res) => {

        userhelpers.doSignUp(req.body).then((response) => {
            var emailStatus = response.status
            console.log(response)
            if (emailStatus == true) {

                console.log(response.data);
                res.redirect('/login')

            } else {
                res.render('user/signup', { emailStatus },{headerStatus:false})

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
            res.render('user/shop',{headerStatus:true,user,response})
        })

       
    },

    getproductDetails : (req,res)=>{

        console.log("req.params.id : ",req.params.id);

        userhelpers.productDetails(req.params.id).then((response)=>{

            console.log("getproductDetails : ",response);

             res.render('user/product-details',{headerStatus:true,user,response})
        })
       
    },
 
    userCart : (req,res)=>{

        let useremail = req.session.user.email

        console.log("useremail :",useremail);
        
        userhelpers.getuserCart(useremail).then((response)=>{

            
            let count = response.count
            let cart= response.cart
            console.log(" product_count : ",response.count);
            console.log("first product_name : ",cart.product[0].product_id._id);
 
            res.render('user/cart',{headerStatus:true,user,count,cart})

        })

    },

    postAjaxuserCart : (req,res)=>{

        let quantity = parseInt (req.query.quantity)
        let proID  = req.query.proID


        const email = req.session.user.email


        console.log("req.query : ",quantity,proID);
        console.log("req.session.user : ",req.session.user);

        userhelpers.createUserCart(proID,quantity,email).then((response)=>{

            

             res.json(response)
        })

       

    },

    getLogout :(req, res) => {

        req.session.user=null
        res.render('user/user',{headerStatus:false});
    }
}