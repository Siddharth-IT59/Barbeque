const passport = require('passport')
const User = require('../../models/user')

const authController = () => {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : 'customer/orders'
    }
    return {
        login(req, res) {
            res.render('auth/login')
        },
        postLogin(req, res, next){
            const { email,password } = req.body
            if(!email || !password){
                req.flash('error','All fields are mandatory')
                return res.redirect('/login')
            }
            
            passport.authenticate('local', (err, user, info) => {
                if(err){
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err){
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req,res,next)
        },
        register(req, res) {
            res.render('auth/register')
        },
        async postRegister(req, res){
            const { name, email, password } = req.body
            // Validation of user data
            if(!name || !email || !password){
                req.flash('error','All fields are mandatory')
                return res.redirect('/register')
            }
            //check if email exist
            User.exists({ email: email } , (_err,result) => {
                if(result){
                    req.flash('error','email already exist')
                    return res.redirect('/register')
                }
            })
            
            const user = new User({ name, email, password })
            try{
                await user.save()
                return res.redirect('/')
            }catch(e){
                req.flash('error','Something went wrong')
                res.redirect('/register')
            }    
        },
        logout(req, res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

module.exports = authController