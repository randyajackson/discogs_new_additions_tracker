import { Schema, model, connect } from 'mongoose';
const mongoose = require('mongoose');
const axios = require('axios');

const api_url: string = "http://api.discogs.com/releases/";
const start_id: number = 19638718;

interface album_record {
    link: String,
    api_link: String,
    cover_art: String,
    release_year: String,
    artist_name: String,
    genres: [String],
    styles: [String],
    title: String,
    date_added: String,
    number_for_sale: String    
}

const recordSchema = new Schema<album_record>({
    link: String,
    api_link: String,
    cover_art: String,
    release_year: String,
    artist_name: String,
    genres: Array,
    styles: Array,
    title: String,
    date_added: String,
    number_for_sale: String,
},
{timestamps: { createdAt: 'created_at'}});

var db  =  mongoose.connect('mongodb://localhost/new_record_purchasable', {useNewUrlParser: true});
var db2 =  mongoose.createConnection('mongodb://localhost/new_record_all', {useNewUrlParser: true});

db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', function() {
    beginCollection();
});

async function beginCollection()
{
    initialCollection();    
}

async function initialCollection() 
{
    //figure out how to save/get the latest id
    const response = await axios.get(api_url + String(start_id));
    console.log(response.data);

    var recordModelBuy = db.model('new_record_purchasable', recordSchema);
    var recordModelAll = db2.model('new_record_all', recordSchema);
    
    recordModelAll.create({
        link: response.data["uri"],
        api_link: response.data["resource_url"],
        cover_art: "test",
        release_year: response.data["year"],
        artist_name: response.data["artists"]["name"],
        genres: response.data["genres"],
        styles: response.data["styles"],
        title: response.data["title"],
        date_added: response.data["date_added"],
        number_for_sale: response.data["num_for_sale"],
    }, 
    function (err: Error, release: Request) {
        if(err) return console.error(err);
    });

}