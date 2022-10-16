// This file is the file that containes the LOG File path and log file names
const log_File_Path = process.env.LOG_FILE_PATH;
const files = [`${log_File_Path}/global_Log/error_Log.txt`, `${log_File_Path}/db_Log/error_Log.txt`];
const file_Names_Obj = {
    global_Log_E: `${log_File_Path}/global_Log/error_Log.txt`,
    db_Log_E: `${log_File_Path}/db_Log/error_Log.txt`
};
module.exports = { files, log_File_Path , file_Names_Obj };