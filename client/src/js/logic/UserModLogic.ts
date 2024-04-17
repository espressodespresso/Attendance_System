import {UserModComponent} from "../components/modules/UserModComponent";
import {disableSpinner} from "../index";

export class UserModLogic {
    private _component: UserModComponent = null;

    constructor(component: UserModComponent) {
        this._component = component;
        disableSpinner();
    }
}