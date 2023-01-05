const user = require("../models/connection");
const bcrypt = require('bcrypt');

module.exports = {

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
                userInfo = await user.user.findOne({ email })
                if(userInfo) {
                    if(userInfo.userBlockStatus == false) {
                        bcrypt.compare(userData.password, userInfo.Password).then((status) => {
                            if (status) {
                                username = userInfo.username
                                console.log(username)
                                response = { username, status }
                                console.log(response)

                                resolve(response)
                            } else {
                                response = {status:false}
                                resolve(response)
                            }
                        })
                    }else{
                        resolve({userBlockStatus:true,status:false})
                    }
                } 
                // else {
                //     let err = new Error("user does not exist")
                //     response = { err, status: false }
                //     reject(response)
                // }

            } catch (err) {
                console.log(err);
            }
        })
    }


}