(function() {
    var lastdeletedID, lastdeletedTEXT, lastdeletedINDEX, count = 0;

    function updateCounter() {
        $('.count').text(count);
        var deleteButton = $('.clear-all');
        if (count === 0) {
            deleteButton.attr('disabled', 'disabled').addClass('disabled');
        } else {
            deleteButton.removeAttr('disabled').removeClass('disabled');
        }
    }

    function generateId() {
        return "reminder-" + +new Date();
    }
    var saveReminder = function(id, content) {
        localStorage.setItem(id, content);
    };
    var editReminder = function(id) {
        var $this = $('#' + id);
        $this.focus().append($('<button />', {
            "class": "icon-save save-button",
            click: function() {
                $this.attr('contenteditable', 'false');
                var newcontent = $this.text(),
                    saved = $('.save-notification');
                if (!newcontent) {
                    var confirmation = confirm('Delete this item?');
                    if (confirmation) {
                        removeReminder(id);
                    }
                } else {
                    localStorage.setItem(id, newcontent);
                    saved.show();
                    setTimeout(function() {
                        saved.hide();
                    }, 2000);
                    $(this).remove();
                    $('.icon-pencil').show();
                }
            }
        }));
    };
    var deleteReminder = function(id, content) {
        localStorage.removeItem(id);
        count--;
        updateCounter();
    };
    var UndoOption = function() {
        var undobutton = $('.undo-button');
        setTimeout(function() {
            undobutton.fadeIn(300).on('click', function() {
                createReminder(lastdeletedID, lastdeletedTEXT, lastdeletedINDEX);
                $(this).fadeOut(300);
            });
            setTimeout(function() {
                undobutton.fadeOut(1000);
            }, 3000);
        }, 1000)
    };
    var removeReminder = function(id) {
        var item = $('#' + id);
        lastdeletedID = id;
        lastdeletedTEXT = item.text();
        lastdeletedINDEX = item.index();
        item.addClass('removed-item').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            $(this).remove();
        });
        deleteReminder(id);
        if (lastdeletedTEXT) {
            UndoOption();
        }
    };
    var createReminder = function(id, content, index) {
        var reminder = '<li id="' + id + '">' + content + '</li>',
            list = $('.reminders li');
        if (!$('#' + id).length) {
            if (index && index < list.length) {
                var i = index + 1;
                reminder = $(reminder).addClass('restored-item');
                $('.reminders li:nth-child(' + i + ')').before(reminder);
            }
            if (index === 0) {
                reminder = $(reminder).addClass('restored-item');
                $('.reminders').prepend(reminder);
            }
            if (index === list.length) {
                reminder = $(reminder).addClass('restored-item');
                $('.reminders').append(reminder);
            }
            if (index === undefined) {
                reminder = $(reminder).addClass('new-item');
                $('.reminders').append(reminder);
            }
            var createdItem = $('#' + id);
            createdItem.append($('<button />', {
                "class": "icon-trash delete-button",
                "contenteditable": "false",
                click: function() {
                    var confirmation = confirm('Delete this item?');
                    if (confirmation) {
                        removeReminder(id);
                    }
                }
            }));
            createdItem.append($('<button />', {
                "class": "icon-pencil edit-button",
                "contenteditable": "false",
                click: function() {
                    createdItem.attr('contenteditable', 'true');
                    editReminder(id);
                    $(this).hide();
                }
            }));
            createdItem.on('keydown', function(ev) {
                if (ev.keyCode === 13) return false;
            });
            saveReminder(id, content);
            count++;
            updateCounter();
        }
    };
    var handleInput = function() {
        $('#input-form').on('submit', function(event) {
            var input = $('#text'),
                value = input.val();
            event.preventDefault();
            if (value) {
                var text = value;
                var id = generateId();
                createReminder(id, text);
                input.val('');
            }
        });
    };
    var loadReminders = function() {
        if (localStorage.length !== 0) {
            for (var key in localStorage) {
                var text = localStorage.getItem(key);
                if (key.indexOf('reminder') === 0) {
                    createReminder(key, text);
                }
            }
        }
    };
    var handleDeleteButton = function() {
        $('.clear-all').on('click', function() {
            if (confirm('Are you sure you want to delete all the items in the list? There is no turning back after that.')) {
                var items = $('li[id ^= reminder]');
                items.addClass('removed-item').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
                    $(this).remove();
                });
                var keys = [];
                for (var key in localStorage) {
                    if (key.indexOf('reminder') === 0) {
                        localStorage.removeItem(key);
                    }
                }
                count = 0;
                updateCounter();
            }
        });
    };
    var init = function() {
        $('#text').focus();
        loadReminders();
        handleDeleteButton();
        handleInput();
        updateCounter();
    };
    init();
})();