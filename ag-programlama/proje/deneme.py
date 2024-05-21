import csv
import json

# Load CSV file
csv_file = 'world_country_and_usa_states_latitude_and_longitude_values.csv'
csv_data = []
with open(csv_file, mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        longitude = row['longitude']
        latitude = row['latitude']
        if longitude and latitude:  # Check if values are not empty
            csv_data.append({'longitude': float(longitude), 'latitude': float(latitude)})

# Load JSON file
json_file = 'facebook.json'
with open(json_file, 'r', encoding='utf-8') as file:
    json_data = json.load(file)

# Update JSON nodes with longitude and latitude from CSV
for i, node in enumerate(json_data['nodes']):
    if i < len(csv_data):
        node['x'] = csv_data[i]['longitude']
        node['y'] = csv_data[i]['latitude']

# Save updated JSON file
with open("data.json", 'w', encoding='utf-8') as file:
    json.dump(json_data, file, ensure_ascii=False, indent=4)

print("JSON file updated successfully.")
