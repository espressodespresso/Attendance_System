import {AccountService} from "./AccountService";
import {AnalyticsService} from "./AnalyticsService";
import {AttendanceService} from "./AttendanceService";
import {AuthService} from "./AuthService";
import {MongoService} from "./MongoService";
import {RouteService} from "./RouteService";
import {ModuleService} from "./ModuleService";

export class ServiceFactory {
    static createAccountService(): AccountService {
        return new AccountService();
    }

    static createAnalyticsService(): AnalyticsService {
        return new AnalyticsService();
    }

    static createAttendanceService(): AttendanceService {
        return new AttendanceService();
    }

    static createAuthService(): AuthService {
        return new AuthService();
    }

    static createModuleService(): ModuleService {
        return new ModuleService();
    }

    static createMongoService(): MongoService {
        return new MongoService();
    }

    static createRouteService(): RouteService {
        return new RouteService();
    }
}