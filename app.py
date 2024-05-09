from flask import Flask, render_template, request, jsonify
import pandas as pd
import json
import numpy as np
import csv, random
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from flask_cors import CORS
from sklearn import manifold
from sklearn.preprocessing import StandardScaler
import sys
import ast
from fuzzywuzzy import process
# from django.http import JsonResponse

app = Flask(__name__)
CORS(app)

# Dataset file path
dataset = "modified_new_netflix_data2.csv"
filter_settings = {
    'min_year': None,
    'max_year': None,
    'country': None,
    'listed_in': None,
    'showIDs': None
}

reverse_name_mapping = {
    'USA': 'United States',
    'UK': 'United Kingdom'
}

@app.route('/set_filter', methods=['POST'])
def set_filter():
    year = request.args.get('year', default=None, type=int)
    country = request.args.get('country', default=None, type=str)
    if year == 2000:
        filter_settings['min_year'] = 1940
        filter_settings['max_year'] = 2000
    elif year == 2010:
        filter_settings['min_year'] = 2001
        filter_settings['max_year'] = 2010
    elif year == 2021:
        filter_settings['min_year'] = 2011
        filter_settings['max_year'] = 2021
    elif country is None:
        filter_settings['min_year'] = None
        filter_settings['max_year'] = None
        filter_settings['country'] = None
        filter_settings['listed_in'] = None
        filter_settings['showIDs'] = None
        return jsonify({'message': 'Filter removed'}), 200

    if country and country in reverse_name_mapping:
        filter_settings['country'] = reverse_name_mapping[country]
    elif country:
        filter_settings['country'] = country
    else:
        filter_settings['country'] = None
    # filter_settings['country'] = country if country else None
    return jsonify({'message': f'Filter set to year {year}'}), 200

@app.route('/set_filter_listed', methods=['POST'])
def set_filter_listed_in():
    listed_in = request.args.get('listed_in', default=None, type=str)
    if listed_in:
        filter_settings['listed_in'] = listed_in
    else:
        filter_settings['listed_in'] = None
    return jsonify({'message': f'Filter set to listed_in {listed_in}'}), 200


def load_geojson_countries(geojson_path):
    with open(geojson_path, 'r') as f:
        data = json.load(f)
    countries = [feature['properties']['name'] for feature in data['features']]
    return countries

def correct_country_names(data, country_list):
    # Create a dictionary to map the original names to corrected names using fuzzy matching
    name_mapping = {}
    for original_name in data['country'].unique():
        closest_match = process.extractOne(original_name, country_list,score_cutoff=80)
        if closest_match and original_name != 'United States' and original_name != 'United Kingdom':
            name_mapping[original_name] = closest_match[0]
            reverse_name_mapping[closest_match[0]] = original_name
        elif original_name == 'United States':
            name_mapping[original_name] = 'USA'
            reverse_name_mapping['USA'] = original_name
        else:
            name_mapping[original_name] = original_name
            reverse_name_mapping[original_name] = original_name

    data['country'] = data['country'].map(name_mapping)
    return data

def load_data():
    geojson_countries = load_geojson_countries('world.geojson')
    df = pd.read_csv(dataset)
    if filter_settings['min_year']:
        df = df[(df['release_year'] >= filter_settings['min_year']) & (df['release_year'] <= filter_settings['max_year'])]
    if filter_settings['country']:
        df = df[df['country'] == filter_settings['country']]
    if filter_settings['listed_in']:
        df = df[df['listed_in'] == filter_settings['listed_in']]
    df = df.dropna(subset=['country'])
    if filter_settings['showIDs']:  
        df = df[df['show_id'].isin(filter_settings['showIDs'])]
    # df['country'] = df['country'].apply(ast.literal_eval)
    # df = df.explode('country')
    df = correct_country_names(df, geojson_countries)
    # Split the 'country' column into separate rows
    # Count the number of shows per country
    country_counts = df['country'].value_counts().reset_index()
    country_counts.columns = ['country', 'count']
    return country_counts.to_dict(orient='records')

@app.route('/data')
def get_data():
    data = load_data()
    return jsonify(data)

@app.route('/line_chart')
def read_line_chart_data():
    cols = ["type", "listed_in", "month_of_release"]
    df = pd.read_csv(dataset)
    if filter_settings['min_year']:
        df = df[(df['release_year'] >= filter_settings['min_year']) & (df['release_year'] <= filter_settings['max_year'])]
    if filter_settings['country']:
        df = df[df['country'] == filter_settings['country']]
    if filter_settings['listed_in']:
        df = df[df['listed_in'] == filter_settings['listed_in']]
    if filter_settings['showIDs']:  
        df = df[df['show_id'].isin(filter_settings['showIDs'])]
    df = df[cols]
    df = df.dropna(subset=['type','listed_in','month_of_release'])
    # df['listed_in'] = df['listed_in'].apply(ast.literal_eval)
    return jsonify(df.to_dict(orient='records'))

def preprocess_data(column_name):
    df = pd.read_csv(dataset)
    if filter_settings['min_year']:
        df = df[(df['release_year'] >= filter_settings['min_year']) & (df['release_year'] <= filter_settings['max_year'])]
    if filter_settings['country']:
        df = df[df['country'] == filter_settings['country']]
    if filter_settings['listed_in']:
        df = df[df['listed_in'] == filter_settings['listed_in']]
    if filter_settings['showIDs']:  
        df = df[df['show_id'].isin(filter_settings['showIDs'])]
    return df
    if column_name in ['country', 'listed_in','cast']:  # Add any other columns that contain lists
        df[column_name] = df[column_name].apply(ast.literal_eval)   
        exploded_df = df.explode(column_name)
        return exploded_df
    else:
        return df

@app.route('/ratings',methods=['GET'])
def get_average_rating():
    group_by_column = request.args.get('group_by_column')
    df = preprocess_data(group_by_column)
    if group_by_column not in df.columns:
        return jsonify({'error': 'Invalid group by column'}), 400
    
    grouped_data = df.groupby(group_by_column)['rating'].mean().reset_index()
    
    result = grouped_data.to_json(orient='records')
    
    return result

@app.route('/set_showid_filter', methods=['POST'])
def set_showid_filter():
    data = request.get_json()
    show_ids = data.get('showIDs', [])
    
    if not show_ids:
        return jsonify({'error': 'No show IDs provided'}), 400
    
    filter_settings['showIDs'] = show_ids
    return jsonify({'message': f'Show IDs filter set', 'showIDs': show_ids}), 200


def assign_soft_clusters(row):
    value = row['month_of_release']
    # Define boundaries
    cluster = np.random.choice([0, 1, 2])
    if 1 <= value <= 4:
        cluster = 0
    elif 5 <= value <= 8:
        cluster = 1
    elif 9 <= value <= 12:
        cluster = 2
    
    # Soften boundaries at 4, 8, 12
    boundary_clusters = {
        4: [0, 1],
        8: [1, 2],
        12: [2, 0]  # Assuming a wrap-around or some logic; adjust as needed
    }
    if value in boundary_clusters:
        cluster = np.random.choice(boundary_clusters[value])
    return cluster

# Read PCP data for data
def read_pcp_data():
    cols = ["show_id", "type","country","release_year","rating","duration","month_of_release"]
    df = pd.read_csv(dataset)
    if filter_settings['min_year']:
        df = df[(df['release_year'] >= filter_settings['min_year']) & (df['release_year'] <= filter_settings['max_year'])]
    if filter_settings['country']:
        df = df[df['country'] == filter_settings['country']]
    if filter_settings['listed_in']:
        df = df[df['listed_in'] == filter_settings['listed_in']]
    if filter_settings['showIDs']:  
        df = df[df['show_id'].isin(filter_settings['showIDs'])]
    df = df[cols]
    df = df.dropna(subset=['show_id', 'type','country','release_year','rating','duration','month_of_release'])
    
    df['cluster'] = df.apply(assign_soft_clusters, axis=1)
    # df = df.sample(n=100, random_state=42)
    return df

# e21Json = read_pcp_data(dataset, data3)

def read_word_cloud_data():
    cols = ["description", "director", "cast"]
    df = pd.read_csv(dataset)
    if filter_settings['country']:
        df = df[df['country'] == filter_settings['country']]
    if filter_settings['min_year']:
        df = df[(df['release_year'] >= filter_settings['min_year']) & (df['release_year'] <= filter_settings['max_year'])]
    if filter_settings['listed_in']:
        df = df[df['listed_in'] == filter_settings['listed_in']]
    if filter_settings['showIDs']:  
        df = df[df['show_id'].isin(filter_settings['showIDs'])]
    df = df[cols]
    return df

@app.route('/pcp_data')
def get_pcp():
    e20Json = read_pcp_data()
    return jsonify(e20Json.to_dict(orient='records'))

@app.route('/word_cloud_data')
def get_word_cloud_data():
    e20Json = read_word_cloud_data()
    return jsonify(e20Json.to_dict(orient='records'))
    # myData.data = json.loads(combined_data_string)
    # Data = myData.data
    # return jsonify(combined_data)



def read_full_data():
    cols = ["show_id", "type","director","country","release_year","rating","duration","month_of_release", "description", "cast"]
    df = pd.read_csv(dataset, usecols=cols)
    df = df.dropna(subset=["show_id", "type","director","country","release_year","rating","duration","month_of_release", "description", "cast"])
    # df = df.sample(n=100, random_state=42)
    return df

@app.route('/fullData')
def get_full_data():
    e20Json = read_full_data()
    return jsonify(e20Json.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
