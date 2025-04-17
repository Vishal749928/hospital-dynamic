


function includeNavbar() {
    fetch("../includes/Navbar.html")
        .then(response => response.text())
        .then(data => document.getElementById("navbar-placeholder").innerHTML = data)
        .catch(error => console.error("Error loading navbar:", error));

        fetch("../includes/Footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("Footer-placeholder").innerHTML = data)
        .catch(error => console.error("Error loading Footer:", error));
};

// Load navbar when the page loads
window.onload = includeNavbar;


AOS.init({
    duration:800,
});

