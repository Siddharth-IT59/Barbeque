const Dish = require('../../../models/menu')
const Order = require('../../../models/order')
const moment = require('moment')

const adminFeatureController = () => {
    return {
        async index(req, res) {
            const dishes = await Dish.find({})
            if (!dishes) {
                req.flash('error', 'No dishes found')
                res.redirect('/dishes')
            }
            return res.render('admin/dishes', {
                dishes: dishes
            })
        },
        async addPage(req, res) {
            res.render('admin/addDishes')
        },
        async store(req, res) {
            console.log(req.file.filename)
            console.log(req.body)
            const dish = new Dish({
                name: req.body.dishName,
                image: req.file.filename,
                price: req.body.dishPrice,
                size: req.body.dishSize,
            })
            try {
                await dish.save()
                //res.json({ status: 'success' })
                return res.redirect('/dishes')
            } catch (e) {
                res.redirect('/dishes')
            }
        },
        async showDish(req, res) {
            try {
                const dish = await Dish.findById(req.params.id)
                if (!dish) {
                    res.redirect('/dishes')
                }
                return res.render('admin/singleDish', {
                    dish: dish
                })
            } catch (e) {
                res.render('error')
            }
        },
        async saveChanges(req, res) {
            try {
                const dish = await Dish.findOneAndUpdate({
                    _id: req.body.id
                }, {
                    name: req.body.name,
                    price: req.body.price,
                    size: req.body.size
                }, {
                    new: true
                })
                if (dish) {
                    return res.json({
                        status: 'success'
                    })
                }
            } catch (e) {
                res.render('error')
            }
        },
        async removeDish(req, res) {
            console.log(req.body)
            try {
                const dish = await Dish.findByIdAndDelete(req.body.id)
                if (!dish) {
                    return res.json({
                        status: 'Could not delete'
                    })
                }
                return res.redirect('/dishes')
            } catch (e) {
                res.render('error')
            }
        },
        async revenuePage(req, res) {
            res.render('admin/revenue', {
                orders: '',
                revenue: ''
            })
        },
        async revenueByMonth(req, res) {
            const orders = await Order.find({}, null, {
                sort: {
                    'createdAt': -1
                }
            }).populate('customerId', '-password').exec()
            const arr = Object.values(orders)

            let revenue = 0
            const dateArr = arr.filter((order) => {
                var month = req.body.month
                var dbMonth = moment(order.createdAt).format()
                if (dbMonth.toString().includes(month.toString())) {
                    revenue = revenue + order.total
                    return order
                }
            })
            res.render('admin/revenue', {
                orders: dateArr,
                moment: moment,
                revenue: revenue
            })
        },
        async revenueByDate(req, res) {
            const orders = await Order.find({}, null, {
                sort: {
                    'createdAt': -1
                }
            }).populate('customerId', '-password').exec()
            const arr = Object.values(orders)

            let revenue = 0
            const dateArr = arr.filter((order) => {
                var date = req.body.date
                var dbDate = moment(order.createdAt).format()
                if (dbDate.toString().includes(date.toString())) {
                    revenue = revenue + order.total
                    return order
                }
            })
            res.render('admin/revenue', {
                orders: dateArr,
                moment: moment,
                revenue: revenue
            })
        }
    }
}

module.exports = adminFeatureController