$(document).ready(function() {
    if (document.location.pathname == "/") {
        $("#nav-home").addClass("active");
        $("title").text("Infinity Guide")
    } else if(document.location.pathname.split('/')[1] == "nearby") {
        $("#nav-nearby").addClass("active");
        $("title").text("Infinity Guide - Nearby")
    } else if(document.location.pathname.split('/')[1] == "login") {
        $("#nav-login").addClass("active");
        $("title").text("Infinity Guide - Log In")
    } else if(document.location.pathname.split('/')[1] == "ask") {
        $("#nav-ask").addClass("active");
        $("title").text("Infinity Guide - Ask")
    } else if(document.location.pathname.split('/')[1] == "register") {
        $("nav-register").addClass("active");
        $("title").text("Infinity Guide - Register")
    }
    
    $("#register-form").submit(function(e) {
        if($("input[type='password']").val().length < 9) {
            alert("Passwords must be greater than 9 characters");
            e.preventDefault();
        }
    });
    
    if(document.location.pathname == "/login/fail" || document.location.pathname == "/register/userexists") {
        $(".alert").show();
    }
    
});