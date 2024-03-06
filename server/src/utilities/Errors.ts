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
    APIError: "API Error Occurred!"
}