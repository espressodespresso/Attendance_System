import {HomeComponent} from "./home/HomeComponent";
import {UserModComponent} from "./modules/UserModComponent";
import {AnalyticsComponent} from "./AnalyticsComponent";
import {AttendanceComponent} from "./AttendanceComponent";
import {NavbarComponent} from "./NavbarComponent";
import {AuthModComponent} from "./modules/AuthModComponent";

export class ComponentFactory {
    static createHomeComponent(payload: object): HomeComponent {
        return new HomeComponent(payload);
    }

    static createAuthModComponent(payload: object): AuthModComponent {
        return new AuthModComponent(payload);
    }

    static createUserModComponent(): UserModComponent {
        return new UserModComponent();
    }

    static createAnalyticsComponent(payload: object): AnalyticsComponent {
        return new AnalyticsComponent(payload);
    }

    static createAttendanceComponent(index_container_form: HTMLElement, payload: object): AttendanceComponent {
        return new AttendanceComponent(index_container_form, payload);
    }

    static createNavbarComponent(): NavbarComponent {
        return new NavbarComponent();
    }
}