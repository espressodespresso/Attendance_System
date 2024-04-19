import {logout} from "../services/AuthService";

export class NavbarLogic {
    constructor() {
        const logoutElement = document.getElementById("logout_button");
        logoutElement.addEventListener('click', async () => {
            await logout();
            setTimeout( () => {
                window.location.reload();
            }, 2000)
        })
    }
}