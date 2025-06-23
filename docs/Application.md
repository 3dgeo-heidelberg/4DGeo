# 4DGeo Application

For better understanding and usage of the 4DGeo Dashboard, its functionalities, structure and concepts will be explained here. The Application is split into 2 pages: the dashboard creation and viewing page.

## Creation Page
On the dashboard creation page, you can design your own custom dashboard with a custom layout with all the modules you want to add, the data source, refresh interval and color assignment.

![](CreationPage.png)

### Data Source
The data source is a integral part of the design of a dashboard. It defines the precise location of the data that should be read. This has to be a concrete link or URL to a specific file in the correct [format](#datamodel).

### Refresh Interval
You have the option to specify the frequency of refreshes for the dashboard. At every refresh, the data from your given data source is read and checked for updates. For example if you have a new analysed scan that you want to include into the dashboard, you just have to update the file in your data source and the dashboard will automatically show this new content on the next refresh.

### Color Assignment
The Color Assignment feature helps create a more appealing and generalized visualisation. It works as a map between all the possible types of geoobjects in your data and their respective assigned color, that you can freely choose once loaded. This feature only works, when you already specified your data source link because it first reads a snapshot of the data and filters every present type to create the user input. 

If you dont use this option when creating a dashboard, a random color assignment will be generated.

![](ColorAssignment.png)

### Layout
The layout of a dashboard is defined as a map of each instance of a module and their position and size in the dashboard. This map approach makes it possible to save this layout information for example as a simple json string.

### Permalinks
Once you have designed your dashboard and configured all the wanted options, you want to see the dashboard in action. But for that, all of your configurations have to be communicated to the dashboard page. For this, all of your input can be saved as a <b>permalink</b>.

A permalink hashes all the values into a base64-String. This string is appended as a variable to the URL of the dashboard page. With this approach, each dashboard design can be stored in a simple link and shared and is easily reproducable this way.

With the <b>Read from permalink</b> button, you can also read all the configurations of a design inside of the creation page and adjust it to your needs before going to the dashboard page.

### Templates
The idea of populating the creation section with data from a permalink is expanded with a list of <b>templates</b>. A template is a predefined (example-)dashboard with sample data connected. For now, each template is defined in the `public/example_dashboards/example_dashboards.json` file as a json object with every design option predefined. In the future, this json file will be replaced with a list of permalinks because every information needed is also in there. 


## Dashboard Page
This page is the main visualisation page. A dashboard is generated via the stored information in the permalink with its layout, data source, refresh rate and color assignment. It is then populated with data automatically read from the given data source. Each module of the dashboard has its own functionality and will be further explained [later](#modules). 

![](DashboardPageWorkflow.jpg)

The dashboard is built around our self-designed data model.

<a name="datamodel"></a>

### Data Model
Our data model mainly serves the purpose to make the dashboard use-case independent. This way, the app can be used in a variety of scenarios that have their own data format but need to convert it into this data model.

![](DataModel.jpg)

It is designed around <b>observations</b>. An observation can be described as a snapshot of the real world over a specified area at a specific short interval in time.
<br>
For example a use-case could be to monitor rockfalls and landslides on a certain area of a mountain with a powerful lidar scanner. In this example, an observation would be a single scan of the area. An observation is over a interval in time and not a specific point in time in order to also support scans that take a bit of time.

Each observation also includes a <b>start</b>- and <b>end-datetime</b> (in ISO 8601 format) for specifying the exact point in time. Additionally, it contains information for a <b>2D background image</b> to represent the environment at the time of the scan. This information consists of the URL to the image file as well as its width and height in pixels. With each observation having their own respective background image, changes in the environment can also be visualized.

Lastly, each observation incorporates their own list of <b>geoobjects</b>. A geoobject is a detected and analysed object at a certain location. In our rockfall monitoring example, a detected geoobject could be a single rockfall and its area.

A geoobject includes the following attributes:

- id (String): Your own managed id.
- type (String): The type of geoobject. This is very use-case dependent and can be set as you want.
- datetime (String ISO 8601 format): This specifies the specific point in time inside of the interval of its observation. It has to be a String in ISO 8601 format.
- geometry: In order to visualise a geoobject, they need to specify their geometry. This is comparable to the geometry object in the [GeoJSON definition](https://datatracker.ietf.org/doc/html/rfc7946#page-7)
    - type (String): The type of geometry. Inspired by the GeoJSON [geometry type](https://datatracker.ietf.org/doc/html/rfc7946#section-1.4). As of now, only Polygons and Points are supported.
    - coordinates (Array): The exact coordinates of a geoobject. The structure of the values are based on the defined geometry type. These coordinates serve to correctly locate the position of the geoobjects in the 2D Viewer Module. The geoobjects will be visualised in front of the background image. The coordinates thus have to be in pixel values with [0, 0] being in the top-left hand corner and [-imageHeight, imageWidth] being in the bottom-right hand corner.
- custom attributes (Dictionary key-value): These custom attributes cover your use-case dependent information. They represent additional information bound to a specific geoobject. These attributes are the basis for the Chart Module. In our rockfall example, the custom attributes could include data like the rockfall magnitude or total volume.


This is a skeleton overview of how the finished data should look like:
```
{
    "observations": [
        {
            "startDateTime": "String in ISO 8601 format",
            "endDateTime": "String in ISO 8601 format",
            "backgroundImageData": {
                "url": "",
                "height": 0,
                "width": 0
            },
            "geoObjects": [
                {
                    "id": "",
                    "type": "",
                    "dateTime": "String in ISO 8601 format",
                    "geometry": {
                        "type": "GeoJSON geometry type",
                        "coordinates": [
                            [1, 1, 1],
                            [1, 2, 1]
                        ]
                    },
                    "customAttributes": {
                        "customKey": "",
                        "customKey2": ""
                    }
                }
            ]
        },
        {
            ...
        }
    ]
}
```

<a name="modules"></a>

### Modules

# Example Dataflows
You can look at a few tutorials and example dataflows to make your own data compatible with the dashboard