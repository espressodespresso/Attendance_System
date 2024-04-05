import {MongoService} from "./MongoService";

export function generateCode(): number {
    return Math.round(Math.random() * (99999 - 10000) + 10000);
}

export async function updateUserAttendance(username: string,attendance: object[], module_name: string, date: Date): Promise<boolean> {
    const located: object[] = attendance.filter(object => object["module"] === module_name);

    if(located.length > 0) {
        // Module with that name is found
        const module: object = located[0];
        const objAttended: Date[] = module["attended"];
        // Attended date is pushed into the array
        objAttended.push(date);
        // Create the replacment object with the updated date attended
        const updatedAttendance: object = {
            module: module_name,
            attended: objAttended
        }
        // Replace the object with the updated attendance object
        attendance[attendance.indexOf(module)] = updatedAttendance;
    } else {
        // Module with the name isn't found hence has not attended before
        // Define a new date array and attendance object
        const attended: Date[] = [];
        attended.push(date);
        const attendanceObj: object = {
            module: module_name,
            attended: attended
        };
        // Attended date is pushed into the array
        attendance.push(attendanceObj);
    }

    const update = {
        $set: {
            attended: attendance
        },
    };

    // Update the section within the users document in the database
    const mongo = new MongoService();
    if(await mongo.updateUser(username, update)) {
        return true;
    }

    return false;
}