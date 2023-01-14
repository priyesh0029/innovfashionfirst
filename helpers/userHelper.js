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
                        response.userBlockStatus= true
                        resolve( response)
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

    createUserCart: (proID, quantity, email) => {

        console.log("userCart : ", proID, quantity, email);

        let productObj = {
            product_id: ObjectId(proID),
            quantity: quantity
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
                    let userCart = await user.cart.findOne({ "userId": userID, "product.product_id": productObj.product_id })

                    if (userCart) {
                        await user.cart.updateOne({ "userId": userID, "product.product_id": productObj.product_id }, { $set: { "product.$.quantity": quantity } })
                    } else {
                        await user.cart.updateOne({ "userId": userID }, { $push: { "product": productObj } })
                    }


                }
                let response = []
                response = await user.cart.findOne({ "userId": userID, "product.product_id": proID }, { _id: 0, "product.product_id": 1, "product.quantity": 1 })

                console.log("create cart response :", response);

                resolve(response)

            } catch (err) {
                reject(err)
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

                console.log(userID);

                let userCart = await user.cart.findOne({ "userId": userID })

                if (userCart) {


                    [productCart] = await user.cart.find({ "userId": userID }).populate('product.product_id')

                    response.cart = productCart,
                        response.count = productCart.product.length


                    resolve(response)
                }


            } catch (err) {
                console.log(err);
            }
        })
    }


}