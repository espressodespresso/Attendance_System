import {HomeComponent} from "../components/home/HomeComponent";
import {getPayloadData} from "../services/AuthService";

export class HomeLogic {
    private homeModule: HomeComponent = null

    constructor(component: HomeComponent, payload: object) {
        this.homeModule = component;
        const ul = document.getElementById("hullist") as HTMLUListElement;
        const modules = payload["json"]["userinfo"]["module_list"];
        if(modules.length > 0) {
            ul.innerHTML = "";
            for(let i = 0; i < modules.length; i++) {
                const listgroupitem = document.createElement("li");
                listgroupitem.classList.add("list-group-item");
                listgroupitem.textContent = modules[i];
                listgroupitem.addEventListener("click", async () => {

                });
                ul.appendChild(listgroupitem);
            }
        }
    }
}