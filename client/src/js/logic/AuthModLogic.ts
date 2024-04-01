import {verifyUserExists} from "../services/AuthService";
import {createModule, deleteModule, loadModules, updateModule} from "../services/ModuleService";
import {AuthorativeModule} from "../components/modules/AuthModComponent";
import {ModuleAction} from "../enums/ModuleAction.enum";

export class AuthModLogic {
    private authModule: AuthorativeModule = null;
    private selectedModule: string  = null;
    private loadedModules: object[] = null;

    constructor(component: AuthorativeModule) {
        const creatembutton = document.getElementById("creatembutton") as HTMLInputElement;
        creatembutton.addEventListener("click", function () {
            component.createModule();
        });
        const modifymbutton = document.getElementById("modifymbutton") as HTMLInputElement;
        modifymbutton.addEventListener("click", function () {
            component.selectExistingModule("Modify an existing module", "Select Module", ModuleAction.Modify);
        });
        const deletembutton = document.getElementById("deletembutton") as HTMLInputElement;
        deletembutton.addEventListener("click", function () {
            component.selectExistingModule("Delete an existing module", "Select Module", ModuleAction.Delete);
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

    async getModules(action: ModuleAction) {
        this.loadedModules = await loadModules();
        const listgroup = document.getElementById("selmodul");
        if(this.loadedModules.length > 0) {
            listgroup.innerHTML = "";
        }
        for(let i = 0; i < this.loadedModules.length; i++) {
            const moduleData = this.loadedModules[i];
            const moduleName: string = moduleData["name"];
            const listgroupitem = document.createElement("li");
            listgroupitem.classList.add("list-group-item");
            listgroupitem.textContent = moduleName;
            const idName = moduleName.split(" ").join("");
            listgroupitem.id = idName;
            listgroupitem.addEventListener("click", () => {
                if(this.selectedModule === null) {
                    listgroupitem.classList.add("list-group-item-dark");
                    this.selectedModule = listgroupitem.textContent;
                } else if(listgroupitem.textContent === this.selectedModule) {
                    listgroupitem.classList.remove("list-group-item-dark");
                    this.selectedModule = null;
                } else {
                    const selected = document.getElementById(this.selectedModule.split(" ").join(""));
                    selected.classList.remove("list-group-item-dark");
                    listgroupitem.classList.add("list-group-item-dark");
                    this.selectedModule = listgroupitem.textContent;
                }
            });
            listgroup.appendChild(listgroupitem);
        }

        const submitbuttom = document.getElementById("smsubmitbutton");
        submitbuttom.addEventListener("click", () => {
            let module: object = null;
            for(let i = 0; i < this.loadedModules.length; i++) {
                const moduleData = this.loadedModules[i];
                if(moduleData["name"] === this.selectedModule) {
                    module = moduleData;
                    break;
                }
            }

            if(module === null) {
                console.error("No module selected");
            } else {
                switch (action) {
                    case ModuleAction.Modify:
                        this.authModule.editModule(module);
                        break;
                    case ModuleAction.Delete:
                        this.authModule.deleteModule(module);
                        break;
                }
            }
        });
    }

    editModule(fp: any, module: object) {
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