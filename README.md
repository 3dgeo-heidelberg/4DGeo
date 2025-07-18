# 4DGeo

4DGeo is a modular web-based dashboard application for visualizing geospatial data over time. Built with React, it enables users to interact with and analyze 4D geodata (spatial and temporal) using various visualization modules. The project is designed to be flexible and extendable, making it easy to adapt for different use cases such as landslide detection, insect monitoring, and other environmental observations.


## Features

- **Modular Design** - Easily add and customize visualization modules.
- **Customizable Layout** - Configure the dashboard according to specific project needs.


## Data Model

4DGeo utilizes a structured data model to visualize geospatial and temporal data. The model is designed around observations, where each observation represents a snapshot of an area with detected geoobjects and their properties at a specific point in time.

### JSON Structure
```
{
    "observations": [
        {
            "startDateTime": "String in ISO 8601 format",
            "endDateTime": "String in ISO 8601 format",
            "geoObjects": [
                {
                    "id": "",
                    "type": "",
                    "dateTime": "String in ISO 8601 format",
                    "geometry": {
                        "type": "",
                        "coordinates": [
                            [1, 1, 1],
                            [1, 2, 1]
                        ]
                    },
                    "customAttribute": {
                        "customKey": "",
                        "customKey2": ""
                    }
                }
            ],
            "backgroundImageData": {
                "url": "",
                "height": 0,
                "width": 0
            }        
        }
    ]
}
```

### Explanation
- **Observations** - A list where each element represents a singular observation.
- **startDateTime & endDateTime** - The time range of the observation.
- **geoObjects** - A list for every Object inside each observation.
    - **type** - Custom Type for your use case.
    - **datetime** - specific point in time, inside the defined time range.
    - **geometry** - Geometrydata for visualising with the 2D View Module.
        - **type** - Type of geometry like in a geoJson file, like Point and Polygon.
        - **coordinates** - The Coordinates of an Object in reference to the background image. For 2D-Coordinates, the values have to be [y,x] because the origin is in the top-left hand corner of the image with the x-values going vertically and the y-values going horizontally.
- **backgroundImageData** - Image source for the background Image of the 2D View Module.


## Installation

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

## Usage

For using this Web-Application, there are two options:

- Use the standard app with all its functionalities via the Github Pages URL
- Fork this repository and customize contents and features to you liking. Inside the ```/public``` folder is also the `config.json` for easy accessibility. After customizing, you can easily host your own Github Pages with your repo and your changes are live at your own URL!

## Contributing

Contributions are welcome! If you have suggestions or feature requests, feel free to open an issue. For your own implementations, you can also fork this repository.
