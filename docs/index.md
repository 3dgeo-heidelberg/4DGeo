# 4DGeo

4DGeo is an open-source, modular web-based interactive dashboard application for visualizing geospatial, temporal data. 

<video width="100%" controls>
  <source src="img/index/4DGeo-Showcase.mp4" type="video/mp4">
</video>

## About

Built with React, it enables users to create their own dashboard layout to visualize their custom 4D geodata using various visualization and user-input modules. The project is designed to be flexible and extendable, making it easy to adapt for different use cases such as landslide detection, insect monitoring, and other environmental observations. It can be [hosted on a simple server or with Github Pages](#hosting-options). The data is read from a user-defined data source and is updated automatically at regular intervals, as specified in the refresh timer. This enables the 4DGeo dashboard to work particularly well with continuously updated data, such as that from monitoring systems that repeatedly scan an area of interest in addition to static data that does not need constant refreshing.

**Key Features:**

- Controlled visualization of your results, for example from various 3D and 4D change analysis methods
- **Time-series** support
- **Customizable** and **shareable dashboards**
- React-based **modular UI**
- **Automatic** data **refreshs**
- Easy integration with **your data** using a self-designed [data model](Application.md#21-data-model)


## Development & Installation

To run 4DGeo locally, follow these steps:

1. Clone the repository:

    ``` sh
        git clone https://github.com/3dgeo-heidelberg/4dgeo.git
        cd 4dgeo
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

## Hosting Options

To **host** this application **on your own**, you can either copy our [Github Action workflow](https://github.com/3dgeo-heidelberg/4dgeo/blob/main/.github/workflows/react-deploy.yml) for deploying it to Github Pages which is favorable in a production or testing environment. Or for a quick and simple locally hosted server, you can also use a static web server setup with, for example, the built-in Python library [`http.server`](https://docs.python.org/3/library/http.server.html) and used in our examples notebooks like [here](rockfall_monitoring.ipynb#visualise-the-data-in-the-dashboard).

## Documentation

As a starting point, the **main features** of this software are described in the [Application Page](Application.md). To understand how you can use this app and incorporate it into your own Project, you can have a look at the Example Notebooks. The current usages and implementations are described in detail there:

- [Beehive monitoring](beehive.ipynb)
- [Rockfall monitoring](rockfall_monitoring.ipynb)
- [Branch evolution](branch_evolution.ipynb)

## Contact / Bugs / Feature Requests

Have you found a bug or have specific request for a new feature? Please open a [new issue in the online code repository on Github](https://github.com/3dgeo-heidelberg/4dgeo/issues). Also for general questions please use the issue system.

Scientific requests can be directed to the [3DGeo Research Group Heidelberg](https://www.uni-heidelberg.de/3dgeo) and its respective members.