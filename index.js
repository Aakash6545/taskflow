document.addEventListener("DOMContentLoaded", function () {
  checkExistingUser();

  const form = document.getElementById("verificationForm");
  const nameInput = document.getElementById("fullName");
  const dobInput = document.getElementById("dateOfBirth");
  const nameError = document.getElementById("nameError");
  const dobError = document.getElementById("dobError");
  const loadingState = document.getElementById("loadingState");

  form.addEventListener("submit", handleFormSubmit);

  nameInput.addEventListener("blur", validateName);
  nameInput.addEventListener("input", clearNameError);
  dobInput.addEventListener("change", validateAge);

  function checkExistingUser() {
    try {
      const userData = localStorage.getItem("taskflowUser");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.name && user.dateOfBirth && isValidAge(user.dateOfBirth)) {
          showLoadingMessage("Welcome back! Redirecting...");
          setTimeout(() => {
            window.location.href = "app.html";
          }, 1000);
        }
      }
    } catch (error) {
      console.warn("Error checking existing user data:", error);
      localStorage.removeItem("taskflowUser");
    }
  }
  function formatName(rawName) {
    return rawName
      .trim()
      .split(/\s+/) 
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + 
          word.slice(1).toLowerCase() 
      )
      .join(" ");
  }
  function handleFormSubmit(e) {
    e.preventDefault();

   
    clearAllErrors();

    const name = nameInput.value.trim();
    const dob = dobInput.value;

    
    let isValid = true;

    if (!validateName()) {
      isValid = false;
    }

    if (!validateAge()) {
      isValid = false;
    }

    if (isValid) {
      
      showLoadingState();

      
      const rawName = nameInput.value;      
      const formattedName = formatName(rawName);
      const userData = {
        name: formattedName,
        dateOfBirth: dob,
        registrationDate: new Date().toISOString(),
      };

      try {
        localStorage.setItem("taskflowUser", JSON.stringify(userData));

        
        setTimeout(() => {
          window.location.href = "app.html";
        }, 1500);
      } catch (error) {
        hideLoadingState();
        showError(dobError, "Failed to save user data. Please try again.");
      }
    }
  }

  function validateName() {
    const name = nameInput.value.trim();

    if (!name) {
      showError(nameError, "Please enter your full name");
      return false;
    }

    if (name.length < 2) {
      showError(nameError, "Name must be at least 2 characters long");
      return false;
    }

    
    if (!/[a-zA-Z]/.test(name)) {
      showError(nameError, "Name must contain at least one letter");
      return false;
    }

    clearError(nameError);
    return true;
  }

  function validateAge() {
    const dob = dobInput.value;

    if (!dob) {
      showError(dobError, "Please select your date of birth");
      return false;
    }

    if (!isValidAge(dob)) {
      showError(dobError, "You must be over 10 years old to use TaskFlow");
      return false;
    }

    clearError(dobError);
    return true;
  }

  function isValidAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    
    if (isNaN(birthDate.getTime())) {
      return false;
    }

    if (birthDate > today) {
      return false;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age > 10;
  }

  function showError(errorElement, message) {
    const span = errorElement.querySelector("span");
    span.textContent = message;
    errorElement.classList.remove("hidden");

    const input = errorElement.previousElementSibling;
    input.classList.add("animate-pulse");
    setTimeout(() => {
      input.classList.remove("animate-pulse");
    }, 1000);
  }

  function clearError(errorElement) {
    errorElement.classList.add("hidden");
  }

  function clearNameError() {
    if (nameInput.value.trim()) {
      clearError(nameError);
    }
  }

  function clearAllErrors() {
    clearError(nameError);
    clearError(dobError);
  }

  function showLoadingState() {
    loadingState.classList.remove("hidden");
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add("opacity-50", "cursor-not-allowed");
  }

  function hideLoadingState() {
    loadingState.classList.add("hidden");
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    submitButton.classList.remove("opacity-50", "cursor-not-allowed");
  }

  function showLoadingMessage(message) {
    const loadingElement = document.getElementById("loadingState");
    loadingElement.querySelector("div").innerHTML = `
            <i class="fas fa-spinner fa-spin mr-2"></i>
            ${message}
        `;
    loadingElement.classList.remove("hidden");
  }

  // Adding some keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Enter key to submit form
    if (
      e.key === "Enter" &&
      (e.target === nameInput || e.target === dobInput)
    ) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }

    // Escape key to clear form
    if (e.key === "Escape") {
      nameInput.value = "";
      dobInput.value = "";
      clearAllErrors();
    }
  });

  // Add focus management for better accessibility
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Tab" || e.key === "Enter") {
      if (nameInput.value.trim()) {
        dobInput.focus();
      }
    }
  });
});
