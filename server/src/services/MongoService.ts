import {Role} from "../enums/Role.enum";
const { MongoClient } = require("mongodb")
import {decode, verify} from 'hono/jwt'
import {AuthState} from "../enums/AuthState.enum";

export class MongoService {
    //private client = new MongoClient(process.env["MONGOURI "]);
    private client = new MongoClient("");
    private database = this.client.db('database');
    private usersCollection = this.database.collection('users');
    private tokenCollection = this.database.collection('tokens');

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
                    console.log("Details valid");
                    delete account["password"]
                    data.authstate = AuthState.Located;
                    data.account = account;
                    return data;
                } else {
                    console.log("Password invalid");
                    data.authstate = AuthState.InvalidPass;
                    return data;
                }
            } else {
                console.log("Account not found");
                data.authstate = AuthState.NotLocated;
                return data;
            }
        } finally {
            await this.client.close();
        }
    }

    async userInfo(token: string) {
        await this.client.connect();
        const payload = decode(token).payload;
        console.log("payload: " + payload["username"]);
        const query = { username: payload["username"] }
        const account = await this.usersCollection.findOne(query);
        if(account) {
            return payload;
        }

        return null
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
            console.log("Inserted user " + username + "|" + result);
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
            console.log("Inserted token into db | " + result);
        } finally {
            await this.client.close();
        }
    }

    async verifyRefreshToken(token: string, fingerprint: string) {
        try {
            await this.client.connect();
            const payload = await verify(token, process.env.REFRESH_SECRET);
            console.log("payload fingerprint : " + payload)
            console.log("given fingerprint: " + fingerprint);
            if(payload === fingerprint) {

                return {
                    valid: true,
                    payload: payload
                }
            } else {

                return {
                    valid: false
                }
            }

        }catch {

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
            console.log(fingerprint + "HEHE")
            const rftokenquery = { fingerprint: fingerprint }
            const rftokendata = await this.tokenCollection.findOne(rftokenquery);
            console.log(rftokendata);
            const userquery = { username: rftokendata["username"] }
            const data = await this.usersCollection.findOne(userquery);
            console.log(data);
            delete data["password"];
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
            console.log("Deleted refresh token " + token + " | " + result.acknowledged);
        } finally {
            await this.client.close();
        }
    }
}