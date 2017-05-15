var server = 'ws://' + window.location.host + '/websocket';
var ws = null;
var current = '';
var editor = null;
var retry_count = 0;

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
    retry_count = 0;

    send({
        message: '',
        type: 'init',
        username: $('#username').val(),
        doc_id: window.location.hash && window.location.hash.substring(1) || null,
        doc_name: $('#new_document').html()
    });
}

function handle_message(event) {
    var message = JSON.parse(event.data);

    if (message.connection) {
        if ($('#people #' + message.name).length !== 0) {

            $('#people #' + message.name)
                .attr('connection-id', message.id)
                .fadeIn()

            return;
        }

        $('#people .person')
            .clone()
            .html(message.name)
            .attr('id', message.name)

            .appendTo('#people')
            .attr('connection-id', message.id)
            .fadeIn();
    }

    if (message.lost) {
        $('.person[connection-id="' + message.lost + '"]').fadeOut()
    }


    if (message.init) {
        window.location.hash = message.doc_id;
    }

    if (message.text) {
        current = message.text

        editor.setContent(message.text, 0);
        editor.setCaretAtEnd();
    }
}

function terminate(event) {
    if (retry_count > 10) {
        console.log('Server is down. I give up.');
        return;
    }

    var timeout = retry_count * 1000;
    setTimeout(function() {
        retry_count += 1;
        connect();
    }, timeout);
}

function setup_send_timer() {
    setTimeout(function() {
        var content = editor.getContent(0);
        if (content != current) {
            send({
                message: content,
                type: 'edit'
            });
        }

        current = content;

        setup_send_timer();
    }, 1000);
}

function open_document() {
    $('#documents').fadeOut();
    if ($(this).attr('doc-id')) {
        window.location.hash = '#' + $(this).attr('doc-id');
    }

    connect();
    setup_send_timer();
}

$(document).ready(function() {
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


    editor = new MediumEditor('.editable', {
        buttonLabels: 'fontawesome',
        toolbar: {
            sticky: true,
            buttons: [
                'bold',
                'italic',
                'h1',
                'h3',
                'indent',
                'outdent',
                'justifyLeft',
                'justifyCenter',
                'justifyRight',
            ]
        },

        keyboardCommands: {
            commands: [{
                command: 'bold',
                key: 'B',
                meta: true,
                shift: false,
                alt: false
            },{
                command: 'italic',
                key: 'I',
                meta: true,
                shift: false,
                alt: false
            },{
                command: 'underline',
                key: 'U',
                meta: true,
                shift: false,
                alt: false
            }, {
                command: 'indent',
                key: 'TAB'
            }],
        }
    });

    $('.editable').mediumInsert({
        editor: editor
    });

    $('#submit').click(function() {
        if($('#username').val().length) {
            $.ajax({
                method: 'get',
                url: '/api/doc/list'
            }).done(function(msg) {
                msg.docs.forEach(function(doc) {
                    $('#documents .document')
                        .first()
                        .clone()
                        .html(doc.name)
                        .attr('doc-id', doc.doc_id)
                        .prependTo('#documents')
                        .click(open_document)
                        .show()
                });

                $('#login').fadeOut();
            });
        }
    });

    $('#new_document')
        .click(function() {
            $(this).html('');
            this.contentEditable = true;

            this.focus();
        })
        .on('keydown', function(e) {
          if (e.which == 13) {
            open_document();
            return false;
          };
        });
});