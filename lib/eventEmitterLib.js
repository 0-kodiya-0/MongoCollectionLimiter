const { EventEmitter } = require("events");

const colWatcherEvent = new EventEmitter();
const mainErrorEventEmitter = new EventEmitter();

module.exports = {colWatcherEvent , mainErrorEventEmitter};