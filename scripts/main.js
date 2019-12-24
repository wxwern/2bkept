var bookmarks = [
    {title: "Google", url: "https://google.com/"}, 
    {title: "DuckDuckGo", url: "https://duckduckgo.com/"}, 
    {title: "Apple", url: "https://apple.com/"}, 
    {title: "Microsoft", url: "https://microsoft.com/"}, 
    {title: "Facebook", url: "https://facebook.com/"}
];
var editingIndex = -1;


const bookmarksArea = document.getElementById("bookmarks");

const bookmarkTitleArea = document.getElementById("bookmarkTitleArea");
const bookmarkUrlArea   = document.getElementById("bookmarkUrlArea");
const addBookmarkButton = document.getElementById("addBookmarkButton");


//
// UI event handlers
//
function saveBookmarkHandler() {
    var inputTitle = bookmarkTitleArea.value;
    var inputUrl = bookmarkUrlArea.value;

    if (inputTitle == "" && inputUrl == "") {
        return;
    }

    bookmarkTitleArea.value = "";
    bookmarkUrlArea.value = "";

    if (inputUrl.indexOf("://") == -1) {
        inputUrl = "http://" + inputUrl;
    }
    if (editingIndex == -1) {
        bookmarks.push({title: inputTitle, url: inputUrl});
    } else {
        bookmarks[editingIndex] = {title: inputTitle, url: inputUrl};
        editingIndex = -1;
    }
    
    addBookmarkButton.innerText = "Add";
    bookmarksArea.focus();

    saveContentsToLocalStorage();
    updateUI();
}



//
// UI helpers
//
function updateEventHandlers() {
    bookmarkTitleArea.addEventListener("keyup", function(e) { 
        if (e.key == "Enter") {
            bookmarkUrlArea.focus(); 
        }
    });
    bookmarkUrlArea.addEventListener("keyup", function(e) { 
        if (e.key == "Enter") {
            bookmarkUrlArea.blur();
            saveBookmarkHandler(); 
        }
    });
}

function updateUI() {
    bookmarksArea.innerHTML = "";
    editingIndex = -1;
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
                    bookmarks.splice(I, 1);
                    editingIndex = -1;
                    saveContentsToLocalStorage();
                    updateUI();
                }
            )
        );
    }
    bookmarksArea.style.opacity = 1;
}

function toggleEditing(index) {
    var ele = document.getElementsByClassName("bookmark")[index];
    if (editingIndex == index) {
        editingIndex = -1;
        ele.classList.remove("highlighted");
        addBookmarkButton.innerText = "Add";
        bookmarkTitleArea.value = "";
        bookmarkUrlArea.value = "";
    } else {
        if (editingIndex != -1) {
            toggleEditing(editingIndex);
        }
        editingIndex = index;
        ele.classList.add("highlighted");
        addBookmarkButton.innerText = "Save";
        bookmarkTitleArea.value = bookmarks[index].title;
        bookmarkUrlArea.value = bookmarks[index].url;
    }
}

function createBookmarkElement(bookmark, selectHandler, deleteHandler) {
    var newEle = document.createElement('div');
    newEle.className = "bookmark";
    newEle.innerHTML = convertBookmarkToHTML(bookmark);
    newEle.onclick = selectHandler;

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
const identifier = "2bkept_data"
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
    var urlRegex = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
    var urlTag = bookmark.url.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
    return escapeHtml(bookmark.title) + "<br />" + urlTag;
}



//
// Auto-run
//
retrieveContentsFromLocalStorage();
updateEventHandlers();
updateUI();

