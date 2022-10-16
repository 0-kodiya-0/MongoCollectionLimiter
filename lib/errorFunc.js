const { Log_File_Create_Read_Write_Funtions, Json_Promise_Functions } = require("./FileFunc");
const { file_Names_Obj } = require("./File-Name");
const { Random_Things_Gen } = require("./randomGen");

const json_Promsie_Func = new Json_Promise_Functions();
const log_Create_Read_Write = new Log_File_Create_Read_Write_Funtions();
const random_Things_Gen = new Random_Things_Gen();

class Error_Function_Class {
    /*
    These are two functions for writing errors into log files and printing them in console if need
    */
    async db_Write(where, error, consoleOnly, processExit) { // This will write errors that is related with mongodb
        try {
            if (typeof error === "object" && error instanceof ReferenceError === false && error instanceof TypeError === false) {
                await log_Create_Read_Write.fileWriteOnly(file_Names_Obj.db_Log_E, `In ${where} ---` + await json_Promsie_Func.jsonStringnify(error), await random_Things_Gen.date_time());
                console.error(`\n----------------------------------------- In ${where} -----------------------------------------`);
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            } else if (typeof error === "string" || error instanceof ReferenceError === true || error instanceof TypeError === true) {
                await log_Create_Read_Write.fileWriteOnly(file_Names_Obj.db_Log_E, `In ${where} ---` + error.toString(), await random_Things_Gen.date_time());
                console.error(`\n----------------------------------------- In ${where} -----------------------------------------`);
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            } else if (consoleOnly === true && processExit === false) {
                console.error(`\n----------------------------------------- In ${where} -----------------------------------------`);
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            } else {
                console.error(error);
            };
            if (processExit === true) { // This will exit the process if processExit === true
                process.exit(1);
            } else {
                console.log("\n----------------------------------------- Error happened but not exiting -----------------------------------------");
            };
        } catch (errorInJsonStringfy) { // If there is an error while wrting that data it will just print it to the console
            console.log("\n-----------------------------------------");
            console.log("Error happen in global_Write");
            console.log("Error is :-")
            console.error(errorInJsonStringfy);
            console.log("\n-----------------------------------------");
            console.log("\n-----------------------------------------");
            console.log(`The real error is in ${where}`);
            console.log("Error is :-")
            console.error(error);
            console.log("\n-----------------------------------------");
        };
    };
    async global_Write(where, error, consoleOnly, processExit) { // This will write errors that global happend
        try {
            if (consoleOnly === false && typeof error === "object" && error instanceof ReferenceError === false && error instanceof TypeError === false) {
                await log_Create_Read_Write.fileWriteOnly(file_Names_Obj.global_Log_E, `In ${where} ---` + await json_Promsie_Func.jsonStringnify(error), await random_Things_Gen.date_time());
                console.error(`\n----------------------------------------- In ${where} -----------------------------------------`);
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            } else if (consoleOnly === false && typeof error === "string" || error instanceof ReferenceError === true || error instanceof TypeError === true) {
                await log_Create_Read_Write.fileWriteOnly(file_Names_Obj.global_Log_E, `In ${where} ---` + error.toString(), await random_Things_Gen.date_time());
                console.error(`\n----------------------------------------- In ${where} -----------------------------------------`);
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            } else if (consoleOnly === true && processExit === false) {
                console.error(`\n----------------------------------------- In ${where} -----------------------------------------`);
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            } else {
                console.error("-------------------------------------------------------------------------------------------------");
                console.error(error);
                console.error("-------------------------------------------------------------------------------------------------");
            };
            if (processExit === true) { // This will exit the process if processExit === true
                process.exit(1);
            } else {
                console.log("\n----------------------------------------- Error happened but not exiting -----------------------------------------");
            };
        } catch (errorInJsonStringfy) { // If there is an error while wrting that data it will just print it to the console
            console.log("\n-----------------------------------------");
            console.log("Error happen in global_Write");
            console.log("Error is :-")
            console.error(errorInJsonStringfy);
            console.log("\n-----------------------------------------");
            console.log("\n-----------------------------------------");
            console.log(`The real error is in ${where}`);
            console.log("Error is :-")
            console.error(error);
            console.log("\n-----------------------------------------");
        };
    };
};
module.exports = { Error_Function_Class };