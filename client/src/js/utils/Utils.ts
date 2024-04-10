import {Role} from "../enums/Role.enum";
import {loadModule, loadModules} from "../services/ModuleService";
import {ModuleAction} from "../enums/ModuleAction.enum";
import {AuthModLogic} from "../logic/AuthModLogic";
import {AuthorativeModule} from "../components/modules/AuthModComponent";
import {AttendanceComponent} from "../components/AttendanceComponent";
import {AttendanceLogic} from "../logic/AttendanceLogic";

export class Utils {
    selectedModule: string = null;

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
        ul.classList.add("list-group", "w-75", "m-auto");
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
            case Role.Lecturer:
                const module_list: string[] = userInfo["module_list"];
                for(let i = 0; i < module_list.length; i++) {
                    const tempModules: object[] = [];
                    tempModules.push(await loadModule(module_list[i]));
                    loadedModules = tempModules;
                }
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
                this.selectedModule = this.selectListGroupItemString(listgroupitem, this.selectedModule);
            });
            listgroup.appendChild(listgroupitem);
        }

        return loadedModules;
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }
}