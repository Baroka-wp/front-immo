document.addEventListener('DOMContentLoaded', () => {
    const properties = [
        {
            id: 1,
            name: 'Luxury Villa',
            city: 'Paris',
            price: '€2,000,000',
            area: '1476 m²',
            rooms: 7,
            image: '../assets/image_2.png',
            description: 'Ludovic Graillot vous propose à la vente cet ensemble immobilier situé proche de la gare de CHAUMONT. À 5 minutes à pied du centre-ville, venez visiter cet ensemble immobilier composé...'
        },
        {
            id: 2,
            name: 'Modern Apartment',
            city: 'Berlin',
            price: '€1,200,000',
            area: '68 m²',
            rooms: 3,
            image: '../assets/image1.jpg',
            description: 'Fabrice PAYNE vous propose cet appartement de 2 chambres dans le cadre de ce programme bénéficiant de la nouvelle norme énergétique RE 2020 à quelques pas de la station de métro...'
        },
        {
            id: 3,
            name: 'Cozy Cottage',
            city: 'London',
            price: '€850,000',
            area: '100 m²',
            rooms: 5,
            image: '../assets/image3.jpeg',
            description: 'Venez découvrir ce charmant cottage situé dans un quartier calme et verdoyant, idéal pour une famille. Avec ses 5 pièces et son jardin spacieux, il offre un cadre de vie paisible...'
        },
        // Add more properties here...
    ];

    function displayPropertyList() {
        const propertiesContainer = document.querySelector('.properties');
        propertiesContainer.innerHTML = '';

        properties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            propertyCard.innerHTML = `
                <div class="property-image">
                    <img src="${property.image}" alt="${property.name}">
                </div>
                <div class="property-details">
                    <div class="property-header">
                        <h3>${property.name}</h3>
                    </div>
                    <div class="property-body">
                        <div class="property-body-item">
                            <i class="fa fa-euro"></i>
                            <p>${property.price}</p>
                        </div>
                        <div class="property-body-item">
                            <i class="fa fa-expand"></i>
                            <p>${property.area}</p>
                        </div>
                        <div class="property-body-item">
                            <i class="fa fa-bed"></i>
                            <p>${property.rooms} Pièce(s)</p>
                        </div>
                        <div class="property-body-item">
                            <i class="fa fa-map-marker"></i>
                            <p>${property.city}</p>
                        </div>
                    </div>
                    <div class="property-contact">
                        <button class="property-contact-btn">Interested</button>
                    </div>
                    <p class="property-description">${property.description}</p>
                </div>
            `;
            propertyCard.addEventListener('click', () => startChatFlowWithProperty(property.name));
            propertiesContainer.appendChild(propertyCard);
        });

        document.querySelectorAll('.property-contact-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const propertyCard = button.closest('.property-card');
                const propertyName = propertyCard.querySelector('.property-header h3').textContent;
                startChatFlowWithProperty(propertyName);
            });
        });
    }

    function startChatFlowWithProperty(propertyName) {
        toggleChat();
        currentNode = chatFlowGraph.propertydetail;
        appendMessage('system', currentNode.message + propertyName + '?');
        displayOptions(currentNode.options, handleUserResponse);
        saveCurrentNode()
    }

    displayPropertyList();
});
