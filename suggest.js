// ==================================================
// SUGGEST FORM
// ==================================================

const suggestForm =
  document.querySelector("#suggest-form");

const formMessage =
  document.querySelector("#form-message");

const submitButton =
  document.querySelector("#suggest-submit");


if (
  suggestForm &&
  formMessage &&
  submitButton
) {

  suggestForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // Loading state

      formMessage.textContent =
        "Sending suggestion...";

      submitButton.disabled = true;
      submitButton.textContent = "Sending...";


      const formData =
        new FormData(suggestForm);


      try {

        const response =
          await fetch(
            suggestForm.action,
            {
              method: "POST",
              body: formData,
              headers: {
                Accept: "application/json"
              }
            }
          );


        if (response.ok) {

          formMessage.textContent =
            "Suggestion sent successfully.";

          suggestForm.reset();

        } else {

          formMessage.textContent =
            "Something went wrong. Please try again.";

        }

      } catch (error) {

        console.error(
          "WebShelf Suggest Error:",
          error
        );

        formMessage.textContent =
          "Unable to send suggestion right now.";

      } finally {

        submitButton.disabled = false;
        submitButton.textContent =
          "Submit suggestion";

      }

    }
  );

}