import {generateAttendanceCode} from "../services/AttendanceService";
import {AttendanceLogic} from "../logic/AttendanceLogic";
import {Utils} from "../utilities/Utils";

export class AttendanceComponent {
    private _index_container_form: HTMLElement;
    private _attendanceLogic: AttendanceLogic = null;
    constructor(index_container_form: HTMLElement) {
        this._attendanceLogic = new AttendanceLogic(this);
        this._index_container_form = index_container_form;
    }

    get index_container_form() {
        return this._index_container_form;
    }

    async authAttendanceSelectComponent(payload: object) {
        const utils: Utils = new Utils();
        utils.selectExistingModuleComponent(this.index_container_form, "Select a Module", "Select Module");
        await utils.selectEMCComponentLogic(payload);
        this._attendanceLogic.submitModuleButton(utils);
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
        await this._attendanceLogic.attendanceAuthCodeComponent(module, date);
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
        this.addBreakpoint(this.index_container_form);
        const scanbutton = document.createElement("button");
        scanbutton.type = "button";
        scanbutton.classList.add("btn", "btn-outline-dark", "w-25");
        scanbutton.id = "scanqrcode";
        scanbutton.textContent = "Scan QR Code";
        this.index_container_form.appendChild(scanbutton);
        this._attendanceLogic.attendanceUserCodeComponent();
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }
}