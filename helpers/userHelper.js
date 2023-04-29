const user = require("../models/connection");
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const crypto = require('crypto');
const { log } = require("console");
const moment = require("moment/moment");
const { match } = require("assert");
module.exports = {

    middlewareStatus: (email) => {

        let response = {};

        return new Promise(async (resolve, reject) => {

            try {

                const userInfo = await user.user.findOne({ email })
                const userId = userInfo._id
                if (userInfo) {
                    if (userInfo.userBlockStatus == false) {

                        let username = userInfo.firstName
                        let email = userInfo.email
                        let userBlockStatus = userInfo.userBlockStatus

                        response = { username, email, userBlockStatus }
                        resolve(response)

                    } else {
                        response.userBlockStatus = true
                        resolve(response)
                    }
                }

            } catch (err) {
                console.log(err);
            }
        })
    },

    doSignUp: (userData) => {

        let response = {};
        return new Promise(async (resolve, reject) => {

            try {
                const Email = userData.email
                const phone = userData.phonenumber
                let userExist = await user.user.find({ $or: [{ email: Email }, { phonenumber: phone }] })
                let userRefferal = await user.user.find({ refferalCode: userData.refferalCode })
                console.log("userRefferal : ", userRefferal);
                if (userRefferal) {
                    const tranObj = {
                        orderId: 'Refferal bonus', 
                        amount: 100,
                        date: new Date(),
                        type: 'credit'
                    }
                    const existingWallet = await user.wallet.findOne({ "userId": userRefferal[0]?._id });
                    if (existingWallet !== null) {
                        existingWallet.balance += tranObj.amount;
                        existingWallet.transactions.push(tranObj); // Add new transaction to array
                        await existingWallet.save();

                    } else {

                        const newWallet = new user.wallet({
                            userId: userRefferal[0]._id,
                            balance: tranObj.amount,
                            transactions: [tranObj] // Create new array with the new transaction
                        })
                        await newWallet.save();

                    }
                }
                console.log("userExist :", userExist);
                if (userExist.length !== 0) {
                    response = { status: false }
                    return resolve(response)
                } else {
                    var hashedPassword = await bcrypt.hash(userData.password, 10)
                    const refferal = Math.random().toString(36).substring(2, 10);
                    const data = new user.user({
                        firstName: userData.fname,
                        lastName: userData.lname,
                        email: userData.email,
                        phonenumber: userData.phonenumber,
                        Password: hashedPassword,
                        refferalCode: refferal

                    })

                    await data.save(data).then(async (data) => {
                        console.log(data);
                        if (data) {
                            const tranObj = {
                                orderId: 'Refferal bonus',
                                amount: 50,
                                date: new Date(),
                                type: 'credit'
                            }
                            const existingWallet = await user.wallet.findOne({ "userId": data._id });
                            if (existingWallet === null) {

                                const newWallet = new user.wallet({
                                    userId: data._id,
                                    balance: tranObj.amount,
                                    transactions: [tranObj] // Create new array with the new transaction
                                })
                                await newWallet.save();

                            }
                        }
                        response = { data, status: true }
                        return resolve(response)
                    })
                }


            } catch (err) {
                console.log(err);
            }

        })

    },

    doLogin: (userData) => {

        let response = {}

        return new Promise(async (resolve, reject) => {

            try {

                email = userData.email
                let userInfo = await user.user.findOne({ email })
                let userId = userInfo._id
                console.log("userInfo : ", userInfo);
                if (userInfo) {
                    if (userInfo.userBlockStatus == false) {
                        bcrypt.compare(userData.password, userInfo.Password).then(async (status) => {
                            if (status) {
                                let cartCount = await user.cart.findOne({ "userId": userId }, { "count": 1, _id: 0 })
                                let wishListCount = await user.wishlist.findOne({ "userId": userId }, { "count": 1, _id: 0 })
                                console.log("cartCount : ", cartCount, wishListCount);
                                if (cartCount === null) {
                                    cartCount = 0
                                } else {
                                    cartCount = cartCount.count
                                }
                                if (wishListCount === null) {
                                    wishListCount = 0
                                } else {
                                    wishListCount = wishListCount.count
                                }
                                let username = userInfo.firstName
                                let email = userInfo.email
                                let userBlockStatus = userInfo.userBlockStatus
                                response = { username, status, email, userBlockStatus, cartCount, wishListCount }


                                resolve(response)
                            } else {
                                response = { status: false }
                                resolve(response)
                            }
                        })
                    } else {
                        resolve({ userBlockStatus: true, status: false })
                    }
                }
                else {
                    response = { status: false }
                    resolve(response)
                }

            } catch (err) {
                console.log(err);
            }
        })
    },

    otpLogin: (phonenumber) => {

        let response = []

        console.log("phonenumber : ", phonenumber);

        return new Promise(async (resolve, reject) => {



            try {

                userinfo = await user.user.findOne({ phonenumber })
                response = userinfo


                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })

    },


    ShopProducts: (pageNo) => {

        console.log("pageNo : ", pageNo);
        if (pageNo === undefined) {
            pageNo = 1
        }
        let response = {}

        return new Promise(async (resolve, reject) => {

            try {

                response.product = await user.product.find({}).skip(pageNo * 6 - 6).limit(pageNo * 6)
                response.category = await user.categories.findOne({}, { _id: 0 })
                response.productCount = await user.product.countDocuments({});

                console.log("response.category : ", response.category, response.productCount);
                resolve(response)

            } catch (err) {
                console.log(err)
            }
        })
    },

    subCatFilter: (gender, category, subcategory, sortType, sortType2 = null, pageNo) => {
        let response = {}
        if (pageNo === undefined) {
            pageNo = 1
        }
        console.log("subCatFilter pageNO : ", pageNo);
        return new Promise(async (resolve, reject) => {

            try {
                if (sortType === 'allproducts') {
                    response = await user.product.find({ "gender": gender, "catagory": category, "sub_catagory": subcategory })
                } else if (sortType === 'low') {
                    response = await user.product.find({ "gender": gender, "catagory": category, "sub_catagory": subcategory }).sort({ "price": 1 })
                } else if (sortType === 'high') {
                    response = await user.product.find({ "gender": gender, "catagory": category, "sub_catagory": subcategory }).sort({ "price": -1 })

                } else if (sortType === 'featured') {
                    response = await user.order.aggregate([
                        {
                            "$unwind": "$orders"
                        },
                        {
                            $project: {
                                orderStatus: "$orders.orderStatus",
                                paymentStatus: "$orders.paymentStatus",
                                productDetails: "$orders.productDetails",
                            }
                        },
                        {
                            "$unwind": "$productDetails"
                        },
                        {
                            $match: {
                                $and: [
                                    { orderStatus: "Delivered" },
                                    { paymentStatus: "success" }
                                ]
                            }
                        },
                        // { $skip: pageNo * 6 - 6 }, // skip the first 10 documents
                        // { $limit: 10 }, // limit to 5 documents
                        {
                            $group: {
                                _id: "$productDetails.product_id",
                                total_quantity: { $sum: "$productDetails.quantity" }
                            }
                        },
                        {
                            $lookup: {
                                from: "products",
                                localField: "_id",
                                foreignField: "_id",
                                as: "productDetails",
                            }
                        },
                        { $sort: { total_quantity: -1 } },
                        {
                            "$unwind": "$productDetails"
                        },
                        {
                            $project: {
                                "_id": 0,
                                "productDetails._id": 1,
                                "productDetails.product_name": 1,
                                "productDetails.description": 1,
                                "productDetails.price": 1,
                                "productDetails.product_details": 1,
                                "productDetails.gender": 1,
                                "productDetails.brand:": 1,
                                "productDetails.catagory": 1,
                                "productDetails.sub_catagory": 1,
                                "productDetails.Image": 1,
                                "productDetails.product_status": 1,
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                products: {
                                    $push: {
                                        _id: "$productDetails._id",
                                        product_name: "$productDetails.product_name",
                                        description: "$productDetails.description",
                                        price: "$productDetails.price",
                                        product_details: "$productDetails.product_details",
                                        gender: "$productDetails.gender",
                                        brand: "$productDetails.brand",
                                        catagory: "$productDetails.catagory",
                                        sub_catagory: "$productDetails.sub_catagory",
                                        Image: "$productDetails.Image",
                                        product_status: "$productDetails.product_status",
                                    },

                                }
                            }
                        }


                    ])
                } else if (sortType === 'popular') {
                    response = await user.order.aggregate([
                        {
                            "$unwind": "$orders"
                        },
                        {
                            $project: {
                                orderStatus: "$orders.orderStatus",
                                paymentStatus: "$orders.paymentStatus",
                                productDetails: "$orders.productDetails",
                            }
                        },
                        {
                            "$unwind": "$productDetails"
                        },
                        {
                            $group: {
                                _id: "$productDetails.product_id",
                                total_quantity: { $sum: "$productDetails.quantity" }
                            }
                        },
                        {
                            $lookup: {
                                from: "products",
                                localField: "_id",
                                foreignField: "_id",
                                as: "productDetails",
                            }
                        },
                        { $sort: { total_quantity: -1 } },
                        {
                            "$unwind": "$productDetails"
                        },
                        {
                            $project: {
                                "_id": 0,
                                "productDetails._id": 1,
                                "productDetails.product_name": 1,
                                "productDetails.description": 1,
                                "productDetails.price": 1,
                                "productDetails.product_details": 1,
                                "productDetails.gender": 1,
                                "productDetails.brand:": 1,
                                "productDetails.catagory": 1,
                                "productDetails.sub_catagory": 1,
                                "productDetails.Image": 1,
                                "productDetails.product_status": 1,
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                products: {
                                    $push: {
                                        _id: "$productDetails._id",
                                        product_name: "$productDetails.product_name",
                                        description: "$productDetails.description",
                                        price: "$productDetails.price",
                                        product_details: "$productDetails.product_details",
                                        gender: "$productDetails.gender",
                                        brand: "$productDetails.brand",
                                        catagory: "$productDetails.catagory",
                                        sub_catagory: "$productDetails.sub_catagory",
                                        Image: "$productDetails.Image",
                                        product_status: "$productDetails.product_status",
                                    },

                                }
                            }
                        }


                    ])

                } else if (sortType === 'newlyAdded') {
                    response = await user.product.find({}).sort({ "_id": -1 }).limit(8)
                } else if (sortType2 === 'newAdded') {
                    console.log("sortType2");
                    response.featured = response
                    response.newAdded = await user.product.find({}).sort({ "_id": -1 }).limit(8)
                }

                if (sortType === 'featured' || sortType === 'popular') {
                    resolve(response[0] && response[0].products)
                } else {
                    response = JSON.parse(JSON.stringify(response))
                    resolve(response)
                }

            } catch (err) {
                console.log(err)
            }
        })
    },

    productDetails: (productID) => {
        let response = []
        return new Promise(async (resolve, reject) => {
            try {
                response = await user.product.findOne({ _id: productID })
                resolve(response)
            } catch (err) {
                console.log(err);
            }
        })
    },

    createUserCart: (proID, quantity, unitPrice, subTotal, email) => {
        let productObj = {
            product_id: ObjectId(proID),
            perUnitPrice: unitPrice,
            quantity: quantity,
            sub_total: subTotal
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let userCartDetails = await user.cart.findOne({ "userId": userID })
                if (userCartDetails == null) {
                    const cartItem = new user.cart({
                        userId: userID,
                        product: productObj
                    })
                    await cartItem.save()
                } else {
                    let userCart = await user.cart.findOne({ "userId": userID } && { "product.product_id": productObj.product_id });
                    if (userCart) {
                        await user.cart.updateOne({ "userId": userID, "product.product_id": productObj.product_id },
                            { $set: { "product.$.quantity": quantity, "product.$.sub_total": subTotal } })
                    } else {
                        await user.cart.updateOne({ "userId": userID }, { $push: { "product": productObj } })
                    }
                }
                let cart = await user.cart.findOne({ "userId": userID })
                let grand_Total = 0
                let numOfitems = cart.product.length
                for (let i = 0; i < numOfitems; i++) {
                    grand_Total += cart.product[i].sub_total
                }
                await user.cart.updateOne({ "userId": userID }, { $set: { "count": numOfitems, "grand_Total": grand_Total } })
                let response = []
                response = await user.cart.findOne({ "userId": userID, "product.product_id": proID },
                    { _id: 0, "product.product_id": 1, "product.quantity": 1, "product.sub_total": 1, "count": 1 })
                response = JSON.parse(JSON.stringify(response))
                response.grand_Total = grand_Total;
                resolve(response)

            } catch (err) {
                reject(err)
                console.log(err);
            }
        })
    },

    deleteUserCartItem: (proID, email) => {
        let response = {}

        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })

                let userID = userInfo._id
                let userCartDetails = await user.cart.updateOne(
                    { "userId": ObjectId(userID) },
                    { $pull: { "product": { "product_id": ObjectId(proID) } } },
                    { arrayFilters: [{ "element.product_id": ObjectId(proID) }], multi: true }
                );
                let cart = await user.cart.findOne({ "userId": userID })
                let grand_Total = 0
                let numOfitems = cart.product.length
                for (let i = 0; i < numOfitems; i++) {
                    grand_Total += cart.product[i].sub_total
                }
                await user.cart.updateOne({ "userId": userID }, { $set: { "count": numOfitems, "grand_Total": grand_Total } })
                cartCount = await user.cart.findOne({ "userId": ObjectId(userID) }, { "count": 1 })
                response.cartCount = cartCount.count
                console.log("after deletion response.cartCount : ", response.cartCount);
                if (userCartDetails.modifiedCount = 1) {

                    response.status = true
                    resolve(response)
                }

            } catch (err) {
                console.log(err);
            }
        })
    },

    getuserCart: (email) => {

        let response = {}

        console.log("getusercartemail: ", email);
        return new Promise(async (resolve, reject) => {

            try {

                let userInfo = await user.user.findOne({ email: email })

                let userID = userInfo._id

                console.log("userID :", userID);

                let userCart = await user.cart.findOne({ "userId": userID })

                console.log("userCart newly added feild :", userCart);

                if (userCart === null) {
                    response.count = null
                    resolve(response)
                } else if (!userCart.product.length) {
                    response.count = null
                    resolve(response)
                }

                else {
                    [productCart] = await user.cart.find({ "userId": userID }).populate('product.product_id')
                    response.cart = productCart,
                        response.count = productCart.count
                    response.total = productCart.grand_Total
                    resolve(response)
                }


            } catch (err) {
                console.log(err);
            }
        })

    },

    addToWishlist: (email, proID) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let userWishlistDetails = await user.wishlist.findOne({ "userId": userID })
                if (userWishlistDetails == null) {
                    const wishlistItem = new user.wishlist({
                        userId: userID,
                        product: ObjectId(proID),
                        count: 1
                    })
                    await wishlistItem.save()
                } else {
                    await user.wishlist.updateOne({ "userId": userID }, { $addToSet: { "product": ObjectId(proID) } })
                        .then(async (res) => {
                            console.log("user.wishlist.findOneAndUpdate : ", res);
                            if (res.modifiedCount === 1) {
                                await user.wishlist.updateOne({ "userId": userID }, { $inc: { count: 1 } })
                            }
                        })
                }
                let response = await user.wishlist.findOne({ "userId": userID }, { "count": 1 })
                response = JSON.parse(JSON.stringify(response))
                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    ajaxDeleteWishlist: (proID, email) => {
        let response = {}

        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })

                let userID = userInfo._id
                let userCartDetails = await user.wishlist.updateOne(
                    { "userId": userID },
                    { $pull: { "product": ObjectId(proID) } }
                );
                await user.wishlist.updateOne({ "userId": userID }, { $inc: { count: -1 } })
                wishListCount = await user.wishlist.findOne({ "userId": ObjectId(userID) }, { "count": 1 })
                response.wishListCount = wishListCount.count
                if (userCartDetails.modifiedCount = 1) {

                    response.status = true
                    resolve(response)
                }

            } catch (err) {
                console.log(err);
            }
        })
    },

    getWishlist: (email) => {

        let response = {}
        return new Promise(async (resolve, reject) => {

            try {

                const userInfo = await user.user.findOne({ email: email })
                const userID = userInfo._id

                let userWishlist = await user.wishlist.aggregate([
                    {
                        $match: {
                            "userId": userID
                        }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "wishlistProducts"
                        }
                    },
                    {
                        $unwind: "$wishlistProducts"
                    },
                    {
                        $project: {
                            "wishlistProducts": 1,
                            "_id": 0
                        }
                    }
                ])

                console.log("userWishlist :", userWishlist);
                resolve(userWishlist)

            } catch (err) {
                console.log(err);
            }
        })

    },

    addUserAddress: (userData, email, pageInfo) => {
        let userAddressObj = {
            name: userData.fname,
            phonenumber: userData.phonenumber,
            pincode: userData.pincode,
            locality: userData.locality,
            addressLine: userData.address,
            city: userData.city,
            state: userData.state,
            landmark: userData.landmark,
            altPhone: userData.phoneAlt
        }
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let userAddress = await user.address.findOne({ "userId": userID })
                if (userAddress == null) {
                    const addressOfUser = new user.address({
                        userId: userID,
                        address: userAddressObj
                    })
                    await addressOfUser.save()
                    // resolve({address: addressOfUser, pageInfo: pageInfo})
                } else {
                    await user.address.updateOne({ "userId": userID }, { $push: { "address": userAddressObj } })
                    //   ,{new: true}).lean().exec((err, addressOfUser) =>{
                    //     if(err){
                    //         console.log(err)
                    //     } else {
                    //         console.log("addres f user before resolve : ",addressOfUser);
                    //         resolve({address: addressOfUser.address[(addressOfUser.address.length) - 1], pageInfo: pageInfo})
                    //     }
                    //   })
                }
                resolve(pageInfo)
            } catch (err) {
                console.log(err);
            }
        })
    },

    editUserAddress: (userData, addressId, email) => {
        console.log("edit of userAddress 1 :", userData, addressId, email);
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                console.log(userID);
                let userAddress = await user.address.updateOne({ "userId": userID, "address._id": ObjectId(addressId) },
                    {
                        $set:
                        {
                            'address.$.name': userData.fname,
                            'address.$.phonenumber': userData.phonenumber,
                            'address.$.pincode': userData.pincode,
                            'address.$.locality': userData.locality,
                            'address.$.addressLine': userData.address,
                            'address.$.city': userData.city,
                            'address.$.state': userData.state,
                            'address.$.landmark': userData.landmark,
                            'address.$.altPhone': userData.phoneAlt


                        }
                    })
                console.log("edit of userAddress 2 :", userAddress);
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
    },

    deleteUserAddress: (addressId, email) => {
        console.log("edit of userAddress 1 :", addressId, email);
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                // let userAddress = await user.address.deleteOne({ "userId" : userID ,"address._id": ObjectId(addressId)},)
                let userAddress = await user.address.updateOne(
                    { "userId": userID },
                    { $pull: { "address": { "_id": ObjectId(addressId) } } },
                    { arrayFilters: [{ "element._id": ObjectId(addressId) }], multi: true }
                );
                console.log("edit of userAddress 2 :", userAddress);
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
    },

    viewWallet: (email,pageNo) => {
        console.log(" pageNo:",pageNo);
        if (pageNo === '') {
            pageNo = 1
        }
        let response = {}
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                console.log("userID : ", userID);
                wallet = await user.wallet.findOne({ "userId": userID })
                response.totaltran = wallet.transactions.length
                // console.log("WalletInfo 1 : ",response.totaltran);
                for (let i = 0; i < wallet.transactions.length; i++) {
                    wallet.transactions[i].date = moment(wallet.transactions[i].date).format('MMMM Do YYYY, h:mm:ss a');
                }
                response.balance = wallet.balance
                response.transactions = wallet.transactions.reverse().slice((pageNo * 6 - 6),(pageNo * 6) )
                console.log("WalletInfo 2: ",response);
                resolve(response)
            } catch (err) {
                reject("unable to load wallet info")
            }
        })
    },

    placeOrder: (email, orderDetails) => {
        return new Promise(async (resolve, reject) => {
            let paymentInfo
            if (orderDetails.payment_option === 'COD') {
                paymentInfo = 'success'
            } else {
                paymentInfo = 'pending'
            }
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let cartItems = await user.cart.findOne({ "userId": userID })
                console.log("cartItems: ", cartItems);
                if (cartItems === null) {
                    resolve({ userCart: false })
                } else {

                    let grand_Total = cartItems.grand_Total
                    let orderObj = {
                        productDetails: cartItems.product,
                        paymentMethod: orderDetails.payment_option,
                        paymentStatus: paymentInfo,
                        totalPrice: cartItems.grand_Total,
                        couponDiscount: cartItems.couponDiscount,
                        couponCode: cartItems.couponCode,
                        totalQuantity: cartItems.count,
                        shippingAddress: orderDetails.addressId
                    }
                    for (let i = 0; i < cartItems.product.length; i++) {
                        const productId = cartItems.product[i].product_id;
                        const quantity = cartItems.product[i].quantity
                        console.log("productId and quantity : ", productId, quantity);
                        await user.product.updateOne(
                            { _id: productId },
                            { $inc: { "product_details.0.quantity": -quantity } }
                        )
                    }

                    let orderUserId = await user.order.findOne({ "userId": userID })
                    if (!orderUserId) {
                        const Order = new user.order({
                            userId: userID,
                            orders: orderObj
                        })
                        const savedOrder = await Order.save();
                        const insertedOrderId = savedOrder.orders[0]._id;
                        console.log("insertedOrderId : ", insertedOrderId);
                        await user.cart.deleteOne({ "userId": userID })
                        resolve({ insertedOrderId, grand_Total, userID, userCart: true })
                    } else {
                        const result = await user.order.findOneAndUpdate(
                            { "userId": userID },
                            { $push: { "orders": orderObj } },
                            { new: true, returning: ["orders._id"] }
                        );
                        const insertedOrderId = result.orders[result.orders.length - 1]._id;
                        console.log("insertedOrderId : ", insertedOrderId);

                        await user.cart.deleteOne({ "userId": userID })
                        resolve({ insertedOrderId, grand_Total, userID, userCart: true })
                    }
                }
            } catch (err) {
                console.log(err);
            }
        })
    },

    getWalletpay: (response) => {

        let userId = response.userID
        const tranObj = {
            orderId: response.insertedOrderId,
            amount: response.grand_Total,
            date: new Date(),
            type: 'debit'
        }
        console.log("wallet helper : ", tranObj, typeof (tranObj.amount), typeof (userId), userId, typeof (tranObj.orderId));
        return new Promise(async (resolve, reject) => {
            try {
                const existingWallet = await user.wallet.findOne({ "userId": userId });
                if (existingWallet !== null) {
                    existingWallet.balance -= tranObj.amount;
                    existingWallet.transactions.push(tranObj); // Add new transaction to array
                    const walletdebit = await existingWallet.save();
                    console.log("walletdebit : ", walletdebit, "existingWallet.balance : ", existingWallet.balance);

                }
                console.log("response.insertedOrderId walllet :", response.insertedOrderId);
                await user.order.updateOne({ "userId": userId, "orders._id": response.insertedOrderId },
                    { $set: { "orders.$.paymentStatus": "success" } })
                resolve()

            } catch (err) {
                console.log(err);
                reject("Wallet payment failed..!")
            }
        })
    },

    getRazorpay: (response) => {
        try {
            return new Promise((resolve) => {
                const razorpay = new Razorpay({
                    // eslint-disable-next-line no-undef
                    key_id: process.env.RAZORPAY_KEY_ID,
                    // eslint-disable-next-line no-undef
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                })
                const options = {
                    amount: response.grand_Total * 100,
                    currency: "INR",
                    receipt: "" + response.insertedOrderId,
                    payment_capture: 1,
                }
                razorpay.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(order)
                        resolve(order)
                    }
                })
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to get razorpay")
        }
    },

    verifyRazorpayPayments: (paymentInfo, email) => {
        console.log("paymentInfo : ", paymentInfo);
        try {
            return new Promise(async (resolve, reject) => {
                let hmac = crypto.createHmac("sha256", "r0zHiyNRHQXRPufDBUscRyzt")
                hmac.update(
                    paymentInfo["order[razorpay_order_id]"] +
                    "|" +
                    paymentInfo["order[razorpay_payment_id]"]
                )
                hmac = hmac.digest("hex")
                if (hmac === paymentInfo["order[razorpay_signature]"]) {
                    let userInfo = await user.user.findOne({ email: email })
                    let userID = userInfo._id
                    await user.order.updateOne({ "userId": userID, "orders._id": ObjectId(paymentInfo["payment[receipt]"]) },
                        { $set: { "orders.$.paymentStatus": "success" } })
                    resolve({ status: true })
                } else {
                    reject(new Error("Payment failed"))
                }
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to verify razorpay payments")
        }
    },

    getCheckOut: (email) => {

        let response = {}

        console.log("getusercartemail: ", email);
        return new Promise(async (resolve, reject) => {

            try {

                let userInfo = await user.user.findOne({ email: email })

                let userID = userInfo._id

                console.log("userID :", userID);

                let userCart = await user.cart.findOne({ "userId": userID })

                console.log("userCart newly added feild :", userCart);

                if (userCart == null) {
                    response.count = null
                    resolve(response)
                } else if (!userCart.product.length) {
                    response.count = null
                    resolve(response)
                }

                else {
                    [productCart] = await user.cart.find({ "userId": userID }).populate('product.product_id')
                    response.cart = productCart
                    response.count = productCart.product.length
                    let walletInfo = await user.wallet.findOne({ "userId": userID })
                    if (walletInfo) {
                        response.wallet = walletInfo.balance
                    } else {
                        response.wallet = null
                    }
                    let [userAddress] = await user.address.find({ "userId": userID })
                    console.log("userAddress", userAddress);
                    if (userAddress !== undefined) {
                        response.address = userAddress
                        response.addressCount = userAddress.address.length
                        resolve(response)
                        console.log("checkout from database", response);
                    } else {
                        response.addressCount = null
                        resolve(response)
                    }
                }


            } catch (err) {
                console.log(err);
            }
        })

    },

    // userProfile :(email)=>{
    //     let response ={}
    //     return new Promise(async(resolve,reject)=>{
    //         try{
    //             let userInfo = await user.user.findOne({ email: email })
    //             let userID = userInfo._id
    //             let orderInfo = await user.order.findOne({"userId": userID})

    //             if(orderInfo !== null){
    //                 // [productCart] = await user.order.find({ "userId": userID }).populate('orders.productDetails.$product_id')
    //                 // console.log("productcart orderdetails populate ",productCart.orders[0].productDetails[0].product_id.price);
    //                 response.orders = orderInfo.orders
    //                 response.orderCount = orderInfo.orders.length
    //             }else{
    //                 response.orders = null
    //             }
    //              resolve(response)
    //         }catch(err){
    //             console.log(err);
    //         }
    //     })
    // }

    userProfile: (email, pageNo) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let orderDetails = await user.order.aggregate([
                    {
                        $match: { userId: userID }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $lookup: {
                            from: "addresses",
                            localField: "orders.shippingAddress",
                            foreignField: "address._id",
                            as: "addressDetails",

                        },

                    },
                    {
                        $project: {
                            "orders._id": 1,
                            "orders.productDetails": 1,
                            "orders.paymentMethod": 1,
                            "orders.paymentStatus": 1,
                            "orders.couponDiscount": 1,
                            "orders.refundStatus": 1,
                            "orders.returnedReason": 1,
                            "orders.totalPrice": 1,
                            "orders.totalQuantity": 1,
                            "orders.shippingAddress": 1,
                            "orders.status": 1,
                            "orders.cancellationReason": 1,
                            "orders.orderStatus": 1,
                            "orders.createdAt": 1,
                            "addressDetails": 1
                        }
                    },
                    {
                        $unwind: "$addressDetails"
                    },
                    {
                        $project: {
                            "addressDetails.address": 1,
                            "orders._id": 1,
                            "orders.productDetails": 1,
                            "orders.couponDiscount": 1,
                            "orders.paymentMethod": 1,
                            "orders.paymentStatus": 1,
                            "orders.refundStatus": 1,
                            "orders.returnedReason": 1,
                            "orders.totalPrice": 1,
                            "orders.totalQuantity": 1,
                            "orders.shippingAddress": 1,
                            "orders.status": 1,
                            "orders.cancellationReason": 1,
                            "orders.orderStatus": 1,
                            "orders.createdAt": 1,
                        }
                    },
                    {
                        $unwind: "$addressDetails.address"
                    },
                    {
                        $match: (

                            {
                                $expr: { $eq: ["$addressDetails.address._id", "$orders.shippingAddress"] }
                            }

                        )
                    },
                    {
                        $project: {
                            address: "$addressDetails.address",
                            "orders._id": 1,
                            "orders.productDetails": 1,
                            "orders.couponDiscount": 1,
                            "orders.paymentMethod": 1,
                            "orders.refundStatus": 1,
                            "orders.returnedReason": 1,
                            "orders.paymentStatus": 1,
                            "orders.totalPrice": 1,
                            "orders.totalQuantity": 1,
                            "orders.shippingAddress": 1,
                            "orders.cancellationReason": 1,
                            "orders.status": 1,
                            "orders.orderStatus": 1,
                            "orders.createdAt": 1,
                        }
                    },

                    {
                        $lookup: {
                            from: "products",
                            localField: "orders.productDetails.product_id",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    {
                        $unwind: "$productDetails"
                    },
                    {
                        $project: {
                            _id: "$orders._id",
                            paymentMethod: "$orders.paymentMethod",
                            paymentStatus: "$orders.paymentStatus",
                            couponDiscount: "$orders.couponDiscount",
                            refundStatus: "$orders.refundStatus",
                            returnedReason: "$orders.returnedReason",
                            cancellationReason: "$orders.cancellationReason",
                            totalPrice: "$orders.totalPrice",
                            totalQuantity: "$orders.totalQuantity",
                            shippingAddress: "$address",
                            orderStatus: "$orders.orderStatus",
                            createdAt: "$orders.createdAt",
                            productName: "$productDetails.product_name",
                            description: "$productDetails.description",
                            price: "$productDetails.price",
                            gender: "$productDetails.gender",
                            size: "$productDetails.product_details.size",
                            color: "$productDetails.product_details.color",
                            brand: "$productDetails.description",
                            catagory: "$productDetails.brand",
                            sub_catagory: "$productDetails.sub_catagory",
                            Image: "$productDetails.Image",
                            unitPrice: "$orders.productDetails.perUnitPrice",
                            quantity: "$orders.productDetails.quantity",
                            subTotal: "$orders.productDetails.sub_total",

                        }
                    },


                    {
                        $group: {
                            _id: "$_id",
                            paymentMethod: { $first: "$paymentMethod" },
                            paymentStatus: { $first: "$paymentStatus" },
                            refundStatus: { $first: "$refundStatus" },
                            returnedReason: { $first: "$returnedReason" },
                            cancellationReason: { $first: "$cancellationReason" },
                            totalPrice: { $first: "$totalPrice" },
                            couponDiscount: { $first: "$couponDiscount" },
                            totalQuantity: { $first: "$totalQuantity" },
                            shippingAddress: { $first: "$shippingAddress" },
                            orderStatus: { $first: "$orderStatus" },
                            createdAt: { $first: "$createdAt" },
                            products: {
                                $push: {
                                    productName: "$productName",
                                    price: "$price",
                                    description: "$description",
                                    size: "$size",
                                    color: "$color",
                                    gender: "$gender",
                                    brand: "$brand",
                                    catagory: "$catagory",
                                    sub_catagory: "$sub_catagory",
                                    Image: "$Image",
                                    unitPrice: "$unitPrice",
                                    quantity: "$quantity",
                                    subTotal: "$subTotal",

                                },

                            },
                        }
                    },
                    { $sort: { createdAt: -1 } }
                ])


                let orderDetailsLength = orderDetails.length
                for (let i = 0; i < orderDetailsLength; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('Do MMMM YYYY');
                }
                if (pageNo === undefined) {
                    orderDetails = orderDetails.slice(0, 10)
                } else {
                    pageNo = parseInt(pageNo)
                    orderDetails = orderDetails.slice(pageNo * 10 - 10, pageNo * 10)
                }
                let response = { orderDetails, orderDetailsLength, pageNo }

                console.log("response : ", response);
                resolve(response);
            } catch (err) {
                reject(err);
            }
        });
    },

    orderCancellation: (email, orderId, reason, orderStatus = null) => {
        let response = {}

        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                console.log("orderStatus orderCancellation : ", orderStatus);
                if (orderStatus === "") {
                    const order = await user.order.findOneAndUpdate(
                        { "userId": userID, "orders._id": ObjectId(orderId) },
                        { $set: { "orders.$.orderStatus": "cancelled", "orders.$.cancellationReason": reason } },
                        { new: true }
                    );
                } else {
                    const order = await user.order.findOneAndUpdate(
                        { "userId": userID, "orders._id": ObjectId(orderId) },
                        { $set: { "orders.$.orderStatus": "returned", "orders.$.returnedReason": reason } },
                        { new: true }
                    );

                }
                const orderItem = await user.order.findOne({ "userId": userID, "orders._id": ObjectId(orderId) }, { "orders.$": 1, _id: 0 })
                console.log("orderItem qauntity increase 222 : ", orderItem);
                for (let i = 0; i < orderItem.orders[0].productDetails.length; i++) {
                    const productId = orderItem.orders[0].productDetails[i].product_id;
                    const quantity = orderItem.orders[0].productDetails[i].quantity
                    console.log("productId and quantity : ", productId, quantity);
                    await user.product.updateOne(
                        { _id: productId },
                        { $inc: { "product_details.0.quantity": quantity } }
                    )
                }
                response.userId = userID
                response.orderId = orderItem.orders[0]._id
                response.totalPrice = orderItem.orders[0].totalPrice
                response.paymentMethod = orderItem.orders[0].paymentMethod
                response.paymentStatus = orderItem.orders[0].paymentStatus
                resolve(response)

            } catch (err) {
                reject("Failed to cancel the order")
            }
        })
    },

    walletUpdate: (response) => {

        let userId = response.userId
        const tranObj = {
            orderId: response.orderId,
            amount: response.totalPrice,
            date: new Date(),
            type: 'credit'
        }
        console.log("wallet helper : ", tranObj, typeof (tranObj.amount), typeof (userId), typeof (tranObj.orderId));
        return new Promise(async (resolve, reject) => {
            try {
                const existingWallet = await user.wallet.findOne({ "userId": userId });
                if (existingWallet !== null) {
                    existingWallet.balance += tranObj.amount;
                    existingWallet.transactions.push(tranObj); // Add new transaction to array
                    await existingWallet.save();

                } else {

                    const newWallet = new user.wallet({
                        userId: userId,
                        balance: tranObj.amount,
                        transactions: [tranObj] // Create new array with the new transaction
                    })
                    await newWallet.save();

                }
                await user.order.updateOne({ "userId": userId, "orders._id": response.orderId },
                    { $set: { "orders.$.refundStatus": true, "orders.$.paymentStatus": "refunded" } })
                resolve()

            } catch (err) {
                reject("Failed to update wallet")
            }
        })
    },


    getuserAddress: (email) => {
        console.log("getuserAddress ajax call");
        return new Promise(async (resolve, reject) => {
            let response = {}
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                if (userInfo) {
                    response = await user.address.findOne({ userId: userID })
                } else {
                    response = null
                }
                resolve(response)
            } catch (err) {
                console.log(err);
            }
        })
    },

    AvailableCoupen: (email) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                const cartCategoryPrice = await user.cart.aggregate([
                    {
                        $match: {
                            userId: userID
                        }
                    },
                    {
                        $unwind:
                        {
                            path: "$product",
                        },
                    },
                    {
                        $lookup:

                        {
                            from: "products",
                            localField: "product.product_id",
                            foreignField: "_id",
                            as: "products",
                        },
                    },
                    {
                        $project:

                        {
                            perUnitSubtotal: "$product.sub_total",
                            products: 1,
                        },
                    },
                    {
                        $unwind:

                        {
                            path: "$products",
                        },
                    },
                    {
                        $group:

                        {
                            _id: "$products.gender",
                            perCategoryTotal: {
                                $sum: "$perUnitSubtotal",
                            },
                        },
                    },
                    { $sort: { _id: 1 } }
                ])

                console.log("cartCategoryPrice 1: ", cartCategoryPrice);


                const Kids = cartCategoryPrice[0]
                const Men = cartCategoryPrice[1]
                const Women = cartCategoryPrice[2]

                let result = []

                for (const category of [Kids, Men, Women]) {
                    if (category) {

                        const coupons = await user.coupon.find({
                            category: category._id,
                            couponStatus: true,
                            minAmount: { $lte: category.perCategoryTotal }
                        });
                        for (let i = 0; i < coupons.length; i++) {
                            result.push(coupons[i])
                        }
                    }
                }
                for (let i = 0; i < result.length; i++) {
                    result[i].endDate = moment(result[i].endDate).format('Do MMMM YYYY');
                }
                console.log(result);
                resolve(result)
            } catch (err) {
                console.log(err);
            }
        })
    },

    CartCouponDiscount: (email, discountInfo) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let couponDiscount = parseInt(discountInfo.discountAmount)
                let grantTotal = parseInt(discountInfo.grandTotal)
                let coupon = discountInfo.coupenCode

                let couponUsed = await user.user.findOne({ userId: userID, usedCoupons: { $in: [coupon] } })
                console.log("couponUsed : ", couponUsed);

                if (couponUsed) {
                    resolve({ exist: true })
                } else {
                    let couponCheck = await user.cart.findOne({ userId: userID, couponCode: { $ne: null } })
                    if (couponCheck) {

                        await user.user.updateOne({ userId: userID, usedCoupons: { $exists: true, $ne: [] } }, { $pop: { usedCoupons: 1 } });
                        await user.user.updateOne({ userId: userID }, { $push: { "usedCoupons": coupon } });

                    } else {
                        await user.user.updateOne({ userId: userID }, { $push: { "usedCoupons": coupon } })

                    }
                    await user.cart.updateOne({ userId: userID }, { $set: { "couponDiscount": couponDiscount, "couponCode": coupon, "grand_Total": grantTotal } })
                    resolve({ ok: true })
                }


            } catch (err) {
                console.log(err);
            }
        })
    },

    removeCoupen: (email, discountInfo) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                await user.cart.updateOne(
                    { userId: userID },
                    [
                        {
                            $set: {
                                couponCode: null,
                                couponDiscount: 0,
                                grand_Total: {
                                    $toInt: {
                                        $add: ["$grand_Total", "$couponDiscount"]
                                    }
                                }
                            }
                        }
                    ]
                )

                await user.user.updateOne({ userId: userID }, { $pull: { "usedCoupons": discountInfo.coupon } })
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
    },

    checkPassword: (email, password, confpassword) => {
        console.log("getuser ajax call change password");
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                if (userInfo) {

                    if (password === confpassword) {
                        var hashedPassword = await bcrypt.hash(password, 10)
                        await user.user.updateOne({ email: email }, { $set: { Password: hashedPassword } })
                        response.status = true
                        resolve(response)
                    } else {

                        bcrypt.compare(password, userInfo.Password).then((status) => {
                            if (status) {
                                response.status = true

                                resolve(response)
                            } else {
                                response.status = false
                                resolve(response)
                            }
                        })
                    }
                }
            } catch (err) {
                console.log(err);
            }
        })
    }


}