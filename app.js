var port = 3001;
var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/nearby");
var bodyparser = require("body-parser");
const uuidv4 = require('uuid/v4');
app.use(bodyparser.urlencoded({
    extended: true
}));
var User = require("./models/user");
var methodOverride = require("method-override");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "code institute infinity guide random words",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.user = req.user;
    next();
});

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}
var businessSchema = new mongoose.Schema({
    name: String,
    description: String,
    address: String,
    hours: String,
    phone: String,
    image: String,
    tips: Array,
    rating: Array
});
var Business = mongoose.model("Business", businessSchema);
var questionSchema = new mongoose.Schema({
    question: String,
    asker: String,
    answers: Array
});
var Question = mongoose.model("Question", questionSchema);
app.get("/", function(req, res) {
    console.log("index page requested");
    Business.find({}, null, {
        sort: {
            name: 1
        }
    }, function(err, data) {
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
app.get("/login/fail", function(req, res) {
    res.render("login.ejs");
});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login/fail"
}), function(req, res) {});
app.get("/logout", isLoggedIn, function(req, res) {
    req.logout();
    res.redirect("/login");
})
app.get('/register', function(req, res) {
    console.log("register page requested");
    res.render("register.ejs");
});
app.get('/register/userexists', function(req, res) {
    res.render("register.ejs");
})
app.post('/register', function(req, res) {
    User.register(new User({
        username: req.body.username
    }), req.body.password, function(err, user) {
        if(err) {
            if(err.name == "UserExistsError") {
                return res.redirect("/register/userexists");
            }
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/");
            });
        }
    });
});
app.get("/nearby/search", function(req, res) {
    console.log(req.body);
    console.log("search requested");
    if(req.query.searchType == "name") {
        Business.find({
            name: {
                $regex: req.query.searchString,
                $options: 'i'
            }
        }, null, {
            sort: {
                name: 1
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
    } else if(req.query.searchType == "address") {
        Business.find({
            address: {
                $regex: req.query.searchString,
                $options: 'i'
            }
        }, null, {
            sort: {
                name: 1
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
    } else if(req.query.searchType == "description") {
        Business.find({
            description: {
                $regex: req.query.searchString,
                $options: 'i'
            }
        }, null, {
            sort: {
                name: 1
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
    Business.find({}, null, {
        sort: {
            name: 1
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
});
app.get("/nearby/new", isLoggedIn, function(req, res) {
    console.log("new business page requested");
    console.log(req.user);
    res.render("new.ejs", {
        user: req.user
    });
});
app.post("/nearby/new", isLoggedIn, function(req, res) {
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
    }, null, {
        sort: {
            name: 1
        }
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
app.post("/:business_id/newtip", isLoggedIn, function(req, res) {
    Business.update({
        _id: req.params.business_id
    }, {
        $push: {
            tips: {
                tipID: uuidv4(),
                tipText: req.body.tip,
                tipRating: []
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
app.post("/:business_id/newrating", isLoggedIn, function(req, res) {
    if(req.body.rating > 0 && req.body.rating < 6 && req.body.rating % 1 === 0) {
        Business.find({
            _id: req.params.business_id
        }, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                var hasRated = false;
                for(var i = 0; i < data[0].rating.length; i++) {
                    if(data[0].rating[i].user == req.user._id.toString()) {
                        //                         console.log("Already voted");
                        //                         return res.redirect("/nearby/" + req.params.business_id);
                        //                         break;
                        hasRated = true;
                    }
                }
                if(hasRated) {
                    Business.update({
                        _id: req.params.business_id,
                        'rating.user': req.user._id.toString()
                    }, {
                        $set: {
                            'rating.$.ratingVal': req.body.rating
                        }
                    }, function(err, data) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log(data)
                            res.redirect("/nearby/" + req.params.business_id);
                        }
                    });
                } else {
                    Business.update({
                        _id: req.params.business_id
                    }, {
                        $push: {
                            rating: {
                                ratingVal: req.body.rating,
                                user: req.user._id.toString()
                            }
                        }
                    }, function(err, data) {
                        if(err) {
                            console.log(err);
                            res.redirect("/nearby/" + req.params.business_id);
                        } else {
                            console.log("new rating added");
                            res.redirect("/nearby/" + req.params.business_id);
                        }
                    });
                }
            }
        });
    }
});
app.post("/nearby/:business_id/:tipID/thumbup", isLoggedIn, function(req, res) {
    Business.find({
        _id: req.params.business_id
    }, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            var voteID;
            var hasVoted = false;
            data[0].tips.forEach(function(tip) {
                if(tip.tipID == req.params.tipID) {
                    tip.tipRating.forEach(function(tipRating) {
                        if(tipRating.user == req.user._id.toString()) {
                            hasVoted = true;
                            voteID = tipRating.voteID;
                        }
                    });
                }
            });
            if(hasVoted) {
                Business.findById(req.params.business_id, function(err, business) {
                    var tipIndex;
                    for(var i = 0; i < business.tips.length; i++) {
                        if(business.tips[i].tipID == req.params.tipID) {
                            tipIndex = i;
                        }
                    }
                    var ratingIndex;
                    for(var i = 0; i < business.tips[tipIndex].tipRating.length; i++) {
                        if(business.tips[tipIndex].tipRating[i].user == req.user._id.toString()) {
                            ratingIndex = i;
                        }
                    }
                    business.tips[tipIndex].tipRating[ratingIndex].rating = 1;
                    business.markModified('tips');
                    business.save(function(err, updatedBusiness) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect("/nearby/" + req.params.business_id + "#upvote-" + req.params.tipID);
                        }
                    });
                });
            } else {
                Business.update({
                    'tips.tipID': req.params.tipID
                }, {
                    '$push': {
                        'tips.$.tipRating': {
                            user: req.user._id.toString(),
                            rating: 1,
                            voteID: uuidv4()
                        }
                    }
                }, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        res.redirect("/nearby/" + req.params.business_id + "#upvote-" + req.params.tipID);
                    }
                });
            }
        }
    });
});
app.post("/nearby/:business_id/:tipID/thumbdown", isLoggedIn, function(req, res) {
    Business.find({
        _id: req.params.business_id
    }, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            var voteID;
            var hasVoted = false;
            data[0].tips.forEach(function(tip) {
                if(tip.tipID == req.params.tipID) {
                    tip.tipRating.forEach(function(tipRating) {
                        if(tipRating.user == req.user._id.toString()) {
                            hasVoted = true;
                            voteID = tipRating.voteID;
                        }
                    });
                }
            });
            if(hasVoted) {
                Business.findById(req.params.business_id, function(err, business) {
                    var tipIndex;
                    for(var i = 0; i < business.tips.length; i++) {
                        if(business.tips[i].tipID == req.params.tipID) {
                            tipIndex = i;
                        }
                    }
                    var ratingIndex;
                    for(var i = 0; i < business.tips[tipIndex].tipRating.length; i++) {
                        if(business.tips[tipIndex].tipRating[i].user == req.user._id.toString()) {
                            ratingIndex = i;
                        }
                    }
                    business.tips[tipIndex].tipRating[ratingIndex].rating = -1;
                    business.markModified('tips');
                    business.save(function(err, updatedBusiness) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect("/nearby/" + req.params.business_id + "#upvote-" + req.params.tipID);
                        }
                    });
                });
            } else {
                Business.update({
                    'tips.tipID': req.params.tipID
                }, {
                    '$push': {
                        'tips.$.tipRating': {
                            user: req.user._id.toString(),
                            rating: -1,
                            voteID: uuidv4()
                        }
                    }
                }, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        res.redirect("/nearby/" + req.params.business_id + "#upvote-" + req.params.tipID);
                    }
                });
            }
        }
    });
});
app.post("/ask/new", isLoggedIn, function(req, res) {
    var newQuestion = new Question({
        question: req.body.question,
        asker: req.user.username,
        answers: []
    });
    console.log(newQuestion);
    console.log(req.body.question);
    newQuestion.save(function(err, question) {
        if(err) {
            console.log(err);
        } else {
            console.log(question);
            res.redirect("/ask");
        }
    });
});
app.get("/ask", function(req, res) {
    Question.find({}, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.render("ask.ejs", {
                questions: data
            });
        }
    });
});
app.get("/ask/search", function(req, res) {
    Question.find({
        question: {
            $regex: req.query.search,
            $options: 'i'
        }
    }, null, {
        sort: {
            search: 1
        }
    }, function(err, data) {
        if(err) {
            console.log(err);
            res.redirect("/ask");
        } else {
            console.log(data);
            res.render("ask.ejs", {
                questions: data
            });
        }
    });
});
app.get("/ask/:questionID", function(req, res) {
    Question.find({
        _id: req.params.questionID
    }, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.render("question.ejs", {
                question: data[0]
            });
        }
    });
});
app.post("/ask/:questionID/answer", isLoggedIn, function(req, res) {
    Question.update({
        _id: req.params.questionID
    }, {
        $push: {
            answers: {
                answerID: uuidv4(),
                answerText: req.body.answer,
                answerRating: []
            }
        }
    }, function(err, data) {
        if(err) {
            console.log("528");
        } else {
            res.redirect("/ask/" + req.params.questionID);
        }
    });
});
app.post("/ask/:questionID/:answerID/thumbup", isLoggedIn, function(req, res) {
    Question.find({
        _id: req.params.questionID
    }, function(err, data) {
        if(err) {
            console.log("540");
            res.send("here 540");
        } else {
            var voteID;
            var hasVoted = false;
            data[0].answers.forEach(function(answer) {
                if(answer.answerID == req.params.answerID) {
                    answer.answerRating.forEach(function(answerRating) {
                        if(answerRating.user == req.user._id.toString()) {
                            hasVoted = true;
                            voteID = answerRating.voteID;
                        }
                    });
                }
            });
            if(hasVoted) {
                Question.findById(req.params.questionID, function(err, question) {
                    var answerIndex;
                    for(var i = 0; i < question.answers.length; i++) {
                        if(question.answers[i].answerID == req.params.answerID) {
                            answerIndex = i;
                        }
                    }
                    var ratingIndex;
                    for(var i = 0; i < question.answers[answerIndex].answerRating.length; i++) {
                        if(question.answers[answerIndex].answerRating[i].user == req.user._id.toString()) {
                            ratingIndex = i;
                        }
                    }
                    question.answers[answerIndex].answerRating[ratingIndex].rating = 1;
                    question.markModified('answers');
                    question.save(function(err, updatedQuestion) {
                        if(err) {
                            console.log("572");
                                        res.send("here 572");
                        } else {
                            res.redirect("/ask/" + req.params.questionID + "#downvote" + req.params.answerID)
                        }
                    });
                });
            } else {
                Question.update({
                    'answers.answerID': req.params.answerID
                }, {
                    '$push': {
                        'answers.$.answerRating': {
                            user: req.user._id.toString(),
                            rating: 1,
                            voteID: uuidv4() // Fix?
                        }
                    }
                }, function(err) {
                    if(err) {
                        console.log("593");
                                    res.send("here 593");

                    } else {
                        res.redirect("/ask/" + req.params.questionID + "#downvote" + req.params.answerID)
                    }
                });
            }
        }
    });
});
app.post("/ask/:questionID/:answerID/thumbdown", isLoggedIn, function(req, res) {
    Question.find({
        _id: req.params.questionID
    }, function(err, data) {
        if(err) {
            console.log("540");
            res.send("here 540");
        } else {
            var voteID;
            var hasVoted = false;
            data[0].answers.forEach(function(answer) {
                if(answer.answerID == req.params.answerID) {
                    answer.answerRating.forEach(function(answerRating) {
                        if(answerRating.user == req.user._id.toString()) {
                            hasVoted = true;
                            voteID = answerRating.voteID;
                        }
                    });
                }
            });
            if(hasVoted) {
                Question.findById(req.params.questionID, function(err, question) {
                    var answerIndex;
                    for(var i = 0; i < question.answers.length; i++) {
                        if(question.answers[i].answerID == req.params.answerID) {
                            answerIndex = i;
                        }
                    }
                    var ratingIndex;
                    for(var i = 0; i < question.answers[answerIndex].answerRating.length; i++) {
                        if(question.answers[answerIndex].answerRating[i].user == req.user._id.toString()) {
                            ratingIndex = i;
                        }
                    }
                    question.answers[answerIndex].answerRating[ratingIndex].rating = -1;
                    question.markModified('answers');
                    question.save(function(err, updatedQuestion) {
                        if(err) {
                            console.log("572");
                                        res.send("here 572");
                        } else {
                            res.redirect("/ask/" + req.params.questionID + "#downvote" + req.params.answerID)
                        }
                    });
                });
            } else {
                Question.update({
                    'answers.answerID': req.params.answerID
                }, {
                    '$push': {
                        'answers.$.answerRating': {
                            user: req.user._id.toString(),
                            rating: -1,
                            voteID: uuidv4() // Fix?
                        }
                    }
                }, function(err) {
                    if(err) {
                        console.log("593");
                                    res.send("here 593");

                    } else {
                        res.redirect("/ask/" + req.params.questionID + "#downvote" + req.params.answerID)
                    }
                });
            }
        }
    });
});
app.listen(port, function() {
    console.log("Listening on port " + port);
});