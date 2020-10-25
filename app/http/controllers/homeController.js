const Dish = require('../../models/menu')

const homeController = () =>{
    return {
        async index(req, res){
            const dishes = await Dish.find({})
            req.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0')
            return res.render('home', { dishes: dishes , user: req.user })
        }
    }
}

module.exports = homeController