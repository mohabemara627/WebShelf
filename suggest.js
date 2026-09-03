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

      // Stop normal page refresh
      event.preventDefault();



      // ==================================================
      // LOADING STATE
      // ==================================================

      formMessage.textContent =
        "Sending suggestion...";

      submitButton.disabled = true;

      submitButton.textContent =
        "Sending...";



      // ==================================================
      // GET FORM DATA
      // ==================================================

      const formData =
        new FormData(suggestForm);



      // ==================================================
      // SEND TO FORMSPREE
      // ==================================================

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



        // ==================================================
        // SUCCESS
        // ==================================================

        if (response.ok) {

          formMessage.textContent =
            "Suggestion sent successfully.";

          suggestForm.reset();

        }



        // ==================================================
        // ERROR FROM SERVER
        // ==================================================

        else {

          formMessage.textContent =
            "Something went wrong. Please try again.";

        }

      }



      // ==================================================
      // CONNECTION ERROR
      // ==================================================

      catch (error) {

        console.error(
          "WebShelf Suggest Error:",
          error
        );

        formMessage.textContent =
          "Unable to send suggestion right now.";

      }



      // ==================================================
      // RESTORE BUTTON
      // ==================================================

      finally {

        submitButton.disabled = false;

        submitButton.textContent =
          "Submit suggestion";

      }

    }
  );

}