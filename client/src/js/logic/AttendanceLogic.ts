import {attendActiveAttendance, generateAttendanceCode, terminateAttendanceCode} from "../services/AttendanceService";
import {loadModule, loadModules} from "../services/ModuleService";
import {AttendanceComponent} from "../components/AttendanceComponent";
import {Role} from "../enums/Role.enum";
import {Utils} from "../utils/Utils";
import {ModuleAction} from "../enums/ModuleAction.enum";

export class AttendanceLogic {
    private attendanceComponent: AttendanceComponent = null;
    selectedModule: string = null;
    private selectedDate: Date = null;
    private utils: Utils = null;

    constructor(component: AttendanceComponent) {
        this.attendanceComponent = component;
        this.utils = new Utils();
    }

    async attendanceAuthCodeComponent(module_name: string, date: Date) {
        const codeh3 = document.getElementById("attendanceCode");
        const code = await generateAttendanceCode(module_name, date);
        codeh3.textContent = code.toString();

        window.addEventListener('beforeunload', async function (e) {
            e.preventDefault();
            console.log(await terminateAttendanceCode(code))
            e.returnValue = null;
        })
    }

    attendanceUserCodeComponent() {
        const submit = document.getElementById("uasubmit");
        submit.addEventListener("click", async () => {
            const codeInput = document.getElementById("codeInput") as HTMLInputElement;
            const code = codeInput.value;
            if(code !== "") {
                const data = await attendActiveAttendance(parseInt(code));
                console.log(data["json"]);
            }
        })
    }

    displayModules(payload: object) {
        const ul = document.getElementById("hullist") as HTMLUListElement;
        const userInfo = payload["json"]["userinfo"];
        let modules = userInfo["module_list"];
        loadModules().then(result => {
            switch (userInfo["role"]) {
                case Role.IT:
                case Role.AdministrativeFM:
                    let globalModules: string[] = [];
                    result.map((module) => {
                        globalModules.push(module["name"]);
                    })
                    modules = globalModules;
                    break;
            }

            if(modules.length > 0) {
                ul.innerHTML = "";
                for(let i = 0; i < modules.length; i++) {
                    const moduleName = modules[i];
                    const listgroupitem = document.createElement("li");
                    listgroupitem.classList.add("list-group-item");
                    listgroupitem.textContent = moduleName;
                    const idName = moduleName.split(" ").join("");
                    listgroupitem.id = idName;
                    listgroupitem.addEventListener("click", () => {
                        this.selectedModule = this.utils.selectListGroupItemString(listgroupitem, this.selectedModule);
                    })
                    ul.appendChild(listgroupitem);
                }

                const submitButton = document.getElementById("hsubmitbutton");
                submitButton.addEventListener("click", async () => {
                    if(this.selectedModule !== null) {
                        await this.selectDate(this.selectedModule);
                    } else {
                        console.error("No module selected");
                    }
                })
            }
        }).catch((e) => {
            console.error("Contact System Administrator \n" + e);
        });
    }

    submitModuleButton(utils: Utils, modules?: object[], action?: ModuleAction, component?: AttendanceLogic) {
        const submitButton = document.getElementById("smsubmitbutton");
        submitButton.addEventListener("click", async () => {
            if(component.selectedModule !== null) {
                await component.selectDate(component.selectedModule);
            } else {
                console.error("No module selected");
            }
        })
    };

    async selectDate(moduleName: string) {
        const data = await loadModule(moduleName);
        const h2 = document.getElementById("hh2");
        h2.textContent = moduleName + " : Select a Date";
        const ul = document.getElementById("hullist") as HTMLUListElement;
        const timetable: [] = data["timetable"];
        ul.innerHTML = "";

        if(timetable.length > 0) {
            for(let i = 0; i < timetable.length; i++) {
                const date = new Date(timetable[i]);
                const listgroupitem = document.createElement("li");
                listgroupitem.classList.add("list-group-item");
                listgroupitem.textContent = date.toString();
                listgroupitem.id = date.toString().split(" ").join("");
                listgroupitem.addEventListener("click", async () => {
                    //this.selectedDate = selectListGroupItem(listgroupitem, this.selectedDate)
                    //this.selectedDate = new Date(timetable[i])
                    this.selectedDate = this.utils.selectListGroupItemDate(listgroupitem, this.selectedDate);
                });
                ul.appendChild(listgroupitem);
            }
        } else {
            const listgroupitem = document.createElement("li");
            listgroupitem.classList.add("list-group-item");
            listgroupitem.textContent = "None";
            ul.appendChild(listgroupitem);
        }

        const submitButton = document.getElementById("hsubmitbutton");
        submitButton.textContent = "Select Date";
        submitButton.addEventListener("click", async () => {
            if(this.selectedDate !== null) {
                //console.log(this.selectedDate);
                //const test = flatpickr.formatDate(this.selectedDate, "d/m/Y");
                //console.log(test);
                await this.attendanceComponent.authAttendanceCodeComponent(moduleName, this.selectedDate);
            } else {
                console.error("No date selected");
            }
        });
    }
}