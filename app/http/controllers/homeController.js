const Dish = require('../../models/menu')

const homeController = () =>{
    return {
        async index(req, res){
            const dishes = await Dish.find({})
            return res.render('home', { dishes: dishes} )
        }
    }
}

module.exports = homeController