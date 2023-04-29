const admin = require('../models/connection')
const bcrypt = require('bcrypt');
const { response } = require('express');
const { product } = require('../models/connection');
const ObjectId = require('mongodb').ObjectId
const moment = require("moment/moment");


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

    getAdminDashboard: () => {
        let date = new Date();
        let year = moment(date).format('YYYY');

        const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

        console.log("startDate: ", startDate.toISOString());
        console.log("endDate: ", endDate.toISOString());


        return new Promise(async (resolve, reject) => {
            try {
                const dashBoard = await admin.order.aggregate([
                    {
                        $unwind:
                        {
                            path: "$orders",
                        },
                    },
                    {
                        $match:
                        {
                            "orders.orderStatus": "Delivered",
                            "orders.createdAt": {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate),
                            },
                        },
                    },
                    {
                        $project:
                        {
                            orders: 1,
                        },
                    },
                    {
                        $group:
                        {
                            _id: null,
                            totalRevenue: {
                                $sum: "$orders.totalPrice",
                            },
                            orderCount: {
                                $sum: 1,
                            },
                            monthlyEarning: {
                                $avg: "$orders.totalPrice",
                            },
                        },
                    },
                    {
                        $project: {
                            "totalRevenue": 1,
                            "orderCount": 1,
                            monthlyEarning: { $floor: { $divide: ["$totalRevenue", 12] } }
                        }
                    }
                ])
                const productCount = await admin.product.countDocuments({});
                console.log("dashBoard : ", dashBoard, productCount);

                const yearlySalesgraph = await admin.order.aggregate([
                    {
                        $unwind:
                        {
                            path: "$orders",
                        },
                    },
                    {
                        $match:
                        {
                            "orders.orderStatus": "Delivered",
                            "orders.createdAt": {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate),
                            },
                        },
                    },
                    {
                        $group:
                        {
                            _id: {
                                monthSort: {
                                    $month: "$orders.createdAt",
                                },
                            },
                            totalSales: {
                                $sum: "$orders.totalPrice",
                            },
                        },
                    },
                    {
                        $sort:
                        {
                            "_id.monthSort": 1,
                        },
                    },
                    {
                        $project:
                        {
                            _id: 0,
                            months: {
                                $arrayElemAt: [
                                    [
                                        "",
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec",
                                    ],
                                    "$_id.monthSort",
                                ],
                            },
                            totalSales: "$totalSales",
                        },
                    },
                ])

                console.log("yearlysales graph:", yearlySalesgraph);

                const categoryCount = await admin.order.aggregate(
                    [
                        {
                            $unwind:

                            {
                                path: "$orders",
                            },
                        },
                        {
                            $match:

                            {
                                "orders.orderStatus": "Delivered",
                            },
                        },
                        {
                            $lookup:

                            {
                                from: "products",
                                localField:
                                    "orders.productDetails.product_id",
                                foreignField: "_id",
                                as: "products",
                            },
                        },
                        {
                            $project:

                            {
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
                                count: {
                                    $sum: 1,
                                },
                            },
                        },
                    ]
                )
                console.log("categoryCount : ", categoryCount);
                resolve({ dashBoard, productCount, yearlySalesgraph, categoryCount })
            } catch (err) {
                reject("unable to load Dashboard")
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

    getSalesReport: () => {
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
                        $match: {
                            "orders.orderStatus": "Delivered"
                        }
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
                for (let i = 0; i < orderDetails.length; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('Do MMMM YYYY');
                }
                console.log("orderDetails sales report :", orderDetails);
                resolve(orderDetails)
            } catch (err) {
                console.log(err)
                reject("unable to show sales reeport")
            }
        })
    },

    getfilteredSalesReport: (dates) => {
        console.log("dates", dates);
        let startDate = dates.startDate
        let endDate = new Date(dates.endDate)
        endDate.setDate(endDate.getDate() + 1)
        console.log("endDate startDate : ", endDate, startDate);
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
                        $match: {
                            "orders.orderStatus": "Delivered",
                            "orders.createdAt": {
                                $gte: new Date(startDate),
                                $lte: endDate
                            }
                        }
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
                for (let i = 0; i < orderDetails.length; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('Do MMMM YYYY');
                }
                console.log("orderDetails sales report filter :", orderDetails);
                resolve(orderDetails)
            } catch (err) {
                console.log(err)
                reject("unable to show sales report")
            }
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
                    if (info2 === null) {
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
                    discountPrice: product.discountPrice,
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
                        discountPrice: updatedProduct.discountPrice,
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

    getOrderDetails: (pageNo) => {
        if (pageNo === undefined) {
            pageNo = '1'
        }
        pageNo = parseInt(pageNo)
        console.log("pageNO ", typeof pageNo);
        return new Promise(async (resolve, reject) => {

            try {
                let totalOrders =await admin.order.aggregate([
                    {
                       "$unwind":"$orders"
                    },
                   { $group: { 
                        _id: null, 
                        count: { $sum: 1 } // count the number of documents
                      } 
                    }
                ])

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

                    { $sort: { createdAt: -1 } },
                    {
                        $skip: ((pageNo*10)-10),
                    },
                    {
                        $limit: (10),
                    },
                ])
                for (let i = 0; i < orderDetails.length; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('Do MMMM YYYY');
                }

                // console.log("allOrders :", orderDetails,totalOrders);
                totalOrders = totalOrders[0].count
                resolve({orderDetails,totalOrders})
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
                            couponDiscount: "$orders.couponDiscount",
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
                            product_unitPrice: "$productArrayDetails.perUnitPrice",
                            product_quantity: "$productArrayDetails.quantity",
                            product_subTotal: "$productArrayDetails.sub_total",
                            couponDiscount: 1,
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
                            product_unitPrice: 1,
                            product_quantity: 1,
                            product_subTotal: 1,
                            couponDiscount: 1,
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
                            couponDiscount: { $first: "$couponDiscount" },
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
                                    product_unitPrice: "$product_unitPrice",
                                    product_quantity: "$product_quantity",
                                    product_subTotal: "$product_subTotal"
                                },

                            }
                        }
                    }

                ])
                for (let i = 0; i < orderDetails.length; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('MMMM Do YYYY, h:mm:ss a')
                }
                console.log("orderDetails admin healper : ", orderDetails);
                resolve(orderDetails)
            } catch (err) {
                console.log(err);
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
                const existingWallet = await admin.wallet.findOne({ "userId": userId });
                if (existingWallet !== null) {
                    existingWallet.balance += tranObj.amount;
                    existingWallet.transactions.push(tranObj); // Add new transaction to array
                    await existingWallet.save();

                } else {

                    const newWallet = new admin.wallet({
                        userId: userId,
                        balance: tranObj.amount,
                        transactions: [tranObj] // Create new array with the new transaction
                    })
                    await newWallet.save();

                }
                await admin.order.updateOne({ "userId": userId, "orders._id": response.orderId },
                    { $set: { "orders.$.refundStatus": true, "orders.$.paymentStatus": "refunded" } })
                resolve()

            } catch (err) {
                console.log(err);
                reject("Failed to update wallet")
            }
        })
    },

    amendOrderStatus: (userId, orderId, orderStatus, reason) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {
                if (reason === "") {
                    let orderInfo = await admin.order.updateOne({ "userId": ObjectId(userId), "orders._id": ObjectId(orderId) },
                        { $set: { "orders.$.orderStatus": orderStatus } })
                    console.log("amendOrderStatus admin helper : ", orderInfo);
                    resolve()

                } else {

                    let orderInfo = await admin.order.updateOne({ "userId": ObjectId(userId), "orders._id": ObjectId(orderId) },
                        { $set: { "orders.$.orderStatus": orderStatus, "orders.$.cancellationReason": reason } })

                    const orderItem = await admin.order.findOne({ "userId": userId, "orders._id": ObjectId(orderId) }, { "orders.$": 1, _id: 0 })
                    response.userId = userId
                    response.orderId = ObjectId(orderId)
                    response.totalPrice = orderItem.orders[0].totalPrice

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

                    if (orderInfo.modifiedCount === 1
                        && orderItem.orders[0].paymentMethod !== 'COD'
                        && orderItem.orders[0].paymentStatus === 'success') {
                        resolve(response)
                    }
                    resolve()
                }


            } catch (err) {
                console.log(err);
                reject("order cancellation failed")
            }
        })
    },

    sortOrderStatus: (orderStatus) => {
        return new Promise(async (resolve, reject) => {
            try {


                const orderDetails = await admin.order.aggregate([
                    {
                        $project: {
                            userId: 1,
                            orders: 1,
                        },
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
                        $unwind: "$orders",
                    },
                    {
                        $unwind: "$userDetails",
                    },
                    {
                        $match:
                        {
                            "orders.orderStatus": orderStatus,
                        },
                    },
                    {
                        $project: {
                            firstname: "$userDetails.firstName",
                            lastName: "$userDetails.lastName",
                            email: "$userDetails.email",
                            phonenumber: "$userDetails.phonenumber",
                            ordersId: "$orders._id",
                            productArrayDetails:
                                "$orders.productDetails",
                            paymentMethod: "$orders.paymentMethod",
                            paymentStatus: "$orders.paymentStatus",
                            totalPrice: "$orders.totalPrice",
                            totalQuantity: "$orders.totalQuantity",
                            shippingAddress: "$orders.shippingAddress",
                            status: "$orders.status",
                            orderStatus: "$orders.orderStatus",
                            createdAt: "$orders.createdAt",
                        },
                    },
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                ])
                for (let i = 0; i < orderDetails.length; i++) {
                    orderDetails[i].createdAt = moment(orderDetails[i].createdAt).format('Do MMMM YYYY');
                }


                console.log("sorted orderstatus :", orderDetails);
                resolve(orderDetails)
            } catch (err) {
                console.log(err);
                reject("unable to process request..!")
            }
        })
    },

    //offers
    postoffer: (offer) => {
        const offerObj = {
            gender: offer.gender,
            category: offer.category,
            subcategory: offer.subcategory,
            offerPercentage: offer.offerPercentage,
            endDate: offer.endDate,
            offerStatus: true
        }
        let offerPercentage = parseInt(offer.offerPercentage)
        if (offer.subcategory === undefined) {
            offer.subcategory = ''
        }
        console.log("offerObj : ", offerObj, typeof (offerPercentage));
        return new Promise(async (resolve, reject) => {

            try {
                const categoryExist = await admin.offer.find({ 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory, 'offerStatus': true })
                console.log("categoryExist : ", categoryExist);

                if (categoryExist.length === 0) {
                    await admin.product.updateMany(
                        { 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory },
                        [
                            {
                                $set: {
                                    discountPrice: {
                                        $floor: {
                                            $multiply: [
                                                "$price",
                                                {
                                                    $subtract: [
                                                        1,
                                                        { $divide: [offerPercentage, 100] }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    discountPercentage: offer.offerPercentage,
                                    offerStatus: true
                                }
                            }
                        ]
                    )

                    const categoryOffer = new admin.offer({
                        gender: offer.gender,
                        category: offer.category,
                        subcategory: offer.subcategory,
                        offerPercentage: offer.offerPercentage,
                        endDate: offer.endDate,
                        offerStatus: true
                    })
                    await categoryOffer.save()
                }
                resolve()

            } catch (err) {
                console.log(err);
            }
        })

    },

    OfferExist: (offer) => {

        let offerPercentage = parseInt(offer.offerPercentage)
        if (offer.subcategory === undefined) {
            offer.subcategory = ''
        }
        console.log("offerObj : ", typeof (offerPercentage));
        return new Promise(async (resolve, reject) => {

            try {
                const categoryExist = await admin.offer.find({ 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory, 'offerStatus': true })
                console.log("categoryExist : ", categoryExist);

                if (categoryExist.length !== 0) {
                    let response = []
                    response = categoryExist
                    resolve(response)
                }

            } catch (err) {
                console.log(err);
            }
        })

    },

    OfferUnlist: (offer) => {

        let offerPercentage = parseInt(offer.offerPercentage)
        if (offer.subcategory === undefined) {
            offer.subcategory = ''
        }
        console.log("offerObj OfferUnlist : ", typeof (offerPercentage));
        return new Promise(async (resolve, reject) => {

            try {

                let products = await admin.product.findOne(
                    { 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory, productOfferStatus: true },
                    { "productOfferPercentage": 1 })
                console.log("products discountPercentage : ", products);
                if (products) {
                    await admin.offer.updateOne({ '_id': ObjectId(offer.offfeID) }, { $set: { "offerStatus": false } })
                    await admin.product.updateOne(
                        { 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory },
                        [
                            {
                                $set: {
                                    discountPrice: {
                                        $floor: {
                                            $multiply: [
                                                "$price",
                                                {
                                                    $subtract: [
                                                        1,
                                                        { $divide: [products.productOfferPercentage, 100] }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    discountPercentage: "",
                                    offerStatus: ""
                                }
                            }
                        ]
                    )
                    await admin.product.updateMany(
                        { 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory, productOfferStatus: false },

                        {
                            $unset: {
                                discountPrice: "",
                                discountPercentage: "",
                                offerStatus: ""
                            }
                        }

                    )
                } else {
                    await admin.offer.updateOne({ '_id': ObjectId(offer.offfeID) }, { $set: { "offerStatus": false } })
                    console.log("test check");
                    await admin.product.updateMany(
                        { 'gender': offer.gender, 'catagory': offer.category, 'sub_catagory': offer.subcategory },

                        {
                            $unset: {
                                discountPrice: "",
                                discountPercentage: "",
                                offerStatus: ""
                            }
                        }

                    )
                }


                resolve({ response: true })

            } catch (err) {
                console.log(err);
            }
        })

    },

    offerList: () => {

        return new Promise(async (resolve, reject) => {

            try {

                const response = await admin.offer.find({})
                if (response) {
                    console.log("offerlist response : ", response);
                    resolve(response)
                } else {
                    response = false
                    resolve(response)
                }

            } catch (err) {
                reject("you  have  no offer list to show")
                console.log(err);
            }
        })

    },

    //product-offer

    getProductoffer: () => {

        return new Promise(async (resolve, reject) => {

            try {
                let products = []
                products = await admin.product.find({})
                console.log("products OfferProductList : ", products);
                resolve(products)
            } catch (err) {
                console.log(err);
            }
        })

    },


    OfferProductList: (categoryDetails) => {

        return new Promise(async (resolve, reject) => {

            try {
                let products = []
                products = await admin.product.find({ gender: categoryDetails.gender, catagory: categoryDetails.category, sub_catagory: categoryDetails.subcategory })
                console.log("products OfferProductList : ", products);
                resolve(products)
            } catch (err) {
                console.log(err);
            }
        })

    },

    unListProductOffer: (offerDetails) => {

        return new Promise(async (resolve, reject) => {

            try {
                let products = await admin.product.findOne({ _id: ObjectId(offerDetails.proId), offerStatus: true }, { "discountPercentage": 1 })
                console.log("products discountPercentage : ", products);
                if (products) {
                    await admin.product.updateOne(
                        { _id: ObjectId(offerDetails.proId) },
                        [
                            {
                                $set: {
                                    discountPrice: {
                                        $floor: {
                                            $multiply: [
                                                "$price",
                                                {
                                                    $subtract: [
                                                        1,
                                                        { $divide: [products.discountPercentage, 100] }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    productOfferPercentage: 0,
                                    productOfferStatus: false,
                                    productofferExpiry: ''
                                }
                            }
                        ]
                    )
                } else {
                    await admin.product.updateOne({ _id: ObjectId(offerDetails.proId) }, { $set: { productOfferStatus: false, productOfferPercentage: 0, productofferExpiry: '', discountPrice: 0 } })
                }
                resolve({ ok: true })
            } catch (err) {
                console.log(err);
            }
        })

    },

    OfferProductSort: (status) => {
        console.log("offerStatus : ", status.offerStatus);
        let response = []
        return new Promise(async (resolve, reject) => {

            try {
                if (status.offerStatus === "allProducts") {
                    response = await admin.product.find({})
                } else if (status.offerStatus === "OfferProducts") {
                    response = await admin.product.find({ productOfferStatus: true })
                }
                resolve(response)
            } catch (err) {
                reject("unable to load content")
            }
        })
    },



    postProductofferPage: (offerDetails) => {
        console.log("offerDetails : ", offerDetails);
        let percentage = parseInt(offerDetails.percentage)
        return new Promise(async (resolve, reject) => {

            try {
                let products = await admin.product.findOne({ _id: ObjectId(offerDetails.proId), productOfferStatus: false })
                if (products) {
                    await admin.product.updateOne(
                        { _id: ObjectId(offerDetails.proId) },
                        [
                            {
                                $set: {
                                    discountPrice: {
                                        $floor: {
                                            $multiply: [
                                                "$price",
                                                {
                                                    $subtract: [
                                                        1,
                                                        { $divide: [percentage, 100] }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    productOfferPercentage: offerDetails.percentage,
                                    productOfferStatus: true,
                                    productofferExpiry: offerDetails.endDate
                                }
                            }
                        ]
                    )
                }

                resolve({ ok: true })
            } catch (err) {
                console.log(err);
            }
        })
    },


    //coupon

    couponList: () => {

        return new Promise(async (resolve, reject) => {

            try {
                let response = await admin.coupon.find({})
                for (let i = 0; i < response.length; i++) {
                    response[i].endDate = moment(response[i].endDate).format('Do MMMM YYYY');
                }
                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })

    },

    postCoupon: (couponDetails) => {

        return new Promise(async (resolve, reject) => {

            try {
                const couponCode = Math.random().toString(36).substring(2, 10);
                console.log("couponCode : ", couponCode, couponDetails);

                const coupon = new admin.coupon({
                    discountPercentage: couponDetails.discountPercentage,
                    maxDiscountAmount: couponDetails.maxDiscountAmount,
                    minAmount: couponDetails.minAmount,
                    category: couponDetails.category,
                    couponCode: couponCode,
                    endDate: new Date(couponDetails.endDate),
                    description: couponDetails.description
                })
                await coupon.save()
                resolve()
            } catch (err) {
                console.log(err);
            }
        })

    },

    unlistCoupon: (couponCode) => {
        return new Promise(async (resolve, reject) => {
            try {
                const couponStatus = await admin.coupon.updateOne({ couponCode: couponCode }, { $set: { couponStatus: false } });
                console.log("couponStatus :", couponStatus);
                if (couponStatus.modifiedCount === 1) {
                    resolve({ ok: true });
                }
            } catch (err) {
                console.log(err);
                reject("coupon unlist failed..!");
            }
        });
    },


}   