import {UserModComponent} from "../components/modules/UserModComponent";
import {disableSpinner} from "../index";
import {loadModule, userList} from "../services/ModuleService";

export class UserModLogic {
    private _component: UserModComponent = null;

    constructor(component: UserModComponent) {
        this._component = component;
        (async () => {
            await this.initModules();
            disableSpinner();
        })();
    }

    async initModules() {
        const data: object[] = await userList();
        if(data === null) {
            this.noData();
        } else {
            console.log(`length ${data.length}`)
            for(let i = 0; i < data.length; i++) {
                const obj = data[i];
                this.initModuleYear(obj["modules"], `Modules ${obj["name"]}`)
            }
        }
    }

    private initModuleYear(modules: object[], name: string) {
        const row = document.createElement("div");
        row.classList.add("row", "p-3");
        const col = document.createElement('col');
        col.classList.add("col-12", "user-modules", "p-3");
        const h2 = document.createElement("h2");
        h2.textContent = name;
        col.appendChild(h2);
        col.appendChild(this._component.createUnorderedList({
            name: "Module Name",
            semester: "Semester",
            mandatory: "Mandatory Attendance",
            lecturer: "Lecturer Details"
        }, true));
        modules.map(obj => {
            col.appendChild(this._component.createUnorderedList(obj));
        })
        row.appendChild(col);
        this._component.container.appendChild(row);
    }

    private noData() {
        const row = document.createElement("div");
        const col = document.createElement('col');
        col.classList.add("col-12", "p-3");
        const h2 = document.createElement("h2");
        h2.textContent = "No Data";
        col.appendChild(h2);
        row.appendChild(col);
        this._component.container.appendChild(row);
    }
}