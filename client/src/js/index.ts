import {verifyStatus} from "./services/authService";

let loginButton = document.getElementById("loginButton");
//loginButton.addEventListener("click", username + password, false)
loginButton.addEventListener("click", async function (){
    let username = (document.getElementById("emailInput") as HTMLInputElement).value;
    let password = (document.getElementById("passwordInput") as HTMLInputElement).value;
    if(await verifyStatus(username, password)) {
        window.location.href = "/attendance_system/client/src/index.html"
    } else {

    }
})