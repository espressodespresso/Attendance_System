import {GeneralUtility} from "../utilities/GeneralUtility";
import {IAnalyticsLogic} from "../logic/AnalyticsLogic";
import {LogicFactory} from "../logic/LogicFactory";

export interface IAnalyticsComponent {
    selectModule(payload: object): Promise<void>;
    displayTable(): void;
    displayGraph(): void;
    addControlbutton(name: string, id: string): HTMLButtonElement;
    get container(): HTMLElement;
}

export class AnalyticsComponent {
    private _utils: GeneralUtility = null;
    private _analyticsLogic: IAnalyticsLogic = null;
    private _payload: object = null;

    constructor(payload: object) {
        this._utils = GeneralUtility.getInstance();
        this._analyticsLogic = LogicFactory.createAnalyticsLogic(this._utils, payload, this);
        this._payload = payload;
        (async () => {
            await this.selectModule(payload);
        })().catch(e => {
            console.error(e);
        });
    }

    async selectModule(payload: object): Promise<void> {
        const container = this.getContainer();
        const selectContainer = document.createElement("div");
        selectContainer.classList.add("text-center");
        selectContainer.id = "selectContainer";
        container.appendChild(selectContainer);
        this._utils.selectExistingModuleComponent(selectContainer, "Select a Module", "Select Module");
        const loadedModules = await this._utils.selectEMCComponentLogic(payload);
        await this._analyticsLogic.submitButton();
    }

    displayTable(): void {
        const container = this.getContainer();
        const table = document.createElement("table");
        table.classList.add("table");
        const thead = document.createElement("thead");
        thead.id = "tablehead";
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        tbody.id = "tablebody";
        table.appendChild(tbody);
        container.appendChild(table);
    }

    displayGraph(): void {
        const container = this.getContainer();
    }

    addControlbutton(name: string, id: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.classList.add("btn", "btn-outline-dark");
        button.type = "button";
        button.id = id;
        button.textContent = name;
        button.disabled = true;
        document.getElementById("analytics-button-container").appendChild(button);
        return button;
    }

    private getContainer(): HTMLElement {
        const container = document.getElementById("analytics-data-container");
        container.innerHTML = "";
        return container;
    }

    get container(): HTMLElement {
        return document.getElementById("analytics-data-container");
    }
}