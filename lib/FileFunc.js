const fs = require('fs').promises;
const fsync = require('fs');
const { IdCodes } = require("./Codes");

class Log_File_Create_Read_Write_Funtions {
    /*
    This were file wrting function are define
     */
    async fileWriteOnly(fName, fInfo, time) {// This is for writing a into a file
        if (fName) {
            if (fInfo) {
                await fs.writeFile(fName, `${JSON.stringify({ Info: fInfo })}-----Written In ${time || null}\n`, { flag: 'a' });
                return { state: "ok", Id: IdCodes.Ids.ok, fun: "fileWriteOnly()", message: "logFileWrite ok" };
            } else {
                throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "fileWriteOnly()", Err: "fInfo is undefied. Please add a value" };
            };
        } else {
            throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "fileWriteOnly()", Err: "fName is undefied. Please add a value" };
        };
    };
    async fileCreateOnly(fName, fInfo, time) { // This is for creating a file
        if (fName) {
            if (fInfo) {
                await fs.writeFile(fName, `${JSON.stringify({ Info: fInfo })}------Written In ${time || null}\n`)
                return { state: "ok", Id: IdCodes.Ids.ok, fun: "fileCreateOnly()", message: "logFileCreate ok" };
            } else {
                throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "fileCreateOnly()", Err: "fInfo is undefied. Please add a value" };
            };
        } else {
            throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "fileCreateOnly()", Err: "fName is undefied. Please add a value" };
        };
    };
    async fileReadOnly(fName) { // This is for reading a file
        if (fName) {
            const readedData = await fs.readFile(fName);
            return { state: "ok", Id: IdCodes.Ids.ok, fun: "fileReadOnly()", message: readedData };
        } else {
            throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "fileReadOnly()", Err: "fName is undefied. Please add a value" };
        };
    };
    async createLotOfFile(arrayOfFiles, readFile, time) { // This is for creating lot of files
        if (arrayOfFiles.length === 0) {
            throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "createLotOfFiles()", Err: "empty array is undefied. Please add a value" };
        } else {
            if (typeof readFile !== "undefined" && readFile === true) {
                for (let i = 0; i < arrayOfFiles.length; i++) {
                    try {
                        await this.fileReadOnly(arrayOfFiles[i])
                    } catch (error) {
                        await this.fileCreateOnly(arrayOfFiles[i], `Created at ${time}`);
                    };
                };
            } else {
                for (let i = 0; i < arrayOfFiles.length; i++) {
                    await this.fileCreateOnly(arrayOfFiles[i], `Created at ${time}`);
                };
            };
            return { state: "ok", Id: IdCodes.Ids.ok, fun: "createLotOfFiles()", message: "createLotOfFiles ok" };
        };
    };
};
class Directry_Create_Check_File_Null_Check {
    async createDirectry(dname) {
        if (dname) {
            if (fsync.existsSync(dname)) {
                return { state: "ok", Id: IdCodes.Ids.ok, fun: "createDirectry()", message: "directry exits" };
            } else {
                fsync.mkdirSync(dname);
                if (fsync.existsSync(dname)) {
                    return { state: "ok", Id: IdCodes.Ids.ok, fun: "createDirectry()", message: "createDirectry ok" };
                } else {
                    throw { state: "Err", Id: IdCodes.Ids.createDirectryErr, fun: "createDirectry()", Err: "Cannot create directry" };
                };
            };
        } else {
            throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "createDirectry()", Err: "dname is undefied. Please add a value" };
        };
    };
    async directryExists(filepath) {
        if (filepath) {
            if (fsync.existsSync(filepath) === true) {
                return true;
            } else {
                return false;
            };
        } else {
            throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "directryExists()", Err: "filepath is undefied. Please add a value" };
        };
    };
};
class Json_Promise_Functions {
    async jsonParse(jsonData) {
        try {
            const jsonVarible = JSON.parse(jsonData);
            return jsonVarible;
        } catch (error) {
            throw error.toString();
        };
    };
    async jsonStringnify(jsonData) {
        try {
            const jsonStrVarible = JSON.stringify(jsonData);
            return jsonStrVarible;
        } catch (error) {
            throw error.toString();
        };
    };
};
module.exports = { fsync, fs, Log_File_Create_Read_Write_Funtions, Directry_Create_Check_File_Null_Check, Json_Promise_Functions };