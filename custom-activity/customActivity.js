var connection = new Postmonger.Session();

var activity = {
    metaData: { isConfigured: false },
    arguments: {
        execute: {
            inArguments: []
        }
    }
};

var availableFields = [];

$(window).ready(function () {
    connection.trigger("ready");
    connection.trigger("requestSchema"); // ask JB for entry-source fields
});

// JB responds with the real, resolvable fields from the entry Data Extension
connection.on("requestedSchema", function (data) {
    availableFields = (data && data.schema) || [];

    var $select = $("#phoneField");
    $select.empty();
    $select.append('<option value="">-- Select phone field --</option>');

    availableFields.forEach(function (field) {
        // field.key is the exact resolvable reference JB gave us
        $select.append(
            '<option value="' + field.key + '">' + field.name + "</option>"
        );
    });
});

connection.on("initActivity", function (data) {
    if (data) activity = data;

    var inArguments =
        (activity.arguments &&
            activity.arguments.execute &&
            activity.arguments.execute.inArguments) || [];

    var messageArgument = inArguments.find(a => a.message !== undefined);
    var phoneArgument = inArguments.find(a => a.phoneKey !== undefined);

    if (messageArgument) $("#message").val(messageArgument.message);
    if (phoneArgument) $("#phoneField").val(phoneArgument.phoneKey);

    connection.trigger("updateButton", {
        button: "next",
        text: "Done",
        visible: true,
        enabled: true
    });
});

connection.on("clickedNext", function () {
    var message = $("#message").val().trim();
    var phoneKey = $("#phoneField").val();

    if (!message) {
        alert("Please enter an SMS message.");
        return;
    }
    if (!phoneKey) {
        alert("Please select the phone field from the dropdown.");
        return;
    }

    activity.metaData.isConfigured = true;

    activity.arguments.execute.inArguments = [
        { "message": message },
        { "phone": "{{Event." + phoneKey + "}}" },
        { "phoneKey": phoneKey } // stored so we can restore the dropdown later
    ];

    connection.trigger("updateActivity", activity);
});