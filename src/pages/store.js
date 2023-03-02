import { openDB, deleteDB, wrap, unwrap } from 'idb';

let db;

init();

async export function init() {
    db = await idb.openDb('booksDb', 1, db => {
        db.createObjectStore('books', { keyPath: 'name' });
    });

    list();
}

async export function list() {
    let tx = db.transaction('books');
    let bookStore = tx.objectStore('books');

    let books = await bookStore.getAll();

    if (books.length) {
        listElem.innerHTML = books.map(book => `<li>
        name: ${book.name}, price: ${book.price}
      </li>`).join('');
    } else {
        listElem.innerHTML = '<li>No books yet. Please add books.</li>'
    }


}

async export function clearBooks() {
    let tx = db.transaction('books', 'readwrite');
    await tx.objectStore('books').clear();
    await list();
}

async export function addBook() {
    let name = prompt("Book name?");
    let price = +prompt("Book price?");

    let tx = db.transaction('books', 'readwrite');

    try {
        await tx.objectStore('books').add({ name, price });
        await list();
    } catch (err) {
        if (err.name == 'ConstraintError') {
            alert("Such book exists already");
            await addBook();
        } else {
            throw err;
        }
    }
}

window.addEventListener('unhandledrejection', event => {
    alert("Error: " + event.reason.message);
});