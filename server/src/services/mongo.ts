const { MongoClient } = require("mongodb")

export enum AuthState {
    Located,
    InvalidPass,
    NotLocated
}

export class Mongo {
    //private client = new MongoClient(process.env["MONGOURI "]);
    private client = new MongoClient("");
    private database = this.client.db('database');
    private usersCollection = this.database.collection('users');

    async login(username: String, password: String) {
        try {
            await this.client.connect();
            const query = { username: username };
            const account = await this.usersCollection.findOne(query);
            if(account !== null) {
                if(account["password"] === password) {
                    console.log("Details valid");
                    return AuthState.Located;
                } else {
                    console.log("Password invalid");
                    return AuthState.InvalidPass;
                }
            } else {
                console.log("Account not found");
                return AuthState.NotLocated;
            }
        } finally {
            await this.client.close();
        }
    }

    async createAccount(username:String, password: String) {
        try {
            await this.client.connect();
            const user = {
                "username": username,
                "password": password
            }

            const result = await this.usersCollection.insertOne(user);
            console.log("Inserted user " + username + "|" + result);
        } finally {
            await this.client.close();
        }
    }
}