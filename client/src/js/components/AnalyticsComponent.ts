import {Utils} from "../utils/Utils";
import {AnalyticsLogic} from "../logic/AnalyticsLogic";

export class AnalyticsComponent {
    private utils: Utils = null;
    private analyticsLogic: AnalyticsLogic = null;
    private payload: object = null;

    constructor(payload: object) {
        this.utils = new Utils();
        this.analyticsLogic = new AnalyticsLogic(this.utils, payload, this);
        this.payload = payload;
        (async () => {
            await this.selectModule(payload);
        })().catch(e => {
            console.error(e);
        });
    }


    async selectModule(payload: object) {
        const container = this.getContainer();
        const selectContainer = document.createElement("div");
        selectContainer.classList.add("text-center");
        container.appendChild(selectContainer);
        this.utils.selectExistingModuleComponent(selectContainer, "Select a Module", "Select Module");
        const loadedModules = await this.utils.selectEMCComponentLogic(payload);
        await this.analyticsLogic.submitButton();
    }

    displayTable() {
        const container = this.getContainer();
        const table = document.createElement("table");
        table.classList.add("table");
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");
        tr.appendChild(this.thcol("#"));
        tr.appendChild(this.thcol("Module Name"));
        tr.appendChild(this.thcol("Date"));
        tr.appendChild(this.thcol("Attended"));
        tr.appendChild(this.thcol("Late"));
        thead.appendChild(tr);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        tbody.id = "tablebody";
        table.appendChild(tbody);
        container.appendChild(table);
        this.analyticsLogic.displayTable();
    }

    async displayGraph() {
        this.analyticsLogic.displayGraph();
    }

    private getContainer(): HTMLElement {
        const container = document.getElementById("analytics-data-container");
        container.innerHTML = "";
        return container;
    }

    private thcol(name: string): HTMLTableCellElement {
        const th = document.createElement("th");
        th.scope = "col";
        th.innerHTML = name;
        return th;
    }
}