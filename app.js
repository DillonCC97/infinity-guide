var port = 3000;
var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/nearby");
var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({
    extended: true
}));
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");
var dbSchema = new mongoose.Schema({
    name: String,
    description: String,
    address: String,
    hours: String,
    phone: String,
    image: String,
    tips: Array,
    rating: Array
});
var Business = mongoose.model("Business", dbSchema);
app.get("/", function(req, res) {
    console.log("index page requested");
    res.render("home.ejs");
});
app.post("/nearby", function(req, res) {
    console.log(req.body);
    console.log("search requested");
    if(req.body.searchType == "name") {
        Business.find({
            name: { $regex: req.body.searchString, $options: 'i' }
        }, function(err, data) {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                res.render("nearby.ejs", {
                    businesses: data
                });
            }
        });
    } else if(req.body.searchType == "address") {
        Business.find({
            address: { $regex: req.body.searchString, $options: 'i' }
        }, function(err, data) {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                res.render("nearby.ejs", {
                    businesses: data
                });
            }
        });
    } else if(req.body.searchType == "description") {
        Business.find({
            description: { $regex: req.body.searchString, $options: 'i' }
        }, function(err, data) {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                res.render("nearby.ejs", {
                    businesses: data
                });
            }
        });
    }
})
app.get("/nearby", function(req, res) {
    console.log("nearby index requested");
    Business.find({}, function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("nearby.ejs", {
                businesses: data
            });
        }
    });
});
app.get("/nearby/new", function(req, res) {
    console.log("new business page requested");
    res.render("new.ejs");
});
app.post("/nearby/new", function(req, res) {
    var newBusiness = new Business({
        name: req.body.name,
        description: req.body.description,
        address: req.body.address,
        hours: req.body.hours,
        phone: req.body.phone,
        image: req.body.image,
        tips: [],
        rating: []
    });
    newBusiness.save(function(err, business) {
        if(err) {
            console.log(err);
        } else {
            console.log(business);
            res.redirect("/nearby/new");
        }
    })
});
app.get("/nearby/:business_id", function(req, res) {
    Business.find({
        _id: req.params.business_id
    }, function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("business.ejs", {
                business: data[0]
            });
        }
    });
})
app.listen(port, function() {
    console.log("Listening on port " + port);
});