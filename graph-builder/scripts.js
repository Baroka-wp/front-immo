// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graphContainer');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const addNodeBtn = document.getElementById('addNodeBtn');
    const flowGraphCode = document.getElementById('flowGraphCode');

    let nodes = [];
    let edges = [];
    let idCounter = 0;
    let isDrawingEdge = false;
    let startNode = null;
    let currentEdge = null;

    canvas.width = graphContainer.clientWidth;
    canvas.height = graphContainer.clientHeight;

    addNodeBtn.addEventListener('click', () => {
        addNode();
    });

    function addNode() {
        const node = document.createElement('div');
        node.classList.add('node');
        node.innerHTML = `
            <textarea placeholder="Enter message..."></textarea>
            <div class="connector">+</div>
        `;
        node.setAttribute('data-id', idCounter);
        node.style.top = '50px';
        node.style.left = `${50 + idCounter * 120}px`;

        makeDraggable(node);
        autoResizeTextarea(node.querySelector('textarea'));

        node.querySelector('.connector').addEventListener('mousedown', (event) => startDrawingEdge(event, node));
        node.addEventListener('mouseup', (event) => stopDrawingEdge(event, node));

        graphContainer.appendChild(node);
        nodes.push({ id: idCounter, element: node, message: '', options: [], next: null });
        idCounter++;
        updateFlowGraphCode();
    }

    function autoResizeTextarea(textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        textarea.addEventListener('mousedown', (e) => e.stopPropagation());
        textarea.addEventListener('mouseup', (e) => e.stopPropagation());
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (e.target.tagName !== 'TEXTAREA' && !e.target.classList.contains('connector')) {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            updateEdges(element);
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function startDrawingEdge(event, node) {
        event.stopPropagation();
        if (!isDrawingEdge) {
            startNode = node;
            isDrawingEdge = true;

            const { x, y } = getNodeBorderPoint(node, event.clientX, event.clientY);

            currentEdge = {
                startX: x,
                startY: y,
                endX: x,
                endY: y
            };

            canvas.addEventListener('mousemove', drawEdge);
        }
    }

    function drawEdge(event) {
        if (isDrawingEdge) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            currentEdge.endX = x;
            currentEdge.endY = y;

            redrawCanvas();
            drawEdgePath(ctx, currentEdge.startX, currentEdge.startY, currentEdge.endX, currentEdge.endY);
        }
    }

    function stopDrawingEdge(event, node) {
        if (isDrawingEdge && startNode && startNode !== node) {
            isDrawingEdge = false;
            canvas.removeEventListener('mousemove', drawEdge);

            const { x: startX, y: startY } = getNodeBorderPoint(startNode, node);
            const { x: endX, y: endY } = getNodeBorderPoint(node, startNode);

            currentEdge.endX = endX;
            currentEdge.endY = endY;

            const edge = {
                start: startNode.getAttribute('data-id'),
                end: node.getAttribute('data-id'),
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                path: new Path2D(),
                onClick: handleEdgeClick,
                onDblClick: handleEdgeDblClick
            };

            edges.push(edge);

            redrawCanvas();
            updateFlowGraphCode();

            // Update the next parameter of the startNode
            const startNodeData = nodes.find(n => n.id == startNode.getAttribute('data-id'));
            startNodeData.next = node.getAttribute('data-id');
        } else if (currentEdge) {
            isDrawingEdge = false;
            canvas.removeEventListener('mousemove', drawEdge);
            redrawCanvas();
        }
        startNode = null;
        currentEdge = null;
    }

    function getNodeBorderPoint(node, targetNode) {
        if (!node || !targetNode) return { x: 0, y: 0 };

        const rect = node.getBoundingClientRect();
        const targetRect = targetNode.getBoundingClientRect();
        const containerRect = graphContainer.getBoundingClientRect();

        const nodeCenterX = (rect.left + rect.right) / 2;
        const nodeCenterY = (rect.top + rect.bottom) / 2;
        const targetCenterX = (targetRect.left + targetRect.right) / 2;
        const targetCenterY = (targetRect.top + targetRect.bottom) / 2;

        let x, y;

        if (targetCenterX < nodeCenterX && Math.abs(targetCenterX - nodeCenterX) > Math.abs(targetCenterY - nodeCenterY)) {
            x = rect.left - containerRect.left;
            y = (rect.top + rect.bottom) / 2 - containerRect.top;
        } else if (targetCenterX > nodeCenterX && Math.abs(targetCenterX - nodeCenterX) > Math.abs(targetCenterY - nodeCenterY)) {
            x = rect.right - containerRect.left;
            y = (rect.top + rect.bottom) / 2 - containerRect.top;
        } else if (targetCenterY < nodeCenterY) {
            x = (rect.left + rect.right) / 2 - containerRect.left;
            y = rect.top - containerRect.top;
        } else {
            x = (rect.left + rect.right) / 2 - containerRect.left;
            y = rect.bottom - containerRect.top;
        }

        return { x, y };
    }

    function handleEdgeClick(event, edge) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (ctx.isPointInPath(edge.path, x, y)) {
            // Handle edge click (e.g., show a tooltip or highlight the edge)
        }
    }

    function handleEdgeDblClick(event, edge) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (ctx.isPointInPath(edge.path, x, y)) {
            const index = edges.indexOf(edge);
            if (index > -1) {
                edges.splice(index, 1);
            }
            redrawCanvas();
            updateFlowGraphCode();
        }
    }

    function updateEdges(node) {
        const nodeId = node.getAttribute('data-id');
        edges.forEach(edge => {
            if (edge.start === nodeId || edge.end === nodeId) {
                const startNode = nodes.find(n => n.id == edge.start).element;
                const endNode = nodes.find(n => n.id == edge.end).element;
                const startCoords = getNodeBorderPoint(startNode, endNode);
                const endCoords = getNodeBorderPoint(endNode, startNode);

                edge.startX = startCoords.x;
                edge.startY = startCoords.y;
                edge.endX = endCoords.x;
                edge.endY = endCoords.y;
            }
        });
        redrawCanvas();
    }

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        edges.forEach(edge => {
            drawEdgePath(ctx, edge.startX, edge.startY, edge.endX, edge.endY, edge);
        });
    }

    function drawEdgePath(ctx, startX, startY, endX, endY, edge) {
        const radius = 20;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        if (startX === endX || startY === endY) {
            // Straight line
            ctx.lineTo(endX, endY);
        } else {
            // Rounded right-angle curve
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
                ctx.lineTo(midX, startY);
                ctx.quadraticCurveTo(midX, startY, midX, midY);
                ctx.lineTo(endX, midY);
            } else {
                ctx.lineTo(startX, midY);
                ctx.quadraticCurveTo(startX, midY, midX, midY);
                ctx.lineTo(midX, endY);
            }
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(endY - startY, endX - startX);
        drawArrowhead(ctx, endX, endY, angle);

        // Save the path for click detection
        edge.path = new Path2D();
        ctx.stroke(edge.path);
    }

    function drawArrowhead(ctx, x, y, angle) {
        const length = 10;
        const width = 7;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-length, width / 2);
        ctx.lineTo(-length, -width / 2);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
    }

    function updateFlowGraphCode() {
        const flowGraph = {};
        nodes.forEach(node => {
            const nodeId = node.id;
            const message = node.element.querySelector('textarea').value;
            const next = node.next;
            flowGraph[nodeId] = {
                id: nodeId,
                message: message,
                options: [], // You can update this part to handle options
                next: next
            };
        });
        flowGraphCode.textContent = `const chatFlowGraph = ${JSON.stringify(flowGraph, null, 2)};`;
    }
});
