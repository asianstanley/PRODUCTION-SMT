// ==========================================
// LOGIN AUTHENTICATION SYSTEM
// ==========================================

class LoginSystem {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.loadRememberedUser();
    this.initializeAnimations();
  }

  // Initialize DOM Elements
  initializeElements() {
    this.form = document.getElementById('loginForm');
    this.usernameInput = document.getElementById('username');
    this.passwordInput = document.getElementById('password');
    this.togglePassword = document.getElementById('togglePassword');
    this.rememberCheckbox = document.getElementById('rememberMe');
    this.alertBox = document.getElementById('alertMessage');
    this.userInfoBox = document.getElementById('userInfoBox');
  }

  // Attach Event Listeners
  attachEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleLogin(e));

    // Password toggle
    this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

    // Real-time validation
    this.usernameInput.addEventListener('input', () => this.validateUsername());
    this.passwordInput.addEventListener('input', () => this.validatePassword());

    // Enter key support
    this.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.form.dispatchEvent(new Event('submit'));
      }
    });
  }

  // Toggle Password Visibility
  togglePasswordVisibility() {
    const type = this.passwordInput.type === 'password' ? 'text' : 'password';
    this.passwordInput.type = type;
    
    this.togglePassword.classList.toggle('fa-eye');
    this.togglePassword.classList.toggle('fa-eye-slash');
  }

  // Validate Username
  validateUsername() {
    const username = this.usernameInput.value.trim();
    
    if (username.length > 0 && username.length < 3) {
      this.setInputState(this.usernameInput, 'invalid');
      return false;
    } else if (username.length >= 3) {
      this.setInputState(this.usernameInput, 'valid');
      return true;
    }
    
    this.setInputState(this.usernameInput, 'neutral');
    return false;
  }

  // Validate Password
  validatePassword() {
    const password = this.passwordInput.value;
    
    if (password.length > 0 && password.length < 6) {
      this.setInputState(this.passwordInput, 'invalid');
      return false;
    } else if (password.length >= 6) {
      this.setInputState(this.passwordInput, 'valid');
      return true;
    }
    
    this.setInputState(this.passwordInput, 'neutral');
    return false;
  }

  // Set Input State (Valid/Invalid)
  setInputState(input, state) {
    input.classList.remove('is-valid', 'is-invalid');
    
    if (state === 'valid') {
      input.style.borderColor = '#10b981';
    } else if (state === 'invalid') {
      input.style.borderColor = '#ef4444';
    } else {
      input.style.borderColor = '#e5e7eb';
    }
  }

  // Handle Login
  async handleLogin(e) {
    e.preventDefault();
    
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;
    
    // Validate inputs
    if (!username || !password) {
      this.showAlert('Please fill in all fields', 'error');
      return;
    }

    if (username.length < 3) {
      this.showAlert('Username must be at least 3 characters', 'error');
      return;
    }

    if (password.length < 6) {
      this.showAlert('Password must be at least 6 characters', 'error');
      return;
    }

    // Show loading state
    this.setLoadingState(true);

    // Simulate API call
    try {
      const result = await this.authenticateUser(username, password);
      
      if (result.success) {
        this.handleSuccessfulLogin(result.user);
      } else {
        this.showAlert(result.message, 'error');
        this.setLoadingState(false);
      }
    } catch (error) {
      this.showAlert('An error occurred. Please try again.', 'error');
      this.setLoadingState(false);
    }
  }

  // Authenticate User (Mock API)
  authenticateUser(username, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Demo credentials
        const validUsers = [
          { username: 'admin', password: 'admin123', email: 'admin@asi.com', fullName: 'Admin User' },
          { username: 'user', password: 'user123', email: 'user@asi.com', fullName: 'Regular User' },
          { username: 'demo', password: 'demo123', email: 'demo@asi.com', fullName: 'Demo User' },
          { username: '005753', password: '005753', email: '005753@asi.com', fullName: '00573 User' },
          ...registeredUsers
        ];

        const user = validUsers.find(u => 
          (u.username === username || u.email === username) && u.password === password
        );

        if (user) {
          resolve({
            success: true,
            user: {
              username: user.username,
              email: user.email,
              fullName: user.fullName
            }
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid username or password'
          });
        }
      }, 1500);
    });
  }

  // Handle Successful Login
  handleSuccessfulLogin(user) {
    // Save user data
    this.saveUserSession(user);
    
    // Handle remember me
    if (this.rememberCheckbox.checked) {
      localStorage.setItem('rememberedUsername', user.username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    // Show success message
    this.showAlert('Login successful! Redirecting...', 'success');
    
    // Show user info briefly
    this.showUserInfo(user);
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }

  // Save User Session
  saveUserSession(user) {
    const sessionData = {
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
    localStorage.setItem('isLoggedIn', 'true');
  }

  // Load Remembered User
  loadRememberedUser() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    
    if (rememberedUsername) {
      this.usernameInput.value = rememberedUsername;
      this.rememberCheckbox.checked = true;
    }
  }

  // Show Alert Message
  showAlert(message, type) {
    this.alertBox.textContent = message;
    this.alertBox.className = `alert-message alert-${type}`;
    this.alertBox.style.display = 'block';
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      this.alertBox.style.display = 'none';
    }, 4000);
  }

  // Show User Info Box
  showUserInfo(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    
    userName.textContent = user.fullName || user.username;
    userEmail.textContent = user.email;
    userAvatar.textContent = (user.fullName || user.username).charAt(0).toUpperCase();
    
    this.userInfoBox.classList.add('show');
  }

  // Set Loading State
  setLoadingState(isLoading) {
    const submitBtn = this.form.querySelector('.btn-login');
    
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      submitBtn.style.opacity = '0.7';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      submitBtn.style.opacity = '1';
    }
  }

  // Initialize Animations
  initializeAnimations() {
    // Add focus animations
    const inputs = [this.usernameInput, this.passwordInput];
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
        input.parentElement.style.transition = 'transform 0.2s ease';
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
      });
    });
  }
}

// ==========================================
// REGISTRATION SYSTEM
// ==========================================

class RegisterSystem {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  // Initialize DOM Elements
  initializeElements() {
    this.form = document.getElementById('registerForm');
    this.fullNameInput = document.getElementById('fullName');
    this.usernameInput = document.getElementById('regUsername');
    this.emailInput = document.getElementById('regEmail');
    this.passwordInput = document.getElementById('regPassword');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.togglePassword = document.getElementById('toggleRegPassword');
    this.toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    this.termsCheckbox = document.getElementById('acceptTerms');
    this.alertBox = document.getElementById('regAlertMessage');
    this.strengthBar = document.getElementById('strengthBar');
    this.strengthText = document.getElementById('strengthText');
  }

  // Attach Event Listeners
  attachEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleRegister(e));

    // Password toggles
    this.togglePassword.addEventListener('click', () => 
      this.togglePasswordVisibility(this.passwordInput, this.togglePassword)
    );
    this.toggleConfirmPassword.addEventListener('click', () => 
      this.togglePasswordVisibility(this.confirmPasswordInput, this.toggleConfirmPassword)
    );

    // Real-time validation
    this.fullNameInput.addEventListener('input', () => this.validateFullName());
    this.usernameInput.addEventListener('input', () => this.validateUsername());
    this.emailInput.addEventListener('input', () => this.validateEmail());
    this.passwordInput.addEventListener('input', () => {
      this.validatePassword();
      this.checkPasswordStrength();
    });
    this.confirmPasswordInput.addEventListener('input', () => this.validateConfirmPassword());
  }

  // Toggle Password Visibility
  togglePasswordVisibility(input, icon) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  }

  // Validate Full Name
  validateFullName() {
    const fullName = this.fullNameInput.value.trim();
    
    if (fullName.length > 0 && fullName.length < 3) {
      this.setInputState(this.fullNameInput, 'invalid');
      return false;
    } else if (fullName.length >= 3) {
      this.setInputState(this.fullNameInput, 'valid');
      return true;
    }
    
    this.setInputState(this.fullNameInput, 'neutral');
    return false;
  }

  // Validate Username
  validateUsername() {
    const username = this.usernameInput.value.trim();
    
    if (username.length > 0 && username.length < 3) {
      this.setInputState(this.usernameInput, 'invalid');
      return false;
    } else if (username.length >= 3) {
      // Check if username already exists
      if (this.checkUsernameExists(username)) {
        this.setInputState(this.usernameInput, 'invalid');
        return false;
      }
      this.setInputState(this.usernameInput, 'valid');
      return true;
    }
    
    this.setInputState(this.usernameInput, 'neutral');
    return false;
  }

  // Check if username exists
  checkUsernameExists(username) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const defaultUsers = ['admin', 'user', 'demo','005753'];
    
    return defaultUsers.includes(username.toLowerCase()) || 
           registeredUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
  }

  // Validate Email
  validateEmail() {
    const email = this.emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length > 0 && !emailRegex.test(email)) {
      this.setInputState(this.emailInput, 'invalid');
      return false;
    } else if (emailRegex.test(email)) {
      // Check if email already exists
      if (this.checkEmailExists(email)) {
        this.setInputState(this.emailInput, 'invalid');
        return false;
      }
      this.setInputState(this.emailInput, 'valid');
      return true;
    }
    
    this.setInputState(this.emailInput, 'neutral');
    return false;
  }

  // Check if email exists
  checkEmailExists(email) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const defaultEmails = ['admin@asi.com', 'user@asi.com', 'demo@asi.com','005753@asi.com'];
    
    return defaultEmails.includes(email.toLowerCase()) || 
           registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Validate Password
  validatePassword() {
    const password = this.passwordInput.value;
    
    if (password.length > 0 && password.length < 6) {
      this.setInputState(this.passwordInput, 'invalid');
      return false;
    } else if (password.length >= 6) {
      this.setInputState(this.passwordInput, 'valid');
      return true;
    }
    
    this.setInputState(this.passwordInput, 'neutral');
    return false;
  }

  // Check Password Strength
  checkPasswordStrength() {
    const password = this.passwordInput.value;
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const strengthLevels = [
      { text: 'Very Weak', color: '#ef4444', width: '20%' },
      { text: 'Weak', color: '#f97316', width: '40%' },
      { text: 'Fair', color: '#eab308', width: '60%' },
      { text: 'Good', color: '#22c55e', width: '80%' },
      { text: 'Strong', color: '#10b981', width: '100%' }
    ];
    
    const level = strengthLevels[strength] || strengthLevels[0];
    
    this.strengthBar.style.width = level.width;
    this.strengthBar.style.backgroundColor = level.color;
    this.strengthText.textContent = level.text;
    this.strengthText.style.color = level.color;
  }

  // Validate Confirm Password
  validateConfirmPassword() {
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    
    if (confirmPassword.length > 0 && confirmPassword !== password) {
      this.setInputState(this.confirmPasswordInput, 'invalid');
      return false;
    } else if (confirmPassword === password && confirmPassword.length > 0) {
      this.setInputState(this.confirmPasswordInput, 'valid');
      return true;
    }
    
    this.setInputState(this.confirmPasswordInput, 'neutral');
    return false;
  }

  // Set Input State
  setInputState(input, state) {
    input.classList.remove('is-valid', 'is-invalid');
    
    if (state === 'valid') {
      input.style.borderColor = '#10b981';
    } else if (state === 'invalid') {
      input.style.borderColor = '#ef4444';
    } else {
      input.style.borderColor = '#e5e7eb';
    }
  }

  // Handle Registration
  async handleRegister(e) {
    e.preventDefault();
    
    const fullName = this.fullNameInput.value.trim();
    const username = this.usernameInput.value.trim();
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    
    // Validate all fields
    if (!fullName || !username || !email || !password || !confirmPassword) {
      this.showAlert('Please fill in all fields', 'error');
      return;
    }

    if (fullName.length < 3) {
      this.showAlert('Full name must be at least 3 characters', 'error');
      return;
    }

    if (username.length < 3) {
      this.showAlert('Username must be at least 3 characters', 'error');
      return;
    }

    if (this.checkUsernameExists(username)) {
      this.showAlert('Username already exists', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showAlert('Please enter a valid email address', 'error');
      return;
    }

    if (this.checkEmailExists(email)) {
      this.showAlert('Email already registered', 'error');
      return;
    }

    if (password.length < 6) {
      this.showAlert('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showAlert('Passwords do not match', 'error');
      return;
    }

    if (!this.termsCheckbox.checked) {
      this.showAlert('Please accept the terms and conditions', 'error');
      return;
    }

    // Show loading state
    this.setLoadingState(true);

    // Register user
    try {
      const result = await this.registerUser({ fullName, username, email, password });
      
      if (result.success) {
        this.handleSuccessfulRegistration();
      } else {
        this.showAlert(result.message, 'error');
        this.setLoadingState(false);
      }
    } catch (error) {
      this.showAlert('An error occurred. Please try again.', 'error');
      this.setLoadingState(false);
    }
  }

  // Register User
  registerUser(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get existing users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Add new user
        registeredUsers.push({
          fullName: userData.fullName,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          registeredAt: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        resolve({ success: true });
      }, 1500);
    });
  }

  // Handle Successful Registration
  handleSuccessfulRegistration() {
    this.showAlert('Registration successful! Redirecting to login...', 'success');
    
    setTimeout(() => {
      window.location.href = 'LOGININDEX888';
    }, 2000);
  }

  // Show Alert Message
  showAlert(message, type) {
    this.alertBox.textContent = message;
    this.alertBox.className = `alert-message alert-${type}`;
    this.alertBox.style.display = 'block';
    
    setTimeout(() => {
      this.alertBox.style.display = 'none';
    }, 4000);
  }

  // Set Loading State
  setLoadingState(isLoading) {
    const submitBtn = this.form.querySelector('.btn-register');
    
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      submitBtn.style.opacity = '0.7';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      submitBtn.style.opacity = '1';
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Close User Info Box
function closeUserInfo() {
  const userInfoBox = document.getElementById('userInfoBox');
  if (userInfoBox) userInfoBox.classList.remove('show');
}

// Check if user is already logged in
function checkExistingSession() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  if (isLoggedIn === 'False') {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (currentUser) {
      window.location.href = 'login.html';
    }
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem('currentUser');
  localStorage.setItem('isLoggedIn', 'false');
  window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

// ==========================================
// INITIALIZE ON PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on
  const isLoginPage = document.getElementById('loginForm') !== null;
  const isRegisterPage = document.getElementById('registerForm') !== null;
  
  if (isLoginPage) {
    checkExistingSession();
    const loginSystem = new LoginSystem();
  } else if (isRegisterPage) {
    const registerSystem = new RegisterSystem();
  }
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const alertBox = document.getElementById('alertMessage') || document.getElementById('regAlertMessage');
      if (alertBox) alertBox.style.display = 'none';
      closeUserInfo();
    }
  });
  
  document.documentElement.style.scrollBehavior = 'smooth';
});

// ==========================================
// EXPORT FOR MODULE USE (Optional)
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LoginSystem,
    RegisterSystem,
    logout,
    getCurrentUser,
    closeUserInfo
  };
}
