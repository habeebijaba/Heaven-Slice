const userHelper = require('../helpers/user-helpers')
const adminHelper = require('../helpers/admin-helpers')
const productHelper=require('../helpers/product-helpers')
const orderHelper=require('../helpers/order-helpers')



const dotenv = require('dotenv')
dotenv.config();

const dashboard =async (req, res) => {
    let totalUsers=await userHelper.totalUsers()
    let totalProducts=await productHelper.totalProducts()
    let totalOrders=await orderHelper.totalOrders()
    let totalOrderSuccess=await orderHelper.totalOrderSuccess()
    let totalRevenue=await orderHelper.totalRevenue()
    let dailyRevenue=await orderHelper.dailyRevenue()
    let weeklyRevenue=await orderHelper.weeklyRevenue()
    let yearlyRevenue=await orderHelper.yearlyRevenue()
    let a=0;
    // let getchartData=await orderHelper.getchartData()
    // let weelkyReport=await orderHelper.weelkyReport()
    // let Revenue=await orderHelper.Revenue()
    let weelkyReport=0
    // let date=new Date().getDay()
    // console.log(date);
    res.render('admin/dashboard', { admin: true, adminsession: req.session.admin,totalUsers,totalProducts,totalOrders,totalRevenue,dailyRevenue,weeklyRevenue,yearlyRevenue,weelkyReport,totalOrderSuccess, })
}

const loginPage = (req, res) => {
    res.render('admin/admin-login', { admin: true, adminLoginError: req.session.adminLoginError,validation:true })
    req.session.adminLoginError = false
}

const login = async (req, res) => {
    if (req.body.userName == process.env.ADMIN_USERNAME && req.body.password == process.env.ADMIN_PASSWORD) {
        req.session.admin = process.env.ADMIN_NAME
        res.redirect('/admin')
        
    } else {
        req.session.adminLoginError = "Invalid Username or Password"
        res.redirect('/admin/login')
    }
}

const userManagement = (req, res) => {
    adminHelper.getAllUsers().then((allUsers) => {
        res.render('admin/user-management', { admin: true, allUsers, adminsession: req.session.admin })
    })
}

const blockUser = (req, res) => {
    let id = req.params._id
    adminHelper.blockUser(id).then(() => {
        res.redirect('/admin/user-management')
    })
}

const unblockUser = (req, res) => {
    let id = req.params._id
    adminHelper.unBlockUser(id).then(() => {
        res.redirect('/admin/user-management')
    })
}

const logout=(req,res)=>{
    req.session.admin=null
    res.redirect('/admin/login')
}







module.exports = {
    dashboard,
    loginPage,
    login,
    userManagement,
    blockUser,
    unblockUser,
    logout

}