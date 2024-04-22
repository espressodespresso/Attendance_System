import {ServiceFactory} from "../services/ServiceFactory";

export class NavbarLogic {
    constructor() {
        const logoutElement = document.getElementById("logout_button");
        logoutElement.addEventListener('click', async () => {
            await ServiceFactory.createAuthService().logout();
            setTimeout( () => {
                window.location.reload();
            }, 2000)
        })
    }
}