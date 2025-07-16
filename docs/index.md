# 4DGeo

## About
(XXX Very important to state somewhere in the first few sentences that it is open source XXX)
4DGeo is a modular web-based interactive dashboard application for visualizing geospatial, temporal data. Built with React, it enables users to create their own dashboard layout to visualize their custom 4D geodata using various visualization and user-input modules. The project is designed to be flexible and extendable, making it easy to adapt for different use cases such as landslide detection, insect monitoring, and other environmental observations. It can be [hosted on a simple server or with Github Pages](#hosting-options). The data is read from a user-defined data source and is updated automatically at regular intervals, as specified in the refresh timer. This enables the 4DGeo dashboard to work particularly well with continuously updated data, such as that from monitoring systems that repeatedly scan an area of interest. (XXX But also if we do not update but still want to investigate our results? XXX)

**Key Features:**
- Controlled **visualisation** (XXX of what? Results from different methods of 3D and 4D change analysis or similar? XXX)
- **Time-series** support
- **Customizable** and **shareable dashboards**
- React-based **modular UI**
- **Automatic** data **refreshs**
- Easy integration with **your data** (XXX link here to where it is explained how to do it XXX)

(XXX great video, but it needs either some text explaining OR a voice over that does something similar)
<video width="100%" controls>
  <source src="./4DGeoDemo.mp4" type="video/mp4">
</video>

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
(XXX needs links/sources XXX)
(XXX either link to an existing example of how to do it or create one and reference it here. Is it in Hosting Options? If so, there is little to no links XXX)

To **host** this application **on your own**, you can either copy our Github Action workflow for deploying it to Github Pages. (XXX either ... OR is missing? XXX)
For a simple locally hosted server, you can also use a static web server setup with, for example, the built-in Python library `http.server`.
Further, we established a automatic CI/CD workflow with Github Pages.
(XXX in general i think this section could also benefit from linking to where these things are described XXX)

## Documentation

The **main features** of this software are described in the <a href="Application.html">Application page</a>. As a starting point to understand how you can use this app and incorporate it into your own Project, you can have a look at the Example Notebooks. The current usages and implementations are described in detail there.

- [Beehive monitoring](beehive.html)
- [Rockfall monitoring](rockfall_monitoring.html)
- [Branch evolution](branch_evolution.html)

## Contact / Bugs / Feature Requests

Have you found a bug or have specific request for a new feature? Please open a <a href="https://github.com/3dgeo-heidelberg/4dgeo/issues">new issue in the online code repository on Github</a>. Also for general questions please use the issue system.

Scientific requests can be directed to the 
<a href="https://www.uni-heidelberg.de/3dgeo">3DGeo Research Group Heidelberg</a> and its respective members.
</div>