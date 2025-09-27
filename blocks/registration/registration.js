export default function decorate(block) {
    const fields = [];

    const rows = block.querySelectorAll('.registration > div');

    // ------------------------
    // Helpers
    // ------------------------

    function isAlwaysRequired(label) {
        const alwaysRequired = [
            'First Name',
            'Last Name',
            'Email',
            'Company Name',
            'Website',
            'Brands We Carry/Represent'
        ];
        return alwaysRequired.some(req => label.toLowerCase() === req.toLowerCase());
    }

    function cleanRowText(row) {
        let rowText = row.textContent.split("\n").map(c => c.trim());

        // remove leading/trailing empty
        while (rowText.length && rowText[0] === "") rowText.shift();
        while (rowText.length && rowText[rowText.length - 1] === "") rowText.pop();

        // ensure 5 columns always
        while (rowText.length < 5) rowText.push("");
        return rowText;
    }

    function createErrorElement(field) {
        const error = document.createElement('div');
        error.classList.add('error-msg');
        error.id = `${field.id}-error`;
        error.textContent = field.error;
        return error;
    }

    function applyRequiredAttributes(el, field) {
        if (field.required) {
            el.classList.add('required-field');
            el.dataset.errorId = `${field.id}-error`;
        }
    }

    function getInputType(label) {
        const l = label.toLowerCase();
        if (l.includes('email')) return 'email';
        if (l.includes('password')) return 'password';
        if (l.includes('phone')) return 'tel';
        if (l.includes('website') || l.includes('url')) return 'url';
        return 'text';
    }

    // ------------------------
    // Parse rows into fields[]
    // ------------------------
    rows.forEach((row, index) => {
        if (index === 0) return; // skip header

        const [label, errorMsg, type, options, requiredRaw] = cleanRowText(row);

        fields.push({
            label,
            error: errorMsg,
            type: type.toLowerCase(),
            options,
            required: requiredRaw.toLowerCase() === "true",
            id: `field-${index}`,
        });
    });

    // ------------------------
    // Render form
    // ------------------------
    block.innerHTML = '';
    const form = document.createElement('form');
    form.classList.add('registration-form');

    fields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('form-group');
        wrapper.dataset.fieldLabel = field.label;

        let element;

        switch (field.type) {
            case 'textbox':
                element = document.createElement('input');
                element.type = getInputType(field.label);
                element.placeholder = field.required ? `${field.label} *` : field.label;
                break;

            case 'textarea':
                element = document.createElement('textarea');
                element.rows = 4;
                element.placeholder = field.required ? `${field.label} *` : field.label;
                break;

            case 'radio': {
                const labelDiv = document.createElement('div');
                labelDiv.classList.add('radio-label');
                labelDiv.textContent = field.label;

                const optionsWrapper = document.createElement('div');
                optionsWrapper.classList.add('radio-group');
                applyRequiredAttributes(optionsWrapper, field);

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

                if (field.required) wrapper.appendChild(createErrorElement(field));
                form.appendChild(wrapper);

                // 🔹 Restore conditional field visibility logic
                optionsWrapper.addEventListener('change', () => {
                    const selected = form.querySelector(
                        `input[name="${optionsWrapper.querySelector('input').name}"]:checked`
                    ).value.toLowerCase();

                    form.querySelectorAll('.form-group').forEach(fg => {
                        const label = fg.dataset.fieldLabel ? fg.dataset.fieldLabel.toLowerCase() : '';
                        const hasRadio = fg.querySelector('input[type="radio"]');

                        if (selected === 'agency/vendor partner') {
                            if (label.includes('sales representative name')) {
                                fg.style.display = 'none';
                            } else {
                                fg.style.display = '';
                            }
                        } else if (selected === 'employee') {
                            const keepVisibleLabels = ['first name', 'last name', 'email'];
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
                        } else {
                            fg.style.display = '';
                        }
                    });
                });

                return; // ✅ don't forget this!
            }

            case 'image':
                element = document.createElement('img');
                element.src = field.options;
                element.alt = field.label;
                element.classList.add('form-logo');
                wrapper.appendChild(element);
                form.appendChild(wrapper);
                return;

            case 'button':
                element = document.createElement('button');
                element.type = 'submit';
                element.classList.add('submit-btn');
                element.textContent = field.label || 'Submit';
                wrapper.appendChild(element);
                form.appendChild(wrapper);
                return;

            case 'heading':
                element = document.createElement(field.options || 'h2');
                element.textContent = field.label;
                wrapper.appendChild(element);
                form.appendChild(wrapper);
                return;

            case 'text':
                element = document.createElement(field.options || 'p');
                element.textContent = field.label;
                element.classList.add('intro-text');
                wrapper.appendChild(element);
                form.appendChild(wrapper);
                return;
        }

        // Shared for textbox + textarea
        if (element) {
            element.id = field.id;
            element.name = field.label.toLowerCase().replace(/\s+/g, '-');
            applyRequiredAttributes(element, field);
            wrapper.appendChild(element);

            if (field.required) wrapper.appendChild(createErrorElement(field));
        }

        form.appendChild(wrapper);
    });

    // Trigger default radio logic
    const defaultRadio = form.querySelector('input[type="radio"]:checked');
    if (defaultRadio) defaultRadio.dispatchEvent(new Event('change'));

    // ------------------------
    // Validation
    // ------------------------
    const validators = {
        INPUT: (field) => {
            if (['text', 'email', 'url', 'tel', 'password'].includes(field.type)) {
                return field.value.trim() !== '';
            }
            return true;
        },
        TEXTAREA: (field) => field.value.trim() !== '',
        RADIO: (field) => {
            const radioName = field.querySelector('input[type="radio"]').name;
            const checkedRadio = form.querySelector(`input[name="${radioName}"]:checked`);
            return !!checkedRadio;
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Hide all errors before validation
        form.querySelectorAll('.error-msg').forEach(error => error.style.display = 'none');

        const requiredFields = form.querySelectorAll('.required-field');
        requiredFields.forEach(field => {
            if (field.offsetParent === null) return; // skip hidden

            const errorMsg = document.getElementById(field.dataset.errorId);
            let valid = true;

            if (field.tagName === 'INPUT') {
                valid = validators.INPUT(field);
            } else if (field.tagName === 'TEXTAREA') {
                valid = validators.TEXTAREA(field);
            } else if (field.classList.contains('radio-group')) {
                valid = validators.RADIO(field);
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
