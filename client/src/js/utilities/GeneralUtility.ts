import {Role} from "../enums/Role.enum";
import {Alert} from "../enums/Alert.enum";
import {IModuleService} from "../services/ModuleService";
import {ServiceFactory} from "../services/ServiceFactory";

export class GeneralUtility {
    private static _instance: GeneralUtility = null;
    private _selectedModule: string = null;
    private _moduleService: IModuleService = null;

    constructor() {
        this._moduleService = ServiceFactory.createModuleService();
    }

    static getInstance(): GeneralUtility {
        if(this._instance === null) {
            this._instance = new GeneralUtility();
        }

        return this._instance;
    }

    get selectedModule() {
        return this._selectedModule;
    }

    generateLocalSpinner(container: HTMLElement) {
        const center = document.createElement("div");
        center.classList.add("text-center");
        center.id = "local_spinner";
        const spinner = document.createElement("div");
        spinner.classList.add("spinner-border");
        spinner.role = "status";
        const span = document.createElement("span");
        span.classList.add("visually-hidden");
        span.innerHTML = "Loading...";
        spinner.appendChild(span);
        center.appendChild(spinner);
        container.appendChild(center);
    }

    terminateLocalSpinner() {
        const spinner = document.getElementById("local_spinner");
        spinner.parentNode.removeChild(spinner);
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
        const selectmbutton = this.initSubmitButton(btn_title);
        container.appendChild(selectmbutton);
        this.addBreakpoint(container);
    }


    async selectEMCComponentLogic(payload: object): Promise<object[]> {
        const userInfo = payload["json"]["userinfo"];
        let loadedModules: object[] = await this._moduleService.loadModules();
        switch (userInfo["role"]) {
            case Role.Student:
                const module_list: string[] = userInfo["module_list"];
                console.log(module_list);
                const tempModules: object[] = [];
                for(let i = 0; i < module_list.length; i++) {
                    tempModules.push(await this._moduleService.loadModule(module_list[i]));
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

    private initSubmitButton(btn_title: string): HTMLButtonElement {
        const selectmbutton = document.createElement("button");
        selectmbutton.classList.add("btn", "btn-outline-dark", "w-75");
        selectmbutton.type = "button";
        selectmbutton.id = "smsubmitbutton";
        selectmbutton.textContent = btn_title;
        return selectmbutton;
    }

    reInitSubmitButton(button: HTMLButtonElement): HTMLButtonElement {
        button.parentNode.replaceChild(this.initSubmitButton(button.textContent), button);
        return (document.getElementById("smsubmitbutton") as HTMLButtonElement);
    }

    // Generate Module List Common Functions

    async initModuleList(container: HTMLElement) {
        const data: object[] = await this._moduleService.moduleList();
        if(data === null) {
            this.noData(container);
        } else {
            for(let i = 0; i < data.length; i++) {
                const obj = data[i];
                this.initModuleYear(obj["modules"], `Modules ${obj["name"]}`, container)
            }
        }
    }

    private initModuleYear(modules: object[], name: string, container: HTMLElement) {
        const row = document.createElement("div");
        row.classList.add("row", "p-3");
        const col = document.createElement('col');
        col.classList.add("col-12", "user-modules", "p-3");
        const h2 = document.createElement("h2");
        h2.textContent = name;
        col.appendChild(h2);
        col.appendChild(this.createUnorderedList({
            name: "Module Name",
            semester: "Semester",
            mandatory: "Mandatory Attendance",
            lecturer: "Lecturer Details"
        }, true));
        modules.map(obj => {
            col.appendChild(this.createUnorderedList(obj));
        })
        row.appendChild(col);
        container.appendChild(row);
    }

    private noData(container: HTMLElement) {
        const row = document.createElement("div");
        const col = document.createElement('col');
        col.classList.add("col-12", "p-3");
        const h2 = document.createElement("h2");
        h2.textContent = "No Data";
        col.appendChild(h2);
        row.appendChild(col);
        container.appendChild(row);
    }

    createUnorderedList(module_content: object, top?: boolean): HTMLUListElement {
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "list-group-horizontal");
        if(typeof top !== "undefined") {
            ul.id = "top-listgroup";
            ul.classList.add("list-group-item-dark");
        }
        ul.appendChild(this.createListitem(module_content["name"]));
        ul.appendChild(this.createListitem(module_content["semester"]));
        ul.appendChild(this.createListitem(module_content["mandatory"]));
        ul.appendChild(this.createListitem(module_content["lecturer"]));
        return ul;
    }

    private createListitem(textContent: string): HTMLLIElement {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "w-25");
        li.textContent = textContent;
        return li;
    }
}