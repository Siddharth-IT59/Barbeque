const Order = require('../../../models/order')

const statusController = () => {
    return {
        update(req, res) {
            Order.findByIdAndUpdate(req.body.orderId,{ status: req.body.status }, (err,data) => {
                if(err){
                    return res.redirect('/admin/orders')
                }
                // emit event
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })
                res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = statusController