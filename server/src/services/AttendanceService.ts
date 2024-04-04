import {MongoService} from "./MongoService";


export function generateCode(): number {
    return Math.round(Math.random() * (99999 - 10000) + 10000);
}

export async function updateUserAttendance(username: string,attendance: object[], module_name: string, date: Date): Promise<boolean> {
    console.log("L:");
    const located: object[] = attendance.filter(object => object["module"] === module_name);

    if(located.length > 0) {
        console.log("found");
        // Module with that name is found
        const module: object = located[0];
        const objAttended: Date[] = module["attended"];
        console.log("1");
        // Attended date is pushed into the array
        objAttended.push(date);
        console.log("2");
        // Create the replacment object with the updated date attended
        const updatedAttendance: object = {
            module: module_name,
            attended: objAttended
        }
        console.log("3");
        // Replace the object with the updated attendance object
        attendance[attendance.indexOf(module)] = updatedAttendance;
        console.log("4");
    } else {
        console.log("not found");
        // Module with the name isn't found hence has not attended before
        // Define a new date array and attendance object
        console.log("1.1");
        const attended: Date[] = [];
        attended.push(date);
        console.log("2.1");
        const attendanceObj: object = {
            module: module_name,
            attended: attended
        };
        console.log("2.3");
        // Attended date is pushed into the array
        attendance.push(attendanceObj);
        console.log("2.4");
    }

    console.log("5");
    const update = {
        $set: {
            attended: attendance
        },
    };

    console.log("6");
    // Update the section within the users document in the database
    const mongo = new MongoService();
    console.log("7");
    if(await mongo.updateUser(username, update)) {
        return true;
    }

    return false;
}