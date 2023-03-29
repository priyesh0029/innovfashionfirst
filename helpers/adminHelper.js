const admin = require('../models/connection')
const bcrypt = require('bcrypt');
const { response } = require('express');
const { product } = require('../models/connection');

module.exports = {

    adminLogin: (adminData) => {

        console.log(adminData)


        let response = {}


        return new Promise(async (resolve, reject) => {
            try {
                email = adminData.email
                adminInfo = await admin.admin.findOne({ email })

                console.log('admininfo', adminInfo.password);

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

        let response = []

        console.log(categoryInfo);
        console.log(categoryInfo.gender);



        return new Promise(async (resolve, reject) => {
            let gender = categoryInfo.gender
            let subcategory = categoryInfo.category
            let subcategoryname = categoryInfo.subcategoryname

            try {
                const [info] = await admin.categories.find();

                console.log("info", info);
                if (info == undefined) {

                    await admin.categories.create({
                        category: {
                            [gender]: {
                                [subcategory]: [subcategoryname]
                            }
                        }
                    });

                }
                else {
                    console.log("info._id", info._id);
                    await admin.categories.updateOne({ id: info._id }, {
                        $push: { ["category." + gender + "." + subcategory]: subcategoryname }
                    })


                }

                response = await admin.categories.find()
                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
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

        console.log("id", details.id);
        console.log("category", details.categoryobj);
        console.log("subcategory", details.subcategory);
        console.log("olditem :", details.item);
        console.log("newitem : ", newItem);

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

    UnlistProduct : (proID)=>{

        return new Promise(async (resolve, reject) => {

            try{

                await admin.product.updateOne({ _id: proID }, {
                    $set:
                    {
                       product_status : false
                    }

                })

                resolve()

            }catch(err){
                console.log(err);
            }
        })
    },

    listProduct : (proID)=>{

        return new Promise(async (resolve, reject) => {

            try{

                await admin.product.updateOne({ _id: proID }, {
                    $set:
                    {
                       product_status : true
                    }

                })

                resolve()

            }catch(err){
                console.log(err);
            }
        })
    },

}