import flatpickr from "flatpickr";
import {IAuthModLogic} from "../../logic/AuthModLogic";
import {ModuleAction} from "../../enums/ModuleAction.enum";
import {GeneralUtility} from "../../utilities/GeneralUtility";
import {LogicFactory} from "../../logic/LogicFactory";

export interface IAuthModComponent {
    getModuleForm(): HTMLElement;
    selectExistingModule(h2_title: string, btn_title: string, action: ModuleAction, payload: object): Promise<void>;
    createModule(): void;
    editModule(module: object): void;
    deleteModule(module: object): void;
    dashboardModule(): void;
}

export class AuthModComponent {
    private _authModLogic: IAuthModLogic = null;

    constructor(payload: object) {
        const mod_container = document.getElementById("modules-container");
        const row = document.createElement("div");
        row.classList.add("row");
        const col_3 = document.createElement("div");
        col_3.classList.add("col-md-5", "col-lg-5", "col-xl-3", "p-3");
        const module_controls = document.createElement("div");
        module_controls.classList.add("text-center", "p-4");
        module_controls.id = "module-controls";
        const h2 = document.createElement("h2");
        h2.textContent = "Module Controls";
        module_controls.appendChild(h2);
        this.addBreakpoint(module_controls);
        const dashboardmbutton = document.createElement("button");
        dashboardmbutton.classList.add("btn", "btn-outline-dark", "w-75");
        dashboardmbutton.type = "button";
        dashboardmbutton.id = "dashboardmbutton";
        dashboardmbutton.textContent = "Open Dashboard";
        module_controls.appendChild(dashboardmbutton);
        this.addBreakpoint(module_controls);
        this.addBreakpoint(module_controls);
        const creatembutton = document.createElement("button");
        creatembutton.classList.add("btn", "btn-outline-dark", "w-75");
        creatembutton.type = "button";
        creatembutton.id = "creatembutton";
        creatembutton.textContent = "Create a new module";
        module_controls.appendChild(creatembutton);
        this.addBreakpoint(module_controls);
        const modifymbutton = document.createElement("button");
        modifymbutton.classList.add("btn", "btn-outline-dark", "w-75");
        modifymbutton.type = "button";
        modifymbutton.id = "modifymbutton";
        modifymbutton.textContent = "Modify an existing module";
        module_controls.appendChild(modifymbutton);
        this.addBreakpoint(module_controls);
        const deletembutton = document.createElement("button");
        deletembutton.classList.add("btn", "btn-outline-dark", "w-75");
        deletembutton.type = "button";
        deletembutton.id = "deletembutton";
        deletembutton.textContent = "Delete an existing module";
        module_controls.appendChild(deletembutton);
        this.addBreakpoint(module_controls);
        this.addBreakpoint(module_controls);
        const chhmbutton = document.createElement("button");
        chhmbutton.classList.add("btn", "btn-outline-dark", "w-75");
        chhmbutton.type = "button";
        chhmbutton.id = "chhmbutton";
        chhmbutton.textContent = "Contact Hallam Help";
        module_controls.appendChild(chhmbutton);
        col_3.appendChild(module_controls);
        row.appendChild(col_3);
        const col_9 = document.createElement("div");
        col_9.classList.add("col-md-7", "col-lg-7", "col-xl-9");
        const module_content = document.createElement("div");
        module_content.classList.add("text-center", "p-4", "justify-content-center");
        module_content.id = "module_content";
        const form = document.createElement("form");
        form.id = "module-form";
        module_content.appendChild(form);
        col_9.appendChild(module_content);
        row.appendChild(col_9);
        mod_container.appendChild(row);
        this._authModLogic = LogicFactory.createAuthModLogic(this, payload);
        this.dashboardModule();
    }

    getModuleForm(): HTMLElement {
        const module_Form = document.getElementById("module-form");
        document.getElementById("module-form").innerHTML = "";
        return module_Form;
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }

    async selectExistingModule(h2_title: string, btn_title: string, action: ModuleAction, payload: object): Promise<void> {
        const utils: GeneralUtility = GeneralUtility.getInstance();
        utils.selectExistingModuleComponent(this.getModuleForm(), h2_title, btn_title);
        const loadedModules = await utils.selectEMCComponentLogic(payload);
        this._authModLogic.submitButton(utils, loadedModules, action, this);
    }

    createModule(): void {
        this._authModLogic.createModule(this.moduleDataInput("Create a new module"));
    }

    editModule(module: object): void {
        const title: string = "Editing : " + module["name"];
        this._authModLogic.editModule(this.moduleDataInput(title), module);
    }

    deleteModule(module: object): void {
        const module_Form = this.getModuleForm();
        const title = document.createElement("h2");
        title.textContent = "Are you sure you want to delete this?";
        module_Form.appendChild(title);
        const moduletitle = document.createElement("h4");
        moduletitle.textContent = "Module Name";
        module_Form.appendChild(moduletitle);
        const modulename = document.createElement("p");
        modulename.textContent = module["name"];
        module_Form.appendChild(modulename);
        const enrolledtitle = document.createElement("h4");
        enrolledtitle.textContent = "Enrolled Users";
        module_Form.appendChild(enrolledtitle);
        const enrolledul = document.createElement("ul");
        enrolledul.classList.add("list-group", "w-75", "m-auto");
        enrolledul.id = "denrolledul";
        const enrolledli = document.createElement("li");
        enrolledli.classList.add("list-group-item");
        enrolledli.textContent = "None";
        enrolledul.appendChild(enrolledli);
        module_Form.appendChild(enrolledul);
        const leadertitle = document.createElement("h4");
        leadertitle.textContent = "Module Leader";
        module_Form.appendChild(leadertitle);
        const leadername = document.createElement("p");
        leadername.textContent = module["leader"];
        module_Form.appendChild(leadername);
        const timetabletitle = document.createElement("h4");
        timetabletitle.textContent = "Timetable";
        module_Form.appendChild(timetabletitle);
        const timetable = document.createElement("input");
        timetable.classList.add("form-control", "w-75", "m-auto");
        timetable.type = "datetime-local";
        timetable.id = "dtimetable";
        timetable.placeholder = "Select Timetable"
        module_Form.appendChild(timetable);
        const fp = flatpickr("#dtimetable", {
            mode: "multiple",
            enableTime: true,
            inline: true
        })
        const deletebutton = document.createElement("button");
        deletebutton.classList.add("btn", "btn-outline-danger", "w-75");
        deletebutton.type = "button";
        deletebutton.id = "dbutton";
        deletebutton.textContent = "Delete Module";
        module_Form.appendChild(deletebutton);
        this._authModLogic.deleteModule(fp, module);
    }

    private moduleDataInput(titleName: string) {
        const module_Form = this.getModuleForm();
        const title = document.createElement("h2");
        title.textContent = titleName;
        module_Form.appendChild(title);
        this.addBreakpoint(module_Form);
        const nameinput = document.createElement("input");
        nameinput.type = "text";
        nameinput.classList.add("form-control", "w-75", "m-auto");
        nameinput.id = "mnnameinput";
        nameinput.placeholder = "Module Name";
        module_Form.appendChild(nameinput);
        const namelabel = document.createElement("label");
        namelabel.htmlFor = "mnnameinput";
        module_Form.appendChild(namelabel);
        this.addBreakpoint(module_Form);
        const ulname = document.createElement("ul");
        ulname.classList.add("list-group", "w-75", "m-auto");
        ulname.id = "mnulname";
        const liname = document.createElement("li");
        liname.classList.add("list-group-item");
        liname.textContent = "None";
        ulname.appendChild(liname);
        module_Form.appendChild(ulname);
        this.addBreakpoint(module_Form);
        const enrolledinput = document.createElement("input");
        enrolledinput.type = "text";
        enrolledinput.classList.add("form-control", "w-75", "m-auto");
        enrolledinput.id = "mnenrolledinput";
        enrolledinput.placeholder = "Enter enrolled users";
        module_Form.appendChild(enrolledinput);
        const enrolledlabel = document.createElement("label");
        enrolledlabel.htmlFor = "mnenrolledinput";
        module_Form.appendChild(enrolledlabel);
        this.addBreakpoint(module_Form);
        const adduserbutton = document.createElement("button");
        adduserbutton.classList.add("btn", "btn-outline-dark", "w-75", "chhbutton");
        adduserbutton.type = "button";
        adduserbutton.id = "mnadduserbutton";
        adduserbutton.textContent = "Add User";
        module_Form.appendChild(adduserbutton);
        this.addBreakpoint(module_Form);
        this.addBreakpoint(module_Form);
        const leaderinput = document.createElement("input");
        leaderinput.type = "text";
        leaderinput.classList.add("form-control", "w-75", "m-auto");
        leaderinput.id = "mnleaderinput";
        leaderinput.placeholder = "Module Leader";
        module_Form.appendChild(leaderinput);
        const leaderlabel = document.createElement("label");
        leaderlabel.htmlFor = "mnleaderinput";
        module_Form.appendChild(leaderlabel);
        this.addBreakpoint(module_Form);
        const timetable = document.createElement("input");
        timetable.classList.add("form-control", "w-75", "m-auto");
        timetable.type = "datetime-local";
        timetable.id = "mntimetable";
        timetable.placeholder = "Select Timetable"
        module_Form.appendChild(timetable);
        this.addBreakpoint(module_Form);
        const submitbutton = document.createElement("button");
        submitbutton.classList.add("btn", "btn-outline-dark", "w-75", "chhbutton");
        submitbutton.type = "button";
        submitbutton.id = "mnsubmitbutton";
        submitbutton.textContent = "Submit"
        module_Form.appendChild(submitbutton);

        const fp = flatpickr("#mntimetable", {
            mode: "multiple",
            enableTime: true,
            inline: true
        })

        return fp;
    }

    dashboardModule(): void {
        this._authModLogic.dashboardModule();
    }
}
