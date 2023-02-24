const express = require('express')
const mongoose = require('mongoose')
const TrackerData = require('./models/trackerData')

const app = express()
const port = 3001

mongoose.connect('mongodb+srv://username:password@cluster0-rvsbb.mongodb.net/squirrels2022?retryWrites=true&w=majority') 
//mongoose.connect('mongodb://67.205.176.234:27017/?authSource=admin') 

app.use(express.json())

app.post('/data', (req, res) => {
    const data = req.body
    console.log(data);
    if (data.objectJSON) {  // If there is data packet write to the database
        const dataObject = JSON.parse(data.objectJSON);
        const trackerData = new TrackerData({
            location: {type: "Point", coordinates: [dataObject.longitude, dataObject.latitude]},
            altitude: data.objectJSON.altitude,
            epe: dataObject.epe,
            timeToFix: dataObject.timeToFix,
            isFreshGPS: dataObject.freshGPS,
            gpsTime: dataObject.time,
            vbat: dataObject.vbat,
            temp: dataObject.temp,
            resetCounter: dataObject.resetCounter,
            deviceName: data.deviceName,
            deviceEUI: Buffer.from(data.devEUI, 'base64').toString('hex'),  
            packageTime: data.rxInfo[0].time,  
            rssi: data.rxInfo[0].rssi    
        })
        
        trackerData.save().then(() => {
            console.log(trackerData)
        }).catch((error) => {
            console.log('Error', error)
        })
    }
});

app.listen(port, () => {
    console.log('Server is up on port ' + port)
    app.get('/data', (req, res) => {
        res.send('Server is up and running')
    })
}) 

