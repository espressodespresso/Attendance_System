import {Role} from "../enums/Role.enum";
const { MongoClient } = require("mongodb")
import {decode, verify} from 'hono/jwt'
import {AuthState} from "../enums/AuthState.enum";
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";

export class MongoService {
    //private client = new MongoClient(process.env["MONGOURI "]);
    private client = new MongoClient("");
    private database = this.client.db('database');
    private usersCollection = this.database.collection('users');
    private tokenCollection = this.database.collection('tokens');
    private moduleCollection = this.database.collection('module');

    async login(username: string, password: string) {
        try {
            await this.client.connect();
            const query = { username: username };
            const account = await this.usersCollection.findOne(query);
            let data = {
                authstate: undefined,
                account: undefined
            };
            if(account !== null) {
                if(account["password"] === password) {
                    console.log(Logs.Login);
                    delete account["password"]
                    data.authstate = AuthState.Located;
                    data.account = account;
                    return data;
                } else {
                    console.error(Errors.InvalidPassword);
                    data.authstate = AuthState.InvalidPass;
                    return data;
                }
            } else {
                console.error(Errors.InvalidAccount)
                data.authstate = AuthState.NotLocated;
                return data;
            }
        } finally {
            await this.client.close();
        }
    }

    async userInfo(token: string) {
        try {
            await this.client.connect();
            const payload = decode(token).payload;
            const query = { username: payload["username"] }
            const account = await this.usersCollection.findOne(query);
            if(account) {
                console.log(Logs.DataRetrieval);
                return payload;
            } else {
                console.error(Errors.InvalidAccount);
            }
        } finally {
            await this.client.close();
        }
    }

    async createAccount(username:string, password: string, role: Role, first_name: string,
                        last_name: string, module_list: object, options: object) {
        try {
            await this.client.connect();
            const user = {
                "username": username,
                "password": password,
                "role": role,
                "first_name": first_name,
                "last_name": last_name,
                "module_list": module_list,
                "options": options
            }

            const result = await this.usersCollection.insertOne(user);
            this.resultVerification(result, Logs.AccountCreation, Errors.AccountCreation);
        } finally {
            await this.client.close();
        }
    }

    async storeRefreshToken(token: string, username: string, fingerprint: string) {
        try {
            await this.client.connect();
            const dbStore = {
                "refresh_token": token,
                "username": username,
                "fingerprint": fingerprint
            }

            const result = await this.tokenCollection.insertOne(dbStore);
            this.resultVerification(result, Logs.TokenInsertion, Errors.StoreToken);
        } finally {
            await this.client.close();
        }
    }

    async verifyRefreshToken(token: string, fingerprint: string) {
        try {
            await this.client.connect();
            const payload = await verify(token, process.env.REFRESH_SECRET);
            if(payload === fingerprint) {

                console.log(Logs.TokenVerification);
                return {
                    valid: true,
                    payload: payload
                }
            } else {

                console.error(Errors.TokenVerification);
                return {
                    valid: false
                }
            }

        }catch {

            console.error(Errors.TokenVerification);
            return {
                valid: false
            };
        } finally {
            await this.client.close();
        }
    }

    async getAccountDetailsViaRT(token: string) {
        try {
            await this.client.connect();
            const fingerprint = decode(token).payload;
            const rftokenquery = { fingerprint: fingerprint }
            const rftokendata = await this.tokenCollection.findOne(rftokenquery);
            if(rftokendata == null) {
                console.error(Errors.TokenLocation)
                return;
            }
            console.log(Logs.TokenLocation);
            //this.resultVerification(rftokendata, Logs.TokenLocation, Errors.TokenLocation);
            const userquery = { username: rftokendata["username"] }
            const data = await this.usersCollection.findOne(userquery);
            if(data == null) {
                console.error(Errors.InvalidAccount);
                return
            }
            console.log(Logs.DataRetrieval);
            //this.resultVerification(data, Logs.DataRetrieval, Errors.InvalidAccount);
            delete data["password"];
            console.log(Logs.DataRetrieval);
            return data;
        } finally {
            await this.client.close();
        }
    }

    async deleteRefreshToken(token: string) {
        try {
            await this.client.connect();
            const query = { refresh_token: token }
            const result = await this.tokenCollection.deleteOne(query);
            this.resultVerification(result, Logs.TokenDeletion, Errors.TokenDeletion);
        } finally {
            await this.client.close();
        }
    }

    async verifyUser(username: string): Promise<boolean> {
        try {
            await this.client.connect();
            const query = { username: username };
            const data = await this.usersCollection.findOne(query);
            if(data != null) {
                return true;
            }

            return false;
        } finally {
            await this.client.close();
        }
    }

    async verifyModuleExists(module_name: string): Promise<boolean> {
        try {
            await this.client.connect();
            const query = { name: module_name };
            const data = await this.moduleCollection.findOne(query);
            if(data != null) {
                return true;
            }

            return false;
        } finally {
            await this.client.close();
        }
    }

    async createModule(module_name: string, enrolled: string[], leader: string, timetable: []){
        try {
            await this.client.connect();
            const module = {
                name: module_name,
                enrolled: enrolled,
                leader: leader,
                timetable: timetable
            }

            const data = await this.moduleCollection.insertOne(module);
            
            this.resultVerification(data, Logs.ModuleCreation, Errors.ModuleCreation);
        } finally {
            await this.client.close();
        }
    }

    async loadModules(): Promise<[]> {
        try {
            await this.client.connect();
            const data = await this.moduleCollection.find({}).toArray();
            return data;
        } finally {
            await this.client.close();
        }
    }

    //

    resultVerification(result, log: string, error: string) {
        if(result.acknowledged) {
            console.log(log);
        } else {
            console.error(error);
        }
    }
}