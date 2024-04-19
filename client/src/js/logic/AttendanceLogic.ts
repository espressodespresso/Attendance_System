import {attendActiveAttendance, generateAttendanceCode, terminateAttendanceCode} from "../services/AttendanceService";
import {loadModule} from "../services/ModuleService";
import {AttendanceComponent} from "../components/AttendanceComponent";
import {Utils} from "../utilities/Utils";
import QRCode from 'qrcode'
import {Alert} from "../enums/Alert.enum";
import {Html5Qrcode} from "html5-qrcode";

export class AttendanceLogic {
    private _attendanceComponent: AttendanceComponent = null;
    private _selectedDate: Date = null;
    private _utils: Utils = null;

    constructor(component: AttendanceComponent) {
        this._attendanceComponent = component;
        this._utils = new Utils();
    }

    async attendanceAuthCodeComponent(module_name: string, date: Date) {
        const codeh3 = document.getElementById("attendanceCode");
        const code = await generateAttendanceCode(module_name, date);
        codeh3.textContent = code.toString();
        try {
            const qrcode = await QRCode.toCanvas(code.toString(), { errorCorrectionLevel: 'H' });
            this._attendanceComponent.index_container_form.appendChild(qrcode);
        } catch (e) {
            console.log(e);
        }

        const terminate = document.getElementById("terminatebutton");
        terminate.addEventListener('click', async () => {
            const status = await terminateAttendanceCode(code);
            if(status) {
                this._utils.generateAlert("Code terminated successfully", Alert.Success);
            } else {
                this._utils.generateAlert("", Alert.Danger);
            }
            this._attendanceComponent.index_container_form.innerHTML = ""
        });

        window.addEventListener('beforeunload', async () => {
            const utils = new Utils();
            const status = await terminateAttendanceCode(code);
            if(status) {
                utils.generateAlert("Code terminated successfully", Alert.Success);
            } else {
                utils.generateAlert("", Alert.Danger);
            }
        });
    }

    attendanceUserCodeComponent() {
        const submit = document.getElementById("uasubmit");
        submit.addEventListener("click", async () => {
            const codeInput = document.getElementById("codeInput") as HTMLInputElement;
            const code = codeInput.value;
            if(code !== "") {
                const data = await attendActiveAttendance(parseInt(code));
                if(data["status"]) {
                    this._utils.generateAlert(data["json"], Alert.Success);
                } else {
                    this._utils.generateAlert("", Alert.Danger);
                }
            }
        });
        const scanbutton: HTMLButtonElement = document.getElementById("scanqrcode") as HTMLButtonElement;
        scanbutton.addEventListener("click", async () => {
            let readCode: string = null;
            const reader = document.createElement("div");
            reader.id = "reader";
            this._attendanceComponent.index_container_form.appendChild(reader);
            try {
                const cameras = await Html5Qrcode.getCameras();
                if(cameras && cameras.length) {
                    try {
                        const html5QrCode = new Html5Qrcode("reader");
                        await html5QrCode.start(cameras[0].id,
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                            },
                            async (decodedText, decodedResult) => {
                                if(readCode !== decodedText) {
                                    readCode = decodedText;
                                    const response = await attendActiveAttendance(parseInt(decodedText));
                                    if(response["status"]) {
                                        const data = JSON.parse(response["json"]);
                                        const dataStatus = data["status"];
                                        const dataMessage = data["message"];
                                        if(dataStatus) {
                                            this._utils.generateAlert(dataMessage, Alert.Success);
                                        } else {
                                            this._utils.generateAlert(dataMessage, Alert.Warning);
                                        }
                                    } else {
                                        this._utils.generateAlert("", Alert.Danger);
                                    }
                                }
                                await html5QrCode.stop();
                            },
                            (errorMessage) => {
                                // parse error, ignore it.
                            });
                    } catch (e) {
                        scanbutton.disabled = true;
                        this._utils.generateAlert("Scanner failed to start", Alert.Warning);
                        console.error(e);
                    }
                } else {
                    scanbutton.disabled = true;
                    this._utils.generateAlert("Device has no available cameras to hook", Alert.Warning);
                }
            } catch (e) {
                scanbutton.disabled = true;
                this._utils.generateAlert("", Alert.Danger);
                console.error(e);
            }
        })

        /*(async () => {
            if(!await QrScanner.hasCamera()) {
                scanbutton.disabled = true;
            }
        })();*/
        /*scanbutton.addEventListener('click', async () => {
            const video = document.createElement("video");
            video.height = 180;
            video.width = 320;
            this._attendanceComponent.index_container_form.appendChild(video);
            const qrScanner = new QrScanner(
                video,
                async (result) => {
                    const data = await attendActiveAttendance(parseInt(result))
                    if(data["status"]) {
                        this._utils.generateAlert(data["json"], Alert.Success);
                    } else {
                        this._utils.generateAlert("", Alert.Danger);
                    }
                    qrScanner.stop();
                }
            );
            await qrScanner.start();
        })*/
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
                    this._selectedDate = this._utils.selectListGroupItemDate(listgroupitem, this._selectedDate);
                });
                ul.appendChild(listgroupitem);
            }
        } else {
            const listgroupitem = document.createElement("li");
            listgroupitem.classList.add("list-group-item");
            listgroupitem.textContent = "None";
            ul.appendChild(listgroupitem);
        }

        let submitButton = (document.getElementById("smsubmitbutton") as HTMLButtonElement);
        submitButton = this._utils.reInitSubmitButton(submitButton);
        submitButton.textContent = "Select Date";
        submitButton.addEventListener("click", async () => {
            if(this._selectedDate !== null) {
                await this._attendanceComponent.authAttendanceCodeComponent(moduleName, this._selectedDate);
                this._utils.generateAlert("Successfully generated attendance code.", Alert.Success);
            } else {
                this._utils.generateAlert("No date selected", Alert.Warning)
            }
        });
    }
}