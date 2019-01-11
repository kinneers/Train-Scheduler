/*
Developer: Sarah Kinneer
Title: Trivia Game
Description: Train Scheduler (JavaScript, JQuery, Moment.js, Firebase)
Date: 1/6/2019

Facts:
The Orient Express took 7 days to get to Istanbul and 7 days to return to Paris, so it could 
have departed every 20160 minutes (provided, of course that only one train traveled the route 
at a given time and never required maintenance).

Harry Potter did, in fact, leave from Platform 9 and 3/4 on the Hogwarts Express at 11:00.

Spoiler Alert: The Little Engine that Could DOES make it to the top of the mountian.

The Polar Express' Frequency is actually every 525600 minutes... but the frequency given was
calculated in order for it to arrive Christmas Eve.
*/

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

    /*  ATTEMPTING TO AUTHORIZE USERS
    var provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithRedirect(provider);

    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
          // This gives you a GitHub Access Token. You can use it to access the GitHub API.
          var token = result.credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = result.user;
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });

      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    */

    //Initial Values/Global Variables
    var trainName = '';
    var destination = '';
    var firstTrainTime;
    var frequency = 0;
    var nextTrain;
    var minutesAway;
    var clickedItem;
    var regExTime = /^([01]\d|2[0-3]):?([0-5]\d)$/;

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
        nextTrain = moment(nextTrain._d).format('MM/DD/YY @ hh:mm a');
    }

    //ATTENOTUNG TO UPDATE PAGE EACH MINUTE (NOT WORKING... YET)
    //Interval to refresh page data
    //setInterval(refreshTable, 60000);

    //database.ref().on("value", refreshTable(childSnapshot) {

    //    calculateValues(latestSnapshot.val().firstTrainTime, latestSnapshot.val().frequency);
      //  console.log("check for changes");
    //}
    

    //Capture Submit Button
    $('#addTrain').on('click', function(event) {
        event.preventDefault();

        //Set the values for the most recent train added
        trainName = $('#trainName').val().trim();
        destination = $('#destination').val().trim();
        firstTrainTime = $('#firstTrainTime').val().trim();
        frequency = $('#frequency').val().trim();

        //Validate inputs
        if ((trainName !== '') && (destination !== '') && (regExTime.test(firstTrainTime)) && (frequency !== 0)) {
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

            //Clear form fields
            $('#trainName').val('');
            $('#destination').val('');
            $('#firstTrainTime').val('');
            $('#frequency').val('');
        }
        else {
            //Add a modal to indicate that a field needs valid input






            
            console.log("Error");
        }
    });

    // Firebase watcher + initial loader
    database.ref().on("child_added", function(childSnapshot) {
        console.log(childSnapshot.key);
        //Function to calculate new arrival times and minutes away
        calculateValues(childSnapshot.val().firstTrainTime, childSnapshot.val().frequency);

        //Appends current values to the page and adds update and remove buttons
        $('#well').append(
            `<tr id="${childSnapshot.key}">
                <td>${childSnapshot.val().trainName}</td>
                <td>${childSnapshot.val().destination}</td>
                <td>${childSnapshot.val().frequency}</td>
                <td>${nextTrain}</td>
                <td>${minutesAway}</td>
                <td><button id="update" type="button" value="${childSnapshot.key}" class="update btn btn-primary">Update</button><td>
                <td><button id="remove" value="${childSnapshot.key}" class="remove btn btn-danger">Remove</button><td>
            <tr>`
        )
    // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);    
    });

    //Adds an event listener to the parent of the update and remove buttons (needed since they were created dynamically)
    var theParent = document.querySelector("#well");
    theParent.addEventListener("click", findButton, false);
    //Function to determine which of the child buttons was clicked
    function findButton(event) {
        if (event.target !== event.currentTarget) {
            clickedItem = event.target;
            if (clickedItem.id === 'update') {
                console.log("Update " + clickedItem.value);
                //Add Function to Update Field

            }
            else if (clickedItem.id === 'remove') {
                database.ref(clickedItem.value).remove();
            }
            else {
                console.log ("Error");
            }
        }
    event.stopPropagation();
    }

    //Function to update DOM when child is removed from Firebase DB
    database.ref().on("child_removed", function(childSnapshot) {
        //Removes associated table row from the DOM
        $('#' + childSnapshot.key).remove();
    // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);    
    });
});