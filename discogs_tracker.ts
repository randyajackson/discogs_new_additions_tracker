import { Schema, model, connect } from 'mongoose';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const request = require('request');
const mongoose = require('mongoose');
const axios = require('axios');

const api_url: string = "http://api.discogs.com/releases/";
let start_id: number;

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
    number_for_sale: String,
    lowest_price: String    
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
    lowest_price: String 
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
    
    let interval = setInterval( async function (){
        start_id += 3;
        let data = fs.readFileSync('./currentID', 'utf8');
        data = String(start_id);
        fs.writeFileSync('./currentID', data);

        try{
            getData();
        }
        catch(err){
            setTimeout(function(){ getData(); }, 600000);
        }

    }, 3000);

}

async function initialCollection()
{
    const data = fs.readFileSync('./currentID', 'utf8');
    start_id = Number(data.toString());

    start_id = 19721362;
    getData();
}

async function getData(){

    var recordModelBuy = db.model('new_record_purchasable', recordSchema);
    var recordModelAll = db2.model('new_record_all', recordSchema);

    const response = await axios.get(api_url + String(start_id));
    const getCover = await axios.get(response.data["uri"]);

    let $ = cheerio.load(getCover.data);
    let cover = $('picture').children('img').eq(0).attr('src');
    console.log(response.data);
    console.log(cover);
    
    if(response.data["num_for_sale"] === 0){
        recordModelAll.create({
            link: response.data["uri"],
            api_link: response.data["resource_url"],
            cover_art: (cover !== undefined) ? cover : ' ',
            release_year: response.data["year"],
            artist_name: response.data["artists"]["name"],
            genres: response.data["genres"],
            styles: response.data["styles"],
            title: response.data["title"],
            date_added: response.data["date_added"],
            number_for_sale: response.data["num_for_sale"],
            lowest_price: response.data["lowest_price"],
        }, 
        function (err: Error, release: Request) {
            if(err) return console.error(err);
        });
    }else{
        recordModelBuy.create({
            link: response.data["uri"],
            api_link: response.data["resource_url"],
            cover_art: (cover !== undefined) ? cover : ' ',
            release_year: response.data["year"],
            artist_name: response.data["artists"]["name"],
            genres: response.data["genres"],
            styles: response.data["styles"],
            title: response.data["title"],
            date_added: response.data["date_added"],
            number_for_sale: response.data["num_for_sale"],
            lowest_price: response.data["lowest_price"],
        }, 
        function (err: Error, release: Request) {
            if(err) return console.error(err);
        });
    }

}