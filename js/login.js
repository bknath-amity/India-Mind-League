document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const contactForm = document.getElementById('contactForm');
    const otpForm = document.getElementById('otpForm');
    const contactInput = document.getElementById('contact');
    const contactLabel = document.getElementById('contactLabel');
    const sentTo = document.getElementById('sentTo');
    const editContact = document.getElementById('editContact');
    const resendBtn = document.getElementById('resendBtn');
    const resendIn = document.getElementById('resendIn');
    const msg1 = document.getElementById('msg1');
    const msg2 = document.getElementById('msg2');
    const otpBoxes = document.querySelectorAll('#otpBoxes input');

    let currentContact = '';
    let currentType = 'email';
    let countdownTimer = null;

    // Base URL for all API calls (change if needed)
    const API_BASE = '/schoolshopdemo/wordpress/ilm/';

    // --- Segment toggle (Email / Phone) ---
    document.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.method;
            contactLabel.textContent = currentType === 'email' ? 'Email address' : 'Mobile number';
            contactInput.type = currentType === 'email' ? 'email' : 'tel';
            contactInput.placeholder = currentType === 'email' ? 'you@example.com' : '10-digit mobile';
            contactInput.value = '';
            contactForm.hidden = false;
            otpForm.hidden = true;
            msg1.textContent = '';
            msg2.textContent = '';
        });
    });

    // --- Step 1: Send OTP ---
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const contact = contactInput.value.trim();
        if (!contact) {
            showMsg(msg1, 'Please enter your ' + (currentType === 'email' ? 'email' : 'mobile number'), 'error');
            return;
        }

        // Basic validation
        if (currentType === 'email' && !isValidEmail(contact)) {
            showMsg(msg1, 'Please enter a valid email address.', 'error');
            return;
        }
        if (currentType === 'phone' && !isValidPhone(contact)) {
            showMsg(msg1, 'Please enter a valid 10-digit mobile number.', 'error');
            return;
        }

        // Disable button
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Sending...';

        const url = API_BASE + 'send_otp.php';
        const payload = new URLSearchParams({
            contact: contact,
            contact_type: currentType
        });

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                currentContact = contact;
                sentTo.textContent = contact;
                contactForm.hidden = true;
                otpForm.hidden = false;
                msg2.textContent = '';
                // Clear OTP inputs
                otpBoxes.forEach(inp => inp.value = '');
                otpBoxes[0].focus();
                startResendTimer();
            } else {
                showMsg(msg1, result.message || 'Failed to send OTP.', 'error');
            }
        })
        .catch(err => {
            showMsg(msg1, 'Network error. Please try again.', 'error');
            console.error(err);
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = 'Send OTP →';
        });
    });

    // --- Step 2: Verify OTP ---
    otpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const otp = Array.from(otpBoxes).map(inp => inp.value).join('');
        if (otp.length !== 6) {
            showMsg(msg2, 'Please enter all 6 digits.', 'error');
            return;
        }

        const btn = otpForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Verifying...';

        const url = API_BASE + 'verify_otp.php';
        const payload = new URLSearchParams({
            contact: currentContact,
            contact_type: currentType,
            otp: otp
        });

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                // Login successful – redirect
                window.location.href = result.redirect || 'dashboard.html';
            } else {
                showMsg(msg2, result.message || 'Invalid OTP.', 'error');
                otpBoxes.forEach(inp => inp.value = '');
                otpBoxes[0].focus();
            }
        })
        .catch(err => {
            showMsg(msg2, 'Network error. Please try again.', 'error');
            console.error(err);
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = 'Verify & Login';
        });
    });

    // --- Edit contact (go back) ---
    editContact.addEventListener('click', function() {
        otpForm.hidden = true;
        contactForm.hidden = false;
        clearResendTimer();
    });

    // --- Resend OTP ---
    resendBtn.addEventListener('click', function() {
        const btn = resendBtn;
        btn.disabled = true;
        btn.textContent = 'Sending...';

        const url = API_BASE + 'send_otp.php';
        const payload = new URLSearchParams({
            contact: currentContact,
            contact_type: currentType
        });

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                msg2.textContent = 'New OTP sent!';
                msg2.style.color = '#34d399';
                startResendTimer();
            } else {
                showMsg(msg2, result.message || 'Failed to resend OTP.', 'error');
            }
        })
        .catch(err => {
            showMsg(msg2, 'Network error. Please try again.', 'error');
        })
        .finally(() => {
            btn.disabled = true;
            btn.textContent = 'Resend in ' + resendIn.textContent + 's';
        });
    });

    // --- OTP input auto-focus ---
    otpBoxes.forEach((inp, idx) => {
        inp.addEventListener('input', function() {
            if (this.value.length === 1 && idx < otpBoxes.length - 1) {
                otpBoxes[idx + 1].focus();
            }
        });
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && idx > 0) {
                otpBoxes[idx - 1].focus();
            }
        });
    });

    // --- Helpers ---
    function showMsg(el, text, type) {
        el.textContent = text;
        el.style.display = 'block';
        el.style.color = type === 'error' ? '#f87171' : '#34d399';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^[6-9][0-9]{9}$/.test(phone);
    }

    function startResendTimer() {
        let seconds = 30;
        resendIn.textContent = seconds;
        resendBtn.disabled = true;
        clearInterval(countdownTimer);
        countdownTimer = setInterval(() => {
            seconds--;
            resendIn.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(countdownTimer);
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend OTP';
            }
        }, 1000);
    }

    function clearResendTimer() {
        clearInterval(countdownTimer);
        resendBtn.disabled = true;
        resendBtn.textContent = 'Resend in ' + resendIn.textContent + 's';
    }
});