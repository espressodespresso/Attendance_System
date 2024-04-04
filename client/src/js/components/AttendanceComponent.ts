import {generateAttendanceCode} from "../services/AttendanceService";
import {AttendanceLogic} from "../logic/AttendanceLogic";

export class AttendanceComponent {
    private index_container_form: HTMLElement;
    private attendanceLogic: AttendanceLogic = null;
    constructor(index_container_form: HTMLElement) {
        this.attendanceLogic = new AttendanceLogic(this);
        this.index_container_form = index_container_form;
    }

    authAttendanceSelectComponent(payload: object) {
        const h2 = document.createElement("h2");
        h2.textContent = "Select a Module";
        h2.id = "hh2";
        this.index_container_form.appendChild(h2);
        this.addBreakpoint(this.index_container_form);
        const ul = document.createElement("ul");
        ul.id = "hullist"
        ul.classList.add("list-group", "w-75", "m-auto");
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = "None";
        ul.appendChild(li);
        this.index_container_form.appendChild(ul);
        this.addBreakpoint(this.index_container_form);
        const selectButton = document.createElement("button");
        selectButton.classList.add("btn", "btn-outline-dark", "w-75");
        selectButton.type = "button";
        selectButton.id = "hsubmitbutton";
        selectButton.textContent = "Select Module";
        this.index_container_form.appendChild(selectButton)
        this.attendanceLogic.displayModules(payload);
    }

    async authAttendanceCodeComponent(module, date: Date) {
        this.index_container_form.innerHTML = "";
        const title = document.createElement("h2");
        title.textContent = module;
        this.index_container_form.appendChild(title);
        const subtitle = document.createElement("h4");
        subtitle.textContent = date.toString();
        this.index_container_form.appendChild(subtitle);
        this.addBreakpoint(this.index_container_form);
        this.addBreakpoint(this.index_container_form);
        const code = document.createElement("h3");
        code.id = "attendanceCode";
        this.index_container_form.appendChild(code);
        await this.attendanceLogic.attendanceAuthCodeComponent(module, date);
    }

    userAttendanceComponent() {
        const h2 = document.createElement("h2");
        h2.textContent = "Register for Lesson";
        this.index_container_form.appendChild(h2);
        this.index_container_form.appendChild(document.createElement("br"));
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control", "w-25", "mx-auto");
        input.id = "codeInput";
        input.placeholder = "Code";
        this.index_container_form.appendChild(input);
        const label = document.createElement("label");
        label.htmlFor = "codeInput";
        this.index_container_form.appendChild(label);
        this.index_container_form.appendChild(document.createElement("br"));
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("btn", "btn-outline-dark", "w-25");
        button.id = "uasubmit";
        button.textContent = "Submit";
        this.index_container_form.appendChild(button);
        this.attendanceLogic.attendanceUserCodeComponent();
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }
}