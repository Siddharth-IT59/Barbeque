const Order = require('../../../models/order')
const Promo = require('../../../models/promo')
const moment = require('moment')
const sendOrderMail = require('../../../../emails/sendOrderMail')

const orderController = () => {
    return {
        store(req, res) {
            console.log(req.body)
            // validate req
            const {
                phone,
                address,
                promoCode
            } = req.body
            if (!phone || !address) {
                req.flash('error', 'All fields mandatory !')
                return res.redirect('/cart')
            }
            let total = req.session.cart.discount ? req.session.cart.totalPrice - req.session.cart.discount : req.session.cart.totalPrice
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                total: total,
                phone: phone,
                address: address,
                promoCode: promoCode
            })
            order.save().then((result) => {
                Order.populate(result, {
                    path: 'customerId'
                }, (err, data) => {
                    req.flash('success', 'Order Placed successfully !')
                    sendOrderMail(result)
                    console.log(result)
                    delete req.session.cart
                    delete req.session.promo
                    // Emit
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', data)
                    return res.redirect('/customer/orders')
                })
            }).catch((err) => {
                req.flash('error', 'Something went wrong !')
                res.redirect('/cart')
            })
        },
        async index(req, res) {
            const orders = await Order.find({
                    customerId: req.user._id
                },
                null, {
                    sort: {
                        'createdAt': -1
                    }
                })
            req.header('Cache-Control', 'no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0')
            if (!orders) {
                req.flash('error', 'No orders')
                res.redirect('/cart')
            }
            res.render('customers/orders', {
                orders: orders,
                moment: moment
            })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            if (!order) {
                req.flash('success', 'Your order has been cancelled by the restaurant')
                return res.redirect('/customer/orders')
            } else if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', {
                    order
                })
            }
            res.redirect('/')
        },
        async cancel(req, res) {
            const order = await Order.findByIdAndDelete(req.body.order_id)
            if (!order) {
                req.flash('error', 'Cannot Delete')
                return res.redirect('/customers/orders')
            }
            const eventEmitter = req.app.get('eventEmitter')
            eventEmitter.emit('cancelledByCustomer', {
                id: order._id
            })

            return res.redirect('/')
        },
        async applyPromoCode(req, res) {
            delete req.session.promo
            delete req.session.cart.discount

            const promo = await Promo.findOne({
                code: req.body.coupon
            })
            if (!promo) {
                req.flash('error', 'Invalid Promo Code')
                return res.redirect('/cart')
            }
            //console.log(req.user)
            req.session.promo = promo.discount
            req.session.cart.discount = promo.discount
            //req.session.cart.totalPrice = req.session.cart.totalPrice - promo.discount
            return res.json({
                discount: req.session.cart.discount,
                totalPrice: req.session.cart.totalPrice
            })
        },
        async removeFromCart(req, res) {
            const {
                id
            } = req.body

            var price = req.session.cart.items[id].item.price
            const qty = req.session.cart.items[id].qty
            if (qty > 1) {
                price = price * qty
            }
            delete req.session.cart.items[id]

            req.session.cart.totalPrice = req.session.cart.totalPrice - price
            if (req.session.cart.totalPrice === 0) {
                delete req.session.cart
                return res.redirect('/')
            }
            req.session.cart.totalQty = req.session.cart.totalQty - qty
            return res.json({
                cart: req.session.cart
            })
        }
    }
}

module.exports = orderController