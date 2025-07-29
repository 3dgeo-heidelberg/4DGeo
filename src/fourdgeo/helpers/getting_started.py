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



def download_example_data():
    # Handle file download/reading here
    data_url = "https://heibox.uni-heidelberg.de/f/6c2a4e6755b74d1abad0/?dl=1"
    data_hash = "77b343183c86cbc3f72e0edbe362cc3219d41e00fcf4389ab650a09a13b1b1ec"
    file_name = "rockfall_trier.zip"
    data_folder = "data/rockfall_trier"

    if not Path(data_folder).exists():
        fnames = pooch.retrieve(url=data_url,
                                known_hash=data_hash,
                                path="./",
                                fname=file_name,
                                processor=pooch.Unzip(extract_dir=data_folder),
                                progressbar=True)
        os.remove(file_name)
    
    return data_folder

def get_example_configuration():
    configuration = {
        "project_setting": {
            "project_name": "Getting_started",
            "output_folder": "./out/getting_started",
            "temporal_format": "%y%m%d_%H%M%S",
            "silent_mode": True,
            "include_timestamp": False
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

    for enum, pc in enumerate(pcs):
        lf = laspy.read(pc)
        configuration['pc_projection']['pc_path'] = pc
        project_name = configuration['project_setting']['project_name']
        output_folder = configuration['project_setting']['output_folder']

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
        start_scan = utilities.iso_timestamp(curr_fname) + "Z"
        
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
        full_path = os.path.abspath( png_images[i])
        img_size = Image.open(png_images[i]).convert("RGB").size
        aggregated_data.observations.append(utilities.Observation(
            startDateTime = os.path.basename(background_projection.bg_image_filename[0]).split('_')[-1][:-5],
            endDateTime = os.path.basename(background_projection.bg_image_filename[0]).split('_')[-1][:-5],
            geoObjects=[],
            backgroundImageData=utilities.ImageData(
                url=str(full_path).replace("\\", "/"),
                width=img_size[0],
                height=img_size[1]
            )
        ))

    with open(f"{output_folder}/data_model.json", "w") as f:
        f.write(aggregated_data.toJSON())