import flatpickr from "flatpickr";
import {AuthModLogic} from "../../logic/AuthModLogic";

let authModLogic = null;

export class AuthorativeModule {
    constructor() {
        const mod_container = document.getElementById("modules-container");
        const row = document.createElement("div");
        row.classList.add("row");
        const col_3 = document.createElement("div");
        col_3.classList.add("col-3", "p-3");
        const module_controls = document.createElement("div");
        module_controls.classList.add("text-center", "p-4");
        module_controls.id = "module-controls";
        const h2 = document.createElement("h2");
        h2.textContent = "Module Controls";
        module_controls.appendChild(h2);
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
        const chhmbutton = document.createElement("button");
        chhmbutton.classList.add("btn", "btn-outline-dark", "w-75");
        chhmbutton.type = "button";
        chhmbutton.id = "chhmbutton";
        chhmbutton.textContent = "Contact Hallam Help";
        module_controls.appendChild(chhmbutton);
        col_3.appendChild(module_controls);
        row.appendChild(col_3);
        const col_9 = document.createElement("div");
        col_9.classList.add("col-9");
        const module_content = document.createElement("div");
        module_content.classList.add("text-center", "p-4", "justify-content-center");
        module_content.id = "module_content";
        const form = document.createElement("form");
        form.id = "module-form";
        module_content.appendChild(form);
        col_9.appendChild(module_content);
        row.appendChild(col_9);
        mod_container.appendChild(row);
        authModLogic = new AuthModLogic(this);
    }

    private getModuleForm(): HTMLElement {
        const module_Form = document.getElementById("module-form");
        document.getElementById("module-form").innerHTML = "";
        return module_Form;
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }

    private selectExistingModule(module_form: HTMLElement, h2_title: string, btn_title: string) {
        const title = document.createElement("h2");
        title.textContent = h2_title;
        module_form.appendChild(title);
        this.addBreakpoint(module_form);
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "w-75", "m-auto");
        ul.id = "selmodul";
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = "None";
        ul.appendChild(li);
        module_form.appendChild(ul);
        this.addBreakpoint(module_form);
        const selectmbutton = document.createElement("button");
        selectmbutton.classList.add("btn", "btn-outline-dark", "w-75");
        selectmbutton.type = "button";
        selectmbutton.id = "cmsubmitbutton";
        selectmbutton.textContent = btn_title;
        module_form.appendChild(selectmbutton);
        this.addBreakpoint(module_form);
    }

    createModule() {
        const module_Form = this.getModuleForm();
        const title = document.createElement("h2");
        title.textContent = "Create a new module";
        module_Form.appendChild(title);
        this.addBreakpoint(module_Form);
        const cmnameinput = document.createElement("input");
        cmnameinput.type = "text";
        cmnameinput.classList.add("form-control", "w-75", "m-auto");
        cmnameinput.id = "cmnameinput";
        cmnameinput.placeholder = "Module Name";
        module_Form.appendChild(cmnameinput);
        const cmnamelabel = document.createElement("label");
        cmnamelabel.htmlFor = "cmnameinput";
        module_Form.appendChild(cmnamelabel);
        this.addBreakpoint(module_Form);
        const ulcmname = document.createElement("ul");
        ulcmname.classList.add("list-group", "w-75", "m-auto");
        ulcmname.id = "ulcmname";
        const licmname = document.createElement("li");
        licmname.classList.add("list-group-item");
        licmname.textContent = "None";
        ulcmname.appendChild(licmname);
        module_Form.appendChild(ulcmname);
        this.addBreakpoint(module_Form);
        const cmenrolledinput = document.createElement("input");
        cmenrolledinput.type = "text";
        cmenrolledinput.classList.add("form-control", "w-75", "m-auto");
        cmenrolledinput.id = "cmenrolledinput";
        cmenrolledinput.placeholder = "Enter enrolled users";
        module_Form.appendChild(cmenrolledinput);
        const cmenrolledlabel = document.createElement("label");
        cmenrolledlabel.htmlFor = "cmenrolledinput";
        module_Form.appendChild(cmenrolledlabel);
        this.addBreakpoint(module_Form);
        const cmadduserbutton = document.createElement("button");
        cmadduserbutton.classList.add("btn", "btn-outline-dark", "w-75", "chhbutton");
        cmadduserbutton.type = "button";
        cmadduserbutton.id = "cmadduserbutton";
        cmadduserbutton.textContent = "Add User";
        module_Form.appendChild(cmadduserbutton);
        this.addBreakpoint(module_Form);
        this.addBreakpoint(module_Form);
        const cmleaderinput = document.createElement("input");
        cmleaderinput.type = "text";
        cmleaderinput.classList.add("form-control", "w-75", "m-auto");
        cmleaderinput.id = "cmleaderinput";
        cmleaderinput.placeholder = "Module Leader";
        module_Form.appendChild(cmleaderinput);
        const cmleaderlabel = document.createElement("label");
        cmleaderlabel.htmlFor = "cmleaderinput";
        module_Form.appendChild(cmleaderlabel);
        this.addBreakpoint(module_Form);
        const cmtimetable = document.createElement("input");
        cmtimetable.classList.add("form-control", "w-75", "m-auto");
        cmtimetable.type = "datetime-local";
        cmtimetable.id = "cmtimetable";
        cmtimetable.placeholder = "Select Timetable"
        module_Form.appendChild(cmtimetable);
        this.addBreakpoint(module_Form);
        const cmsubmitbutton = document.createElement("button");
        cmsubmitbutton.classList.add("btn", "btn-outline-dark", "w-75", "chhbutton");
        cmsubmitbutton.type = "button";
        cmsubmitbutton.id = "cmsubmitbutton";
        cmsubmitbutton.textContent = "Submit"
        module_Form.appendChild(cmsubmitbutton);

        const fp = flatpickr("#cmtimetable", {
            mode: "multiple",
            enableTime: true
        })

        authModLogic.createModule(fp);
    }

    editModule() {
        const module_Form = this.getModuleForm();
        this.selectExistingModule(module_Form, "Modify an existing module", "Select Module");

        authModLogic.getModules();
    }

    deleteModule() {
        const module_Form = this.getModuleForm();
        this.selectExistingModule(module_Form, "Delete an existing module", "Select Module");
    }
}