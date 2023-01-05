const userhelpers = require('../helpers/userHelper')

var headerStatus, loginStatus

module.exports = {

    getHome: (req, res) => {
        if (req.session.user) {
            res.render('user/user',{headerStatus:true,user});
        } else {
            res.render('user/user',{headerStatus:false});
        }
        
    },

    getUserLogin: (req, res) => {
        res.render('user/login')
    },

    postUserLogin: (req, res) => {
        userhelpers.doLogin(req.body).then((response) => {

            
             user  = response.username
             req.session.user= response.status

            if (req.session.user) {

                res.redirect('/');

            } else {
                
                if(response.userBlockStatus){
                    
                    res.render('user/login',{userBlockStatus:true})
                }
            res.render('user/login',{loggedInstatus:false}) 
                
            }
        })
    },

    getUserSignup: (req, res) => {
        let emailStatus = true
        res.render('user/signup', { emailStatus })
    },

    postUserSignup: (req, res) => {

        userhelpers.doSignUp(req.body).then((response) => {
            var emailStatus = response.status
            console.log(response)
            if (emailStatus == true) {

                console.log(response.data);
                res.redirect('/login')

            } else {
                res.render('user/signup', { emailStatus })

            }
        })
    },

    getUserShop: (req, res) => {
        if (loginStatus) {
        res.render('user/shop',{headerStatus:true,user})
        }else{
            res.render('user/shop')
        }
    },

    getLogout :(req, res) => {

        req.session.user=null
        res.render('user/user',{headerStatus:false});
    }
}