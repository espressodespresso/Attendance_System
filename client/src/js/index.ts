import {getPayloadData, verifyStatus} from "./services/authService";
import {insert} from "./components/navbar"
import {AuthorativeModule} from "./components/authModule";
import {UserModule} from "./components/userModule";

async function loadItems() {
    let payload = await getPayloadData();
    //console.log(payload["username"]);
    if(typeof payload !== "object" && document.title !== "Login") {
        window.location.href = "/attendance_system/client/src/login.html"
    } else if(typeof payload === "object" && document.title === "Login") {
        window.location.href = "/attendance_system/client/src/index.html"
        insert()
    } else if(typeof payload === "object") {
        insert();
    }

    if(document.title === "Login") {
        let loginButton = document.getElementById("loginButton");
        //loginButton.addEventListener("click", username + password, false)
        loginButton.addEventListener("click", async function (){
            let username = (document.getElementById("emailInput") as HTMLInputElement).value;
            let password = (document.getElementById("passwordInput") as HTMLInputElement).value;
            if(await verifyStatus(username, password)) {
                window.location.href = "/attendance_system/client/src/index.html"
            }
        })
    }
}

//let x = new AuthorativeModule();
//let x = new UserModule();

window.onload = loadItems;