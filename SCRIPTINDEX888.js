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
      window.location.href = 'home.html';
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
    const defaultUsers = ['admin', 'user', 'demo'];
    
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
    const defaultEmails = ['admin@asi.com', 'user@asi.com', 'demo@asi.com'];
    
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
  
  if (isLoggedIn === 'false') {
    const currentUser = sessionStorage.getItem('currentUser');
    
    if (currentUser) {
      window.location.href = 'index.html';
    }
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem('currentUser');
  localStorage.setItem('isLoggedIn', 'false');
  window.location.href = 'index.html';
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
// ACTIVE USERS DISPLAY SYSTEM
// ==========================================

class ActiveUsersManager {
  constructor() {
    this.activeUsers = [];
    this.avatarColors = ['bg-blue', 'bg-green', 'bg-red', 'bg-purple', 'bg-orange', 'bg-pink'];
    this.OFFLINE_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.init();
  }

  // Initialize the system
  init() {
    this.trackUserActivity();
    this.loadAllUsers();
    this.displayUsers();
    
    // Auto-refresh every 30 seconds to update status
    setInterval(() => {
      this.refreshUsers();
    }, 30000);
    
    // Update last active time every minute
    setInterval(() => {
      this.updateLastActiveTime();
    }, 60000);
  }

  // Track user activity
  trackUserActivity() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    // Update last active time on user interaction
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateUserActivity(currentUser.username);
      }, { passive: true });
    });

    // Initialize last active time
    this.updateUserActivity(currentUser.username);
  }

  // Update user activity timestamp
  updateUserActivity(username) {
    const activityData = JSON.parse(localStorage.getItem('userActivity') || '{}');
    activityData[username] = new Date().toISOString();
    localStorage.setItem('userActivity', JSON.stringify(activityData));
  }

  // Update last active time periodically
  updateLastActiveTime() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.updateUserActivity(currentUser.username);
    }
  }

  // Get user last active time
  getUserLastActive(username) {
    const activityData = JSON.parse(localStorage.getItem('userActivity') || '{}');
    return activityData[username] || null;
  }

  // Check if user is offline (inactive > 10 minutes)
  isUserOffline(username) {
    const lastActive = this.getUserLastActive(username);
    if (!lastActive) return true;

    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now - lastActiveDate;

    return diffMs > this.OFFLINE_THRESHOLD;
  }

  // Load ALL users with status check
  loadAllUsers() {
    this.activeUsers = [];
    
    // Default users
    const defaultUsers = [
      { 
        username: 'admin', 
        email: 'admin@asi.com', 
        fullName: 'Admin User',
        loginTime: new Date(Date.now() - 1800000).toISOString()
      },
      { 
        username: 'user', 
        email: 'user@asi.com', 
        fullName: 'Regular User',
        loginTime: new Date(Date.now() - 3600000).toISOString()
      },
      { 
        username: 'demo', 
        email: 'demo@asi.com', 
        fullName: 'Demo User',
        loginTime: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    // Get all registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Add login time to registered users
    const registeredWithTime = registeredUsers.map(user => ({
      ...user,
      loginTime: user.registeredAt || new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));

    // Get current logged-in user
    const currentUser = this.getCurrentUser();

    // Combine all users
    let allUsers = [...defaultUsers, ...registeredWithTime];

    // Mark current user and move to top
    if (currentUser) {
      // Remove current user from list if exists
      allUsers = allUsers.filter(user => user.username !== currentUser.username);
      
      // Check if current user is offline
      const isOffline = this.isUserOffline(currentUser.username);
      
      // Add current user at the beginning
      this.activeUsers.push({
        ...currentUser,
        status: isOffline ? 'offline' : 'online',
        isCurrentUser: true,
        lastActive: this.getUserLastActive(currentUser.username) || new Date().toISOString()
      });
    }

    // Add all other users with status check
    allUsers.forEach(user => {
      const isOffline = this.isUserOffline(user.username);
      const lastActive = this.getUserLastActive(user.username);
      
      this.activeUsers.push({
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        status: isOffline ? 'offline' : 'online',
        loginTime: user.loginTime,
        lastActive: lastActive || user.loginTime,
        isCurrentUser: false
      });
    });

    // Sort: online users first, then offline
    this.activeUsers.sort((a, b) => {
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      if (a.status === 'online' && b.status === 'offline') return -1;
      if (a.status === 'offline' && b.status === 'online') return 1;
      return 0;
    });
  }

  // Get current logged-in user
  getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Display users in the grid
  displayUsers() {
    const usersGrid = document.getElementById('usersGrid');
    const usersCount = document.getElementById('usersCount');
    const noUsers = document.getElementById('noUsers');

    if (!usersGrid) return;

    // Count online users
    const onlineCount = this.activeUsers.filter(u => u.status === 'online').length;
    const offlineCount = this.activeUsers.filter(u => u.status === 'offline').length;

    // Update count
    usersCount.innerHTML = `
      <span style="color: #10b981;"><i class="fas fa-circle"></i> ${onlineCount}</span> | 
      <span style="color: #ef4444;"><i class="fas fa-circle"></i> ${offlineCount}</span>
    `;

    // Clear grid
    usersGrid.innerHTML = '';

    if (this.activeUsers.length === 0) {
      usersGrid.style.display = 'none';
      noUsers.style.display = 'block';
      return;
    }

    usersGrid.style.display = 'grid';
    noUsers.style.display = 'none';

    // Create user cards
    this.activeUsers.forEach((user, index) => {
      const userCard = this.createUserCard(user, index);
      usersGrid.appendChild(userCard);
    });
  }

  // Create user card element
  createUserCard(user, index) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.style.animation = 'fadeIn 0.5s ease';
    card.style.animationDelay = `${index * 0.05}s`;
    card.style.animationFillMode = 'both';

    const avatarColor = this.avatarColors[index % this.avatarColors.length];
    const initial = (user.fullName || user.username).charAt(0).toUpperCase();
    const timeAgo = this.getTimeAgo(user.lastActive);
    const isOnline = user.status === 'online';

    // Card styling based on status
    if (user.isCurrentUser) {
      card.style.background = isOnline 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      card.style.border = isOnline ? '2px solid #667eea' : '2px solid #6b7280';
    } else if (!isOnline) {
      card.style.opacity = '0.6';
      card.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
    }

    const textColor = user.isCurrentUser ? 'white' : '#333';
    const subTextColor = user.isCurrentUser ? 'rgba(255,255,255,0.9)' : '#666';
    const emailColor = user.isCurrentUser ? 'rgba(255,255,255,0.8)' : '#888';
    const timeColor = user.isCurrentUser ? 'rgba(255,255,255,0.7)' : '#999';

    card.innerHTML = `
      <div class="user-avatar ${isOnline ? 'online' : ''} ${avatarColor}">
        ${initial}
      </div>
      <div class="user-info">
        <div class="user-name" style="color: ${textColor};">
          ${this.escapeHtml(user.fullName || user.username)}
          ${user.isCurrentUser ? '<span class="status-badge"><i class="fas fa-user"></i> คุณ</span>' : ''}
          ${!isOnline ? '<span class="status-badge" style="background: #ef4444;"><i class="fas fa-circle"></i> Offline</span>' : ''}
        </div>
        <div class="user-username" style="color: ${subTextColor};">
          <i class="fas fa-at"></i> ${this.escapeHtml(user.username)}
        </div>
        <div class="user-email" style="color: ${emailColor};">
          <i class="fas fa-envelope"></i> ${this.escapeHtml(user.email)}
        </div>
        <div class="user-time" style="color: ${timeColor};">
          <i class="fas fa-clock"></i> ${isOnline ? 'ใช้งานล่าสุด' : 'ออฟไลน์'} ${timeAgo}
        </div>
      </div>
    `;

    return card;
  }

  // Calculate time ago
  getTimeAgo(dateString) {
    if (!dateString) return 'เมื่อสักครู่';

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    return `${diffDays} วันที่แล้ว`;
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Refresh users list
  refreshUsers() {
    this.loadAllUsers();
    this.displayUsers();
  }

  // Send login data to server (API call)
  async sendLoginData(userData) {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          loginTime: userData.loginTime,
          status: userData.status,
          lastActive: userData.lastActive,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send login data');
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error sending login data:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all active users data
  getActiveUsersData() {
    return {
      count: this.activeUsers.length,
      onlineCount: this.activeUsers.filter(u => u.status === 'online').length,
      offlineCount: this.activeUsers.filter(u => u.status === 'offline').length,
      users: this.activeUsers.map(user => ({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        loginTime: user.loginTime,
        lastActive: user.lastActive,
        status: user.status,
        isCurrentUser: user.isCurrentUser || false
      })),
      timestamp: new Date().toISOString()
    };
  }

  // Export active users data as JSON
  exportUsersData() {
    const data = this.getActiveUsersData();
    const jsonString = JSON.stringify(data, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `active-users-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Clear offline users (optional utility)
  clearOfflineUsers() {
    const activityData = JSON.parse(localStorage.getItem('userActivity') || '{}');
    const now = new Date();
    
    Object.keys(activityData).forEach(username => {
      const lastActive = new Date(activityData[username]);
      const diffMs = now - lastActive;
      
      // Remove users offline for more than 24 hours
      if (diffMs > 24 * 60 * 60 * 1000) {
        delete activityData[username];
      }
    });
    
    localStorage.setItem('userActivity', JSON.stringify(activityData));
  }
}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

let activeUsersManager;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  activeUsersManager = new ActiveUsersManager();
  
  // Add fadeIn animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
});

// Refresh active users (called by button)
function refreshActiveUsers() {
  const btn = document.querySelector('.refresh-btn');
  if (btn) {
    btn.classList.add('loading');
  }

  if (activeUsersManager) {
    activeUsersManager.refreshUsers();
  }

  setTimeout(() => {
    if (btn) {
      btn.classList.remove('loading');
    }
  }, 1000);
}

// Export users data
function exportActiveUsers() {
  if (activeUsersManager) {
    activeUsersManager.exportUsersData();
  }
}

// Send current user login data to server
async function sendCurrentUserLogin() {
  const currentUser = activeUsersManager?.getCurrentUser();
  
  if (!currentUser) {
    console.error('No user is currently logged in');
    return { success: false, error: 'No active user' };
  }

  if (activeUsersManager) {
    return await activeUsersManager.sendLoginData(currentUser);
  }
  
  return { success: false, error: 'Manager not initialized' };
}

// Get active users data
function getActiveUsers() {
  if (activeUsersManager) {
    return activeUsersManager.getActiveUsersData();
  }
  return { count: 0, users: [], timestamp: new Date().toISOString() };
}

// Clear old offline users
function clearOldOfflineUsers() {
  if (activeUsersManager) {
    activeUsersManager.clearOfflineUsers();
  }
}

// ในส่วนที่สร้าง userCard ให้เพิ่มปุ่มลบ
const deleteBtn = document.createElement('button');
deleteBtn.className = 'delete-btn';
deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteUser(user.id, user.fullname);
};
userCard.appendChild(deleteBtn);


async function deleteUser(userId, userName) {
    if (confirm(`คุณต้องการลบผู้ใช้ "${userName}" ออกจากระบบหรือไม่?`)) {
        try {
            // เรียก API เพื่อลบผู้ใช้
            const response = await fetch(`YOUR_API_ENDPOINT/delete-user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // เพิ่ม authorization header ถ้าจำเป็น
                }
            });

            if (response.ok) {
                alert('ลบผู้ใช้เรียบร้อยแล้ว');
                refreshActiveUsers(); // รีเฟรชรายการผู้ใช้
            } else {
                alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('ไม่สามารถลบผู้ใช้ได้');
        }
    }
}

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

