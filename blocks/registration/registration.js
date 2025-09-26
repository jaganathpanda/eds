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
        // Input only, placeholder contains label
        const input = document.createElement('input');
        input.type = getInputType(field.label);
        input.id = field.id;
        input.name = field.label.toLowerCase().replace(/\s+/g, '-');
        input.placeholder = field.required ? `${field.label} *` : field.label;
  
        if (field.required) {
          input.setAttribute('required', true);
        }
  
        wrapper.appendChild(input);
  
        if (field.required) {
          const error = document.createElement('div');
          error.classList.add('error-msg');
          error.textContent = field.error;
          wrapper.appendChild(error);
        }
  
      } else if (field.type === 'radio') {
        // Show a label for radio group
        const label = document.createElement('div');
        label.classList.add('radio-label');
        label.textContent = field.label;
  
        const optionsWrapper = document.createElement('div');
        optionsWrapper.classList.add('radio-group');
  
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
  
          if (field.required) {
            input.setAttribute('required', true);
          }
  
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
          error.textContent = field.error;
          wrapper.appendChild(error);
        }
  
      } else if (field.type === 'image') {
        // Image field
        const img = document.createElement('img');
        img.src = field.options;
        img.alt = field.label;
        img.classList.add('form-logo');
        wrapper.appendChild(img);
      }
  
      form.appendChild(wrapper);
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
  