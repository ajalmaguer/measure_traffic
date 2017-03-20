var rp = require('request-promise');
var fs = require('fs');
require('dotenv').config()

var home 	= process.env.HOME_LAT_LONG
var work 	= process.env.WORK_LAT_LONG
var ga 		= process.env.GA_LAT_LONG
var key 	= process.env.GMAPS_KEY

var intervalTimeMin = 10 // min

getTrafficTime()
setInterval(getTrafficTime, minToSec(intervalTimeMin))

function getTrafficTime() {
	var homeToWork = makeRequest(generateUrl(home, work))
	var workToHome = makeRequest(generateUrl(work, home))
	var workToGA = makeRequest(generateUrl(work, ga))

	Promise.all([homeToWork, workToHome, workToGA])
		.then((body) => {
			var data = body
						.map((res) => JSON.parse(res))
						.map(res => res.routes[0].legs[0].duration.text)
						.join(', ')
			
			writeToFile('traffic.csv', data)
		})
		.catch((err) => {
			console.log('err =', err);
		})
}

function generateUrl(origin, destination) {
	return `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${key}`	
}

function makeRequest(url, callback) {
	return rp(url, function (error, response, body) {
		if (error) console.log('error:', error); // Print the error if one occurred

		
	});
}

function writeToFile(file, data) {
	var timeStamp = new Date()

	fs.appendFile(file, `${timeStamp}, ${data}\n`, (err) => {
		if (err) console.log('err = ', err)
		console.log(`wrote ${data} to file at ${timeStamp}`);
	})	
}

function minToSec(min) {
	return min * 60 * 1000
}