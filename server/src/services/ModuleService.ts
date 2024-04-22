import {Collection} from "../enums/Collection.enum";
import {ServiceFactory} from "./ServiceFactory";
import {IAccountService} from "./AccountService";
import {MessageUtility} from "../utilities/MessageUtility";
import {IMongoService} from "./MongoService";

export interface IModuleService {
    listModules(userInfo: object): Promise<object[]>;
    updateUsersModuleName(oldName: string, newName: string): Promise<void>;
    updateUsersModules(addUsers: string[], removeUsers: string[], moduleName: string): Promise<boolean>;
    verifyModuleExists(module_name: string): Promise<boolean>;
    createModule(module_name: string, enrolled: string[], leader: string, timetable: []): Promise<void>;
    loadModules(): Promise<[]>;
    loadModule(module_name: string): Promise<object>;
    updateModule(module_name: string, module: object): Promise<void>;
    deleteModule(module_name: string): Promise<boolean>;
}

export class ModuleService implements IModuleService {
    private _accountService: IAccountService = null;
    private _mongoService: IMongoService = null;
    private _messageUtility: MessageUtility = null;

    constructor() {
        this._accountService = ServiceFactory.createAccountService();
        this._mongoService = ServiceFactory.createMongoService();
        this._messageUtility = MessageUtility.getInstance();
    }

    async listModules(userInfo: object): Promise<object[]> {
        const module_list: string[] = userInfo["module_list"];
        if(module_list.length === 0) {
            return null;
        } else {
            let modules: object[] = [];
            for(let i = 0; i < module_list.length; i++) {
                const moduleObj = await this.loadModule(module_list[i]);
                const timetable: Date[] = moduleObj["timetable"];
                const firstDate: Date = new Date(timetable[0]);
                const dateMonth = firstDate.getMonth()+1;
                const dateYear = firstDate.getFullYear();
                const dateYearString = dateYear.toString();
                let moduleYear: string = "";
                let semester: string = "";
                if(dateMonth >= 9) {
                    semester = "Semester 1";
                    moduleYear = `${dateYearString[2]}${dateYearString[3]} / ${dateYearString[2]}${parseInt(dateYearString[3])+1}`
                } else {
                    moduleYear = `${dateYearString[2]}${parseInt(dateYearString[3])-1} / ${dateYearString[2]}${dateYearString[3]}`
                    if(dateMonth <= 5) {
                        semester = "Semester 2";
                    } else {
                        semester = "Semester 3";
                    }
                }

                const leaderInfo = await this._accountService.getUserInfobyUsername(moduleObj["leader"]);
                const data = {
                    name: moduleObj["name"],
                    semester: semester,
                    mandatory: "true",
                    lecturer: `${leaderInfo["first_name"]}, ${leaderInfo["last_name"][0]} | ${leaderInfo["username"]}@hallam.shu.ac.uk`,
                }

                if(modules.length === 0) {
                    modules.push({
                        name: moduleYear,
                        modules: [data]
                    })
                } else {
                    let notFound: boolean = true;
                    for(let i = 0; i < modules.length; i++) {
                        const obj: object = modules[i];
                        if(obj["name"] === moduleYear) {
                            (obj["modules"] as object[]).push(data);
                            notFound = false;
                        }
                    }

                    if(notFound) {
                        modules.push({
                            name: moduleYear,
                            modules: [data]
                        })
                    }
                }
            }

            return modules;
        }
    }

    async updateUsersModuleName(oldName: string, newName: string): Promise<void> {
        const moduleData: object = await this.loadModule(newName)
        const enrolled: string[] = moduleData["enrolled"];
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            for(let i = 0; i < enrolled.length; i++) {
                await this.updateModuleName(enrolled[i], oldName, newName);
            }

            await this.updateModuleName(moduleData["leader"], oldName, newName);

            const query  = { module: oldName };
            const update = {
                $set: {
                    module: newName
                }
            }
            return await this._mongoService.updateMany(query, update, Collection.attendance);
        });

        if(response["status"]) {
            console.log(this._messageUtility.logs.ModuleUpdateDB);
        }
    }

    private async updateModuleName(username: string, oldName: string, newName: string): Promise<void> {
        const userQuery = { username: username };
        const userResponse: object = await this._mongoService.findOne(userQuery, Collection.users);
        const userData: object = userResponse["result"];
        const moduleList: string[] = userData["module_list"];
        moduleList[moduleList.indexOf(oldName)] = newName;
        const update = {
            $set: {
                module_list: moduleList
            },
        };

        const response: object = await this._mongoService.updateOne(userQuery, update, Collection.users);
    }

    async updateUsersModules(addUsers: string[], removeUsers: string[], moduleName: string): Promise<boolean> {
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

    async createModule(module_name: string, enrolled: string[], leader: string, timetable: []): Promise<void> {
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
            console.log(this._messageUtility.logs.ModuleCreation);
        } else {
            console.error(this._messageUtility.errors.ModuleCreation);
        }
    }

    async loadModules(): Promise<[]> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            return await this._mongoService.findall(Collection.module);
        });

        return response["result"];
    }

    async loadModule(module_name: string): Promise<object> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            return await this._mongoService.findOne(query, Collection.module);
        });

        return response["result"];
    }

    async updateModule(module_name: string, module: object): Promise<void> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            return await this._mongoService.replaceOne(query, module, Collection.module);
        });

        if(response["status"]) {
            console.log(this._messageUtility.logs.ModuleUpdate);
        } else {
            console.error(this._messageUtility.errors.CodeError);
        }
    }

    async deleteModule(module_name: string): Promise<boolean> {
        const response: object = await this._mongoService.handleConnection
        (async (): Promise<object> => {
            const query = { name: module_name };
            const response: object = await this._mongoService.findOne(query, Collection.module);
            const data: object = response["result"];
            const enrolledUsers: string[] = data["enrolled"];
            for(let i = 0; i < enrolledUsers.length; i++) {
                const username: string = enrolledUsers[i];
                await this.deleteUserAssoToModule(username, module_name);
            }

            const leader: string = data["leader"];
            await this.deleteUserAssoToModule(leader, module_name);
            return await this._mongoService.deleteOne(query, Collection.module);
        });

        return response["status"];
    }

    private async deleteUserAssoToModule(username: string, module_name: string): Promise<boolean> {
        const userQuery = { username: username };
        const userResponse: object = await this._mongoService.findOne(userQuery, Collection.users);
        const userData: object = userResponse["result"];
        const moduleList: string[] = userData["module_list"];
        moduleList.splice(moduleList.indexOf(module_name), 1);
        const update = {
            $set: {
                module_list: moduleList
            },
        };

        const response: object = await this._mongoService.updateOne(userQuery, update, Collection.users);
        return response["status"]
    }
}