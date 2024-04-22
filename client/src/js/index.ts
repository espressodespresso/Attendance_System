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
    switch (window.location.pathname) {
        case "/attendance_system/client/src/modules.html":
            await loadModules(payload);
            break;
        case "/attendance_system/client/src/index.html":
            ComponentFactory.createHomeComponent(payload);
            break;
        case "/attendance_system/client/src/analytics.html":
            ComponentFactory.createAnalyticsComponent(payload);
            break;
        case "/attendance_system/client/src/login.html":
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