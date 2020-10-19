const { Store } = require('express-session')
const { findOneAndUpdate } = require('../../../models/menu')
const Dish = require('../../../models/menu')

const adminFeatureController = () => {
    return {
        async index(req, res) {
            const dishes = await Dish.find({})
            if(!dishes){
                req.flash('error','No dishes found')
                res.redirect('/dishes')
            }
            return res.render('admin/dishes',{ dishes: dishes })
        },
        async addPage(req, res){
            res.render('admin/addDishes')
        },
        async store(req, res){
            const dish = new Dish({
                name: req.body.dishName,
                image: 'img',
                price: req.body.dishPrice,
                size: req.body.dishSize,
            })
            try{
                await dish.save()
                //res.json({ status: 'success' })
                return res.redirect('/dishes')
            }catch(e){
                res.redirect('/dishes')
            }
        },
        async showDish(req, res){
            try{
                const dish = await Dish.findById(req.params.id)
                if(!dish){
                    res.redirect('/dishes')
                }
                return res.render('admin/singleDish', {dish: dish})
            }catch(e){
                res.render('error')
            }
        },
        async saveChanges(req, res){
            try{
                const dish = await Dish.findOneAndUpdate({ _id: req.body.id },{
                    name: req.body.name,
                    price: req.body.price,
                    size: req.body.size
                },{ new: true })
                if(dish){
                    return res.json({ status: 'success' })
                }
            }catch(e){
                res.render('error')
            }
        }
    }
}

module.exports = adminFeatureController