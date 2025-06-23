# 4DGeo

## About

4DGeo is a modular web-based interactive dashboard application for visualizing geospatial, temporal data. Built with React, it enables users to create their own dashboard layout to visualize their custom 4D geodata using various visualization and user-input modules. The project is designed to be flexible and extendable, making it easy to adapt for different use cases such as landslide detection, insect monitoring, and other environmental observations. It is designed to be hosted on a simple server or with Github Pages. The data is read from a custom user-defined data source and refreshes automatically based on a custom refresh timer. With this, the 4DGeo dashboard works really well with continously updated data like with monitoring systems that cover a specified area over different scans. 


<video width="100%" controls>
  <source src="./4DGeoDemo.mp4" type="video/mp4">
</video>

## Development & Installation

Have you found a bug or have specific request for a new feature? Please open a new issue in the online code repository on Github. Also for general questions please use the issue system.

To run 4dGeo locally, follow these steps:

1. Clone the repository:

    ``` sh
        git clone https://github.com/3dgeo-heidelberg/4dgeo.git
        cd 4dGeo
    ```

2. Install dependencies (Check if Node.js is installed on your computer. If not, download it from this [link](https://nodejs.org/en/download)):

    ``` sh
        npm install
    ```

3. Start the development server:

    ```
        npm start
    ```

4. Open your browser and navigate to:

    ```
        http://localhost:3000
    ```

## Setup

To host this application on your own, you can either copy our Github Action workflow for deploying it to Github Pages.
For a simple locally hosted server, you can also use a static web server setup with for example the python http.server.