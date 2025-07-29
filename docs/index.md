# 4DGeo

4DGeo is an open-source, modular, super lightweight, web-based interactive dashboard application for visualizing your point cloud timeseries captured with a continuous and even ongoing 3D environmental monitoring station (e.g. LiDAR, 3D photogrammetry, smartphone). 

<video width="100%" controls>
  <source src="img/index/4DGeoTrailer.mp4" type="video/mp4">
</video>

## About

4DGeo enables users to create and share their own dashboard layout to visualize their custom 4D geodata using various available visualization and user-input modules. The project is designed to be flexible and extendable, making it easy to adapt for different use cases such as landslide detection, insect monitoring, and other environmental observations. It can be [hosted on a simple server or with Github Pages](#hosting-options). The structured input [data](Application.md#21-data-model) is read from a user-defined web  source and is updated automatically at regular intervals, as specified in the refresh timer. This enables the 4DGeo dashboard to work particularly well with continuously updated data, such as that from monitoring systems that repeatedly scan an area of interest in addition to static or archive data that does not need constant refreshing.

## Get started in 2 minutes: Visualize your point clouds

To show how easy it is to visualize your data with a 4DGeo dashboard, we've prepared a short [Python Notebook](getting_started.ipynb) tutorial. It demonstrates how a series of point clouds can be prjected into images and displayed within the dashboard.

The process involves just two simple steps:

- **Prepare your data:** Convert your list of images into the 4DGeo [data model](Application.md#21-data-model)
- **Configure your dashboard:** Either load a predefined layout or create your own with our [dashboard creation page](Application.md#1-creation-page)


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
        git clone https://github.com/3dgeo-heidelberg/4DGeo.git
        cd 4DGeo
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

To **host** this application **on your own**, you can either copy our [Github Action workflow](https://github.com/3dgeo-heidelberg/4DGeo/blob/main/.github/workflows/react-deploy.yml) for deploying it to Github Pages which is favorable in a production or testing environment. Or for a quick and simple locally hosted server, you can also use a static web server setup with, for example, the built-in Python library [`http.server`](https://docs.python.org/3/library/http.server.html) and used in our examples notebooks like [here](rockfall_monitoring.ipynb#visualise-the-data-in-the-dashboard).

## Documentation

As a starting point, the **main features** of this software are described in the [Application Page](Application.md). To understand how you can use this app and incorporate it into your own Project, you can have a look at the Example Notebooks. The current usages and implementations are described in detail there:

- [Getting started](getting_started.ipynb)
- [Beehive monitoring](beehive.ipynb)
- [Rockfall monitoring](rockfall_monitoring.ipynb)
- [Branch evolution](branch_evolution.ipynb)

### Conda environment installation
For these notebooks to fully work, you need to create a conda environment with the correct dependencies installed.

1. Clone the GitHub repository in a local folder
    ```
    git clone https://github.com/3dgeo-heidelberg/4DGeo.git
    ```
2. create the Conda environment with the provided .yml file
    ```
    cd 4DGeo/docs
    conda env create -n 4DGeo --file 4DGeo_doc.yml
    ```
3. Activate the environment
    ```
    conda activate 4DGeo
    ```

## Contact / Bugs / Feature Requests

Have you found a bug or have specific request for a new feature? Please open a [new issue in the online code repository on Github](https://github.com/3dgeo-heidelberg/4DGeo/issues). Also for general questions please use the issue system.

Scientific requests can be directed to the [3DGeo Research Group Heidelberg](https://www.uni-heidelberg.de/3dgeo) and its respective members.
