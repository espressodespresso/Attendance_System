import {verifyUserExists} from "../services/AuthService";
import {createModule, deleteModule, loadModule, loadModules, updateModule} from "../services/ModuleService";
import {AuthorativeModule} from "../components/modules/AuthModComponent";
import {ModuleAction} from "../enums/ModuleAction.enum";
import {Role} from "../enums/Role.enum";
import {Utils} from "../utils/Utils";

export class AuthModLogic {
    private authModule: AuthorativeModule = null;

    constructor(component: AuthorativeModule, payload: object) {
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

        this.authModule = component;
    }

    private async enrollUsers(users: string[]) {
        const addUserTextBox = document.getElementById("mnenrolledinput") as HTMLInputElement;
        let user = addUserTextBox.value;
        if(!users.includes(user)) {
            const userExists = await verifyUserExists(user);
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

    createModule(fp: any) {
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
            if(await createModule(module)) {
                this.authModule.dashboardModule();
            }
        });
    }

    submitButton(utils: Utils, modules: object[], action: ModuleAction, component: AuthorativeModule) {
        // utils: Utils, modules: object[], action?: ModuleAction, component?: AuthorativeModule
        const submitbuttom = document.getElementById("smsubmitbutton");
        submitbuttom.addEventListener("click", () => {
            console.log("here " + utils.selectedModule);
            let module: object = null;
            for(let i = 0; i < modules.length; i++) {
                const moduleData = modules[i];
                console.log(moduleData);
                if(moduleData["name"] === utils.selectedModule) {
                    module = moduleData;
                    console.log("set module " + moduleData["name"]);
                    break;
                }
            }

            if(module === null) {
                console.error("No module selected");
            } else {
                switch (action) {
                    case ModuleAction.Modify:
                        console.log(module);
                        component.editModule(module);
                        break;
                    case ModuleAction.Delete:
                        console.log(module);
                        component.deleteModule(module);
                        break;
                }
            }
        });
    }

    editModule(fp: any, module: object) {
        const nameinput = document.getElementById("mnnameinput") as HTMLInputElement;
        console.log(module);
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
            let module = {
                name: nameinput.value,
                enrolled: users,
                leader: leaderinput.value,
                timetable: fp.selectedDates
            };
            if(await verifyUserExists(module["leader"])) {
                try{
                    await updateModule(module["name"], module);
                } finally {
                    this.authModule.dashboardModule();
                }
            } else {
                console.error("Leader username entered does not exist")
            }

        });
    }

    deleteModule(fp: any, module: object) {
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
            if(await deleteModule(module["name"])) {
                this.authModule.dashboardModule();
            }
        });
    }

    dashboardModule() {
        const dashboardmbutton = document.getElementById("dashboardmbutton");
        dashboardmbutton.addEventListener("click", () => {
            this.authModule.dashboardModule();
        })
    }
}