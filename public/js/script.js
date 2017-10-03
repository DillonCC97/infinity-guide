$(document).ready(function() {
    if (document.location.pathname == "/") {
        $("#nav-home").addClass("active");
    } else if(document.location.pathname.split('/')[1] == "nearby") {
        $("#nav-nearby").addClass("active");
    } else if(document.location.pathname.split('/')[1] == "login") {
        $("#nav-login").addClass("active");
    } else if(document.location.pathname.split('/')[1] == "ask") {
        $("#nav-ask").addClass("active");
    }
});