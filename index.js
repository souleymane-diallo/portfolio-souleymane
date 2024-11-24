document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact__form');
  const inputs = form.querySelectorAll('input, textarea');

  const AIRTABLE_API_KEY = "patLTUZsxLWiIcHta.28392729c46ef7f0cbcdfdad6ab6e2f574990159c3eaf9752cd92bf00f9992cb";
  const BASE_ID = "appJPJnHtBga6JB9B";
  const TABLE_NAME = "Contact";
  // function validation email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function showError(input, message) {
    const formGroup = input.parentElement;
    formGroup.classList.add('error');
    formGroup.classList.remove('valid');
    const errorMessage = formGroup.querySelector('.error-message');
    errorMessage.textContent = message;
  }

  function showValid(input) {
    const formGroup = input.parentElement;
    formGroup.classList.remove('error');
    formGroup.classList.add('valid');
  }

  function clearState(input) {
    const formGroup = input.parentElement;
    formGroup.classList.remove('error', 'valid');
  }

  inputs.forEach(input => {
    input.addEventListener('input', function() {
      validateInput(this);
    });

    input.addEventListener('blur', function() {
      validateInput(this);
    });
  });

  function validateInput(input) {
    if (input.value.trim() === '') {
      showError(input, 'Ce champ est requis!');
      return false;
    }

    if (input.type === 'email') {
      if (!isValidEmail(input.value.trim())) {
        showError(input, 'Email invalid');
        return false;
      }
    }

    showValid(input);
    return true;
  }

  // function for send data to Airtable
  async function sendToAirTable(formData) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const data = {
      records: [{
        fields: {
          Name: formData.get('name'),
          Email: formData.get('email'),
          Message: formData.get('message')
        }
      }]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const textResponse = await response.text();
        console.log("Reponse brute de airtable", textResponse);
        throw new Error(`Erreur lors de l'envoi à Airtable : ${textResponse}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = true;

    inputs.forEach(input => {
      if (!validateInput(input)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    const formData = new FormData(form);

    try {
      await sendToAirTable(formData);
      form.reset();
      inputs.forEach(input => clearState(input));
    } catch (error) {
      console.log("Une erreur est survenue. Veuillez réessayer.", error);
    }
  });
});

