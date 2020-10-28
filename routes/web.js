const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const adminFeatureController = require('../app/http/controllers/admin/adminFeatureController')
const statusController = require('../app/http/controllers/admin/statusController')
const guest = require('../app/http/middleware/guest')
const auth = require('../app/http/middleware/auth')
const admin = require('../app/http/middleware/admin')

const multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/menu/')
  },
  filename: async function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({
  storage: storage
})


const initRoutes = (app) => {
  app.get('/', homeController().index)
  app.get('/login', guest, authController().login)
  app.post('/login', authController().postLogin)
  app.get('/register', guest, authController().register)
  app.post('/register', authController().postRegister)
  app.post('/logout', authController().logout)

  app.get('/cart', cartController().index)
  app.post('/update-cart', cartController().update)

  // Customer Routes
  app.post('/orders', auth, orderController().store)
  app.post('/cancel-order', auth, orderController().cancel)
  app.post('/remove-from-cart', auth, orderController().removeFromCart)
  app.post('/promo-code', auth, orderController().applyPromoCode)
  app.get('/customer/orders', auth, orderController().index)
  app.get('/customer/orders/:id', auth, orderController().show)

  // Admin Routes
  app.get('/admin/orders', admin, adminOrderController().index)
  app.get('/revenue', admin, adminFeatureController().revenuePage)
  app.get('/promocodes', admin, adminOrderController().promoCode)
  app.get('/active-codes', admin, adminOrderController().getActiveCodes)
  app.get('/dishes', admin, adminFeatureController().index)
  app.get('/dishes/add', admin, adminFeatureController().addPage)
  app.get('/dishes/:id', admin, adminFeatureController().showDish)
  app.post('/revenue/month', admin, adminFeatureController().revenueByMonth)
  app.post('/revenue/date', admin, adminFeatureController().revenueByDate)
  app.post('/dishes/save', admin, adminFeatureController().saveChanges)
  app.post('/dishes/remove', admin, adminFeatureController().removeDish)
  app.post('/dishes/add-dish', admin, upload.single('dishImage'), adminFeatureController().store)
  app.post('/add-promo-code', admin, adminOrderController().addCode)
  app.post('/disable-promo-code', admin, adminOrderController().disableCode)
  app.post('/admin/order/status', admin, statusController().update)
  app.post('/admin/order/cancel', admin, adminOrderController().cancelOrder)
}

module.exports = initRoutes