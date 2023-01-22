const express = require('express');
const Reader = require('@maxmind/geoip2-node').Reader;

// Listening to port 8000
const port = 8000;

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));

app.get('/', (request, response) => {
    // response.sendFile(__dirname + '/public/index.html');
    response.render("index", {
        content: [],
        errorMsg: "",
        ip: ""
    });
});

app.post('/', (request, response) => {
    const ipAddresses = request.body.ipAddresses;
    if (ipAddresses) {
        // Creates an array by comma separated values
        let arrIpAddress = ipAddresses.split(',');
        let arrResult = [];

        // For each value, it will find the location and store it in an array
        for (const element of arrIpAddress) {
            Reader.open('GeoLite2-City.mmdb').then(reader => {
                const result = reader.city(element);
                // console.log(result);
                if (result) {
                    arrResult.push({
                        ip: result?.traits?.ipAddress,
                        code: result?.country?.isoCode,
                        postal: result?.postal?.code,
                        city: result?.city?.names?.en,
                        timezone: result?.location?.timeZone,
                        radius: result?.location?.accuracyRadius
                    })
                }
            }).catch(error => {
                console.log(error);
                response.render("index", {
                    content: arrResult,
                    errorMsg: error.message,
                    ip: ipAddresses
                })
            });
        }
        setTimeout(() => {
            if (arrResult.length) {
                response.render("index", {
                    content: arrResult,
                    errorMsg: "",
                    ip: ipAddresses
                })
            }
        }, 500);
    }
})

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});