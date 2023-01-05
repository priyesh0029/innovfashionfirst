const admin = require('../models/connection')
const bcrypt = require('bcrypt');
const { response } = require('express');

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

        let response =[]

        console.log(categoryInfo);
        return new Promise(async (resolve, reject) => {

            try {

                info = await admin.categories.findOne()
                if (info == null) {
                    await admin.categories.create({ category: [categoryInfo] })

                } else {
                    id = info._id
                    await admin.categories.updateOne({ id }, { $push: { category: [categoryInfo] } })

                }

                response = await admin.categories.find().select('category').exec();
                console.log('response.category =', response);



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
        console.log("olditem :", details.item);
        console.log("newitem : ", newItem);

        return new Promise(async (resolve, reject) => {
            try {


                await admin.categories.updateOne(

                    { _id: details.id }, {
                    $set: { "category.$[element]": newItem }
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
            console.log("olditem :", details.item);

            try {
                await admin.categories.updateOne({ _id: details.id }, { $pull: { "category": details.item } })

                resolve()

            } catch (err) {
                console.log(err);
            }

        })

    },

    //subcategory---section


    addSubCategory: (subcategoryInfo) => {



        console.log("subcategoryInfo=", subcategoryInfo);
        return new Promise(async (resolve, reject) => {

            try {

                info = await admin.categories.findOne()
                if (info == null) {
                    await admin.categories.create({ subcategory: [subcategoryInfo] })

                } else {
                    id = info._id
                    await admin.categories.updateOne({ id }, { $push: { subcategory: [subcategoryInfo] } })

                }

                response = await admin.categories.find().select('subcategory').exec();
                console.log('response.subcategory =', response);



                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    showSubcategory: () => {

        let response = []

        return new Promise(async (resolve, reject) => {

            try {

                response = await admin.categories.find().select('subcategory').exec();



                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    },

    editCrudSubCategory: (details, newItem) => {

        console.log("id", details.id);
        console.log("olditem :", details.item);
        console.log("newitem : ", newItem);

        return new Promise(async (resolve, reject) => {
            try {


                await admin.categories.updateOne(

                    { _id: details.id }, {
                    $set: { "subcategory.$[element]": newItem }
                },
                    { arrayFilters: [{ element: details.item || null }] }


                )
                resolve()

            } catch (err) {

                console.log(err);
            }
        })
    },

    deleteCrudSubCategory: (details) => {

        return new Promise(async (resolve, reject) => {

            console.log("id", details.id);
            console.log("olditem :", details.item);

            try {
                await admin.categories.updateOne({ _id: details.id }, { $pull: { "subcategory": details.item || null } })

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

        console.log(product);
        console.log(imageName);

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

    viewProducts:() => {

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

    editProducts :()=>{
        let response = {}

        return new Promise(async (resolve, reject) => {

            try {
                response.product = await admin.product.find()
                response.catagories = await admin.categories.find()
               
                console.log("response=",response);

                resolve(response)

            } catch (err) {
                console.log(err);
            }
        })
    }



}