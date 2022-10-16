const { IdCodes } = require("./Codes");
class Random_Things_Gen {
    async date_time() { // This will just generate the date
        if (Date().toString() === null) {
            throw { state: 'Internal err', fun: 'In Date_time()', ErrId: null, ErrorDate: null };
        } else {
            return Date().toString();
        };
    };
};
module.exports = { Random_Things_Gen };