const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('uuid')
const app = express()
const API_KEY = '2abbf7c3-245b-404f-9473-ade729ed4653'
const jsonParser = bodyParser.json();

app.use(jsonParser);
app.use( morgan('dev'))

const api = (req, res, next) => {

    // Query verfication
    const { apiKey } = req.query;
    if(apiKey === API_KEY){
        console.log("Auth by Query Param")
        return next();
    }
    
    // Header verification
    const apiKeyHeader = req.headers.api_key
    if(apiKeyHeader === API_KEY){
        console.log("Auth by Header")
        return next();
    }

    // Token verfication
    const token = req.headers.authorization;
    if(!token){
        res.statusMessage = 'The app needs the token'
        return res.status(401).end();
    }

    if( token !== `Bearer ${API_KEY}`) {
        res.statusMessage = ' The authorization token is invalid'
        return res.status(401).end();
    }

    console.log("Auth by Token")
    next();
}

app.use(api);

let bookmarks = [
    {
      id: uuid.v4(),
      title: "Twitch",
      description: "streaming",
      url: "www.twitch.com",
      rating: 1,
    },
    {
      id: uuid.v4(),
      title: "Uuid",
      description: "Uuid",
      url: "https://www.npmjs.com/package/uuid",
      rating: 2,
    },
    {
      id: uuid.v4(),
      title: "Genius",
      description: "Music",
      url: "www.genius.com",
      rating: 3,
    },
    {
      id: uuid.v4(),
      title: "Vitau",
      description: "Trabajo",
      url: "www.vitau.mx",
      rating: 4,
    }
  ];


app.get("/bookmarks", (req, res) => {
    console.log("Request on bookmarks")
    return res.status(200).json(bookmarks)
})

app.get("/bookmark", (req, res) => {
    const { title } = req.query;

    // Title not in query
    if (!title) {
        res.statusMessage = "Title query param not found";
        return res.status(406).end();
    }

    // Filter Bookmarks that matches query
    const bookmark = bookmarks.filter((bookmark) => bookmark.title === title);
    
    // Bookmark not found
    if (bookmark.length === 0) {
        res.statusMessage = "Bookmark does not exist";
        return res.status(404).end();
    }

    res.status(200).json(bookmark);
});

app.post("/bookmarks", (req, res) => {
    console.log(req.body)
    const {title, description, url, rating} = req.body

    if(!title || !description || !url || !rating){
        res.statusMessage = "Fields missing!"
        return res.status(406).end();
    }

    const newPost = {
        id: uuid.v4(),
        title,
        description,
        url,
        rating
    }

    bookmarks.push(newPost);
    res.status(201).json(bookmarks);
})

app.delete('/bookmark/:id', (req, res) => {
    const { id } = req.params;
    const post = bookmarks.find((bookmark) => bookmark.id === id);
    console.log(req.params)
    if(!post){
        res.statusMessage = "Bookmark does not exist"
        return res.status(404).end();
    }

    bookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
    // res.status(200).json(bookmarks);
    res.status(200).end();
})

app.patch('/bookmark/:id', (req, res) => {
    // const {id} = req.body
    if(!req.body.id){
        res.statusMessage = "Id needs to be in the body"
        res.status(406).end();
    }

    const {id} = req.params
    
    if (req.body.id !== id) {
        res.statusMessage = "Param ID and Body ID do not match";
        return res.status(409).end();
    }
    
    const post = bookmarks.find((bookmark) => bookmark.id === id);
    
    if (!post) {
        res.statusMessage = "Bookmark with that id not found";
        return res.status(404).end();
    }

    const {title, description, url, rating} = req.body;
    if(title) post.title = title
    if(description) post.description = description
    if(url) post.url = url
    if(rating) post.rating = rating

    res.status(202).json(post);
})

app.listen(8000, () => {
    console.log("The server is running!")
})