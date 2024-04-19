import {disableSpinner} from "../../index";
import {UserModLogic} from "../../logic/UserModLogic";

export class UserModComponent {
    private _userModLogic: UserModLogic = null;
    private _container: HTMLElement = null;

    constructor() {
        const mod_container = document.getElementById("modules-container");
        this._container = document.createElement("div");
        this._container.classList.add("container");
        mod_container.appendChild(this.container)
        this._userModLogic = new UserModLogic(this);
    }

    get container(): HTMLElement {
        return this._container;
    }
}