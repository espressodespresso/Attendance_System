export function selectListGroupItemString(htmlElement: HTMLElement, comparativeVariable: string): string {
    if(comparativeVariable === null) {
        htmlElement.classList.add("list-group-item-dark");
        comparativeVariable = htmlElement.textContent;
    } else if(htmlElement.textContent === comparativeVariable) {
        htmlElement.classList.remove("list-group-item-dark");
        comparativeVariable = null;
    } else {
        const selected = document.getElementById(comparativeVariable.split(" ").join(""));
        selected.classList.remove("list-group-item-dark");
        htmlElement.classList.add("list-group-item-dark");
        comparativeVariable = htmlElement.textContent;
    }

    return comparativeVariable;
}

export function selectListGroupItemDate(htmlElement: HTMLElement, comparativeVariable: Date): Date {
    if(comparativeVariable === null) {
        htmlElement.classList.add("list-group-item-dark");
        comparativeVariable = new Date(htmlElement.textContent);
    } else if(new Date(htmlElement.textContent) === comparativeVariable) {
        htmlElement.classList.remove("list-group-item-dark");
        comparativeVariable = null;
    } else {
        const selected = document.getElementById(comparativeVariable.toString().toString().split(" ").join(""));
        selected.classList.remove("list-group-item-dark");
        htmlElement.classList.add("list-group-item-dark");
        comparativeVariable = new Date(htmlElement.textContent);
    }

    return comparativeVariable;
}