var connection = new Postmonger.Session();

var activity = {
    metaData: { isConfigured: false },
    arguments: {
        execute: {
            inArguments: []
        }
    }
};

$(window).ready(function () {
    connection.trigger("ready");
});

connection.on("initActivity", function (data) {
    if (data) activity = data;

    var inArguments =
        (activity.arguments &&
            activity.arguments.execute &&
            activity.arguments.execute.inArguments) || [];

    var messageArgument = inArguments.find(a => a.message !== undefined);
    var phoneArgument = inArguments.find(a => a.phone !== undefined);

    if (messageArgument) $("#message").val(messageArgument.message);
    if (phoneArgument) $("#phone").val(phoneArgument.phone);

    connection.trigger("updateButton", {
        button: "next",
        text: "Done",
        visible: true,
        enabled: true
    });
});

connection.on("clickedNext", function () {
    var message = $("#message").val().trim();
    var phone = $("#phone").val().trim();

    if (!message) {
        alert("Please enter an SMS message.");
        return;
    }
    if (!phone) {
        alert("Please enter a phone number.");
        return;
    }

    activity.metaData.isConfigured = true;

    activity.arguments.execute.inArguments = [
        { "message": message },
        { "phone": phone }
    ];

    connection.trigger("updateActivity", activity);
});