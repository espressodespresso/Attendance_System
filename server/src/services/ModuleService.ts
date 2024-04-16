import {MongoService} from "./MongoService";
import {AccountService} from "./AccountService";
import {Collection} from "../enums/Collection.enum";
import {Logs} from "../utilities/Logs";
import {Errors} from "../utilities/Errors";
import {Utils} from "../utilities/Utils";

export class ModuleService {
    private _accountService: AccountService = null;
    private _mongoService: MongoService = null;

    constructor() {
        this._accountService = new AccountService();
        this._mongoService = new MongoService();

    }

    async updateUsersModules(addUsers: string[], removeUsers: string[], moduleName: string) {
        //const leaderDetails = await mongo.userInfoUsername(moduleLeader);
        // await mongo.updateUser(moduleLeader, )

        const length = addUsers.length + removeUsers.length;
        let success = 0;
        for(let i = 0; i < length; i++) {
            let username: string = null;
            if(i+1 === addUsers.length+1) {
                username = removeUsers[i-addUsers.length]
            } else {
                username = addUsers[i];
            }

            const userDetails = await this._accountService.getUserInfobyUsername(username);
            const moduleArray: string[] = userDetails["module_list"];

            if(i+1 === addUsers.length+1) {
                moduleArray.splice(moduleArray.indexOf(moduleName), 1);
            } else {
                moduleArray.push(moduleName);
            }

            const update = {
                $set: {
                    module_list: moduleArray
                },
            };
            if(await this._accountService.updateUser(username, update)) {
                success++;
            }
        }

        if(success === length) {
            return true;
        }

        return false;
    }

    async verifyModuleExists(module_name: string): Promise<boolean> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            return await this._mongoService.findOne(query, Collection.module);
        });

        return response["status"];
    }

    async createModule(module_name: string, enrolled: string[], leader: string, timetable: []) {
        const data = {
            name: module_name,
            enrolled: enrolled,
            leader: leader,
            timetable: timetable
        };

        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            return await this._mongoService.insertOne(data, Collection.module);
        });

        if(response["status"]) {
            console.log(Logs.ModuleCreation);
        } else {
            console.error(Errors.ModuleCreation);
        }
    }

    async loadModules(): Promise<[]> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            return await this._mongoService.findall(Collection.module);
        });

        return response["result"];
    }

    async loadModule(module_name: string) {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            return await this._mongoService.findOne(query, Collection.module);
        });

        return response["result"];
    }

    async updateModule(module_name: string, module: object) {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            return await this._mongoService.replaceOne(query, module, Collection.module);
        });

        if(response["status"]) {
            console.log(Logs.ModuleUpdate);
        } else {
            console.error(Errors.CodeError);
        }
    }

    async deleteModule(module_name: string): Promise<boolean> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            return await this._mongoService.deleteOne(query, Collection.module);
        });

        return response["status"];
    }
}