import json
import os
import uuid
import numpy as np
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt


# ---------------------------------------------------------------------------
# Object-Based Classes
# ---------------------------------------------------------------------------
class ChangeEvent:
    def __init__(self, object_id, event_type="undefined", cluster_point_cloud=None,
                 cluster_point_cloud_chull=None, start_date=None, number_of_points=None,
                 t_min=None, t_max=None, delta_t_hours=None, change_magnitudes=None,
                 convex_hull=None, geometric_features_epoch_1=None, geometric_features_epoch_2=None, geometric_features_both_epochs=None):
        self.object_id = object_id
        self.event_type = event_type
        self.cluster_point_cloud = cluster_point_cloud
        self.cluster_point_cloud_chull = cluster_point_cloud_chull
        self.start_date = start_date
        self.number_of_points = number_of_points
        self.t_min = t_min
        self.t_max = t_max
        self.delta_t_hours = delta_t_hours
        # Store each statistical measure as a scalar
        self.change_magnitudes = change_magnitudes if change_magnitudes is not None else {}
        # convex_hull is a dictionary with keys: 'points_building', 'surface_areas', 'volumes', 'ratios'
        self.convex_hull = convex_hull if convex_hull is not None else {}
        self.geometric_features_epoch_1 = geometric_features_epoch_1 if geometric_features_epoch_1 is not None else {}
        self.geometric_features_epoch_2 = geometric_features_epoch_2 if geometric_features_epoch_2 is not None else {}
        self.geometric_features_both_epochs = geometric_features_both_epochs if geometric_features_both_epochs is not None else {}

    @classmethod
    def from_cluster(cls, cluster_df, cluster, m3c2_file, pc_folder, obj_folder):
        """
        Create a ChangeEvent from a cluster of points.
        """
        # Generate a unique object ID for the event
        object_id = str(uuid.uuid4())

        cluster_pc = os.path.join(pc_folder, f"{cluster}.laz")
        cluster_obj = os.path.join(obj_folder, f"{cluster}.obj")
        number_of_points = len(cluster_df)

        # Extract time info from the filename (each field will be scalar, not wrapped in a list)
        times = extract_time_info(m3c2_file)
        t_min = times["t_min"]
        t_max = times["t_max"]
        delta_t = times["delta_t_hours"]

        # Compute change magnitude statistics
        stats = ["mean", "std", "min", "max", "median", "quant90", "quant95", "quant99"]
        change_stats = {stat: round(get_change(cluster_df, stat), 3) for stat in stats}
        # Add geometric features to the geometric features dictionary.
        geo_f = ["Sum_of_Eigenvalues","Omnivariance", "Eigentropy", "Anisotropy", "Planarity", "Linearity","Surface_Variation", "Sphericity"]
        geo_f_epoch_1, geo_f_epoch_2, geo_f_both_epochs = get_geometric_features(cluster_df)
        
        # Compute convex hull properties
        simplices_list, area, volume, surface_area_to_volume_ratios = get_conv_hull_points(cluster_df)
        convex_data = {
            "surface_area": area,
            "volume": volume,
            "surface_area_to_volume_ratio": surface_area_to_volume_ratios,
            "points_building": simplices_list
        }
        # For start_date you might either extract it from the file or use current timestamp.
        start_date = datetime.now().strftime("%y%m%d_%H%M%S")

        return cls(object_id=object_id, event_type="undefined",
                   cluster_point_cloud=cluster_pc,
                   cluster_point_cloud_chull=cluster_obj,
                   start_date=start_date,
                   number_of_points=number_of_points,
                   t_min=t_min,
                   t_max=t_max,
                   delta_t_hours=delta_t,
                   change_magnitudes=change_stats,
                   convex_hull=convex_data,
                   geometric_features_epoch_1=geo_f_epoch_1,
                   geometric_features_epoch_2=geo_f_epoch_2,
                   geometric_features_both_epochs=geo_f_both_epochs)

    def to_dict(self):
        """
        Serialize the ChangeEvent as a dictionary. Scalar values remain as such.
        """
        return {
            "object_id": self.object_id,
            "event_type": self.event_type,
            "cluster_point_cloud": self.cluster_point_cloud,
            "cluster_point_cloud_chull": self.cluster_point_cloud_chull,
            "start_date": self.start_date,
            "number_of_points": self.number_of_points,
            "t_min": self.t_min,
            "t_max": self.t_max,
            "delta_t_hours": self.delta_t_hours,
            "change_magnitudes": self.change_magnitudes,
            "convex_hull": self.convex_hull,
            "geometric_features_epoch_1": self.geometric_features_epoch_1,
            "geometric_features_epoch_2": self.geometric_features_epoch_2,
            "geometric_features_both_epochs": self.geometric_features_both_epochs
        }
    
    def matches(self, conditions):
        # build a one‑row DataFrame so that features like "change_mean" and "hull_volume"
        # really exist as columns
        df = extract_features_all([self])
        row = df.iloc[0].to_dict()

        for feature, thr in conditions.items():
            val = row.get(feature, float("nan"))
            if pd.isna(val):                   return False
            if "min"   in thr and val < thr["min"]:  return False
            if "max"   in thr and val > thr["max"]:  return False
            if "exact" in thr and val != thr["exact"]:return False
            if "in"    in thr and val not in thr["in"]:     return False
            if "not_in"in thr and val in thr["not_in"]:     return False
        return True

    @classmethod
    def from_dict(cls, d):
        """
        Create a ChangeEvent from a dictionary.
        """
        return cls(
            object_id=d.get("object_id"),
            event_type=d.get("event_type", "undefined"),
            cluster_point_cloud=d.get("cluster_point_cloud"),
            cluster_point_cloud_chull=d.get("cluster_point_cloud_chull"),
            start_date=d.get("start_date"),
            number_of_points=d.get("number_of_points"),
            t_min=d.get("t_min"),
            t_max=d.get("t_max"),
            delta_t_hours=d.get("delta_t_hours"),
            change_magnitudes=d.get("change_magnitudes"),
            convex_hull=d.get("convex_hull"),
            geometric_features_epoch_1=d.get("geometric_features_epoch_1"),
            geometric_features_epoch_2=d.get("geometric_features_epoch_2"),
            geometric_features_both_epochs=d.get("geometric_features_both_epochs")
        )

    
    def __repr__(self):
        return f"<ChangeEvent {self.object_id}>"

class ChangeEventCollection:
    def __init__(self, events=None):
        self.events = events if events is not None else []

    def add_event(self, event):
        """
        Add a change event if its object_id is not already present.
        """
        if not any(ev.object_id == event.object_id for ev in self.events):
            self.events.append(event)
            # print("Added event:", event.object_id)
        # else:
            # print("Event already exists:", event.object_id)

    
    def add_event_type_label(self, object_id, event_type):
        """
        Add a change event if its object_id is not already present.
        """
        # Check where ev.object_id is object_id, add event_type to that event
        for ev in self.events:
            if ev.object_id == object_id:
                ev.event_type = event_type
                # print("Added event type:", event_type, "to event:", object_id)
                return

    def to_list(self):
        """
        Convert the collection to a list of dictionaries.
        """
        return [event.to_dict() for event in self.events]

    def to_dataframe(self):
        self.df = extract_features_all(self.events)
        return self.df
    
    def save_to_file(self, filename):
        """
        Save the change event collection as a JSON file.
        """
        with open(filename, 'w') as f:
            json.dump(self.to_list(), f, indent=4)

    @classmethod
    def load_from_file(cls, filename):
        """
        Load a collection of change events from a JSON file.
        """
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                data = json.load(f)
            # events = []
            # for item in data:
            #     events.append(ChangeEvent.from_dict(item))
            events = [ChangeEvent.from_dict(item) for item in data]
        else:
            events = []
        return cls(events)

    def attach_from_file(self, filename):
        """
        Attach new change events from an external file to this collection,
        only adding events that are not already present.
        """
        new_collection = ChangeEventCollection.load_from_file(filename)
        for event in new_collection.events:
            # print("Adding:",event.object_id)
            self.add_event(event)

    def merge_from_folder(self, folder):
        """
        Iterate over subfolders within a folder, looking for change_events.json files,
        and merge the events into this collection.
        """
        for subfolder in os.listdir(folder):
            subfolder_path = os.path.join(folder, subfolder)
            if os.path.isdir(subfolder_path):
                file_path = os.path.join(subfolder_path, "change_events.json")
                if os.path.exists(file_path):
                    new_coll = ChangeEventCollection.load_from_file(file_path)
                    for event in new_coll.events:
                        self.add_event(event)


    def filter_events_rule_based(self,
                                 filter_rule
                                ):
        """
        Filter each ChangeEvent in this collection according
        to the provided rules, and write the remaining change events back into
        a new ChangeEventCollection.
        
        filter_rules should be a dict of the form:
        
          {
            "filter": {
               "change_mean":   {"min": 0.1, "max": 1.0},
               "hull_volume":   {"max": 50},
               …
          }
        """
        # Start with all events, then pare down
        filtered = self.events
        filtered = [ev for ev in filtered if ev.matches(filter_rule)]
        return filtered


    def classify_events_rule_based(self, classification_rules):
        """
        Classify each ChangeEvent in this collection according
        to the provided rules, and write the label back into
        each event.event_type.  Returns the feature‐matrix DataFrame.
        
        classification_rules should be a dict of the form:
        
          {
            "labelA": {
               "change_mean":   {"min": 0.1, "max": 1.0},
               "hull_volume":   {"max": 50},
               …
            },
            "labelB": { … }
            …
          }
        """
        # 1) build a feature‐matrix DataFrame from the events
        features_df = extract_features_all(self.events)

        # 2) classify each row & update the corresponding ChangeEvent
        for _, row in features_df.iterrows():
            object_id = row["object_id"]
            label = classify_event(row, classification_rules)
            self.add_event_type_label(object_id, label)
            # Update the event in the features_df
            features_df.at[_, "event_type"] = label
        return features_df

        
    def save_model(self, file_path: str):
        """
        Save the trained model to disk using joblib.
        """
        if not hasattr(self, 'model'):
            raise ValueError("Model not trained yet. Please train the model before saving.")
        
        joblib.dump(self.model, file_path)
        print(f"Model saved to {file_path}")

    def load_model(self,file_path: str):
        """
        Load a machine learning model from disk using joblib.
        """
        self.model = joblib.load(file_path)
        print(f"Model loaded from {file_path}")

    def apply_random_forest(
        self,
        model: str = None):
        """
        Given either a fitted model or a filepath, predict new event_types for
        every event in this collection (in‑place).
        """
        # 1) load the model if we were given a path
        if isinstance(model, str):
            model = load_model(model)
        else:
            model = self.model

        # 2) re‑extract features
        df = extract_features_for_random_forest(self.events)
        X = df.drop(columns=["object_id", "event_type"])
        preds = model.predict(X)

        # 3) map them back into each ChangeEvent
        for ev, label in zip(self.events, preds):
            ev.event_type = label


    
    ######### UMAP ##########

    def prep_data_for_umap(self, 
                           ignore_features = ["object_id","event_type","delta_t_hours","hull_surface_area","hull_volume"],
                           supervised_label = None):
        if not hasattr(self, 'df'):
            self.to_dataframe()

        # Handle missing values by dropping them
        self.df = self.df.dropna()
        if self.df.empty:
            raise ValueError("No complete data available after dropping missing values.")
    
        X = self.df
        
        if supervised_label is not None:
            # Check if the supervised label exists in the DataFrame
            if supervised_label not in X.columns:
                raise ValueError(f"Supervised label '{supervised_label}' not found in DataFrame columns.")

            y = X[supervised_label]
            y = y.astype("category").cat.codes  # Convert to categorical codes
            # Dict to map labels to integers
            self.y_label_map = {code:label  for label, code in zip(X[supervised_label].unique(), y.unique())}

        # 1) optionally filter out unwanted features
        for col in ignore_features+[supervised_label]:
            if col in X.columns:
                X = X.drop(columns=[col])

        self.X_umap = X.values
        self.y_umap = y.values if supervised_label is not None else None

    def fit_UMAP(
        self,
        n_neighbors,
        min_dist,
        n_components,
        metric = "euclidean",
        random_state = 3,
    ):
        """
        Train a RandomForestClassifier on this.collection.events.
        - ignore_labels: drop any events whose .event_type is in this list
        - param_grid:     sklearn‐style hyperparam grid for GridSearchCV
        Returns the best‐estimator.
        """

        if not hasattr(self, 'X_umap'):
            raise ValueError("Data not prepared for UMAP. Please call prep_data_for_umap() first.")

        # Standardize the feature set
        # scaler = StandardScaler()
        # X_scaled = scaler.fit_transform(features_df_without_id.values)

        # UMAP
        reducer = umap.UMAP(n_neighbors=n_neighbors,
                            min_dist=min_dist,
                            n_components=n_components, 
                            random_state=random_state,
                            metric=metric)

        # Fit UMAP to the data
        if self.y_umap is not None:
            # If supervised label is provided, fit UMAP with labels
            reducer.fit(self.X_umap, self.y_umap)
        else:
            # If no labels are provided, fit UMAP without labels
            reducer.fit(self.X_umap)
        self.umap_reducer = reducer

    def transform_UMAP(self):
        if not hasattr(self, 'umap_reducer'):
            raise ValueError("UMAP not fitted. Please call fit_UMAP() first.")
        # Transform the data using the fitted UMAP model
        self.X_umap_transformed = self.umap_reducer.transform(self.X_umap)


    def plot_UMAP(self, save_path=None):
        if not hasattr(self, 'X_umap_transformed'):
            raise ValueError("UMAP not transformed. Please call transform_UMAP() first.")
        if self.y_umap is None:
            plt.scatter(self.X_umap_transformed[:, 0], self.X_umap_transformed[:, 1], s=.5, alpha=1)
        else:
            for label in np.unique(self.y_umap):
                plt.scatter(self.X_umap_transformed[self.y_umap == label, 0], self.X_umap_transformed[self.y_umap == label, 1], label=self.y_label_map[label], s=.5, alpha=1)
        plt.title("UMAP projection of the change events")
        plt.xlabel("UMAP 1")
        plt.ylabel("UMAP 2")
        if self.y_umap is not None:
            plt.legend()
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')

    def save_UMAP_model(self, file_path: str):
        """
        Save the trained UMAP model to disk using joblib.
        """
        if not hasattr(self, 'umap_reducer'):
            raise ValueError("UMAP not trained yet. Please train the model before saving.")
        
        joblib.dump(self.umap_reducer, file_path)
        print(f"UMAP model saved to {file_path}")

    def load_UMAP_model(self, file_path: str):
        """
        Load a UMAP model from disk using joblib.
        """
        self.umap_reducer = joblib.load(file_path)
        print(f"UMAP model loaded from {file_path}")


    def plot_feature_expression_heatmap(
        self,
        normalize: str = "minmax",
        cmap: str = "Reds",
        figsize: tuple = (10, 10),
        fontsize_xtick: int = 6,
        fontsize_ytick: int = 12,
        cbar_label: str = "Normalized value",
        exclude = {"object_id", "event_type", "delta_t_hours", "hull_surface_area", "hull_volume","number_of_points"}
    ):
        """
        Draw a heatmap of each event (rows) across every feature (columns),
        with per‑feature normalization, one y‑tick per event_type,
        and horizontal lines marking each class boundary.

        Parameters
        ----------
        normalize : {'minmax', 'zscore', None}
            How to normalize each feature (column).  
            'minmax' → (x - min)/(max - min)  
            'zscore' → (x - μ)/σ  
            None     → leave raw values

        cmap : str
            A matplotlib colormap name.

        figsize : (width, height)
            Figure size in inches.

        fontsize_xtick, fontsize_ytick : int
            Font sizes for the tick labels.

        cbar_label : str
            Label for the colorbar.
        """
        import numpy as _np
        import matplotlib.pyplot as _plt

        # 1) build or refresh the DataFrame
        if not hasattr(self, "df"):
            self.to_dataframe()
        df = self.df.dropna()

        # 2) select numeric features, excluding IDs and known non‑features
        numeric_cols = df.select_dtypes(include=[_np.number]).columns
        feature_cols = [c for c in numeric_cols if c not in exclude]
        if not feature_cols:
            raise ValueError("No feature columns found to plot.")

        X = df[feature_cols].values
        classes = df["event_type"].values

        # 3) normalize per feature (axis=0)
        if normalize == "minmax":
            mins = X.min(axis=0, keepdims=True)
            maxs = X.max(axis=0, keepdims=True)
            X_norm = (X - mins) / (maxs - mins + 1e-8)
        elif normalize == "zscore":
            means = X.mean(axis=0, keepdims=True)
            stds = X.std(axis=0, keepdims=True)
            X_norm = (X - means) / (stds + 1e-8)
        elif normalize is None:
            X_norm = X
        else:
            raise ValueError(f"Unsupported normalize: {normalize!r}")

        # 4) sort events by class for grouping
        order = _np.argsort(classes)
        X_plot = X_norm[order]
        class_plot = classes[order]

        # 5) compute block boundaries & tick positions
        #    mask marks where each new class block starts
        mask = _np.r_[True, class_plot[1:] != class_plot[:-1]]
        starts = _np.nonzero(mask)[0]
        ends = _np.r_[starts[1:], len(class_plot)]
        midpoints = (starts + ends - 1) / 2
        labels = class_plot[starts]

        # 6) plot
        _plt.figure(figsize=figsize)
        im = _plt.imshow(X_plot, aspect="auto", origin="lower", cmap=cmap)

        ax = _plt.gca()
        for boundary in ends[:-1]:
            ax.hlines(boundary - 0.5,
                      xmin=-0.5,
                      xmax=len(feature_cols) - 0.5,
                      colors="black",
                      linewidth=1)

        _plt.xticks(
            _np.arange(len(feature_cols)),
            feature_cols,
            rotation=90,
            fontsize=fontsize_xtick
        )
        _plt.yticks(midpoints, labels, fontsize=fontsize_ytick, rotation=90)

        _plt.xlabel("Feature")
        _plt.ylabel("Event (grouped by class)")
        _plt.title(
            f"Feature Expression across Events\n(normalized per feature: {normalize})"
        )

        cbar = _plt.colorbar(im, orientation="vertical", pad=0.01)
        cbar.set_label(cbar_label)

        _plt.tight_layout()
        _plt.show()


    def __repr__(self):
        return f"<ChangeEventCollection size={len(self.events)}>"