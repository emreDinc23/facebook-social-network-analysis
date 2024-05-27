import json

# Load the JSON data
file_path = 'facebook.json'
with open(file_path, 'r' ,encoding='utf-8') as file:
    data = json.load(file)

# Extract nodes and edges
nodes = data['nodes']
edges = data.get('edges', [])  # Assuming 'edges' is a key in the JSON data

# Print a summary of the data
print(f"Total nodes: {len(nodes)}")
print(f"Total edges: {len(edges)}")

# Display a sample of the nodes and edges
print("Sample nodes:", nodes[:2])
print("Sample edges:", edges[:2])
import networkx as nx
import matplotlib.pyplot as plt

# Create a graph
G = nx.Graph()

# Add nodes
for node in nodes:
    G.add_node(node['id'], label=node['label'], **node['attributes'])

# Add edges
for edge in edges:
    G.add_edge(edge['source'], edge['target'])

# Plot the network graph
plt.figure(figsize=(12, 12))
pos = nx.spring_layout(G)  # Layout for visualization
nx.draw(G, pos, with_labels=True, node_size=50, node_color="skyblue", edge_color="gray", font_size=8)
plt.title("Facebook Friendship Network")
plt.show()
# Compute the degree of each node
degree_sequence = sorted([d for n, d in G.degree()], reverse=True)

# Plot the degree distribution
plt.figure(figsize=(10, 6))
plt.hist(degree_sequence, bins=30, color='skyblue', edgecolor='black')
plt.title("Degree Distribution")
plt.xlabel("Degree")
plt.ylabel("Frequency")
plt.show()
# Compute betweenness centrality
betweenness = nx.betweenness_centrality(G)
sorted_betweenness = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)

# Plot the top 10 betweenness centrality
top_10_betweenness = sorted_betweenness[:10]
labels, values = zip(*top_10_betweenness)

plt.figure(figsize=(10, 6))
plt.bar(labels, values, color='skyblue')
plt.title("Top 10 Betweenness Centrality")
plt.xlabel("User ID")
plt.ylabel("Betweenness Centrality")
plt.show()
# Compute clustering coefficient
clustering = nx.clustering(G)
degrees = dict(G.degree())

# Plot clustering coefficient vs degree
plt.figure(figsize=(10, 6))
plt.scatter([degrees[node] for node in clustering], list(clustering.values()), alpha=0.5, color='skyblue')
plt.title("Clustering Coefficient vs Degree")
plt.xlabel("Degree")
plt.ylabel("Clustering Coefficient")
plt.show()
# Compute connected components
components = [len(c) for c in nx.connected_components(G)]

# Plot component size distribution
plt.figure(figsize=(10, 6))
plt.pie(components, labels=[f"Component {i+1}" for i in range(len(components))], autopct='%1.1f%%', colors=plt.cm.Paired.colors)
plt.title("Component Size Distribution")
plt.show()
