const productHelper = require("../helpers/product-helpers")
const offerHelper=require('../helpers/offer-helpers')
const categoryHelper=require('../helpers/category-helpers')
const { Db } = require("mongodb")


const prodOfferPage=async(req,res)=>{
     let allProducts=await productHelper.getAllProducts()
     let prodOffers=await offerHelper.getAllProdOffers()
    res.render('admin/pro-offer',{admin:true,adminsession:req.session.admin,allProducts,prodOffers,proOfferExist:req.session.proOfferExist})
    req.session.proOfferExist=false
}

const addProdOffer=(req,res)=>{
    offerHelper.addProdOffer(req.body).then(()=>{
        res.redirect('/admin/add-prodOffer')
    }).catch(()=>{
        req.session.proOfferExist="Offer already exist for entered product"
        res.redirect('/admin/add-prodOffer')
    })
}

const editProdOfferPage=async(req,res)=>{
    let proOfferId=req.params._id
   let proOfferDetails=await offerHelper.getProdOfferDetails(proOfferId)
   res.render('admin/edit-prodOffer',{admin:true,adminsession:req.session.admin,proOfferDetails})

}

const editProdOffer=(req,res)=>{
    let proOfferId=req.params._id
    offerHelper.editProdOffer(proOfferId,req.body).then(()=>{
        res.redirect('/admin/add-prodOffer')
    })
}

const deleteProdOffer=(req,res)=>{
    let proOfferId=req.params._id
    offerHelper.deleteProdOffer(proOfferId).then(()=>{
        res.redirect('/admin/add-prodOffer')
    })
}

const catOfferPage=async(req,res)=>{
    let allCategories=await categoryHelper.getAllCategories()
    let CatOffers=await offerHelper.getAllCatOffers()
    let catOfferExist=req.session.catOfferExist
    res.render('admin/cat-offer',{admin:true,adminsession:req.session.admin,allCategories,CatOffers,catOfferExist})
    req.session.catOfferExist=false
}

const addCatOffer=(req,res)=>{
    offerHelper.addCatOffer(req.body).then(()=>{
        res.redirect('/admin/add-catOffer')
    }).catch(()=>{
        req.session.catOfferExist="Offer Already Exist For Entered Category"
        res.redirect('/admin/add-catOffer')
    })
}

const editCatOfferPage=async(req,res)=>{
    let catOfferId=req.params._id
    let catOfferDetails=await offerHelper.getCatOfferDetails(catOfferId)
    res.render('admin/edit-catOffer',{admin:true,adminsession:req.session.admin,catOfferDetails})
}

const editCatOffer=(req,res)=>{
    let catOfferId=req.params._id
    offerHelper.editCatOffer(catOfferId,req.body).then(()=>{
        res.redirect('/admin/add-catOffer')
    })
}

const deleteCatOffer=(req,res)=>{
    let catOfferId=req.params._id
    offerHelper.deleteCatOffer(catOfferId).then(()=>{
        res.redirect('/admin/add-catOffer')

    })
}

module.exports={ 
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
}