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
dataset = "modified_netflix_data.csv"

# Class to hold graph data
# class MyData():
#     data = None

# myData = MyData()

# df = pd.read_csv(dataset,
#                  usecols=[
#                      "show_id","type","title","director","cast","country","date_added","release_year","rating","duration","listed_in","description","month_of_release","year_of_release"
#                  ])

def load_geojson_countries(geojson_path):
    with open(geojson_path, 'r') as f:
        data = json.load(f)
    countries = [feature['properties']['name'] for feature in data['features']]
    return countries

def correct_country_names(data, country_list):
    # Create a dictionary to map the original names to corrected names using fuzzy matching
    name_mapping = {}
    for original_name in data['country'].unique():
        # Find the closest match in the country list with a minimum score
        closest_match = process.extractOne(original_name, country_list,score_cutoff=80)
        if closest_match and original_name != 'United States' and original_name != 'United Kingdom':
            name_mapping[original_name] = closest_match[0]
        elif original_name == 'United States':
            name_mapping[original_name] = 'USA'
        else:
            name_mapping[original_name] = original_name

    
    print(name_mapping)
    # Replace the country names in the dataset
    data['country'] = data['country'].map(name_mapping)
    return data

def load_data():
    geojson_countries = load_geojson_countries('world.geojson')
    df = pd.read_csv('modified_netflix_data.csv')
    # Drop rows with missing country data
    df = df.dropna(subset=['country'])
    df['country'] = df['country'].apply(ast.literal_eval)
    df = df.explode('country')
    df = correct_country_names(df, geojson_countries)
    # Split the 'country' column into separate rows
    # Count the number of shows per country
    country_counts = df['country'].value_counts().reset_index()
    country_counts.columns = ['country', 'count']
    return country_counts.to_dict(orient='records')

# Read dataset
# dfroot = pd.read_csv(dataset)
data = load_data()
# data2 = df.copy()
# data3 = df.copy()

# Selecting relevant columns from the dataset
# df0 = dfroot[["patents_log2", "citations_log2", "FamilyCitations_log2", "NFCitations_log2", "P01_log2", "P18_log2", "C01_log2", "C18_log2", "NFC01_log2", "NFC18_log2"]]
# df0 = dfroot[["patents_log2", "citations_log2", "FamilyCitations_log2", "NFCitations_log2", "P01_log2", "P18_log2", "C01_log2", "C18_log2", "NFC01_log2", "NFC18_log2"]]

# Route for index page
# @app.route("/")
# def index():
#     return render_template("index.html")
# @app.route("/")
# def index():
#     return render_template("index.html")

# Route to set K value
# @app.route("/kValue", methods=["POST"])
# def set_kValue():
#     global selected_k_value
#     kValue = request.form['kValue']
#     print('kValue: ' + kValue)
#     selected_k_value = int(kValue)
#     return kValue
# @app.route("/kValue", methods=["POST"])
# def set_kValue():
#     global selected_k_value
#     kValue = request.form['kValue']
#     print('kValue: ' + kValue)
#     selected_k_value = int(kValue)
#     return kValue

# Route to get navigation bar
# @app.route("/nav")
# def get_nav():
#     return render_template("navbar.html")
# @app.route("/nav")
# def get_nav():
#     return render_template("navbar.html")

# Route to get JSON data
# @app.route("/jsonify")
# def get_json_data():
#     return jsonify(myData.data)

@app.route('/data')
def get_data():

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)

# df = pd.read_csv(dataset,
#                  usecols=[
#                      "patents_log2", "citations_log2", "FamilyCitations_log2", "NFCitations_log2", "P01_log2", "P18_log2", "C01_log2", "C18_log2", "NFC01_log2", "NFC18_log2"
#                  ])

# Function to generate the CSV file
# def generate_csv(filename, dfroot, columns):
#     with open(filename, 'w', newline='') as csvfile:
#         writer = csv.writer(csvfile)
#         # Write header row
#         writer.writerow(['Symbol', 'Name'] + ['k' + str(i) for i in range(1, columns + 1)])
#         # Generate data rows
#         for index, row in dfroot.iterrows():
#             symbol = row['Symbol']
#             name = row['Name']
#             row_data = generate_row(columns)
#             writer.writerow([symbol, name] + row_data)
# def generate_csv(filename, dfroot, columns):
#     with open(filename, 'w', newline='') as csvfile:
#         writer = csv.writer(csvfile)
#         # Write header row
#         writer.writerow(['Symbol', 'Name'] + ['k' + str(i) for i in range(1, columns + 1)])
#         # Generate data rows
#         for index, row in dfroot.iterrows():
#             symbol = row['Symbol']
#             name = row['Name']
#             row_data = generate_row(columns)
#             writer.writerow([symbol, name] + row_data)

# Function for min-max scaling
# def min_max_scaling(value, min_val, max_val, new_min, new_max):
#     return ((value - min_val) / (max_val - min_val)) * (new_max - new_min) + new_min
# def min_max_scaling(value, min_val, max_val, new_min, new_max):
#     return ((value - min_val) / (max_val - min_val)) * (new_max - new_min) + new_min

# Start elbow plot
# data = df0
# mse = {}
# for k in range(1, 11):
#     kmeans = KMeans(n_clusters=k, max_iter=1000).fit(data)
#     data["clusters"] = kmeans.labels_
#     mse[k] = kmeans.inertia_
# list_x = list(mse.keys())
# list_y = list(mse.values())
# min_val = min(list_y)
# max_val = max(list_y)
# scaled_list_y = [min_max_scaling(val, min_val, max_val, 0, 100) for val in list_y]
# data = df0
# mse = {}
# for k in range(1, 11):
#     kmeans = KMeans(n_clusters=k, max_iter=1000).fit(data)
#     data["clusters"] = kmeans.labels_
#     mse[k] = kmeans.inertia_
# list_x = list(mse.keys())
# list_y = list(mse.values())
# min_val = min(list_y)
# max_val = max(list_y)
# scaled_list_y = [min_max_scaling(val, min_val, max_val, 0, 100) for val in list_y]

# dictionary = {}
# jsonv = {"x_axis": "K values", "y_axis": "MSE", "data":[]}
# for i in range(0, 10):
#     print(list_x[i])
#     print(scaled_list_y[i])
#     jsonv['data'].append({"factor": list_x[i], "eigen_value": scaled_list_y[i]})
# dictionary = jsonv
# Data = myData.data
# # columns = 10
# # filename = "clusterIds.csv"
# # generate_csv(filename, dfroot, columns)
# # print(f"CSV file '{filename}' created successfully")

# def run_kmeans(data, n_clusters):
#     kmeans = KMeans(n_clusters=n_clusters)
#     result = kmeans.fit_predict(data)
#     # data_with_color = data.copy()
#     data['color'] = result
#     return data

# # Duplicate DataFrame for data2 and data3
# data2 = df.copy()
# data3 = df.copy()

# # Run KMeans clustering for data2
# kmeans1_data = run_kmeans(data2, n_clusters=3)

# # Run KMeans clustering for data3
# kmeans2_data = run_kmeans(data3, n_clusters=5)
# # Run KMeans clustering for data3
# kmeans2_data = run_kmeans(data3, n_clusters=5)

# # TODO 559
# def process_mds_data(data, scaler, sample_size=559):
#     mds_data = data.sample(n=sample_size)
#     cluster_num = scaler.fit_transform(mds_data.loc[:, mds_data.columns != 'color'])
#     mds_transformed = manifold.MDS(n_components=2, metric=True, dissimilarity='euclidean').fit_transform(cluster_num)
#     mds_transformed = np.hstack((mds_transformed, mds_data['color'].to_numpy().reshape(sample_size, 1)))
#     df = pd.DataFrame(data=mds_transformed, columns=['xVal', 'yVal', 'color'])
#     return df.to_json()

# # Process MDS data for kmeans_data
# std_scaler = StandardScaler()
# e00Json = process_mds_data(kmeans1_data, std_scaler)
# e01Json = process_mds_data(kmeans2_data, std_scaler)

# # Process MDS data for variable
# cluster_num = data2.loc[:, data2.columns != 'color']
# mvar = 1 - abs(cluster_num.corr())
# mds_transformed = manifold.MDS(n_components=2, metric=True, dissimilarity='precomputed').fit_transform(mvar)
# df = np.hstack((mds_transformed, cluster_num.columns.to_numpy().reshape(10, 1)))
# e1Json = pd.DataFrame(data=df, columns=['xVal', 'yVal', 'name']).to_json()


def read_line_chart_data(data):
    # cols = ["MC_Grade", "LS_Grade", "IPO_Year_encoded", "patents_log2", "citations_log2", "FamilyCitations_log2", "NFCitations_log2", "P01_log2", "P18_log2", "C01_log2", "C18_log2", "NFC01_log2", "NFC18_log2"]
    cols = ["type", "listed_in", "month_of_release"]
    df = pd.read_csv(dataset, usecols=cols)
    # sampled_df = df.sample(n=100, random_state=41) 
    return df.to_json(orient='records')

eLineChartJson = read_line_chart_data(dataset)

# Read PCP data for data
def read_pcp_data():
    # cols = ["MC_Grade", "LS_Grade", "IPO_Year_encoded", "patents_log2", "citations_log2", "FamilyCitations_log2", "NFCitations_log2", "P01_log2", "P18_log2", "C01_log2", "C18_log2", "NFC01_log2", "NFC18_log2"]
    cols = ["type","director","country","release_year","rating","duration","month_of_release"]
    df = pd.read_csv(dataset, usecols=cols)
    df = df.dropna(subset=['country','type','director','release_year','rating','duration','month_of_release'])
    # df['color'] = color_data['color']
    df['country'] = df['country'].apply(ast.literal_eval)
    df['country'] = df['country'].apply(lambda x: x[0])
    df['cluster'] = np.random.randint(0, 3, size=len(df))
    df = df.sample(n=100, random_state=42)
    return df

# e21Json = read_pcp_data(dataset, data3)

def read_word_cloud_data():
    # cols = ["MC_Grade", "LS_Grade", "IPO_Year_encoded", "patents_log2", "citations_log2", "FamilyCitations_log2", "NFCitations_log2", "P01_log2", "P18_log2", "C01_log2", "C18_log2", "NFC01_log2", "NFC18_log2"]
    cols = ["description", "director", "cast"]
    df = pd.read_csv(dataset, usecols=cols)
    return df


# eWordCloudJson = read_word_cloud_data(dataset)

# Combine data
# combined_data = {'elbowData': dictionary,'mdsData0':e00Json,'mdsData1':e01Json, 'mdsVariables': e1Json, 'pcp0': e20Json, 'pcp1': e21Json}
# combined_data = {'pcp0': e20Json, 'wordCloud': eWordCloudJson}
# combined_data_string = json.dumps(combined_data)

# print('dict ', dictionary)
# print('server started')

# @app.route('/combo')
# def get_combo():
#     myData.data = json.loads(combined_data_string)
#     Data = myData.data
#     return render_template("combo.html", Data=Data)

@app.route('/pcp_data')
def get_pcp():
    e20Json = read_pcp_data()
    # eWordCloudJson = read_word_cloud_data()
    # combined_data = {'pcp0': e20Json, 'wordCloud': eWordCloudJson}
    return jsonify(e20Json.to_dict(orient='records'))
    # myData.data = json.loads(combined_data_string)
    # Data = myData.data
    # return jsonify(combined_data)

@app.route('/word_cloud_data')
def get_word_cloud_data():
    e20Json = read_word_cloud_data()
    # eWordCloudJson = read_word_cloud_data()
    # combined_data = {'pcp0': e20Json, 'wordCloud': eWordCloudJson}
    return jsonify(e20Json.to_dict(orient='records'))
    # myData.data = json.loads(combined_data_string)
    # Data = myData.data
    # return jsonify(combined_data)