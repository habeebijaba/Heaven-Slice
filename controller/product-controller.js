const { response } = require("express");
const categoryHelper = require("../helpers/category-helpers");
const productHelper = require("../helpers/product-helpers");
const fs = require("fs");

const productManagement = (req, res) => {
  productHelper.getAllProductsAdmin().then((allProducts) => {
    res.render("admin/product-management", {
      admin: true,
      allProducts,
      adminsession: req.session.admin,
    });
  });
};

const addProductPage = (req, res) => {
  categoryHelper.getAllCategories().then((allCategories) => {
    res.render("admin/add-product", {
      admin: true,
      allCategories,
      productRedundancyError: req.session.productRedundancyError,
      adminsession: req.session.admin,
      validation: true,
    });
    req.session.productRedundancyError = false;
  });
};

const addProduct = (req, res) => {
  let image1 = req.files.image1;
  
  productHelper
    .addProduct(req.body)
    .then((response) => {
      let id = response.insertedId;
      let image1 = req.files.image1;
      let image2 = req.files.image2;
      let image3 = req.files.image3;
      let image4 = req.files.image4;
      image1.mv("./public/product-images/" + id + "1.jpg");
      image2.mv("./public/product-images/" + id + "2.jpg");
      image3.mv("./public/product-images/" + id + "3.jpg");
      image4.mv("./public/product-images/" + id + "4.jpg");
      res.redirect("/admin/product-management");
    })
    .catch(() => {
      req.session.productRedundancyError = "Entered Product Already Exists !!!";
      res.redirect("/admin/add-product");
    });
};


const deactivateProduct = (req, res) => {
  let id = req.params._id;
  productHelper.deactivateProduct(id).then(() => {
    res.redirect("/admin/product-management");
  });
};

const activateProduct = (req, res) => {
  let id = req.params._id;
  productHelper.activateProduct(id).then(() => {
    res.redirect("/admin/product-management");
  });
};

const editProductPage = (req, res) => {
  let id = req.params._id;
  productHelper.getProductDetails(id).then((productDetails) => {
    categoryHelper.getAllCategories().then((allCategories) => {
      res.render("admin/edit-product", {
        admin: true,
        productDetails,
        allCategories,
        adminsession: req.session.admin,
        validation: true,
      });
    });
  });
};

const editProduct = (req, res) => {
  let id = req.body.id;
  productHelper.editProduct(req.body).then(() => {
    try {
      if (req.files.image1) {
        let image1 = req.files.image1;
        image1.mv("./public/product-images/" + id + "1.jpg");
      }
      if (req.files.image2) {
        let image2 = req.files.image2;
        image2.mv("./public/product-images/" + id + "2.jpg");
      }
      if (req.files.image3) {
        let image3 = req.files.image3;
        image3.mv("./public/product-images/" + id + "3.jpg");
      }
      if (req.files.image4) {
        let image4 = req.files.image4;
        image4.mv("./public/product-images/" + id + "4.jpg");
      }
      res.redirect("/admin/product-management");
    } catch {
      res.redirect("/admin/product-management");
    }
  });
};

module.exports = {
  productManagement,
  addProductPage,
  addProduct,
  deactivateProduct,
  activateProduct,
  editProductPage,
  editProduct,
};
