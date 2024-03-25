import {verifyUserExists} from "../services/AuthService";
import {createModule} from "../services/ModuleService";

export class AuthModLogic {
    createModule(fp: any) {
        let users: string[] = []
        const addUserButton = document.getElementById("cmadduserbutton");
        addUserButton.addEventListener("click", async function () {
            const addUserTextBox = document.getElementById("cmenrolledinput") as HTMLInputElement;
            let user = addUserTextBox.value;
            if(!users.includes(user)) {
                const userExists = await verifyUserExists(user);
                if(userExists) {
                    users.push(user);
                    const list_group = document.getElementById("ulcmname");
                    if(list_group.innerHTML.includes("None")) {
                        list_group.innerHTML = "";
                    }

                    const listgroupitem = document.createElement("li");
                    listgroupitem.classList.add("list-group-item");
                    listgroupitem.textContent = user;
                    list_group.appendChild(listgroupitem);
                } else {
                    console.error("User does not exist");
                }
            } else {
                console.error("User already added to queue");
            }
        });

        const submitModulebutton = document.getElementById("cmsubmitbutton");
        submitModulebutton.addEventListener("click", async function () {
            const nameTextBox = document.getElementById("cmnameinput") as HTMLInputElement;
            const leaderTextBox = document.getElementById("cmleaderinput") as HTMLInputElement;
            let module = {
                name: nameTextBox.value,
                enrolled: users,
                leader: leaderTextBox.value,
                timetable: fp.selectedDates
            };
            await createModule(module);
        });
    }

    editModule(fp: any) {

    }

}