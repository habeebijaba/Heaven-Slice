var express = require('express');
var router = express.Router();
// setting layout for admin side seperate...
const setAdminLayout = (req, res, next) => {
  res.locals.layout = 'admin-layout'
  next()
}
// using admin layout...
router.use(setAdminLayout)
const { verifyLogin } = require('../middlewares/admin-auth')

const {
  dashboard,
  loginPage,
  login,
  userManagement,
  blockUser,
  unblockUser,
  logout,


} = require('../controller/admin-controller');
const {
  categoryManagement,
  addCategoryPage,
  addCategory,
  deleteCategory,
  editCategoryPage,
  editCategory

} = require('../controller/category-controller')

const {
  productManagement,
  addProductPage,
  addProduct,
  deactivateProduct,
  activateProduct,
  editProductPage,
  editProduct,

} = require('../controller/product-controller')

const {
  orderManagement,
  cancelOrder,
  orderStatusChange,
  viewOrderProducts,
  salesReportPage,
  salesManagement,
  customReport,
} = require('../controller/order-controller')

const{
  bannerManagement,
  addBannerPage,
  addBanner,
  editBannerPage,
  editBanner,
  deleteBanner,
}=require('../controller/banner-controller')

const{
  couponManagement,
  addCoupon,
  editCouponPage,
  editCoupon,
  deleteCoupon,
}=require('../controller/coupen-controller');

const{
  // offerManagement
  prodOfferPage,
  addProdOffer,
  editProdOfferPage,
  editProdOffer,
  deleteProdOffer,
  catOfferPage,
  addCatOffer,
  editCatOfferPage,
  editCatOffer,
  deleteCatOffer

}=require('../controller/offer-controller');
const { getchartData } = require('../controller/order-controller');
// const { logout } = require('../controller/user-controller');

/* GET users listing. */
router.get('/', verifyLogin, dashboard)
router.get('/login', loginPage)
router.post('/login', login)
router.get('/user-management', verifyLogin, userManagement)
router.get('/block-user/:_id', verifyLogin, blockUser)
router.get('/unblock-user/:_id', verifyLogin, unblockUser)
router.get('/category-management', verifyLogin, categoryManagement)
router.get('/add-category', verifyLogin, addCategoryPage)
router.post('/add-category', verifyLogin, addCategory)
router.get('/edit-category/:_id',verifyLogin,editCategoryPage)
router.post('/edit-category',verifyLogin,editCategory)
router.get('/delete-category/:_id', verifyLogin, deleteCategory)
router.get('/product-management', verifyLogin, productManagement)
router.get('/add-product', verifyLogin, addProductPage)
router.post('/add-product', verifyLogin, addProduct)
router.get('/deactivate-product/:_id', verifyLogin, deactivateProduct)
router.get('/activate-product/:_id',verifyLogin,activateProduct)
router.get('/edit-product/:_id', verifyLogin, editProductPage)
router.post('/edit-product', verifyLogin, editProduct)
router.get('/order-management', verifyLogin, orderManagement)
router.get('/view-order-products/:_id', verifyLogin, viewOrderProducts)
router.get('/cancel-order/:_id', verifyLogin, cancelOrder)
router.post('/order-status', orderStatusChange)
router.get('/banner-management',verifyLogin,bannerManagement)
router.get('/add-banner',verifyLogin,addBannerPage)
router.post('/add-banner',verifyLogin,addBanner)
router.get('/edit-banner/:_id',verifyLogin,editBannerPage)
router.post('/edit-banner',verifyLogin,editBanner)
router.get('/delete-banner/:_id',verifyLogin,deleteBanner)
router.get('/coupon-management',verifyLogin,couponManagement)
router.post('/add-coupon',verifyLogin,addCoupon)
router.get('/edit-coupon/:_id',verifyLogin,editCouponPage)
router.post('/edit-coupon/:_id',verifyLogin,editCoupon)
router.get('/delete-coupon/:_id',verifyLogin,deleteCoupon)
// router.get('/offer-management',verifyLogin,offerManagement)
router.get('/add-prodOffer',verifyLogin,prodOfferPage)
router.post('/product-offers',verifyLogin,addProdOffer)
router.get('/edit-prodOffer/:_id',verifyLogin,editProdOfferPage)
router.post('/edit-prodOffer/:_id',verifyLogin,editProdOffer)
router.get('/delete-prodOffer/:_id',verifyLogin,deleteProdOffer)
router.get('/add-catOffer',verifyLogin,catOfferPage)
router.post('/category-offers',verifyLogin,addCatOffer)
router.get('/edit-catOffer/:_id',verifyLogin,editCatOfferPage)
router.post('/edit-catOffer/:_id',verifyLogin,editCatOffer)
router.get('/delete-catOffer/:_id',verifyLogin,deleteCatOffer)
router.get('/getChartData',getchartData)
router.get('/sales-report',salesReportPage)
router.get('/sales-management',verifyLogin,salesManagement) //actually the report 
router.post('/custom-report',verifyLogin,customReport)
router.get('/logout',logout)



module.exports = router;
