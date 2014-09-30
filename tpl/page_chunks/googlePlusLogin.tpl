<!DOCTYPE html>
<span>
    <meta name="google-signin-clientid" content="739869424938-1b0ilms09aal314r795lgptr6oq2e4ag.apps.googleusercontent.com" />
    <meta name="google-signing-secret" content ="bTnUJ1Zljv3FxUUkT1hNj6n-" />
    <meta name="google-signin-scope" content="https://www.googleapis.com/auth/plus.login" />
    <meta name="google-signin-requestvisibleactions" content="http://schema.org/AddAction" />
    <meta name="google-signin-cookiepolicy" content="single_host_origin" />
    <script type="text/javascript">
        (function() {
            var po = document.createElement('script');
            po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/client:plusone.js?onload=render';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(po, s);
        })();

        /* Executed when the APIs finish loading */
        function render() {
            // Additional params including the callback, the rest of the params will
            // come from the page-level configuration.
            var additionalParams = {
                'callback': signinCallback
            };

            // Attach a click listener to a button to trigger the flow.
            var signinButton = document.getElementById('signinButton');
            signinButton.addEventListener('click', function() {
                gapi.auth.signIn(additionalParams); // Will use page level configuration
            });
        }

        function signinCallback(authResult) {
            if (authResult['status']['signed_in']) {
                var method = "post";

                var form = document.createElement("form");
                form.setAttribute("type", 'hidden');
                form.setAttribute("method", method);
                form.setAttribute("action", '/success?target=/play');

                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", 'text');
                hiddenField.setAttribute('name', 'token');
                hiddenField.setAttribute("value", authResult['access_token']);
                form.appendChild(hiddenField);
                document.body.appendChild(form);
                console.log(form);
                form.submit();
            } else {
                // Update the app to reflect a signed out user
                // Possible error values:
                //   "user_signed_out" - User is signed-out
                //   "access_denied" - User denied access to your app
                //   "immediate_failed" - Could not automatically log in the user
                console.log('Sign-in state: ' + authResult['error']);
            }
        }
    </script>
    <div id="gSignInWrapper" style="width: 100%; text-align: center">
        <button id="signinButton" style="border: none !important; background: transparent; display: inline-block">
            <div id="customBtn" class="customGPlusSignIn">
                <span class="icon"></span>
                <span class="buttonText">Google</span>
            </div>
        </button>
    </div>
</span>