document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('flowchart-container');
    const addNodeButton = document.getElementById('add-node-button');
    const runCodeButton = document.getElementById('run-code-button');
    const codeEditor = document.getElementById('code-editor');
    let nodeCount = 0;
    let nodes = [];
    let flowchart = {};

    // Initialize jsPlumb
    jsPlumb.ready(function () {
        const instance = jsPlumb.getInstance({
            Connector: ['Flowchart', { cornerRadius: 5 }],
            PaintStyle: { stroke: '#000', strokeWidth: 2 },
            Endpoint: 'Dot',
            EndpointStyle: { fill: '#000', radius: 5 },
            Container: container,
            Anchors: ['RightMiddle', 'LeftMiddle'],
            Overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
        });

        // Function to add a new node
        function addNode(x, y, message = '') {
            const id = `node${nodeCount++}`;
            const node = document.createElement('div');
            node.classList.add('flowchart-node');
            node.id = id;
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            node.innerHTML = `<textarea class="node-textarea" placeholder="Enter message and options...">${message}</textarea>`;
            container.appendChild(node);
            instance.draggable(node);
            nodes.push(node);

            // Add anchor points to the node
            instance.addEndpoint(node, {
                anchor: 'LeftMiddle',
                isSource: false,
                isTarget: true,
                endpoint: 'Dot',
                paintStyle: { fill: '#000' },
                maxConnections: -1
            });

            instance.addEndpoint(node, {
                anchor: 'RightMiddle',
                isSource: true,
                isTarget: false,
                endpoint: 'Dot',
                paintStyle: { fill: '#000' },
                maxConnections: -1
            });

            // Add node to flowchart object
            flowchart[id] = {
                id: id,
                message: message,
                options: null,
                next: null
            };
            updateCodeEditor();

            // Add event listener to update message in flowchart object
            node.querySelector('.node-textarea').addEventListener('input', (event) => {
                const lines = event.target.value.split('\n');
                const message = lines[0];
                const options = lines.length > 1 ? lines[1].split(',').map(option => option.trim()) : [];

                flowchart[id].message = message;
                flowchart[id].options = options.length > 0 ? options : null;
                flowchart[id].next = options.length > 0 ? {} : null;

                // Update code editor with new node details
                updateCodeEditor();
            });

            return node;
        }

        // Function to connect two nodes
        function connectNodes(sourceId, targetId, label = '') {
            const connection = instance.connect({
                source: sourceId,
                target: targetId,
                anchors: ['RightMiddle', 'LeftMiddle'],
                overlays: [
                    ['Arrow', { width: 10, length: 10, location: 1 }],
                    ['Label', { label: label, location: 0.5, cssClass: 'connector-label' }]
                ]
            });

            // Update flowchart object
            const sourceNode = flowchart[sourceId];
            if (sourceNode.options) {
                sourceNode.next[label] = targetId;
            } else {
                sourceNode.next = targetId;
            }
            updateCodeEditor();

            // Add event listener to the connection to edit the label
            connection.bind('click', (conn, originalEvent) => {
                editLabel(conn, originalEvent);
            });
        }

        // Function to update code editor
        function updateCodeEditor() {
            codeEditor.value = JSON.stringify(flowchart, null, 4);
        }

        // Function to edit the label of a connection
        function editLabel(connection, event) {
            const labelOverlay = connection.getOverlay('Label');
            const labelDiv = labelOverlay.canvas;
            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.value = labelOverlay.getLabel();
            labelInput.classList.add('label-input');

            const { left, top } = labelDiv.getBoundingClientRect();
            labelInput.style.left = `${left}px`;
            labelInput.style.top = `${top}px`;

            document.body.appendChild(labelInput);
            labelInput.focus();

            labelInput.addEventListener('blur', () => {
                const newLabel = labelInput.value;
                const oldLabel = labelOverlay.getLabel();
                labelOverlay.setLabel(newLabel);

                // Update the flowchart object
                const sourceId = connection.sourceId;
                const targetId = connection.targetId;
                const sourceNode = flowchart[sourceId];

                if (sourceNode.options) {
                    delete sourceNode.next[oldLabel];
                    sourceNode.next[newLabel] = targetId;
                } else {
                    sourceNode.next = targetId;
                }
                updateCodeEditor();

                document.body.removeChild(labelInput);
            });
        }

        // Handle adding new nodes dynamically
        addNodeButton.addEventListener('click', () => {
            addNode(300 + nodeCount * 50, 200 + nodeCount * 50);
        });

        // Handle running code from the code editor
        runCodeButton.addEventListener('click', () => {
            try {
                const userCode = JSON.parse(codeEditor.value);
                flowchart = userCode;
                instance.deleteEveryConnection();
                nodes.forEach(node => container.removeChild(node));
                nodes = [];
                nodeCount = 0;

                for (const nodeId in flowchart) {
                    const nodeData = flowchart[nodeId];
                    const messageWithOptions = nodeData.message + (nodeData.options ? '\n' + nodeData.options.join(',') : '');
                    const newNode = addNode(100 * (nodeCount + 1), 100, messageWithOptions);
                    newNode.id = nodeData.id;
                    nodeCount++;
                }

                for (const nodeId in flowchart) {
                    const nodeData = flowchart[nodeId];
                    if (nodeData.next) {
                        for (const key in nodeData.next) {
                            connectNodes(nodeId, nodeData.next[key], key);
                        }
                    }
                }

                updateCodeEditor();
            } catch (error) {
                alert('Invalid JSON format');
            }
        });

        // Add event listener to follow cursor with edge
        container.addEventListener('mousemove', (event) => {
            if (isConnecting && sourceNode) {
                const placeholderConnection = instance.connect({
                    source: sourceNode,
                    target: {
                        getElement: () => ({
                            offsetLeft: event.pageX - container.offsetLeft,
                            offsetTop: event.pageY - container.offsetTop
                        }),
                        endpoint: ['Blank', { radius: 1 }]
                    },
                    anchors: ['RightMiddle', [0.5, 0.5, 0, 0, event.pageX - container.offsetLeft, event.pageY - container.offsetTop]],
                    connector: ['Flowchart', { cornerRadius: 5 }],
                    paintStyle: { stroke: '#000', strokeWidth: 2 },
                    overlays: [['Arrow', { width: 10, length: 10, location: 1 }]]
                });

                instance.deleteConnection(placeholderConnection);
            }
        });

        // Listen for connection events to update code editor
        instance.bind('connection', (info) => {
            const sourceId = info.sourceId;
            const targetId = info.targetId;
            const labelOverlay = info.connection.getOverlay('Label');
            const label = labelOverlay.getLabel();
            const sourceNode = flowchart[sourceId];
            if (sourceNode.options) {
                sourceNode.next[label] = targetId;
            } else {
                sourceNode.next = targetId;
            }
            updateCodeEditor();

            // Add event listener to the connection to edit the label
            info.connection.bind('click', (conn, originalEvent) => {
                editLabel(conn, originalEvent);
            });
        });

        // Listen for connection detach events to update code editor
        instance.bind('connectionDetached', (info) => {
            const sourceId = info.sourceId;
            const targetId = info.targetId;
            const label = info.getOverlay('Label').getLabel();
            const sourceNode = flowchart[sourceId];
            if (sourceNode.options && sourceNode.next[label]) {
                delete sourceNode.next[label];
                if (Object.keys(sourceNode.next).length === 0) {
                    sourceNode.next = null;
                }
            } else if (sourceNode.next === targetId) {
                sourceNode.next = null;
            }
            updateCodeEditor();
        });
    });
});
