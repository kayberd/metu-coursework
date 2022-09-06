const APP_ID = 'hw2-rdjco';
const ATLAS_SERVICE = 'mongodb-atlas';
const app = new Realm.App({id: APP_ID});



const find_movies = async () => {
    let collMovies;
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        collMovies = mongodb.db("sample_mflix").collection("movies");
    } catch (err) {
        $("#user").append("Need to login first.");
        console.error("Need to log in first", err);
        return;
    }

    // Retrieve 20 movie titles (only the titles thanks to the projection).
    const movies_titles = await collMovies.find({}, {
        "projection": {
            "_id": 0,
            "title": 1
        },
        "limit": 20
    });

    // Access the movies div and clear it.
    let movies_div = $("#movies");
    movies_div.empty();

    // Loop through the 20 movie title and display them in the movies div.
    for (const movie of movies_titles) {
        let p = document.createElement("p");
        p.append(movie.title);
        movies_div.append(p);
    }
};

// MODELS
const User =  (username,user_id) => {
    return ({
        "username" : username,
        "num_of_books_read" : 0,
        "fav_books" : [],
        "avg_rating" : 0.0,
        "reviews" : [],
        "given_ratings" : [],
        "user_id" : user_id
    });
}
const Book = (name, authors, translator, editor, cover_url, is_fiction, publisher, genre, publish_year) => {
    return ({
        "name" : name,
        "authors" : authors,
        "translator" : translator,
        "editor" : editor,
        "cover_url" : cover_url,
        "is_fiction" : is_fiction,
        "publisher" : publisher,
        "genre" : genre,
        "publish_year" : publish_year,
        "all_reviews" : [],
        "rating" : 0,
    });
}

// HOME PAGE METHODS
const add_book = async () => {

    const name = $('[name="book-name"]').val();
    if(name === ''){
        alert("Name is missing");
        return;
    }


    const authors = parseAuthors($('[name="book-authors"]').val());
    if(authors === []){
        alert("Author is missing");
        return;
    }


    const translator = $('[name="book-translator"]').val();
    if(translator === ''){
        alert("Translator is missing");
        return;
    }


    const editor = $('[name="book-editor"]').val();
    if(editor === ''){
        alert("Editor is missing");
        return;
    }


    const cover_url = $('[name="book-coverurl"]').val();
    if(cover_url === ''){
        alert("Cover URL is missing");
        return;
    }


    const is_fiction = $('[name="book-isfictional"]').is(':checked');
    console.log("asdasdad"+is_fiction);

    const publisher = $('[name="book-publisher"]').val();
    if(publisher === ''){
        alert("Publisher is missing");
        return;
    }


    const genre = $('[name="book-genre"]').val();
    if(genre === ''){
        alert("Genre is missing");
        return;
    }


    const publish_year = $('[name="book-publish-year"]').val();
    if(publish_year === ''){
        alert("Publish year is missing");
        return;
    }


    const all_reviews = [];
    const rating = 0.0;

    const book = Book(name,authors,translator,editor,cover_url,is_fiction,publisher,genre,publish_year);
    let books;
    try {
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        books = mongodb.db("hw2-db").collection("books");
        books.insertOne(book).then(() => {
            reset_add_book_form();
            alert(`${book.name} added`);
        });
    } catch (e) {
        alarm(e);
    }
};
const open_add_book_form = async () => {
    const username = await get_username();
    if(username === ''){
        alert('Please login first');
        navigate_home_page();
        return;
    }
    $(".add-book-form").show(700);
};
const close_add_book_form = () => {
    $(".add-book-form").hide(700);
};
const reset_add_book_form = () => {
    $('[name="book-name"]').val('');
    $('[name="book-authors"]').val('')
    $('[name="book-translator"]').val('');
    $('[name="book-editor"]').val('');
    $('[name="book-coverurl"]').val('')
    $('[name="book_isfictional"]').val('');
    $('[name="book-publisher"]').val('');
    $('[name="book-genre"]').val('');
    $('[name="book-publish-year"]').val('');
}
const parseAuthors = (authors) => {
    return authors.split(', ');
}

const remove_book = async (book_name) => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const user_collection = mongodb.db("hw2-db").collection("users");
    const rating_collection = mongodb.db("hw2-db").collection("ratings");
    const review_collection = mongodb.db("hw2-db").collection("reviews");
    const book_collection = mongodb.db("hw2-db").collection("books");

    const query = {"book_name" : book_name };

     review_collection.deleteMany(query);
     rating_collection.deleteMany(query);
     book_collection.deleteMany({"name": book_name});
     user_collection.updateMany({},{ $pull: { fav_books: book_name}});


};
const remove_and_refresh = (book_name) => {
    remove_book(book_name).then(() => {
        navigate_books_page();
    })
}
const add_user = async (username, user_id) => {
    let users;
    try {
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        users = mongodb.db("hw2-db").collection("users");
        const user = User(username, user_id);
        users.insertOne(user).then(() => {
            alert(`User ${username}-${user_id} added successfully`);
        });
    } catch (e) {
        alert(`User addition failed.\nError: ${e}`);
    }
};
const navigate_review_page = () => {
    window.location.href = "reviews.html";
}
const navigate_home_page = () => {
    window.location.href = "index.html";
}
const navigate_user_page = async () => {
    const username = await get_username();
    if(username === ''){
        alert('Please login first');
        navigate_home_page();
        return;
    }
    window.location.href = "user-page.html";
}
const navigate_books_page = async () => {
    const username = await get_username();
    if(username === ''){
        alert('Please login first');
        navigate_home_page();
        return;
    }
    window.location.href = "books-page.html";
}

const remove_ratings = async () => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const rating_collection = mongodb.db("hw2-db").collection("ratings");
    rating_collection.deleteMany({'user_id' : app.currentUser.id });
}

const remove_reviews = async () => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const review_collection = mongodb.db("hw2-db").collection("reviews");
    review_collection.deleteMany({'user_id' : app.currentUser.id });
}

const remove_user = async () => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const user_collection = mongodb.db("hw2-db").collection("users");
    await user_collection.deleteOne({'user_id' : app.currentUser.id });
    await remove_ratings();
    await remove_reviews();
    $('#title').empty().append("Hello, stranger please login");
    alert('User deleted successfully. To continue please login');
};
const login = async () => {
    const username = $('#username-input').val();
    if (username === ""){
        alert("Please fill username field");
        return;
    }
    const credentials = Realm.Credentials.anonymous();
    try {
        const user = await app.logIn(credentials);
        await add_user(username, user.id);
        $('#title').empty().append("Hello, ",username);
        // update the user div with the user ID
    } catch (err) {
        console.error("Failed to log in", err);
    }
};

// USER PAGE METHODS
const sort_reviews = async () => {
    const fav_books = await get_fav_books();
    const all_reviews = await get_reviews();
    let given_ratings = await get_all_ratings();
    let reviewed_book_names = [];
    all_reviews.forEach(([name, review_body])=> {
        reviewed_book_names.push(name);
    })
    let sorted_reviews = [];
    for(const fav_book of fav_books){
        for(const review of all_reviews){
            if(fav_book === review[0]){
                sorted_reviews.push(review);
            }
        }
    }
    given_ratings = given_ratings.sort((a,b) => b.rating-a.rating );
    for(const rating of given_ratings){
        if(fav_books.includes(rating.book_name)){
            continue;
        } else if(reviewed_book_names.includes(rating.book_name)){
            all_reviews.forEach(([name, body]) => {
                if(name === rating.book_name){
                    sorted_reviews.push([name, body]);
                }
            })
        }
    }
    return sorted_reviews;

};
const show_fav_books = async () => {
    const fav_books = await get_fav_books();
    fav_books.forEach((book) => {
        const item = `<li class="list-group-item">${book}</li>`
        $("#fav-books-list-header").append(item);
    });
};
const get_fav_books = async () => {
    let user_collection;
    let fav_books;
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);""
        user_collection = mongodb.db("hw2-db").collection("users");
    } catch (err) {
        alert("Need to login first.");
        return;
    }
    fav_books = await user_collection.find({"user_id" : app.currentUser.id},).then((users) => {
        return users.length > 0 ? users[0].fav_books : [];
    });
    return fav_books;
};
const show_reviews = async () => {
    const reviews = await sort_reviews();
    reviews.forEach((review) => {
        const item = `<li class="list-group-item">${review[0]} - ${review[1]}</li>`
        $("#reviews-list-header").append(item);
    });
};
const get_reviews = async () => {
    let review_collection;
    let review_bodies = [];
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        review_collection = mongodb.db("hw2-db").collection("reviews");
    } catch (err) {
        alert("Need to login first.");
        return;
    }
    return await review_collection.find({"user_id" : app.currentUser.id},).then((reviews) => {
        reviews.forEach((review) => {
            review_bodies.push([review.book_name,review.review_body]);
        })
        return review_bodies;
    });
};
const get_username = async ()  => {
    let user_collection;
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        user_collection = mongodb.db("hw2-db").collection("users");
    } catch (err) {
        $("#user").append("Need to login first.");
        console.error("Need to log in first", err);
        return;
    }
    return await user_collection.find({'user_id' : app.currentUser.id }).then((users) => {
        return users.length > 0 ? users[0].username : '';
    });
};
const show_user_card = async () => {
    await show_user_name();
    await show_num_of_books_read();
    show_avg_rating();
    show_fav_books();
    show_reviews();
}
const show_user_name = async () => {
    const username = await get_username();
    const username_item = `<li class="list-group-item">UserName : ${username}</li>`
    $("#user-info-card-list").append(username_item);
}
const show_num_of_books_read = async () => {
    const given_ratings_count = await get_read_book_count();
    const num_of_books_read_item = `<li class="list-group-item">Number of books read : ${given_ratings_count}</li>`
    $("#user-info-card-list").append(num_of_books_read_item);
}
const show_avg_rating = async () => {
    let sum_ratings = 0;
    let rating_collection;
    let avg_rating;
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        rating_collection = mongodb.db("hw2-db").collection("ratings");
    } catch (err) {
        alert("Need to login first.");
        return;
    }
    avg_rating = await rating_collection.find({"user_id" : app.currentUser.id}).then((ratings) => {
        ratings.forEach((rating) => {
            sum_ratings += Number(rating.rating) ;
        });
        return ratings.length === 0 ? 0 : sum_ratings / ratings.length;
    });
    const avg_ratings_item = `<li class="list-group-item">Avarege given rating : ${avg_rating}</li>`
    $("#user-info-card-list").append(avg_ratings_item);
}

// USER ACTION METHODS
const rate_book = async (book_name,row,index) => {

    try {
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        const ratings_collection = mongodb.db("hw2-db").collection("ratings");
        const query = {
            "user_id": app.currentUser.id,
            "book_name": book_name
        };
        const update = {
            "$set": {
                "user_id": app.currentUser.id,
                "book_name": book_name,
                "rating" : index
            }
        };
        const options = { "upsert": true };
        ratings_collection.updateOne(query, update, options)
            .then(result => {
                for(let i=1;i<=5;i++){
                    $('#'+row+'-'+i).css('color','black');
                }
                for(let i=1;i<=index;i++){
                    $('#'+row+'-'+i).css('color','red');
                }
            })
            .catch(err => alert(`Failed to update the item: ${err}`))
    } catch (e) {
        alert(`User addition failed.\nError: ${e}`);
    }

};

const is_book_rated = async (book_name) => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const rate_collection = await mongodb.db("hw2-db").collection("ratings");
    return await rate_collection.find({
        'user_id' : app.currentUser.id,
        'book_name' : book_name,
    }).then((ratings) => {
        return ratings.length > 0;
    });
}

const get_read_book_count = async () => {
    let rating_collection;
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    rating_collection = mongodb.db("hw2-db").collection("ratings");

    return await rating_collection.find({'user_id' : app.currentUser.id }).then((ratings) => {
        return ratings.length;
    });
}

const review_book = async (book_name) =>  {

    if(await is_book_rated(book_name) === false){
        alert('Please rate book first');
        return;
    }

    const review_body = prompt("Type your review:");
    try {
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        const review_collection = mongodb.db("hw2-db").collection("reviews");
        const query = {
            "user_id": app.currentUser.id,
            "book_name": book_name
        };
        const update = {
            "$set": {
                "user_id": app.currentUser.id,
                "book_name": book_name,
                "review_body": review_body
            }
        };
        const options = { "upsert": true };
        review_collection.updateOne(query, update, options)
            .then(result => {
                const { matchedCount, modifiedCount } = result;
                if(matchedCount && modifiedCount) {
                    alert(`Review updated successfully`)
                } else {
                    alert("Review insterted successfully")
                }
            })
            .catch(err => alert(`Failed to update the item: ${err}`))
    } catch (e) {
        alert(`Error: ${e}`);
    }
}
const favorite_book = async (book_name, row) => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const user_collection = mongodb.db("hw2-db").collection("users");
    const query = { "user_id": app.currentUser.id };
    const update = {
        "$addToSet": {
            "fav_books" : book_name
        }
    };
    const options = { "upsert": true };
    user_collection.updateOne(query, update, options)
        .then(result => {
            $('#fav_'+row).css("color",'red');
        })
        .catch(err => alert(`Failed to fave the item: ${err}`))
};
const is_favorite = async (book_name) => {
    let user_collection;
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        user_collection = mongodb.db("hw2-db").collection("users");
    } catch (err) {
        $("#user").append("Need to login first.");
        console.error("Need to log in first", err);
        return;
    }
    return await user_collection.find({"user_id": app.currentUser.id}).then((users) => {
        let fav_books = users.length > 0 ? users[0].fav_books : [];
        return fav_books.includes(book_name);
    });
}

// BOOKS PAGE
const handle_genres = async () => {};
const show_all_books = async () => {
    const books = await get_all_books();
    let row = books.length;
    for(book of books) {
        const itemized_book = await itemize_book(book, row);
        const rating = await get_rating(book.name);
        $("tbody").prepend(itemized_book);
        row--;

    }
};
const get_all_books = async () => {
    let books_collection;
    let all_books = [];
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        books_collection = mongodb.db("hw2-db").collection("books");
    } catch (err) {
        alert("Need to log in first", err);
        return;
    }
    all_books =  await books_collection.find({}).then((books) => {
        console.log(books);
        return books;
    });
    return all_books;
};
const itemize_book = async (book,row) => {
    const rating = await calc_rating(book.name);
    const is_favorite_book = await is_favorite(book.name);
    const color = is_favorite_book ? 'red' : 'black';
    const given_rating = await get_rating(book.name);
    const styles = [];
    for(let i=1;i<=5;i++){
        const style = i<=given_rating ? "font-size:30px;"+"color:red;" : "font-size:30px;";
       styles.push(style);

    }
    return (`
        <tr>
            <th scope="row">${row}</th>
            <td>
                <div class="d-flex align-items-center"><img src=${book.cover_url} width="100"><span class="ml-2"></span></div>
            </td>
            <td>${book.name}</td>
            <td>${book.authors}</td>
            <td>${book.translator}</td>
            <td>${book.editor}</td>
            <td>${book.is_fiction}</td>
            <td>${book.publisher}</td>
            <td>${book.genre}</td>
            <td>${book.publish_year}</td>
            <td><i class="bi bi-eye" style="font-size:30px;" onclick="show_book_review('${book.name}')"></i></td>
            <td>${rating}</td>
            <td>
                <i class="bi bi-trash" style="font-size:30px;" onclick="remove_and_refresh('${book.name}')"></i>
                <i id=${'fav_' + row} class="bi bi-heart" style="font-size:30px;color:${color}" onclick="favorite_book('${book.name}','${row}')"></i>
                <i class="bi bi-pencil-square" style="font-size:30px;" onclick="review_book('${book.name}')"></i>
                <i id=${row + "-1"} class="bi bi-star" style=${styles[0]} onclick="rate_book('${book.name}','${row}','1')"></i>
                <i id=${row + "-2"} class="bi bi-star" style=${styles[1]} onclick="rate_book('${book.name}','${row}','2')"></i>
                <i id=${row + "-3"} class="bi bi-star" style=${styles[2]} onclick="rate_book('${book.name}','${row}','3')"></i>
                <i id=${row + "-4"} class="bi bi-star" style=${styles[3]} onclick="rate_book('${book.name}','${row}','4')"></i>
                <i id=${row + "-5"} class="bi bi-star" style=${styles[4]} onclick="rate_book('${book.name}','${row}','5')"></i>
            </td>
        </tr>
    `);


};
const calc_rating = async (book_name) => {
    let sum_ratings = 0;
    let rating_collection;
    try {
        // Access the movies' collection through MDB Realm & the readonly rule.
        const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
        rating_collection = mongodb.db("hw2-db").collection("ratings");
    } catch (err) {
        alert("Need to login first.");
        return;
    }
    return await rating_collection.find({"book_name" : book_name}).then((ratings) => {
        ratings.forEach((rating) => {
            sum_ratings += Number(rating.rating);
        });
        const rating = sum_ratings / ratings.length;
        return isNaN(rating) ? 0 : rating;
    });

}
const get_rating = async (book_name) => {

    let rating_collection;
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    rating_collection = mongodb.db("hw2-db").collection("ratings");

    return await rating_collection.find({
        "user_id": app.currentUser.id,
        "book_name": book_name,
    }).then((ratings) => {
        return ratings.length > 0 ? ratings[0].rating : 0;

    });

}

const get_all_ratings = async () => {
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    const rate_collection = await mongodb.db("hw2-db").collection("ratings");
    return await rate_collection.find({'user_id' : app.currentUser.id,}).then((ratings) => {
        return ratings;
    });
}
const get_reviews_book = async (book_name) => {
    let review_collection;
    let review_bodies = [];
    const mongodb = app.currentUser.mongoClient(ATLAS_SERVICE);
    review_collection = mongodb.db("hw2-db").collection("reviews");
    return await review_collection.find({"book_name" : book_name},);
}
const show_book_review = (book_name) => {
    localStorage.setItem('book', book_name);
    navigate_review_page();
}

const upload_reviews = async () => {
    const curr_book = localStorage.getItem('book');
    const reviews = await get_reviews_book(curr_book);
    reviews.forEach((review) => {
        const item = `<li class="list-group-item">${review.review_body}</li>`
        $("#reviews-list-header").append(item);
    })
}

