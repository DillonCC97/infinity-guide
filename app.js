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
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");


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
    answers: Array
});
var Question = mongoose.model("Question", questionSchema);
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

app.get('/register', function(req, res) {
    console.log("register page requested");
    res.render("register.ejs");
})
app.post('/register', function(req, res) {
    
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
                tipID: uuidv4(),
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
app.post("/nearby/:business_id/:tipID/thumbup", function(req, res) {
    Business.update({'tips.tipID': req.params.tipID}, {'$inc': {
        'tips.$.tipRating': 1
    }}, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/nearby/" + req.params.business_id + "#upvote-" + req.params.tipID);
        }
    });
});

app.post("/nearby/:business_id/:tipID/thumbdown", function(req, res) {
    Business.update({'tips.tipID': req.params.tipID}, {'$inc': {
        'tips.$.tipRating': -1
    }}, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/nearby/" + req.params.business_id + "#downvote-" + req.params.tipID);
        }
    });
});

app.post("/ask/new", function(req, res) {
    var newQuestion = new Question({
        question: req.body.question,
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
        if (err) {
            console.log(err);
        } else {
            res.render("ask.ejs", {questions: data});
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
            res.render("question.ejs", {question: data[0]});
        }
    });
});

app.post("/ask/:questionID/answer", function(req, res) {
    Question.update({
        _id: req.params.questionID
    }, {
        $push: {
            answers: {
                answerID: uuidv4(),
                answerText: req.body.answer,
                answerRating: 0
            }
        }
    }, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/ask/" + req.params.questionID);
        }
    });
})

app.listen(port, function() {
    console.log("Listening on port " + port);
});