document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('regForm');
    const msg = document.getElementById('formMsg');
    const successDiv = document.getElementById('formSuccess');
    const successName = document.getElementById('successName');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous messages
        msg.textContent = '';
        msg.style.display = 'none';
        closeSuccessModal();

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Client-side validation
        if (!data.name || !data.grade || !data.phone || !data.email) {
            msg.textContent = 'Please fill all required fields.';
            msg.style.display = 'block';
            msg.style.color = '#f87171';
            return;
        }

        // Basic phone validation (10 digits)
        if (!/^[6-9][0-9]{9}$/.test(data.phone)) {
            msg.textContent = 'Please enter a valid 10-digit mobile number.';
            msg.style.display = 'block';
            msg.style.color = '#f87171';
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Absolute URL to avoid path issues
        const url = '/schoolshopdemo/wordpress/ilm/register.php';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data).toString()
        })
        .then(response => {
            // Parse JSON regardless of HTTP status
            return response.json().then(json => {
                json._status = response.status;
                return json;
            });
        })
        .then(result => {
            if (result.status === 'success') {
                // Show success as a popup modal
                successName.textContent = `Welcome, ${data.name}! You are now registered.`;
                openSuccessModal();
                form.reset();

                // Auto-redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = '/schoolshopdemo/wordpress/ilm/login.html';
                }, 2000);
            } else {
                // Show server error message
                msg.textContent = result.message || 'Registration failed. Please try again.';
                msg.style.display = 'block';
                msg.style.color = '#f87171';
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            msg.textContent = 'Network error. Please check your connection and try again.';
            msg.style.display = 'block';
            msg.style.color = '#f87171';
        })
        .finally(() => {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Registration';
        });
    });

    function openSuccessModal() {
        successDiv.classList.add('open');
    }

    function closeSuccessModal() {
        successDiv.classList.remove('open');
    }
});