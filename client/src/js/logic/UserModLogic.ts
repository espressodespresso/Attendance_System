import {disableSpinner} from "../index";
import {GeneralUtility} from "../utilities/GeneralUtility";
import {IUserModComponent} from "../components/modules/UserModComponent";


export class UserModLogic {
    constructor(component: IUserModComponent) {
        (async () => {
            await GeneralUtility.getInstance().initModuleList(component.container);
            disableSpinner();
        })();
    }
}