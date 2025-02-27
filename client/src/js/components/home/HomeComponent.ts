import {Role} from "../../enums/Role.enum";
import {disableSpinner} from "../../index";
import {LogicFactory} from "../../logic/LogicFactory";
import {ComponentFactory} from "../ComponentFactory";
import {IAttendanceComponent} from "../AttendanceComponent";

export class HomeComponent {
    private _side_container_title: HTMLElement;
    private _side_container_title_sub: HTMLElement;
    private _side_container_tab1_title: HTMLElement;
    private _side_container_tab1_content: HTMLElement;
    private _side_container_tab2_title: HTMLElement;
    private _side_container_tab2_content: HTMLElement;
    private _side_container_tab3_title: HTMLElement;
    private _side_container_tab3_content: HTMLElement;
    private readonly _index_container_form: HTMLElement = null;

    private _attendanceComponent: IAttendanceComponent = null;

    constructor(payload: object) {
        // Side Container Title
        this._side_container_title = document.getElementById("index-side-container-title");
        this._side_container_title_sub = document.getElementById("index-side-container-title-sub")
        // Side Container Tab 1
        this._side_container_tab1_title = document.getElementById("index-side-container-tab1-title");
        //this._side_container_tab1_content = document.getElementById("index-side-container-tab1-content");
        // Side Container Tab 2
        this._side_container_tab2_title = document.getElementById("index-side-container-tab2-title");
        //this._side_container_tab2_content = document.getElementById("index-side-container-tab2-content");
        // Side Container Tab 3
        this._side_container_tab3_title = document.getElementById("index-side-container-tab3-title");
        //this._side_container_tab3_content = document.getElementById("index-side-container-tab3-content");

        // Main Content Container Form
        this._index_container_form = document.getElementById("index-content-container-form");

        // Init components
        LogicFactory.createHomeLogic(payload);
        this._attendanceComponent = ComponentFactory.createAttendanceComponent(this._index_container_form, payload);

        // Generate Container Features
        switch (payload["json"]["userinfo"]["role"]) {
            case Role.Student:
                this.userFeatures();
                break;
            case Role.Lecturer:
            case Role.AdministrativeFM:
            case Role.IT:
                this.authFeatures(payload);
                break;
            default:
                this.userFeatures();
                break;
        }
    }

    private userFeatures() {
        this.initContent();
        this._attendanceComponent.userAttendanceComponent();
        this.initLessonsTable();
    }

    private authFeatures(payload: object) {
        this.initContent();
        (async () => {
            await this._attendanceComponent.authAttendanceSelectComponent(payload);
        })();
        this.initLessonsTable();
    }

    private initContent() {
        this._side_container_title.textContent = "Welcome Back"
        this._side_container_title_sub.textContent = "Let's catch up on what's been happening";
        this._side_container_tab1_title.textContent = "Attendance Trend"
        this._side_container_tab2_title.textContent = "Upcoming Lessons"
        this._side_container_tab3_title.textContent = "University Announcements";
    }

    private initLessonsTable() {
        const container: HTMLElement = document.getElementById("index-side-container-tab2-content");
        container.innerHTML = "";
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
}