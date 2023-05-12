const express = require("express");
const mongoose = require("mongoose");
const TrackerData = require("./models/trackerData");

let requiredEnv = [
  "MONGO_DB_URL",
  "MONGO_DB_USER",
  "MONGO_DB_PASS",
  "MONGO_DB_DATABASE",
];
let unsetEnv = requiredEnv.filter(
  (env) => !(typeof process.env[env] !== "undefined")
);
if (unsetEnv.length > 0) {
  // Don't start the app if the env vars are not set
  throw new Error(
    "Required ENV variables are not set: [" + unsetEnv.join(", ") + "]"
  );
}

const app = express();
const port = 3001;

mongoose.set("strictQuery", false);

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`
);

app.use(express.json());

app.post("/data", (req, res) => {
  const data = req.body;
  console.log(data);
  if (data.objectJSON) {
    // If there is data packet write to the database
    const dataObject = JSON.parse(data.objectJSON);
    const trackerData = new TrackerData({
      location: {
        type: "Point",
        coordinates: [dataObject.longitude, dataObject.latitude],
      },
      altitude: data.objectJSON.altitude,
      epe: dataObject.epe,
      timeToFix: dataObject.timeToFix,
      isFreshGPS: dataObject.freshGPS,
      gpsTime: dataObject.time,
      vbat: dataObject.vbat,
      temp: dataObject.temp,
      resetCounter: dataObject.resetCounter,
      deviceName: data.deviceName,
      deviceEUI: Buffer.from(data.devEUI, "base64").toString("hex"),
      packageTime: data.rxInfo[0].time,
      rssi: data.rxInfo[0].rssi,
    });

    trackerData
      .save()
      .then(() => {
        console.log(trackerData);
      })
      .catch((error) => {
        console.log("Error", error);
      });
  }
});

app.get("/data", (req, res) => {
  res.send("Server is up and running");
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
