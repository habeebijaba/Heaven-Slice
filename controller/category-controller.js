const categoryHelper = require('../helpers/category-helpers')
const categoryManagement = (req, res) => {
    categoryHelper.getAllCategories().then((AllCategories) => {
        res.render('admin/category-management', { admin: true, AllCategories, adminsession: req.session.admin })
    })
}

const addCategoryPage = (req, res) => {
    res.render('admin/add-category', { admin: true, categoryRedundancyError: req.session.categoryRedundancyError, adminsession: req.session.admin,validation:true })
    req.session.categoryRedundancyError = false
}

const addCategory = (req, res) => {
    categoryHelper.addCategory(req.body).then((response) => {
    let image=req.files.image
    let id = response.insertedId;
    image.mv("./public/category-images/" + id + ".jpg");



        res.redirect('/admin/category-management')
    }).catch(() => {
        req.session.categoryRedundancyError = "Entered Category Already Exists !!!"
        res.redirect('/admin/add-category')
    })
}

const editCategoryPage=async(req,res)=>{
    let id=req.params._id
    let categoryDetails=await categoryHelper.getCategory(id)
    res.render('admin/edit-category',{admin:true,adminsession:req.session.admin,categoryDetails,categoryRedundancyError:req.session.categoryRedundancyError})
    req.session.categoryRedundancyError=false
}

const editCategory=(req,res)=>{
    // let idd=req.body.id

  categoryHelper.editCategory(req.body).then(()=>{
    try{
    let id=req.body.id
    let image=req.files.image
    image.mv("./public/category-images/" + id + ".jpg")
    res.redirect('/admin/category-management')
    
    }catch{
        res.redirect('/admin/category-management')

    }
  })
//   .catch(()=>{
//     req.session.categoryRedundancyError="Entered category already exists"
// res.redirect(`/admin/edit-category/${idd}`)

//   })
}

const deleteCategory = (req, res) => {
    let id = req.params._id
    categoryHelper.deleteCategory(id).then(() => {
        res.redirect('/admin/category-management')
    })
}



module.exports = {
    categoryManagement,
    addCategoryPage,
    addCategory,
    deleteCategory,
    editCategoryPage,
    editCategory

}