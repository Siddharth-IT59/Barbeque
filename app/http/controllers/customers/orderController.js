const Order = require('../../../models/order')
const moment = require('moment')

const orderController = () => {
    return {
        store(req, res){
            // validate req
            const { phone, address } = req.body
            if(!phone || !address){
                req.flash('error','All fields mandatory !')
                return res.redirect('/cart')
            }
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address
            })
            order.save().then((result) => {
                Order.populate(result, { path: 'customerId' }, (err, data) => {
                    req.flash('success','Order Placed successfully !')
                    delete req.session.cart
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
        }
    }
}

module.exports = orderController