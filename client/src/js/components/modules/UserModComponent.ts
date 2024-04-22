import {LogicFactory} from "../../logic/LogicFactory";

export interface IUserModComponent {
    get container(): HTMLElement;
}

export class UserModComponent {
    private readonly _container: HTMLElement = null;

    constructor() {
        const mod_container = document.getElementById("modules-container");
        this._container = document.createElement("div");
        this._container.classList.add("container");
        mod_container.appendChild(this.container)
        LogicFactory.createUserModLogic(this);
    }

    get container(): HTMLElement {
        return this._container;
    }
}