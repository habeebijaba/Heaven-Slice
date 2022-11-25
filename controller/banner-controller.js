const categoryHelper=require('../helpers/category-helpers')
const bannerHelper=require('../helpers/banner-helpers')
const { Db } = require('mongodb')




const bannerManagement=async(req,res)=>{
    let allBanners=await bannerHelper.getAllBanner()
res.render('admin/banner-management',{allBanners,admin:true,adminsession: req.session.admin })
}
const addBannerPage=async(req,res)=>{
    let allCategories=await categoryHelper.getAllCategories()
    res.render('admin/add-banner',{allCategories,admin:true,adminsession:req.session.admin,validation:true})
}

const addBanner=(req,res)=>{
    let image=req.files.image
    bannerHelper.addBanner(req.body).then((response)=>{
        let id=response.insertedId
        image.mv('./public/banner-images/' + id + '.jpg')
        res.redirect('/admin/banner-management')
    })
}

const editBannerPage=async(req,res)=>{
    let banId=req.params._id
    let bannerDetails=await bannerHelper.getBanner(banId)
    let allCategories=await categoryHelper.getAllCategories()
    res.render('admin/edit-banner',{bannerDetails,allCategories,admin:true,adminsession:req.session.admin,validation:true})
}

const editBanner=(req,res)=>{
    let banId=req.body.id
    bannerHelper.editBanner(req.body).then(()=>{
        try{
        if (req.files.image) {
            let image = req.files.image
            image.mv('./public/banner-images/' + banId + '.jpg')
            res.redirect('/admin/banner-management')
        }
    }catch{
        res.redirect('/admin/banner-management')

    }
     })
    
}

const deleteBanner=(req,res)=>{
    let banId=req.params._id
    bannerHelper.deleteBanner(banId).then(()=>{
        res.redirect('/admin/banner-management')
        // try{
        //     fs.unlinkSync('public/banner-images/' + id + '.jpg')

        // }catch{
        // res.redirect('/admin/banner-management')
            

        // }
    })
}


module.exports={
    bannerManagement,
    addBannerPage,
    addBanner,
    editBannerPage,
    editBanner,
    deleteBanner,
}