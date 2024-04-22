import {AnalyticsLogic} from "./AnalyticsLogic";
import {GeneralUtility} from "../utilities/GeneralUtility";
import {AnalyticsComponent} from "../components/AnalyticsComponent";
import {AttendanceLogic} from "./AttendanceLogic";
import {AttendanceComponent} from "../components/AttendanceComponent";
import {AuthModLogic} from "./AuthModLogic";
import {HomeLogic} from "./HomeLogic";
import {NavbarLogic} from "./NavbarLogic";
import {UserModLogic} from "./UserModLogic";
import {UserModComponent} from "../components/modules/UserModComponent";
import {AuthModComponent} from "../components/modules/AuthModComponent";

export class LogicFactory {
    static createAnalyticsLogic(utils: GeneralUtility, payload: object, component: AnalyticsComponent): AnalyticsLogic {
        return new AnalyticsLogic(utils, payload, component);
    }

    static createAttendanceLogic(component: AttendanceComponent, payload: object): AttendanceLogic {
        return new AttendanceLogic(component, payload)
    }

    static createAuthModLogic(component: AuthModComponent, payload: object): AuthModLogic {
        return new AuthModLogic(component, payload);
    }

    static createHomeLogic(payload: object): HomeLogic {
        return new HomeLogic(payload);
    }

    static createNavbarLogic(): NavbarLogic {
        return new NavbarLogic();
    }

    static createUserModLogic(component: UserModComponent) : UserModLogic {
        return new UserModLogic(component);
    }
}