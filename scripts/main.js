var bookmarks = [
    {title: "Google", url: "https://google.com/"}, 
    {title: "DuckDuckGo", url: "https://duckduckgo.com/"}, 
    {title: "Apple", url: "https://apple.com/"}, 
    {title: "Microsoft", url: "https://microsoft.com/"}, 
    {title: "Facebook", url: "https://facebook.com/"}
];
var editingIndex = -1;





const bookmarksArea = document.getElementById("bookmarks");
const bottomBar = document.getElementById("bottomBar")

const bookmarkTitleArea = document.getElementById("bookmarkTitleArea");
const bookmarkUrlArea   = document.getElementById("bookmarkUrlArea");
const saveBookmarkButton = document.getElementById("saveBookmarkButton");
const saveBookmarkHint = bottomBar.getElementsByClassName("message")[0];



//
// UI event handlers
//
function saveBookmarkHandler() {
    var inputTitle = bookmarkTitleArea.value;
    var inputUrl = bookmarkUrlArea.value;

    if (inputTitle == "" && inputUrl == "") {
        updateSaveBookmarkHint();
        saveBookmarkHint.classList.add("error");
        return;
    }

    if (inputUrl.indexOf("://") == -1) {
        inputUrl = "http://" + inputUrl;
    }

    if (!urlRegex.test(inputUrl)) {
        updateSaveBookmarkHint();
        saveBookmarkHint.classList.add("error");
        return;
    }

    bookmarkTitleArea.value = "";
    bookmarkUrlArea.value = "";

    if (editingIndex == -1) {
        bookmarks.push({title: inputTitle, url: inputUrl});
        updateUI();

        var i = bookmarksArea.childNodes.length - 1;
        if (i != -1) bookmarksArea.childNodes[i].scrollIntoView();
    } else {
        bookmarks[editingIndex] = {title: inputTitle, url: inputUrl};
        editingIndex = -1;
        updateUI();
    }
    
    saveBookmarkButton.innerText = "Add";
    saveContentsToLocalStorage();
}

function copyLinkHandler() {
    let textarea = document.createElement("textarea");

    // Place in top-left corner of screen regardless of scroll position.
    textarea.style.position = 'fixed';
    textarea.style.top = 0;
    textarea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textarea.style.width = '1px';
    textarea.style.height = '1px';

    // We don't need padding, reducing the size if it does flash render.
    textarea.style.padding = 0;

    // Clean up any borders.
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    console.log("The textarea now exists :)");

    textarea.value = document.querySelector("#link").innerHTML;
    textarea.select();

    try {
        var status = document.execCommand('copy');
        if (!status) {
            console.error("Cannot copy text");
            toast("Failed to copy text", 1000, "failure");
        } else {
            console.log("The text is now on the clipboard");
            toast("Copied!", 1000, "success");
        }
    } catch (err) {
        console.log('Unable to copy.');
    }

    textarea.remove();
}

function exportLinkHandler() {
    let enc = btoa(JSON.stringify(bookmarks));

    let search = window.location.search;
    let orig = window.location.toString();

    let link = orig.substr(0, orig.length-search.length) + "?bookmarks=" + enc;

    let modal = document.querySelector(".modal");
    modal.querySelector("#link").innerHTML = link;
    modal.classList.toggle("show");
}

function modalCloseHandler(e) {
    if (!e.target.matches(".modal") && !e.target.matches(".close")) return;
    let modal = document.querySelector(".modal");
    modal.classList.toggle("show");
}


//
// UI helpers
//
function updateEventHandlers() {
    bookmarkTitleArea.addEventListener("keyup", function(e) { 
        updateButtonEnabledState();
        updateSaveBookmarkHint();
        if (e.key == "Enter") {
            bookmarkUrlArea.focus(); 
        }
    });
    bookmarkUrlArea.addEventListener("keyup", function(e) { 
        updateButtonEnabledState();
        updateSaveBookmarkHint();
        if (e.key == "Enter") {
            bookmarkUrlArea.blur();
            saveBookmarkHandler(); 
        }
    });
}

function updateUI() {
    bookmarksArea.innerHTML = "";
    if (editingIndex != -1) toggleEditing(editingIndex);
    updateButtonEnabledState();
    updateSaveBookmarkHint();

    for (var i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        const I = i;
        bookmarksArea.appendChild(
            createBookmarkElement(
                bookmark, 
                function () {
                    toggleEditing(I);
                },
                function () {
                    if (editingIndex != -1) toggleEditing(editingIndex);
                    bookmarks.splice(I, 1);
                    updateUI();
                    saveContentsToLocalStorage();
                }
            )
        );
    }
    bookmarksArea.style.opacity = 1;
}

function updateButtonEnabledState() {
    var inputUrl = bookmarkUrlArea.value;
    if (inputUrl.indexOf("://") == -1) {
        inputUrl = "http://" + inputUrl;
    }
    if (urlRegex.test(inputUrl)) {
        saveBookmarkButton.classList.remove("disabled");
    } else {
        saveBookmarkButton.classList.add("disabled");
    }
}

function updateSaveBookmarkHint() {
    saveBookmarkHint.classList.remove("error");
    saveBookmarkHint.innerText = "*Required";

    var inputUrl = bookmarkUrlArea.value;
    if (inputUrl === null || inputUrl == "") {
        return;
    }

    if (inputUrl.indexOf("://") == -1) inputUrl = "http://" + inputUrl;

    if (!urlRegex.test(inputUrl)) {
        saveBookmarkHint.classList.add("error");
        saveBookmarkHint.innerText = "The URL you entered is invalid.";
    } else {
        if (editingIndex == -1) {
            saveBookmarkHint.innerText = "Press 'Add' to save the bookmark.";
        } else {
            saveBookmarkHint.innerText = "Press 'Save' to update the bookmark.";
        }
    }
}

function toggleEditing(index) {
    var ele = bookmarksArea.childNodes[index];
    if (editingIndex == index) {
        editingIndex = -1;
        ele.classList.remove("highlighted");
        saveBookmarkButton.innerText = "Add";
        bookmarkTitleArea.value = "";
        bookmarkUrlArea.value = "";
    } else {
        if (editingIndex != -1) {
            toggleEditing(editingIndex);
        }
        editingIndex = index;
        ele.classList.add("highlighted");
        saveBookmarkButton.innerText = "Save";
        bookmarkTitleArea.value = bookmarks[index].title;
        bookmarkUrlArea.value = bookmarks[index].url;
    }
    updateButtonEnabledState();
    updateSaveBookmarkHint();
}

function createBookmarkElement(bookmark, selectHandler, deleteHandler) {
    var newEle = document.createElement('div');
    newEle.className = "bookmark";
    newEle.innerHTML = convertBookmarkToHTML(bookmark);
    newEle.onclick = function(e) { 
        if (e.target.tagName != "BUTTON" && e.target.tagName != "A") 
            selectHandler(e);
    };

    var buttonContainer = document.createElement('span');
    buttonContainer.className = "buttons";
    newEle.appendChild(buttonContainer);

    var deleteButton = document.createElement('button');
    deleteButton.className = "delete";
    deleteButton.innerText = "Delete";
    deleteButton.onclick = deleteHandler;
    buttonContainer.appendChild(deleteButton);

    return newEle;
}

function toast(text, duration, state) {
    let t = document.querySelector(".toast");
    t.innerHTML = text;
    t.classList.toggle("show");
    t.classList.toggle(state);
    setTimeout(() => {
        t.classList.toggle("show");
        t.classList.toggle(state);
    }, duration);
}




//
// Data handlers
//
const identifier = "2bkept_data";
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i;


function retrieveContentsFromURL() {
    let result = new URLSearchParams(window.location.search).get('bookmarks');
    if (result === null || result === undefined) {
        console.log("no contents retrieved from URL.");
        return false;
    } else {
        try {
            bookmarks = JSON.parse(atob(result));
            console.log("successfully retrieved contents from URL.");
            return true;
        } catch (e) {
            console.log("couldn't retrieve contents. " + e);
            return false;
        }
    }
}

function retrieveContentsFromLocalStorage() {
    var result = localStorage.getItem(identifier);
    if (result === null || result === undefined) {
        console.log("no contents retrieved from local storage.");
    } else {
        try {
            bookmarks = JSON.parse(result);
            console.log("successfully retrieved contents from local storage.");
        } catch (e) {
            console.log("couldn't retrieve contents. " + e);
        }
    }
}

function saveContentsToLocalStorage() {
    console.log("saving contents to local storage.");
    localStorage.setItem(identifier, JSON.stringify(bookmarks));
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function convertBookmarkToHTML(bookmark) {    
    var titleExists = bookmark.title !== undefined && bookmark.title !== null && bookmark.title !== "";
    var titleTag = titleExists ? "<span>" + escapeHtml(bookmark.title) + "</span><br />" : "";
    var urlTag = bookmark.url.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
    });

    return titleTag + urlTag;
}


//
// Auto-run
//
if (!retrieveContentsFromURL())
    retrieveContentsFromLocalStorage();
updateEventHandlers();
updateUI();

