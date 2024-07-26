import pandas as pd
import pickle
import json
from datetime import datetime
import pytz


class Predictor:
    def __init__(self, model_file, csv_file, feature_order):
        self.model = self.load_model(model_file)
        self.csv_file = csv_file
        self.feature_order = feature_order

    def load_model(self, model_file):
        with open(model_file, 'rb') as f:
            model = pickle.load(f)
        return model

    def load_and_filter_data(self, hour):
        df = pd.read_csv(self.csv_file)
        filtered_df = df[df['hour'] == hour]
        return filtered_df
    
    def reorder_features(self, df): 
        # Restructure the features according to what each model expects
        return df[self.feature_order]

    def prepare_features(self, filtered_df, location_ids_string):
        features = self.reorder_features(filtered_df)
        location_ids = filtered_df[location_ids_string]
        return features, location_ids

    def predict_busyness(self, features):
        predictions = self.model.predict(features)
        return predictions

    def format_output(self, location_ids, predictions, location_ids_string):
        results_df = pd.DataFrame(
            {location_ids_string: location_ids, 'busyness_rank': predictions})
        grouped_df = results_df.groupby(location_ids_string)[
            'busyness_rank'].mean().reset_index()
        grouped_df['busyness_rank'] = grouped_df['busyness_rank'].round().astype(
            int)
        ranked_output = grouped_df.to_dict(orient='records')
        json_output = json.dumps(ranked_output, indent=4)
        return json_output

    def busyness_ranking(self, hour, location_ids_string):
        filtered_df = self.load_and_filter_data(hour)
        features, location_ids = self.prepare_features(filtered_df, location_ids_string)
        predictions = self.predict_busyness(features)
        json_output = self.format_output(
            location_ids, predictions, location_ids_string)
        return json_output


def call_taxi_model():
    csv_file = 'data/taxi_data.csv'
    model_file = 'models/taxi_xgb_model.pkl'
    hour = get_hour()
    location_ids_string = "LocationID"
    feature_order = ['LocationID', 'day', 'month', 'year', 'hour']

    predictor = Predictor(model_file, csv_file, feature_order)
    return predictor.busyness_ranking(hour, location_ids_string)


def call_subway_model():
    csv_file = 'data/subway_data.csv'
    model_file = 'models/subway_xgb_model.pkl'
    hour = get_hour()
    location_ids_string = "station_complex_id"
    feature_order = ['station_complex_id', 'year', 'month', 'day', 'hour']

    predictor = Predictor(model_file, csv_file, feature_order)
    return predictor.busyness_ranking(hour, location_ids_string)


def get_hour():
    nyc_tz = pytz.timezone('America/New_York')
    nyc_time = datetime.now(nyc_tz)
    return nyc_time.hour + 1