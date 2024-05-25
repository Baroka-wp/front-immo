

function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');
    navLinks.classList.toggle('show');
    
    if (menuIcon.classList.contains('fa-bars')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-times');
    } else {
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

let currentSlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.testimonial-card');
    const slider = document.querySelector('.testimonial-slider');
    const slideWidth = slides[0].clientWidth + parseInt(getComputedStyle(slides[0]).marginRight, 10);
    
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    slider.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const properties = [
        {
            id: 1,
            name: 'Luxury Villa',
            city: 'Paris',
            price: '€2,000,000',
            image: 'images/villa1.jpg'
        },
        {
            id: 2,
            name: 'Modern Apartment',
            city: 'Berlin',
            price: '€1,200,000',
            image: 'images/apartment1.jpg'
        },
        {
            id: 3,
            name: 'Cozy Cottage',
            city: 'London',
            price: '€850,000',
            image: 'images/cottage1.jpg'
        },
        {
            id: 4,
            name: 'Beach House',
            city: 'Barcelona',
            price: '€1,800,000',
            image: 'images/beachhouse1.jpg'
        },
        {
            id: 5,
            name: 'Penthouse',
            city: 'New York',
            price: '$3,000,000',
            image: 'images/penthouse1.jpg'
        },
        {
            id: 6,
            name: 'Family Home',
            city: 'Sydney',
            price: 'AUD 1,500,000',
            image: 'images/familyhome1.jpg'
        },
        {
            id: 7,
            name: 'Country House',
            city: 'Dublin',
            price: '€950,000',
            image: 'images/countryhouse1.jpg'
        },
        {
            id: 8,
            name: 'Downtown Loft',
            city: 'Tokyo',
            price: '¥150,000,000',
            image: 'images/loft1.jpg'
        },
        {
            id: 9,
            name: 'Suburban House',
            city: 'Toronto',
            price: '$1,100,000',
            image: 'images/suburbanhouse1.jpg'
        },
        {
            id: 10,
            name: 'Mountain Cabin',
            city: 'Zurich',
            price: 'CHF 2,500,000',
            image: 'images/cabin1.jpg'
        }
    ];

    function displayPropertyList() {
        const propertyListSection = document.getElementById('property-list');
        const propertiesContainer = propertyListSection.querySelector('.properties');
        propertiesContainer.innerHTML = '';

        properties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            propertyCard.innerHTML = `
                <img src="${property.image}" alt="${property.name}">
                <div class="property-info">
                    <h3>${property.name}</h3>
                    <p>City: ${property.city}</p>
                    <p class="price">Price: ${property.price}</p>
                </div>
            `;
            propertiesContainer.appendChild(propertyCard);
        });

        propertyListSection.classList.remove('hidden');
    }

    window.displayPropertyList = displayPropertyList;
    
    setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
});


function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
