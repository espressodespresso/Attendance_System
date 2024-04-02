import {HomeComponent} from "../components/home/HomeComponent";
import {getPayloadData} from "../services/AuthService";
import {loadModule} from "../services/ModuleService";
import {selectListGroupItemDate, selectListGroupItemString} from "../utils/Utils";
import flatpickr from "flatpickr";

export class HomeLogic {
    private homeModule: HomeComponent = null
    private selectedModule: string = null;
    private selectedDate: Date = null;

    constructor(component: HomeComponent, payload: object) {
        this.homeModule = component;
        const ul = document.getElementById("hullist") as HTMLUListElement;
        const modules = payload["json"]["userinfo"]["module_list"];
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
                    this.selectedModule = selectListGroupItemString(listgroupitem, this.selectedModule);
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
    }

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
                    this.selectedDate = selectListGroupItemDate(listgroupitem, this.selectedDate);
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
        submitButton.addEventListener("click", () => {
            if(this.selectedDate !== null) {
                console.log(this.selectedDate);
                const test = flatpickr.formatDate(this.selectedDate, "d/m/Y");
                console.log(test);
            } else {
                console.error("No date selected");
            }
        });
    }
}