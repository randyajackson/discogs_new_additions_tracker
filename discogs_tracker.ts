import { Schema, model, connect } from 'mongoose';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import fetch from 'cross-fetch';
import { AxiosResponse } from "axios";

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const api_url: string = "http://api.discogs.com/releases/";
let start_id: number;
let newErrorCount: number = 0;

type getNextAlbumReturn = {
    response: AxiosResponse;
    cover: string;
}

type retestAndTrimNotForSaleReturn = {
    response: AxiosResponse;
    cover: String;
}

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

var recordModelBuy = db.model('new_record_purchasable', recordSchema);
var recordModelAll = db2.model('new_record_all', recordSchema);

db.once('open', function() {
    beginCollection();
});

async function beginCollection()
{
    getStartID();  

    while(true){

        let data = fs.readFileSync('./currentID', 'utf8');
        data = String(start_id);
        fs.writeFileSync('./currentID', data);
        
        const nextAlbum: getNextAlbumReturn | void = await getNextAlbum()
        .catch(async (errors) => {
                console.log('Error in getdata(), waiting 5 minutes and trying again' + ' start_id = ' + start_id);
                await new Promise((resolve) => setTimeout(() =>{

                    newErrorCount++;
                    console.log(newErrorCount);

                    if(newErrorCount >= 3)
                        start_id += 3; 

                    resolve(resolve);

                }, 300000));
                   
        });    
              

        if( nextAlbum !== undefined && nextAlbum["response"]["status"] === 200){
            newErrorCount = 0;
            start_id += 3; 
            console.log('Status 200: adding ' + nextAlbum["response"]["data"]["uri"] + ' ' + nextAlbum["response"]["data"]["title"] + ' ' + (nextAlbum["response"]["data"]["genres"]?nextAlbum["response"]["data"]["genres"]:'')  + (nextAlbum["cover"] !== "" ? ' with cover' : ' without cover') + ' and ' + nextAlbum["response"]["data"]["num_for_sale"] + ' for sale. ' + start_id);
            console.log(nextAlbum["cover"]);
            // if(nextAlbum["response"]["data"]["num_for_sale"] === 0){
            //     retestNotForSale();
            //     trimForSale();
            //     addAlbumToNotForSale(nextAlbum[0], nextAlbum[1]);
            // }
            // else{
            //     trimNotForSale();
            //     addAlbumToForSale(nextAlbum[0], nextAlbum[1]);
            // }

        }
   
        
    }


}

async function getStartID()
{
    const data = fs.readFileSync('./currentID', 'utf8');
    start_id = Number(data.toString());
}

async function getNextAlbum(): Promise<getNextAlbumReturn> {

    let returnVars = {
                        "response" : <AxiosResponse>{}, 
                        "cover": ""
                    };

    returnVars.response = await axios.get(api_url + String(start_id));

    if(returnVars.response !== null){
        const getCover = await axios.get(returnVars["response"]["data"]["uri"]);
        let $ = cheerio.load(getCover);
        returnVars.cover = $('picture').children('img').eq(0).attr('src')!;
        if(returnVars.cover === undefined)
            returnVars.cover = "";
    }

    return returnVars; 

} 

// async function retestNotForSale(): Promise<retestAndTrimNotForSaleReturn>{

//     let returnVars = {"response" : null, "cover": ''};

//     const findCountNotForSale = await recordModelAll.collection.countDocuments({});

//     if(findCountNotForSale > 10000){
//         const check = await fetch(checkIfAvailable["api_link"]);
//         const purchasableResponse = await axios.get(checkIfAvailable["api_link"]);
//         console.log("Retest checking: " + purchasablenextAlbum["response"]["title"] + ' ' + purchasablenextAlbum["response"]["num_for_sale"]);

//         if(purchasablenextAlbum["response"]["num_for_sale"] === 0){
//             await recordModelAll.findOneAndDelete().sort({"created_at": 1});
//         }
//     }

//     return returnVars;

// }

// async function addAlbumToNotForSale(){

//     await recordModelAll.create({
//         link: nextAlbum["response"]["uri"],
//         api_link: nextAlbum["response"]["resource_url"],
//         cover_art: (cover !== undefined) ? cover : ' ',
//         release_year: nextAlbum["response"]["year"],
//         artist_name: nextAlbum["response"]["artists"]["name"],
//         genres: nextAlbum["response"]["genres"],
//         styles: nextAlbum["response"]["styles"],
//         title: nextAlbum["response"]["title"],
//         date_added: nextAlbum["response"]["date_added"],
//         number_for_sale: nextAlbum["response"]["num_for_sale"],
//         lowest_price: nextAlbum["response"]["lowest_price"],
//     }, 
//     function (err: Error, release: Request) {
//         if(err) return console.error(err);
//     });

// }

// async function addAlbumToForSale(){

//     await recordModelBuy.create({
//         link: purchasablenextAlbum["response"]["uri"],
//         api_link: purchasablenextAlbum["response"]["resource_url"],
//         cover_art: (cover !== undefined) ? cover : ' ',
//         release_year: purchasablenextAlbum["response"]["year"],
//         artist_name: purchasablenextAlbum["response"]["artists"]["name"],
//         genres: purchasablenextAlbum["response"]["genres"],
//         styles: purchasablenextAlbum["response"]["styles"],
//         title: purchasablenextAlbum["response"]["title"],
//         date_added: purchasablenextAlbum["response"]["date_added"],
//         number_for_sale: purchasablenextAlbum["response"]["num_for_sale"],
//         lowest_price: purchasablenextAlbum["response"]["lowest_price"],
//     }, 
//     function (err: Error, release: Request) {
//         if(err) return console.error(err);
//     }); 

// }

// async function trimForSale(){

//     const findCountForSale = await recordModelBuy.collection.countDocuments({});
    
//     if(findCountForSale > 5000){
//         recordModelBuy.findOneAndDelete().sort({"created_at": 1});  
//     }
// }

// async function trimNotForSale(){

//     const findCountForSale = await recordModelBuy.collection.countDocuments({});
    
//     if(findCountForSale > 5000){
//         recordModelBuy.findOneAndDelete().sort({"created_at": 1});  
//     }
// }