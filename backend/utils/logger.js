const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/app.log");

const writeLog = (level, data) => {
  const log = {
    time: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    level,
    ...data,
  };

  fs.appendFile(
    logFile,
    JSON.stringify(log) + "\n",
    (err) => {
      if (err) {
        console.error("Logger Error:", err);
      }
    }
  );
};

exports.info = (data) => writeLog("INFO", data);

exports.warn = (data) => writeLog("WARN", data);

exports.error = (data) => writeLog("ERROR", data);