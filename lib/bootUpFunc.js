const { Mongodb_Custom_Db_Functions, client } = require("./SeverdbDataSaver");
const { colWatcherEvent } = require("./eventEmitterLib");
const { col_Names, max_Collection_Limit } = require("./limitCheckerFunc");
const { IdCodes } = require("./Codes");
const { Error_Function_Class } = require("./errorFunc");
const mongodb_Custom_Db_Functions = new Mongodb_Custom_Db_Functions();
const error_Function_Class = new Error_Function_Class();

class Boot_Up_Funtions {
    async collection_adder() { // This is the function that will add the collection names and the collection limit to col_Names array
        colWatcherEvent.emit("arrayCheck");
        const col_Name_Return_Array = await mongodb_Custom_Db_Functions.col_Name_Return(process.env.DB_NAME);
        console.log("-----------------------------------------------------------------");
        console.log("These are the collection in the given db :-");
        console.log(col_Name_Return_Array);
        console.log("-----------------------------------------------------------------");
        for (let i = 0; i < col_Name_Return_Array.length; i++) { // This for loop is for looping through the return collections 
            const col_Name = col_Name_Return_Array[i];
            if (col_Name[0].slice(0, 1) === process.env.COLL_IDENTIFY_VALUE) { // This run for the collections with COLL_IDENTIFY_VALUE
                if (col_Names.length === 0) {
                    const max_Doc_Value = await mongodb_Custom_Db_Functions.findDoc(process.env.DB_NAME, col_Name_Return_Array[i], { _id: process.env.CONF_ID }, true);
                    if (max_Doc_Value.message[0]) {
                        col_Names[0] = [col_Name_Return_Array[i]]; // This will add the collection name to the col_Names[0][1] 
                        if (max_Doc_Value.message[0].collectionLimit) {
                            col_Names[0][1] = max_Doc_Value.message[0].collectionLimit;  // This will add collection limit to col_Names[0][1]
                        } else {
                            col_Names[0][1] = null;
                        };
                    };
                } else {
                    if (max_Collection_Limit === col_Names.length || max_Collection_Limit < col_Names.length) { // This will run if the max collection limit reached
                        console.log("-----------------------------------------------------------------");
                        console.log("Max columns num reached");
                        console.log(`Watching columns ---- ${col_Names}`);
                        console.log("If you want more columns to watch increase the >> process.env.MAX_COLUMNS << value");
                        console.log("Default value is  ---- 10");
                        console.warn("Please increase the value at own reask >>> Because two much columns to watch will dicrease performance <<<");
                        console.log("-----------------------------------------------------------------");
                        break;
                    } else {
                        const max_Doc_Value = await mongodb_Custom_Db_Functions.findDoc(process.env.DB_NAME, col_Name_Return_Array[i], { _id: process.env.CONF_ID }, true);
                        if (max_Doc_Value.message[0]) {
                            col_Names[col_Names.length] = [col_Name_Return_Array[i]]; // This will add the collection name to the col_Names[i][1] 
                            if (max_Doc_Value.message[0].collectionLimit) {
                                col_Names[col_Names.length - 1][1] = max_Doc_Value.message[0].collectionLimit; // This will add collection limit to col_Names[i][1]
                            } else {
                                col_Names[col_Names.length - 1][1] = null;
                            };
                        };
                    };
                };
            };
        };
        if (col_Names.length !== 0) {
            await this.document_Num_Adder_When_Boot_Up();
            colWatcherEvent.emit("watchDB", process.env.DB_NAME, col_Names);
            console.log("-----------------------------------------------------------------");
            console.log("These are the collection that is watching in the given db :-");
            console.log(col_Names);
            console.log("-----------------------------------------------------------------");
            await this.overFlow_Checker_In_Boot_Up();
            colWatcherEvent.emit("overFlowWatch");
        } else {
            console.log("\n-----------------------------------------------------------------");
            console.log("There are no collection to watch");
            console.warn("\nPlease check that if you have collections with the COLL_IDENTIFY_VALUE");
            console.log("Or");
            console.warn("Please check that if you have added CONF document to a collection with the COLL_IDENTIFY_VALUE");
            console.log("-----------------------------------------------------------------");
            await error_Function_Class.global_Write("collection_adder()", "So exiting the process", false, true);

        };
        return;
    };
    async document_Num_Adder_When_Boot_Up() { //  This function add the real document num in the boot up to col_Names[0][2]
        for (let i = 0; i < col_Names.length; i++) {
            if (col_Names[i][1] !== null && typeof col_Names[i][1] !== "undefined") {
                const docNum = await mongodb_Custom_Db_Functions.documentNum(process.env.DB_NAME, col_Names[i][0]);
                col_Names[i][2] = docNum - 1; // Ignore the CONF doc (read limitCheckerFunc.js)
            };
        };
        return;
    };
    async overFlow_Checker_In_Boot_Up() {
        /*
         This function will check if col_Names[0][1] and col_Names[0][2] is equal or if col_Names[0][2] > col_Names[0][1];

         If col_Names[0][2] > col_Names[0][1] this function will remove the overflowed documents.
         This is done when data is also inserting (read the insert switch case in limitCheckerFunc.js).s
         
         This funtion will also run every 25000ms after the boot up (check limitCheckerFunc.js )
        */
        for (let i = 0; i < col_Names.length; i++) {
            if (col_Names[i][2] > col_Names[i][1] || col_Names[i][1] === null || typeof col_Names[i][1] === "undefined") {
                if (col_Names[i][1] !== null && typeof col_Names[i][1] !== "undefined") {
                    const readed_Data = await mongodb_Custom_Db_Functions.findWithSkipOnlyId(process.env.DB_NAME, col_Names[i][0], {}, true, col_Names[i][1] + 1);
                    if (readed_Data.message.length !== 0) {
                        console.log(`Collection ${col_Names[i][0]} has overFlowed`);
                        await mongodb_Custom_Db_Functions.deleteManyDoc(process.env.DB_NAME, col_Names[i][0], { _id: { $in: readed_Data.message } });
                        console.log(`Deleted ${col_Names[i][2] - col_Names[i][1]} documents in collection ${col_Names[i][0]}`);
                    };
                } else {
                    if (col_Names[i][2] !== 0) {
                        await mongodb_Custom_Db_Functions.deleteManyDoc(process.env.DB_NAME, col_Names[i][0], {});
                    } else {
                        console.log(`there is no data in collection ${col_Names[i][0]}`);
                    };
                };
            } else {
                if (col_Names[i][2] !== 0) {
                    console.log(`Data in collection ${col_Names[i][0]} has ${col_Names[i][2]} documents and limit is ${col_Names[i][1]}`);
                } else {
                    console.log(`there is no data in collection ${col_Names[i][0]}`);
                };
            };
        };
        return;
    };
    async env_Check() { // This will check for the env variables that must need to be define
        // If these env variable is undefine the server should not be running 
        if (process.env.DB_NAME) {
            if (process.env.LOG_FILE_PATH) {
                if (process.env.COLL_IDENTIFY_VALUE) {
                    if (process.env.CONF_ID) {
                        return "ok";
                    } else {
                        throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "env_Check()", Err: `env.CONF_ID = ${process.env.CONF_ID}` };
                    };
                } else {
                    throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "env_Check()", Err: `env.COLL_IDENTIFY_VALUE = ${process.env.COLL_IDENTIFY_VALUE}` };
                };
            } else {
                throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "env_Check()", Err: `env.LOG_FILE_PATH = ${process.env.LOG_FILE_PATH}` };
            };
        } else {
            throw { state: "Error", Id: IdCodes.Ids.Undefined, In: "env_Check()", Err: `env.DB_NAME = ${process.env.DB_NAME}` };
        };
    };
};
module.exports = { Boot_Up_Funtions };