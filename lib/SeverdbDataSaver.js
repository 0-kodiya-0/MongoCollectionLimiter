const { MongoClient } = require('mongodb');
const { IdCodes } = require("./Codes");
const client = new MongoClient(process.env.MONGO_SERVER_DB_URI, {
    serverSelectionTimeoutMS: 1000,
});
class Mongodb_Custom_Db_Functions {
    /*
    These are the function that related with mongodb
    */
    async findDoc(db, colName, query, skipOpp) {
        if (db && colName && query && skipOpp) {
            await this.checkDbAndCol(db, colName);
            const readDb = client.db(db).collection(colName);
            const readLot = await readDb.find(query).toArray();
            if (skipOpp === true) { // This will return ok even  if (readLot === null || readLot.length === 0)
                return { state: "ok", Id: IdCodes.Ids.ok, In: "findDoc()", message: readLot };
            } else if (skipOpp === "One") { // This will just return the value only
                return readLot;
            } else {
                if (readLot === null || readLot.length === 0) { // This will return ok if (readLot !== null || readLot.length !== 0)
                                                                // or this will return a error
                    throw { state: "Error", Id: IdCodes.Ids.readDataErr, In: "findDoc()", Err: "Data reading error" };
                } else {
                    return { state: "ok", Id: IdCodes.Ids.ok, In: "findDoc()", message: readLot };
                };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "findDoc()", Err: `db = ${db} && colName = ${colName} && query = ${query} && skipOpp = ${skipOpp}` };
        };
    };
    async findWithLimitDoc(db, colName, query, skipOpp, limit) {
        if (db && colName && query && skipOpp && limit) {
            await this.checkDbAndCol(db, colName);
            const readDb = client.db(db).collection(colName);
            const findWithLimitResult = await readDb.find(query).limit(limit).toArray();
            if (skipOpp === true) { // This will return ok even  if (findWithLimitResult === null || findWithLimitResult.length === 0)
                return { state: "ok", Id: IdCodes.Ids.ok, In: "findWithLimitDoc()", message: findWithLimitResult };
            } else if (skipOpp === "One") { // This will just return the value only
                return findWithLimitResult;
            } else {
                if (findWithLimitResult === null || findWithLimitResult.length === 0) {// This will return ok if (findWithLimitResult !== null || findWithLimitResult.length !== 0)
                                                                                       // or this will return a error
                    throw { state: "Error", Id: IdCodes.Ids.readDataErr, In: "findWithLimitDoc()", Err: "Data reading error" };
                } else {
                    return { state: "ok", Id: IdCodes.Ids.ok, In: "findWithLimitDoc()", message: findWithLimitResult };
                };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "findWithLimitDoc()", Err: `db = ${db} && colName = ${colName} && query = ${query} && skipOpp = ${skipOpp} && limit = ${limit}` };
        };
    };
    async findWithSkipOnlyId(db, colName, query, skipOpp, skipNum) {
        if (db && colName && query && skipOpp && skipNum) {
            await this.checkDbAndCol(db, colName);
            const readDb = client.db(db).collection(colName);
            const findWithSkipDocResult = await (await readDb.find(query, { projection: { _id: 1 } }).skip(skipNum).toArray()).map(doc => doc._id);
            if (skipOpp === true) { // This will return ok even  if (findWithSkipDocResult === null || findWithSkipDocResult.length === 0)
                return { state: "ok", Id: IdCodes.Ids.ok, In: "findWithSkipOnlyId()", message: findWithSkipDocResult };
            } else if (skipOpp === "One") { // This will just return the value only
                return findWithSkipDocResult;
            } else {
                if (findWithSkipDocResult === null || findWithSkipDocResult.length === 0) {// This will return ok if (findWithSkipDocResult !== null || findWithSkipDocResult.length !== 0)
                                                                                           // or this will return a error
                    throw { state: "Error", Id: IdCodes.Ids.readDataErr, In: "findWithSkipOnlyId()", Err: "Data reading error" };
                } else {
                    return { state: "ok", Id: IdCodes.Ids.ok, In: "findWithSkipOnlyId()", message: findWithSkipDocResult };
                };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "findWithSkipOnlyId()", Err: `db = ${db} && colName = ${colName} && query = ${query} && skipOpp = ${skipOpp} && skipNum = ${skipNum}` };
        };
    };
    async deleteOneDoc(db, colName, query) {
        if (db && colName && query) {
            await this.checkDbAndCol(db, colName);
            const readDb = client.db(db).collection(colName);
            const deleteOneResult = await readDb.deleteOne(query);
            if (deleteOneResult.deletedCount === 0) {
                throw { state: "Error", Id: IdCodes.Ids.deleteDataErr, In: "deleteOneDoc()", Err: "Data deleting error" };
            } else {
                return { state: "ok", Id: IdCodes.Ids.ok, In: "deleteOneDoc()", message: deleteOneResult };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "deleteOneDoc()", Err: `db = ${db} && colName = ${colName} && query = ${query}` };
        };
    };
    async deleteManyDoc(db, colName, query) {
        if (db && colName && query) {
            await this.checkDbAndCol(db, colName);
            const readDb = client.db(db).collection(colName);
            const deleteManyResult = await readDb.deleteMany(query);
            if (deleteManyResult.deletedCount === 0) {
                throw { state: "Error", Id: IdCodes.Ids.deleteDataErr, In: "deleteManyDoc()", Err: "Data deleting error" };
            } else {
                return { state: "ok", Id: IdCodes.Ids.ok, In: "deleteManyDoc()", message: deleteManyResult };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "deleteManyDoc()", Err: `db = ${db} && colName = ${colName} && query = ${query}` };
        };
    };
    async updateOneDoc(db, colName, query, uQuery) {
        if (db && colName && query && uQuery) {
            await this.checkDbAndCol(db, colName);
            const readDb = client.db(db).collection(colName);
            const updateOneDocResult = await readDb.updateOne(query, updateValue);
            if (updateOneDocResult.modifiedCount === 0) {
                throw { state: "Error", Id: IdCodes.Ids.updateDataErr, In: "updateOneDoc()", Err: "Data updating error" };
            } else {
                return { state: "ok", Id: IdCodes.Ids.ok, In: "updateOneDoc()", message: updateOneDocResult };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "updateOneDoc()", Err: `db = ${db} && colName = ${colName} && query = ${query} && uQuery = ${uQuery}` };
        };
    };
    async addData(db, colName, adData) { // This will added data
        if (db) {
            if (colName) {
                if (adData) {
                    await this.checkDbAndCol(db, colName);
                    const addb = client.db(db);
                    const adCollection = addb.collection(colName);
                    await adCollection.insertOne(adData);
                    return { state: "ok", Id: IdCodes.Ids.ok, In: "addData()", message: "Data added" };
                } else {
                    throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData()", Err: "Please check the value adData again or please add a value" };
                };
            } else {
                throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData()", Err: "Please check the value colName again or please add a value" };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData()", Err: "Please check the value db again or please add a value" };
        };
    };
    async addData_Many(db, colName, adData) { // This will added lot of data
        if (db) {
            if (colName) {
                if (adData) {
                    await this.checkDbAndCol(db, colName);
                    const addb = client.db(db);
                    const adCollection = addb.collection(colName);
                    await adCollection.insertMany(adData);
                    return { state: "ok", Id: IdCodes.Ids.ok, In: "addData_Many()", message: "Data added" };
                } else {
                    throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData_Many()", Err: "Please check the value adData again or please add a value" };
                };
            } else {
                throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData_Many()", Err: "Please check the value colName again or please add a value" };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData_Many()", Err: "Please check the value db again or please add a value" };
        };
    };
    async dbExsits(db) {
        if (db) {
            await client.connect();
            const testdb = client.db("test");
            const admindb = testdb.admin();
            const availableDb = await admindb.listDatabases();
            for (let i = 0; i < availableDb.databases.length; i++) {
                if (availableDb.databases[i].name === db) {
                    return { state: "ok", Id: IdCodes.Ids.exists, In: "dbexsits()", message: "db exists" };
                } else if (availableDb.databases.length === i + 1) {
                    throw "db doesn't exists";
                };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "addData()", Err: "Please check the value db again or please add a value" };
        };
    };
    async colExists(db, colName, rejectTrue) {
        if (db) {
            if (colName) {
                await this.dbExsits(db);
                await this.dbConnect();
                const colExDb = client.db(db);
                const colections = await colExDb.listCollections().toArray();
                if (typeof rejectTrue !== "undefined" && rejectTrue === true) {
                    for (let i = 0; i < colections.length; i++) {
                        if (colections[i].name === colName) {
                            return { state: "ok", Id: IdCodes.Ids.exists, In: "colExsits()", message: "col exists" };
                        };
                    };
                    throw "col doesn't exists";
                } else {
                    for (let i = 0; i < colections.length; i++) {
                        if (colections[i].name === colName) {
                            return true;
                        };
                    };
                    return false;
                };
            } else {
                throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "colExists()", Err: "Please check the value colName again or please add a value" };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "colExists()", Err: "Please check the value db again or please add a value" };
        };
    };
    async dbConnect() {
        await client.connect();
        return { state: "ok", Id: IdCodes.Ids.exists, In: "dbConnect()", message: "Db connection ok" };
    };
    async documentNum(db, col) {
        if (db && col) {
            await client.connect();
            await this.colExists(db, col, true);
            const returnCount = await client.db(db).collection(col).countDocuments();
            return returnCount;
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "documentNum()", Err: "Please check the value db && col again or please add a value" };
        };
    };
    async col_Name_Return(db) {
        if (db) {
            await client.connect();
            const col_List = await client.db(db).listCollections().toArray();
            const colNames = [];
            for (let i = 0; i < col_List.length; i++) {
                colNames.push(col_List[i].name);
            };
            return colNames;
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "db_Name_Return", Err: "db === null" };
        };
    };
    async checkDbAndCol(db, colName) {
        try {
            await this.dbConnect();
            await this.dbExsits(db);
            await this.colExists(db, colName);
            return "ok";
        } catch (error) {
            throw error;
        };
    };
};
module.exports = { Mongodb_Custom_Db_Functions, client };