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
    
    var database = firebase.database();

    //Initial Values
    var trainName = '';
    var destination = '';
    var firstTrainTime;
    var frequency = 0;
    var nextTrain;
    var minutesAway = '';

/*
Regex for form validation of military time:   ^([01]\d|2[0-3]):?([0-5]\d)$
https://mdbootstrap.com/docs/jquery/forms/validation/
*/
    //Capture Submit Button
    $('#addTrain').on('click', function(event) {
        event.preventDefault();

        //LATER (IF TIME)- ADD IN FORM VALIDATION
        //Regex for form validation of military time:   ^([01]\d|2[0-3]):?([0-5]\d)$
        //https://mdbootstrap.com/docs/jquery/forms/validation/

        //Set the values for the most recent train added
        trainName = $('#trainName').val().trim();
        destination = $('#destination').val().trim();
        firstTrainTime = $('#firstTrainTime').val().trim();
        frequency = $('#frequency').val().trim();
        
        //Get Current Time
        var currentTime = moment(currentTime).format('HH:mm')
        console.log(currentTime);
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTrainTime, 'HH:mm').subtract(1, 'years');
        //console.log(firstTimeConverted);
        console.log(firstTimeConverted);
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);
        // Time apart (remainder)
        var tRemainder = diffTime % frequency;
        console.log(tRemainder);
        //Number of minutes away
        minutesAway = frequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + minutesAway);
        //Arrival time of next train
        nextTrain = moment().add(minutesAway, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("HH:mm"));
        console.log(nextTrain._d);
        nextTrain = nextTrain._d;
        
        database.ref().push({
            trainName,
            destination,
            firstTrainTime,
            frequency,
            nextTrain,
            minutesAway,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
        
    });


    // Firebase watcher + initial loader
    database.ref().on("child_added", function(childSnapshot) {

        // Log everything that's coming out of snapshot
        console.log(childSnapshot.val().trainName);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().firstTrainTime);
        console.log(childSnapshot.val().frequency);
        console.log(childSnapshot.val().dateAdded);
        console.log(childSnapshot.val().minutesAway);
        console.log(nextTrain);

        //Get Current Time
        var newCurrentTime = moment(newCurrentTime).format('HH:mm')
        console.log(newCurrentTime);
        // First Time (pushed back 1 year to make sure it comes before current time)
        var newFirstTimeConverted = moment(childSnapshot.val().firstTrainTime, 'HH:mm').subtract(1, 'years');
        //console.log(firstTimeConverted);
        console.log(newFirstTimeConverted);
        // Difference between the times
        var newDiffTime = moment().diff(moment(newFirstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + newDiffTime);
        // Time apart (remainder)
        var newTRemainder = newDiffTime % childSnapshot.val().frequency;
        console.log(newTRemainder);
        //Number of minutes away
        var newMinutesAway = childSnapshot.val().frequency - newTRemainder;
        console.log("MINUTES TILL TRAIN: " + newMinutesAway);
        //Arrival time of next train
        var newNextTrain = moment().add(newMinutesAway, "minutes");
        console.log("ARRIVAL TIME: " + moment(newNextTrain).format("HH:mm"));
        console.log(newNextTrain._d);
        newNextTrain = newNextTrain._d;

        $('#well').append(
            `<tr>
                <td>${childSnapshot.val().trainName}</td>
                <td>${childSnapshot.val().destination}</td>
                <td>${childSnapshot.val().frequency}</td>
                <td>${newNextTrain}</td>
                <td>${newMinutesAway}</td>
            <tr>`
        )
    // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
        
    /*
    ADAPT TO PUT THE ROWS IN CHRONOLOGICAL ORDER
    dataRef.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
    // Change the HTML to reflect
    $("#name-display").text(snapshot.val().name);
    $("#email-display").text(snapshot.val().email);
    $("#age-display").text(snapshot.val().age);
    $("#comment-display").text(snapshot.val().comment);
    })
    */
});