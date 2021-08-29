import { Schema, model, connect } from 'mongoose';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const request = require('request');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const api_url: string = "http://api.discogs.com/releases/";
let start_id: number;

interface album_record {
    link: String,
    api_link: String,
    cover_art: String,
    release_year: Number,
    artist_name: String,
    genres: [String],
    styles: [String],
    title: String,
    date_added: String,
    number_for_sale: Number,
    lowest_price: Number    
}

const recordSchema = new Schema<album_record>({
    link: String,
    api_link: String,
    cover_art: String,
    release_year: Number,
    artist_name: String,
    genres: Array,
    styles: Array,
    title: String,
    date_added: String,
    number_for_sale: Number,
    lowest_price: Number 
},
{timestamps: { createdAt: 'created_at'}});

var db  =  mongoose.connect(process.env.PURCHASABLE, {useNewUrlParser: true});
var db2 =  mongoose.createConnection(process.env.NON_PURCHASABLE, {useNewUrlParser: true});

db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', function() {
    beginCollection();
});

async function beginCollection()
{
    initialCollection();  

    let interval = setInterval( async function (){

        let data = fs.readFileSync('./currentID', 'utf8');
        data = String(start_id);
        fs.writeFileSync('./currentID', data);

        await getData()
        .then(() => {})
        .catch((errors) => {async (errors: Error) => {
            setTimeout( async function(){ 
                console.log('Error in getdata(), wait 10 minutes and try again' + ' start_id = ' + start_id);
                await getData(); 
            }, 600000);}   
        }); 

    }, 3000);

}

async function initialCollection()
{
    const data = fs.readFileSync('./currentID', 'utf8');
    start_id = Number(data.toString());
    getData();
}

async function getData(){

    var recordModelBuy = db.model('new_record_purchasable', recordSchema);
    var recordModelAll = db2.model('new_record_all', recordSchema);

    
    const response = await axios.get(api_url + String(start_id));
    const getCover = await axios.get(response.data["uri"]);
    let $ = cheerio.load(getCover.data);
    let cover = $('picture').children('img').eq(0).attr('src');

    if(response.status === 200){
        console.log('Status 200: adding ' + response.data["uri"] + ' ' + response.data["title"] + ' ' + (response.data["genres"]?response.data["genres"]:'')  + (cover ? ' with cover' : ' without cover') + ' and ' + response.data["num_for_sale"] + ' for sale. ' + start_id);
        start_id += 3;
        if(response.data["num_for_sale"] === 0){

            const findCountAll = await recordModelAll.collection.countDocuments({});

            if(findCountAll > 10000){
                const checkIfAvailable = recordModelAll.collection.find().sort( { 'timestamp': -1 } ).limit(1);
                const purchasableResponse = await axios.get(checkIfAvailable["api_link"]);

                if(purchasableResponse.data["num_for_sale"] === 0){
                    recordModelAll.collection.findOneAndDelete().sort({ "timestamp": -1 });
                }
                else{
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

            const findCountBuyable = await recordModelBuy.collection.countDocuments({});

            if(findCountBuyable > 5000){
                recordModelBuy.collection.findOneAndDelete().sort({ "timestamp": 1 });    
            }
            else{
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
}
    else{
        console.log('Bad response: ' + response.status);
    }

}