import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {loadModules} from "./modules";
import {IAuthService} from "./services/AuthService";
import {ServiceFactory} from "./services/ServiceFactory";
import {ComponentFactory} from "./components/ComponentFactory";

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
    const splitPath = window.location.pathname.split("/");
    console.log(splitPath[splitPath.length - 1].split('.')[0])
    switch (splitPath[splitPath.length - 1].split('.')[0]) {
        case "modules":
            await loadModules(payload);
            break;
        case "index":
            ComponentFactory.createHomeComponent(payload);
            break;
        case "analytics":
            ComponentFactory.createAnalyticsComponent(payload);
            break;
        case "login":
            disableSpinner();
            break;
    }
}

async function verifyPayload(): Promise<object> {
    const authService: IAuthService = ServiceFactory.createAuthService();
    let payload = await authService.getPayloadData();
    switch (payload["status"]) {
        case 200:
            if(document.title === "Login") {
                window.location.href = "/attendance_system/client/src/index.html";
            }

            ComponentFactory.createNavbarComponent();
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
            if(await authService.verifyStatus(username, password, await authService.getBrowserFingerprint())) {
                window.location.href = "/attendance_system/client/src/index.html"
            }
        })
    }
}

window.onload = loadItems;

export default fpPromise;