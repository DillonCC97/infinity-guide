var port = 3000;

var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/nearby");
var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended: true}));
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
    image: String
});

var Business = mongoose.model("Business", dbSchema);

app.get("/", function(req, res) {
    console.log("index page requested");
    res.render("home.ejs");
});

app.get("/nearby", function(req, res) {
    console.log("nearby index requested");
    res.render("nearby.ejs");
})

app.listen(port, function() {
    console.log("Listening on port " + port);
});