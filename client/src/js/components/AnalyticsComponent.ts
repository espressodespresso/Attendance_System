import {Utils} from "../utils/Utils";
import {AnalyticsLogic} from "../logic/AnalyticsLogic";

export class AnalyticsComponent {
    private _utils: Utils = null;
    private _analyticsLogic: AnalyticsLogic = null;
    private _payload: object = null;

    constructor(payload: object) {
        this._utils = new Utils();
        this._analyticsLogic = new AnalyticsLogic(this._utils, payload, this);
        this._payload = payload;
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
        this._utils.selectExistingModuleComponent(selectContainer, "Select a Module", "Select Module");
        const loadedModules = await this._utils.selectEMCComponentLogic(payload);
        await this._analyticsLogic.submitButton();
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
        this._analyticsLogic.displayTable();
    }

    async displayGraph() {
        this._analyticsLogic.displayGraph();
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