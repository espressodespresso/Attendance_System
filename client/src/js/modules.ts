import {Role} from "./enums/Role.enum";
import {ComponentFactory} from "./components/ComponentFactory";

let moduleComponent = null;

export async function loadModules(payload: object) {
    const userInfo = payload["json"]["userinfo"];
    switch (userInfo["role"]) {
        case Role.Student:
            moduleComponent = ComponentFactory.createUserModComponent();
            break;
        case Role.IT:
        case Role.AdministrativeFM:
        case Role.Lecturer:
            moduleComponent = ComponentFactory.createAuthModComponent(payload);
            break;
    }
}



function getLocalUserInfo(): JSON {
    return JSON.parse(localStorage.getItem("userInfo"))
}
