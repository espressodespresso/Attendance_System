import {Role} from "../enums/Role.enum";
import {decode, verify} from 'hono/jwt'
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";
import {generateCode, updateUserAttendance} from "./AttendanceService";
import {Collection} from "../enums/Collection.enum";
import {AuthState} from "../enums/AuthState.enum";

const { MongoClient } = require("mongodb")

export class MongoService {
    //private client = new MongoClient(process.env["MONGOURI "]);
    private client = new MongoClient("");
    private database = this.client.db('database');
    private usersCollection = this.database.collection('users');
    private tokenCollection = this.database.collection('tokens');
    private moduleCollection = this.database.collection('module');
    private attendanceCollection = this.database.collection('attendance');

    async findOne(query: object, collection: Collection) {
        const result = await this.getCollection(collection).findOne(query);
        if(result === null) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async insertOne(data: object, collection: Collection) {
        const result = await this.getCollection(collection).insertOne(data);
        if(!result.acknowledged) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async deleteOne(query: object, collection: Collection) {
        const result = await this.getCollection(collection).deleteOne(query);
        if(result.deletedCount !== 1) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async updateOne(query: object, collection: Collection) {
        const result = await this.getCollection(collection).updateOne(query);
        if(result.modifiedCount !== 1) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async replaceOne(query: object, collection: Collection) {
        const result = await this.getCollection(collection).replaceOne(query);
        if(!result.acknowledged) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    private objResponse(status: boolean, result: any): object {
        return {
            status: status,
            result: result
        }
    }

    private getCollection(collection: Collection) {
        switch (collection) {
            case Collection.users:
                return this.usersCollection;
            case Collection.token:
                return this.tokenCollection;
            case Collection.module:
                return this.moduleCollection;
            case Collection.attendance:
                return this.attendanceCollection;
        }
    }

    private async handleConnection(innerFunc: (...args: any[]) => any) {
        try {
            await this.client.connect();
            innerFunc();
        } catch (e) {
            console.log(e);
        } finally {
            await this.client.close();
        }
    }

    async login(username: string, password: string) {
        const query = { username: username };
        const data = await this.findOne(query, Collection.users);
        let obj = {
            authstate: undefined,
            account: undefined
        };
        if(data["status"]) {
            let account = data["result"];
            if(account["password"] === password) {
                console.log(Logs.Login);
                delete account["password"]
                obj.authstate = AuthState.Located;
                obj.account = account;
                return obj;
            } else {
                console.error(Errors.InvalidPassword);
                obj.authstate = AuthState.InvalidPass;
                return obj;
            }
        } else {
            console.error(Errors.InvalidAccount)
            obj.authstate = AuthState.NotLocated;
            return obj;
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

    async userInfoUsername(username: string) {
        try {
            await this.client.connect();
            const query = { username: username }
            const account = await this.usersCollection.findOne(query);
            if(account) {
                console.log(Logs.DataRetrieval);
                return account;
            } else {
                console.error(Errors.InvalidAccount);
            }
        } finally {
            await this.client.close();
        }
    }

    async createAccount(username:string, password: string, role: Role, first_name: string,
                        last_name: string, module_list: string[], options: object) {
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

    async updateUser(username: string, update: object): Promise<boolean> {
        try {
            await this.client.connect();
            const query = { username: username };
            const data = await this.usersCollection.updateOne(query, update);
            this.resultVerification(data, Logs.AccountUpdate, Errors.NoAccount);
            if(data.modifiedCount === 1) {
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

    async loadModule(module_name: string) {
        try {
            await this.client.connect();
            const query = { name: module_name };
            const data = await this.moduleCollection.findOne(query);
            if(data != null) {
                return data;
            }

            return null;
        } finally {
            await this.client.close();
        }
    }

    async updateModule(module_name: string, module: object) {
        try {
            await this.client.connect();
            const query = { name: module_name };
            const data = await this.moduleCollection.replaceOne(query, module);
            this.resultVerification(data, Logs.ModuleUpdate, Errors.CodeError);
        } finally {
            await this.client.close();
        }
    }

    async deleteModule(module_name: string): Promise<boolean> {
        try {
            await this.client.connect();
            const query = { name: module_name };
            const data = await this.moduleCollection.deleteOne(query);
            if(data.deletedCount === 1) {
                return true;
            }

            return false;
        } finally {
            await this.client.close()
        }
    }

    //

    // Only to be used within another mongo function
    private async locateActiveCode(code: number): Promise<object> {
        const query = { active_code: code };
        const data = await this.attendanceCollection.findOne(query);
        console.log("found data " + data);
        if(data != null) {
            return data;
        }

        return null;
    }

    async generateAttendanceCode(module_name: string, date: Date): Promise<number> {
        try {
            await this.client.connect();
            const attended: string[] = [];
            let code: number = null;
            while(code === null) {
                let temp = generateCode();
                if(await this.locateActiveCode(temp) === null) {
                    code = temp;
                }
            }

            console.log("Code Generated - " + code);
            const attendance = {
                active_code: code.toString(),
                module: module_name,
                date: new Date(date).toISOString(),
                attended: attended
            }
            const data = await this.attendanceCollection.insertOne(attendance);
            this.resultVerification(data, Logs.CodeGenerated, Errors.CodeGenerated);
            return code;
        } finally {
            await this.client.close();
        }
    }

    async terminateActiveAttendance(active_code: number): Promise<boolean> {
        try {
            await this.client.connect();
            const prevdata: object = await this.locateActiveCode(active_code);
            if(prevdata !== null) {
                const attended = prevdata["attended"];
                console.log(attended);
                const attendance = {
                    used_code: active_code.toString(),
                    module: prevdata["module"],
                    date: prevdata["date"],
                    attended: attended
                }
                const query = { active_code: active_code }
                const data = await this.attendanceCollection.replaceOne(query, attendance);
                this.resultVerification(data, Logs.CodeTerminated, Errors.CodeTerminated);
                return true;
            }

            return false;
        } finally {
            await this.client.close();
        }
    }

    async attendActiveAttendance(active_code: number, username: string): Promise<object> {
        try {
            await this.client.connect();
            const attendanceData: object = await this.locateActiveCode(active_code);
            if(attendanceData !== null) {
                const moduleName = attendanceData["module"];
                const moduleData = await this.loadModule(moduleName);
                if((moduleData["enrolled"] as string[]).includes(username)) {
                    const attended: string[] = attendanceData["attended"];
                    if(!attended.includes(username)) {
                        attended.push(username);
                        const update = {
                            $set: {
                                attended: attended
                            },
                        };
                        const query = { active_code: active_code.toString() };
                        // Needed for some reason, assuming it times out after loadmodule?
                        await this.client.connect();
                        const data = await this.attendanceCollection.updateOne(query, update);
                        if(data.modifiedCount === 1) {
                            const userData = await this.userInfoUsername(username);
                            const attendance: object[] = userData["attended"];
                            if(await updateUserAttendance(username, attendance, moduleName, attendanceData["date"])) {
                                return this.aaaObjectReturn(true, Logs.UserAttended);
                            }
                            return this.aaaObjectReturn(false, Errors.UserUpdateAttendance);
                        }
                        return this.aaaObjectReturn(false, Errors.AttendanceModification);
                    } else {
                        return this.aaaObjectReturn(false, Errors.AttendedPreviously);
                    }
                } else {
                    return this.aaaObjectReturn(false, Errors.NotEnrolled);
                }
            }

            return this.aaaObjectReturn(false, Errors.NoAttendanceCode);
        } finally {
            await this.client.close();
        }
    }

    private aaaObjectReturn(status: boolean, message: string) {
        return {
            status: status,
            message: message
        };
    }

    async locateAttended(module_name: string, date: Date): Promise<object> {
        try {
            await this.client.connect();
            const query = {
                module: module_name,
                date: new Date(date).toISOString()
            };
            const data = this.attendanceCollection.findOne(query);
            if(data != null) {
                return data;
            }

            return null;
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