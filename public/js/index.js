function submitNew() {
    $('.newAccount').submit((event) => {
        event.preventDefault();
        const user = newUser.value;
        const pass = newPass.value;
        const first = firstName.value;
        const last = lastName.value;
        const data = {
            username: `${user}`, password: `${pass}`, firstName: `${first}`, lastName: `${last}`,
        };
        $.ajax({
            url: 'http://localhost:8080/api/users/',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(data),
            success: (response) => {
                console.log("User created")
            },
            error: (err) => {
                console.log(err);
            },

        });
    });
}

$(submitNew);
