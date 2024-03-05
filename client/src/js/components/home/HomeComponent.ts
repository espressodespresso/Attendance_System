import {Role} from "../../enums/Role.enum";

export class HomeComponent {
    private side_container_title: HTMLElement;
    private side_container_title_sub: HTMLElement;
    private side_container_tab1_title: HTMLElement;
    private side_container_tab1_content: HTMLElement;
    private side_container_tab2_title: HTMLElement;
    private side_container_tab2_content: HTMLElement;
    private side_container_tab3_title: HTMLElement;
    private side_container_tab3_content: HTMLElement;
    private index_container_form: HTMLElement;

    constructor(role: Role) {
        // Side Container Title
        this.side_container_title = document.getElementById("index-side-container-title");
        this.side_container_title_sub = document.getElementById("index-side-container-title-sub")
        // Side Container Tab 1
        this.side_container_tab1_title = document.getElementById("index-side-container-tab1-title");
        this.side_container_tab1_content = document.getElementById("index-side-container-tab1-content");
        // Side Container Tab 2
        this.side_container_tab2_title = document.getElementById("index-side-container-tab2-title");
        this.side_container_tab2_content = document.getElementById("index-side-container-tab2-content");
        // Side Container Tab 3
        this.side_container_tab3_title = document.getElementById("index-side-container-tab3-title");
        this.side_container_tab3_content = document.getElementById("index-side-container-tab3-content");

        // Main Content Container Form
        this.index_container_form = document.getElementById("index-content-container-form");

        // Generate Container Features
        switch (role) {
            case Role.Student:
                this.userFeatures();
                break;
            case Role.Lecturer:
                this.authFeatures();
                break;
            default:
                this.authFeatures();
                break;
        }
    }

    private userFeatures() {
        this.side_container_title.textContent = "Welcome Back";
        this.side_container_title_sub.textContent = "Let's catch up on what's been happening this week";
        this.side_container_tab1_title.textContent = "Attendance Trend"
        this.side_container_tab2_title.textContent = "Upcoming Lessons"
        this.side_container_tab3_title.textContent = "University Announcements";

        // Registration UI
        const h2 = document.createElement("h2");
        h2.textContent = "Register for Lesson";
        this.index_container_form.appendChild(h2);
        this.index_container_form.appendChild(document.createElement("br"));
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control", "w-25", "mx-auto");
        input.id = "codeInput";
        input.placeholder = "Code";
        this.index_container_form.appendChild(input);
        const label = document.createElement("label");
        label.htmlFor = "codeInput";
        this.index_container_form.appendChild(label);
        this.index_container_form.appendChild(document.createElement("br"));
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("btn", "btn-outline-dark", "w-25");
        button.textContent = "Submit";
        this.index_container_form.appendChild(button);
    }

    private authFeatures() {
        this.side_container_title.textContent = "Welcome Back"
        this.side_container_title_sub.textContent = "Let's catch up on what's been happening";
        this.side_container_tab1_title.textContent = "Module Attendance Trend"
        this.side_container_tab2_title.textContent = "Upcoming Lessons"
        this.side_container_tab3_title.textContent = "University Announcements";

        // Generate Registration Code UI
        const h2 = document.createElement("h2");
        h2.textContent = "Select a Module";
        this.index_container_form.appendChild(h2);
        this.addBreakpoint(this.index_container_form);
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "w-75", "m-auto");
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = "None";
        ul.appendChild(li);
        this.index_container_form.appendChild(ul);
        this.addBreakpoint(this.index_container_form);
        const selectButton = document.createElement("button");
        selectButton.classList.add("btn", "btn-outline-dark", "w-75");
        selectButton.type = "button";
        selectButton.id = "cmsubmitbutton";
        selectButton.textContent = "Select Module";
        this.index_container_form.appendChild(selectButton)
    }

    private addBreakpoint(element: HTMLElement) {
        element.appendChild(document.createElement("br"));
    }
}