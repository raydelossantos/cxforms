# Angular Client APP for Connext Forms

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.


## APP Config settings

To start working with the angular app and the API endpoints, you need to configure the app with the following steps:

Copy the `app.config.ts.sample` file to a new file

    cp app.config.ts.sample app.config.ts

Update the file with your corresponding local enviroments values. Uncomment or change the values below to work on your local API Endpoint links.

    /************************************************************************************************************************ 
     * DEV LOCAL 
     ************************************************************************************************************************/
    CLIENT_REDIRECT_URL:  'http://localhost:8999/auth/google',                                     // DEV
    API_ENDPOINT:         'http://qagold.local',                                                   // DEV
    // API_ENDPOINT:         'http://localhost:8999',                                                 // DEV


## Build

Run `ng build --prod --aot` on your local machine. Notice the `dist` folder created by the build method which contains all the deployable contents to the production Amazon S3 Bucket. (Refer to the RELEASE NOTES for the use of build method.)