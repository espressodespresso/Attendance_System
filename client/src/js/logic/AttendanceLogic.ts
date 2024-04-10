import {attendActiveAttendance, generateAttendanceCode, terminateAttendanceCode} from "../services/AttendanceService";
import {loadModule, loadModules} from "../services/ModuleService";
import {AttendanceComponent} from "../components/AttendanceComponent";
import {Role} from "../enums/Role.enum";
import {Utils} from "../utils/Utils";
import {ModuleAction} from "../enums/ModuleAction.enum";
import QRCode from 'qrcode'
const QrScanner = require('qr-scanner');

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
        try {
            const qrcode = await QRCode.toCanvas(code.toString(), { errorCorrectionLevel: 'H' });
            this.attendanceComponent.index_container_form.appendChild(qrcode);
        } catch (e) {
            console.log(e);
        }

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
        });
        const scanbutton: HTMLButtonElement = document.getElementById("scanqrcode") as HTMLButtonElement;
        (async () => {
            if(!await QrScanner.hasCamera()) {
                scanbutton.disabled = true;
            }
        })();
        scanbutton.addEventListener('click', async () => {
            const video = document.createElement("video");
            video.height = 180;
            video.width = 320;
            this.attendanceComponent.index_container_form.appendChild(video);
            const qrScanner = new QrScanner(
                video,
                async (result) => {
                    await attendActiveAttendance(parseInt(result))
                    qrScanner.stop();
                }
            );
            await qrScanner.start();
        })
    }

    submitModuleButton(utils: Utils) {
        const submitButton = document.getElementById("smsubmitbutton");
        submitButton.addEventListener("click", async () => {
            if(utils.selectedModule !== null) {
                await this.selectDate(utils.selectedModule);
            } else {
                console.error("No module selected");
            }
        });
    };

    async selectDate(moduleName: string) {
        const data = await loadModule(moduleName);
        const h2 = document.getElementById("hh2");
        h2.textContent = moduleName + " : Select a Date";
        const ul = document.getElementById("selmodul") as HTMLUListElement;
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

        const submitButton = document.getElementById("smsubmitbutton");
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