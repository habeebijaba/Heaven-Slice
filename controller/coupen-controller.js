const couponHelper=require('../helpers/coupon-helpers')

const couponManagement=async(req,res)=>{
    let allCoupons=await couponHelper.getAllCoupons()
    res.render('admin/coupon-management',{admin:true,adminsession: req.session.admin,couponExist:req.session.couponExist,allCoupons })
    req.session.couponExist=false;
}

const addCoupon=(req,res)=>{
    couponHelper.addCoupon(req.body).then(()=>{
        res.redirect('/admin/coupon-management')
    }).catch(()=>{
        req.session.couponExist="Entered coupon already exists !!!"
        res.redirect('/admin/coupon-management')
    })
    
}

const editCouponPage=async(req,res)=>{
    let couponId=req.params._id
    let couponDetails=await couponHelper.getCouponDetails(couponId)
    res.render('admin/edit-coupon',{admin:true,adminsession:req.session.admin,couponDetails})
}

const editCoupon=(req,res)=>{
    let couponId=req.params._id
    let data=req.body
    couponHelper.editCoupon(data,couponId).then(()=>{
        
        res.redirect('/admin/coupon-management')

    })
}

const deleteCoupon=(req,res)=>{
    let couponId=req.params._id
    couponHelper.deleteCoupon(couponId).then(()=>{
        res.redirect('/admin/coupon-management')

        
    })

}

module.exports={
    couponManagement,
    addCoupon,
    editCouponPage,
    editCoupon,
    deleteCoupon,
}