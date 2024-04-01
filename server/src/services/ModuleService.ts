import {MongoService} from "./MongoService";

const mongo = new MongoService();

export async function updateUsersModules(addUsers: string[], removeUsers: string[], moduleName: string) {
    //const leaderDetails = await mongo.userInfoUsername(moduleLeader);
    // await mongo.updateUser(moduleLeader, )

    const length = addUsers.length + removeUsers.length;
    let success = 0;
    for(let i = 0; i < length; i++) {
        let username: string = null;
        if(i+1 === addUsers.length+1) {
            username = removeUsers[i-addUsers.length]
        } else {
            username = addUsers[i];
        }

        const userDetails = await mongo.userInfoUsername(username);
        const moduleArray: string[] = userDetails["module_list"];

        if(i+1 === addUsers.length+1) {
            moduleArray.splice(moduleArray.indexOf(moduleName), 1);
        } else {
            moduleArray.push(moduleName);
        }

        const update = {
            $set: {
                module_list: moduleArray
            },
        };
        if(await mongo.updateUser(username, update)) {
            success++;
        }
    }

    if(success === length) {
        return true;
    }

    return false;
}