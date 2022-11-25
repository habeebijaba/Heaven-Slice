const orderHelper = require('../helpers/order-helpers')
const adminHelper=require('../helpers/admin-helpers')

const orderManagement = async (req, res) => {
    let orders = await orderHelper.getAllOrders()
    res.render('admin/order-management', { admin: true, orders, adminsession: req.session.admin })

}

const cancelOrder = (req, res) => {
    let orderId = req.params._id
    orderHelper.cancelOrder(orderId).then(() => {
        res.redirect('/admin/order-management')
    })
}

const orderStatusChange = (req, res) => {
    let status = req.body.status
    let orderId = req.body.orderId
    orderHelper.orderStatusChange(status, orderId).then(() => {
        res.redirect('/admin/order-management')
    })
}

    const viewOrderProducts = async (req, res) => {
        let orderId = req.params._id;
        let orderProducts = await orderHelper.getOrderProducts(orderId);
        res.render("admin/view-order-products", {
          adminsession: req.session.admin,
          orderProducts,
          admin:true,
        });
}

const getchartData=(req,res)=>{
    orderHelper.getchartData().then((obj)=>{
        let result=obj.result
        let weeklyReport=obj.weeklyReport

            res.json({ data: result,weeklyReport })

    })
}

const salesReportPage=async(req,res)=>{
    let salesReport = await orderHelper.getAllOrders()
    res.render('admin/sales-report',{admin: true,salesReport, adminsession: req.session.admin})
}

const salesManagement=async(req,res)=>{
    let data=await adminHelper.monthlyReport()
    let daily=await adminHelper.dailyReport()
    let weekly=await adminHelper.weeklyReport()
    let yearly=await adminHelper.yearlyReport()
    res.render('admin/sales-management',{admin:true,adminsession:req.session.admin,data,daily,weekly,yearly})
}

const customReport=async(req,res)=>{
    let start=req.body.starting
    let end=req.body.ending
    let data=await adminHelper.getReport(start,end)
    let daily=await adminHelper.dailyReport()
    let weekly=await adminHelper.weeklyReport()
    let yearly=await adminHelper.yearlyReport()
    res.render('admin/sales-management',{admin:true,adminsession:req.session.admin,data,daily,weekly,yearly})
}


module.exports = {
    orderManagement,
    cancelOrder,
    orderStatusChange,
    viewOrderProducts,
    getchartData,
    salesReportPage,
    salesManagement,
    customReport,
    
    
    
}