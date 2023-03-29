const user = require("../models/connection");
const bcrypt = require('bcrypt');
const { response } = require("../app");
const ObjectId = require('mongodb').ObjectId

module.exports = {

    middlewareStatus: (email) => {

        let response = {};

        return new Promise(async (resolve, reject) => {

            try {

                userInfo = await user.user.findOne({ email })

                if (userInfo) {
                    if (userInfo.userBlockStatus == false) {


                        username = userInfo.firstName
                        email = userInfo.email
                        userBlockStatus = userInfo.userBlockStatus

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
                email = userData.email
                userExist = await user.user.findOne({ email })

                console.log('userExist:', userExist);

                if (userExist) {
                    response = { status: false }
                    return resolve(response)
                } else {
                    var hashedPassword = await bcrypt.hash(userData.password, 10)

                    const data = new user.user({
                        firstName: userData.fname,
                        lastName: userData.lname,
                        email: userData.email,
                        phonenumber: userData.phonenumber,
                        Password: hashedPassword

                    })

                    await data.save(data).then((data) => {
                        console.log(data);
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

                console.log("userInfo : ", userInfo);
                if (userInfo) {
                    if (userInfo.userBlockStatus == false) {
                        bcrypt.compare(userData.password, userInfo.Password).then((status) => {
                            if (status) {
                                username = userInfo.firstName
                                email = userInfo.email
                                userBlockStatus = userInfo.userBlockStatus

                                response = { username, status, email, userBlockStatus }


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


    ShopProducts: () => {

        let response = []

        return new Promise(async (resolve, reject) => {

            try {

                response = await user.product.find({})

                resolve(response)

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

    createUserCart: (proID, quantity, subTotal, email) => {

        console.log("userCart : ", proID, quantity, email);

        let productObj = {
            product_id: ObjectId(proID),
            quantity: quantity,
            sub_total: subTotal
        }



        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })

                console.log("userInfo :", userInfo);

                let userID = userInfo._id
                console.log(userID);

                let userCartDetails = await user.cart.findOne({ "userId": userID })


                if (userCartDetails == null) {

                    const cartItem = new user.cart({
                        userId: userID,
                        product: productObj
                    })

                    await cartItem.save()




                } else {
                    let userCart = await user.cart.findOne({ "userId": userID } && { "product.product_id": productObj.product_id });

                    console.log("new field now userCart :", userCart);

                    if (userCart) {
                        await user.cart.updateOne({ "userId": userID, "product.product_id": productObj.product_id }, { $set: { "product.$.quantity": quantity, "product.$.sub_total": subTotal } })
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
                console.log("grand-total amount : ", grand_Total);
                await user.cart.updateOne({ "userId": userID }, { $set: { "count": numOfitems, "grand_Total": grand_Total } })
                let response = []
                response = await user.cart.findOne({ "userId": userID, "product.product_id": proID }, { _id: 0, "product.product_id": 1, "product.quantity": 1, "product.sub_total": 1 })

                response.grand_Total = grand_Total
                console.log("create cart response :", response);

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
                console.log(ObjectId(userID), ObjectId(proID));

                userCartDetails = await user.cart.updateOne(
                    { "userId": ObjectId(userID) },
                    { $pull: { "product": { "product_id": ObjectId(proID) } } },
                    { arrayFilters: [{ "element.product_id": ObjectId(proID) }], multi: true }
                );
                await user.cart.updateOne({ "userId": ObjectId(userID) }, { $inc: { count: -1 } })

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

    addUserAddress: (userData, email,pageInfo) => {
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
                 await user.address.updateOne({ "userId": userID }, { $push: { "address": userAddressObj }})
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

    editUserAddress: (userData,addressId,email) => {
        console.log("edit of userAddress 1 :",userData,addressId,email);
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                console.log(userID);
                let userAddress = await user.address.updateOne({ "userId" : userID ,"address._id": ObjectId(addressId)},
                { $set: 
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
                console.log("edit of userAddress 2 :",userAddress);
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
    },

    deleteUserAddress: (addressId,email) => {
        console.log("edit of userAddress 1 :",addressId,email);
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                // let userAddress = await user.address.deleteOne({ "userId" : userID ,"address._id": ObjectId(addressId)},)
                let userAddress = await user.address.updateOne(
                    { "userId": userID},
                    { $pull: { "address": { "_id": ObjectId(addressId) } } },
                    { arrayFilters: [{ "element._id": ObjectId(addressId) }], multi: true }
                );
                console.log("edit of userAddress 2 :",userAddress);
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
    },

    checkoutAddress: (addressId, email) => {
        return new Promise(async (resolve, reject) => {

            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                let userAddress = await user.order.findOne({ "userId": userID })
                if (userAddress == null) {
                    const addressOfUser = new user.order({
                        userId: userID,
                        shippingAddress: addressId
                    })
                    await addressOfUser.save()
                } else {
                    await user.order.updateOne({ "userId": userID }, { $set: { "shippingAddress": addressId } })
                }
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
    },

    placeOrder: (userID, orderDetails) => {
        return new Promise(async (resolve, reject) => {

            try {
                let cartItems = await user.cart.findOne({ "userId": userID })
                let orderObj = {
                    // name: String,
                    productDetails: cartItems.product,
                    paymentMethod: orderDetails.payment_option,
                    // paymentStatus: String,
                    totalPrice: cartItems.grand_Total,
                    totalQuantity: cartItems.count,
                    shippingAddress: orderDetails.addressId,
                    // paymentMode: String,
                }

                let orderUserId = await user.order.findOne({ "userId": userID })
                if (!orderUserId) {
                    const Order = new user.order({
                        userId: userID,
                        orders: orderObj
                    })
                    await Order.save()
                } else {
                    await user.order.updateOne({ "userId": userID }, { $push: { "orders": orderObj } })
                    await user.cart.deleteOne({ "userId": userID })
                }
                resolve()
            } catch (err) {
                console.log(err);
            }
        })
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

    userProfile: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                let userID = userInfo._id
                console.log("userante id : ", userID);
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
                            "orders.totalPrice": 1,
                            "orders.totalQuantity": 1,
                            "orders.shippingAddress": 1,
                            "orders.status": 1,
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
                            "orders.paymentMethod": 1,
                            "orders.paymentStatus": 1,
                            "orders.totalPrice": 1,
                            "orders.totalQuantity": 1,
                            "orders.shippingAddress": 1,
                            "orders.status": 1,
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
                            "orders.paymentMethod": 1,
                            "orders.paymentStatus": 1,
                            "orders.totalPrice": 1,
                            "orders.totalQuantity": 1,
                            "orders.shippingAddress": 1,
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
                            quantity: "$orders.productDetails.quantity",
                            subTotal: "$orders.productDetails.sub_total",

                        }
                    }, {
                        $group: {
                            _id: "$_id",
                            paymentMethod: { $first: "$paymentMethod" },
                            paymentStatus: { $first: "$paymentStatus" },
                            totalPrice: { $first: "$totalPrice" },
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
                                    quantity: "$quantity",
                                    subTotal: "$subTotal"
                                },

                            }
                        }
                    }
                ])



                // console.log("order details from aggregate : ", orderDetails);
                resolve(orderDetails);
            } catch (err) {
                reject(err);
            }
        });
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

    checkPassword :(email,password,confpassword) => {
        console.log("getuser ajax call change password");
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await user.user.findOne({ email: email })
                if (userInfo) {
                    
                    if(password === confpassword){
                        var hashedPassword = await bcrypt.hash(password, 10)
                        await user.user.updateOne({ email: email },{$set : {Password : hashedPassword}})
                        response.status = true
                        resolve(response)
                    }else{
                        
                        bcrypt.compare(password, userInfo.Password).then((status) => {
                            if (status) {
                                response.status = true
                                
                                resolve(response)
                            } else {
                                response.status= false 
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