const https = require('https');
const WebServiceClient = require('@maxmind/geoip2-node').WebServiceClient
const {
    Client
} = require("@googlemaps/google-maps-services-js");

const googleMapServicesClient = new Client({});

// for using geolite plan only (current credential does not have access to geoIP2)
const client = new WebServiceClient('your_accountId', 'your_license_key', {
    host: 'geolite.info'
});

// accountId -> 889356
// License key -> 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
// google_api_key -> AIzaSyDJplykiPrL0AkCmGM6hY_OkziHRcsDj2s

let ipAddr
// getting host ip address
https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        ipAddr = data;
        console.log('My public IP address is:', data);

        const postCode = fetchPostCodeFromIPAddress()
        console.log(`postal code: ${postCode}`)
    });
}).on('error', (err) => {
    console.error('Error getting IP address:', err);
});


const fetchPostCodeFromIPAddress = async (ipAddress) => {
    try {
        const {
            postal,
            location
        } = await client.city(ipAddr)
        if (!postal) {
            // fallback -> use google reverse geocode to fetch the IP postcode
            console.log('fallback -> use google reverse geocode to fetch the IP postcode')
            return await fetchPostCodeFromCoordinates(location)
        }
        console.log(`getting post code from geoIP2: ${postal}`)
        return postal
    } catch (err) {
        console.log(err)
    }
}

const fetchPostCodeFromCoordinates = async ({
    latitude,
    longitude
}) => {
    const latLng = `${latitude},${longitude}`
    const {
        data: {
            results
        }
    } = await googleMapServicesClient
        .reverseGeocode({
            params: {
                key: "your_google_api_key with Geocode API enabled",
                latlng: latLng,
            },
        })

    // extract postal code from response results
    const postalCode = extractPostCode(results);
    console.log(`getting post code from google map services reverse geocode: ${postalCode}`)
    return postalCode;
}


// extract postal code from first valid result
const extractPostCode = (results) => {
    const result = results.find(result => {
        return result.address_components.some(component => {
            return component.types.includes('postal_code');
        });
    });

    const postalCode = result ? result.address_components.find(component => {
        return component.types.includes('postal_code');
    }).long_name : null;
    return postalCode;
}