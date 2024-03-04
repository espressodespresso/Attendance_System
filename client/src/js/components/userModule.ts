export class UserModule {
    constructor() {
        const mod_container = document.getElementById("modules-container");
        const row = document.createElement("div");
        row.classList.add("row");
        this.initListGroups(row);
        mod_container.appendChild(row);
    }

    private initListGroups(row: HTMLDivElement) {
        // For each in year relevant to user
        const column = document.createElement("div");
        column.classList.add("col-12", "p-3");
        const h2 = document.createElement("h2");
        h2.classList.add("w-75", "m-auto");
        h2.textContent = "Modules (23/24)";
        column.appendChild(h2);
        column.appendChild(this.createUnorderedList({
            name: "Module Name",
            semester: "Semester",
            manatory: "Manatory",
            lecturer: "Lecturer Information"
        }));
        row.appendChild(column);
    }

    private createUnorderedList(module_content: object): HTMLUListElement {
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "list-group-horizontal", "w-75", "m-auto");
        ul.appendChild(this.createListitem(module_content["name"]));
        ul.appendChild(this.createListitem(module_content["semester"]));
        ul.appendChild(this.createListitem(module_content["manatory"]));
        ul.appendChild(this.createListitem(module_content["lecturer"]));
        return ul;
    }

     private createListitem(textContent: string): HTMLLIElement {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "flex-fill");
        li.textContent = textContent;
        return li;
    }
}