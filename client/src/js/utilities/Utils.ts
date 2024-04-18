import {Role} from "../enums/Role.enum";
import {loadModule, loadModules} from "../services/ModuleService";
import {ModuleAction} from "../enums/ModuleAction.enum";
import {AuthModLogic} from "../logic/AuthModLogic";
import {AuthorativeModule} from "../components/modules/AuthModComponent";
import {AttendanceComponent} from "../components/AttendanceComponent";
import {AttendanceLogic} from "../logic/AttendanceLogic";
import {Alert} from "../enums/Alert.enum";

export class Utils {
    private _selectedModule: string = null;

    get selectedModule() {
        return this._selectedModule;
    }

    generateAlert(message: string, type: Alert) {
        let localMessage: string = message;
        const alert = document.createElement("div");
        alert.classList.add("alert", "w-25");
        alert.role = "alert";
        const span = document.createElement("span");
        const strong = document.createElement("strong");
        switch (type) {
            case Alert.Success:
                alert.classList.add("alert-success");
                span.textContent = "&#10003;"
                strong.textContent = " Success!"
                break;
            case Alert.Warning:
                alert.classList.add("alert-warning");
                span.textContent = "&#10003;"
                strong.textContent = " Warning!"
                break;
            case Alert.Danger:
                alert.classList.add("alert-danger");
                span.textContent = "&#9888;";
                strong.textContent = " Alert!"
                localMessage = "An error errored, contact a system administrator.";
                break;
        }
        alert.appendChild(span);
        alert.appendChild(strong);
        alert.textContent = localMessage;
        const container = document.getElementById("alertContainer");
        container.appendChild(alert);
        window.setTimeout(() => {
            container.removeChild(alert);
        }, 5000);
    }

    selectListGroupItemString(htmlElement: HTMLElement, comparativeVariable: string): string {
        if(comparativeVariable === null) {
            htmlElement.classList.add("list-group-item-dark");
            comparativeVariable = htmlElement.textContent;
        } else if(htmlElement.textContent === comparativeVariable) {
            htmlElement.classList.remove("list-group-item-dark");
            comparativeVariable = null;
        } else {
            const selected = document.getElementById(comparativeVariable.split(" ").join(""));
            selected.classList.remove("list-group-item-dark");
            htmlElement.classList.add("list-group-item-dark");
            comparativeVariable = htmlElement.textContent;
        }

        return comparativeVariable;
    }

    selectListGroupItemDate(htmlElement: HTMLElement, comparativeVariable: Date): Date {
        if(comparativeVariable === null) {
            htmlElement.classList.add("list-group-item-dark");
            comparativeVariable = new Date(htmlElement.textContent);
        } else if(new Date(htmlElement.textContent) === comparativeVariable) {
            htmlElement.classList.remove("list-group-item-dark");
            comparativeVariable = null;
        } else {
            const selected = document.getElementById(comparativeVariable.toString().toString().split(" ").join(""));
            selected.classList.remove("list-group-item-dark");
            htmlElement.classList.add("list-group-item-dark");
            comparativeVariable = new Date(htmlElement.textContent);
        }

        return comparativeVariable;
    }

    selectExistingModuleComponent(container: HTMLElement, h2_title: string, btn_title: string) {
        const title = document.createElement("h2");
        title.textContent = h2_title;
        title.id = "hh2";
        container.appendChild(title);
        this.addBreakpoint(container);
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "w-75", "m-auto", "select-module-restriction");
        ul.id = "selmodul";
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = "None";
        ul.appendChild(li);
        container.appendChild(ul);
        this.addBreakpoint(container);
        const selectmbutton = document.createElement("button");
        selectmbutton.classList.add("btn", "btn-outline-dark", "w-75");
        selectmbutton.type = "button";
        selectmbutton.id = "smsubmitbutton";
        selectmbutton.textContent = btn_title;
        container.appendChild(selectmbutton);
        this.addBreakpoint(container);
    }


    async selectEMCComponentLogic(payload: object): Promise<object[]> {
        const userInfo = payload["json"]["userinfo"];
        let loadedModules: object[] = await loadModules();
        switch (userInfo["role"]) {
            case Role.Student:
                const module_list: string[] = userInfo["module_list"];
                console.log(module_list);
                const tempModules: object[] = [];
                for(let i = 0; i < module_list.length; i++) {
                    console.log(module_list[i])
                    console.log(await loadModule(module_list[i]));
                    tempModules.push(await loadModule(module_list[i]));
                }
                loadedModules = tempModules;
                break;
        }

        const listgroup = document.getElementById("selmodul");
        if(loadedModules.length > 0) {
            listgroup.innerHTML = "";
        }
        for(let i = 0; i < loadedModules.length; i++) {
            const moduleData =loadedModules[i];
            const moduleName: string = moduleData["name"];
            const listgroupitem = document.createElement("li");
            listgroupitem.classList.add("list-group-item");
            listgroupitem.textContent = moduleName;
            const idName = moduleName.split(" ").join("");
            listgroupitem.id = idName;
            listgroupitem.addEventListener("click", () => {
                this._selectedModule = this.selectListGroupItemString(listgroupitem, this._selectedModule);
            });
            listgroup.appendChild(listgroupitem);
        }

        return loadedModules;
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }
}