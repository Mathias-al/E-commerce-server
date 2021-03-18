"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var express = require('express');

var router = new express.Router();

var auth = require('../middleware/auth');

var Product = require('../models/product'); //create new product


router.post('/admin/create-product', function _callee(req, res) {
  var product, random1, random2, productId;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          product = new Product(req.body);
          _context.prev = 1;
          random1 = Math.floor(Math.random() * 10);
          random2 = Math.floor(Math.random() * 10);
          productId = "".concat(random1).concat(Date.now()).concat(random2);
          product.productId = productId;
          _context.next = 8;
          return regeneratorRuntime.awrap(product.save());

        case 8:
          res.status(201).send({
            msg: 'success'
          });
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](1);
          res.send(400).send({
            msg: _context.t0.message
          });

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 11]]);
}); //delete product

router["delete"]('/product/delete', auth, function _callee2(req, res) {
  var productId, product;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          productId = req.body.productId;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Product.findOne({
            productId: productId
          }));

        case 4:
          product = _context2.sent;
          _context2.next = 7;
          return regeneratorRuntime.awrap(product.remove());

        case 7:
          res.status(200).send({
            msg: 'Delete successfully!'
          });
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](1);
          res.status(400).send({
            msg: _context2.t0.message
          });

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); //delete multiple product

router["delete"]('/product/deleteMany', auth, function _callee3(req, res) {
  var deleteProducts, batch;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          deleteProducts = req.body.deleteProducts;
          _context3.prev = 1;
          batch = deleteProducts.split(",");
          _context3.next = 5;
          return regeneratorRuntime.awrap(Product.deleteMany({
            productId: {
              $in: _toConsumableArray(batch)
            }
          }));

        case 5:
          res.status(200).send({
            msg: "Delete successfully!"
          });
          _context3.next = 11;
          break;

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](1);
          res.status(400).send({
            msg: _context3.t0.message
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 8]]);
}); //modify product

router.patch('/product/modify', auth, function _callee4(req, res) {
  var productUpdate, productId, product, updates;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          productUpdate = req.body.productUpdate;
          productId = productUpdate.productId;
          _context4.prev = 2;
          _context4.next = 5;
          return regeneratorRuntime.awrap(Product.findOne({
            productId: productId
          }));

        case 5:
          product = _context4.sent;
          //Extract each property in productUpdate(Object) and convert it to the array.
          updates = Object.keys(productUpdate);
          updates.forEach(function (update) {
            return product[update] = productUpdate[update];
          });
          _context4.next = 10;
          return regeneratorRuntime.awrap(product.save());

        case 10:
          res.status(200).send({
            msg: "Modify successfully!"
          });
          _context4.next = 16;
          break;

        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](2);
          res.status(400).send({
            msg: _context4.t0.message
          });

        case 16:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 13]]);
}); //get productList by category

router.post('/product/category/list', function _callee5(req, res) {
  var category, productList;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          category = req.body.category;
          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap(Product.find({
            category: category
          }));

        case 4:
          productList = _context5.sent;
          console.log(productList);
          res.status(200).send({
            msg: "success",
            productList: productList
          });
          _context5.next = 12;
          break;

        case 9:
          _context5.prev = 9;
          _context5.t0 = _context5["catch"](1);
          res.status(400).send({
            msg: _context5.t0.message
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 9]]);
}); //get a product by productId

router.post('/product/detail', function _callee6(req, res) {
  var productId, product;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          productId = req.body.productId;
          _context6.prev = 1;
          _context6.next = 4;
          return regeneratorRuntime.awrap(Product.findOne({
            productId: productId
          }));

        case 4:
          product = _context6.sent;

          if (product) {
            _context6.next = 7;
            break;
          }

          throw new Error("Product does not exist!");

        case 7:
          res.status(200).send({
            msg: 'Success!',
            productDetail: product
          });
          _context6.next = 13;
          break;

        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](1);
          res.status(400).send({
            msg: _context6.t0.message
          });

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); //get best seller from all category

router.get('/product/feature/best_seller', function _callee7(req, res) {
  var best_seller;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(Product.find({
            sales: {
              $gte: 200
            }
          }).limit(2));

        case 3:
          best_seller = _context7.sent;

          if (best_seller) {
            _context7.next = 6;
            break;
          }

          throw new Error("Can not find anything!");

        case 6:
          res.status(200).send({
            msg: 'success!',
            best_seller: best_seller
          });
          _context7.next = 12;
          break;

        case 9:
          _context7.prev = 9;
          _context7.t0 = _context7["catch"](0);
          res.status(400).send({
            msg: _context7.t0.message
          });

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); //get subCategory products

router.post('/product/subCategory', function _callee8(req, res) {
  var sub, products;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          sub = req.body.sub;
          _context8.prev = 1;
          _context8.next = 4;
          return regeneratorRuntime.awrap(Product.find({
            sub_category: sub
          }));

        case 4:
          products = _context8.sent;
          res.status(200).send({
            msg: 'success',
            products: products
          });
          _context8.next = 11;
          break;

        case 8:
          _context8.prev = 8;
          _context8.t0 = _context8["catch"](1);
          res.status(400).send({
            msg: _context8.t0.message
          });

        case 11:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[1, 8]]);
}); //get the newest products

router.get('/product/newest', function _callee9(req, res) {
  var now, reduceSevenDay, sevenAgo, products;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          now = new Date().toISOString();
          reduceSevenDay = new Date().setDate(new Date().getDate() - 2);
          sevenAgo = new Date(reduceSevenDay).toISOString();
          _context9.next = 6;
          return regeneratorRuntime.awrap(Product.find({
            createdAt: {
              $lt: now,
              $gt: sevenAgo
            }
          }).limit(6));

        case 6:
          products = _context9.sent;
          res.status(200).send({
            msg: 'success',
            products: products
          });
          _context9.next = 13;
          break;

        case 10:
          _context9.prev = 10;
          _context9.t0 = _context9["catch"](0);
          res.status(400).send({
            msg: _context9.t0.message
          });

        case 13:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
module.exports = router;