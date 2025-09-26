export default function decorate(block) {
    const fields = [];
  
    // Collect rows from Google Doc authored block
    const rows = block.querySelectorAll('.registration > div');
  
    // Skip the first row (header row in Google Doc)
    rows.forEach((row, index) => {
      if (index === 0) return;
  
      const parts = row.querySelectorAll('p');
      if (parts.length >= 4) {
        fields.push({
          label: parts[0].textContent.trim(),
          error: parts[1].textContent.trim(),
          type: parts[2].textContent.trim().toLowerCase(),
          options: parts[3] ? parts[3].textContent.trim() : '',
          required: parts[4] ? parts[4].textContent.trim().toLowerCase() === 'true' : false,
          id: `field-${index}`,
        });
      }
    });
  
    // Reset block
    block.innerHTML = '';
  
    // Create <form>
    const form = document.createElement('form');
    form.classList.add('registration-form');
  
    fields.forEach((field) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('form-group');
  
      if (field.type === 'textbox') {
        // Text input with placeholder as label
        const input = document.createElement('input');
        input.type = getInputType(field.label);
        input.id = field.id;
        input.name = field.label.toLowerCase().replace(/\s+/g, '-');
        input.placeholder = field.required ? `${field.label} *` : field.label;
  
        if (field.required) {
          // input.setAttribute('required', true); // Using custom validation instead of HTML5 built-in
          input.classList.add('required-field');
          input.dataset.errorId = `${field.id}-error`;
        }
  
        wrapper.appendChild(input);
  
        if (field.required) {
          const error = document.createElement('div');
          error.classList.add('error-msg');
          error.id = `${field.id}-error`; // Add ID to link to the input
          error.textContent = field.error;
          wrapper.appendChild(error);
        }
  
      } else if (field.type === 'radio') {
        // Radio buttons
        const label = document.createElement('div');
        label.classList.add('radio-label');
        label.textContent = field.label;
  
        const optionsWrapper = document.createElement('div');
        optionsWrapper.classList.add('radio-group');
        
        if (field.required) {
            optionsWrapper.classList.add('required-field');
            optionsWrapper.dataset.errorId = `${field.id}-error`;
        }
  
        const options = field.options.split(',').map(opt => opt.trim());
        options.forEach((opt, i) => {
          const radioId = `${field.id}-${i}`;
          const radioWrapper = document.createElement('div');
          radioWrapper.classList.add('radio-option');
  
          const input = document.createElement('input');
          input.type = 'radio';
          input.id = radioId;
          input.name = field.label.toLowerCase().replace(/\s+/g, '-');
          input.value = opt;
          
          // No 'required' attribute here, validation is done on the group
  
          const lbl = document.createElement('label');
          lbl.setAttribute('for', radioId);
          lbl.textContent = opt;
  
          radioWrapper.appendChild(input);
          radioWrapper.appendChild(lbl);
          optionsWrapper.appendChild(radioWrapper);
        });
  
        wrapper.appendChild(label);
        wrapper.appendChild(optionsWrapper);
  
        if (field.required) {
          const error = document.createElement('div');
          error.classList.add('error-msg');
          error.id = `${field.id}-error`; // Add ID to link to the radio group
          error.textContent = field.error;
          wrapper.appendChild(error);
        }
  
      } else if (field.type === 'image') {
        // Image
        const img = document.createElement('img');
        img.src = field.options;
        img.alt = field.label;
        img.classList.add('form-logo');
        wrapper.appendChild(img);
  
      } else if (field.type === 'button') {
        // Submit button
        const button = document.createElement('button');
        button.type = 'submit';
        button.classList.add('submit-btn');
        button.textContent = field.label || 'Submit';
        wrapper.appendChild(button);
      }
  
      form.appendChild(wrapper);
    });
  
    // Handle form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const requiredFields = form.querySelectorAll('.required-field');
      
      // 1. Reset all error messages
      form.querySelectorAll('.error-msg').forEach(error => {
          error.style.display = 'none';
      });
      
      // 2. Iterate and validate required fields
      requiredFields.forEach(field => {
          const errorMsg = document.getElementById(field.dataset.errorId);
          let isFieldValid = true;
          
          if (field.tagName === 'INPUT' && (field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'tel' || field.type === 'password')) {
              // Textbox validation
              if (field.value.trim() === '') {
                  isFieldValid = false;
              }
          } else if (field.classList.contains('radio-group')) {
              // Radio button group validation
              const radioName = field.querySelector('input[type="radio"]').name;
              const checkedRadio = form.querySelector(`input[name="${radioName}"]:checked`);
              if (!checkedRadio) {
                  isFieldValid = false;
              }
          }
          
          if (!isFieldValid) {
              isValid = false;
              if (errorMsg) {
                  errorMsg.style.display = 'block'; // Show the error message
              }
              // Add a class to the input/wrapper to style the invalid state
              field.classList.add('input-error'); 
          } else {
              field.classList.remove('input-error');
          }
      });
      
      // 3. Submit if valid
      if (isValid) {
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
    
          console.log('Form submitted:', data);
    
          // Example: show an alert (replace with API call)
          alert('Form submitted successfully!');
          // form.submit(); // Uncomment this line if you need a standard form submission
      }
    });
  
    block.appendChild(form);
  }
  
  /**
   * Guess input type from label text
   */
  function getInputType(label) {
    const l = label.toLowerCase();
    if (l.includes('email')) return 'email';
    if (l.includes('password')) return 'password';
    if (l.includes('phone')) return 'tel';
    if (l.includes('website') || l.includes('url')) return 'url';
    return 'text';
  }