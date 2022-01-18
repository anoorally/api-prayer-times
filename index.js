var express = require("express");
var app = express();

const { PrayerManager } = require("prayer-times.js");
let prayTimes = new PrayerManager();

var moment = require('moment'); // require

const config = {
    port: 80,
    coordinates: [43.7417, -79.3733],
    timeZone: -5,
    dst: 0,
    format: '12h'
}

const prayersEnum = {
    imsak: 0,
    fajr: 1,
    sunrise: 2,
    dhuhr: 3,
    asr: 4,
    sunset: 5,
    maghrib: 6,
    isha: 7,
    midnight: 8
}

app.listen(config.port, () => {
    console.log("====================");
    // getTimes();
});

app.get("/api", (req, res, next) => {
    res.json(getTimes());
});

function getTimes(){

    prayTimes.adjust({
        //adjustments below are copied April 2020 from Alislam.org approved script at https://www.alislam.org/adhan/scripts/prayerTime.js
        fajr: 14.5,
        dhuhr: "15 min",
        maghrib: "1 min",
        isha: 12.3,
        highLats: 'AngleBased'
    });


    let noonToday = moment().startOf('day').add(moment.duration(12, 'hours')).toDate();

    let schedules = prayTimes.getTimes(noonToday, config.coordinates, config.timeZone, config.dst, config.format);

    console.log(schedules);

    // Fajr is 65 mins before sunrise
    console.log(`${capitalize(schedules[prayersEnum.fajr].name)} : ${getFajrTime(schedules[prayersEnum.sunrise])}`);
    console.log(`${capitalize(schedules[prayersEnum.dhuhr].name)} : ${schedules[prayersEnum.dhuhr].formatted}`);
    console.log(`${capitalize(schedules[prayersEnum.asr].name)} : ${schedules[prayersEnum.asr].formatted}`);
    console.log(`${capitalize(schedules[prayersEnum.maghrib].name)} : ${schedules[prayersEnum.maghrib].formatted}`);
    console.log(`${capitalize(schedules[prayersEnum.isha].name)} : ${schedules[prayersEnum.isha].formatted}`);


    var response = {
        [capitalize(schedules[prayersEnum.fajr].name)] : getFajrTime(schedules[prayersEnum.sunrise]),
        [capitalize(schedules[prayersEnum.dhuhr].name)] : schedules[prayersEnum.dhuhr].formatted,
        [capitalize(schedules[prayersEnum.asr].name)] : schedules[prayersEnum.asr].formatted,
        [capitalize(schedules[prayersEnum.maghrib].name)] : schedules[prayersEnum.maghrib].formatted,
        [capitalize(schedules[prayersEnum.isha].name)] : schedules[prayersEnum.isha].formatted,

    };

    return response;

}

function capitalize(name){
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function getFajrTime(prayer){
    // Subtract 65 mins
    return moment.utc(prayer.date).subtract(65, 'minutes').format("h:mm a");
}
