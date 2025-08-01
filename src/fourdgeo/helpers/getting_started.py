import os
from pathlib import Path
import laspy
import os
import sys
import json
sys.path.insert(0, "../src")
from fourdgeo import projection
from fourdgeo import utilities
from fourdgeo.helpers.getting_started import *

# File download and handling
from pathlib import Path
import pooch

# Image handling
from PIL import Image, ImageSequence

# Hosting
import http.server
import socketserver



def download_example_data(config):    
    if not Path(config["data_folder"]).exists():
        fnames = pooch.retrieve(url=config["data_url"],
                                known_hash=config["data_hash"],
                                path="./",
                                fname=config["file_name"],
                                processor=pooch.Unzip(extract_dir=config["data_folder"]),
                                progressbar=True)
        os.remove(config["file_name"])
    
    return config["data_folder"]

def get_example_configuration():
    configuration = {
        "project_setting": {
            "project_name": "Getting_started",
            "output_folder": "./out/getting_started",
            "temporal_format": "%y%m%d_%H%M%S",
            "silent_mode": True,
            "include_timestamp": False,
            "hosting_port": 8003
        },
        "pc_projection": {
            "pc_path": "",
            "make_range_image": True,
            "make_color_image": False,
            "top_view": False,
            "save_rot_pc": False,
            "resolution_cm": 12.5,
            "camera_position": [
                0.0,
                0.0,
                0.0
            ],
            "rgb_light_intensity": 100,
            "range_light_intensity": 10,
            "epsg": None
        }
    }
    return configuration


def convert_point_cloud_time_series_to_datamodel(data_folder, configuration):

    laz_paths = list(Path(data_folder).glob("*.laz"))
    laz_paths = sorted(laz_paths)

    images = []
    list_background_projections = []
    pcs = sorted(laz_paths)

    project_name = configuration['project_setting']['project_name']
    output_folder = configuration['project_setting']['output_folder']

    for enum, pc in enumerate(pcs):
        lf = laspy.read(pc)
        configuration['pc_projection']['pc_path'] = pc

        background_projection = projection.PCloudProjection(
            configuration = configuration,
            project_name = project_name,
            projected_image_folder = output_folder,
        )
        # First projection
        if enum == 0:
            (
                ref_h_fov, ref_v_fov, ref_anchor_point_xyz, 
                ref_h_img_res, ref_v_img_res
            ) = background_projection.project_pc(buffer_m = 0.5)
        # Next projections using reference data
        else:
            background_projection.project_pc(
                ref_theta=ref_h_fov[0],
                ref_phi=ref_v_fov[0],
                ref_anchor_point_xyz=None,
                ref_h_fov=ref_h_fov,
                ref_v_fov=ref_v_fov,
                ref_h_img_res=ref_h_img_res,
                ref_v_img_res=ref_v_img_res
            )

        bg_img = background_projection.bg_image_filename[0]
        if bg_img[0] == ".":
            bg_img = bg_img[2:]

        curr_fname = os.path.basename(pc)
        start_scan = (utilities.iso_timestamp(curr_fname) + "Z").replace(":", " ")

        
        outfile = bg_img.split('.')[0] + f"_{start_scan}." + bg_img.split('.')[1]

        try:
            os.rename(bg_img, outfile)
        except FileExistsError:
            os.remove(outfile)
            os.rename(bg_img, outfile)

        images.append(outfile)

        background_projection.bg_image_filename[0] = outfile
        list_background_projections.append(background_projection)


    # Convert tif to png
    png_images = []
    for background_projection in list_background_projections:
        image_path = background_projection.bg_image_filename[0]
        filename = str.split(image_path, ".")[0]
        try:
            with Image.open(image_path) as im:
                for i, page in enumerate(ImageSequence.Iterator(im)):
                    out_path = filename + ".png"
                    if not os.path.isfile(out_path):
                        try:
                            page.save(out_path)
                        except:
                            print(out_path)
                png_images.append(out_path)
        except:
            print(filename)


    # Create json
    aggregated_data = utilities.DataModel([])

    for (i, background_projection) in enumerate(list_background_projections):
        full_path = f"http://localhost:{configuration['project_setting']['hosting_port']}/" + png_images[i]
        img_size = Image.open(png_images[i]).convert("RGB").size
        aggregated_data.observations.append(utilities.Observation(
            startDateTime = os.path.basename(background_projection.bg_image_filename[0]).split('_')[-1][:-5].replace(" ", ":"),
            endDateTime = os.path.basename(background_projection.bg_image_filename[0]).split('_')[-1][:-5].replace(" ", ":"),
            geoObjects=[],
            backgroundImageData=utilities.ImageData(
                url=str(full_path).replace("\\", "/"),
                width=img_size[0],
                height=img_size[1]
            )
        ))

    with open(f"{output_folder}/data_model.json", "w") as f:
        f.write(aggregated_data.toJSON())


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
      self.send_response(200)
      self.end_headers()

    
def host_data(configuration):
    with socketserver.TCPServer(("", configuration['project_setting']['hosting_port']), CORSRequestHandler) as httpd:
        print(f"Serving json at http://localhost:{configuration['project_setting']['hosting_port']}/out/getting_started/data_model.json")
        print(f"Open the following link to see your dashboard: \nhttps://3dgeo-heidelberg.github.io/4DGeo/dashboard?state=bGF5b3V0PSU1QiU3QiUyMnclMjIlM0EzJTJDJTIyaCUyMiUzQTElMkMlMjJ4JTIyJTNBMCUyQyUyMnklMjIlM0EwJTJDJTIyaSUyMiUzQSUyMkRhdGVSYW5nZVBpY2tlciUyMiUyQyUyMm1pblclMjIlM0EyJTJDJTIybWluSCUyMiUzQTElMkMlMjJtb3ZlZCUyMiUzQWZhbHNlJTJDJTIyc3RhdGljJTIyJTNBZmFsc2UlN0QlMkMlN0IlMjJ3JTIyJTNBOSUyQyUyMmglMjIlM0ExJTJDJTIyeCUyMiUzQTMlMkMlMjJ5JTIyJTNBMCUyQyUyMmklMjIlM0ElMjJTbGlkZXIlMjIlMkMlMjJtaW5XJTIyJTNBMiUyQyUyMm1pbkglMjIlM0ExJTJDJTIybW92ZWQlMjIlM0FmYWxzZSUyQyUyMnN0YXRpYyUyMiUzQWZhbHNlJTdEJTJDJTdCJTIydyUyMiUzQTglMkMlMjJoJTIyJTNBNCUyQyUyMnglMjIlM0E0JTJDJTIyeSUyMiUzQTElMkMlMjJpJTIyJTNBJTIyVmlldzJEJTIyJTJDJTIybWluVyUyMiUzQTQlMkMlMjJtaW5IJTIyJTNBMiUyQyUyMm1vdmVkJTIyJTNBZmFsc2UlMkMlMjJzdGF0aWMlMjIlM0FmYWxzZSU3RCUyQyU3QiUyMnclMjIlM0E0JTJDJTIyaCUyMiUzQTQlMkMlMjJ4JTIyJTNBMCUyQyUyMnklMjIlM0ExJTJDJTIyaSUyMiUzQSUyMkNoYXJ0JTIyJTJDJTIybWluVyUyMiUzQTIlMkMlMjJtaW5IJTIyJTNBMiUyQyUyMm1vdmVkJTIyJTNBZmFsc2UlMkMlMjJzdGF0aWMlMjIlM0FmYWxzZSU3RCU1RCZ1cmw9aHR0cCUzQSUyRiUyRmxvY2FsaG9zdCUzQTgwMDMlMkZvdXQlMkZnZXR0aW5nX3N0YXJ0ZWQlMkZkYXRhX21vZGVsLmpzb24maW50ZXJ2YWw9NjAmdHlwZUNvbG9ycz0lNUIlNUIlMjJ1bmtub3duJTIyJTJDJTIyJTIzZmYwMDAwJTIyJTVEJTVE")
        httpd.serve_forever()