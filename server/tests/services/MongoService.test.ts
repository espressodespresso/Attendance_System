import {IMongoService} from "../../src/services/MongoService";
import {ServiceFactory} from "../../src/services/ServiceFactory";
import {Collection} from "../../src/enums/Collection.enum";

let mongoService: IMongoService = null;

beforeAll(async () => {
    mongoService = ServiceFactory.createMongoService();
    await mongoService.mongoClient.connect();
})

afterAll(async () => {
    await mongoService.mongoClient.close();
})

describe('findOne', () => {
    test("Should return an object with a true boolean and an object result", async () => {
        const query = { username: "username" }
        const response = await mongoService.findOne(query, Collection.users);

        expect(response["status"]).toBe(true);
        expect(response["result"]).toBeInstanceOf(Object);
    });

    test("Should return an object with a false boolean and an null result", async () => {
        const query = { username: "thisisnotausername" }
        const response =  await mongoService.findOne(query, Collection.users);

        expect(response["status"]).toBe(false);
        expect(response["result"]).toBeNull();
    });
});

describe('findAll', () => {
    test('Should return an object with a true boolean and an array result', async () => {
        const response = await mongoService.findall(Collection.module);

        expect(response["status"]).toBe(true);
        expect(response["result"]).toBeInstanceOf(Array);
    });
});

describe('insertOne', () => {
    test('Should insert an object and return an object with a true boolean', async () => {
        const response =  await mongoService.insertOne({
            test: "this is different test data",
            module_data: "this is some module data"
        }, Collection.token);

        expect(response["status"]).toBe(true);
    });
});

describe('updateOne', () => {
    test('Should update an object and return a true boolean and an object result', async () => {
        const query = { test: "this is different test data" };
        const update = {
            $set: {
                module_data: "this is some different module data",
            },
        };
        const response =  await mongoService.updateOne(query, update, Collection.token);

        expect(response["status"]).toBe(true);
    })
});

describe('updateMany', () => {
    test('Should update multiple objects and return a true boolean and an object result', async () => {
        for(let i = 0; i < 3; i++) {
            const data = {
                test: "this is test data",
                module_data: `this is some module data ${i}`
            };
            await mongoService.insertOne(data, Collection.token);
        }

        const query = { test: "this is test data" };
        const update = {
            $set: {
                module_data: "this is some different module data",
            },
        };

        const response =  await mongoService.updateOne(query, update, Collection.token);

        expect(response["status"]).toBe(true);
    })
})

describe('replaceOne', () => {
    test('Should replace an object and return a true boolean and an object result', async () => {
        const query = { test: "this is different test data" };
        const update = {
            test: "this is different test data",
            module_data: "this is some different module data",
            extra: "this is new!"
        };
        const response =  await mongoService.replaceOne(query, update, Collection.token);

        expect(response["status"]).toBe(true);
    })
});

describe('deleteOne', () => {
    test('Should delete an object and return the result and a true boolean', async () => {
        const query = { test: "this is different test data" };
        const response = await mongoService.deleteOne(query, Collection.token);

        expect(response["status"]).toBe(true);
    })
});

describe('deleteMany', () => {
    test('Should delete multiple objects and return a true boolean and an object result', async () => {
        const query = { test: "this is test data" };
        const response = await mongoService.deleteMany(query, Collection.token);

        expect(response["status"]).toBe(true);
    })
})