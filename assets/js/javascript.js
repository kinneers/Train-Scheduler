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
    
    //Set database reference
    var database = firebase.database();

    //Initial Values
    var trainName;
    var destination;
    var firstTrainTime;
    var frequency;
    var nextTrain;
    var minutesAway;

    function calculateValues(trainTime, freq) {
        /*This function uses the first train time and frequency to calculate the next arrival time and
        minutes away.  The values for the next arrival and minutes away are NOT saved in the Firebase
        database, as they are dependent upon the current call time.*/
        //Get Current Time
        var currentTime = moment(currentTime).format('HH:mm')
        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(trainTime, 'HH:mm').subtract(1, 'years');
        //console.log(firstTimeConverted);
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // Time apart (remainder)
        var tRemainder = diffTime % freq;
        //Number of minutes away
        minutesAway = freq - tRemainder;
        //Arrival time of next train
        nextTrain = moment().add(minutesAway, "minutes");
        nextTrain = moment(nextTrain._d).format('HH:mm');
    }

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
        
        //Function to calculate arrival time and minutes away
        calculateValues(firstTrainTime, frequency);
        
        //Push new train to the Firebase Database
        database.ref().push({
            trainName,
            destination,
            firstTrainTime,
            frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    });

    // Firebase watcher + initial loader
    database.ref().on("child_added", function(childSnapshot) {

        //Function to calculate new arrival times and minutes away
        calculateValues(childSnapshot.val().firstTrainTime, childSnapshot.val().frequency);

        //Appends current values to the page and adds update and remove buttons
        $('#well').append(
            `<tr id="${childSnapshot.val().trainName}">
                <td>${childSnapshot.val().trainName}</td>
                <td>${childSnapshot.val().destination}</td>
                <td>${childSnapshot.val().frequency}</td>
                <td>${nextTrain}</td>
                <td>${minutesAway}</td>
                <td><button id="${childSnapshot.val().trainName}" class="update btn btn-primary">Update</button><td>
                <td><button id="${childSnapshot.val().trainName}" class="remove btn btn-danger">Remove</button><td>
            <tr>`
            /*Note that the button ids for update and remove and tr are all the same- this needs to be corrected*/
        )
    // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);    
    });

    //Adds an event listener to the parent of the update and remove buttons
    var theParent = document.querySelector("#well");
    theParent.addEventListener("click", findButton, false);

    function findButton(e) {
        if (e.target !== e.currentTarget) {
            var clickedItem = e.target;
            console.log(clickedItem);
        }
    e.stopPropagation();
    }
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