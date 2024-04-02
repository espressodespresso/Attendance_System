export function attendanceComponent(module, date: Date, container: HTMLDivElement) {
    container.innerHTML = "";
    const title = document.createElement("h2");
    title.textContent = module["name"];
    container.appendChild(title);
    const subtitle = document.createElement("h4");
    subtitle.textContent = date.toString();
    container.appendChild(subtitle);
    addBreakpoint(container);
    addBreakpoint(container);
}

function addBreakpoint(element: HTMLElement) {
    element.appendChild(document.createElement("br"));
}