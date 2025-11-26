// API Configuration - Automatically detects environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const toggleBg = document.getElementById('toggleBg');
    const formSections = document.querySelectorAll('.form-section');
    const formTitle = document.getElementById('formTitle');
    const successMessage = document.getElementById('successMessage');
    const messageText = document.getElementById('messageText');
    const authContainer = document.getElementById('authContainer');
    const profileContainer = document.getElementById('profileContainer');
    const backToAuth = document.getElementById('backToAuth');
    const cancelProfile = document.getElementById('cancelProfile');
    const googleSignIn = document.getElementById('googleSignIn');
    const googleSignUp = document.getElementById('googleSignUp');
    const facebookSignIn = document.getElementById('facebookSignIn');
    const facebookSignUp = document.getElementById('facebookSignUp');
    const xSignIn = document.getElementById('xSignIn');
    const xSignUp = document.getElementById('xSignUp');
    const profileName = document.getElementById('profileName');
    const profileNameInput = document.getElementById('profileNameInput');
    
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token and load profile
        apiCall('/auth/verify')
            .then(() => {
                showProfileForm();
                loadUserProfile();
            })
            .catch(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            });
    }
    
    // Toggle between Sign In and Sign Up forms
    toggleOptions.forEach(option => {
        option.addEventListener('click', function() {
            const targetForm = this.getAttribute('data-form');
            
            // Update toggle background position
            if (targetForm === 'signin') {
                toggleBg.style.transform = 'translateX(0)';
                formTitle.textContent = 'Welcome Back';
            } else {
                toggleBg.style.transform = 'translateX(100%)';
                formTitle.textContent = 'Create Account';
            }
            
            // Update active classes
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Show the selected form
            formSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetForm}Form`) {
                    setTimeout(() => {
                        section.classList.add('active');
                    }, 50);
                }
            });
        });
    });
    
    // Switch to sign up from sign in footer
    document.getElementById('switchToSignup').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.toggle-option[data-form="signup"]').click();
    });
    
    // Switch to sign in from sign up footer
    document.getElementById('switchToSignin').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.toggle-option[data-form="signin"]').click();
    });
    
    // Add floating animation to form inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.querySelector('.form-label').style.transform = 'translateY(-5px)';
            this.parentElement.querySelector('.form-label').style.color = 'rgba(255, 255, 255, 0.9)';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.querySelector('.form-label').style.transform = 'translateY(0)';
                this.parentElement.querySelector('.form-label').style.color = 'var(--light)';
            }
        });
    });
    
    // Sign In form submission
    document.getElementById('signin').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        
        try {
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.textContent = 'Signing In...';
            submitBtn.disabled = true;
            
            const data = await apiCall('/auth/signin', {
                method: 'POST',
                body: { email, password }
            });
            
            // Store token
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Successfully signed in!', true);
            
            // Show profile form after successful login
            setTimeout(() => {
                showProfileForm();
                loadUserProfile();
            }, 1000);
            
        } catch (error) {
            showMessage(error.message, false);
        } finally {
            const submitBtn = document.querySelector('#signin .submit-btn');
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
        }
    });
    
    // Sign Up form submission
    document.getElementById('signup').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        try {
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            const data = await apiCall('/auth/signup', {
                method: 'POST',
                body: { fullName, email, password, confirmPassword }
            });
            
            // Store token
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('Account created successfully!', true);
            
            // Show profile form after successful registration
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = fullName;
                profileNameInput.value = fullName;
            }, 1000);
            
        } catch (error) {
            showMessage(error.message, false);
        } finally {
            const submitBtn = document.querySelector('#signup .submit-btn');
            submitBtn.textContent = 'Create Account';
            submitBtn.disabled = false;
        }
    });
    
    // Google Sign In
    googleSignIn.addEventListener('click', function() {
        showMessage('Redirecting to Google...', true);
        
        // In a real application, this would redirect to Google OAuth
        // For demo purposes, we'll simulate the process
        setTimeout(() => {
            showMessage('Successfully authenticated with Google!', true);
            
            // Show profile form after successful Google auth
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = 'Google User';
                profileNameInput.value = 'Google User';
            }, 1000);
        }, 2000);
    });
    
    // Google Sign Up
    googleSignUp.addEventListener('click', function() {
        showMessage('Redirecting to Google...', true);
        
        // In a real application, this would redirect to Google OAuth
        // For demo purposes, we'll simulate the process
        setTimeout(() => {
            showMessage('Successfully registered with Google!', true);
            
            // Show profile form after successful Google auth
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = 'Google User';
                profileNameInput.value = 'Google User';
            }, 1000);
        }, 2000);
    });
    
    // Facebook Sign In
    facebookSignIn.addEventListener('click', function() {
        showMessage('Redirecting to Facebook...', true);
        
        // In a real application, this would redirect to Facebook OAuth
        // For demo purposes, we'll simulate the process
        setTimeout(() => {
            showMessage('Successfully authenticated with Facebook!', true);
            
            // Show profile form after successful Facebook auth
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = 'Facebook User';
                profileNameInput.value = 'Facebook User';
            }, 1000);
        }, 2000);
    });
    
    // Facebook Sign Up
    facebookSignUp.addEventListener('click', function() {
        showMessage('Redirecting to Facebook...', true);
        
        // In a real application, this would redirect to Facebook OAuth
        // For demo purposes, we'll simulate the process
        setTimeout(() => {
            showMessage('Successfully registered with Facebook!', true);
            
            // Show profile form after successful Facebook auth
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = 'Facebook User';
                profileNameInput.value = 'Facebook User';
            }, 1000);
        }, 2000);
    });
    
    // X (Twitter) Sign In
    xSignIn.addEventListener('click', function() {
        showMessage('Redirecting to X...', true);
        
        // In a real application, this would redirect to X OAuth
        // For demo purposes, we'll simulate the process
        setTimeout(() => {
            showMessage('Successfully authenticated with X!', true);
            
            // Show profile form after successful X auth
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = 'X User';
                profileNameInput.value = 'X User';
            }, 1000);
        }, 2000);
    });
    
    // X (Twitter) Sign Up
    xSignUp.addEventListener('click', function() {
        showMessage('Redirecting to X...', true);
        
        // In a real application, this would redirect to X OAuth
        // For demo purposes, we'll simulate the process
        setTimeout(() => {
            showMessage('Successfully registered with X!', true);
            
            // Show profile form after successful X auth
            setTimeout(() => {
                showProfileForm();
                profileName.textContent = 'X User';
                profileNameInput.value = 'X User';
            }, 1000);
        }, 2000);
    });
    
    // Show profile form
    function showProfileForm() {
        document.body.classList.add('dark-mode');
        authContainer.style.display = 'none';
        profileContainer.style.display = 'block';
        
        // Add animation
        profileContainer.style.animation = 'fadeIn 0.5s ease forwards';
    }
    
    // Back to auth form
    backToAuth.addEventListener('click', function() {
        document.body.classList.remove('dark-mode');
        authContainer.style.display = 'block';
        profileContainer.style.display = 'none';
    });
    
    // Cancel profile form
    cancelProfile.addEventListener('click', function() {
        document.body.classList.remove('dark-mode');
        authContainer.style.display = 'block';
        profileContainer.style.display = 'none';
    });
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('profileNameInput').value,
            age: document.getElementById('age').value,
            dob: document.getElementById('dob').value,
            gender: document.querySelector('input[name="gender"]:checked')?.value || '',
            hobbies: Array.from(document.querySelectorAll('input[name="hobbies"]:checked')).map(cb => cb.value),
            motherName: document.getElementById('motherName').value,
            fatherName: document.getElementById('fatherName').value,
            userMobile: document.getElementById('userMobile').value,
            parentMobile: document.getElementById('parentMobile').value,
            description: document.getElementById('description').value
        };
        
        try {
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;
            
            const data = await apiCall('/profile', {
                method: 'PUT',
                body: formData
            });
            
            showMessage('Profile saved successfully!', true);
            
            // Update profile name
            profileName.textContent = formData.fullName;
            
        } catch (error) {
            showMessage(error.message, false);
        } finally {
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.textContent = 'Save Profile';
            submitBtn.disabled = false;
        }
    });
    
    // Load user profile from backend
    async function loadUserProfile() {
        try {
            const data = await apiCall('/profile');
            
            // Populate form fields with user data
            document.getElementById('profileNameInput').value = data.fullName || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('dob').value = data.dob ? data.dob.split('T')[0] : '';
            document.getElementById('motherName').value = data.motherName || '';
            document.getElementById('fatherName').value = data.fatherName || '';
            document.getElementById('userMobile').value = data.userMobile || '';
            document.getElementById('parentMobile').value = data.parentMobile || '';
            document.getElementById('description').value = data.description || '';
            
            // Set gender
            if (data.gender) {
                const genderInput = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
                if (genderInput) genderInput.checked = true;
            }
            
            // Set hobbies
            if (data.hobbies && Array.isArray(data.hobbies)) {
                data.hobbies.forEach(hobby => {
                    const checkbox = document.querySelector(`input[name="hobbies"][value="${hobby}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Update profile name
            if (data.fullName) {
                profileName.textContent = data.fullName;
            }
            
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }
    
    // Show message function
    function showMessage(text, isSuccess) {
        messageText.textContent = text;
        successMessage.style.background = isSuccess ? 
            'linear-gradient(90deg, var(--success), #00d2a0)' : 
            'linear-gradient(90deg, var(--accent), #ff8e8e)';
        
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    }
    
    // Error animation function
    function animateError(input) {
        input.style.borderColor = 'var(--accent)';
        input.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.3)';
        
        // Shake animation
        input.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
});