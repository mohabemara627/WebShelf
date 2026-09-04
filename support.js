// ==================================================
// SUPPORT FORM
// ==================================================

const supportForm =
  document.querySelector("#support-form");

const supportMessage =
  document.querySelector("#support-message-status");

const supportButton =
  document.querySelector("#support-submit");


if (
  supportForm &&
  supportMessage &&
  supportButton
) {

  supportForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // Loading state

      supportMessage.textContent =
        "Sending message...";

      supportButton.disabled = true;
      supportButton.textContent = "Sending...";


      const formData =
        new FormData(supportForm);


      try {

        const response =
          await fetch(
            supportForm.action,
            {
              method: "POST",
              body: formData,
              headers: {
                Accept: "application/json"
              }
            }
          );


        if (response.ok) {

          supportMessage.textContent =
            "Message sent successfully.";

          supportForm.reset();

        } else {

          supportMessage.textContent =
            "Something went wrong. Please try again.";

        }

      } catch (error) {

        console.error(
          "WebShelf Support Error:",
          error
        );

        supportMessage.textContent =
          "Unable to send your message right now.";

      } finally {

        supportButton.disabled = false;
        supportButton.textContent =
          "Send message";

      }

    }
  );

}