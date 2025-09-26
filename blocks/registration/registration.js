export default function decorate(block) {
    const fields = [];

    const rows = block.querySelectorAll('.registration > div');

    function isAlwaysRequired(label) {
        const alwaysRequired = ['First Name', 'Last Name', 'Email', 'Company Name', 'Website', 'Brands We Carry/Represent'];
        return alwaysRequired.some(req => label.toLowerCase() === req.toLowerCase());
    }

    rows.forEach((row, index) => {
        if (index === 0) return; // skip header

        const parts = row.querySelectorAll('p');
        if (parts.length >= 3) {
            const label = parts[0].textContent.trim();
            const errorMsg = parts[1].textContent.trim();
            const type = parts[2].textContent.trim().toLowerCase();
            const options = parts[3] ? parts[3].textContent.trim() : '';

            const required = isAlwaysRequired(label) || (parts[4] && parts[4].textContent.trim().toLowerCase() === 'true');

            fields.push({
                label,
                error: errorMsg,
                type,
                options,
                required,
                id: `field-${index}`,
            });
        }
    });

    block.innerHTML = '';
    const form = document.createElement('form');
    form.classList.add('registration-form');

    fields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('form-group');
        wrapper.dataset.fieldLabel = field.label;

        // Textbox
        if (field.type === 'textbox') {
            const input = document.createElement('input');
            input.type = getInputType(field.label);
            input.id = field.id;
            input.name = field.label.toLowerCase().replace(/\s+/g, '-');
            input.placeholder = field.required ? `${field.label} *` : field.label;
            if (field.required) {
                input.classList.add('required-field');
                input.dataset.errorId = `${field.id}-error`;
            }
            wrapper.appendChild(input);
            if (field.required) {
                const error = document.createElement('div');
                error.classList.add('error-msg');
                error.id = `${field.id}-error`;
                error.textContent = field.error;
                wrapper.appendChild(error);
            }

        } 
        // Radio
        else if (field.type === 'radio') {
            const labelDiv = document.createElement('div');
            labelDiv.classList.add('radio-label');
            labelDiv.textContent = field.label;

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

                // Default selection
                if (opt.toLowerCase() === 'retailer/partner') input.checked = true;

                const lbl = document.createElement('label');
                lbl.setAttribute('for', radioId);
                lbl.textContent = opt;

                radioWrapper.appendChild(input);
                radioWrapper.appendChild(lbl);
                optionsWrapper.appendChild(radioWrapper);
            });

            wrapper.appendChild(labelDiv);
            wrapper.appendChild(optionsWrapper);

            if (field.required) {
                const error = document.createElement('div');
                error.classList.add('error-msg');
                error.id = `${field.id}-error`;
                error.textContent = field.error;
                wrapper.appendChild(error);
            }

            // Conditional logic for Account Type
            optionsWrapper.addEventListener('change', () => {
                const selected = form.querySelector(`input[name="${optionsWrapper.querySelector('input').name}"]:checked`).value.toLowerCase();

                form.querySelectorAll('.form-group').forEach(fg => {
                    const label = fg.dataset.fieldLabel ? fg.dataset.fieldLabel.toLowerCase() : '';
                    const hasRadio = fg.querySelector('input[type="radio"]');

                    if (selected === 'agency/vendor partner') {
                        // Hide only Sales Representative Name
                        if (label.includes('sales representative name')) {
                            fg.style.display = 'none';
                        } else {
                            fg.style.display = '';
                        }
                    } else if (selected === 'employee') {
                        // Keep visible: First Name, Last Name, Email, logo, headings, submit button, Account Type radio
                        const keepVisibleLabels = ['first name','last name','email'];
                        if (
                            keepVisibleLabels.includes(label) || 
                            fg.querySelector('img') || 
                            fg.querySelector('button') || 
                            fg.querySelector('p.intro-text') || 
                            hasRadio
                        ) {
                            fg.style.display = '';
                        } else {
                            fg.style.display = 'none';
                        }
                    } else { // Retailer/Partner
                        fg.style.display = '';
                    }
                });
            });
        } 
        // Textarea
        else if (field.type === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.id = field.id;
            textarea.name = field.label.toLowerCase().replace(/\s+/g, '-');
            textarea.placeholder = field.required ? `${field.label} *` : field.label;
            textarea.rows = 4;
            if (field.required) {
                textarea.classList.add('required-field');
                textarea.dataset.errorId = `${field.id}-error`;
            }
            wrapper.appendChild(textarea);
        } 
        // Image
        else if (field.type === 'image') {
            const img = document.createElement('img');
            img.src = field.options;
            img.alt = field.label;
            img.classList.add('form-logo');
            wrapper.appendChild(img);
        } 
        // Button
        else if (field.type === 'button') {
            const button = document.createElement('button');
            button.type = 'submit';
            button.classList.add('submit-btn');
            button.textContent = field.label || 'Submit';
            wrapper.appendChild(button);
        } 
        // Heading
        else if (field.type === 'heading') {
            const heading = document.createElement(field.options || 'h2');
            heading.textContent = field.label;
            wrapper.appendChild(heading);
        } 
        // Text
        else if (field.type === 'text') {
            const p = document.createElement(field.options || 'p');
            p.textContent = field.label;
            p.classList.add('intro-text');
            wrapper.appendChild(p);
        }

        form.appendChild(wrapper);
    });

    // Trigger default radio selection logic
    const defaultRadio = form.querySelector('input[type="radio"]:checked');
    if (defaultRadio) defaultRadio.dispatchEvent(new Event('change'));

    // Submit handler with validation only on visible required fields
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        const requiredFields = form.querySelectorAll('.required-field');

        form.querySelectorAll('.error-msg').forEach(error => error.style.display = 'none');

        requiredFields.forEach(field => {
            if (field.offsetParent === null) return; // skip hidden fields

            const errorMsg = document.getElementById(field.dataset.errorId);
            let valid = true;

            if (field.tagName === 'INPUT' && ['text','email','url','tel','password'].includes(field.type)) {
                if (field.value.trim() === '') valid = false;
            } else if (field.classList.contains('radio-group')) {
                const radioName = field.querySelector('input[type="radio"]').name;
                const checkedRadio = form.querySelector(`input[name="${radioName}"]:checked`);
                if (!checkedRadio) valid = false;
            }

            if (!valid) {
                isValid = false;
                if (errorMsg) errorMsg.style.display = 'block';
                field.classList.add('input-error');
            } else {
                field.classList.remove('input-error');
            }
        });

        if (isValid) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            console.log('Form submitted:', data);
            alert('Form submitted successfully!');
        }
    });

    block.appendChild(form);
}

function getInputType(label) {
    const l = label.toLowerCase();
    if (l.includes('email')) return 'email';
    if (l.includes('password')) return 'password';
    if (l.includes('phone')) return 'tel';
    if (l.includes('website') || l.includes('url')) return 'url';
    return 'text';
}
