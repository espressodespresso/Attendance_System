# Server
Server-side readme
***
## Dependencies
Before running, ensure you have the following global NPM modules *or add them to the local project when pulled*
* [Typescript](https://github.com/Microsoft/TypeScript)
***
## Instructions
### Setup
* Initialise the project by running `npm run ci`
* Create an env file in the following format (with replaced parameters)
````dotenv
MONGOURI=yourconnectionstring
SECRET=jwtsecret
REFRESH_SECRET=refreshjwtsecret
PORT=443
USERNAME=yourtestelevatedusername
PASSWORD=yourtestpassword
ALT_USERNAME=yourteststudentusername
````
* Create a folder called ssl in the main server dir
* Put a certificate.pem and private.pem files in the ssl folder
* Setup is now complete!
### Start-up
* To ensure setup went correctly, run `npm run test`
* Once tests are ran, run the `scripts/run_dev.sh` *or setup a run configuration with that file IDE dependant*