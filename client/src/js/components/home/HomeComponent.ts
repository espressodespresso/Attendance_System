import {Role} from "../../enums/Role.enum";
import {HomeLogic} from "../../logic/HomeLogic";
import {AttendanceComponent} from "../AttendanceComponent";

export class HomeComponent {
    private _side_container_title: HTMLElement;
    private _side_container_title_sub: HTMLElement;
    private _side_container_tab1_title: HTMLElement;
    private _side_container_tab1_content: HTMLElement;
    private _side_container_tab2_title: HTMLElement;
    private _side_container_tab2_content: HTMLElement;
    private _side_container_tab3_title: HTMLElement;
    private _side_container_tab3_content: HTMLElement;
    private _index_container_form: HTMLElement = null;

    private _homeLogic: HomeLogic = null;
    private _attendanceComponent: AttendanceComponent = null;

    constructor(payload: object) {
        // Side Container Title
        this._side_container_title = document.getElementById("index-side-container-title");
        this._side_container_title_sub = document.getElementById("index-side-container-title-sub")
        // Side Container Tab 1
        this._side_container_tab1_title = document.getElementById("index-side-container-tab1-title");
        this._side_container_tab1_content = document.getElementById("index-side-container-tab1-content");
        // Side Container Tab 2
        this._side_container_tab2_title = document.getElementById("index-side-container-tab2-title");
        this._side_container_tab2_content = document.getElementById("index-side-container-tab2-content");
        // Side Container Tab 3
        this._side_container_tab3_title = document.getElementById("index-side-container-tab3-title");
        this._side_container_tab3_content = document.getElementById("index-side-container-tab3-content");

        // Main Content Container Form
        this._index_container_form = document.getElementById("index-content-container-form");

        // Init components
        this._homeLogic = new HomeLogic();
        this._attendanceComponent = new AttendanceComponent(this._index_container_form);

        // Generate Container Features
        switch (payload["json"]["userinfo"]["role"]) {
            case Role.Student:
                this.userFeatures();
                break;
            case Role.Lecturer:
                this.authFeatures(payload);
                break;
            case Role.AdministrativeFM:
                this.authFeatures(payload);
                break;
            case Role.IT:
                this.authFeatures(payload);
                break;
            default:
                this.userFeatures();
                break;
        }
    }

    private userFeatures() {
        this._side_container_title.textContent = "Welcome Back";
        this._side_container_title_sub.textContent = "Let's catch up on what's been happening this week";
        this._side_container_tab1_title.textContent = "Attendance Trend"
        this._side_container_tab2_title.textContent = "Upcoming Lessons"
        this._side_container_tab3_title.textContent = "University Announcements";

        this._attendanceComponent.userAttendanceComponent();
    }

    private authFeatures(payload: object) {
        this._side_container_title.textContent = "Welcome Back"
        this._side_container_title_sub.textContent = "Let's catch up on what's been happening";
        this._side_container_tab1_title.textContent = "Module Attendance Trend"
        this._side_container_tab2_title.textContent = "Upcoming Lessons"
        this._side_container_tab3_title.textContent = "University Announcements";

        (async () => {
            await this._attendanceComponent.authAttendanceSelectComponent(payload);
        })();
    }
}