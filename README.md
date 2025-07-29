# 4DGeo

![<h2 align="center"><img src="public/4DGeo_Logo_300dpi.png" width="200" /></h2>](public/4DGeo_Logo_300dpi.png)


4DGeo is a modular web-based dashboard application for visualizing geospatial data over time. Built with React, it enables users to interact with and analyze 4D geodata (spatial and temporal) using various visualization modules. The project is designed to be flexible and extendable, making it easy to adapt for different use cases such as landslide detection, insect monitoring, and other environmental observations.

You can access a hosted version of the dashboard [here](https://3dgeo-heidelberg.github.io/4DGeo/).

[Trailer](docs/img/4DGeo%20Trailer.mp4)



##  Online documentation

Thorough online documentation on the dashboard can be found [here](https://3dgeo-heidelberg.github.io/4DGeo/docs). Feel free to use the notebook implementation examples as a starting point, and remember to cite this repository.


## Dashboard installation

To run 4DGeo locally, follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/3dgeo-heidelberg/4DGeo.git
   cd 4DGeo
   ```

2. Install dependencies (Check if Node.js is installed on your computer. If not, download it from this [link](https://nodejs.org/en/download)):

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm start
   ```

4. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```
## Conda environment installation

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


## Usage

For using this Web-Application, there are two options:

- Use the standard app with all its functionalities via the Github Pages URL
- Fork this repository and customize contents and features to you liking. Inside the ```/public``` folder is also the `config.json` for easy accessibility. After customizing, you can host your own Github Pages with your repo and your changes are live at your own URL!

## Contributing

Contributions are welcome! If you have suggestions or feature requests, feel free to open an issue. For your own implementations, you can also fork this repository.
