export default function decorate(block) {
    debugger
    const sliderWrapper = block.closest('.myslider-wrapper');
    if (!sliderWrapper) return;

    const slides = Array.from(block.children);
    const totalSlides = slides.length;

    // Wrap slides inside a container
    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('myslider-container-new');

    slides.forEach((slide, index) => {
        slide.classList.add('myslider-slide');
        slide.dataset.index = index;

        // Extract image and link
        const img = slide.querySelector('img');
        const link = slide.querySelector('p a') || slide.querySelector('p');

        if (link && img) {
            const url = link.innerText.trim();
            slide.innerHTML = ''; // Clear previous content

            // Create clickable anchor element
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.target = "_blank"; // Open in new tab
            anchor.appendChild(img);

            slide.appendChild(anchor);
        }

        sliderContainer.appendChild(slide);
    });

    // Create navigation buttons
    const prevButton = document.createElement('button');
    prevButton.classList.add('prev');
    prevButton.innerHTML = '&#10094;';

    const nextButton = document.createElement('button');
    nextButton.classList.add('next');
    nextButton.innerHTML = '&#10095;';

    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('dots');

    // Append everything to the wrapper
    block.innerHTML = ''; // Clear existing content
    block.appendChild(sliderContainer);
    block.appendChild(prevButton);
    block.appendChild(nextButton);
    block.appendChild(dotsContainer);

    let currentIndex = 0;

    // Function to move slides
    function moveToSlide(index) {
        if (index >= totalSlides) index = 0;
        if (index < 0) index = totalSlides - 1;
        currentIndex = index;
        sliderContainer.style.transform = `translateX(-${index * 100}%)`;
        updateDots();
    }

    // Next/Prev button click handlers
    nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));
    prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));

    // Create dot indicators dynamically
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.dataset.index = i;
        dot.addEventListener('click', () => moveToSlide(i));
        dotsContainer.appendChild(dot);
    });

    // Update active dot
    function updateDots() {
        document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
        dotsContainer.children[currentIndex].classList.add('active');
    }

    // Initialize first slide and dots
    moveToSlide(0);
}
