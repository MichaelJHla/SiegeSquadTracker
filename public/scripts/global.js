//This will tell the user who they are signed in as
$('footer').text("Signed in as " + localStorage.getItem("userName"));

function changeUser() {
    localStorage.setItem("userName", $('#user-name').val());
}