document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    console.log(`Attempting to sign up with email: ${email} and password: ${password}`);
    try {
        const response = await axios.post("http://localhost:3000/signup", { email, password });
        console.log(`Response from server: ${JSON.stringify(response.data)}`);
        const data = response.data;
        if (data.success) {
            console.log(`User ${email} created successfully`);
            document.getElementById("login-form").style.display = "block";
            document.getElementById("signup-form").style.display = "none";
        } else {
            console.error('Error: Could not create user');
        }
    } catch (error) {
        console.error('Error signing up:', error);
    }
});

async function viewUserNotes(userId) {
    try {
        const response = await axios.get(`http://localhost:3000/notes/${userId}`);
        if (response && response.data) {
            const notes = response.data;
            const notesList = document.querySelector("#notes-list");
            notesList.innerHTML = ""; // Clear existing notes

            notes.forEach(note => {
                const listItem = document.createElement("li");
                listItem.textContent = `Time: ${note.time}, Body: ${note.body}`;
                notesList.appendChild(listItem);
            });
        } else {
            console.error('Error: No notes found for this user');
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}


document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log(`Attempting to login with email: ${email} and password: ${password}`);
    try {
        const response = await axios.post("http://localhost:3000/login", { email, password });
        console.log(`Response from server: ${JSON.stringify(response.data)}`);
        const data = response.data;
        if (data.token) {
            console.log("Login successful, storing token in local storage");
            localStorage.setItem("token", data.token);
            window.location.href = "notes.html";
        } else {
            console.log("Invalid email or password");
            alert("Invalid email or password");
        }
    } catch (error) {
        console.error(`Error logging in: ${error}`);
    }
})


