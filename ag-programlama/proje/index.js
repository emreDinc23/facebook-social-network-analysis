// Description: This file contains the code to load the JSON data, create Cesium entities for nodes and edges, and handle click events to show connected nodes in a modal.
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOGM4ZTVjOC03ZGQxLTQ5N2MtYTExZi1hYmVmZDU5OTEwY2MiLCJpZCI6MjE2NDI2LCJpYXQiOjE3MTYxOTk3NDJ9.Jal3gH3-fxyY6-26TXLCKx5CbxD-N2N2bWrDSsXdVmw';
// Initialize Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer',{
    animation: false,
    timeline: false,

    
});
const localeColors = {
    'zh_TW': Cesium.Color.BLACK,    // Örnek renkler, isteğe bağlı olarak değiştirilebilir
    'en_US': Cesium.Color.YELLOW, 
    'en_GB': Cesium.Color.GREEN,
    'ja_JP': Cesium.Color.PURPLE,
    'de_DE': Cesium.Color.ORANGE,
    'fr_FR': Cesium.Color.BLUE,
      
};
// Variables to store entities and visibility states
const entities = {};
const edgeEntities = {};
const nodesMap = {}; // Map to store nodes by their id for quick lookup
let edges = []; // Define edges array
let edgesVisible = false;
let lastClickedNodeId = null; // Track the last clicked node ID

// Get modal elements
const modal = document.getElementById("myModal");
const modal2 = document.getElementById("myModal2");
const span = document.getElementsByClassName("close")[0];
const nodeLocale = document.getElementById("nodeLocale");
const connectedNodes = document.getElementById("connectedNodes");

// Function to show modal
function showModal(node) {
    nodeLocale.textContent = `locale: ${node.attributes.locale}`;
    connectedNodes.innerHTML = ''; // Clear previous list

    // Get connected nodes
    const connected = edges.filter(edge => edge.source === node.id || edge.target === node.id);
    connected.forEach(edge => {
        const connectedNodeId = edge.source === node.id ? edge.target : edge.source;
        const connectedNode = nodesMap[connectedNodeId];
        const listItem = document.createElement('li');
        listItem.textContent = `Label: ${connectedNode.label}, locale: ${connectedNode.attributes.locale}`;
        connectedNodes.appendChild(listItem);
    });

    modal.style.display = "block";
}

// Function to hide modal
function hideModal() {
    modal.style.display = "none";
    modal2.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    hideModal();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        hideModal();
    }
}
function showLocaleChart(node) {
    const connected = edges.filter(edge => edge.source === node.id || edge.target === node.id);
    const localeCounts = {};
    let totalConnectedNodes = 0;
    
    // Count locales and total connected nodes
    connected.forEach(edge => {
        const connectedNodeId = edge.source === node.id ? edge.target : edge.source;
        const connectedNode = nodesMap[connectedNodeId];
        const locale = connectedNode.attributes.locale;
        
        if (localeCounts[locale]) {
            localeCounts[locale]++;
        } else {
            localeCounts[locale] = 1;
        }
        
        totalConnectedNodes++;
    });
    
    // Convert locale counts to data format suitable for D3 pie chart
    const localeData = Object.entries(localeCounts).map(([locale, count]) => ({
        locale,
        count,
        percentage: (count / totalConnectedNodes) * 100 // Calculate percentage
    }));
    
    const width = 300;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    
    const svg = d3.select("#localeChart")
        .html("") // Clear existing content
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
    
    const color = d3.scaleOrdinal()
        .domain(localeData.map(d => d.locale))
        .range(d3.schemeCategory10);
    
    const pie = d3.pie()
        .value(d => d.percentage) // Use percentage for pie chart slices
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    const arcs = svg.selectAll("arc")
        .data(pie(localeData))
        .enter()
        .append("g")
        .attr("class", "arc");
    
    arcs.append("path")
        .attr("fill", d => color(d.data.locale))
        .attr("d", arc)
        .style("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1);
    
    // Add labels
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => `${d.data.locale} (${d.data.count})`)
        .style("fill", "white")
        .style("font-size", "12px");
    
    // Show modal 2
    document.getElementById('myModal2').style.display = "block";
}

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Get the first 100 nodes
        const nodes = data.nodes.slice(0, 150);
        // Get edges that connect the first 100 nodes
        edges = data.edges.filter(edge => {
            return nodes.some(node => node.id === edge.source) && nodes.some(node => node.id === edge.target);
        });

        // Function to convert node positions to Cesium Cartesian3 coordinates
        function toCartesian(x, y) {
            return Cesium.Cartesian3.fromDegrees(x, y);
        }

        // Create Cesium entities for each node
        nodes.forEach(node => {
            const position = toCartesian(node.x, node.y);
            const entity = viewer.entities.add({
                id: node.id,
                name: node.label,
                position: position,
                point: {
                    pixelSize: 7,
                    color: Cesium.Color.fromCssColorString('#2ecc71'), // Green color
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: node.label.split(' ')[0].split('-')[0],
                    font: 'bold 14px Arial',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -20),
                },
            });

            // Store the entity and the node in the map
            entities[node.id] = entity;
            nodesMap[node.id] = node;
        });

        // Create Cesium entities for each edge
        edges.forEach(edge => {
            const sourceNode = nodes.find(node => node.id === edge.source);
            const targetNode = nodes.find(node => node.id === edge.target);

            if (sourceNode && targetNode) {
                const sourcePosition = toCartesian(sourceNode.x, sourceNode.y);
                const targetPosition = toCartesian(targetNode.x, targetNode.y);

                const edgeEntity = viewer.entities.add({
                    polyline: {
                        positions: [sourcePosition, targetPosition],
                        width: 3,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            
                            color: localeColors[sourceNode.attributes.locale] || Cesium.Color.BLACK,
                            outlineWidth: 1,
                            outlineColor: Cesium.Color.BLACK,
                        }),
                    },
                    show: false, // Initially hide the edge
                });

                // Store the edge entity
                edgeEntities[`${edge.source}-${edge.target}`] = edgeEntity;
            }
        });

        // Function to toggle visibility of edges
        function toggleEdgesVisibility(nodeId) {
            // Toggle visibility of edges connected to this node
            edges.forEach(edge => {
                if (edge.source === nodeId || edge.target === nodeId) {
                    const edgeKey = `${edge.source}-${edge.target}`;
                    if (edgeEntities[edgeKey]) {
                        edgeEntities[edgeKey].show = !edgesVisible;
                    }
                }
            });

            edgesVisible = !edgesVisible; // Toggle visibility state
        }

        // Handle click event using Cesium's event handling
        viewer.screenSpaceEventHandler.setInputAction(function(click) {
            const pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && entities[pickedObject.id.id]) {
                const nodeId = pickedObject.id.id;
                if (lastClickedNodeId !== nodeId) {
                    toggleEdgesVisibility(nodeId);
                    showModal(nodesMap[nodeId]);
                    showLocaleChart(nodesMap[nodeId]);
                    lastClickedNodeId = nodeId;
                } else {
                    toggleEdgesVisibility(nodeId);
                }
            } else {
                hideModal();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        viewer.zoomTo(viewer.entities);
    })
    .catch(error => {
        console.error('Error loading or parsing the JSON file:', error);
    });
