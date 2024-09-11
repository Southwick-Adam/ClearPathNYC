ClearPath NYC is a jogging and walking app for desktop and mobile. It's goal is to help our users in Manhattan avoid loud areas, busy streets, and the piles of garbage that gather on the streets, so that they can have an enjoyable time outside.

<img src="https://github.com/Southwick-Adam/ClearPathNYC/blob/main/images/logo.png" width="300">

The app offers both point to point and loop options and can even show multiple routes. These routes avoid unpleasant areas while giving you specific warnings in each avoided area. These warnings are togglable so you can focus on the ones that matter mot to you. The app also favors routes that pass through parks and other green spaces.

<img src="https://github.com/Southwick-Adam/ClearPathNYC/blob/main/images/park_path.png" width="600"> <img src="https://github.com/Southwick-Adam/ClearPathNYC/blob/main/images/warnings.png" width="200">

The app is full of useful features like the ability to start and end routes by clicking the map, add waypoints, and display multiple routes at one.

<img src="https://github.com/Southwick-Adam/ClearPathNYC/blob/main/images/path.png" width="800">

There are also tons of quality of life features like night mode, colorblind mode, weather and air quality reports, and even the ability to export your favorite routes to Strava and Garmin.

We built each of the services in this app as seperate microservices and deployed them with Docker. These services include a JavaScript React frontend, a C# Dotnet backend, a Neo4j Graph Database for holding our specialized routing info, and a seperate Dotnet service for updating othat database. We also use XGBoost data models and a flask service to interact with those models for predictive crowding and disturbance capabilities. Here is a diagram of how they work together.

<img src="https://github.com/Southwick-Adam/ClearPathNYC/blob/main/images/diagram_bw.jpeg" width="450">

If you want to try hosting this yourself, you can find all of the services necessary on my Dockerhub: https://hub.docker.com/repository/docker/asouthwick1/nycapp

Thanks for Reading!
