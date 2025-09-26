export default function decorate(block) {
    const fields = [];
  
    // Parse Google Doc structure (each row = label, error, icon)
    block.querySelectorAll('.registration-field > div').forEach((fieldDiv) => {
      const parts = fieldDiv.querySelectorAll('p');
      if (parts.length >= 2) {
        fields.push({
          label: parts[0].textContent.trim(),
          error: parts[1].textContent.trim(),
          icon: parts[2] ? parts[2].textContent.trim() : '', // optional
        });
      }
    });
  
    // Clear original content
    block.innerHTML = '';
  
    // Create form wrapper
    const form = document.createElement('form');
    form.classList.add('registration-form');
  
    fields.forEach((field) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('registration-group');
  
      // Label
      const label = document.createElement('label');
      label.textContent = field.label;
  
      // Input
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = field.label;
  
      // Error
      const error = document.createElement('span');
      error.classList.add('registration-error');
      error.textContent = field.error;
  
      // Icon (optional)
      if (field.icon) {
        const icon = document.createElement('span');
        icon.classList.add('registration-icon');
        icon.textContent = field.icon;
        wrapper.appendChild(icon);
      }
  
      wrapper.appendChild(label);
      wrapper.appendChild(input);
      wrapper.appendChild(error);
      form.appendChild(wrapper);
    });
  
    block.appendChild(form);
  }
  