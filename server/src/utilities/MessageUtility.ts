export class MessageUtility {
    private static _instance: MessageUtility = null;

    static getInstance(): MessageUtility {
        if(this._instance === null) {
            this._instance = new MessageUtility();
        }

        return this._instance;
    }

    private _logs = {
        // MongoService | LoginRoute
        Login: "User successfully logged in",
        DataRetrieval: "User info successfully received",
        AccountCreation: "User successfully created and added to DB",
        TokenInsertion: "Token successfully inserted into DB",
        TokenVerification: "Token verified successfully",
        TokenDeletion: "Token successfully deleted from DB",
        TokenLocation: "Token successfully retrieved from DB",
        // AccountRoute
        AccountRoute: "Account route executed successfully",
        AccountAuthRoute: "Account auth route executed successfully",
        AccountRefreshRoute: "Account refresh route executed successfully",
        AccountUpdate: "Account route update executed successfully",
        AccountLogout: "Account logged out successfully",
        // ModuleRoute
        ModuleCreation: "Module created successfully",
        ModuleLoaded: "Module loaded successfully",
        ModulesLoaded: "Modules loaded successfully",
        ModuleUpdate: "Module updated successfully",
        ModuleDelete: "Module deleted successfully",
        ModuleUpdateDB: "Module update to other collections successful",
        ModuleExist: "Module exists in database",
        UpdatedModuleList: "Updated module list successfully",
        // AttendanceRoute
        CodeGenerated: "Code generated for module",
        CodeTerminated: "Code terminated for module",
        UserAttended: "User successfully attended",
        // AuthService
        Authorised: "Authorised successfully",
        // AnalyticsService
        AttendanceData: "User attendance data found",
        ModuleAttendanceData: "Module attendance data found and compiled",

        // Route Responses

    };

    private _errors = {
        // General
        CodeError: "Code Error Occurred!",
        // MongoService | LoginRoute
        InvalidPassword: "User attempted to login with invalid password",
        InvalidAccount: "User attempted to login with invalid account",
        AccountCreation: "Attempt to create user failed",
        StoreToken: "Attempt to store refresh token failed",
        TokenVerification: "Attempt to verify refresh token failed",
        TokenDeletion: "Attempt to delete refresh token failed",
        TokenLocation: "Attempt to locate refresh token failed",
        // AccountRoute
        NoAuthToken: "No Auth Token Received",
        NoRefreshToken: "No Refresh Token Received",
        APIError: "API Error Occurred!",
        NoAccount: "Account credentials not found",
        // ModuleRoute
        ModuleCreation: "Error while inserting module",
        NoModuleLeader: "User entered does not exist",
        ModuleExists: "The module name entered already exists",
        NoModuleExists: "The module searched does not exist",
        // AttendanceRoute
        CodeGenerated: "Code unable to generate for module",
        CodeTerminated: "Code unable to terminate for module",
        AttendanceModification: "Module was unable to be modified, contact system administrator",
        AttendedPreviously: "User has already attended previously",
        NotEnrolled: "User is not enrolled in this module",
        NoAttendanceCode: "The attendance code provided does not exist",
        UserUpdateAttendance: "Unable to update user attendance array",
        LocateAttendance: "Unable to locate attendance details specified",
        // AuthService
        NotAuthorised: "User is not authorised in this route",
        // AnalyticsService
        ComparativeData: "Unable to locate parameters given for comparative analytics",
        NoAttendanceData: "No user attendance data found"
    }

    get logs() {
        return this._logs;
    }

    get errors() {
        return this._errors;
    }
}