MediumEditor.prototype.setCaretAtEnd = function() {
    var editable, range, selection, textRange;
    editable = this.elements[0];
    if (window.getSelection && document.createRange) {
        range = document.createRange();
        range.selectNodeContents(editable);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        return selection.addRange(range);
    } else if (document.body.createTextRange) {
        textRange = document.body.createTextRange();
        textRange.moveToElementText(editable);
        textRange.collapse(false);
        return textRange.select();
    }
};

var server = "ws://localhost:8099/websocket";
var ws = null;
var current = "";
var editor = null;

function send(obj) {
    if (ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify(obj));
    } else {

    }
}

function connect() {
    ws = new WebSocket(server);

    ws.onopen = function(event) {
        websocket_init(event);
    };

    ws.onmessage = function(event) {
        handle_message(event);
    };

    ws.onclose = function(event) {
        terminate(event)
    };
 }

function websocket_init(event) {
    send({
        message: "",
        type: "init",
        username: $('#username').val()
    });
}

function handle_message(event) {
    var message = JSON.parse(event.data);

    if (message.connection) {
        if ($('#people #' + message.name).length !== 0) {
            return;
        }

        $('#people .person')
            .clone()
            .html(message.name)
            .attr("id", message.name)
            .appendTo("#people")
            .fadeIn();
    }

    if (message.broadcast) {

        current = message.text

        editor.setContent(message.text, 0);
        editor.setCaretAtEnd();
    }
}

function terminate(event) {
    connect();
}

function setup_send_timer() {
    setTimeout(function() {
        var content = editor.getContent(0);
        if (content != current) {
            send({
                message: content,
                type: "edit"
            });
        }

        setup_send_timer();
    }, 1000);
}

$(document).ready(function() {
    editor = new MediumEditor('.editable', {
        buttonLabels: 'fontawesome',
        toolbar: {
            buttons: [
                'bold',
                'italic',
                'h1',
                'h2',
                'h3',
                'justifyLeft',
                'justifyCenter',
                'justifyRight',
            ]
        },
    });

    $('#submit').click(function() {
        if($('#username').val().length) {
            $('#login').fadeOut();

            connect();
            setup_send_timer();
        }
    });

});