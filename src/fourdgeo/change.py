import uuid
import numpy as np

from sklearn import cluster
from scipy import spatial


def cluster_m3c2_changes(significant_changes, dbscan_eps, min_cluster_size):
    """
    Cluster M3C2 changes using DBSCAN and return clusters with their properties.
    :param significant_changes: Array of significant changes with shape (n, 4) where n is the number of points.
    :param dbscan_eps: The maximum distance between two samples for one to be considered as
    :param min_cluster_size: The minimum number of samples in a cluster.
    :return: A list of clusters with their properties.
    """
    # DBSCAN clustering
    dbscan = cluster.DBSCAN(eps=dbscan_eps, min_samples=min_cluster_size)
    labels = dbscan.fit_predict(significant_changes[:, :-1])

    # Combine results and check that the labels are unique
    all_changes_with_labels = np.column_stack((significant_changes, labels))

    # Remove noise points (label -1)
    all_changes_with_labels = all_changes_with_labels[all_changes_with_labels[:, -1] != -1]
    return all_changes_with_labels

def extract_geoObjects_from_clusters(all_changes_with_labels, endDateTime_, filename_0, filename_1):
    """
    Extract observations from clusters of M3C2 changes.
    :param all_changes_with_labels: Array of significant changes with labels.
    :param endDateTime_: The end date and time of the observation.
    :param filename_0: The filename of the first epoch.
    :param filename_1: The filename of the second epoch.
    :return: A list of observations with geo objects.
    """
    # Extract unique cluster IDs and their counts
    cluster_ids, cluster_count = np.unique(all_changes_with_labels[:, -1],return_counts=True)

    # If no clusters found, continue to the next file
    if len(cluster_ids) == 0:
        print(f"No clusters found between {filename_0} and {filename_1}.")
        return

    # backgroundImageData_ = XXX

    geoObjects_ = []

    # If clusters found, print the largest and smallest cluster sizes    
    for cluster_id in range(len(cluster_ids)):
        xyz = all_changes_with_labels[all_changes_with_labels[:, -1] == cluster_ids[cluster_id], :3]
        m3c2_distances = all_changes_with_labels[all_changes_with_labels[:, -1] == cluster_ids[cluster_id], -2]
        convex_hull = spatial.ConvexHull(xyz)
        volume = convex_hull.volume
        area = convex_hull.area
        surface_to_volume_ratio = area / volume if volume > 0 else float('inf')
        m3c2_mean_distance = np.mean(np.abs(m3c2_distances))
        vertices_of_hull = convex_hull.points[convex_hull.vertices]

        # Create an geo object based on the cluster for the observations
        dateTime_ = endDateTime_
        # Create a unique ID for the cluster
        id_ = uuid.uuid4().hex
        # Type is "unknown", as we don't apply any classifier here
        type_ = "unknown"

        customEntityData_ = {
            "X_centroid": np.mean(xyz[:, 0]),
            "Y_centroid": np.mean(xyz[:, 1]),
            "Z_centroid": np.mean(xyz[:, 2]),
            "m3c2_magnitude_abs_average_per_cluster": m3c2_mean_distance,
            "volume": volume,
            "surface_area": area,
            "surface_to_volume_ratio": surface_to_volume_ratio,
            "cluster_size_points": int(cluster_count[cluster_id]),
            }
        
        geometry_ = {
            "type": "Polygon",
            "coordinates": vertices_of_hull.tolist()
        }

        geoObjects_.append({
            "id": id_,
            "type": type_,
            "dateTime": dateTime_,
            "geometry": geometry_,
            "customEntityData": customEntityData_
        })
    return geoObjects_

