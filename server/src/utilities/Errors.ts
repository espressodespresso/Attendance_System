export const Errors = {
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
}