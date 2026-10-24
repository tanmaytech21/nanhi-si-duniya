// ==========================================
// NANHI DUNIYA CRECHE & DAY CARE
// JavaScript + Supabase Database
// ==========================================

console.log("Welcome to Nanhi Duniya! ❤️");


// ==========================================
// STEP 1: SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://usajpvsavspzvmvmfhrz.supabase.co/";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_eAeGyoAdja11-SYp6VJbCQ_LOJL9mVJ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log(
    "Supabase library loaded:",
    !!window.supabase
);


// ==========================================
// STEP 2: ADMISSION ENQUIRY FORM
// ==========================================

const admissionForm = document.getElementById("admissionForm");

if (admissionForm) {

    admissionForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const parentName =
            document.getElementById("parentName").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

            const childName =
    document.getElementById("childName").value.trim();

        const childAge =
            document.getElementById("childAge").value;

        const message =
            document.getElementById("message").value.trim();

        const formMessage =
            document.getElementById("formMessage");

        formMessage.textContent = "Submitting your enquiry...";

        const submitButton = admissionForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {

            const { error } = await supabaseClient
                .from("admission_enquiries")
                .insert([
                    {
    parent_name: parentName,
    phone: phone,
    child_name: childName,
    child_age: childAge,
    message: message
}
                ]);

            if (error) {

                console.error("Supabase Error:", error);

                formMessage.textContent =
                    "Error: " + error.message;

            } else {

                formMessage.textContent =
                    "Thank you, " + parentName +
                    "! Your enquiry has been submitted successfully. ❤️";

                admissionForm.reset();

                console.log(
                    "Admission enquiry saved successfully!"
                );

            }

        } catch (error) {

            console.error("Unexpected error:", error);

            formMessage.textContent =
                "Connection problem! Please try again.";

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    });

}


// ==========================================
// STEP 3: HERO HEADING INTERACTION
// ==========================================

const heroTitle = document.querySelector(".hero h1");

if (heroTitle) {

    heroTitle.addEventListener("click", function () {

        alert("Welcome to Nanhi Duniya! 🧸❤️");

    });

}


// ==========================================
// STEP 4: NAVIGATION BUTTON
// ==========================================

const admissionButton = document.querySelector(".nav-btn");

if (admissionButton) {

    admissionButton.addEventListener("click", function () {

        console.log("Admission enquiry button clicked!");

    });

}


// ==========================================
// STEP 5: PHOTO SLIDER
// ==========================================

const slider = document.querySelector(".slider");

if (slider) {

    const slides = slider.querySelectorAll(".slide");

    const nextButton = slider.querySelector(".next");

    const prevButton = slider.querySelector(".prev");

    const toggleButton = slider.querySelector(".slider-toggle");

    const dotsContainer = slider.querySelector(".slider-dots");

    let currentSlide = 0;

    let slideTimer;

    let isPaused = false;


    // --------------------------------------
    // CHECK SLIDER ELEMENTS
    // --------------------------------------

    if (
        slides.length > 0 &&
        nextButton &&
        prevButton &&
        toggleButton &&
        dotsContainer
    ) {

        // Sabhi slides ko inactive karna
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });


        // ----------------------------------
        // CREATE SLIDER DOTS
        // ----------------------------------

        dotsContainer.innerHTML = "";

        slides.forEach((slide, index) => {

            const dot = document.createElement("button");

            dot.type = "button";

            dot.classList.add("slider-dot");

            dot.setAttribute(
                "aria-label",
                `Show photo ${index + 1}`
            );

            dot.addEventListener("click", () => {

                showSlide(index);

                restartSlider();

            });

            dotsContainer.appendChild(dot);

        });

        const dots =
            dotsContainer.querySelectorAll(".slider-dot");


        // ----------------------------------
        // SHOW SELECTED PHOTO
        // ----------------------------------

        function showSlide(index) {

            slides[currentSlide].classList.remove("active");

            dots[currentSlide].classList.remove("active");

            currentSlide =
                (index + slides.length) % slides.length;

            slides[currentSlide].classList.add("active");

            dots[currentSlide].classList.add("active");

        }


        // ----------------------------------
        // START AUTOMATIC SLIDING
        // ----------------------------------

        function startSlider() {

            clearInterval(slideTimer);

            if (!isPaused && slides.length > 1) {

                slideTimer = setInterval(() => {

                    showSlide(currentSlide + 1);

                }, 3000);

            }

        }


        // ----------------------------------
        // RESTART SLIDER TIMER
        // ----------------------------------

        function restartSlider() {

            startSlider();

        }


        // ----------------------------------
        // NEXT PHOTO BUTTON
        // ----------------------------------

        nextButton.addEventListener("click", () => {

            showSlide(currentSlide + 1);

            restartSlider();

        });


        // ----------------------------------
        // PREVIOUS PHOTO BUTTON
        // ----------------------------------

        prevButton.addEventListener("click", () => {

            showSlide(currentSlide - 1);

            restartSlider();

        });


        // ----------------------------------
        // PAUSE / PLAY BUTTON
        // ----------------------------------

        toggleButton.addEventListener("click", () => {

            isPaused = !isPaused;

            if (isPaused) {

                clearInterval(slideTimer);

                toggleButton.textContent = "▶️ Play";

                toggleButton.setAttribute(
                    "aria-label",
                    "Play slideshow"
                );

            } else {

                toggleButton.textContent = "⏸️ Pause";

                toggleButton.setAttribute(
                    "aria-label",
                    "Pause slideshow"
                );

                startSlider();

            }

        });


        // ----------------------------------
        // PAUSE ON MOUSE HOVER
        // ----------------------------------

        slider.addEventListener("mouseenter", () => {

            clearInterval(slideTimer);

        });


        // ----------------------------------
        // RESUME WHEN MOUSE LEAVES
        // ----------------------------------

        slider.addEventListener("mouseleave", () => {

            if (!isPaused) {

                startSlider();

            }

        });


        // ----------------------------------
        // INITIALIZE SLIDER
        // ----------------------------------

        toggleButton.textContent = "⏸️ Pause";

        toggleButton.setAttribute(
            "aria-label",
            "Pause slideshow"
        );

        showSlide(0);

        startSlider();

    } else {

        console.warn(
            "Photo slider HTML elements are missing. Check your gallery HTML."
        );

    }

}


// ==========================================
// END OF NANHI DUNIYA JAVASCRIPT
// ==========================================

console.log("Nanhi Duniya JavaScript loaded successfully! ❤️");