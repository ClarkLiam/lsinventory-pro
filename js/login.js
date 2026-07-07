document
.getElementById("loginForm")
.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const username =
            document.getElementById(
                "username"
            ).value;

        const password =
            document.getElementById(
                "password"
            ).value;

        const response =
            await fetch(
                "api/auth/login.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

        const result =
            await response.json();

        if(result.success){

            window.location =
                "dashboard.html";

        } else {

            alert(
                "Invalid credentials"
            );
        }

    }
);