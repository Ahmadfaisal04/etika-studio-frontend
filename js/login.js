// login.js
(function () {
    'use strict';

    // Bootstrap validation
    const forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });
})();

async function loginUser(username, password) {
    const url = 'http://localhost:8080/api/login';
    const data = { username, password };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Login successful:', result);

            // Simpan token ke localStorage
            localStorage.setItem('authToken', result.token);

            // Redirect ke halaman form.html
            window.location.href = 'form.html';
        } else {
            console.error('Login failed:', result);
            alert('Login failed: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again later.');
    }
}

const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!this.checkValidity()) {
            event.stopPropagation();
        } else {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();

            loginUser(username, password);
        }

        this.classList.add('was-validated');
    });
}
