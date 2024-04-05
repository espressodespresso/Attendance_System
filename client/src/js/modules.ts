import {AuthorativeModule} from "./components/modules/AuthModComponent";
import {Role} from "./enums/Role.enum";
import {UserModComponent} from "./components/modules/UserModComponent";
import {getPayloadData} from "./services/AuthService";


let moduleComponent = null;

export async function loadModules(payload: object) {
    const userInfo = payload["json"]["userinfo"];
    switch (userInfo["role"]) {
        case Role.Student:
            moduleComponent = new UserModComponent();
            break;
        case Role.IT:
            moduleComponent = new AuthorativeModule(payload);
            break;
        case Role.AdministrativeFM:
            moduleComponent = new AuthorativeModule(payload);
            break;
        case Role.Lecturer:
            moduleComponent = new AuthorativeModule(payload);
            break;
    }
}



function getLocalUserInfo(): JSON {
    return JSON.parse(localStorage.getItem("userInfo"))
}
