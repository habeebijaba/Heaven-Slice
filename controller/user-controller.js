const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");
const categoryHelper = require("../helpers/category-helpers");
const cartHelper = require("../helpers/cart-helpers");
const orderHelper = require("../helpers/order-helpers");
const wishlistHelper = require("../helpers/whishlist-helpers");
const authOtp = require("../authentication/otp-verify");
const bannerHelpers = require("../helpers/banner-helpers");
const offerHelper=require("../helpers/offer-helpers")
const couponHelper=require("../helpers/coupon-helpers")
//const { response } = require("../app");
var paypal = require("paypal-rest-sdk");
const { default: Swal } = require("sweetalert2");
const { Db } = require("mongodb");
const moment=require('moment')

const home = async (req, res) => {
  let allBanners = await bannerHelpers.getAllBanner();
  let user = req.session.user;
  let cartCount = 0;
  let wishlistCount = 0;
  let allProducts= await productHelper.getAllProducts()
  let allCategories=await categoryHelper.getAllCategories()
  let todayDate = new Date().toISOString().slice(0, 10);
  let startProOffer = await offerHelper.startProductOffer(todayDate);
  let startCatOffer=await offerHelper.startCategoryOffer(todayDate)
  let startCouponOffer=await couponHelper.startCouponOffer(todayDate)

  if (user) {
    cartCount = await cartHelper.getCartCount(user._id);
    wishlistCount = await wishlistHelper.getWishlistCount(user._id);
  // let getWishProducts=await productHelper.getWishProducts(user._id)
  }
  res.render("user/index", { user, cartCount, allBanners, wishlistCount,allProducts,allCategories });
};

const signUpPage = (req, res) => {
  res.render("user/signup", {
    redundancyError: req.session.redundancyError,
    validation:true
  });
  req.session.redundancyError = false;
};

const signUp = (req, res) => {
  userHelper
    .userSignUp(req.body)
    .then(() => {
      res.redirect("/login");
    })
    .catch(() => {
      req.session.redundancyError = "Email or Phone Already Exists !!!";
      res.redirect("/signup");
    });
};

const loginPage = (req, res) => {
  let blockError = req.session.blockError;
  let passwordError = req.session.passwordError;
  let userNameError = req.session.userNameError;
  let otpError = req.session.otpError;
  let verifyError = req.session.verifyError;
  let phoneDoesnotExistError = req.session.phoneDoesnotExistError;
  let serverError = req.session.serverError;
  res.render("user/login", {
    blockError,
    passwordError,
    userNameError,
    otpError,
    verifyError,
    phoneDoesnotExistError,
    serverError,
    validation:true
  });
  req.session.blockError = false;
  req.session.passwordError = false;
  req.session.userNameError = false;
  req.session.otpError = false;
  req.session.verifyError = false;
  req.session.phoneDoesnotExistError = false;
  req.session.serverError = false;
};

const login = (req, res) => {
  userHelper
    .userLogin(req.body)
    .then(async(response) => {
      req.session.user = response;
      if (req.session.redirectUrl) {
        res.redirect(req.session.redirectUrl);
      } else {
        res.redirect("/");
      }
    })
    .catch((response) => {
      if (response.blockError) {
        req.session.blockError = "you are temporary blocked by admin !!!";
        res.redirect("/login");
      } else if (response.passwordError) {
        req.session.passwordError = "Entered Password is wrong !!!";
        res.redirect("/login");
      } else {
        req.session.userNameError = "No user Exist with entered email !!!";
        res.redirect("/login");
      }
      // req.session.loginError = "Invalid Username or Password !!!"
      // res.redirect('/login')
    });
};

const otpLogin=(req,res)=>{
  let serverError = req.session.serverError;
  let otpError = req.session.otpError;
  let verifyError = req.session.verifyError;
  let phoneDoesnotExistError = req.session.phoneDoesnotExistError;
  res.render('user/otp-login',{serverError,otpError,verifyError,phoneDoesnotExistError})
  req.session.serverError = false;
  req.session.otpError = false;
  req.session.verifyError = false;
  req.session.phoneDoesnotExistError = false;
}

const enterOtpPage = async (req, res) => {
  let phone = req.body.phone;
  let user = await userHelper.findUserWithPhone(phone);
  if (user) {
    authOtp
      .getOtp(phone)
      .then(() => {
        res.render("user/enter-otp", { phone });
      })
      .catch(() => {
        req.session.serverError = "server busy try again later !!!";
        res.redirect("/otp-login");
      });
  } else {
    req.session.phoneDoesnotExistError =
      "No user with entered phone number !!!";
    res.redirect("/otp-login");
  }
};

const verifyOtp = async (req, res) => {
  let phone = req.body.phone;
  let otp = req.body.otp;
  let user = await userHelper.findUserWithPhone(phone);
  authOtp
    .verifyOtp(phone, otp)
    .then((response) => {
      console.log(response.status);
      if (response.status) {
        req.session.user = user;
        res.redirect("/");
      } else {
        req.session.otpError = "Entered otp does not match Try again !!!";
        res.redirect("/otp-login");
      }
    })
    .catch(() => {
      req.session.verifyError = "Server busy try again !!!";
      res.redirect("/otp-login");
    });
};

const viewProducts = async (req, res) => {
  let user = req.session.user;
  let cartCount = 0;
  let wishlistCount = 0;
  if (user) {
    cartCount = await cartHelper.getCartCount(user._id);
    wishlistCount = await wishlistHelper.getWishlistCount(user._id);
  }
  productHelper.getAllProducts().then((allProducts) => {
    categoryHelper.getAllCategories().then((allCategories) => {
      res.render("user/view-products", {
        allProducts,
        allCategories,
        user,
        cartCount,
        wishlistCount,
      });
    });
  });
};

const productDetails = async (req, res) => {
  let user = req.session.user;
  let id = req.params._id;
  let cartCount = await cartHelper.getCartCount(user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(user._id);

  productHelper.getProductDetails(id).then(async(productDetails) => {
    // console.log(productDetails.category);
    let similarProducts=await productHelper.getSimilarProducts(id,productDetails.category)
    res.render("user/product-details", {
      productDetails,
      user,
      cartCount,
      wishlistCount,
      similarProducts,
      zoom:true
    });
  }).catch(()=>{
    console.log("errrorr");
    res.render('error')
  })
};

const getCart = async (req, res) => {
  let userId = req.session.user._id;
  let products = await cartHelper.getCartProducts(userId);
  let totalValue = await cartHelper.getTotalAmount(userId);
  let cartCount = await cartHelper.getCartCount(userId);
  let wishlistCount = await wishlistHelper.getWishlistCount(userId);
  let saveForLater=await cartHelper.getSaveForLaterProducts(userId)
  console.log(saveForLater,"checj total");

  // if (cartCount != 0) {
    res.render("user/cart", {
      products,
      user: req.session.user,
      totalValue,
      cartCount,
      wishlistCount,
      saveForLater
    });
  // } else {
  //   // res.render("user/empty-cart", { noheader: true, nofooter: true,user:req.session.user,cartCount,wishlistCount });
  // }
};

const addToCart =async (req, res) => {
  if(req.session.user){
  console.log("api call");
  let proId = req.params._id;
  let userId = req.session.user._id;
  let count=await cartHelper.findProCount(userId,proId)
  if(count<=2){
  cartHelper.addToCart(proId, userId).then(() => {
    res.json({ status: true });
  });
}else{
  res.json({count:true})

}
}else{
  res.json({status:false})
}
};

const changeProductQuantity = async(req, res) => {
  console.log(req.body);
  cartHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await cartHelper.getTotalAmount(req.session.user._id);
    console.log(response.total,"this iis total");

    res.json(response);
  });
};

const deleteCartItem = (req, res) => {
  let cartId = req.params.cartId;
  let proId = req.params.proId;
  cartHelper.deleteCartItem(cartId, proId).then(() => {
    res.redirect("/cart");
  });
};

const placeOrderPage = async (req, res) => {
  let total = await cartHelper.getTotalAmount(req.session.user._id);
  let userId = req.session.user._id;
  let userAddress = await userHelper.getAddress(userId);
  let wishlistCount = await wishlistHelper.getWishlistCount(userId);
  let cartCount=await cartHelper.getCartCount(userId)
  let walletAmount=await userHelper.getWalletAmount(userId)
  let wallet=false
  if(walletAmount>=total){
    wallet=true
  }

  res.render("user/place-order", {
    total,
    user: req.session.user, 
    userAddress,
    wishlistCount,
    validation:true,
    cartCount,
    wallet
  });
};

const placeOrder = async (req, res) => {
  let products = await cartHelper.getCartProductList(req.body.userId);
  let totalPrice = await cartHelper.getTotalAmount(req.body.userId);
  let discountedTotal=req.session.couponTotal
  let couponCode=req.session.couponCode
  let discountValue=req.session.discountValue
  if(discountedTotal){
    totalPrice=discountedTotal
  }
  orderHelper.placeOrder(req.body, products, totalPrice,couponCode,discountValue).then((orderId) => {
    req.session.couponTotal=null
    if (req.body["payment-method"] === "COD") {
      res.json({ codSuccess: true });
    }else if(req.body["payment-method"] === "wallet"){
      userHelper.updateWallet(req.session.user._id,totalPrice).then(()=>{
        res.json({wallet:true})

      })
    } else if (req.body["payment-method"] === "razorpay") {
      orderHelper.generateRazorpay(orderId, totalPrice).then((response) => {
        req.session.couponTotal=null
        res.json({ response, razorpay: true });
      });
    } else {
     
      //paypal code
      orderHelper.generatePaypal(orderId, totalPrice).then((link) => {
        req.session.couponTotal=null
        res.json({ link, paypal: true });
      });
    }
  });
};

const verifyPayment = (req, res) => {
  console.log(req.body);
  orderHelper.verifyPayment(req.body).then(() => {
    orderHelper
      .changePaymentStatus(req.body["order[receipt]"])
      .then(() => {
        console.log("payment success");
        res.json({ status: true });
      })
      .catch((error) => {
        console.log(error);
        res.json({ status: false });
      });
  });
};

const orderSuccessful = async (req, res) => {
  let user = req.session.user;
  let cartCount = await cartHelper.getCartCount(user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(user._id);
  res.render("user/order-placed", {
    user,
    cartCount,
    noheader: true,
    nofooter: true,
    wishlistCount
  });
};

const viewOrdersPage = async (req, res) => {
  let userId = req.session.user._id;
  let cartCount = await cartHelper.getCartCount(userId);
  let wishlistCount = await wishlistHelper.getWishlistCount(userId);

  let orders = await orderHelper.getOrders(userId);
  // // console.log(orders[0].status);
  // if((orders[0].status)="cancelled"){
  //     console.log('haiiiiiiii');
  // }
  res.render("user/orders", {
    user: req.session.user,
    orders,
    cartCount,
    wishlistCount,
  });
};

const viewOrderProducts = async (req, res) => {
  let orderId = req.params._id;
  // console.log(orderId);
  let orderProducts = await orderHelper.getOrderProducts(orderId);
  let wishlistCount = await wishlistHelper.getWishlistCount(req.session.user._id);
  let cartCount = await cartHelper.getCartCount(req.session.user._id);
  let orderDetails=await orderHelper.getOrderDetails(orderId)
  orderDetails.date=moment(orderDetails.date).format('lll');
  orderDetails.shippedDate=moment(orderDetails.shippedDate).format('lll');
  orderDetails.outForDeliveryDate=moment(orderDetails.outForDeliveryDate).format('lll');
  orderDetails.deliveredDate=moment(orderDetails.deliveredDate).format('lll');
  orderDetails.cancellDate=moment(orderDetails.cancellDate).format('lll');
  // console.log(orderProducts);
  res.render("user/view-order-products", {
    user: req.session.user,
    orderProducts,
    wishlistCount,
    cartCount,
    orderDetails
  });
};

const cancelOrder = (req, res) => {
  let orderId = req.params._id;
  orderHelper.cancelOrder(orderId).then(() => {
    res.redirect("/view-orders");
  });
};

const profilePage = async (req, res) => {
  let userId = req.session.user._id;
  let cartCount = await cartHelper.getCartCount(userId);
  let wishlistCount = await wishlistHelper.getWishlistCount(userId);
  let walletAmount=await userHelper.getWalletAmount(userId)
  let userAddress = await userHelper.getAddress(userId);
  userHelper.getUserDetails(userId).then((user) => {
    // console.log(userAddress);
    res.render("user/profile", { user, userAddress, cartCount, wishlistCount,walletAmount });
  });
};

const editProfile = (req, res) => {
  console.log(req.body);
  userHelper.editProfile(req.body).then(() => {
    res.redirect("/profile");
  });
};

const editProfilePic=(req,res)=>{
let image=req.files.image
let id=req.session.user._id
image.mv("./public/profile-images/" + id + ".jpg");
res.redirect('/profile');
}

const addAddress = (req, res) => {
  let address = req.body;
  let userId = req.session.user._id;
  userHelper.addAddress(address, userId).then(() => {
    res.redirect("/profile");
  });
};

const changePassword = (req, res) => {
  console.log(req.body);
  let userId = req.session.user._id;
  userHelper
    .changePassword(req.body, userId)
    .then(() => {
      res.json({ status: true });
    })
    .catch(() => {
      res.json({ status: false });
    });
};

const deleteAddress = (req, res) => {
  let userId = req.session.user._id;
  let uniqueid = req.params.uniqueid;
  userHelper.deleteAddress(userId, uniqueid).then(() => {
    res.redirect("/profile");
  });
};

const editAddress=(req,res)=>{
 console.log(req.body);
 let userId=req.session.user._id
  userHelper.editAddress(req.body,userId).then((response)=>{
    res.json({status:true})
  })
}

const WishlistPage = async (req, res) => {
  let user = req.session.user;
  let products = await wishlistHelper.getWishProducts(user._id);
  let wishlistCount = await wishlistHelper.getWishlistCount(user._id);
  let cartCount = await cartHelper.getCartCount(user._id);

  let totalValue = await wishlistHelper.getTotalAmount(user._id);

  if (products.length != 0) {
    res.render("user/wishlist", {
      user,
      products,
      wishlistCount,
      totalValue,
      cartCount,
    });
  } else {
    res.render("user/empty-wishlist", { user, noheader: true, nofooter: true,cartCount,wishlistCount });
  }
};

const addToWishlist = (req, res) => {
  console.log("api call");
  let proId = req.params._id;
  let userId = req.session.user._id;
  wishlistHelper
    .addToWishlist(userId, proId)
    .then(() => {
      res.json({ status: true });
    })
    .catch(() => { 
      res.json({ status: false });
    });
};

const deleteWishItem = (req, res) => {
  console.log("api call");
  let proId = req.params._id;
  let userId = req.session.user._id;
  wishlistHelper.deleteWishItem(userId, proId).then(() => {
    res.json({ status: true });
  });
};

//paypal codes
const paypalSuccess = (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "100000.00",
        },
      },
    ],
  };

  // var paymentId = 'PAYMENT id created in previous step';

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else { 
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        // Swal.fire("payment successfull")
        res.redirect("/order-successfull");
      }
    }
  );     
};

//paypal code here ends

const couponApply=async(req,res)=>{
  let couponCode=req.body.coupon
  let userId=req.session.user._id
  req.session.couponCode=couponCode
  let totalPrice = await cartHelper.getTotalAmount(userId);
  
  couponHelper.validateCoupon(couponCode,userId,totalPrice).then((response)=>{
    req.session.couponTotal = response.total
    req.session.discountValue=response.discountValue
  
    if(response.success){   
      res.json({couponSuccess:true,total:response.total,discountValue:response.discountValue})
    }else if(response.couponUsed){
      res.json({couponUsed:true})
    }else if(response.couponExpired){
      res.json({couponExpired:true})
    }else if(response.invalidCoupon){
      res.json({invalidCoupon:true})
    }else{
      res.json({notEligible:true})
    }
  })

}

const viewCatwise=async(req,res)=>{
let category=req.params.category
let allCategories=await categoryHelper.getAllCategories()
let catWiseProducts=await productHelper.getCatWiseProduct(category)
try{
let userId=req.session.user._id
let wishlistCount = await wishlistHelper.getWishlistCount(userId);
let cartCount = await cartHelper.getCartCount(userId);
res.render('user/catWise-products',{user:req.session.user,catWiseProducts,allCategories,wishlistCount,cartCount})
}catch{
res.render('user/catWise-products',{catWiseProducts,allCategories})
  
}
}

const proSort=async(req,res)=>{
  let category=req.body.category
  console.log(category);
   let catWisePro=await productHelper.getCatWiseProduct(category)
    res.json(catWisePro)


}

const getInvoice=async(req,res)=>{
  let orderId=req.params._id
  let userId=req.session.user._id 
  let invoice = await orderHelper.getOrderDetails(orderId)
  invoice.date=moment(invoice.date).format('lll');
  let products = await orderHelper.getOrderProducts(orderId);
  let wishlistCount = await wishlistHelper.getWishlistCount(userId);
  let cartCount = await cartHelper.getCartCount(userId);
  res.render('user/invoice',{user:req.session.user,invoice,products,cartCount,wishlistCount})
}
 
const contactUs=async(req,res)=>{
  let user=req.session.user
  let cartCount=0
  let wishlistCount=0
  if(user){
     cartCount=await cartHelper.getCartCount(user._id)
     wishlistCount=await wishlistHelper.getWishlistCount(user._id)
  }
  res.render('user/contact-us',{user,cartCount,wishlistCount})
}

// const addToSave=(req,res)=>{
//   let userId=req.session.user._id
//   console.log(userId,"at checcckk");
//   if(userId){
//     console.log("entered iffff");
//   let proId=req.params.proId
//   console.log('reached here');
//   // console.log(req.params.proid);
//   cartHelper.addToSave(userId,proId).then(()=>{
//     res.json({status:true})
//   }).catch(()=>{
//     res.json({status:false})
//   })
//   }else{
//     res.json({nouser:true})
//   }
// }

const saveForLater=(req,res)=>{
  let userId=req.session.user._id
  let cartId=req.body.cartId
  let proId=req.body.proId
  let quantity=req.body.quantity
  console.log(req.body);
  cartHelper.saveForLater(userId,proId,quantity).then(()=>{
    res.json({status:true})
  })
}

const moveToCart=(req,res)=>{
  let userId=req.session.user._id
  let proId=req.body.proId
  let quantity=req.body.quantity
  console.log(req.body)
  cartHelper.moveToCart(userId,proId,quantity).then(()=>{
    res.json({status:true })
  })

}

const deleteSaveForLater=(req,res)=>{
  let cartId=req.body.cartId
  let proId=req.body.proId
  let userId=req.session.user._id
  console.log(req.body,"reached hereeee");
  cartHelper.deleteSaveForLater(userId,proId).then(()=>{
    res.json({status:true})
  })
}

const logout = (req, res) => {
  req.session.user = null;
  res.redirect("/");
};

module.exports = {
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
  placeOrder,
  paypalSuccess,
  couponApply,
  viewCatwise,
  proSort,
  getInvoice,
  contactUs,
  saveForLater,
  moveToCart,
  deleteSaveForLater,


  logout,
};
