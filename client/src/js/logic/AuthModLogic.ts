import {verifyUserExists} from "../services/AuthService";
import {createModule, loadModules} from "../services/ModuleService";
import {AuthorativeModule} from "../components/modules/AuthModComponent";

export class AuthModLogic {
    private authModule = null;
    public selectedModule: string  = null;

    constructor(component: AuthorativeModule) {
        const creatembutton = document.getElementById("creatembutton") as HTMLInputElement;
        creatembutton.addEventListener("click", function () {
            component.createModule();
        });
        const modifymbutton = document.getElementById("modifymbutton") as HTMLInputElement;
        modifymbutton.addEventListener("click", function () {
            component.editModule();
        });
        const deletembutton = document.getElementById("deletembutton") as HTMLInputElement;
        deletembutton.addEventListener("click", function () {
           component.deleteModule();
        });

        this.authModule = component;
    }

    createModule(fp: any) {
        let users: string[] = []
        const addUserButton = document.getElementById("cmadduserbutton");
        addUserButton.addEventListener("click", async function () {
            const addUserTextBox = document.getElementById("cmenrolledinput") as HTMLInputElement;
            let user = addUserTextBox.value;
            if(!users.includes(user)) {
                const userExists = await verifyUserExists(user);
                if(userExists) {
                    users.push(user);
                    const list_group = document.getElementById("ulcmname");
                    if(list_group.innerHTML.includes("None")) {
                        list_group.innerHTML = "";
                    }

                    const listgroupitem = document.createElement("li");
                    listgroupitem.classList.add("list-group-item");
                    listgroupitem.textContent = user;
                    list_group.appendChild(listgroupitem);
                } else {
                    console.error("User does not exist");
                }
            } else {
                console.error("User already added to queue");
            }
        });

        const submitModulebutton = document.getElementById("cmsubmitbutton");
        submitModulebutton.addEventListener("click", async function () {
            const nameTextBox = document.getElementById("cmnameinput") as HTMLInputElement;
            const leaderTextBox = document.getElementById("cmleaderinput") as HTMLInputElement;
            let module = {
                name: nameTextBox.value,
                enrolled: users,
                leader: leaderTextBox.value,
                timetable: fp.selectedDates
            };
            await createModule(module);
        });
    }

    async getModules() {
        const data = await loadModules();
        const listgroup = document.getElementById("selmodul");
        if(data.length > 0) {
            listgroup.innerHTML = "";
        }
        for(let i = 0; i < data.length; i++) {
            const moduleData = data[i];
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

        const cmsubmitbuttom = document.getElementById("cmsubmitbutton");
        cmsubmitbuttom.addEventListener("click", () => {

        });
    }

    editModule(fp: any) {

    }

}