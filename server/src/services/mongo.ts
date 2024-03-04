import {Role} from "../routes/account";

const { MongoClient } = require("mongodb")
import { decode } from 'hono/jwt'

export enum AuthState {
    Located,
    InvalidPass,
    NotLocated
}

export class Mongo {
    //private client = new MongoClient(process.env["MONGOURI "]);
    private client = new MongoClient();
    private database = this.client.db('database');
    private usersCollection = this.database.collection('users');

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
}