import {IAttendanceService} from "../services/AttendanceService";
import {IAttendanceComponent} from "../components/AttendanceComponent";
import {GeneralUtility} from "../utilities/GeneralUtility";
import QRCode from 'qrcode'
import {Alert} from "../enums/Alert.enum";
import {Html5Qrcode} from "html5-qrcode";
import {ServiceFactory} from "../services/ServiceFactory";

export interface IAttendanceLogic {
    attendanceAuthCodeComponent(module_name: string, date: Date): Promise<void>;
    attendanceUserCodeComponent(): void;
    submitModuleButton(utils: GeneralUtility): void;
    selectDate(moduleName: string): Promise<void>;
}

export class AttendanceLogic implements IAttendanceLogic{
    private _attendanceComponent: IAttendanceComponent = null;
    private _selectedDate: Date = null;
    private _utils: GeneralUtility = null;
    private _attendanceService: IAttendanceService = null;
    private readonly _payload: object = null;

    constructor(component: IAttendanceComponent, payload: object) {
        this._payload = payload;
        this._attendanceComponent = component;
        this._utils = GeneralUtility.getInstance();
        this._attendanceService = ServiceFactory.createAttendanceService();
    }

    async attendanceAuthCodeComponent(module_name: string, date: Date): Promise<void> {
        const codeh3 = document.getElementById("attendanceCode");
        const code = await this._attendanceService.generateAttendanceCode(module_name, date);
        codeh3.textContent = code.toString();
        try {
            const qrcode = await QRCode.toCanvas(code.toString(), { errorCorrectionLevel: 'H' });
            this._attendanceComponent.index_container_form.appendChild(qrcode);
        } catch (e) {
            console.log(e);
        }

        const terminate = document.getElementById("terminatebutton");
        terminate.addEventListener('click', async () => {
            const status = await this._attendanceService.terminateAttendanceCode(code);
            if(status) {
                this._utils.generateAlert("Code terminated successfully", Alert.Success);
            } else {
                this._utils.generateAlert("", Alert.Danger);
            }
            this._attendanceComponent.index_container_form.innerHTML = ""
            await this._attendanceComponent.authAttendanceSelectComponent(this._payload);
        });

        window.addEventListener('beforeunload', async () => {
            const utils = GeneralUtility.getInstance();
            const status = await this._attendanceService.terminateAttendanceCode(code);
            if(status) {
                utils.generateAlert("Code terminated successfully", Alert.Success);
            } else {
                utils.generateAlert("", Alert.Danger);
            }
        });
    }

    attendanceUserCodeComponent(): void {
        const submit = document.getElementById("uasubmit");
        submit.addEventListener("click", async () => {
            const codeInput = document.getElementById("codeInput") as HTMLInputElement;
            const code = codeInput.value;
            if(code !== "") {
                const data = await this._attendanceService.attendActiveAttendance(parseInt(code));
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
                                    const response = await this._attendanceService.attendActiveAttendance(parseInt(decodedText));
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
    }

    submitModuleButton(utils: GeneralUtility): void {
        const submitButton = document.getElementById("smsubmitbutton");
        submitButton.addEventListener("click", async () => {
            if(utils.selectedModule !== null) {
                await this.selectDate(utils.selectedModule);
            } else {
                console.error("No module selected");
            }
        });
    };

    async selectDate(moduleName: string): Promise<void> {
        const data = await ServiceFactory.createModuleService().loadModule(moduleName);
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