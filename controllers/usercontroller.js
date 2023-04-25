const { response, json } = require('express');
const userhelpers = require('../helpers/userHelper')
const twilio = require('../middlewares/twilio');
const Razorpay = require('razorpay');
const ObjectId = require('mongodb').ObjectId

var headerStatus, loginStatus, user, mobile

module.exports = {

    getHome: (req, res) => {
        userhelpers.subCatFilter(null,null,null, 'featured','newAdded').then((response) => {
            
            if (req.session.user != null) {
                user = req.session.user.username
                let cartCount = req.session.user.cartCount
                let wishListCount = req.session.user.wishListCount
                console.log("getHOme response : ",response);
                res.render('user/user', { headerStatus: true, user, cartCount, wishListCount });
            } else {
                console.log("getHOme response : ",response.newAdded,"response.newAdded : ",response.newAdded);
                res.render('user/user', { headerStatus: false });
            }
        })

    },

    getUserLogin: (req, res) => {
        if (req.session.user != null) {
            res.redirect('/')

        } else {
            res.render('user/login', { headerStatus: false })

        }

    },

    postUserLogin: (req, res) => {
        userhelpers.doLogin(req.body).then((response) => {



            if (response.status == true) {
                req.session.user = response


                console.log("mannual login : ", response);
            } else if (response.status == false && response.userBlockStatus == true) {
                res.render('user/login', { userBlockStatus: true })
            }
            else if (response.status == false) {

                res.render('user/login', { wrongPassword: true })

            } if (req.session.user) {

                res.redirect('/');

            }
        })
    },

    getUserSignup: (req, res) => {
        let emailStatus = true
        res.render('user/signup', { emailStatus, headerStatus: false })
    },

    postUserSignup: (req, res) => {

        userhelpers.doSignUp(req.body).then((response) => {
            var emailStatus = response.status
            console.log(response)
            if (emailStatus == true) {

                console.log(response.data);
                res.redirect('/login')

            } else {
                res.render('user/signup', { emailStatus, headerStatus: false })

            }
        })
    },

    getOtp: (req, res) => {

        res.render('user/otp')
    },

    postOtp: (req, res) => {

        userhelpers.otpLogin(req.body.phonenumber).then((response) => {

            if (response != null && response.userBlockStatus) {

                res.render('user/otp', { userBlockStatus: true })

            } else if (response != null) {

                user = response.firstName

                mobile = response.phonenumber

                console.log("otp response :", response);

                twilio.send_otp(mobile).then((response) => {

                    req.session.user = user
                    res.render('user/otpverify')
                })

            } else {

                res.render('user/otp', { usernotExist: true })
            }

        })


    },



    postOtpverify: (req, res) => {

        let otp = req.body.otpnumber


        console.log("otp = ", req.body.otpnumber, "let mobile =", mobile);

        twilio.verifying_otp(mobile, otp).then((response) => {

            if (response.status == 'approved') {

                res.redirect('/')
            } else {
                res.render('user/otpverify', { invalidOtp: true })
            }


        })

    },

    getUserShop: (req, res) => {

        userhelpers.ShopProducts().then((response) => {

            console.log("getUserShop : ", response);
            if (req.session.user) {
                let cartCount = req.session.user.cartCount
                let wishListCount = req.session.user.wishListCount

                console.log(cartCount);
                res.render('user/shop', { headerStatus: true, user, cartCount, wishListCount, response })
            } else {
                res.render('user/shop', { headerStatus: false, response })
            }
        })


    },

    subCatFilter: (req, res) => {
        const gender = req.body.gender
        const category = req.body.category
        const subcategory = req.body.subcategory
        const sortType = req.body.sortType
        console.log("subCatFilter req body : ", gender, category, subcategory, sortType);
        userhelpers.subCatFilter(gender, category, subcategory, sortType).then((response) => {
            res.status(200).json(response)
        })


    },

    getproductDetails: (req, res) => {

        console.log("req.params.id : ", req.params.id);

        userhelpers.productDetails(req.params.id).then((response) => {
            console.log("getproductDetails : ", response);

            if (req.session.user) {
                let cartCount = req.session.user.cartCount
                let wishListCount = req.session.user.wishListCount

                res.render('user/product-details', { headerStatus: true, user, cartCount, wishListCount, response })
            } else {
                res.render('user/product-details', { headerStatus: false, response })
            }

        })
    },

    ajaxAddtoWishlist: (req, res) => {
        const email = req.session.user.email
        const proID = req.body.proID
        console.log("ajaxAddtoWishlist uconto : ", proID, email);
        userhelpers.addToWishlist(email, proID).then((response) => {
            req.session.user.wishListCount = response.count
            res.status(200).json(response)
        })
    },

    ajaxDeleteWishlist: (req, res) => {

        let proID = req.body.proID
        const email = req.session.user.email

        userhelpers.ajaxDeleteWishlist(proID, email).then((response) => {
            console.log("essponse of deletewishlist :", response);
            req.session.user.wishListCount = response.wishListCount
            res.json(response)

        })
    },

    getWishlist: (req, res) => {
        let useremail = req.session.user.email
        userhelpers.getWishlist(useremail).then((response) => {
            let cartCount = req.session.user.cartCount
            let wishListCount = req.session.user.wishListCount

            res.render('user/wishlist', { headerStatus: true, user, cartCount, wishListCount, response })
        })

    },

    userCart: (req, res) => {

        let useremail = req.session.user.email

        console.log("useremail :", useremail);
        let cartCount = req.session.user.cartCount
        let wishListCount = req.session.user.wishListCount
        userhelpers.getuserCart(useremail).then((response) => {
            console.log("userCart :", response);
            if (response.count == null) {
                let count = response.count
                let cartCount = 0
                res.render('user/cart', { headerStatus: true, user, wishListCount, cartCount, count })
            } else {
                let count = response.count
                req.session.user.cartCount = count
                let cart = response.cart
                let grand_Total = response.total

                res.render('user/cart', { headerStatus: true, user, cartCount, wishListCount, count, cart, grand_Total })
            }
        })

    },

    postAjaxuserCart: (req, res) => {

        let quantity = parseInt(req.query.quantity)
        let proID = req.query.proID
        let unitPrice = parseInt(req.query.unitPrice)
        let subTotal = parseInt(req.query.sub_total)


        const email = req.session.user.email
        console.log("req.query : ", quantity, proID, subTotal);
        console.log("req.session.user : ", req.session.user);

        userhelpers.createUserCart(proID, quantity,unitPrice,subTotal, email).then((response) => {
            console.log("response.cartCount : ", response);
            req.session.user.cartCount = response.count

            res.json(response)
        })



    },

    postAjaxDeleteCartItem: (req, res) => {

        console.log("ettittund", req.query);

        let proID = req.query.proID
        const email = req.session.user.email

        console.log("postAjaxDeleteCartItem : ", proID, email);

        userhelpers.deleteUserCartItem(proID, email).then((response) => {
            console.log("essponse of deletecrt :", response);
            req.session.user.cartCount = response.cartCount
            res.json(response)

        })
    },

    getCheckOut: (req, res) => {
        let useremail = req.session.user.email

        console.log("useremail :", useremail);
        let cartCount = req.session.user.cartCount
        let wishListCount = req.session.user.wishListCount

        userhelpers.getCheckOut(useremail).then((response) => {

            if (response.count == null) {
                let count = response.count
                res.render('user/cart', { headerStatus: true, cartCount, user, count })
            } else {
                let count = response.count
                let cart = response.cart
                let userAddress = response.address
                let addressCount = response.addressCount
                let walletAmount = response.wallet
                let grand_Total = 0
                for (let i = 0; i < response.count; i++) {
                    grand_Total += response.cart.product[i].sub_total
                }
                console.log(" product_count : ", response.count);
                console.log("first product_name : ", cart.product[0].product_id._id);

                res.render('user/checkOut', { headerStatus: true, user, cartCount, count, cart, grand_Total, wishListCount, userAddress, addressCount,walletAmount })
            }
        })
    },

    userProfile: (req, res) => {
        const email = req.session.user.email
        let cartCount = req.session.user.cartCount
        let wishListCount = req.session.user.wishListCount

        userhelpers.userProfile(email).then((response) => {
            if (response !== null) {
                let length = response.orderDetailsLength
                let pageNo = response.pageNo
                response = response.orderDetails
                res.render('user/userProfile', { headerStatus: true, user, cartCount, wishListCount, response, length })
            }
        })
    },
    orderlist: (req, res) => {
        const email = req.session.user.email
        let cartCount = req.session.user.cartCount
        let wishListCount = req.session.user.wishListCount
        let pageNo = req.query.pageNo
        console.log("pageNo1 :", pageNo);

        userhelpers.userProfile(email, pageNo).then((response) => {
            let length = response.orderDetailsLength
            let pageNo = response.pageNo
            response = response.orderDetails
            console.log("length and response : ", length, "response : ", response);

            if (pageNo !== undefined) {
                console.log("pageNo : ", pageNo);
                res.status(200).json(response)
            } else {
                res.render('user/viewOrders', { headerStatus: true, user, cartCount, wishListCount, response, length })
            }

        })
    },
    orders: (req, res) => {
        const email = req.session.user.email
        let cartCount = req.session.user.cartCount
        let wishListCount = req.session.user.wishListCount
        let pageNo = req.query.pageNo
        console.log("pageNo : ", pageNo);
        userhelpers.userProfile(email, pageNo).then((response) => {
            if (response !== null) {
                let orderId = req.query.orderId
                console.log("orderId : ", orderId);
                orderId = ObjectId(orderId)
                const order = response.orderDetails.find(obj => obj._id.equals(orderId));
                console.log("orderhistory after find js method : ", order);

                res.render('user/ordershistory1', { headerStatus: true, user, cartCount, wishListCount, order })
            }
        })
    },

    orderCancellation: (req, res) => {
        const email = req.session.user.email
        console.log("req.body.orderStatus : ",req.body.orderStatus);
        userhelpers.orderCancellation(email, req.body.orderId, req.body.reason,req.body.orderStatus)
            .then((response) => {
                if (response.paymentMethod !== 'COD' && response.paymentStatus === 'success') {

                    userhelpers.walletUpdate(response).then(() => {

                        response = true
                        res.status(200).json({ 'ok': response })
                    }).catch((error) => {
                        console.log("error wallet :",error);
                        res.status(400).json({"err2":error})
                    })
                } else {
                    response = true
                    res.status(200).json({ 'ok': response })
                }
            }).catch((error) => {
                console.log("error hrehejer :",error);
                res.status(400).json({"err1":error})
            })
    },

    viewAddress: (req, res) => {
        const email = req.session.user.email
        userhelpers.getuserAddress(email).then((response) => {
            response = response.address 
            res.json(response)
        })
    },

    checkPassword: (req, res) => {
        const email = req.session.user.email
        const password = req.body.password
        const confpassword = req.body.cpassword
        console.log("password : ", password);
        userhelpers.checkPassword(email, password, confpassword).then((response) => {

            res.json(response)
        })
    },

    postAddress: (req, res) => {
        const pageInfo = req.query.pageInfo
        console.log(pageInfo);

        console.log("address : ", req.body);
        const email = req.session.user.email
        console.log(email);
        userhelpers.addUserAddress(req.body, email, pageInfo).then((response) => {
            console.log("response", response);
            let userProfile = "userProfile"
            let checkout = "checkout"
            if (response === userProfile) {
                res.redirect('/userProfile')
            } else if (response === checkout) {
                res.redirect('/checkOut')
            }
        })
    },

    posteditAddress: (req, res) => {

        console.log("address : ", req.body);
        console.log("query addressid", req.query.addressId);
        const addressId = req.query.addressId
        const email = req.session.user.email
        console.log(email);
        userhelpers.editUserAddress(req.body, addressId, email).then((response) => {
            res.redirect('/userProfile')
        })
    },

    postDeleteAddress: (req, res) => {

        const addressId = req.query.addressID
        console.log("postDeleteAddress :", addressId);
        const email = req.session.user.email
        console.log(email);
        userhelpers.deleteUserAddress(addressId, email).then((response) => {
            response = "success"
            res.json(response)
        })
    },

    viewWallet : (req, res) => {

        const email = req.session.user.email
        console.log(email);
        userhelpers.viewWallet(email).then((response) => {
            res.status(200).json(response)
        }).catch((error)=>{
            res.status(400).json(error)
        })
    },

    // checkoutAddress : (req,res)=>{
    //     console.log("address : ",req.body.addressID);
    //     const email = req.session.user.email
    //     console.log(email);
    //     userhelpers.checkoutAddress(req.body.addressID,email).then((response)=>{
    //         res.json(response)
    //     })
    // },

    placeOrder: (req, res) => {
        const email = req.session.user.email
        const addressId = req.body.addressId
        const payment_option = req.body.payment_option
        console.log("place order body and query : ", payment_option, addressId, email);
        userhelpers.placeOrder(email, req.body).then(async (response) => {
            console.log("insertedOrderId response : ", response);
            if (!response.userCart) {
                res.json(response)
            } else {

                if (payment_option === 'COD') {
                    res.status(200).json({ CodStatus: true })
                } else if (payment_option === 'Razorpay') {
                    const order = await userhelpers.getRazorpay(response)
                    order.Razorstatus = true
                    console.log("razorpay response : ", order);
                    res.json(order)
                } else if(payment_option === 'Wallet'){
                    userhelpers.getWalletpay(response).then((response)=>{
                        res.status(200).json({ WalletStatus: true })
                    }).catch((response)=>{
                        console.log(response);
                        res.status(400).json(response)
                    })
                }
            }

        })
    },

    verifyPayment: (req, res) => {

        const email = req.session.user.email
        console.log("verifyPayment payment and order  : ", req.body);
        userhelpers.verifyRazorpayPayments(req.body, email).then((response) => {
            console.log("responser", response);
            res.json(response)
        }).catch((response) => {
            res.json(response)
        })
    },

    orderLandinPage: (req, res) => {
        let cartCount = req.session.user.cartCount
        let wishListCount = req.session.user.wishListCount

        res.render('user/orderPlaced', { headerStatus: true, cartCount, wishListCount, user })
    },
    getAvailableCoupen:(req, res) => {
        const email = req.session.user.email
        userhelpers.AvailableCoupen(email).then((response)=>{
                    res.json(response)
         })
    },
    postAjaxCouponDiscount:(req, res) => {
        const email = req.session.user.email
        console.log("postAjaxCouponDiscount : ",req.body);
        userhelpers.CartCouponDiscount(email,req.body).then((response)=>{
            res.json(response)
         })
    },

    postAjaxremoveCoupen :(req, res) => {
        const email = req.session.user.email
        console.log("postAjaxremoveCoupen : ",req.body);
        userhelpers.removeCoupen(email,req.body).then(()=>{
            res.json({ok:true})
         })
    },

    getLogout: (req, res) => {

        req.session.user = null
        res.render('user/user', { headerStatus: false });
    }
}