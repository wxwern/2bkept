var bookmarks = [];
const bookmarksArea = document.getElementById("bookmarks");
const bookmarkTextArea = document.getElementById("bookmarkTextArea");


//
// UI event handlers
//
function addBookmarkHandler() {
    var inputText = bookmarkTextArea.value;
    window.alert("not implemented");
}



//
// UI helpers
//
function updateEventHandlers() {

}

function updateUI() {

}

function createBookmarkElementFromText(text, selectHandler, deleteHandler) {
    var newEle = document.createElement('div');
    newEle.class = "bookmark";
    newEle.innerText = text;
    newEle.onclick = selectHandler;
    
    var deleteButton = document.createElement('button');
    deleteButton.class = "delete";
    deleteButton.onclick = deleteHandler;
    newEle.appendElement(deleteButton);

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
        bookmarks = result;
        console.log("successfully retrieved contents from local storage.");
    }
}

function saveContentsToLocalStorage() {
    console.log("saving contents to local storage.");
    localStorage.setItem(identifier);
}



//
// Auto-run
//
retrieveContentsFromLocalStorage();
updateEventHandlers();
updateUI();

