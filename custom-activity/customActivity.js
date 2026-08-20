var connection = new Postmonger.Session();

var activity = {
    metaData: {
        isConfigured: false
    },

    arguments: {
        execute: {
            inArguments: []
        }
    }
};


// Tell Journey Builder that the Custom Activity is ready
$(window).ready(function () {
    connection.trigger("ready");
});


// Initialize the activity
connection.on("initActivity", function (data) {

    if (data) {
        activity = data;
    }

    // Restore previously entered message
    var inArguments =
        activity.arguments &&
        activity.arguments.execute &&
        activity.arguments.execute.inArguments
            ? activity.arguments.execute.inArguments
            : [];

    var messageArgument = inArguments.find(function (arg) {
        return arg.message !== undefined;
    });

    if (messageArgument) {
        $("#message").val(messageArgument.message);
    }

    // Enable Journey Builder Next button
    connection.trigger("updateButton", {
        button: "next",
        text: "Done",
        visible: true,
        enabled: true
    });
});


// When user clicks Next / Done
connection.on("clickedNext", function () {

    var message = $("#message").val().trim();

    if (!message) {
        alert("Please enter an SMS message.");
        return;
    }

    activity.metaData.isConfigured = true;

    activity.arguments.execute.inArguments = [

        {
            "message": message
        },

        {
            "phone": "{{Contact.Default.MobilePhone}}"
        }

    ];

    console.log(
        "Activity configuration:",
        activity
    );

    connection.trigger(
        "updateActivity",
        activity
    );
});