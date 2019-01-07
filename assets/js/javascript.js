$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyA2RtL6OApQdUUwwkA6-AVjzesIGmp2E2Q",
        authDomain: "amazing-train-scheduler.firebaseapp.com",
        databaseURL: "https://amazing-train-scheduler.firebaseio.com",
        projectId: "amazing-train-scheduler",
        storageBucket: "",
        messagingSenderId: "1010701429657"
    };
    
    firebase.initializeApp(config);


    //Regex for form validation of military time:   ^([01]\d|2[0-3]):?([0-5]\d)$

})