var express = require('express');
var router = express.Router();
const { verifyLogin } = require('../middlewares/user-auth')

const {
  home,
  signUpPage,
  signUp,
  loginPage,
  login,
  otpLogin,
  enterOtpPage,
  verifyOtp,
  viewProducts,
  productDetails,
  getCart,
  addToCart,
  changeProductQuantity,
  deleteCartItem,
  placeOrderPage,
  placeOrder,
  orderSuccessful,
  viewOrdersPage,
  viewOrderProducts,
  cancelOrder,
  profilePage,
  editProfile,
  addAddress,
  changePassword,
  editProfilePic,
  deleteAddress,
  editAddress,
  WishlistPage,
  addToWishlist,
  deleteWishItem,
  verifyPayment,
  paypalSuccess,
  couponApply,
  viewCatwise,
  proSort,
  getInvoice,
  contactUs,
  saveForLater,
  moveToCart,
  deleteSaveForLater,
  logout
} = require('../controller/user-controller');
// const { moveToCart } = require('../helpers/cart-helpers');

/* GET home page. */
router.get('/', home);
router.get('/signup', signUpPage);
router.post('/signup', signUp)
router.get('/login', loginPage);
router.post('/login', login)
router.get('/otp-login',otpLogin)
router.post('/get-otp', enterOtpPage)
router.post('/verify-otp', verifyOtp)
router.get('/view-products', viewProducts)
router.get('/product-details/:_id', verifyLogin, productDetails)
router.get("/cart", verifyLogin, getCart);
router.get('/add-to-cart/:_id', addToCart)
router.post('/change-product-quantity', changeProductQuantity)
router.get('/delete-cart-item/:cartId/:proId', deleteCartItem)
router.get('/place-order', verifyLogin, placeOrderPage)
router.post('/place-order', placeOrder)
router.get('/order-successfull',verifyLogin, orderSuccessful)
router.get('/view-orders', verifyLogin, viewOrdersPage) 
router.get('/view-order-products/:_id', verifyLogin, viewOrderProducts)
router.get('/cancel-order/:_id', verifyLogin, cancelOrder)
router.get('/profile', verifyLogin, profilePage)
router.post('/edit-profile', verifyLogin, editProfile)
router.post('/add-address', verifyLogin, addAddress)
router.post('/change-password', verifyLogin, changePassword)
router.get('/delete-address/:uniqueid',verifyLogin,deleteAddress)
router.post('/edit-address',editAddress)
router.post('/edit-profile-pic',verifyLogin,editProfilePic)
router.get('/wishlist',verifyLogin,WishlistPage)
router.get('/add-to-wishlist/:_id',addToWishlist)
router.get('/delete-wish-item/:_id',deleteWishItem)
router.post('/verify-payment',verifyPayment)
router.get('/paypal-success',paypalSuccess)
router.post('/coupon-apply',couponApply)
router.get('/view-catwise/:category',viewCatwise)
router.post('/pro-sort',proSort)
router.get('/invoice/:_id',verifyLogin,getInvoice)
router.get('/contact-us',contactUs)
router.post('/save-for-later',saveForLater)
router.post('/move-to-cart',moveToCart)
router.post('/delete-save-for-later',deleteSaveForLater)
router.get('/logout', logout)

module.exports = router;
