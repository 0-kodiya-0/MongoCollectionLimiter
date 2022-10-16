const { Mongodb_Custom_Db_Functions } = require("./SeverdbDataSaver");
const mongodb_Custom_Db_Functions = new Mongodb_Custom_Db_Functions();
const { colWatcherEvent } = require("./eventEmitterLib");

let col_Names = [];
/*
 *************************************************THIS IS IMPORTANT*************************************************
 col_Names is the array that keep the info about the collection Name & collection limit & collection real doc count.
 
 col_Names is 2d array and it look like this [[collection Name , collection limit , collection real doc count]].

 1) Any collection name goes into "collection Name" (col_Names[0][0] === collection Name)
    
   * The collection that need to be limited is identify by the "COLL_IDENTIFY_VALUE" in the env variable.
     That means you need to name your collection that need to be limited with the "COLL_IDENTIFY_VALUE" in the first

     example :- My collection name is orders. I want to make that collection a limited collection.
                So I need to specify my collection name with COLL_IDENTIFY_VALUE env variable. (My COLL_IDENTIFY_VALUE === *).
                So I need to rename my collection as "*orders".
     
     **** Note :- How does the server identify the collection that need to be limited is
                  1) It will read all collections in the given database (You can sepcify your db name in the DB_NAME env variable).
                  2) Then it will check the collections with the "COLL_IDENTIFY_VALUE".
                  3) If it see a collection with a "COLL_IDENTIFY_VALUE" it will add it to the col_Names[0][0].
   
   * col_Names[0][0] will get updated live after boot up When every time you create a collection with "COLL_IDENTIFY_VALUE" and insert 
     the CONF document that is specified below ( read 2) ).
     And will get deleted live after boot up when you delete a collection with the "COLL_IDENTIFY_VALUE".   

     **** Note :- The function that will do the job in the boot up is in the bootUpFunc.js file.
                  The functions for adding and deleteing the value live after the boot up is define in this file inside
                  the ( switch case insert and drop ).

 2) Collection limit goes to the "collection limit" (col_Names[0][1] === collection limit) 

   * You need to set the "collection limit" in the collection as a document with the id that you specified in the ( "CONF_ID" ) env variable.
     And you should add the limit (that means the num) in the document with corresponding variable "collectionLimit"

       The document in the collection should look like this
                                                            {
                                                             _id: "The id that you specified in the CONF_ID env variable in the nodeJs process"
                                                             collectionLimit: Any limit here. ( Note:- the num should be a integer not a string )
                                                            }
       This document is called the ** CONF ** document.

       **** Note :- You should have the above document in every collection that you want to limit.
                  
                   example :- ( If you have 5 collections to limit all 5 collections should have the above document with 
                                specific detailes ).
                                                                                      
   * When in the boot up it will read the id (that means the id that you specified in CONF_ID env variable) from the collection and 
     check the collectionLimit variable and add the value to col_Names[0][1]. If null it will add null.

   * When you update collectionLimit variable in the CONF document it will also update the col_Names[0][1] num. 
     And when you delete the CONF document col_Names[0][1] & col_Names[0][2] will be null
      
       **** Note :- The function that will do the job is in the bootUpFunc.js file.
                    The functions for updating and deleteing the value live after the boot up is define in this file inside
                    the ( switch case insert and update ).

 3) The real document num will be added to the "collection real doc count" (col_Names[0][2] === collection real doc count)
    
    * The real document num will ignore the above specified document that is called the " CONF " document and add all other documents

        **** Note :- Not the document it self not get added. The server will read if there is a document and if there it will increase 
                     the realDoc num by 1 (col_Names[0][2] + 1). For every document it will increase col_Names[0][2] value.
                    
                     example :- There is 3 documents (3 document is with CONF document included). 
                                When it ignore the CONF document there will be 2 documents left.
                                Then it will increase the col_Names[0][2] by +2 (this done by a for loop. it will not add two. first increase value by 1 and then if another doc exist again value will be increase by 1 and will stop when there is no documents)

    * The col_Names[0][2] will increase and decrease when document get added or deleted when after the boot up
       
        **** Note :- The function that will increase the col_Names[0][2] in the boot up is in the bootUpFunc.js file.
                     The functions for increaseing and decreaseing the value live after the boot up is define in this file inside
                     the ( switch case insert and delete )
*/
const max_Collection_Limit = parseInt(process.env.MAX_COLUMNS) || 5; /* This max collection value.
                                                               This make sure that server is only watching for a certain number of collections.
                                                               If the server is watching for lot of collection server performance will not be great.
                                                               The default is 5 but you can add a custom num in MAX_COLUMNS env variable.
                                                               **** Note :- When you increase please check if server can handle it.

                                                               *****Remainder ------ NodeJs is a single thread ------*****
                                                               * 
                                                               This project is not multi threaded maybe in the future
                                                            */

class Mongo_Limit_Checker_Funtions {
    /*
    This funtions get run every time some change happen to watching database.

        **** Note :- One eventEmitter is fired when change happen. (this eventEmiitter is define in src/emitingFunc.js).
                     And only one database can be watched by a single node.

    If you don't know you can watch for changes in one collection in a database or changes in one hole database.
    So I have programme it to watch for hole database.
    */
    async database_Change_Listener(data) {
        switch (data.operationType) { // Every time a change happen to a database it will return a document and it include the operation type
            // There are lots of operation types and I am using only insert & update & delete & drop
            case "insert":
                // In one database there can be limited collections and none limtied collections.
                // If some change happen to a none limited collection it will ignore it.
                // That is what this if state is doing 
                if (data.ns.coll[0] === process.env.COLL_IDENTIFY_VALUE) {
                    if (data.documentKey._id === process.env.CONF_ID) { // This if state check the inserting value is a CONF doc or not
                        await this.over_Flow_Watch_Wait_On(); /*
                                                                This overflow wait function.
                                                                This get run every time a data get added.

                                                                Because there is function called over_Flow_Watch(). It will run
                                                                every 25000ms.
                                                                What it will do is commented inside that function. Please read it. 
                                                                It is in this file.

                                                                If that function get fired when data is inserting there will be a error.

                                                                So for that "over_Flow_Watch_Wait_On()" function get run every time when 
                                                                a new data is adding.
                                                                What it will do is it simply say to "over_Flow_Watch()" function to 
                                                                not do any thing and just return as it is done at that time if the 
                                                                "over_Flow_Watch()" function is running.
                                                              */
                        if (col_Names.length === 0) { // This will run if there is not data in col_Names
                            col_Names[0] = [data.ns.coll]; // This will add the collection Name
                            col_Names[0][1] = data.fullDocument.collectionLimit; // This will add the collection limit  
                            col_Names[0][2] = await mongodb_Custom_Db_Functions.documentNum(process.env.DB_NAME, col_Names[0][0]) - 1;// Ignore the CONF doc that's why -1 from the real docNum  (read the top)
                            console.log(`New collection added ${col_Names[0][0]}`);
                        } else {// This will run if there is data in col_Names
                            for (let i = 0; i < col_Names.length; i++) {
                                if (col_Names.length === i + 1 && col_Names[i][0] !== data.ns.coll && max_Collection_Limit > col_Names.length) {
                                    col_Names[col_Names.length] = [data.ns.coll];
                                    col_Names[col_Names.length - 1][1] = data.fullDocument.collectionLimit;
                                    col_Names[col_Names.length - 1][2] = await mongodb_Custom_Db_Functions.documentNum(process.env.DB_NAME, col_Names[col_Names.length - 1][0]) - 1;// Ignore the CONF doc that's why -1 from the real docNum  (read the top)
                                    console.log(`New collection added ${col_Names[col_Names.length - 1][0]}`);
                                    break;
                                } else if (col_Names[i][0] === data.ns.coll) { // This will run if the collection is in col_Names[i][0] 
                                    if (col_Names[i][1] === null || data.fullDocument.collectionLimit !== col_Names[i][1]) { // This will run if the col_Names[i][1] is null and it will add if it is null
                                        console.log(`${data.ns.coll.slice(1, data.ns.coll.length)} collection ok . But ${data.ns.coll.slice(1, data.ns.coll.length)} collectionLimit === null`);
                                        col_Names[i][1] = data.fullDocument.collectionLimit;
                                        col_Names[i][2] = await mongodb_Custom_Db_Functions.documentNum(process.env.DB_NAME, col_Names[i][0]) - 1;// Ignore the CONF doc that's why -1 from the real docNum  (read the top)
                                        console.log(`${data.ns.coll.slice(1, data.ns.coll.length)} added collectionLimit ${col_Names[i][1]} && added DocumentNum ${col_Names[i][2]}`)
                                        break;
                                    } else {
                                        console.log(`${data.ns.coll.slice(1, data.ns.coll.length)} collection ok`);
                                        break;
                                    };
                                } else if (col_Names.length === i + 1 && col_Names[i][0] !== data.ns.coll && max_Collection_Limit <= col_Names.length) {// This will run if max_colum num is reached
                                    console.log("---------------------------------------------------------")
                                    console.log("Max columns num reached");
                                    console.log(`Watching columns ---- ${col_Names}`);
                                    console.log("If you want more columns to watch increase the >> process.env.MAX_COLUMNS << value");
                                    console.log("Default value is  ---- 10");
                                    console.warn("Please increase the value at own reask >>> Because two much columns to watch will dicrease performance <<<");
                                };
                            };
                        };
                    } else {
                        for (let i = 0; i < col_Names.length; i++) {
                            if (col_Names[i][0] === data.ns.coll) { // This will run if it is limited collection
                                await this.over_Flow_Watch_Wait_On();
                                col_Names[i][2] = col_Names[i][2] + 1; // This will increase the real document num
                                if (col_Names[i][2] > col_Names[i][1]) { // This will run if it overflow the collection limit and delete the overflowed doc
                                    console.log(`${col_Names[i][2]} > ${col_Names[i][1]} Max value overflowed `);
                                    await mongodb_Custom_Db_Functions.deleteOneDoc(process.env.DB_NAME, col_Names[i][0], { _id: data.documentKey._id });
                                    console.log(`Deleting overfowed value ${data.documentKey._id}`)
                                    break;
                                } else {
                                    console.log(`Data added ${data.documentKey._id}`);
                                    break;
                                };
                            } else if (col_Names[i][0] !== data.ns.coll && col_Names.length === i + 1) { // This will run if the collection is a none limited collection
                                console.log(`Insert command excuted in a none limited collection called ${data.ns.coll}`);
                                console.log("So ignoreing it");
                            };
                        };
                    };
                };
                break;
            case "update":
                if (data.documentKey._id === process.env.CONF_ID) { // This will run if a update happen to a CONF document
                    for (let i = 0; i < col_Names.length; i++) {
                        if (col_Names[i][0] === data.ns.coll) {
                            if (data.updateDescription.updatedFields.collectionLimit !== col_Names[i][1]) {
                                col_Names[i][1] = data.updateDescription.updatedFields.collectionLimit; // This will update collectionLimit with updated collection limit
                                console.log(`Updated data in the ${data.ns.coll.slice(1, data.ns.coll.length)} collection`);
                                break;
                            } else {
                                console.log(`Data not updating in the ${data.ns.coll.slice(1, data.ns.coll.length)} collection`);
                                break;
                            };
                        } else if (col_Names.length === i + 1 && col_Names[i][0] !== data.ns.coll) {
                            console.error(`${data.ns.coll} Collection updated error not exists in col array`);
                        };
                    };
                } else {
                    console.log("Not updated a value in CONF document");
                    console.log(`Updated value in ${data.documentKey._id} document `);
                };
                break;
            case "delete":
                if (data.documentKey._id === process.env.CONF_ID) {// This will get run if you will delete a CONF document and it will also remove the collection from col_Names 
                    // So the changes happen to that collection will be ignored
                    // If you want to add the collection again then insert the CONF doc again 
                    for (let i = 0; i < col_Names.length; i++) {
                        if (data.ns.coll === col_Names[i][0]) {
                            col_Names[i] = null;
                            for (let i = 0; i < col_Names.length; i++) {
                                if (col_Names[i] === null) {
                                    col_Names.splice(i, 1);
                                    break;
                                };
                            };
                            break;
                        };
                    };
                } else {
                    console.log(`Not deleted a collConf value deleted ${data.documentKey._id}`);
                    for (let i = 0; i < col_Names.length; i++) {
                        if (data.ns.coll === col_Names[i][0]) {
                            if (col_Names[i][2] !== null && col_Names[i][2] !== 0) {
                                const before_Value = col_Names[i][2];
                                col_Names[i][2] = col_Names[i][2] - 1; // This will decrease the col_Names[i][2] value if a document get deleted
                                console.log(`Collection document value deleted from ${before_Value} to ${col_Names[i][2]}`);
                                break;
                            };
                        } else if (data.ns.coll !== col_Names[i][0] && col_Names.length === i + 1) {
                            console.log(`Deleted data in a none limited collection called ${data.ns.coll}`);
                            console.log("So ignoreing it");
                            break;
                        };
                    };
                };
                break;
            case "drop":
                for (let i = 0; i < col_Names.length; i++) {
                    if (data.ns.coll === col_Names[i][0]) { // If a watching col get deleted this will remove it from the col_Names
                        col_Names[i] = null;
                        for (let i = 0; i < col_Names.length; i++) {
                            if (col_Names[i] === null) {
                                col_Names.splice(i, 1);
                                console.log(`Drop a limited collection called ${data.ns.coll}`);
                                console.log("\n-----------------------------------------------------------------");
                                console.log("These are the collection that is watching in the given db :-");
                                console.log(col_Names);
                                console.log("-----------------------------------------------------------------");
                                break;
                            };
                        };
                        break;
                    } else if (data.ns.coll !== col_Names[i][0] && col_Names.length === i + 1) {
                        console.log(`Drop a none limited collection called ${data.ns.coll}`);
                        console.log("So ignoreing it");
                        break;
                    };
                };
                break;
            default: // This will run if none define operation type executed  
                console.log("-----------------------------------------------------------------");
                console.log("Operation type :----");
                console.log(`${data.operationType}`);
                console.log(`Not a change that is defined `);
                console.log("So ignoreing it");
                console.log("-----------------------------------------------------------------");
                break;
        };
    };
    async over_Flow_Watch_Wait_Timer() {
        // This is a timer to to tell over_Flow_Watch() function to ignore and exist as done
        process.env.OVER_FLOW_WATCH_WAIT = true;
        process.env.OVER_FLOW_WATCH_WAIT_EVENT_EMITTED = true;
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                process.env.OVER_FLOW_WATCH_WAIT = false;
                process.env.OVER_FLOW_WATCH_WAIT_EVENT_EMITTED = false;
                resolve();
            }, parseInt(process.env.OVER_FLOW_WATCH_WAIT_TIMER_COUNT) || 5000);
        });
    };
    async over_Flow_Watch() {
        /*
        This function will check every 25000 ms if col_Names[0][1] and col_Names[0][2] is equal or if col_Names[0][2] > col_Names[0][1];
        
        If col_Names[0][2] > col_Names[0][1] this function will remove the overflowed documents.
        This is done when data is also inserting (read the insert switch case).

        But sometimes errors happen and documents get overflowed. That is this function is for. 
        And overFlow check is also happen in the boot up. 
        */
        while (true) {
            await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        if (col_Names.length !== 0) {
                            for (let i = 0; i < col_Names.length; i++) {
                                if (process.env.OVER_FLOW_WATCH_WAIT === "false" || typeof process.env.OVER_FLOW_WATCH_WAIT === "undefined") { // This will check the the over_Flow_Watch_Wait_Timer() is running. And if not running this will run
                                    if (col_Names[i][2] > col_Names[i][1] || col_Names[i][1] === null || typeof col_Names[i][1] === "undefined") { // If there is error this will
                                        if (col_Names[i][1] !== null && typeof col_Names[i][1] !== "undefined") {
                                            const readed_Data = await mongodb_Custom_Db_Functions.findWithSkipOnlyId(process.env.DB_NAME, col_Names[i][0], {}, true, col_Names[i][1] + 1);
                                            if (readed_Data.message.length !== 0) {
                                                console.log(`Collection ${col_Names[i][0]} has overFlowed`);
                                                await mongodb_Custom_Db_Functions.deleteManyDoc(process.env.DB_NAME, col_Names[i][0], { _id: { $in: readed_Data.message } }).catch(console.log)
                                                console.log(`Deleted ${col_Names[i][2] - col_Names[i][1]} documents in collection ${col_Names[i][0]}`);
                                            };
                                        } else {
                                            if (col_Names[i][2] !== 0) {
                                                await mongodb_Custom_Db_Functions.deleteManyDoc(process.env.DB_NAME, col_Names[i][0], {});
                                            } else {
                                                console.log(`there is no data in collection ${col_Names[i][0]}`);
                                            };
                                        };
                                    } else { // If there is no error this will run
                                        if (col_Names[i][2] !== 0) {
                                            console.log(`Data in collection ${col_Names[i][0]} has ${col_Names[i][2]} documents and limit is ${col_Names[i][1]}`);
                                        } else {
                                            console.log(`there is no data in collection ${col_Names[i][0]}`);
                                        };
                                    };
                                } else { // If over_Flow_Watch_Wait_Timer() is running this will run.
                                    console.log("Some data is adding. So not running overFlowWatch");
                                    break;
                                };
                            };
                        } else {
                            console.log("\nThere are no collections to watch");
                        };
                        resolve();
                    } catch (error) {
                        resolve(error);
                    };
                }, parseInt(process.env.OVER_FLOW_WATCH_TIMER_COUNT) || 25000);
            });
        };
    };
    async array_Checker() {// This will print col_Names array every 30000ms
        while (true) {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (col_Names.length !== 0) {
                        console.log(col_Names);
                        resolve();
                    } else {
                        console.log("\nThere are no collections to print");
                        resolve();
                    };
                }, parseInt(process.env.ARRAY_CHECK_TIMER_COUNT) || 30000);
            });
        };
    };
    async over_Flow_Watch_Wait_On() { // This function run every time a data get insert to a collection that in col_Names
        if (process.env.OVER_FLOW_WATCH_WAIT_EVENT_EMITTED === "false" || typeof process.env.OVER_FLOW_WATCH_WAIT_EVENT_EMITTED === "undefined") {
            colWatcherEvent.emit("overFlowWatchWait");
        } else {
            // If there is overFlowWatchWait event is running this remove event and add new event then it will emit colWatcherEvent.emit("overFlowWatchWait"); again  
            colWatcherEvent.removeListener("overFlowWatchWait", this.over_Flow_Watch_Wait_Timer);
            colWatcherEvent.addListener("overFlowWatchWait", this.over_Flow_Watch_Wait_Timer);
            colWatcherEvent.emit("overFlowWatchWait");
        };
        return "ok";
    };
};
module.exports = { Mongo_Limit_Checker_Funtions, col_Names, max_Collection_Limit };