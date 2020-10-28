const { redBright } = require('chalk')
const Order = require('../../../models/order')
const Promo = require('../../../models/promo')

const orderController = () => {
    return {
        index(req, res) {
            Order.find({ status : { $ne: 'completed' }},null, { sort: {'createdAt': -1} })
            .populate('customerId','-password').exec((err, orders) => {
                if(req.xhr){
                    return res.json(orders)
                }else{
                    return res.render('admin/orders')
                }
            })
        },
        promoCode(req, res){
            return res.render('admin/discounts')
        },
        async addCode(req, res){
            console.log(req.body)
            const promo = new Promo({
                code: req.body.promoCode,
                discount: req.body.promoValue
            })
            try{
                await promo.save()
                return res.json({ code: req.body.promoCode })
            }catch(e){
                return res.json({ status: 'Cannot add !' })
            }
        },
        async disableCode(req, res){
            try{
                const promo = await Promo.findOneAndDelete({ code: req.body.promoCode, discount: req.body.promoValue})
                if(!promo){
                    return res.json({ status: 'Invalid Code !' })
                }
                return res.json({ promo: promo })
            }catch(e){
                return res.json({ status: 'Operation Failed' })
            }    
        },
        async getActiveCodes(req, res){
            try{
                const promos = await Promo.find({})
                if(!promos){
                    return res.json({ status: 'No active codes' })
                }
                return res.json({ promos: promos })
            }catch(e){
                return res.json({ status: 'Error !' })
            }
        },
        async cancelOrder(req, res){
            try{
                const order = await Order.findOneAndDelete({ _id: req.body.orderId }) 
                if(!order){
                    return res.redirect('/')
                } 
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderCanceled', { id: order._id })
                return res.redirect('/admin/orders') 
            }catch(e){
                res.render('error')
            }
        }
    }
}

module.exports = orderController