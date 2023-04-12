const { response } = require('../app');
const userhelpers = require('../helpers/userHelper')
const user = require("../models/connection");

module.exports = {

    userAuth: ((req, res, next) => {

        if (req.session.user) {
            let email = req.session.user.email
            userhelpers.middlewareStatus(email).then((response) => {
                console.log("middlewareStatus session true : ", response);
                if (response.userBlockStatus == false) {
                    next()
                } else {
                    res.render('user/login', { userBlockStatus: true })
                    req.session.user = null
                }
            })

        } else {
            res.redirect('/login')

        }
     }),



    adminAuth: ((req, res, next) => {

        if (req.session.admin) {
            console.log("req.session.admin :",req.session.admin);
            next()
        } else {
            res.redirect('/admin')
        }
    })
}