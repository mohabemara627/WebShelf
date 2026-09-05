// ==================================================
// SUGGEST FORM
// ==================================================

const suggestForm =
  document.querySelector("#suggest-form");

const formMessage =
  document.querySelector("#form-message");

const submitButton =
  document.querySelector("#suggest-submit");

const categorySelect =
  document.querySelector("#site-category");


// Keep the dropdown synced with data.js automatically.
if (
  categorySelect &&
  Array.isArray(WebShelfCategories)
) {

  categorySelect.innerHTML = `
    <option value="">
      Select a category
    </option>
  `;

  WebShelfCategories.forEach(
    (category) => {

      const option =
        document.createElement("option");

      option.value = category.key;
      option.textContent =
        category.title;

      categorySelect.appendChild(option);

    }
  );

}


WebShelfRuntime.bindForm(suggestForm, formMessage, submitButton, {
  sending: 'Sending suggestion...', success: 'Suggestion sent successfully.', failure: 'Unable to send suggestion right now.'
});
