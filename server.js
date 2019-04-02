require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const MOVIES = require('./movies.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

app.use(cors());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    
    next();
});

function handleGetTypes(req, res) {
    const { genre, country, avg_vote } = req.query;

    let response = MOVIES;

    if (genre) {
        response = response.filter(movie =>
          movie.genre.toLowerCase().includes(genre.toLowerCase())
        );
    }
    
    if (country) {
        response = response.filter(movie =>
        movie.country.toLowerCase().includes(country.toLowerCase())
        );
    }

    if (avg_vote && avg_vote > 10) {
        return res.status(400).send('Average vote cannot be more than 10');
    } else if (avg_vote) {
        response = response.filter(movie => 
            movie.avg_vote >= avg_vote
        );
    }

    res.json(response);
}

app.get('/movie', handleGetTypes);

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
});