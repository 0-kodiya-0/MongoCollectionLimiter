const { client } = require("../lib/SeverdbDataSaver");
const { Mongo_Limit_Checker_Funtions } = require("../lib/limitCheckerFunc");
const { Error_Function_Class } = require("../lib/errorFunc");
const { colWatcherEvent } = require("../lib/eventEmitterLib");

const error_Function_Class = new Error_Function_Class();
const mongo_Limit_Checker_Funtions = new Mongo_Limit_Checker_Funtions();

/****************************************************************************************************/
/*
 This will listen for errors happing in process
*/
process.on("uncaughtException", async (error) => {
    await error_Function_Class.global_Write("uncaughtException", error, false, false);
});
process.on("uncaughtExceptionMonitor", async (error) => {
    await error_Function_Class.global_Write("uncaughtExceptionMonitor", error, false, false);
});
process.on('unhandledRejection', async (error) => {
    await error_Function_Class.global_Write("unhandledRejection", error, false, false);
});
/****************************************************************************************************/

/****************************************************************************************************/
/*
 This will listen for errors happing in mongoDB communication and command execution
*/
client.on("error", async (error) => {
    await error_Function_Class.db_Write("client.on(error)", error, false, false);
});
client.on("close", async (error) => {
    await error_Function_Class.db_Write("client.on(close)", error, false, false);
});
client.on("commandFailed", async (command) => {
    await error_Function_Class.db_Write("client.on(commandFailed)", command), false, false;
});
client.on("connectionCheckOutFailed", async (connection) => {
    await error_Function_Class.db_Write("client.on(connectionCheckOutFailed)", connection, false, false);
});
/****************************************************************************************************/


colWatcherEvent.on("watchDB", async (db, colNames) => {
    try {
        console.log(`Watch started in database ${db}`);
        const database = client.db(db).watch();
        database.on("change", async (data) => { //This is the event emitter that listen for chages in mongodb given database
            await mongo_Limit_Checker_Funtions.database_Change_Listener(data);
        });
        database.on("error", async (error) => { //This is the event emitter that listen for errors in mongodb given database
            await error_Function_Class.db_Write("database.on(error)", error, false, false);
        });
    } catch (error) {
        await error_Function_Class.db_Write("colWatcherEvent.on('watchDB')", error, false, false);
    };
});

/****************************************************************************************************/
colWatcherEvent.on("arrayCheck", mongo_Limit_Checker_Funtions.array_Checker); //This print the array that containes the collection info
colWatcherEvent.on("overFlowWatch", mongo_Limit_Checker_Funtions.over_Flow_Watch);/*
                                                                                     This is overFlow watch funtion that will check if 
                                                                                     any documents get overflowed and if overflowed it 
                                                                                     will delete it (read limitCheckerFunc.js)
                                                                                  */
colWatcherEvent.on("overFlowWatchWait", mongo_Limit_Checker_Funtions.over_Flow_Watch_Wait_Timer); // This is overFlow watch wait timer
                                                                                                  // (read limitCheckerFunc.js)
/****************************************************************************************************/