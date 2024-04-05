import {Utils} from "../utils/Utils";

export class AnalyticsComponent {
    private utils: Utils = null;

    constructor(payload: object) {
        this.utils = new Utils();
        this.selectModule();
    }


    private selectModule() {
        const container = document.getElementById("analytics-data-container");
        const selectContainer = document.createElement("div");
        selectContainer.classList.add("text-center");
        container.appendChild(selectContainer);
        this.utils.selectExistingModuleComponent(selectContainer, "Select a Module", "Select Module");
    }
}