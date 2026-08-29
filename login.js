// ==========================================
// CropSetu Authentication
// ==========================================
//
// NOTE (padh lena): password localStorage mein plain text
// mein save hota hai. Ye demo/college project ke liye theek
// hai, par asli website mein kaam nahi karega -- koi bhi
// F12 kholkar password padh sakta hai. Asli security ke
// liye server aur password hashing chahiye.


/* ---------------------------------------------------------
   Storage keys — ek jagah likh diye taaki typo na ho
   --------------------------------------------------------- */

const USERS_KEY    = "cropSetuUsers";
const LOGGED_KEY   = "cropSetuLoggedIn";
const CURRENT_KEY  = "cropSetuCurrentUser";
const REMEMBER_KEY = "cropSetuRememberEmail";


/* ---------------------------------------------------------
   localStorage se safely padho.
   Agar data kharab ho to app marni nahi chahiye.
   --------------------------------------------------------- */

function loadUsers() {

    try {
        const raw = localStorage.getItem(USERS_KEY);

        if (!raw) { return []; }

        const data = JSON.parse(raw);

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.warn("Kharab user data mila, reset kar diya");
        localStorage.removeItem(USERS_KEY);

        return [];
    }
}


function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


/* ---------------------------------------------------------
   SCREENS
   --------------------------------------------------------- */

const loginScreen  = document.getElementById("loginScreen");
const signupScreen = document.getElementById("signupScreen");
const forgotScreen = document.getElementById("forgotScreen");


/*
   Ek screen dikhao, baaki chhupa do.
   Teeno ko hamesha ek hi function se badalte hain, isse
   do screen ek saath khulne ki galti ho hi nahi sakti.
*/
function showScreen(screenToShow) {

    [loginScreen, signupScreen, forgotScreen]
        .forEach(function (screen) {

            if (!screen) { return; }

            if (screen === screenToShow) {
                screen.classList.remove("hidden");
            } else {
                screen.classList.add("hidden");
            }

        });

    window.scrollTo(0, 0);
}


/* ---------------------------------------------------------
   Message dikhane ka ek hi tareeka
   --------------------------------------------------------- */

function showMessage(box, text, isSuccess) {

    if (!box) { return; }

    box.textContent = text;

    if (isSuccess) {
        box.classList.add("success");
    } else {
        box.classList.remove("success");
    }
}


/* ---------------------------------------------------------
   Email sahi shakal ka hai ya nahi
   --------------------------------------------------------- */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

// Pehle se logged in hai to seedha dashboard bhej do
if (localStorage.getItem(LOGGED_KEY) === "true") {
    window.location.replace("index.html");
}


const loginEmail    = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError    = document.getElementById("loginError");
const rememberMe    = document.getElementById("rememberMe");


// "Remember me" wala email wapas bhar do
const rememberedEmail = localStorage.getItem(REMEMBER_KEY);

if (rememberedEmail && loginEmail) {
    loginEmail.value = rememberedEmail;

    if (rememberMe) {
        rememberMe.checked = true;
    }
}


/* =========================================================
   SCREEN SWITCHING
   Har button ko `if` se guard kiya hai. Agar kabhi HTML se
   koi button hat jaaye to script sirf wo feature chhodegi,
   poori marégi nahi.
   ========================================================= */

const showSignupButton   = document.getElementById("showSignup");
const backToLoginButton  = document.getElementById("backToLogin");
const forgotButton       = document.getElementById("forgotPassword");
const backFromForgot     = document.getElementById("backFromForgot");


if (showSignupButton) {
    showSignupButton.addEventListener("click", function () {
        showScreen(signupScreen);
    });
}

if (backToLoginButton) {
    backToLoginButton.addEventListener("click", function () {
        showScreen(loginScreen);
    });
}

if (forgotButton) {
    forgotButton.addEventListener("click", function () {
        showScreen(forgotScreen);
    });
}

if (backFromForgot) {
    backFromForgot.addEventListener("click", function () {
        showScreen(loginScreen);
    });
}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

const togglePassword = document.getElementById("togglePassword");

if (togglePassword && loginPassword) {

    togglePassword.addEventListener("click", function () {

        if (loginPassword.type === "password") {
            loginPassword.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            loginPassword.type = "password";
            togglePassword.textContent = "👁";
        }

    });
}


/* =========================================================
   CREATE ACCOUNT
   ========================================================= */

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const errorBox = document.getElementById("signupError");

        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail")
                .value.trim().toLowerCase();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("signupConfirmPassword").value;


        showMessage(errorBox, "", false);


        if (name.length < 2) {
            showMessage(errorBox, "Please enter your full name.", false);
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(errorBox, "Please enter a valid email address.", false);
            return;
        }

        if (password.length < 8) {
            showMessage(errorBox, "Password must contain at least 8 characters.", false);
            return;
        }

        if (password !== confirmPassword) {
            showMessage(errorBox, "Passwords do not match.", false);
            return;
        }


        /*
           Saare users ek array mein rakhte hain.
           Pehle sirf ek user save hota tha, to doosra account
           banane par pehla chupchaap mit jaata tha.
        */
        const users = loadUsers();

        const alreadyExists =
            users.some(function (user) {
                return user.email === email;
            });

        if (alreadyExists) {
            showMessage(
                errorBox,
                "An account with this email already exists.",
                false
            );
            return;
        }


        users.push({
            name: name,
            email: email,
            password: password,
            joinedAt: new Date().toISOString()
        });

        saveUsers(users);


        showMessage(errorBox, "✓ Account created successfully!", true);

        signupForm.reset();

        setTimeout(function () {

            showScreen(loginScreen);
            showMessage(errorBox, "", false);

            // Naya email login form mein pehle se bhar do
            if (loginEmail) {
                loginEmail.value = email;
            }

            if (loginPassword) {
                loginPassword.focus();
            }

        }, 1200);

    });
}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email    = loginEmail.value.trim().toLowerCase();
        const password = loginPassword.value;

        showMessage(loginError, "", false);


        const users = loadUsers();

        if (users.length === 0) {
            showMessage(
                loginError,
                "No account found. Please create an account.",
                false
            );
            return;
        }


        const matchedUser =
            users.find(function (user) {
                return user.email === email
                    && user.password === password;
            });

        if (!matchedUser) {
            showMessage(loginError, "Invalid email or password.", false);
            return;
        }


        // Login safal
        localStorage.setItem(LOGGED_KEY, "true");

        localStorage.setItem(
            CURRENT_KEY,
            JSON.stringify({
                name: matchedUser.name,
                email: matchedUser.email
            })
        );


        // Remember me
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem(REMEMBER_KEY, matchedUser.email);
        } else {
            localStorage.removeItem(REMEMBER_KEY);
        }


        showMessage(
            loginError,
            "✓ Welcome, " + matchedUser.name + "! Loading dashboard...",
            true
        );

        // Button dobara click na ho
        const submitButton = loginForm.querySelector(".login-button");

        if (submitButton) {
            submitButton.disabled = true;
        }


        setTimeout(function () {
            window.location.href = "index.html";
        }, 900);

    });
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {

    forgotForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const errorBox = document.getElementById("forgotError");

        const email =
            document.getElementById("forgotEmail")
                .value.trim().toLowerCase();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmNewPassword").value;


        showMessage(errorBox, "", false);


        const users = loadUsers();

        const index =
            users.findIndex(function (user) {
                return user.email === email;
            });

        if (index === -1) {
            showMessage(
                errorBox,
                "No account found with this email.",
                false
            );
            return;
        }

        if (newPassword.length < 8) {
            showMessage(
                errorBox,
                "Password must contain at least 8 characters.",
                false
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage(errorBox, "Passwords do not match.", false);
            return;
        }


        users[index].password = newPassword;
        saveUsers(users);


        showMessage(errorBox, "✓ Password reset successfully!", true);

        forgotForm.reset();

        setTimeout(function () {

            showScreen(loginScreen);
            showMessage(errorBox, "", false);

            if (loginEmail) {
                loginEmail.value = email;
            }

            if (loginPassword) {
                loginPassword.focus();
            }

        }, 1200);

    });
}
