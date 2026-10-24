// =====================================
// NANHI DUNIYA - AUTHENTICATION SYSTEM
// =====================================

console.log("Nanhi Duniya Auth System Loaded! ❤️");

// Supabase connection
const SUPABASE_URL = "https://usajpvsavspzvmvmfhrz.supabase.co/";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eAeGyoAdja11-SYp6VJbCQ_LOJL9mVJ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// =====================================
// PARENT SIGNUP
// =====================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email =
            document.getElementById("parentEmail").value.trim();

        const password =
            document.getElementById("parentPassword").value;

            const parentName =
    document.getElementById("parentName").value.trim();

        const message = document.getElementById("authMessage");
        const button = document.getElementById("signupButton");

        message.textContent = "Creating your account... ❤️";
        button.disabled = true;

        try {
            const { data, error } =
                await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
    data: {
        parent_name: parentName
    },
    emailRedirectTo:
        window.location.origin + "/signup.html"
}
                });

            if (error) {
                console.error("Signup error:", error);
                message.textContent = error.message;
                return;
            }

            if (data.user && data.user.identities?.length === 0) {
                message.textContent =
                    "This email may already be registered. Try logging in.";
                return;
            }

            message.textContent = data.session
                ? "Account created successfully! Welcome to Nanhi Duniya! ❤️"
                : "Please check your email for a verification link. ❤️";

            console.log("Signup completed.");

        } catch (error) {
            console.error("Signup error:", error);
            message.textContent =
                "Something went wrong. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
}

// =====================================
// PARENT LOGIN
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        message.textContent = "Logging in... ❤️";
        button.disabled = true;

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                console.error("Login error:", error);
                message.textContent =
                    "Login failed. Please check your email and password.";
                return;
            }

            if (data.user) {
    message.textContent = "Checking account permissions... ❤️";

    const { data: isAdmin, error: roleError } =
        await supabaseClient.rpc("is_admin");

    if (roleError) {
        console.error("Admin check error:", roleError);
        message.textContent =
            "Could not verify account permissions. Please try again.";
        return;
    }

    if (isAdmin === true) {
    await supabaseClient.auth.signOut();

    message.textContent =
        "Please use the Admin Login page. 🔐";

    return;
} else {
    window.location.href = "dashboard.html";
}

}
        } catch (error) {
            console.error("Login error:", error);
            message.textContent =
                "Something went wrong. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
}

// =====================================
// PARENT DASHBOARD + LOGOUT
// =====================================

const logoutButton = document.getElementById("logoutButton");
const parentEmail = document.getElementById("parentEmail");

const isAdminPage = Boolean(document.getElementById("adminContent"));

async function protectDashboard() {
  if (isAdminPage) return;

  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
      window.location.replace("login.html");
      return;
    }

    if (parentEmail) {
      parentEmail.textContent = data.session.user.email;
    }
  } catch (error) {
    console.error("Dashboard session error:", error);
    window.location.replace("login.html");
  }
}

if (logoutButton) {
  if (!isAdminPage) {
    protectDashboard();
  }

  logoutButton.addEventListener("click", async function () {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";

    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;

      window.location.replace(
        isAdminPage ? "admin-login.html" : "login.html"
      );
    } catch (error) {
      console.error("Logout error:", error);
      logoutButton.disabled = false;
      logoutButton.textContent = "Logout 🚪";
      alert("Logout nahi ho paya. Please try again.");
    }
  });
}

// =====================================
// ADMIN DASHBOARD SECURITY
// =====================================

const adminContent = document.getElementById("adminContent");
const adminMessage = document.getElementById("adminMessage");

async function checkAdminAccess() {
    if (!adminContent || !adminMessage) {
        return;
    }

    adminContent.style.display = "none";

    async function loadEnquiryCount() {
const countElement = document.getElementById("enquiryCount");
const unreadElement = document.getElementById("unreadCount");

if (!countElement) return;

countElement.textContent = "Loading...";

if (unreadElement) {
    unreadElement.textContent = "Loading...";
}

try {
    // Total enquiries count
    const { count: totalCount, error: totalError } =
        await supabaseClient
            .from("admission_enquiries")
            .select("id", { count: "exact", head: true });

    if (totalError) throw totalError;

    countElement.textContent = totalCount ?? 0;

    // Unread enquiries count
    const { count: unreadTotal, error: unreadError } =
        await supabaseClient
            .from("admission_enquiries")
            .select("id", { count: "exact", head: true })
            .eq("is_read", false);

    if (unreadError) throw unreadError;

    if (unreadElement) {
        unreadElement.textContent = unreadTotal ?? 0;
    }

} catch (error) {
    console.error("Enquiry count error:", error);

    countElement.textContent = "Error";

    if (unreadElement) {
        unreadElement.textContent = "Error";
    }
}

}

async function loadAdmissionEnquiries() {
const tableBody = document.getElementById("enquiryTableBody");

if (!tableBody) return;

tableBody.innerHTML = `
    <tr>
        <td colspan="5" style="padding: 15px;">
            Loading enquiries... ❤️
        </td>
    </tr>
`;

const { data, error } = await supabaseClient
    .from("admission_enquiries")
    .select("id, parent_name, phone, child_name, child_age, message, created_at, is_read")
    .order("created_at", { ascending: false });

if (error) {
    console.error("Admission enquiries error:", error);
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="padding: 15px;">
                Could not load enquiries.
            </td>
        </tr>
    `;
    return;
}

if (!data || data.length === 0) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="padding: 15px;">
                No enquiries found.
            </td>
        </tr>
    `;
    return;
}

tableBody.replaceChildren();

data.forEach((enquiry) => {
    const row = document.createElement("tr");

    const values = [
    enquiry.parent_name || "—",
    enquiry.child_name || "—",
    enquiry.phone || "—",
    enquiry.child_age || "—",
    enquiry.message || "—",
    enquiry.created_at
        ? new Date(enquiry.created_at).toLocaleDateString()
        : "—"
];

    values.forEach((value) => {
        const cell = document.createElement("td");
        cell.style.padding = "12px";
        cell.style.borderBottom = "1px solid #f3dce8";
        cell.textContent = value;
        row.appendChild(cell);
    });

    // Status cell
    const statusCell = document.createElement("td");
    statusCell.style.padding = "12px";
    statusCell.style.borderBottom = "1px solid #f3dce8";

    // Read/Unread button
    const statusButton = document.createElement("button");

    function updateButtonText() {
        statusButton.textContent = enquiry.is_read
            ? "Read ✓"
            : "Unread ●";

        statusButton.style.background = enquiry.is_read
            ? "#d9f1ff"
            : "#ffd6e7";

        statusButton.style.color = "#444";
        statusButton.style.border = "none";
        statusButton.style.padding = "8px 12px";
        statusButton.style.borderRadius = "8px";
        statusButton.style.cursor = "pointer";
    }

    updateButtonText();

    statusButton.addEventListener("click", async () => {
        statusButton.disabled = true;

        const newStatus = !enquiry.is_read;

        statusButton.textContent = "Saving...";

        try {
            const { error } = await supabaseClient
                .from("admission_enquiries")
                .update({ is_read: newStatus })
                .eq("id", enquiry.id);

            if (error) {
                throw error;
            }

            enquiry.is_read = newStatus;
            updateButtonText();

            loadEnquiryCount();

        } catch (error) {
            console.error("Status update error:", error);
            alert("Status save nahi hua. Please try again.");
            updateButtonText();

        } finally {
            statusButton.disabled = false;
        }
    });

    statusCell.appendChild(statusButton);
    row.appendChild(statusCell);

    tableBody.appendChild(row);
});
}

async function loadParentAccounts() {
const button = document.getElementById("viewParentsButton");

if (!button) return;

button.disabled = true;
button.textContent = "Loading parents...";

try {
    const { data, error } = await supabaseClient
        .from("parent_profiles")
        .select("user_id, parent_name, phone, child_name, child_age, created_at")
        .order("created_at", { ascending: false });

    if (error) throw error;

    let section = document.getElementById("parentAccountsSection");

    if (!section) {
        section = document.createElement("section");
        section.id = "parentAccountsSection";
        section.className = "status";

        const enquiriesSection = document
            .getElementById("enquiryTableBody")
            ?.closest("section");

        if (enquiriesSection) {
            enquiriesSection.before(section);
        } else {
            document.getElementById("adminContent")?.appendChild(section);
        }
    }

    section.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "👨‍👩‍👧 Registered Parent Accounts";
    section.appendChild(heading);

    const parents = data || [];

    const count = document.createElement("p");
    count.id = "parentAccountsCount";
    count.style.margin = "12px 0";
    count.style.fontWeight = "bold";
    count.style.color = "#8d5270";
    section.appendChild(count);

    const search = document.createElement("input");
    search.type = "search";
    search.id = "parentAccountsSearch";
    search.placeholder = "🔍 Search parent, child or phone...";
    search.setAttribute("aria-label", "Search parent accounts");
    search.style.cssText = `
        width: 100%;
        padding: 14px;
        margin: 10px 0 18px;
        border: 1px solid #f3dce8;
        border-radius: 10px;
        font-size: 15px;
        outline-color: #df78a0;
    `;
    section.appendChild(search);

    if (parents.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No parent profiles found yet. ❤️";
        section.appendChild(message);
        count.textContent = "Total registered parents: 0";
    } else {
        const wrapper = document.createElement("div");
        wrapper.style.overflowX = "auto";

        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.textAlign = "left";

        const headers = [
            "Parent Name",
            "Child Name",
            "Phone",
            "Child Age",
            "Account Created"
        ];

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        headers.forEach((text) => {
            const th = document.createElement("th");
            th.textContent = text;
            th.style.padding = "12px";
            th.style.background = "#ffd6e7";
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        wrapper.appendChild(table);
        section.appendChild(wrapper);

        function renderParents(query = "") {
            const searchText = query.trim().toLowerCase();

            const filteredParents = parents.filter((parent) => {
                const searchableText = [
                    parent.parent_name,
                    parent.child_name,
                    parent.phone,
                    parent.child_age
                ].join(" ").toLowerCase();

                return searchableText.includes(searchText);
            });

            count.textContent =
                `Showing ${filteredParents.length} of ${parents.length} registered parents`;

            tbody.replaceChildren();

            if (filteredParents.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 5;
                cell.textContent = "No matching parent accounts found. ❤️";
                cell.style.padding = "15px";
                row.appendChild(cell);
                tbody.appendChild(row);
                return;
            }

            filteredParents.forEach((parent) => {
                const row = document.createElement("tr");

                const values = [
                    parent.parent_name,
                    parent.child_name,
                    parent.phone,
                    parent.child_age,
                    parent.created_at
                        ? new Date(parent.created_at).toLocaleDateString("en-IN")
                        : "—"
                ];

                values.forEach((value) => {
                    const cell = document.createElement("td");
                    cell.textContent = value || "—";
                    cell.style.padding = "12px";
                    cell.style.borderBottom = "1px solid #f3dce8";
                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });
        }

        search.addEventListener("input", () => {
            renderParents(search.value);
        });

        renderParents();
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    button.textContent = "Refresh Parent Accounts 🔄";

} catch (error) {
    console.error("Parent accounts error:", error);
    alert("Parent accounts load nahi ho sake. Please try again.");
    button.textContent = "View Parent Accounts ❤️";
} finally {
    button.disabled = false;
}

}

const viewParentsButton = document.getElementById("viewParentsButton");

if (viewParentsButton) {
viewParentsButton.addEventListener("click", loadParentAccounts);
}

function setupEnquiryNotifications() {
const notice = document.getElementById("newEnquiryNotice");
const noticeText = document.getElementById("newEnquiryText");
const viewButton = document.getElementById("viewNewEnquiryButton");

if (!notice || !noticeText || !viewButton) return;

const soundButton = document.getElementById("enableSoundButton");

let audioContext = null;
let soundEnabled = false;

function playNotificationSound() {
if (!soundEnabled || !audioContext) return;

const oscillator = audioContext.createOscillator();
const gain = audioContext.createGain();

oscillator.type = "sine";
oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

gain.gain.setValueAtTime(0.15, audioContext.currentTime);
gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.35
);

oscillator.connect(gain);
gain.connect(audioContext.destination);

oscillator.start();
oscillator.stop(audioContext.currentTime + 0.35);

}

if (soundButton) {
soundButton.addEventListener("click", async () => {
try {
audioContext = audioContext || new (
window.AudioContext || window.webkitAudioContext
)();

        await audioContext.resume();

        soundEnabled = true;
        soundButton.textContent = "🔊 Notification Sound Enabled";

        playNotificationSound();
    } catch (error) {
        console.error("Sound setup error:", error);
        alert("Sound enable nahi ho paya. Please try again.");
    }
});

}

viewButton.addEventListener("click", () => {
    notice.style.display = "none";

    document.querySelector(".status")?.scrollIntoView({
        behavior: "smooth"
    });
});

supabaseClient
    .channel("new-admission-enquiries")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "admission_enquiries"
        },
        (payload) => {
            const enquiry = payload.new;

            noticeText.textContent =
                "New enquiry received from " +
                (enquiry.parent_name || "a parent") + "! ❤️";

            notice.style.display = "block";

            playNotificationSound();

            loadEnquiryCount();
            loadAdmissionEnquiries();

            console.log("New enquiry received:", enquiry.id);
        }
    )
    .subscribe((status) => {
        console.log("Enquiry notifications:", status);
    });

}

const enquirySearch = document.getElementById("enquirySearch");

if (enquirySearch) {
enquirySearch.addEventListener("input", function () {
const searchText = this.value.trim().toLowerCase();
const rows = document.querySelectorAll("#enquiryTableBody tr");

    rows.forEach(function (row) {
        const parentName =
            row.cells[0]?.textContent.toLowerCase() || "";

        const childName =
            row.cells[1]?.textContent.toLowerCase() || "";

        const phone =
            row.cells[2]?.textContent.toLowerCase() || "";

        row.style.display =
            parentName.includes(searchText) ||
            childName.includes(searchText) ||
            phone.includes(searchText)
                ? ""
                : "none";
    });
});

}
    adminMessage.style.display = "block";

    adminMessage.textContent = "Checking admin permissions... ❤️";

    try {
        console.log("Checking admin session...");

        // Stop waiting indefinitely if the request gets stuck.
        const timeout = new Promise((_, reject) => {
            setTimeout(
                () => reject(new Error("Request timed out. Please refresh.")),
                12000
            );
        });

        const sessionResult = await Promise.race([
            supabaseClient.auth.getSession(),
            timeout
        ]);

        const { data: sessionData, error: sessionError } =
            sessionResult;

        if (sessionError) {
            throw sessionError;
        }

        if (!sessionData.session) {
            window.location.replace("admin-login.html");
            return;
        }

        console.log("Session found. Checking admin role...");

        const roleResult = await Promise.race([
            supabaseClient.rpc("is_admin"),
            timeout
        ]);

        const { data: isAdmin, error: roleError } = roleResult;

        console.log("Admin role result:", isAdmin);

        if (roleError) {
            throw roleError;
        }

        if (isAdmin !== true) {
            adminMessage.textContent =
                "Access denied. Admin permission required. 🔒";
            return;
        }

        adminMessage.style.display = "none";
        adminContent.style.display = "block";

    loadEnquiryCount();
    loadAdmissionEnquiries();
    setupEnquiryNotifications();
    loadFeeParents();
    loadFeeRecords();

        console.log("Admin access verified! ❤️");

    } catch (error) {
        console.error("Admin verification error:", error);

        adminMessage.style.display = "block";
        adminMessage.textContent =
            error.message ||
            "Unable to verify admin access. Please refresh.";
    }
}

if (adminContent && adminMessage) {
    checkAdminAccess();
}

async function loadFeeParents() {
const parentSelect = document.getElementById("feeParent");

if (!parentSelect) return;

parentSelect.innerHTML = '<option value="">Loading parents...</option>';

const { data, error } = await supabaseClient
    .from("parent_profiles")
    .select("user_id, parent_name, child_name")
    .order("parent_name", { ascending: true });

if (error) {
    console.error("Fee parent list error:", error);
    parentSelect.innerHTML =
        '<option value="">Could not load parents</option>';
    return;
}

parentSelect.innerHTML = '<option value="">Select Parent</option>';

(data || []).forEach((parent) => {
    const option = document.createElement("option");
    option.value = parent.user_id;
    option.textContent =
        `${parent.parent_name || "Unnamed Parent"} — ${parent.child_name || "Child name not set"}`;
    option.dataset.childName = parent.child_name || "";
    parentSelect.appendChild(option);
});

}

const feeParentSelect = document.getElementById("feeParent");

if (feeParentSelect) {
feeParentSelect.addEventListener("change", function () {
const selectedOption = this.options[this.selectedIndex];
const childInput = document.getElementById("feeChild");

    if (childInput && selectedOption) {
        childInput.value = selectedOption.dataset.childName || "";
    }
});

}

// =====================================
// SAVE MONTHLY FEE
// =====================================

const feeForm = document.getElementById("feeForm");

if (feeForm) {
    feeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const parentUserId =
            document.getElementById("feeParent").value;

        const childName =
            document.getElementById("feeChild").value.trim();

        const monthlyFee =
            Number(document.getElementById("monthlyFee").value);

        const billingMonth =
            document.getElementById("billingMonth").value;

        const feeMessage =
            document.getElementById("feeMessage");

        const submitButton =
            feeForm.querySelector('button[type="submit"]');

        if (!parentUserId || !childName || !billingMonth ||
            !Number.isFinite(monthlyFee) || monthlyFee < 0) {
            feeMessage.textContent =
                "Please enter all details correctly. ❤️";
            return;
        }

        feeMessage.textContent = "Saving monthly fee... 💰";

        if (submitButton) submitButton.disabled = true;

        try {
            const { error } = await supabaseClient
                .from("fee_payments")
                .insert({
                    parent_user_id: parentUserId,
                    child_name: childName,
                    monthly_fee: monthlyFee,
                    billing_month: billingMonth + "-01",
                    payment_status: "pending"
                });

            if (error) {
                console.error("Fee save error:", error);

                feeMessage.textContent =
                    error.code === "23505"
                        ? "Fee for this child and month already exists."
                        : "Could not save fee. Please check the console.";
                return;
            }

            feeMessage.textContent =
                "Monthly fee saved successfully! ❤️";

            feeForm.reset();

        } catch (error) {
            console.error("Unexpected fee error:", error);

            feeMessage.textContent =
                "Something went wrong. Please try again.";
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// =====================================
// LOAD MONTHLY FEE RECORDS
// =====================================

async function loadFeeRecords() {
    const tableBody = document.getElementById("feeRecordsTableBody");
    const message = document.getElementById("feeRecordsMessage");

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="padding: 15px;">
                Loading fee records... ❤️
            </td>
        </tr>
    `;

    try {
        console.log("User check passed, now loading fees ❤️");
        const { data: fees, error } = await supabaseClient
    .from("fee_payments")
    .select("parent_user_id, child_name, monthly_fee, billing_month, payment_status")
    .order("billing_month", { ascending: false });

console.log("Fee query start ho rahi hai ❤️");
console.log("Fees query result:", { fees, error });

if (error) throw error;

        const { data: parents, error: parentError } = await supabaseClient
            .from("parent_profiles")
            .select("user_id, parent_name");

        if (parentError) throw parentError;

        const parentNames = {};

        (parents || []).forEach(parent => {
            parentNames[parent.user_id] = parent.parent_name;
        });

        if (!fees || fees.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 15px;">
                        No fee records found yet. ❤️
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = "";

        fees.forEach((fee) => {
const row = document.createElement("tr");

const billingDate = new Date(fee.billing_month + "T00:00:00");

const billingMonth = Number.isNaN(billingDate.getTime())
    ? fee.billing_month
    : billingDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

const values = [
    fee.child_name || "—",
    "₹" + Number(fee.monthly_fee).toLocaleString("en-IN"),
    billingMonth,
    fee.payment_status === "paid" ? "Paid ✅" : "Pending ⏳"
];

values.forEach((value, index) => {
    const cell = document.createElement("td");

    cell.style.padding = "12px";
    cell.style.borderBottom = "1px solid #f3dce8";
    cell.textContent = value;

    if (index === 3) {
        cell.style.fontWeight = "bold";
        cell.style.color = fee.payment_status === "paid"
            ? "#218838"
            : "#c07800";
    }

    row.appendChild(cell);
});

if (fee.payment_status !== "paid") {
    const buttonCell = document.createElement("td");
    buttonCell.style.padding = "12px";

    const payButton = document.createElement("button");
    payButton.type = "button";
    payButton.textContent = "Pay Demo 🧪";

    payButton.style.cssText = `
        background: #ff8fab;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
    `;

    payButton.addEventListener("click", () => {
        document.getElementById("demoChildName").textContent =
            fee.child_name || "—";

        document.getElementById("demoFeeAmount").textContent =
            "₹" + Number(fee.monthly_fee).toLocaleString("en-IN");

        document.getElementById("demoBillingMonth").textContent =
            billingMonth;

        const modal = document.getElementById("demoPaymentModal");
        const message = document.getElementById("demoModalMessage");
        const confirmButton = document.getElementById("confirmDemoPayment");

        if (!modal || !message || !confirmButton) return;

        message.textContent = "";
        confirmButton.disabled = false;
        confirmButton.textContent = "Confirm Demo Payment ❤️";

        modal.showModal();
    });

    buttonCell.appendChild(payButton);
    row.appendChild(buttonCell);
}

tableBody.appendChild(row);

});

    } catch (error) {
        console.error("Fee records error:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 15px;">
                    Could not load fee records. Please try again.
                </td>
            </tr>
        `;

        if (message) {
            message.textContent =
                "Could not load fee records. Please refresh and try again.";
        }
    }
}

// =====================================
// ADMIN LOGIN
// =====================================

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;
        const message = document.getElementById("adminLoginMessage");
        const button = document.getElementById("adminLoginButton");

        message.textContent = "Verifying admin account... 🔐";
        button.disabled = true;

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                message.textContent =
                    "Login failed. Please check your email and password.";
                return;
            }

            const { data: isAdmin, error: roleError } =
                await supabaseClient.rpc("is_admin");

            if (roleError || isAdmin !== true) {
                await supabaseClient.auth.signOut();

                message.textContent =
                    "Access denied. This account is not an authorized admin. 🔒";
                return;
            }

            message.textContent = "Admin verified! Opening dashboard... ❤️";

            window.location.replace("admin.html");

        } catch (error) {
            console.error("Admin login error:", error);

            message.textContent =
                "Something went wrong. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
}

// =====================================
// PARENT PROFILE: LOAD AND SAVE
// =====================================

const parentProfileForm =
    document.getElementById("parentProfileForm");

if (parentProfileForm) {
    const profileMessage =
        document.getElementById("profileMessage");

    const saveProfileButton =
        document.getElementById("saveParentProfile");

    const profileParentName =
        document.getElementById("profileParentName");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileChildName =
        document.getElementById("profileChildName");

    const profileChildAge =
        document.getElementById("profileChildAge");

    async function loadParentProfile() {
        profileMessage.textContent = "Loading profile... ❤️";

        try {
            const {
                data: { user },
                error: userError
            } = await supabaseClient.auth.getUser();

            console.log("User check:", user ? "FOUND" : "NOT FOUND");
console.log("User error:", userError);

            if (userError || !user) {
                window.location.replace("login.html");
                return;
            }

            const { data: profile, error } =
                await supabaseClient
                    .from("parent_profiles")
                    .select(
                        "parent_name, phone, child_name, child_age"
                    )
                    .eq("user_id", user.id)
                    .maybeSingle();

            if (error) {
                throw error;
            }

            if (profile) {
                profileParentName.value =
                    profile.parent_name || "";

                profilePhone.value =
                    profile.phone || "";

                profileChildName.value =
                    profile.child_name || "";

                profileChildAge.value =
                    profile.child_age || "";

                profileMessage.textContent =
                    "Your profile is loaded. ❤️";
            } else {
                // Use the name entered during signup, if available.
                profileParentName.value =
                    user.user_metadata?.parent_name || "";

                profileMessage.textContent =
                    "Welcome! Complete your profile below. ❤️";
            }

        } catch (error) {
            console.error("Profile loading error:", error);

            profileMessage.textContent =
                "Could not load profile. Please refresh and try again.";
        }
    }

    parentProfileForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            saveProfileButton.disabled = true;
            saveProfileButton.textContent = "Saving... ❤️";

            profileMessage.textContent =
                "Saving your profile...";

            try {
                const {
                    data: { user },
                    error: userError
                } = await supabaseClient.auth.getUser();

                if (userError || !user) {
                    window.location.replace("login.html");
                    return;
                }

                const profileData = {
                    user_id: user.id,
                    parent_name: profileParentName.value.trim(),
                    phone: profilePhone.value.trim(),
                    child_name: profileChildName.value.trim(),
                    child_age: profileChildAge.value.trim(),
                    updated_at: new Date().toISOString()
                };

                if (!profileData.parent_name) {
                    profileMessage.textContent =
                        "Please enter the parent's name.";
                    return;
                }

                const { error } = await supabaseClient
                    .from("parent_profiles")
                    .upsert(profileData, {
                        onConflict: "user_id"
                    });

                if (error) {
                    throw error;
                }

                profileMessage.textContent =
                    "Profile saved successfully! ❤️🧸";

                console.log("Parent profile saved.");

            } catch (error) {
                console.error("Profile saving error:", error);

                profileMessage.textContent =
                    "Could not save profile. Please try again.";
            } finally {
                saveProfileButton.disabled = false;
                saveProfileButton.textContent =
                    "Save Profile ❤️";
            }
        }
    );

    loadParentProfile();
}

// =====================================
// PARENT DASHBOARD - LOAD MONTHLY FEES
// =====================================

const parentFeeTableBody =
    document.getElementById("parentFeeTableBody");

async function loadParentFees() {


    console.log("loadParentFees function started ❤️");
if (!parentFeeTableBody) return;

const message =
    document.getElementById("parentFeeMessage");

parentFeeTableBody.innerHTML = `
    <tr>
        <td colspan="4" style="padding: 15px;">
            Loading your fees... ❤️
        </td>
    </tr>
`;

try {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.replace("login.html");
        return;
    }

    console.log("Parent user ID:", user.id);
console.log("Parent session:", await supabaseClient.auth.getSession());

    const { data: fees, error } = await supabaseClient
        .from("fee_payments")
        .select(
            "child_name, monthly_fee, billing_month, payment_status"
        )
        .eq("parent_user_id", user.id)
        .order("billing_month", { ascending: false });

console.log("Fees query result:", { fees, error });

if (error) throw error;

    parentFeeTableBody.replaceChildren();

    if (!fees || fees.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.style.padding = "15px";
        cell.textContent =
            "No fee records found yet. Please contact Nanhi Duniya. ❤️";

        row.appendChild(cell);
        parentFeeTableBody.appendChild(row);

        if (message) message.textContent = "";
        return;
    }

    fees.forEach((fee) => {
        const row = document.createElement("tr");

        const billingDate = new Date(
            fee.billing_month + "T00:00:00"
        );

        const values = [
            fee.child_name || "—",
            "₹" + Number(fee.monthly_fee).toLocaleString("en-IN"),
            Number.isNaN(billingDate.getTime())
                ? fee.billing_month
                : billingDate.toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                }),
            fee.payment_status === "paid" ? "Paid ✅" : "Pending ⏳"
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");

            cell.style.padding = "12px";
            cell.style.borderBottom = "1px solid #f3dce8";
            cell.textContent = value;

            if (index === 3) {
                cell.style.fontWeight = "bold";
                cell.style.color =
                    fee.payment_status === "paid"
                        ? "#218838"
                        : "#c07800";
            }

            row.appendChild(cell);
        });

        // Demo payment button
if (fee.payment_status !== "paid") {
const buttonCell = document.createElement("td");
buttonCell.style.padding = "12px";

        const payButton = document.createElement("button");
        payButton.type = "button";
        payButton.textContent = "Pay Demo 🧪";
        payButton.style.cssText =
            "background:#ff8fab;color:white;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:bold;";

        payButton.addEventListener("click", () => {
            const childName = document.getElementById("demoChildName");
            const feeAmount = document.getElementById("demoFeeAmount");
            const month = document.getElementById("demoBillingMonth");
            const modal = document.getElementById("demoPaymentModal");
            const modalMessage = document.getElementById("demoModalMessage");
            const confirmButton = document.getElementById("confirmDemoPayment");

            if (!childName || !feeAmount || !month || !modal ||
                !modalMessage || !confirmButton) {
                console.error("Demo modal elements missing");
                return;
            }

            childName.textContent = fee.child_name || "—";
            feeAmount.textContent =
                "₹" + Number(fee.monthly_fee).toLocaleString("en-IN");

            const billingDate = new Date(
                fee.billing_month + "T00:00:00"
            );

            month.textContent = Number.isNaN(billingDate.getTime())
                ? (fee.billing_month || "—")
                : billingDate.toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric"
                });

            modalMessage.textContent = "";
            confirmButton.disabled = false;
            confirmButton.textContent = "Confirm Demo Payment ❤️";

            modal.showModal();
        });

        buttonCell.appendChild(payButton);
        row.appendChild(buttonCell);
    }

    parentFeeTableBody.appendChild(row);
});
} catch (error) {
    console.error("Error loading parent fees:", error);

    if (message) {
        message.textContent =
            "Please refresh the page or contact the administrator.";
    }
}
}

if (parentFeeTableBody) {
loadParentFees();
}

document.addEventListener("DOMContentLoaded", function () {
    const demoButton = document.getElementById("demoPaymentButton");
    const modal = document.getElementById("demoPaymentModal");
    const confirmButton = document.getElementById("confirmDemoPayment");
    const closeButton = document.getElementById("closeDemoPayment");
    const message = document.getElementById("demoModalMessage");

    if (!demoButton || !modal || !confirmButton || !closeButton || !message) {
        console.error("Demo payment elements not found.");
        return;
    }

    demoButton.addEventListener("click", function () {
        message.textContent = "";
        confirmButton.disabled = false;
        confirmButton.textContent = "Confirm Demo Payment ❤️";

        const tableBody = document.getElementById("parentFeeTableBody");

        if (!tableBody) {
            message.textContent = "Fee table nahi mili. Please refresh the page.";
            return;
        }

        const rows = Array.from(tableBody.querySelectorAll("tr"));

        const pendingRow = rows.find(function (row) {
            const cells = row.querySelectorAll("td");
            return cells.length >= 4 &&
                cells[3].textContent.includes("Pending");
        });

        if (!pendingRow) {
            message.textContent = "No pending fees found. ❤️";
            return;
        }

        const cells = pendingRow.querySelectorAll("td");

        document.getElementById("demoChildName").textContent =
            cells[0].textContent.trim();

        document.getElementById("demoFeeAmount").textContent =
            cells[1].textContent.trim();

        document.getElementById("demoBillingMonth").textContent =
            cells[2].textContent.trim();

        modal.showModal();
    });

    closeButton.addEventListener("click", function () {
        modal.close();
    });

    confirmButton.addEventListener("click", function () {
        message.textContent =
            "✅ Demo successful! No real payment was made. Your fee status has not changed. ❤️";

        message.style.color = "#287a45";
        confirmButton.textContent = "Demo Completed ✅";
        confirmButton.disabled = true;
    });
});

/* 👻 NANHI DUNIYA PASSWORD EYE + PREMIUM FIX */

(function () {
const style = document.createElement("style");

style.textContent = `
    /* PASSWORD INPUT POSITION */
    .horror-password-wrap {
        position: relative !important;
        display: block !important;
        width: 100% !important;
    }

    .horror-password-wrap input {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding-right: 55px !important;
        transition: border-color 0.25s ease,
                    box-shadow 0.25s ease !important;
    }

    /* PINK GLOW ON INPUT */
    .auth-container input:hover,
.auth-container input:focus,
.admin-auth-container input:hover,
.admin-auth-container input:focus {
    border-color: #ff69b4 !important;
    box-shadow: 0 0 8px #ff69b4,
                0 0 20px rgba(255,105,180,0.55) !important;
    outline: none !important;
}

    /* EYE BUTTON POSITION */
    .horror-password-wrap .horror-eye-btn {
        position: absolute !important;
        right: 5px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 42px !important;
        height: 42px !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        cursor: pointer;
        font-size: 23px !important;
        z-index: 2;
    }

    .horror-password-wrap .horror-eye-btn:hover {
        transform: translateY(-50%) scale(1.12) !important;
        filter: drop-shadow(0 0 6px #ff69b4) !important;
    }

`;

style.textContent += `
        /* HORROR CLICK ANIMATION */
        .horror-password-wrap .horror-eye-btn.horror-active {
            animation: horrorEye 0.65s ease;
            filter: drop-shadow(0 0 9px red) !important;
        }

        .horror-password-wrap.horror-glow input {
            border-color: #ff1744 !important;
            box-shadow: 0 0 8px #ff1744,
                        0 0 18px rgba(255,0,0,0.5) !important;
            animation: horrorShake 0.3s ease;
        }

        @keyframes horrorEye {
            0%   { transform: translateY(-50%) scale(1); }
            25%  { transform: translateY(-50%) scale(0.65) rotate(-15deg); }
            50%  { transform: translateY(-50%) scale(1.2) rotate(10deg); }
            75%  { transform: translateY(-50%) scale(0.9); }
            100% { transform: translateY(-50%) scale(1); }
        }

        @keyframes horrorShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
            75% { transform: translateX(-2px); }
        }

        /* PREMIUM BUTTONS */
        #loginButton,
        #signupButton,
        #adminLoginButton,
        #resetButton {
            position: relative !important;
            overflow: hidden !important;
            transition: transform 0.25s ease,
                        box-shadow 0.25s ease,
                        filter 0.25s ease !important;
        }

        #loginButton:hover,
        #signupButton:hover,
        #adminLoginButton:hover,
        #resetButton:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 0 10px #ff69b4,
                        0 0 25px #ff69b4,
                        0 0 40px rgba(255,105,180,0.7) !important;
            filter: brightness(1.08) !important;
        }
    `;

    style.textContent += `
        /* SHINING BUTTON EFFECT */
        #loginButton::after,
        #signupButton::after,
        #adminLoginButton::after,
        #resetButton::after {
            content: "";
            position: absolute;
            top: 0;
            left: -120%;
            width: 70%;
            height: 100%;
            background: linear-gradient(
                120deg,
                transparent,
                rgba(255,255,255,0.4),
                transparent
            );
            transform: skewX(-20deg);
            pointer-events: none;
        }

        #loginButton:hover::after,
        #signupButton:hover::after,
        #adminLoginButton:hover::after,
        #resetButton:hover::after {
            left: 150%;
            transition: left 0.65s ease;
        }

        @media (prefers-reduced-motion: reduce) {
            .horror-password-wrap input,
            .horror-password-wrap .horror-eye-btn,
            #loginButton,
            #signupButton,
            #adminLoginButton,
            #resetButton {
                animation: none !important;
                transition: none !important;
            }
        }
    `;

    document.head.appendChild(style);

    /* CREATE PASSWORD EYE */
    document.querySelectorAll('input[type="password"]').forEach(function(input) {
        if (input.dataset.horrorEyeAdded === "true") return;

        input.dataset.horrorEyeAdded = "true";

        const wrapper = document.createElement("div");
        wrapper.className = "horror-password-wrap";

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const eye = document.createElement("button");
        eye.type = "button";
        eye.className = "horror-eye-btn";
        eye.textContent = "👁️";
        eye.title = "Show password";
        eye.setAttribute("aria-label", "Show password");
        eye.setAttribute("aria-pressed", "false");

        wrapper.appendChild(eye);

        eye.addEventListener("click", function () {
            const showPassword = input.type === "password";

            input.type = showPassword ? "text" : "password";

            eye.textContent = showPassword ? "🙈" : "👁️";
            eye.title = showPassword ? "Hide password" : "Show password";

            eye.setAttribute("aria-label", eye.title);
            eye.setAttribute("aria-pressed", String(showPassword));

            eye.classList.remove("horror-active");
            wrapper.classList.remove("horror-glow");

            void eye.offsetWidth;

            eye.classList.add("horror-active");
            wrapper.classList.add("horror-glow");

            setTimeout(function () {
                eye.classList.remove("horror-active");
                wrapper.classList.remove("horror-glow");
            }, 700);

            playBabyGiggle();
        });

        function playBabyGiggle() {
            try {
                const audioContext = new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

                const notes = [600, 850, 700, 1000, 750, 900];

                notes.forEach(function (frequency, index) {
                    const startTime =
                        audioContext.currentTime + index * 0.16;

                    const oscillator =
                        audioContext.createOscillator();

                    const gain = audioContext.createGain();

                    oscillator.type = "sine";

                    oscillator.frequency.setValueAtTime(
                        frequency,
                        startTime
                    );

                    gain.gain.setValueAtTime(0, startTime);

                    gain.gain.linearRampToValueAtTime(
                        0.12,
                        startTime + 0.04
                    );

                    gain.gain.exponentialRampToValueAtTime(
                        0.001,
                        startTime + 0.14
                    );

                    oscillator.connect(gain);
                    gain.connect(audioContext.destination);

                    oscillator.start(startTime);
                    oscillator.stop(startTime + 0.15);
                });

                setTimeout(function () {
                    audioContext.close();
                }, 1500);

            } catch (error) {
                console.log("Sound effect unavailable:", error);
            }
        }
    });
})();