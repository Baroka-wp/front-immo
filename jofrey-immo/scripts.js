(function() {
    let selectedItem = null;

    document.addEventListener('DOMContentLoaded', () => {
        const gallery = document.getElementById('gallery');
        
        // Restore selected item and chat state if available
        const savedSelectedItem = localStorage.getItem('selectedItem');
        if (savedSelectedItem) {
            selectedItem = JSON.parse(savedSelectedItem);
            renderSelectedItem(selectedItem, true); // Pass true to indicate it's from storage
        }

        // Function to create a skeleton loader
        function createSkeletonLoader() {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton';
            return skeleton;
        }

        // Display skeleton loaders
        for (let i = 0; i < 6; i++) {
            gallery.appendChild(createSkeletonLoader());
        }

        // Fetch gallery items from the server
        fetch('http://localhost:3001/gallery')
            .then(response => response.json())
            .then(data => {
                // Remove skeleton loaders
                gallery.innerHTML = '';

                // Render gallery items
                data.items.forEach(item => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    galleryItem.innerHTML = `
                        <img data-src="${item.image}" alt="${item.tag}" class="lazy">
                        <div class="tag">${item.tag}</div>
                    `;
                    galleryItem.addEventListener('click', () => {
                        localStorage.setItem('selectedItem', JSON.stringify(item));
                        renderSelectedItem(item);
                    });
                    gallery.appendChild(galleryItem);
                });

                // Lazy load images
                const lazyImages = document.querySelectorAll('.lazy');
                const lazyLoad = (entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    });
                };

                const observer = new IntersectionObserver(lazyLoad, {
                    rootMargin: '0px 0px 50px 0px',
                    threshold: 0.1
                });

                lazyImages.forEach(img => {
                    observer.observe(img);
                });
            })
            .catch(error => {
                console.error('Error fetching gallery items:', error);
            });
    });

    function renderSelectedItem(item, isRestored = false) {
        selectedItem = item;
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = `
            <div class="selected-item">
                <img src="${item.image}" alt="${item.tag}" class="selected-item-img">
                <div class="overlay">
                    <div class="overlay-content">
                        <h2>${item.tag}</h2>
                        <p>${item.detail}</p>
                        <p>Place: ${item.place}</p>
                        <p>Price: ${item.price}</p>
                    </div>
                </div>
                <div class="buttons">
                    <button id="backButton">Back to Gallery</button>
                    <button id="interestedButton">I'm Interested</button>
                </div>
            </div>
        `;

        document.getElementById('backButton').addEventListener('click', () => {
            localStorage.removeItem('selectedItem');
            location.reload();
        });

        document.getElementById('interestedButton').addEventListener('click', () => {
            startChat(selectedItem);
        });

        if (isRestored) {
            document.getElementById('interestedButton').click();
        }
    }
})();
