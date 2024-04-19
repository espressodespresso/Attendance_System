import {UserModComponent} from "../components/modules/UserModComponent";
import {disableSpinner} from "../index";
import {loadModule, moduleList} from "../services/ModuleService";
import {Utils} from "../utilities/Utils";

export class UserModLogic {
    private _component: UserModComponent = null;
    private _utils: Utils = null;

    constructor(component: UserModComponent) {
        this._component = component;
        this._utils = new Utils();
        (async () => {
            await this._utils.initModuleList(component.container);
            disableSpinner();
        })();
    }
}