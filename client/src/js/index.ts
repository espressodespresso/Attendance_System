import {getBrowserFingerprint, getPayloadData, verifyStatus} from "./services/AuthService";
import {insert} from "./components/NavbarComponent"
import {HomeComponent} from "./components/home/HomeComponent";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const fpPromise = FingerprintJS.load();

async function loadItems() {
    let payload = await getPayloadData();
    //console.log(payload["userinfo"]);
    //console.log(JSON.stringify(payload["userinfo"]));
    if(typeof payload !== "object" && document.title !== "Login") {
        window.location.href = "/attendance_system/client/src/login.html"
    } else if(typeof payload === "object" && document.title === "Login") {
        window.location.href = "/attendance_system/client/src/index.html"
        saveUserInfoLocal(payload["userinfo"]);
        insert();
    } else if(typeof payload === "object") {
        saveUserInfoLocal(payload["userinfo"]);
        insert();
    }

    if(document.title === "Login") {
        let loginButton = document.getElementById("loginButton");
        //loginButton.addEventListener("click", username + password, false)
        loginButton.addEventListener("click", async function (){
            let username = (document.getElementById("emailInput") as HTMLInputElement).value;
            let password = (document.getElementById("passwordInput") as HTMLInputElement).value;
            if(await verifyStatus(username, password, await getBrowserFingerprint())) {
                window.location.href = "/attendance_system/client/src/index.html"
            }
        })
    }
}

function saveUserInfoLocal(payload: object) {
    if(localStorage.length >= 0) {
        localStorage.clear();
        localStorage.setItem("userInfo", JSON.stringify(payload));
    }
}

//let x = new HomeComponent(JSON.parse(localStorage.getItem("userInfo"))["role"])
//let x = new AuthorativeModule();
//let x = new UserModComponent();
//let x = new UserHome();

window.onload = loadItems;

export default fpPromise;