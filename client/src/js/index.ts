import {getBrowserFingerprint, getPayloadData, verifyStatus} from "./services/AuthService";
import {insert} from "./components/NavbarComponent"
import {HomeComponent} from "./components/home/HomeComponent";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {AuthorativeModule} from "./components/modules/AuthModComponent";
import {loadModules} from "./modules";
import {AnalyticsComponent} from "./components/AnalyticsComponent";

const fpPromise = FingerprintJS.load();

export function disableSpinner() {
    const spinner = document.getElementById("spinner");
    spinner.classList.add("spinner-hidden");
    spinner.addEventListener("transitionend", () => {
        document.body.removeChild(spinner)
    });
}

async function loadItems() {
    const payload = await verifyPayload();
    switch (window.location.pathname) {
        case "/attendance_system/client/src/modules.html":
            await loadModules(payload);
            break;
        case "/attendance_system/client/src/index.html":
            new HomeComponent(payload);
            break;
        case "/attendance_system/client/src/analytics.html":
            new AnalyticsComponent(payload);
            break;
        case "/attendance_system/client/src/login.html":
            disableSpinner();
            break;
    }
}

async function verifyPayload(): Promise<object> {
    let payload = await getPayloadData();
    switch (payload["status"]) {
        case 200:
            if(document.title === "Login") {
                window.location.href = "/attendance_system/client/src/index.html";
                insert()
            } else {
                insert();
            }

            return payload;

        case 401:
            if(document.title !== "Login") {
                window.location.href = "/attendance_system/client/src/login.html";
            }

            break;

        case 500:
            window.location.href = "/attendance_system/client/src/login.html"
            console.error("API Error");
            break;
    }

    if(document.title === "Login") {
        let loginButton = document.getElementById("loginButton");
        loginButton.addEventListener("click", async function (){
            let username = (document.getElementById("usernameInput") as HTMLInputElement).value;
            let password = (document.getElementById("passwordInput") as HTMLInputElement).value;
            if(await verifyStatus(username, password, await getBrowserFingerprint())) {
                window.location.href = "/attendance_system/client/src/index.html"
            }
        })
    }
}

window.onload = loadItems;

export default fpPromise;