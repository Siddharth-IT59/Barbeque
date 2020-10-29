const Promo = require("../../../models/promo")

const cartController = () => {
    return{
        async index(req, res) {
            const promos = await Promo.find({})
            if(promos){
                res.render('customers/cart',{ promos: promos })
            }
        },
        async update(req, res) {
            //creating cart for the first time
            if(!req.session.cart){
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice:0
                }
            }
            let cart = req.session.cart
            // check if item doesn't exist
            if(!cart.items[req.body._id]){
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1 ,
                }
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }else{
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
                cart.totalQty = cart.totalQty + 1
                cart.totalPrice = cart.totalPrice + req.body.price
            }
            return res.json({totalQty: req.session.cart.totalQty})
        }
    }
}

module.exports = cartController