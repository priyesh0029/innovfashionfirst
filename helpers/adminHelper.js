const admin = require('../models/connection')
const bcrypt = require('bcrypt');
const { response } = require('express');
const { product } = require('../models/connection');
const ObjectId = require('mongodb').ObjectId


module.exports = {

    adminLogin: (adminData) => {

        console.log(adminData)


        let response = {}


        return new Promise(async (resolve, reject) => {
            try {
                email = adminData.email
                adminInfo = await admin.admin.findOne({ email })
                 if (adminInfo) {

                    bcrypt.compare(adminData.password, adminInfo.Password).then((status) => {

                        console.log(status);

                        if (status) {

                            adminName = adminInfo.email
                            console.log(adminName);

                            response = { adminName, status }

                            resolve(response)
                        } else {
                            response = { status }
                            resolve(response)
                        }

                    })

                }


            } catch (err) {
                console.log(err);
            }



        })
    },

    viewUsers: () => {

        let response = {}

        return new Promise(async (resolve, reject) => {

            const allUsers = await admin.user.find({})

            console.log(allUsers);


            if (allUsers.length) {
                response.status = true
                response.users = allUsers

                resolve(response)
                console.log(response);
            }
        })
    },

    unblockUser: (userId) => {

        return new Promise(async (resolve, reject) => {

            await admin.user.updateOne({ _id: userId }, { $set: { userBlockStatus: false } }).then((data) => {

                console.log("updated status :", data)
                resolve()
            })


        })
    },

    blockUser: (userId) => {

        return new Promise(async (resolve, reject) => {

            await admin.user.updateOne({ _id: userId }, { $set: { userBlockStatus: true } }).then((data) => {

                console.log("updated status :", data)
                resolve()
            })


        })
    },



    //Category---section    


    addCategory: (categoryInfo) => {
        let response = [];

        return new Promise(async (resolve, reject) => {
            let gender = categoryInfo.gender;
            let subcategory = categoryInfo.category;
            let subcategoryname = categoryInfo.subcategory;
            console.log("gender,subcategory,subcategoryname : ", gender, subcategory, subcategoryname);

            try {
                const info = await admin.categories.findOne({});

                console.log("info : ", info);
                if (info == null) {
                    await admin.categories.create({
                        category: {
                            [gender]: {
                                [subcategory]: [subcategoryname]
                            }
                        }
                    });
                } else {
                    let info2 = await admin.categories.findOneAndUpdate(
                        { _id: info._id, [`category.${gender}.${subcategory}`]: { $nin: [subcategoryname] } },
                        { $push: { [`category.${gender}.${subcategory}`]: subcategoryname } }
                      );
                      
                    console.log("info2 : ", info2);
                    if(info2 === null){
                        reject("this category already exist.try another !")
                    }
                }
                resolve();
            } catch (err) {
                console.log(err);
            }
        });
    },

    showcategory: () => {

        let response = []

        return new Promise(async (resolve, reject) => {

            try {
                response = await admin.categories.find().select('category').exec();
                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    editCrudCategory: (details, newItem) => {
        return new Promise(async (resolve, reject) => {
            try {


                await admin.categories.updateOne(

                    { _id: details.id }, {
                    $set: { ["category." + details.categoryobj + "." + details.subcategory + "." + "$[element]"]: newItem }
                },
                    { arrayFilters: [{ element: details.item }] }


                )
                resolve()

            } catch (err) {

                console.log(err);
            }
        })
    },

    deleteCrudCategory: (details) => {

        return new Promise(async (resolve, reject) => {

            console.log("id", details.id);
            console.log("details", details);
            console.log("olditem :", details.item);

            try {
                await admin.categories.updateOne({ _id: details.id }, { $pull: { ["category." + details.categoryobj + "." + details.subcategory]: details.item } })

                resolve()

            } catch (err) {
                console.log(err);
            }

        })

    },


    //Product-Section

    showMainAndSubcategory: () => {

        let response = []

        return new Promise(async (resolve, reject) => {

            try {
                response = await admin.categories.find()
                console.log(response);

                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    addProduct: (product, imageName) => {

        console.log("product : ", product);
        console.log("imageName", imageName);

        return new Promise(async (resolve, reject) => {

            try {

                const productDetails = new admin.product({
                    product_name: product.name,
                    description: product.description,
                    price: product.price,
                    product_details: [{
                        quantity: product.quantity,
                        size: product.size,
                        color: product.color
                    }],
                    gender: product.gender,
                    brand: product.brand,
                    catagory: product.category,
                    sub_catagory: product.subcategory,
                    Image: imageName


                })
                await productDetails.save().then(() => {
                    return resolve()
                })

            } catch (err) {
                console.log(err);
            }
        })
    },

    addProductAjax: (details) => {

        console.log("ajax details : ", details);
        console.log("ajax details : ", details.gender);
        console.log("ajax details : ", details.category);
        console.log("ajax details : ", typeof details.gender);

        let response = []

        return new Promise(async (resolve, reject) => {
            try {

                response = await admin.categories.find({}).select({ ["category." + details.gender + "." + details.category]: 1 })



                resolve(response)


            } catch (err) {

            }

        })

    },

    viewProducts: () => {

        let response = []

        return new Promise(async (resolve, reject) => {

            try {
                response = await admin.product.find()


                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    editProducts: (productID) => {

        console.log("productID :", productID);

        let response = []

        return new Promise(async (resolve, reject) => {

            try {


                response = await admin.product.findOne({ _id: productID })

                console.log("response=", response);

                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    editProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            await admin.product.findOne({ _id: productId }).exec().then((response) => {
                resolve(response)
            })
        })
    },

    postEditProducts: (updatedProduct, proID, Image) => {

        // console.log("updatedProduct :", updatedProduct);
        // console.log("proID :", proID);
        // console.log("Image :", Image);

        return new Promise(async (resolve, reject) => {

            try {

                await admin.product.updateOne({ _id: proID }, {
                    $set:

                    {

                        product_name: updatedProduct.name,
                        description: updatedProduct.description,
                        price: updatedProduct.price,
                        product_details: [{
                            quantity: updatedProduct.quantity,
                            size: updatedProduct.size,
                            color: updatedProduct.color
                        }],
                        gender: updatedProduct.gender,
                        brand: updatedProduct.brand,
                        catagory: updatedProduct.category,
                        sub_catagory: updatedProduct.subcategory,
                        Image: Image

                    }

                })

                resolve(response)

            } catch (err) {
                console.log(err);
            }

        })

    },

    UnlistProduct: (proID) => {

        return new Promise(async (resolve, reject) => {

            try {

                await admin.product.updateOne({ _id: proID }, {
                    $set:
                    {
                        product_status: false
                    }

                })

                resolve()

            } catch (err) {
                console.log(err);
            }
        })
    },

    listProduct: (proID) => {

        return new Promise(async (resolve, reject) => {

            try {

                await admin.product.updateOne({ _id: proID }, {
                    $set:
                    {
                        product_status: true
                    }

                })

                resolve()

            } catch (err) {
                console.log(err);
            }
        })
    },

    getOrderDetails: () => {
        return new Promise(async (resolve, reject) => {

            try {
                const orderDetails = await admin.order.aggregate([
                    {
                        $project: {
                            "userId": 1,
                            "orders": 1
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "userDetails",

                        },

                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $unwind: "$userDetails"
                    },
                    {
                        $project: {
                            firstname: "$userDetails.firstName",
                            lastName: "$userDetails.lastName",
                            email: "$userDetails.email",
                            phonenumber: "$userDetails.phonenumber",
                            ordersId: "$orders._id",
                            productArrayDetails: "$orders.productDetails",
                            paymentMethod: "$orders.paymentMethod",
                            paymentStatus: "$orders.paymentStatus",
                            totalPrice: "$orders.totalPrice",
                            totalQuantity: "$orders.totalQuantity",
                            shippingAddress: "$orders.shippingAddress",
                            status: "$orders.status",
                            orderStatus: "$orders.orderStatus",
                            createdAt: "$orders.createdAt",
                        }
                    },

                    { $sort: { createdAt: -1 } }
                ])
                console.log("allOrders :", orderDetails);
                resolve(orderDetails)
            } catch (err) {
                console.log(err);
            }
        })
    },

    orderProDetails: (orderId, email) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userInfo = await admin.user.findOne({ email: email })
                let userID = userInfo._id
                let orderID = (ObjectId(orderId));
                const orderDetails = await admin.order.aggregate([
                    {
                        $match: { userId: userID }
                    },
                    {
                        $unwind: "$orders"
                    },
                    {
                        $match: { "orders._id": orderID }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "userDetails",

                        },

                    },

                    {
                        $unwind: "$userDetails"
                    },
                    {
                        $project: {
                            userId: "$userDetails._id",
                            firstname: "$userDetails.firstName",
                            lastname: "$userDetails.lastName",
                            email: "$userDetails.email",
                            mobile: "$userDetails.phonenumber",
                            orderID: "$orders._id",
                            productArrayDetails: "$orders.productDetails",
                            paymentMethod: "$orders.paymentMethod",
                            paymentStatus: "$orders.paymentStatus",
                            cancellationReason: "$orders.cancellationReason",
                            totalPrice: "$orders.totalPrice",
                            totalQuantity: "$orders.totalQuantity",
                            shippingAddress: "$orders.shippingAddress",
                            status: "$orders.status",
                            orderStatus: "$orders.orderStatus",
                            createdAt: "$orders.createdAt"
                        }
                    },
                    {
                        $unwind: "$productArrayDetails"
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "productArrayDetails.product_id",
                            foreignField: "_id",
                            as: "productDetails",

                        },

                    },
                    {
                        $unwind: "$productDetails"
                    },
                    {
                        $unwind: "$productDetails.product_details"
                    },
                    {
                        $project: {
                            userId: 1,
                            firstname: 1,
                            lastname: 1,
                            email: 1,
                            mobile: 1,
                            orderID: 1,
                            product_name: "$productDetails.product_name",
                            description: "$productDetails.description",
                            price: "$productDetails.price",
                            size: "$productDetails.product_details.size",
                            color: "$productDetails.product_details.color",
                            gender: "$productDetails.gender",
                            brand: "$productDetails.brand",
                            catagory: "$productDetails.catagory",
                            sub_catagory: "$productDetails.sub_catagory",
                            Image: "$productDetails.Image",
                            product_quantity: "$productArrayDetails.quantity",
                            product_subTotal: "$productArrayDetails.sub_total",
                            paymentMethod: 1,
                            paymentStatus: 1,
                            totalPrice: 1,
                            totalQuantity: 1,
                            shippingAddress: 1,
                            cancellationReason: 1,
                            status: 1,
                            orderStatus: 1,
                            createdAt: 1
                        }
                    },
                    {
                        $lookup: {
                            from: "addresses",
                            localField: "shippingAddress",
                            foreignField: "address._id",
                            as: "addressDetails",

                        },

                    },
                    {
                        $unwind: "$addressDetails"
                    },
                    {
                        $unwind: "$addressDetails.address"
                    },
                    {
                        $match: (

                            {
                                $expr: { $eq: ["$addressDetails.address._id", "$shippingAddress"] }
                            }

                        )
                    },
                    {
                        $project: {
                            userId: 1,
                            firstname: 1,
                            lastname: 1,
                            email: 1,
                            mobile: 1,
                            orderID: 1,
                            product_name: 1,
                            description: 1,
                            price: 1,
                            size: 1,
                            color: 1,
                            gender: 1,
                            brand: 1,
                            catagory: 1,
                            sub_catagory: 1,
                            Image: 1,
                            product_quantity: 1,
                            product_subTotal: 1,
                            paymentMethod: 1,
                            paymentStatus: 1,
                            cancellationReason: 1,
                            totalPrice: 1,
                            totalQuantity: 1,
                            shippingAddress: "$addressDetails.address",
                            status: 1,
                            orderStatus: 1,
                            createdAt: 1
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            orderId: { $first: "$orderID" },
                            userId: { $first: "$userId" },
                            firstname: { $first: "$firstname" },
                            lastname: { $first: "$lastname" },
                            email: { $first: "$email" },
                            mobile: { $first: "$mobile" },
                            paymentMethod: { $first: "$paymentMethod" },
                            paymentStatus: { $first: "$paymentStatus" },
                            cancellationReason: { $first: "$cancellationReason" },
                            totalPrice: { $first: "$totalPrice" },
                            totalQuantity: { $first: "$totalQuantity" },
                            shippingAddress: { $first: "$shippingAddress" },
                            orderStatus: { $first: "$orderStatus" },
                            createdAt: { $first: "$createdAt" },
                            products: {
                                $push: {
                                    productName: "$product_name",
                                    price: "$price",
                                    description: "$description",
                                    size: "$size",
                                    color: "$color",
                                    gender: "$gender",
                                    brand: "$brand",
                                    catagory: "$catagory",
                                    sub_catagory: "$sub_catagory",
                                    Image: "$Image",
                                    product_quantity: "$product_quantity",
                                    product_subTotal: "$product_subTotal"
                                },

                            }
                        }
                    }

                ])
                console.log("orderDetails : ", orderDetails[0].products[0]);
                resolve(orderDetails)
            } catch (err) {
                console.log(err);
            }
        })
    },

    amendOrderStatus: (userId, orderId, orderStatus, reason) => {
        return new Promise(async (resolve, reject) => {
            try {
                await admin.order.updateOne({ "userId": ObjectId(userId), "orders._id": ObjectId(orderId) },
                    { $set: { "orders.$.orderStatus": orderStatus, "orders.$.cancellationReason": reason } })

                const orderItem = await admin.order.findOne({ "userId": userId, "orders._id": ObjectId(orderId) }, { "orders.$": 1, _id: 0 })
                console.log("orderItem qauntity increase : ", orderItem);
                for (let i = 0; i < orderItem.orders[0].productDetails.length; i++) {
                    const productId = orderItem.orders[0].productDetails[i].product_id;
                    const quantity = orderItem.orders[0].productDetails[i].quantity
                    console.log("productId and quantity : ", productId, quantity);
                    await admin.product.updateOne(
                        { _id: productId },
                        { $inc: { "product_details.0.quantity": quantity } }
                    )
                }
                resolve()

            } catch (err) {
                console.log(err);
            }
        })
    }

}