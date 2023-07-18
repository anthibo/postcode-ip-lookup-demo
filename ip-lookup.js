const WebServiceClient = require('@maxmind/geoip2-node').WebServiceClient
const {
    Client
} = require("@googlemaps/google-maps-services-js");

const googleMapServicesClient = new Client({});

// for using geolite plan only (current credential does not have access to geoIP2)
const client = new WebServiceClient('accountId', 'license_key ', {
    host: 'geolite.info'
});


const fetchPostCodeFromIPAddress = async (ipAddress) => {
    try {
        const {
            postal,
            location
        } = await client.city(ipAddress)
        if (!postal) {
            // fallback -> use google reverse geocode to fetch the IP postcode
            console.log('fallback -> use google reverse geocode to fetch the IP postcode')
            return await fetchPostCodeFromCoordinates(location)
        }
        console.log(`getting post code from geoIP2: ${JSON.stringify(postal)}`)
        return postal.code
    } catch (err) {
        console.log(err)
        return `no postcode found due to ${err.code}`
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
                key: "google_api_key",
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

module.exports = {
    fetchPostCodeFromIPAddress
}