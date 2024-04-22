import {ModuleService} from "./ModuleService";
import {AuthService} from "./AuthService";
import {AttendanceService} from "./AttendanceService";
import {AnalyticsService} from "./AnalyticsService";

export class ServiceFactory {
    static createModuleService(): ModuleService {
        return new ModuleService();
    }

    static createAuthService(): AuthService {
        return new AuthService();
    }

    static createAttendanceService(): AttendanceService {
        return new AttendanceService();
    }

    static createAnalyticsService(): AnalyticsService {
        return new AnalyticsService();
    }
}