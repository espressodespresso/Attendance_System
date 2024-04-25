import {ServiceFactory} from "../../src/services/ServiceFactory";
import {AccountService} from "../../src/services/AccountService";
import {AnalyticsService} from "../../src/services/AnalyticsService";
import {AttendanceService} from "../../src/services/AttendanceService";
import {AuthService} from "../../src/services/AuthService";
import {ModuleService} from "../../src/services/ModuleService";
import {MongoService} from "../../src/services/MongoService";
import {RouteService} from "../../src/services/RouteService";

describe('createAccountService', () => {
    test('Should create a account service instance',  () => {
        expect(ServiceFactory.createAccountService()).toBeInstanceOf(AccountService);
    })
});

describe('createAnalyticsService', () => {
    test('Should create a analytic service instance',  () => {
        expect(ServiceFactory.createAnalyticsService()).toBeInstanceOf(AnalyticsService);
    })
});

describe('createAttendanceService', () => {
    test('Should create a attendance service instance',  () => {
        expect(ServiceFactory.createAttendanceService()).toBeInstanceOf(AttendanceService);
    })
});

describe('createAuthService', () => {
    test('Should create a auth service instance',  () => {
        expect(ServiceFactory.createAuthService()).toBeInstanceOf(AuthService);
    })
});

describe('createModuleService', () => {
    test('Should create a module service instance',  () => {
        expect(ServiceFactory.createModuleService()).toBeInstanceOf(ModuleService);
    })
});

describe('createMongoService', () => {
    test('Should create a mongo service instance',  () => {
        expect(ServiceFactory.createMongoService()).toBeInstanceOf(MongoService);
    })
});

describe('createRouteService', () => {
    test('Should create a route service instance',  () => {
        expect(ServiceFactory.createRouteService()).toBeInstanceOf(RouteService);
    })
});