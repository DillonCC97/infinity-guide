var port = 3000;
var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/nearby");
var bodyparser = require("body-parser");
var session = require('express-session');
app.use(bodyparser.urlencoded({
    extended: true
}));
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var passportLocalMongoose = require('passport-local-mongoose');
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    secret: 'infinityhall'
}));
passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({
        username: username
    }, function(err, user) {
        if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }
        if(!user.validPassword(password)) {
            return done(null, false, {
                message: 'Incorrect password.'
            });
        }
        return done(null, user);
    });
}));
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
//UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);
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
    Business.find({}, function(err, data) {
        if(err) {
            console.log(err);
            res.render("home.ejs", {
                businesses: null
            });
        } else {
            res.render("home.ejs", {
                businesses: data
            });
        }
    });
});
app.get("/login", function(req, res) {
    console.log("login page requested");
    res.render("login.ejs");
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/nearby/new',
    failureRedirect: '/login'
}));
app.get('/register', function(req, res) {
    console.log("register page requested");
    res.render("register.ejs");
})
app.post('/register', function(req, res) {
    Account.register(new Account({
        username: req.body.username
    }), req.body.password, function(err, account) {
        if(err) {
            console.log(err);
            return res.render('register', {
                account: account
            });
        }
        passport.authenticate('local')(req, res, function() {
            res.redirect('/nearby');
        });
    });
});
app.post("/nearby", function(req, res) {
    console.log(req.body);
    console.log("search requested");
    if(req.body.searchType == "name") {
        Business.find({
            name: {
                $regex: req.body.searchString,
                $options: 'i'
            }
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
            address: {
                $regex: req.body.searchString,
                $options: 'i'
            }
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
            description: {
                $regex: req.body.searchString,
                $options: 'i'
            }
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
});
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
    console.log(req.user);
    res.render("new.ejs", {
        user: req.user
    });
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
});
app.post("/:business_id/newtip", function(req, res) {
    Business.update({
        _id: req.params.business_id
    }, {
        $push: {
            tips: {
                tipText: req.body.tip,
                tipRating: 0
            }
        }
    }, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/nearby/" + req.params.business_id);
        }
    });
});
app.post("/:business_id/newrating", function(req, res) {
    if(req.body.rating > 0 && req.body.rating < 6 && req.body.rating % 1 === 0) {
        Business.update({
            _id: req.params.business_id
        }, {
            $push: {
                rating: req.body.rating
            }
        }, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                res.redirect("/nearby/" + req.params.business_id);
            }
        });
    }
});
app.post("/:business_id/:tip_index/thumbup", function(req, res) {
    
});
Business.findByIdAndUpdate("59c2efdeec53070c784cc8ea", {
    tips: []
}, function(err, data) {
    if(err) {
        console.log(err)
    } else {
        console.log(data);
    }
});
app.listen(port, function() {
    console.log("Listening on port " + port);
});