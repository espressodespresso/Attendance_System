import {NavbarLogic} from "../logic/NavbarLogic";

export function insert() {
    // Navbar Container
    const navbar = document.createElement("nav");
    navbar.classList.add("navbar", "navbar-expand-lg");
    const container_fluid =document.createElement("div");
    container_fluid.classList.add("container-fluid");
    const navbar_brand = document.createElement("a");
    navbar_brand.classList.add("navbar-brand");
    navbar_brand.href = "#";
    // Logo Image
    const logo = document.createElement("img");
    logo.src = "img/shu_logo_simplified.png";
    logo.alt = "Logo";
    logo.width = 100;
    logo.height = 62;
    logo.classList.add("d-inline-block", "align-text-top");
    navbar_brand.appendChild(logo);
    container_fluid.appendChild(navbar_brand);
    // Attendance Portal Title
    const portalH2 = document.createElement("h2");
    portalH2.textContent = "Attendance Portal";
    container_fluid.appendChild(portalH2);
    // Navbar
    const ulNav = document.createElement("ul");
    ulNav.classList.add("navbar-nav", "mb2", "mb-lg-0");
    // Logout Navbar Item ("brand")
    const logout_item = document.createElement("a");
    logout_item.classList.add("navbar-brand");
    logout_item.href = "#";
    logout_item.id = "logout_button";
    const logout_img = document.createElement("img");
    logout_img.src = "img/logout.png";
    logout_img.alt = "Logout Icon";
    logout_img.width = 24;
    logout_img.height = 24;
    logout_img.classList.add("d-inline-block", "align-text-top");
    logout_item.appendChild(logout_img);
    ulNav.appendChild(logout_item);
    // Modules Navbar Item
    const modulesItem = document.createElement('li');
    modulesItem.classList.add("nav-item");
    const modulesLink = document.createElement("a");
    modulesLink.classList.add("nav-link");
    modulesLink.href = "modules.html";
    modulesLink.innerHTML = "<b>Modules</b>"
    modulesItem.appendChild(modulesLink);
    ulNav.appendChild(modulesItem);
    // Analytics Navbar Item
    const analyticsItem = document.createElement('li');
    analyticsItem.classList.add("nav-item");
    const analyticsLink = document.createElement("a");
    analyticsLink.classList.add("nav-link");
    analyticsLink.href = "analytics.html";
    analyticsLink.innerHTML = "<b>Analytics</b>"
    analyticsItem.appendChild(analyticsLink);
    ulNav.appendChild(analyticsItem);
    // Home Navbar Item
    const homeItem = document.createElement('li');
    homeItem.classList.add("nav-item");
    const homeLink = document.createElement("a");
    homeLink.classList.add("nav-link");
    homeLink.href = "index.html";
    homeLink.innerHTML = "<b>Home</b>"
    homeItem.appendChild(homeLink);
    ulNav.appendChild(homeItem);
    container_fluid.appendChild(ulNav);
    navbar.appendChild(container_fluid);
    document.body.insertBefore(navbar, document.body.firstChild);
    new NavbarLogic();
}