import {Collection} from "../enums/Collection.enum";
import {AuthState} from "../enums/AuthState.enum";
import {AccountService} from "./AccountService";
import { MongoClient } from 'mongodb'

export class MongoService {
    //private client = new MongoClient(process.env["MONGOURI "]);
    private client = new MongoClient("");
    private database = this.client.db('database');
    private usersCollection = this.database.collection('users');
    private tokenCollection = this.database.collection('tokens');
    private moduleCollection = this.database.collection('module');
    private attendanceCollection = this.database.collection('attendance');

    async findOne(query: object, collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).findOne(query);
        if(result === null) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async findall(collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).find({}).toArray();
        if(result === null) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async insertOne(data: object, collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).insertOne(data);
        if(!result.acknowledged) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async deleteOne(query: object, collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).deleteOne(query);
        if(result.deletedCount !== 1) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async deleteMany(query: object, collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).deleteMany(query);
        if(!result.acknowledged) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async updateOne(filter: object, data: object, collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).updateOne(filter, data);
        if(result.modifiedCount !== 1) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    async replaceOne(query: object, replacement: object, collection: Collection): Promise<object> {
        const result = await this.getCollection(collection).replaceOne(query, replacement);
        if(!result.acknowledged) {
            return this.objResponse(false, null);
        }

        return this.objResponse(true, result);
    }

    private objResponse(status: boolean, result: any): object {
        return {
            status: status,
            result: result
        }
    }

    private getCollection(collection: Collection) {
        switch (collection) {
            case Collection.users:
                return this.usersCollection;
            case Collection.token:
                return this.tokenCollection;
            case Collection.module:
                return this.moduleCollection;
            case Collection.attendance:
                return this.attendanceCollection;
        }
    }

    async handleConnection(innerFunc: (...args: any[]) => any) {
        try {
            await this.client.connect();
            return await innerFunc();
        } catch (e) {
            console.log(e);
        } finally {
            await this.client.close();
        }
    }
}