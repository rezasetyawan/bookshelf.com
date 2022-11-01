const books = [];
const RENDER_EVENT = "render_book";
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded',function(){
    const inputForm = document.getElementById('inputBook');
    inputForm.addEventListener('submit',function(event){
        event.preventDefault();
        addBook();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT,function(){
    const inCompletedBook = document.getElementById('incompleteBookshelfList');
    inCompletedBook.innerHTML = '';

    const completedBook =  document.getElementById('completeBookshelfList');
    completedBook.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);

        if (!bookItem.isCompleted){
            inCompletedBook.append(bookElement);
        } else {
            completedBook.append(bookElement);
            
        }
    }
});

function addBook(){
    const inputBook = document.getElementById('inputBook');
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const bookId = generateBookId();
    const bookIsCompleted = document.getElementById('inputBookIsComplete').checked;
    const bookObject = generateBookObject(bookId,bookTitle,bookAuthor,bookYear,bookIsCompleted);

    books.push(bookObject);
    saveData()
    document.dispatchEvent(new Event(RENDER_EVENT));
    inputBook.reset();
};

function generateBookId() {
    return +new Date();
};

function generateBookObject(id,judul,penulis,tahun,isCompleted){
    return{
        id,
        judul,
        penulis,
        tahun,
        isCompleted
    };
};

function makeBook(bookObject){
    const judulBuku = document.createElement('h3');
    judulBuku.innerText = bookObject.judul;

    const penulisBuku = document.createElement('p');
    penulisBuku.innerText = `Penulis : ${bookObject.penulis}`;

    const tahunBuku = document.createElement('p');
    tahunBuku.innerText = `Tahun : ${bookObject.tahun}`;

    const infoContainer = document.createElement('article');
    infoContainer.classList.add('book_item','card_list');
    infoContainer.append(judulBuku,penulisBuku,tahunBuku);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const bookContainer = document.createElement('div');
    bookContainer.classList.add('book_list');
    bookContainer.append(infoContainer);
    bookContainer.setAttribute('id',`book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('button');
        deleteButton.innerText = '🗑️Hapus';
        deleteButton.addEventListener('click',function(){
            deleteBookFromCompleted(bookObject.id);
        })

        const undoButton = document.createElement('button');
        undoButton.classList.add('button');
        undoButton.innerText = '❌Belum selesai dibaca'
        undoButton.addEventListener('click',function(){
            undoBookFromCompleted(bookObject.id);
        })

        const editButton = document.createElement('button');
        editButton.classList.add('button');
        editButton.innerText = '✏️ Edit buku';
        editButton.addEventListener('click',function(){
            editBook(bookObject.id);
        })
        
        buttonContainer.append(undoButton,editButton,deleteButton);
        infoContainer.append(buttonContainer);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('button');
        checkButton.innerText = '✔️Selesai dibaca';
        checkButton.addEventListener('click',function(){
            addBooktoCompleted(bookObject.id);
        })

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('button');
        deleteButton.innerText = '🗑️Hapus';
        deleteButton.addEventListener('click',function(){
            deleteBookFromCompleted(bookObject.id);
        })

        const editButton = document.createElement('button');
        editButton.classList.add('button');
        editButton.innerText = '✏️ Edit buku';
        editButton.addEventListener('click',function(){
            editBook(bookObject.id);
        })

        buttonContainer.append(checkButton,editButton,deleteButton);
        infoContainer.append(buttonContainer);
    }
    return bookContainer;
};

const searchSubmit =  document.getElementById('searchSubmit');
searchSubmit.addEventListener('click',function(event){
    event.preventDefault();
    const searchValue = document.getElementById('searchBookTitle').value.toLowerCase();
    const listJudulBuku = document.querySelectorAll('.book_item > h3');
    console.log(searchValue);

    for ( judul of listJudulBuku) {
        if (searchValue !== ''){
            if (searchValue !== judul.innerText.toLowerCase()){
                judul.parentElement.style.display = 'none' ;
            } else if (searchValue === judul.innerText.toLowerCase()) {
                judul.parentElement.style.display = 'block';
            }
        }
    }
})

function editBook(bookId){
    const bookTarget = findBook(bookId);
    const bookIndex = findBookIndex(bookId);
    if (bookTarget == null) return;

    const bookTitle = document.getElementById('inputBookTitle');
    const bookAuthor = document.getElementById('inputBookAuthor');
    const bookYear = document.getElementById('inputBookYear');
    const bookIsCompleted = document.getElementById('inputBookIsComplete').checked;
   
    bookTitle.value = bookTarget.judul;
    bookAuthor.value = bookTarget.penulis;
    bookYear.value = bookTarget.tahun;

    if(bookTarget.isCompleted){
        bookIsCompleted.value = true;
    }else {
        bookIsCompleted.value = false;
    }

    books.splice(bookIndex,1);
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBooktoCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
 };

 function findBook(bookId){
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
 };

 function deleteBookFromCompleted(bookId){
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;
    books.splice(bookTarget,1)

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
 };

 function undoBookFromCompleted(bookId){
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    
 };

 function findBookIndex(bookId) {
    for (const index in books){
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
 };

 function saveData() {
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY,parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
 };

 function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Update browsernya ya kak');
        return false;
    }
    return true;
 };

 document.addEventListener(SAVED_EVENT,function(){
    console.log('Data berhasil di simpan.');
 });

 function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null){
        for (const book of data){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
 };
