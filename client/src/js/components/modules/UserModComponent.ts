import {disableSpinner} from "../../index";
import {UserModLogic} from "../../logic/UserModLogic";

export class UserModComponent {
    private _userModLogic: UserModLogic = null;
    private _container: HTMLElement = null;

    constructor() {
        this._userModLogic = new UserModLogic(this);
        const mod_container = document.getElementById("modules-container");
        this._container = document.createElement("div");
        this._container.classList.add("container");
        mod_container.appendChild(this.container)
    }

    get container(): HTMLElement {
        return this._container;
    }

    createUnorderedList(module_content: object, top?: boolean): HTMLUListElement {
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "list-group-horizontal");
        if(typeof top !== "undefined") {
            ul.id = "top-listgroup";
            ul.classList.add("list-group-item-dark");
        }
        ul.appendChild(this.createListitem(module_content["name"]));
        ul.appendChild(this.createListitem(module_content["semester"]));
        ul.appendChild(this.createListitem(module_content["mandatory"]));
        ul.appendChild(this.createListitem(module_content["lecturer"]));
        return ul;
    }

     private createListitem(textContent: string): HTMLLIElement {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "w-25");
        li.textContent = textContent;
        return li;
    }
}