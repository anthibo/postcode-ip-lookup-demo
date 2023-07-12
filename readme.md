# Postcode IP Lookup Demo
### Services used:
- Maxmind `GeoIP2`/`GeoLite2` -> https://dev.maxmind.com/geoip/docs/databases#databases
- Google reverse geocode service from google map services-> https://developers.google.com/maps/web-services

### How it works:
- first we perform a lookup in Geolite2 and fetch the postcode based on the IP address
- If we couldn't receive postcode results from the `Geolite2` lookup -> we will fetch the postcode info from google maps services by reverse geocoding using the location coordinates we are getting from `Geolite2`

### How to run:
```shell
node index.js
```
