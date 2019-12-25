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




//
// Data handlers
//
const identifier = "2bkept_data";
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i;


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
retrieveContentsFromLocalStorage();
updateEventHandlers();
updateUI();

