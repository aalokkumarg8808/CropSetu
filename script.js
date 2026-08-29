const shopsButton = document.getElementById("shopsButton");
const shopsSection = document.getElementById("shopsSection");
let userLat = null;
let userLng = null;


function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLng/2) ** 2;
    return (2 * R * Math.asin(Math.sqrt(a))).toFixed(1);
}
shopsButton.addEventListener("click", function () {
    hideSections();
    renderShops();
    shopsSection.style.display = "block";
    showShopsMap();
});
const shops = [
    { name: "Sharma Agro Store", lat: 28.6300, lng: 77.2100, products: "Seeds, Farming Tools", phone: "9876543210" },
    { name: "Kisan Seva Center", lat: 28.6450, lng: 77.2350, products: "Seeds, Fertilizers, Tools", phone: "9876501234" },
    { name: "Green Farm Store", lat: 28.6100, lng: 77.1900, products: "Seeds, Tools", phone: "9876512345" },
    { name: "Kisan Agro Point", lat: 28.6500, lng: 77.2500, products: "Seeds, Tools", phone: "9876567890" }
];
const shopsContainer = document.getElementById("shopsContainer");
let shopsMapInstance = null;


const toastContainer = document.createElement("div");
toastContainer.id = "toastContainer";
document.body.appendChild(toastContainer);

window.alert = function(message) {

    const toast = document.createElement("div");
    toast.className = "custom-toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(function() {
        toast.classList.add("toast-hide");

        setTimeout(function() {
            toast.remove();
        }, 300);

    }, 2500);
};

/* =========================================================
   SAFE STORAGE READ
   localStorage ka data kharab ho jaaye to poora app na mare
   ========================================================= */

function loadStored(key, fallback) {

    try {

        const raw = localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        const data = JSON.parse(raw);

        // Array chahiye tha to array hi mile
        if (Array.isArray(fallback) && !Array.isArray(data)) {
            return fallback;
        }

        return data;

    } catch (error) {

        console.warn("Kharab data mila, reset kar diya:", key);
        localStorage.removeItem(key);

        return fallback;
    }
}


/* =========================================================
   CUSTOM CONFIRM DIALOG
   ========================================================= */

function showConfirm(options, onConfirm) {

    // Sirf message bheja ho to bhi chal jaaye
    if (typeof options === "string") {
        options = { message: options };
    }

    const icon = options.icon || "❓";
    const message = options.message || "are you sure?";
    const okText = options.okText || "confirm";
    const cancelText = options.cancelText || "Cancel";
    const dangerClass = options.danger ? " confirm-danger" : "";


    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    overlay.innerHTML = `
        <div class="confirm-box${dangerClass}">

            <div class="confirm-icon">
                ${icon}
            </div>

            <p class="confirm-message">
                ${message}
            </p>

            <div class="confirm-actions">

                <button class="confirm-cancel-button">
                    ${cancelText}
                </button>

                <button class="confirm-ok-button">
                    ${okText}
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(overlay);


    // Animation chalane ke liye
    setTimeout(function () {
        overlay.classList.add("confirm-show");
    }, 10);


    function closeConfirm() {

        overlay.classList.remove("confirm-show");

        setTimeout(function () {
            overlay.remove();
        }, 200);
    }


    overlay.querySelector(".confirm-ok-button")
        .addEventListener("click", function () {

            closeConfirm();

            if (typeof onConfirm === "function") {
                onConfirm();
            }

        });


    overlay.querySelector(".confirm-cancel-button")
        .addEventListener("click", closeConfirm);


    // Background par click karne se band ho jaaye
    overlay.addEventListener("click", function (event) {

        if (event.target === overlay) {
            closeConfirm();
        }

    });

}


const translations = {

    en: {
        tagline: "Connecting Farmers to Better Markets",
        nav_home: "Home",
        nav_sell: "Sell Crop",
        nav_seeds: "Buy Seeds",
        nav_shops: "Nearby Shops",
        nav_buyers: "Nearby Buyers",
        nav_lands: "My Farming Lands"
    },

    hi: {
        tagline: "किसानों को बेहतर बाज़ार से जोड़ना",
        nav_home: "होम",
        nav_sell: "फसल बेचें",
        nav_seeds: "बीज खरीदें",
        nav_shops: "नज़दीकी दुकानें",
        nav_buyers: "नज़दीकी खरीदार",
        nav_lands: "मेरी कृषि भूमि"
    },

    mr: {
        tagline: "शेतकऱ्यांना चांगल्या बाजाराशी जोडणे",
        nav_home: "मुख्यपृष्ठ",
        nav_sell: "पीक विका",
        nav_seeds: "बियाणे खरेदी करा",
        nav_shops: "जवळची दुकाने",
        nav_buyers: "जवळचे खरेदीदार",
        nav_lands: "माझी शेतजमीन"
    }

};

function applyLanguage(lang) {

    const dict = translations[lang] || translations.en;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {

        const key = el.getAttribute("data-i18n");

        if (dict[key]) {
            el.textContent = dict[key];
        }

    });

    localStorage.setItem("selectedLanguage", lang);
}

const languageSelect = document.getElementById("languageSelect");

const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
languageSelect.value = savedLanguage;
applyLanguage(savedLanguage);

languageSelect.addEventListener("change", function () {
    applyLanguage(languageSelect.value);
});


function showShopsMap() {
    if (!shopsMapInstance) {
        shopsMapInstance = L.map("shopsMap").setView([28.6300, 77.2100], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(shopsMapInstance);

        shops.forEach(function(shop) {
            L.marker([shop.lat, shop.lng])
                .addTo(shopsMapInstance)
                .bindPopup(shop.name);
        });
    }

    setTimeout(function () {
        shopsMapInstance.invalidateSize();
    }, 100);
}

function renderShops() {
    shopsContainer.innerHTML = "";
    shops.forEach(function(shop) {
        const dist = (userLat !== null)
            ? getDistanceKm(userLat, userLng, shop.lat, shop.lng) + " km"
            : "Set location to see distance";

        const shopCard = document.createElement("div");
        shopCard.className = "shop-card";
        shopCard.innerHTML = `
            <h3>${shop.name}</h3>
            <p>📍 ${dist} away</p>
            <p>🌱 ${shop.products}</p>
            <p>📞 ${shop.phone}</p>
            <button onclick="viewShop('${shop.name}')">View Shop</button>
        `;
        shopsContainer.appendChild(shopCard);
    });
}
function viewShop(shopName) {

    const shop = shops.find(function(item) {
        return item.name === shopName;
    });

        alert(
        "🏪 " + shop.name +
        "\n🌱 " + shop.products +
        "\n📞 " + shop.phone
    );
}

// location ke liye code likha hai
const locationButton = document.getElementById("locationButton");
const currentLocation = document.getElementById("currentLocation");

const savedLat = localStorage.getItem("userLat");
const savedLng = localStorage.getItem("userLng");

if (savedLat && savedLng) {
    userLat = Number(savedLat);
    userLng = Number(savedLng);

    currentLocation.textContent = "📍 Location saved";
}

locationButton.addEventListener("click", function() {

    if (!navigator.geolocation) {
        currentLocation.textContent = "Location is not supported";
        return;
    }

    currentLocation.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
                function(position) {

            userLat = position.coords.latitude;
            userLng = position.coords.longitude;

            localStorage.setItem("userLat", userLat);
            localStorage.setItem("userLng", userLng);

           fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`
)
.then(response => response.json())
.then(data => {

    const address = data.address;

    currentLocation.textContent =
        "📍 " +
        (address.city || address.town || address.village || "Location") +
        ", " +
        (address.country || "");

})
.catch(() => {

    currentLocation.textContent = "📍 Location found";

});
renderShops();
renderBuyers();
        },

        function(error) {

            currentLocation.textContent =
                "Unable to get location";

        }
    );

});
const sellCropButton = document.getElementById("sellCropButton");
const sellCropForm = document.getElementById("sellCropForm");
const listedCropsSection = document.getElementById("listedCropsSection");

sellCropButton.addEventListener("click", function () {

    hideSections();

    sellCropForm.style.display = "block";

    // Sell Crop ke neeche listed crops bhi dikhao
    listedCropsSection.style.display = "";

    showListedCrops();

});
const listCropButton =
    document.getElementById("listCropButton");

const listedCrops =
    document.getElementById("listedCrops");

let listedCropData = loadStored("listedCrops", []);

function showListedCrops() {

    listedCrops.innerHTML = "";


    // Agar koi crop listed nahi hai
    if (listedCropData.length === 0) {

        listedCrops.innerHTML = `
            <div class="listed-empty">
                🌾 No crops listed yet
            </div>
        `;

        return;
    }


    listedCropData.forEach(function(crop, index) {

        listedCrops.innerHTML += `

            <div class="listed-crop-card">

                <div class="listed-crop-top">

                    <div class="listed-crop-name">

                        <div class="listed-crop-icon">
                            🌾
                        </div>

                        <div>
                            <h3>
                                ${crop.name}
                            </h3>
                        </div>

                    </div>

                </div>


                <div class="listed-crop-details">

                    <div class="listed-crop-detail">

                        <small>
                            Quantity
                        </small>

                        <strong>
                            ${crop.quantity} Quintal
                        </strong>

                    </div>


                    <div class="listed-crop-detail price">

                        <small>
                            Expected Price
                        </small>

                        <strong>
                            ₹${crop.price} / Quintal
                        </strong>

                    </div>

                </div>


                <button
                    class="delete-listed-crop-button"
                    onclick="deleteListedCrop(${index})"
                >
                    🗑️ Delete
                </button>

            </div>

        `;

    });

}


function deleteListedCrop(index) {

    showConfirm({

        icon: "🌾",
        message: "are you sure you want to delete this listed crop?",
        okText: "Delete",
        danger: true

    }, function () {

        listedCropData.splice(index, 1);

        localStorage.setItem(
            "listedCrops",
            JSON.stringify(listedCropData)
        );

        showListedCrops();

        alert("🗑️ Crop deleted");

    });

}
listCropButton.addEventListener("click", function () {

    const name =
        document.getElementById("cropName").value;

    const quantity =
        document.getElementById("cropQuantity").value;

    const price =
        document.getElementById("cropPrice").value;

    if (!name || !quantity || !price) {

        alert("Please fill all details");
        return;
    }
    
    // Number mein badal ke check karo
    const qtyNumber = Number(quantity);
    const priceNumber = Number(price);


    if (!(qtyNumber > 0)) {

        alert("⚠️ Quantity 0 se zyada honi chahiye");
        return;
    }


    if (!(priceNumber > 0)) {

        alert("⚠️ Price 0 se zyada hona chahiye");
        return;
    }

    listedCropData.push({
        name: name,
        quantity: quantity,
        price: price
    });

    localStorage.setItem(
        "listedCrops",
        JSON.stringify(listedCropData)
    );

    showListedCrops();

    document.getElementById("cropName").value = "";
    document.getElementById("cropQuantity").value = "";
    document.getElementById("cropPrice").value = "";

      alert("🌾 Crop listed successfully!");

    listedCropsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});

showListedCrops();

const buyersButton = document.getElementById("buyersButton");
const buyersSection = document.getElementById("buyersSection");
const buyersContainer = document.getElementById("buyersContainer");

const buyers = [
    { icon: "🤝", name: "Patel Traders", lat: 28.6200, lng: 77.2050, buying: "Wheat, Rice, Soybean", phone: "9988776655" },
    { icon: "🏪", name: "Fresh Basket Supply", lat: 28.6600, lng: 77.2400, buying: "Tomato, Onion, Potato", phone: "9988776657" },
    { icon: "🏢", name: "Delhi Mandi Commission", lat: 28.6400, lng: 77.1800, buying: "All Vegetables", phone: "9988776656" }
];
let buyersMapInstance = null;

function showBuyersMap() {
    if (!buyersMapInstance) {
        buyersMapInstance = L.map("buyersMap").setView([28.6300, 77.2100], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(buyersMapInstance);

        buyers.forEach(function(buyer) {
            L.marker([buyer.lat, buyer.lng])
                .addTo(buyersMapInstance)
                .bindPopup(buyer.name);
        });
    }

    setTimeout(function () {
        buyersMapInstance.invalidateSize();
    }, 100);
}
function renderBuyers() {
    buyersContainer.innerHTML = "";
    buyers.forEach(function(buyer) {
        const dist = (userLat !== null)
            ? getDistanceKm(userLat, userLng, buyer.lat, buyer.lng) + " km"
            : "Set location to see distance";

        buyersContainer.innerHTML += `
            <div class="shop-card">
                <h3>${buyer.icon} ${buyer.name}</h3>
                <p>📍 ${dist} away</p>
                <p>🌾 Buying: ${buyer.buying}</p>
                <p>📞 ${buyer.phone}</p>
                <button onclick="window.location.href='tel:${buyer.phone}'">📞 Contact Buyer</button>
            </div>
        `;
    });
}

buyersButton.addEventListener("click", function () {
    hideSections();
    renderBuyers();
    buyersSection.style.display = "block";
    showBuyersMap();
});
function hideSections() {

    sellCropForm.style.display = "none";
    shopsSection.style.display = "none";
    buyersSection.style.display = "none";
    farmSection.style.display = "none";
    seedsSection.style.display = "none";
    priceTrackingSection.style.display = "none";
    profileSection.classList.remove("drawer-open");
    profileSection.style.display = "none";
   notificationSection.classList.remove("drawer-open");
   notificationSection.style.display = "none";

    // Home ka content
    document.querySelectorAll(".home-section").forEach(function (section) {
        section.style.display = "none";
    });

    // Market Price result clear
    priceResult.innerHTML = "";
}

const homeButton = document.getElementById("homeButton");

homeButton.addEventListener("click", function () {

    hideSections();

    // Yahan "" lagana zaroori hai, "block" nahi —
    // warna .location ka display:flex toot jaata hai
    document.querySelectorAll(".home-section").forEach(function (section) {
        section.style.display = "";
    });

});


// Sidebar ka highlight sahi jagah lagane ke liye
document.querySelectorAll(".side-button").forEach(function (button) {

    button.addEventListener("click", function () {

        document.querySelectorAll(".side-button").forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

    });

});


const farmButton = document.getElementById("farmButton");
const farmSection = document.getElementById("farmSection");

let farmMapInstance = null;

let landPoints = [];
let landMarkers = [];
let landLine = null;

farmButton.addEventListener("click", function () {

    hideSections();

    farmSection.style.display = "block";

    if (!farmMapInstance) {

        farmMapInstance = L.map("farmMap").setView(
            [20.5937, 78.9629],
            5
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(farmMapInstance);

    }

    setTimeout(function () {
        farmMapInstance.invalidateSize();
        restoreLandBoundaries();

        // User ki location pe zoom karo (agar location set hai)
        if (userLat !== null && userLng !== null) {
            farmMapInstance.setView([userLat, userLng], 14);
        }
    }, 100);

});
const startDrawButton = document.getElementById("startDrawButton");
const finishDrawButton = document.getElementById("finishDrawButton");

let isDrawingLand = false;


startDrawButton.addEventListener("click", function () {

    if (!farmMapInstance) {
        alert("Map abhi load nahi hua.");
        return;
    }

    // Drawing mode ON
    isDrawingLand = true;

       // Purane points clear — markers ko map se bhi hatao, warna
    // purane green dots hamesha ke liye chipak jaate hain
    landPoints = [];

    landMarkers.forEach(function (marker) {
        farmMapInstance.removeLayer(marker);
    });

    landMarkers = [];
    

    // Purani line remove
    if (landLine) {
        farmMapInstance.removeLayer(landLine);
        landLine = null;
    }

    // Buttons change
    startDrawButton.style.display = "none";
    finishDrawButton.style.display = "inline-block";

    // Map click listener
    farmMapInstance.off("click", addLandPoint);
    farmMapInstance.on("click", addLandPoint);

});

function addLandPoint(e) {

    if (!isDrawingLand) {
        return;
    }

    // Point save
    landPoints.push(e.latlng);

    // Marker
    const marker = L.circleMarker(e.latlng, {

        radius: 6,

        color: "#247a45",

        fillColor: "#247a45",

        fillOpacity: 1,

        weight: 2

    }).addTo(farmMapInstance);

    landMarkers.push(marker);


    // Boundary line
    if (landPoints.length > 1) {

        if (landLine) {
            farmMapInstance.removeLayer(landLine);
        }

        landLine = L.polyline(
            landPoints,
            {
                color: "#247a45",
                weight: 4
            }
        ).addTo(farmMapInstance);

    }

}
finishDrawButton.addEventListener("click", function () {

    if (landPoints.length < 3) {

        alert("Kam se kam 3 points select karo.");

        return;
    }


    isDrawingLand = false;


    // Map click listener OFF
    farmMapInstance.off("click", addLandPoint);


    // Boundary close karo
    if (landLine) {

        farmMapInstance.removeLayer(landLine);

    }


    const closedPoints = [
        ...landPoints,
        landPoints[0]
    ];


    landLine = L.polyline(
        closedPoints,
        {
            color: "#247a45",
            weight: 4
        }
    ).addTo(farmMapInstance);


    // Buttons
    finishDrawButton.style.display = "none";

    startDrawButton.style.display = "inline-block";


    alert("✅ Land boundary ready. Ab land ka naam likhkar Save Land dabao.");

});
const saveLandButton = document.getElementById("saveLandButton");
const landName = document.getElementById("landName");
const savedLands = document.getElementById("savedLands");

let savedLandData = loadStored("savedLands", []);

function calculateLandArea(points) {

    if (!points || points.length < 3) {
        return 0;
    }

    const earthRadius = 6378137;

    let area = 0;

    for (let i = 0; i < points.length; i++) {

        const current = points[i];

        const next =
            points[(i + 1) % points.length];

        const x1 =
            current.lng *
            Math.PI / 180 *
            earthRadius *
            Math.cos(
                current.lat * Math.PI / 180
            );

        const y1 =
            current.lat *
            Math.PI / 180 *
            earthRadius;

        const x2 =
            next.lng *
            Math.PI / 180 *
            earthRadius *
            Math.cos(
                next.lat * Math.PI / 180
            );

        const y2 =
            next.lat *
            Math.PI / 180 *
            earthRadius;

        area +=
            (x1 * y2) -
            (x2 * y1);
    }

    area =
        Math.abs(area) / 2;

    // square metres → acres
    const acres =
        area / 4046.8564224;

    return acres;
}

function showSavedLands() {
const totalLandCount =
    document.getElementById("totalLandCount");

const totalLandArea =
    document.getElementById("totalLandArea");

let totalArea = 0;

savedLandData.forEach(function (land) {

    totalArea += calculateLandArea(
        land.points
    );

});

totalLandCount.textContent =
    savedLandData.length;

totalLandArea.textContent =
    totalArea.toFixed(2) + " acres";
    savedLands.innerHTML = "";

    if (savedLandData.length === 0) {

        savedLands.innerHTML = `
            <div class="land-empty">
                🗺️ No registered lands found
            </div>
        `;

        return;
    }
    savedLandData.forEach(function (land, index) {
        const landId =
            "LAND-" + String(index + 1).padStart(3, "0");
            const landArea =
    calculateLandArea(land.points).toFixed(2);
        savedLands.innerHTML += `
            <div class="registered-land-card">
                <div class="registered-land-top">
                    <div>
                        <h3>
                            🌾 ${land.name}
                        </h3>
                        <span class="verified-badge">
                            ✓ Saved
                        </span>
                    </div>
                </div>
                <div class="land-details">
                    <div class="land-detail">
                        <small>
                            🆔 Land ID
                        </small>
                        <strong>
                            ${landId}
                        </strong>
                    </div>
                    <div class="land-detail">
                        <small>
                            📍 Boundary
                        </small>
                        <strong>
                            ${land.points.length} points
                        </strong>
                    </div>
                    <div class="land-detail">
                        <small>
                              📐 Area
                        </small>
                       <strong>
                       ${landArea} acres
                       </strong>
                 </div>
                </div>
                <div class="land-card-actions">
                    <button
                        class="view-land-button"
                        onclick="zoomToLand(${index})"
                    >
                        📍 View on Map
                    </button>
                    <button
                        class="delete-land-button"
                        onclick="deleteLand(${index})"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    });
}
function zoomToLand(index) {

    const land = savedLandData[index];

    hideSections();

    farmSection.style.display = "block";

    if (!farmMapInstance) {
        farmMapInstance = L.map("farmMap").setView(
            [20.5937, 78.9629],
            5
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors"
            }
        ).addTo(farmMapInstance);

        restoreLandBoundaries();
    }

    setTimeout(function () {

        farmMapInstance.invalidateSize();

        farmMapInstance.fitBounds(
            land.points,
            {
                padding: [30, 30]
            }
        );

    }, 100);

}
function deleteLand(index) {

    const land = savedLandData[index];

    showConfirm({

        icon: "🗑️",
        message: "\"" + land.name + "\" Are you sure you want to delete this land?",
        okText: "yes, delete it",
        danger: true

    }, function () {

        savedLandData.splice(index, 1);

        localStorage.setItem(
            "savedLands",
            JSON.stringify(savedLandData)
        );

        showSavedLands();

        if (farmMapInstance) {
            farmMapInstance.eachLayer(function (layer) {

                if (layer instanceof L.Polygon) {
                    farmMapInstance.removeLayer(layer);
                }

            });

            restoreLandBoundaries();
        }

        alert("🗑️ Land deleted");

    });

}
saveLandButton.addEventListener("click", function () {

    if (landPoints.length < 3) {

        alert("Pehle land draw karo.");

        return;
    }


    if (!landName.value.trim()) {

        alert("Land ka naam likho.");

        return;
    }


    savedLandData.push({

        name: landName.value.trim(),

        points: landPoints.map(function (point) {

            return {
                lat: point.lat,
                lng: point.lng
            };

        })

    });


    localStorage.setItem(
        "savedLands",
        JSON.stringify(savedLandData)
    );


    showSavedLands();
landName.value = "";

    // Drawing reset
landPoints = [];

landMarkers.forEach(function (marker) {
    farmMapInstance.removeLayer(marker);
});

landMarkers = [];

if (landLine) {
    farmMapInstance.removeLayer(landLine);
    landLine = null;
}

isDrawingLand = false;

farmMapInstance.off("click", addLandPoint);

startDrawButton.style.display = "inline-block";
finishDrawButton.style.display = "none";

    // Saved land ko turant map par dikhao
    restoreLandBoundaries();

    alert("🌾 Land saved successfully!");

});

const searchLandButton = document.getElementById("searchLandButton");
const landSearchPhone = document.getElementById("landSearchPhone");

searchLandButton.addEventListener("click", function () {

    const enteredPhone = landSearchPhone.value.trim();
    const profile = getSavedProfile();

    if (!enteredPhone) {
        alert("Mobile number enter karo.");
        return;
    }

    if (!profile) {
        alert("Pehle profile banao.");
        return;
    }

    if (enteredPhone !== profile.phone) {

        savedLands.innerHTML = `
            <div class="land-empty">
                ❌ Is number pe koi land registered nahi hai
            </div>
        `;

        return;
    }

    showSavedLands();

    alert("✅ " + savedLandData.length + " land record mile");

});


const profileOnLoad = getSavedProfile();

if (profileOnLoad && profileOnLoad.phone) {

    landSearchPhone.value = profileOnLoad.phone;

    showSavedLands();
}



function restoreLandBoundaries() {

    if (!farmMapInstance) {
        return;
    }

    // Purani saved boundaries ko pehle remove karo
    farmMapInstance.eachLayer(function (layer) {

        if (layer instanceof L.Polygon) {
            farmMapInstance.removeLayer(layer);
        }

    });

    // Saved lands ko dobara map par show karo
    savedLandData.forEach(function (land) {

        L.polygon(land.points, {

            color: "#247a45",
            weight: 3,

            fillColor: "#247a45",
            fillOpacity: 0.18

        }).addTo(farmMapInstance);

    });

}
const mandiLocations = {
    "Azadpur Mandi": { lat: 28.7041, lng: 77.1622 },
    "Ghazipur Mandi": { lat: 28.6127, lng: 77.3260 },
    "Najafgarh Mandi": { lat: 28.6096, lng: 76.9788 }
};

const cropDisplayNames = {
    potato: "Potato",
    wheat: "Wheat",
    tomato: "Tomato"
};

const mandiPrices = {
    potato: [
        { mandi: "Azadpur Mandi", price: 2200 },
        { mandi: "Ghazipur Mandi", price: 2450 },
        { mandi: "Najafgarh Mandi", price: 2100 }
    ],
    wheat: [
        { mandi: "Azadpur Mandi", price: 2550 },
        { mandi: "Ghazipur Mandi", price: 2600 },
        { mandi: "Najafgarh Mandi", price: 2480 }
    ],
    tomato: [
        { mandi: "Azadpur Mandi", price: 1800 },
        { mandi: "Ghazipur Mandi", price: 1950 },
        { mandi: "Najafgarh Mandi", price: 1750 }
    ]
};
const refreshMarketButton =
    document.getElementById("refreshMarketButton");

const marketLastUpdated =
    document.getElementById("marketLastUpdated");

function updateMarketPriceCards() {

    document.querySelectorAll(".price-card").forEach(function (card) {

        const crop = card.dataset.crop;

        const prices = mandiPrices[crop];

        if (!prices) return;

        const averagePrice =
            Math.round(
                prices.reduce(function (total, item) {
                    return total + item.price;
                }, 0) / prices.length
            );

        card.querySelector("p").textContent =
            "₹" + averagePrice.toLocaleString("en-IN") + " / Quintal";

    });
}

// Page load pe hi cards ko sahi price se bhar do
updateMarketPriceCards();


refreshMarketButton.addEventListener("click", function () {

    refreshMarketButton.classList.add("refreshing");

    Object.keys(mandiPrices).forEach(function(crop) {

        mandiPrices[crop].forEach(function(market) {

            const change =
                Math.floor(Math.random() * 401) - 200;

            market.price =
                Math.max(500, market.price + change);

        });

    });

 updateMarketPriceCards();

const selectedCrop = cropSelect.value;

if (selectedCrop) {

    const currentAverage = Math.round(
        mandiPrices[selectedCrop].reduce(function(total, item) {
            return total + item.price;
        }, 0) / mandiPrices[selectedCrop].length
    );

    priceHistory[selectedCrop].prices.push(currentAverage);

    if (priceHistory[selectedCrop].prices.length > 7) {
        priceHistory[selectedCrop].prices.shift();
    }

    priceButton.click();
}

    marketLastUpdated.textContent =
        "Updated just now";

    setTimeout(function() {
        refreshMarketButton.classList.remove("refreshing");
    }, 300);

});

const cropSelect = document.getElementById("cropSelect");
const priceButton = document.getElementById("priceButton");
const priceResult = document.getElementById("priceResult");

priceButton.addEventListener("click", function () {

    const crop = cropSelect.value;

    if (!crop) {
        alert("Pehle crop select karo");
        return;
    }

    const prices = mandiPrices[crop];

    const pricesWithDistance = prices.map(function (item) {

        const loc = mandiLocations[item.mandi];

        const dist = (userLat !== null)
            ? parseFloat(
                getDistanceKm(
                    userLat,
                    userLng,
                    loc.lat,
                    loc.lng
                )
            )
            : null;

        return {
            mandi: item.mandi,
            price: item.price,
            distance: dist
        };
    });


    // Estimated transport cost
    const TRANSPORT_RATE = 10;


    const marketResults = pricesWithDistance.map(function (item) {

        const transportCost =
            item.distance !== null
                ? Math.round(item.distance * TRANSPORT_RATE)
                : 0;

        const netPrice =
            item.price - transportCost;

        return {
            ...item,
            transportCost: transportCost,
            netPrice: netPrice
        };
    });


    // Highest net return wala market
    const best = marketResults.reduce(function (max, item) {

        return item.netPrice > max.netPrice
            ? item
            : max;

    });


    let html = "";


html += `
    <div class="best-market-card">

        <div class="recommended-badge">
            🏆 BEST MARKET FOR YOU
        </div>

        <div class="best-market-title">

            <div>
                <h2>${best.mandi}</h2>

                <p class="market-location">
                    📍 Based on price & travel distance
                </p>
            </div>

        </div>


        <div class="market-info-grid">

            <div class="market-info-item">

                <small>Market Price</small>

                <strong class="market-main-price">
                    ₹${best.price}
                </strong>

                <span>/ Quintal</span>

            </div>


            <div class="market-info-item">

                <small>Distance</small>

                <strong>
                    ${
                        best.distance !== null
                        ? best.distance + " km"
                        : "Set location"
                    }
                </strong>

            </div>


            <div class="market-info-item">

                <small>Transport</small>

                <strong>
                    ₹${best.transportCost}
                </strong>

            </div>

        </div>


        <div class="net-return">

            <small>
                💵 Estimated Net Return
            </small>

            <strong>
                ₹${best.netPrice} / Quintal
            </strong>

            <p>
                Market price minus estimated transport cost
            </p>

        </div>


        <div class="market-note">

            ℹ️ Transport cost is estimated at
            ₹${TRANSPORT_RATE}/km for this demo.

        </div>

    </div>
`;

   html += `
    <div class="comparison-heading">
        <h3>🏪 Market Comparison</h3>
        <p>Compare price, distance and estimated return</p>
    </div>
`;

marketResults.forEach(function (item) {

    const isBest =
        item.mandi === best.mandi;

    const distText =
        item.distance !== null
            ? item.distance + " km"
            : "Set location";

    html += `
        <div class="market-comparison-card
            ${isBest ? "recommended-comparison" : ""}">

            <div class="comparison-top">

                <div>
                    <h3>
                        ${item.mandi}
                    </h3>

                    ${
                        isBest
                        ? `<span class="comparison-badge">
                            🏆 Recommended
                           </span>`
                        : ""
                    }
                </div>

            </div>


            <div class="comparison-info">

                <div class="comparison-item">

                    <small>Market Price</small>

                    <strong class="comparison-price">
                        ₹${item.price}
                    </strong>

                    <span>/ Quintal</span>

                </div>


                <div class="comparison-item">

                    <small>Distance</small>

                    <strong>
                        ${distText}
                    </strong>

                </div>


                <div class="comparison-item">

                    <small>Transport</small>

                    <strong>
                        ₹${item.transportCost}
                    </strong>

                </div>


                <div class="comparison-item net">

                    <small>Net Return</small>

                    <strong>
                        ₹${item.netPrice}
                    </strong>

                    <span>/ Quintal</span>

                </div>

            </div>

        </div>
    `;
});


  // Matching buyers
const cropName =
    cropDisplayNames[crop];

const matchingBuyers =
    buyers.filter(function (buyer) {

        return buyer.buying.includes(cropName)
            || buyer.buying.includes("All Vegetables");

    });


if (matchingBuyers.length > 0) {

    html += `
        <div class="buyers-heading">

            <h3>
                🤝 Buyers who buy ${cropName}
            </h3>

            <p>
                Nearby buyers interested in your crop
            </p>

        </div>
    `;


    matchingBuyers.forEach(function (buyer) {

        const buyerDistance =
            userLat !== null
            ? getDistanceKm(
                userLat,
                userLng,
                buyer.lat,
                buyer.lng
            ) + " km away"
            : "Set location";


        html += `
            <div class="buyer-card">

                <div class="buyer-card-top">

                    <div class="buyer-name">

                        <span class="buyer-icon">
                            ${buyer.icon}
                        </span>

                        <div>
                            <h3>
                                ${buyer.name}
                            </h3>

                            <small>
                                📍 ${buyerDistance}
                            </small>
                        </div>

                    </div>

                </div>


                <div class="buyer-details">

                    <div class="buyer-detail">

                        <small>
                            🌾 Buying
                        </small>

                        <strong>
                            ${buyer.buying}
                        </strong>

                    </div>


                    <div class="buyer-detail">

                        <small>
                            📞 Contact
                        </small>

                        <strong>
                            ${buyer.phone}
                        </strong>

                    </div>

                </div>


                <button
                    class="contact-buyer-button"
                    onclick="
                        window.location.href='tel:${buyer.phone}'
                    "
                >

                    📞 Contact Buyer

                </button>

            </div>
        `;

    });

}

    priceResult.innerHTML = html;
    showPriceTracking(crop);

});

/* =========================================================
   FARMER PROFILE SYSTEM
   ========================================================= */

const profileButton = document.getElementById("profileButton");

const profileSection =
    document.getElementById("profileSection");

const closeProfileButton =
    document.getElementById("closeProfileButton");

const profileCreateBox =
    document.getElementById("profileCreateBox");

const profileLoginBox =
    document.getElementById("profileLoginBox");

const profileDisplay =
    document.getElementById("profileDisplay");

const profileTitle =
    document.getElementById("profileTitle");

const profileSubtitle =
    document.getElementById("profileSubtitle");

const saveProfileButton =
    document.getElementById("saveProfileButton");

const loginProfileButton =
    document.getElementById("loginProfileButton");

const loginPhone =
    document.getElementById("loginPhone");

const loginMessage =
    document.getElementById("loginMessage");


/* ---------------------------------------------------------
   LOGGED-IN ACCOUNT (login.html se aaya hua)
   --------------------------------------------------------- */

function getCurrentAccount() {

    try {

        const raw = localStorage.getItem("cropSetuCurrentUser");

        if (!raw) {
            return null;
        }

        const data = JSON.parse(raw);

        if (data && data.email) {
            return data;
        }

        return null;

    } catch (error) {
        return null;
    }
}


/* ---------------------------------------------------------
   HAR ACCOUNT KA APNA PROFILE
   Pehle sirf ek "farmerProfile" tha, isliye do log same
   browser par login karte to dono ko ek hi profile dikhti.
   Ab key ke saath email jud jaati hai -> alag-alag profile.
   --------------------------------------------------------- */

function getProfileKey() {

    const account = getCurrentAccount();

    if (!account) {
        return "farmerProfile";
    }

    return "farmerProfile__" + account.email;
}


/* ---------------------------------------------------------
   PROFILE PADHO
   --------------------------------------------------------- */

function getSavedProfile() {

    const key = getProfileKey();

    let raw = localStorage.getItem(key);


    /*
       Purane system ka data (jab login page nahi tha) ek baar
       current account ke naam kar do -- warna user ko lagega
       ki uska data gayab ho gaya.
    */
    if (!raw && key !== "farmerProfile") {

        const oldProfile = localStorage.getItem("farmerProfile");

        if (oldProfile) {

            localStorage.setItem(key, oldProfile);
            localStorage.removeItem("farmerProfile");

            raw = oldProfile;
        }
    }


    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}


/* ---------------------------------------------------------
   TEXT SAFE BANAO
   Naam mein < ya > ho to page toote nahi
   --------------------------------------------------------- */

function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}


/* ---------------------------------------------------------
   HEADER BUTTON PAR NAAM
   "Profile" ki jagah user ka pehla naam dikhta hai
   --------------------------------------------------------- */

function updateProfileButtonName() {

    const profile = getSavedProfile();
    const account = getCurrentAccount();

    let fullName = "";

    if (profile && profile.name) {
        fullName = profile.name;
    } else if (account && account.name) {
        fullName = account.name;
    }

    if (!fullName) {
        profileButton.textContent = "👤 Profile";
        return;
    }

    // Sirf pehla naam -- header chhota rehna chahiye
    profileButton.textContent = "👤 " + fullName.split(" ")[0];
}


/* ---------------------------------------------------------
   OPEN PROFILE BUTTON
   Ab yahan DOOSRA login nahi hai. User login.html se
   already logged in hai, to seedha uski profile dikhao.
   --------------------------------------------------------- */

profileButton.addEventListener("click", function () {

    profileSection.style.display = "block";

    // Slide-in animation chalane ke liye
    setTimeout(function () {
        profileSection.classList.add("drawer-open");
    }, 10);

    const profile = getSavedProfile();

    if (!profile) {

        // Pehli baar -- form dikhao, naam pehle se bhara hua
        showCreateProfile(null);

        return;
    }

    showLoggedInProfile(profile);

});


/* ---------------------------------------------------------
   PROFILE FORM
   existing = null  -> nayi profile banani hai
   existing = obj   -> purani profile edit karni hai
   --------------------------------------------------------- */

function showCreateProfile(existing) {

    const account = getCurrentAccount();
    const isEditing = !!existing;


    profileTitle.textContent =
        isEditing ? "Edit Profile" : "Complete Your Profile";

    profileSubtitle.textContent =
        account ? account.email : "Apni details bharein";


    profileCreateBox.style.display = "block";
    profileLoginBox.style.display = "none";
    profileDisplay.style.display = "none";


    /*
       Naam login account se pehle se bhar do.
       Normal app dobara naam nahi poochhti.
    */
    document.getElementById("farmerName").value =
        isEditing ? existing.name : (account ? account.name : "");

    document.getElementById("farmerPhone").value =
        isEditing ? existing.phone : "";

    document.getElementById("farmerVillage").value =
        isEditing ? existing.village : "";

    document.getElementById("farmerCrops").value =
        isEditing ? existing.crops : "";


    saveProfileButton.textContent =
        isEditing ? "💾 Save Changes" : "💾 Create Profile";
}


/* ---------------------------------------------------------
   SAVE PROFILE (nayi ya edit ki hui)
   --------------------------------------------------------- */

saveProfileButton.addEventListener("click", function () {

    const name =
        document.getElementById("farmerName").value.trim();

    const phone =
        document.getElementById("farmerPhone").value.trim();

    const village =
        document.getElementById("farmerVillage").value.trim();

    const crops =
        document.getElementById("farmerCrops").value.trim();


    if (!name || !phone || !village || !crops) {

        alert("Please saari details fill karo.");

        return;
    }


    // Mobile number 10 digit ka hona chahiye
    if (!/^[0-9]{10}$/.test(phone)) {

        alert("10 digit ka mobile number daalo.");

        return;
    }


    const account = getCurrentAccount();

    const profile = {

        name: name,
        phone: phone,
        village: village,
        crops: crops,
        email: account ? account.email : ""

    };


    localStorage.setItem(
        getProfileKey(),
        JSON.stringify(profile)
    );


        // Signup ka galat naam bhi theek kar do
    updateAccountName(name);


    // Header ka naam turant update
    updateProfileButtonName();


    alert("✅ Profile save ho gaya");

    showLoggedInProfile(profile);

});

function updateAccountName(newName) {

    const account = getCurrentAccount();

    if (!account) {
        return;
    }


    // 1) Chalu session ka naam
    localStorage.setItem(
        "cropSetuCurrentUser",
        JSON.stringify({
            name: newName,
            email: account.email
        })
    );


    // 2) Account list ka naam (login.html isi se naam uthata hai)
    try {

        const users =
            JSON.parse(localStorage.getItem("cropSetuUsers"));

        if (!Array.isArray(users)) {
            return;
        }

        const found =
            users.find(function (user) {
                return user.email === account.email;
            });

        if (found) {

            found.name = newName;

            localStorage.setItem(
                "cropSetuUsers",
                JSON.stringify(users)
            );
        }

    } catch (error) {

        // User data kharab ho to naam badalna chhod do --
        // password waghera ko chhedna theek nahi.
        console.warn("Account ka naam update nahi hua");
    }
}


/* ---------------------------------------------------------
   PROFILE DIKHAO
   --------------------------------------------------------- */

function showLoggedInProfile(profile) {

    profileCreateBox.style.display = "none";
    profileLoginBox.style.display = "none";
    profileDisplay.style.display = "block";


    profileTitle.textContent = "My Profile";
    profileSubtitle.textContent = "Your CropSetu account";


    const account = getCurrentAccount();

    const email =
        profile.email || (account ? account.email : "-");

    // Avatar mein naam ka pehla letter
    const initial =
        profile.name ? profile.name.charAt(0).toUpperCase() : "?";


    /*
       Uska apna data -- kitni fasal listed hai, kitni
       land register hai, kitne order kiye. Ye teen
       variable pehle hi file mein bane hue hain.
    */
    const cropCount =
        typeof listedCropData !== "undefined" ? listedCropData.length : 0;

    const landCount =
        typeof savedLandData !== "undefined" ? savedLandData.length : 0;

    const orderCount =
        typeof orders !== "undefined" ? orders.length : 0;


    profileDisplay.innerHTML = `

        <div class="profile-info-card">

            <div class="profile-main-name">

                <div class="profile-main-avatar">
                    ${escapeHtml(initial)}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(profile.name)}
                    </h3>

                    <small>
                        CropSetu Farmer
                    </small>

                </div>

            </div>


            <div class="profile-stats">

                <div class="profile-stat">
                    <strong>${cropCount}</strong>
                    <span>Crops Listed</span>
                </div>

                <div class="profile-stat">
                    <strong>${landCount}</strong>
                    <span>Lands</span>
                </div>

                <div class="profile-stat">
                    <strong>${orderCount}</strong>
                    <span>Orders</span>
                </div>

            </div>


            <div class="profile-detail-row">

                <div class="profile-detail-icon">
                    ✉️
                </div>

                <strong>
                    ${escapeHtml(email)}
                </strong>

            </div>


            <div class="profile-detail-row">

                <div class="profile-detail-icon">
                    📱
                </div>

                <strong>
                    ${escapeHtml(profile.phone)}
                </strong>

            </div>


            <div class="profile-detail-row">

                <div class="profile-detail-icon">
                    📍
                </div>

                <strong>
                    ${escapeHtml(profile.village)}
                </strong>

            </div>


            <div class="profile-detail-row">

                <div class="profile-detail-icon">
                    🌾
                </div>

                <strong>
                    Crops: ${escapeHtml(profile.crops)}
                </strong>

            </div>

        </div>


        <button
            id="editProfileButton"
            class="profile-primary-button">

            ✏️ Edit Profile

        </button>


        <button
            id="changePasswordButton"
            class="profile-secondary-button">

            🔑 Change Password

        </button>


        <button
            id="logoutProfileButton"


            class="profile-logout-button">

            🚪 Logout

        </button>

    `;


    /* ----- Edit ----- */

    const editButton =
        document.getElementById("editProfileButton");

    if (editButton) {

        editButton.addEventListener("click", function () {

            showCreateProfile(profile);

        });
    }


    /* ----- Password badlo ----- */

    const passwordButton =
        document.getElementById("changePasswordButton");

    if (passwordButton) {

        passwordButton.addEventListener("click", function () {

            showChangePassword(profile);

        });
    }


    /* ----- Logout (asli logout, login page par wapas) ----- */

    const drawerLogoutButton =
        document.getElementById("logoutProfileButton");

    if (drawerLogoutButton) {

        drawerLogoutButton.addEventListener("click", function () {

            showConfirm({

                icon: "🚪",
                message: "Are you sure you want to logout?",
                okText: "logout",
                danger: true

            }, function () {

                /*
                   Profile aur account DELETE nahi karte.
                   Sirf login session band karte hain, taaki
                   wapas login karne par saara data mil jaaye.
                */
                localStorage.removeItem("cropSetuLoggedIn");
                localStorage.removeItem("cropSetuCurrentUser");

                window.location.replace("login.html");

            });

        });
    }

}



function showChangePassword(profile) {

    const account = getCurrentAccount();

    if (!account) {
        alert("Pehle login karo.");
        return;
    }


    profileTitle.textContent = "Change Password";
    profileSubtitle.textContent = "Apna naya password set karo";


    profileDisplay.innerHTML = `

        <div class="profile-input-group">

            <label>Purana Password</label>

            <input
                type="password"
                id="oldPasswordInput"
                placeholder="Abhi wala password">

        </div>


        <div class="profile-input-group">

            <label>Naya Password</label>

            <input
                type="password"
                id="newPasswordInput"
                placeholder="Kam se kam 8 letter">

        </div>


        <div class="profile-input-group">

            <label>Naya Password Dobara</label>

            <input
                type="password"
                id="confirmPasswordInput"
                placeholder="Wahi password phir se">

        </div>


        <button
            id="savePasswordButton"
            class="profile-primary-button">

            🔑 Update Password

        </button>


        <button
            id="cancelPasswordButton"
            class="profile-secondary-button">

            ← Wapas

        </button>

    `;


    /* ----- Wapas ----- */

    const cancelButton =
        document.getElementById("cancelPasswordButton");

    if (cancelButton) {

        cancelButton.addEventListener("click", function () {

            showLoggedInProfile(profile);

        });
    }


    /* ----- Password save ----- */

    const savePasswordButton =
        document.getElementById("savePasswordButton");

    if (!savePasswordButton) {
        return;
    }

    savePasswordButton.addEventListener("click", function () {

        const oldPassword =
            document.getElementById("oldPasswordInput").value;

        const newPassword =
            document.getElementById("newPasswordInput").value;

        const confirmPassword =
            document.getElementById("confirmPasswordInput").value;


        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("Teeno box bharo.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Naya password kam se kam 8 letter ka rakho.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Dono naye password same nahi hain.");
            return;
        }

        let users;

        try {
            users = JSON.parse(localStorage.getItem("cropSetuUsers"));
        } catch (error) {
            users = null;
        }

        if (!Array.isArray(users)) {
            alert("Account data nahi mila.");
            return;
        }


        const found =
            users.find(function (user) {
                return user.email === account.email;
            });

        if (!found) {
            alert("Account data nahi mila.");
            return;
        }

        if (found.password !== oldPassword) {
            alert("Purana password galat hai.");
            return;
        }

        if (newPassword === oldPassword) {
            alert("Naya password purane se alag rakho.");
            return;
        }


        found.password = newPassword;

        localStorage.setItem(
            "cropSetuUsers",
            JSON.stringify(users)
        );


        alert("✅ Password badal gaya");

        showLoggedInProfile(profile);

    });
}

/* ---------------------------------------------------------
   PAGE LOAD PAR
   --------------------------------------------------------- */

updateProfileButtonName();


// ================= NOTIFICATIONS =================

const notificationButton =
    document.getElementById("notificationButton");

const notificationSection =
    document.getElementById("notificationSection");

const notificationContainer =
    document.getElementById("notificationContainer");

const clearNotificationsButton =
    document.getElementById("clearNotificationsButton");


let notifications = loadStored("notifications", [
        {
            icon: "💰",
            title: "Market Price Update",
            message: "Wheat ka market price ₹2,550/Quintal hai."
        },
        {
            icon: "🤝",
            title: "Buyer Available",
            message: "Patel Traders Wheat aur Rice buy kar raha hai."
        },
        {
            icon: "🌾",
            title: "CropSetu Tip",
            message: "Best market choose karne se pehle transport cost check karein."
        }
    ]);

// Show notifications
function showNotifications() {

    notificationContainer.innerHTML = "";

    if (notifications.length === 0) {

        notificationContainer.innerHTML = `
            <div class="shop-card">
                <p>🔔 No new notifications</p>
            </div>
        `;

        return;
    }


    notifications.forEach(function(notification) {

        notificationContainer.innerHTML += `

            <div class="shop-card">

                <h3>
                    ${notification.icon}
                    ${notification.title}
                </h3>

                <p>
                    ${notification.message}
                </p>

            </div>

        `;

    });

}


// Open Notifications
notificationButton.addEventListener("click", function() {

    notificationSection.style.display = "block";

    setTimeout(function () {
        notificationSection.classList.add("drawer-open");
    }, 10);

    showNotifications();

});

// Clear Notifications
clearNotificationsButton.addEventListener("click", function() {

    if (notifications.length === 0) {
        return;
    }

    showConfirm({

        icon: "🔔",
        message: "Saari notifications clear karni hain?",
        okText: "clear notifications",
        danger: true

    }, function () {

        notifications = [];

        localStorage.setItem(
            "notifications",
            JSON.stringify(notifications)
        );

        showNotifications();

    });

});


// Save default notifications
if (!localStorage.getItem("notifications")) {

    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );

}
// ================= DRAWER CLOSE =================


const closeNotificationButton =
    document.getElementById("closeNotificationButton");


closeProfileButton.addEventListener("click", function () {

    profileSection.classList.remove("drawer-open");
    profileSection.style.display = "none";
});


closeNotificationButton.addEventListener("click", function () {

    notificationSection.classList.remove("drawer-open");
    notificationSection.style.display = "none";
});
// ================= PRICE TRACKING =================

const priceTrackingSection =
    document.getElementById("priceTrackingSection");

const trackingCropName =
    document.getElementById("trackingCropName");

const trackingCurrentPrice =
    document.getElementById("trackingCurrentPrice");

const trackingHighestPrice =
    document.getElementById("trackingHighestPrice");

const trackingLowestPrice =
    document.getElementById("trackingLowestPrice");

const priceTrend =
    document.getElementById("priceTrend");
    
const priceChart =
    document.getElementById("priceChart");

const priceChartLine =
    document.getElementById("priceChartLine");

const priceChartPoints =
    document.getElementById("priceChartPoints");


// Sample price history
const priceHistory = {

    potato: {
        name: "🥔 Potato",
        prices: [1900, 2050, 2000, 2200, 2150, 2350, 2200]
    },

    wheat: {
        name: "🌾 Wheat",
        prices: [2250, 2300, 2400, 2350, 2450, 2500, 2550]
    },

    tomato: {
        name: "🍅 Tomato",
        prices: [1800, 1950, 1900, 1850, 2000, 1950, 1800]
    }

};


// ================= SIMPLE LINE GRAPH =================

function showPriceTracking(crop) {

    const data = priceHistory[crop];

    if (!data) return;

const prices = [...data.prices];

const currentMarketPrice = Math.round(
    mandiPrices[crop].reduce(function(total, item) {
        return total + item.price;
    }, 0) / mandiPrices[crop].length
);

prices[prices.length - 1] = currentMarketPrice;

    const current = prices[prices.length - 1];
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);

    trackingCropName.textContent = data.name;
    trackingCurrentPrice.textContent = "₹" + current;
    trackingHighestPrice.textContent = "₹" + highest;
    trackingLowestPrice.textContent = "₹" + lowest;

    if (current > prices[0]) {
        priceTrend.textContent = "📈 Bhaav badh raha hai";
    } else if (current < prices[0]) {
        priceTrend.textContent = "📉 Bhaav kam ho raha hai";
    } else {
        priceTrend.textContent = "🟡 Bhaav same hai";
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map(function(price, index) {

        const x = 30 + (index / (prices.length - 1)) * 640;

        const y =
            225 - ((price - min) / range) * 200;

        return x + "," + y;
    });

    priceChartLine.setAttribute(
        "points",
        points.join(" ")
    );

    priceChartPoints.innerHTML = "";

    prices.forEach(function(price, index) {

        const point = points[index].split(",");

        const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        circle.setAttribute("cx", point[0]);
        circle.setAttribute("cy", point[1]);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#247a45");

        priceChartPoints.appendChild(circle);
    });

    priceTrackingSection.style.display = "block";
}
// ================= BUY SEEDS =================

const seedsButton =
    document.getElementById("seedsButton");

const seedsSection =
    document.getElementById("seedsSection");

const seedsContainer =
    document.getElementById("seedsContainer");

const cartContainer =
    document.getElementById("cartContainer");

const cartTotal =
    document.getElementById("cartTotal");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const ordersContainer =
    document.getElementById("ordersContainer");

    
const orderHistoryButton =
    document.getElementById("orderHistoryButton");

const orderHistoryBox =
    document.getElementById("orderHistoryBox");

const orderHistoryContainer =
    document.getElementById("orderHistoryContainer");

const orderHistoryCount =
    document.getElementById("orderHistoryCount");

const orderHistoryArrow =
    document.getElementById("orderHistoryArrow");

const clearHistoryButton =
    document.getElementById("clearHistoryButton");


// History khuli hai ya band
let historyOpen = false;


const seeds = [
    {
        name: "Wheat Seeds",
        price: 850,
        unit: "10 kg",
        icon: "🌾"
    },
    {
        name: "Rice Seeds",
        price: 950,
        unit: "10 kg",
        icon: "🌾"
    },
    {
        name: "Potato Seeds",
        price: 700,
        unit: "10 kg",
        icon: "🥔"
    },
    {
        name: "Organic Fertilizer",
        price: 500,
        unit: "25 kg",
        icon: "🌱"
    }
];


let cart = loadStored("seedCart", []);

let orders = loadStored("seedOrders", []);
    // localStorage.removeItem("seedOrders");

    const orderStages = [
    "Order Placed",
    "Packed",
    "Out for Delivery",
    "Delivered"
];


function renderSeeds() {

    seedsContainer.innerHTML = "";

    seeds.forEach(function(seed, index) {

        seedsContainer.innerHTML += `

            <div class="shop-card">

                <h3>
                    ${seed.icon}
                    ${seed.name}
                </h3>

                <p>
                    ₹${seed.price} / ${seed.unit}
                </p>

                <input
                    type="number"
                    id="seedQty${index}"
                    value="1"
                    min="1"
                    style="width:60px; margin-bottom:8px;">

                <button onclick="addSeedToCart(${index})">
                    🛒 Add to Cart
                </button>

            </div>

        `;

    });

}


function addSeedToCart(index) {

    const seed = seeds[index];

    const qtyInput = document.getElementById("seedQty" + index);
    const qty = Math.max(1, parseInt(qtyInput.value) || 1);

    cart.push({
        name: seed.name,
        price: seed.price,
        unit: seed.unit,
        qty: qty
    });

    localStorage.setItem(
        "seedCart",
        JSON.stringify(cart)
    );

    renderCart();

}


function removeSeedFromCart(index) {

    cart.splice(index, 1);

    localStorage.setItem(
        "seedCart",
        JSON.stringify(cart)
    );

    renderCart();

}


function renderCart() {

    cartContainer.innerHTML = "";

    if (cart.length === 0) {

        cartContainer.innerHTML =
            "<p>🛒 Cart empty hai.</p>";

        cartTotal.textContent = "";

        return;
    }


    let total = 0;


    cart.forEach(function(item, index) {

        const itemTotal = item.price * item.qty;
        total += itemTotal;

        cartContainer.innerHTML += `

            <div class="shop-card">

                <strong>
                    ${item.name}
                </strong>

                <p>
                    ${item.qty} x ₹${item.price} / ${item.unit} = ₹${itemTotal}
                </p>

                <button
                    onclick="removeSeedFromCart(${index})">

                    🗑️ Remove

                </button>

            </div>

        `;

    });


    cartTotal.textContent =
        "Total: ₹" + total.toLocaleString("en-IN");

}

/* ---------------------------------------------------------
   Aaj ki date — "25 Aug 2026" jaisi
   --------------------------------------------------------- */

function getTodayText() {

    return new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/* ---------------------------------------------------------
   Order number kabhi repeat na ho
   --------------------------------------------------------- */

function getNextOrderNo() {

    const last =
        parseInt(localStorage.getItem("lastOrderNo")) || 0;

    const next = last + 1;

    localStorage.setItem("lastOrderNo", next);

    return next;
}


/* ---------------------------------------------------------
   Ek order ka card banao
   isHistory = true  →  delivered wala card
   --------------------------------------------------------- */

function buildOrderCard(order, realIndex, isHistory) {

    const currentStage = orderStages[order.stage];

    const orderNo = order.orderNo || (realIndex + 1);


    const itemsText =
        order.items.map(function (item) {
            return item.name + " x " + item.qty;
        }).join(", ");


    // Tracking ki chaar step
    let steps = "";

    orderStages.forEach(function (stage, i) {

        steps += `
            <div class="order-track-step ${i <= order.stage ? "done" : ""}">

                <div class="order-track-dot">
                    ${i <= order.stage ? "✓" : i + 1}
                </div>

                <span>${stage}</span>

            </div>
        `;

    });


    // Neeche kya dikhana hai
    let footer;

    if (isHistory) {

        footer = `
            <div class="order-history-meta">

                <span>
                    🗓️ Ordered: ${order.date || "—"}
                </span>

                <span>
                    ✅ Delivered: ${order.deliveredAt || "—"}
                </span>

            </div>
        `;

    } else {

        footer = `
            <button
                class="track-order-button"
                onclick="advanceOrder(${realIndex})">

                📍 Track Order

            </button>
        `;

    }


    return `
        <div class="shop-card order-card ${isHistory ? "order-card-done" : ""}">

            <div class="order-header">

                <div>

                    <h3>
                        📦 Order #${orderNo}
                    </h3>

                    <p>
                        ${itemsText}
                    </p>

                </div>

                <strong class="order-status">
                    ${currentStage}
                </strong>

            </div>


            <div class="order-tracking">
                ${steps}
            </div>


            ${
                order.total
                ? `<p class="order-total-line">
                       Total: ₹${order.total.toLocaleString("en-IN")}
                   </p>`
                : ""
            }


            ${footer}

        </div>
    `;
}


/* ---------------------------------------------------------
   Active orders aur history — dono render karo
   --------------------------------------------------------- */

function renderOrders() {

    ordersContainer.innerHTML = "";
    orderHistoryContainer.innerHTML = "";


    /*
       Orders ko do hisso mein baanto.
       realIndex zaroori hai — advanceOrder isi index se
       kaam karta hai, isliye filter ke baad bhi asli index chahiye
    */

    const activeOrders = [];
    const deliveredOrders = [];


    orders.forEach(function (order, index) {

        const entry = {
            order: order,
            realIndex: index
        };

        if (order.stage >= orderStages.length - 1) {
            deliveredOrders.push(entry);
        } else {
            activeOrders.push(entry);
        }

    });


    // ---------- ACTIVE ORDERS ----------

    if (activeOrders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="shop-card">
                <p>📦 No active orders.</p>
            </div>
        `;

    } else {

        activeOrders.forEach(function (entry) {

            ordersContainer.innerHTML +=
                buildOrderCard(entry.order, entry.realIndex, false);

        });

    }


    // ---------- ORDER HISTORY ----------

    orderHistoryCount.textContent = deliveredOrders.length;


    if (deliveredOrders.length === 0) {

        orderHistoryContainer.innerHTML = `
            <div class="shop-card">
                <p>📜 Abhi koi delivered order nahi hai.</p>
            </div>
        `;

    } else {

        // Naya order sabse upar dikhe
        deliveredOrders.reverse().forEach(function (entry) {

            orderHistoryContainer.innerHTML +=
                buildOrderCard(entry.order, entry.realIndex, true);

        });

    }

}


/* ---------------------------------------------------------
   History kholna / band karna
   --------------------------------------------------------- */

function openOrderHistory() {

    historyOpen = true;

    orderHistoryBox.style.display = "block";
    orderHistoryArrow.textContent = "▴";

    orderHistoryButton.classList.add("history-open");
}


orderHistoryButton.addEventListener("click", function () {

    if (historyOpen) {

        historyOpen = false;

        orderHistoryBox.style.display = "none";
        orderHistoryArrow.textContent = "▾";

        orderHistoryButton.classList.remove("history-open");

    } else {

        openOrderHistory();

    }

});


/* ---------------------------------------------------------
   History clear — active orders ko chhodkar
   --------------------------------------------------------- */

clearHistoryButton.addEventListener("click", function () {

    const deliveredCount =
        orders.filter(function (order) {
            return order.stage >= orderStages.length - 1;
        }).length;


    if (deliveredCount === 0) {
        alert("History already khaali hai.");
        return;
    }


    showConfirm({

        icon: "📜",
        message: "Remove " + deliveredCount + " delivered order from history?",
        okText: "clear history",
        danger: true

    }, function () {

        // Sirf delivered wale hatao, chalu orders safe rahein
        orders = orders.filter(function (order) {
            return order.stage < orderStages.length - 1;
        });

        localStorage.setItem(
            "seedOrders",
            JSON.stringify(orders)
        );

        renderOrders();

        alert("🗑️ clear order history");

    });

});


/* ================= TRACK ORDER ================= */

function advanceOrder(index) {

    if (!orders[index]) {
        return;
    }


    orders[index].stage++;


    /*
       Delivered hone par
       active order list se remove
    */
       if (
        orders[index].stage >=
        orderStages.length - 1
    ) {

        orders[index].stage = orderStages.length - 1;

        // Delivered ki date save karo
        orders[index].deliveredAt = getTodayText();

        alert(
            "✅ Order delivered! Order History mein dekh sakte hain."
        );

        // History khud khol do, warna order gayab lagega
        openOrderHistory();

    }


    localStorage.setItem(
        "seedOrders",
        JSON.stringify(orders)
    );


    renderOrders();

}



seedsButton.addEventListener("click", function() {

    hideSections();

    seedsSection.style.display = "block";

    renderSeeds();
    renderCart();
    renderOrders();

});


placeOrderButton.addEventListener("click", function() {

    if (cart.length === 0) {

        alert("Add any item in your cart.");

        return;
    }


    const total =
        cart.reduce(function(sum, item) {
            return sum + (item.price * item.qty);
        }, 0);


    const order = {

    items: cart.map(function(item) {

        return {
            name: item.name,
            qty: item.qty,
            price: item.price
        };

    }),

    total: total,

    stage: 0,

    orderNo: getNextOrderNo(),

    date: getTodayText()

};


    orders.push(order);

    localStorage.setItem(
        "seedOrders",
        JSON.stringify(orders)
    );


    cart = [];

    localStorage.setItem(
        "seedCart",
        JSON.stringify(cart)
    );


    renderCart();
    renderOrders();

    alert("✅ Order placed successfully!");

});
/* =========================================================
   UNIT CONVERTER
   ========================================================= */

const converterButton = document.getElementById("converterButton");
const converterOverlay = document.getElementById("converterOverlay");
const closeConverterButton = document.getElementById("closeConverterButton");

const converterValue = document.getElementById("converterValue");
const converterFrom = document.getElementById("converterFrom");
const converterTo = document.getElementById("converterTo");
const converterResult = document.getElementById("converterResult");
const converterSwapButton = document.getElementById("converterSwapButton");


// Har unit kitne kilogram ka hai
const weightUnits = [
    { key: "gram",    name: "Gram",     label: "Gram (g)",        kg: 0.001 },
    { key: "kg",      name: "Kg",       label: "Kilogram (kg)",   kg: 1 },
    { key: "quintal", name: "Quintal",  label: "Quintal",         kg: 100 },
    { key: "tonne",   name: "Tonne",    label: "Tonne (1000 kg)", kg: 1000 },
    { key: "maund",   name: "Maund",    label: "Maund / Mann",    kg: 40 },
    { key: "bora",    name: "Bora",     label: "Bora / Bag",      kg: 50 },
    { key: "pound",   name: "Pound",    label: "Pound (lb)",      kg: 0.453592 }
];


function fillConverterOptions() {

    let options = "";

    weightUnits.forEach(function (unit) {
        options += `<option value="${unit.key}">${unit.label}</option>`;
    });

    converterFrom.innerHTML = options;
    converterTo.innerHTML = options;

    // Default: Quintal se Kg
    converterFrom.value = "quintal";
    converterTo.value = "kg";
}


function getUnit(key) {

    return weightUnits.find(function (unit) {
        return unit.key === key;
    });
}


function runConversion() {

    const value = parseFloat(converterValue.value);

    const from = getUnit(converterFrom.value);
    const to = getUnit(converterTo.value);

    if (isNaN(value) || value < 0) {
        converterResult.textContent = "Sahi value daalein";
        return;
    }

    // Pehle kg mein badlo, phir target unit mein
    const result = (value * from.kg) / to.kg;

    let shown;

    if (result >= 1) {
        shown = result.toLocaleString("en-IN", {
            maximumFractionDigits: 3
        });
    } else {
        shown = Number(result.toPrecision(3)).toString();
    }

    converterResult.textContent =
        value.toLocaleString("en-IN") + " " + from.name +
        "  =  " + shown + " " + to.name;
}


function closeConverter() {

    converterOverlay.classList.remove("converter-show");

    setTimeout(function () {
        converterOverlay.style.display = "none";
    }, 200);
}


converterButton.addEventListener("click", function () {

    converterOverlay.style.display = "flex";

    setTimeout(function () {
        converterOverlay.classList.add("converter-show");
    }, 10);

    runConversion();
});


closeConverterButton.addEventListener("click", closeConverter);


// Background par click karne se band
converterOverlay.addEventListener("click", function (event) {

    if (event.target === converterOverlay) {
        closeConverter();
    }
});


// Kuch bhi badle to turant result update
converterValue.addEventListener("input", runConversion);
converterFrom.addEventListener("change", runConversion);
converterTo.addEventListener("change", runConversion);


// Ulta-pulta karne wala button
converterSwapButton.addEventListener("click", function () {

    const temp = converterFrom.value;

    converterFrom.value = converterTo.value;
    converterTo.value = temp;

    runConversion();
});


fillConverterOptions();
runConversion();

/* =========================================================
   LOGOUT
   ========================================================= */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        showConfirm({

            icon: "🚪",
            message: "Are you sure you want to logout?",
            okText: "Yes, logout",
            danger: true

        }, function () {

            /*
               Sirf login wali key hatate hain.
               cropSetuUsers (saare account) aur farm ka data
               (profile, lands, orders) chhedte nahi -- warna
               wapas login karne par sab khaali mil jaayega.
            */
            localStorage.removeItem("cropSetuLoggedIn");
            localStorage.removeItem("cropSetuCurrentUser");

            window.location.replace("login.html");

        });

    });
}


/* =========================================================
   MOBILE SIDEBAR TOGGLE
   ========================================================= */

const mobileMenuButton = document.getElementById("mobileMenuButton");
const sidebar = document.querySelector(".sidebar");

if (mobileMenuButton && sidebar) {

    mobileMenuButton.addEventListener("click", function () {
        sidebar.classList.toggle("mobile-sidebar-open");
    });

}