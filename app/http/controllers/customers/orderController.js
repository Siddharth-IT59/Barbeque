const Order = require('../../../models/order')
const Promo = require('../../../models/promo')
const moment = require('moment')
const sendOrderMail = require('../../../../emails/sendOrderMail')

const orderController = () => {
    return {
        store(req, res){
            console.log(req.body)
            // validate req
            const { phone, address, promoCode } = req.body
            if(!phone || !address){
                req.flash('error','All fields mandatory !')
                return res.redirect('/cart')
            }
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
                promoCode: promoCode
            })
            order.save().then((result) => {
                Order.populate(result, { path: 'customerId' }, (err, data) => {
                    req.flash('success','Order Placed successfully !')
                    sendOrderMail(result)
                    //console.log(result)
                    delete req.session.cart
                    delete req.session.promo
                    // Emit
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', data)
                    return res.redirect('/customer/orders')
                })
            }).catch((err) => {
                req.flash('error','Something went wrong !')
                res.redirect('/cart')
            })
        },
        async index(req, res){
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: {'createdAt': -1} })
                req.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0')
            if(!orders){
                req.flash('error','No orders')
                res.redirect('/cart')
            }
            res.render('customers/orders',{ orders: orders, moment: moment })
        },
        async show(req, res){
            const order = await Order.findById(req.params.id)
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customers/singleOrder', { order })
            }
            res.redirect('/')
        },
        async cancel(req, res){
            const order = await Order.findByIdAndDelete(req.body.order_id)
            if(!order){
                req.flash('error','Cannot Delete')
                return res.redirect('/customers/orders')
            }
            return res.redirect('/')
        },
        async applyPromoCode(req, res){
            delete req.session.promo
            delete req.session.cart.discount
            console.log(req.body)
            console.log(req.body.coupon)
            //delete req.session.promo
            const promo = await Promo.findOne({ code: req.body.coupon })
            console.log(promo)
            if(!promo){
                req.flash('error','Invalid Promo Code')
                return res.redirect('/cart')
            }
            //console.log(req.user)
            req.session.promo = promo.discount
            req.session.cart.discount = promo.discount 
            //req.session.cart.totalPrice = req.session.cart.totalPrice - promo.discount
            return res.json({ discount: req.session.cart.discount , totalPrice: req.session.cart.totalPrice})
        }
    }
}

module.exports = orderController