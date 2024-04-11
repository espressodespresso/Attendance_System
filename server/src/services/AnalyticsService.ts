import {MongoService} from "./MongoService";

export class AnalyticsService {
    private mongoService: MongoService = null;

    constructor() {
        this.mongoService = new MongoService();
    }
}