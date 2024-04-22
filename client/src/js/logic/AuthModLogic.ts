import {IAuthService} from "../services/AuthService";
import {IModuleService} from "../services/ModuleService";
import {IAuthModComponent} from "../components/modules/AuthModComponent";
import {ModuleAction} from "../enums/ModuleAction.enum";
import {disableSpinner} from "../index";
import {Alert} from "../enums/Alert.enum";
import {ServiceFactory} from "../services/ServiceFactory";
import {GeneralUtility} from "../utilities/GeneralUtility";

export interface IAuthModLogic {
    createModule(fp: any): void;
    submitButton(utils: GeneralUtility, modules: object[], action: ModuleAction, component: IAuthModComponent): void;
    editModule(fp: any, module: object): void;
    deleteModule(fp: any, module: object): void;
    dashboardModule(): void;
}

export class AuthModLogic implements IAuthModLogic {
    private _authModule: IAuthModComponent = null;
    private _utils: GeneralUtility = null;
    private _moduleService: IModuleService = null;
    private _authService: IAuthService = null;

    constructor(component: IAuthModComponent, payload: object) {
        this._authModule = component;
        this._utils = GeneralUtility.getInstance();
        this._moduleService = ServiceFactory.createModuleService();
        this._authService = ServiceFactory.createAuthService();

        const creatembutton = document.getElementById("creatembutton") as HTMLInputElement;
        creatembutton.addEventListener("click", function () {
            component.createModule();
        });
        const modifymbutton = document.getElementById("modifymbutton") as HTMLInputElement;
        modifymbutton.addEventListener("click", async function () {
            await component.selectExistingModule("Modify an existing module", "Select Module", ModuleAction.Modify, payload);
        });
        const deletembutton = document.getElementById("deletembutton") as HTMLInputElement;
        deletembutton.addEventListener("click", async function () {
            await component.selectExistingModule("Delete an existing module", "Select Module", ModuleAction.Delete, payload);
        });

        disableSpinner();
    }

    private async enrollUsers(users: string[]) {
        const addUserTextBox = document.getElementById("mnenrolledinput") as HTMLInputElement;
        let user = addUserTextBox.value;
        if(!users.includes(user)) {
            const userExists = await this._authService.verifyUserExists(user);
            if(userExists) {
                users.push(user);
                const list_group = document.getElementById("mnulname");
                if(list_group.innerHTML.includes("None")) {
                    list_group.innerHTML = "";
                }

                const listgroupitem = document.createElement("li");
                listgroupitem.classList.add("list-group-item");
                listgroupitem.textContent = user;
                listgroupitem.addEventListener("dblclick", async () => {
                    users.splice(users.indexOf(user));
                    listgroupitem.parentNode.removeChild(listgroupitem);
                });
                list_group.appendChild(listgroupitem);
                addUserTextBox.value = "";
            } else {
                console.error("User does not exist");
            }
        } else {
            console.error("User already added to queue");
        }
    }

    createModule(fp: any): void {
        let users: string[] = []
        const addUserButton = document.getElementById("mnadduserbutton");
        addUserButton.addEventListener("click", async () => {
            await this.enrollUsers(users);
        });

        const submitModulebutton = document.getElementById("mnsubmitbutton");
        submitModulebutton.addEventListener("click", async () => {
            const nameTextBox = document.getElementById("mnnameinput") as HTMLInputElement;
            const leaderTextBox = document.getElementById("mnleaderinput") as HTMLInputElement;
            let module = {
                name: nameTextBox.value,
                enrolled: users,
                leader: leaderTextBox.value,
                timetable: fp.selectedDates
            };
            if(await this._moduleService.createModule(module)) {
                this._utils.generateAlert("Module created successfully.", Alert.Success);
                this._authModule.dashboardModule();
            } else {
                this._utils.generateAlert("", Alert.Danger);
            }
        });
    }

    submitButton(utils: GeneralUtility, modules: object[], action: ModuleAction, component: IAuthModComponent): void {
        // utilities: GeneralUtility, modules: object[], action?: ModuleAction, component?: AuthorativeModule
        const submitbuttom = document.getElementById("smsubmitbutton");
        submitbuttom.addEventListener("click", () => {
            let module: object = null;
            for(let i = 0; i < modules.length; i++) {
                const moduleData = modules[i];
                if(moduleData["name"] === utils.selectedModule) {
                    module = moduleData;
                    break;
                }
            }

            if(module === null) {
                this._utils.generateAlert("No module is selected to continue.", Alert.Warning);
            } else {
                switch (action) {
                    case ModuleAction.Modify:
                        component.editModule(module);
                        break;
                    case ModuleAction.Delete:
                        component.deleteModule(module);
                        break;
                }
            }
        });
    }

    editModule(fp: any, module: object): void {
        const nameinput = document.getElementById("mnnameinput") as HTMLInputElement;
        nameinput.value = module["name"];
        const ulname = document.getElementById("mnulname");
        ulname.innerHTML = "";
        const users: string[] = module["enrolled"]
        for(let i = 0; i < users.length; i++) {
            const listgroupitem = document.createElement("li");
            listgroupitem.classList.add("list-group-item");
            const username = users[i];
            listgroupitem.textContent = username;
            listgroupitem.addEventListener("dblclick", async () => {
                users.splice(users.indexOf(username));
                listgroupitem.parentNode.removeChild(listgroupitem);
            });
            ulname.appendChild(listgroupitem);
        }

        const leaderinput = document.getElementById("mnleaderinput") as HTMLInputElement;
        leaderinput.value = module["leader"];
        fp.setDate(module["timetable"]);

        const addUserButton = document.getElementById("mnadduserbutton");
        addUserButton.addEventListener("click", async () => {
            await this.enrollUsers(users);
        });

        const submitbuttom = document.getElementById("mnsubmitbutton");
        submitbuttom.addEventListener("click", async () => {
            let newModule = {
                name: nameinput.value,
                enrolled: users,
                leader: leaderinput.value,
                timetable: fp.selectedDates
            };
            if(await this._authService.verifyUserExists(newModule["leader"])) {
                try {
                    await this._moduleService.updateModule(module["name"], newModule);
                } catch {
                    this._utils.generateAlert("", Alert.Danger);
                } finally {
                    this._utils.generateAlert("Module modifications successful.", Alert.Success);
                    this._authModule.dashboardModule();
                }
            } else {
                this._utils.generateAlert("Leader username entered does not exist.", Alert.Warning);
            }

        });
    }

    deleteModule(fp: any, module: object): void {
        let enrolledArray = module["enrolled"];
        const enrolledul = document.getElementById("denrolledul");
        enrolledul.innerHTML = "";
        for(let i = 0; i < enrolledArray.length; i++) {
            const user = enrolledArray[i];
            const enrolledli = document.createElement("li");
            enrolledli.classList.add("list-group-item");
            enrolledli.textContent = user;
            enrolledul.appendChild(enrolledli);
        }

        fp.setDate(module["timetable"]);
        const deleteButton = document.getElementById("dbutton");
        deleteButton.addEventListener("click", async () => {
            if(await this._moduleService.deleteModule(module["name"])) {
                this._utils.generateAlert("Module successfully deleted.", Alert.Success);
                this._authModule.dashboardModule();
            } else {
                this._utils.generateAlert("", Alert.Danger);
            }
        });
    }

    dashboardModule(): void {
        const dashboardmbutton = document.getElementById("dashboardmbutton");
        dashboardmbutton.addEventListener("click", () => {
            this._authModule.dashboardModule();
        });
        (async () => {
            const container: HTMLElement = this._authModule.getModuleForm()
            const title = document.createElement("h2");
            title.textContent = "Dashboard";
            container.appendChild(title);
            this._utils.generateLocalSpinner(container);
            await this._utils.initModuleList(container);
            this._utils.terminateLocalSpinner();
        })();
    }
}