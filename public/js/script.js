$(document).ready(function() {
    if (document.location.pathname == "/") {
        $("#nav-home").addClass("active");
    } else if(document.location.pathname == "/nearby") {
        $("#nav-nearby").addClass("active");
    } else if(document.location.pathname == "/login") {
        $("#nav-login").addClass("active");
    }
});