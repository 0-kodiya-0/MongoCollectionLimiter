/*
 **********************************************************************************************************************************
 This is simple NodeJs project created for limiting number of documents in a Mongodb collection.
 
 Why I created this project :- I have a server that add data to a collection and I want the server to stop adding more documents
                               to the collection when a limit reached

                               To make this happen what I first did is check for the document num in the collection in MongoDB from
                               the server and add data to the collection if the document num is lower that my limit. if document num
                               reached my limit then the server will stop adding documents to collection.
                               
                               The server is http server and documents are added to Mongodb when a http post request comes to server.
                               The server will add documents to the collection and when limit reached server will stop adding documents.

                               This works correctly in small load to the http server. That means when a http request hit the http 
                               server one's a second. But when in a huge load to the http server it will overflow the limit by adding
                               more documents to the collection. I don't why it does that.
                               
                               When in debuging what I found was that when I write a insert command to MongoDB server it will not 
                               write it to the collection but it will return that it is written. So the http server will thinks that it
                               is written. But in that time when the http server read the document num immediately in the collection it
                               will not return the real document num. Because still the insert command have not added data.
                               So the http server thinks that there is no data and it will keep adding. But the insert command have 
                               executed to MongoDB and it will write it to the collection after some time. So it will result the num
                               of documents in a collection to over flow my limit.

                               When the http server in small load adding documents will stop in the correct limit. Because it has
                               time. When in huge load things need to be quick and the problem happened.

                               I have tried adding what is called the write concert in MongoDB and some other stuff but non of them 
                               worked.

                               So I created this project. What it will do is it will watch a collection and limit is set to that 
                               collection and when a insert command happens to that collection it check if it overflowes the limit and
                               if overflowes the limit it will delete the overflowed document.
                               
                             > I don't know if you understand my problem and I am still 16 and new to javascript and nodejs. If there
                               is any error in this code or if I am written the code in a diffrent style or if there is something that
                               is need to be improved in my codeing please report and I will fix it.
 **********************************************************************************************************************************
*/
require("./src/emitingFunc");//The functions get executed when a event is emitted 
const { Mongodb_Custom_Db_Functions } = require("./lib/SeverdbDataSaver");//Functions for comunicating with mongodb
const { DIR, Directry_Create_Check_File_Null_Check, Log_File_Create_Read_Write_Funtions } = require("./lib/FileFunc");//Functions for writing files
const { log_File_Path, files } = require("./lib/File-Name");
const { Random_Things_Gen } = require("./lib/randomGen");//Funtions for generating random things
const { IdCodes } = require("./lib/Codes");//Ids for when throwing errors
const { Error_Function_Class } = require("./lib/errorFunc");//Functions for writing a log Files when happed 
                                                            //a error and displaying it in the console
const { Boot_Up_Funtions } = require("./lib/bootUpFunc");//Funtions that will run when in the boot up

const mongodb_Custom_Db_Functions = new Mongodb_Custom_Db_Functions();
const log_File_Create_Read_Write_Funtions = new Log_File_Create_Read_Write_Funtions();
const directry_Create_Check_File_Null_Check = new Directry_Create_Check_File_Null_Check();
const random_Things_Gen = new Random_Things_Gen();
const error_Function_Class = new Error_Function_Class();
const boot_Up_Funtions = new Boot_Up_Funtions();

async function createNeededFiles() {
    /*
    This funtion will create the log files for writing errors
          1) global_Log file for wrting globaly happend errors
          2) db_Log file for writing Mongodb happend errors in communication and command execution
    */
    if (log_File_Path) {
        const global_log = await directry_Create_Check_File_Null_Check.directryExists(`${log_File_Path}/global_Log`);
        const db_log = await directry_Create_Check_File_Null_Check.directryExists(`${log_File_Path}/db_Log`);
        if (global_log === false && db_log === false) {
            await directry_Create_Check_File_Null_Check.createDirectry(`${log_File_Path}/global_Log`).then(console.log);
            await directry_Create_Check_File_Null_Check.createDirectry(`${log_File_Path}/db_Log`).then(console.log);
            await log_File_Create_Read_Write_Funtions.createLotOfFile(files, false, await random_Things_Gen.date_time()).then(console.log);
            return { state: "ok", Id: IdCodes.Ids.ok, fun: "createNeededFiles", IssuedDate: null };
        } else if (global_log === false && db_log === true) {
            await directry_Create_Check_File_Null_Check.createDirectry(`${log_File_Path}/global_Log`);
            await log_File_Create_Read_Write_Funtions.createLotOfFile(files, false, await random_Things_Gen.date_time());
            return { state: "ok", Id: IdCodes.Ids.ok, fun: "createNeededFiles", IssuedDate: null };
        } else if (db_log === false && global_log === true) {
            await directry_Create_Check_File_Null_Check.createDirectry(`${log_File_Path}/db_Log`);
            await log_File_Create_Read_Write_Funtions.createLotOfFile(files, false, await random_Things_Gen.date_time());
            return { state: "ok", Id: IdCodes.Ids.ok, fun: "createNeededFiles", IssuedDate: null };
        } else {
            await log_File_Create_Read_Write_Funtions.createLotOfFile(files, true, await random_Things_Gen.date_time());
            return { state: "ok", Id: IdCodes.Ids.ok, fun: "createNeededFiles", IssuedDate: null };
        };
    } else {
        throw { state: "Err", Id: IdCodes.Ids.Undefined, fun: "createNeededFiles", IssuedDate: null, Err: "Please add valid LOG_FILE_PATH" };
    };
};
async function main() {
    /*
    The main function that gets executed

    ***Note :- First check the lib file limtiCheckerFunc.js and then look in other files***
    */
    await createNeededFiles().then(async () => {
        try {
            await boot_Up_Funtions.env_Check();
            await mongodb_Custom_Db_Functions.dbConnect();
            await boot_Up_Funtions.collection_adder();
        } catch (error) {
            await error_Function_Class.global_Write("error in main", error, true, true);
        };
    }).catch(async (errorInCreateNeedFiles) => {
        await error_Function_Class.global_Write("error in main", errorInCreateNeedFiles, true, true);
    });
};
main();