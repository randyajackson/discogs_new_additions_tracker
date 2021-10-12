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
let getNextAlbumErrorCount: number = 0;

type currentRecord = {
    response: AxiosResponse;
    cover: string;
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

db.once('open', async function() {
    beginCollection();
});

async function beginCollection()
{
    getStartID();  
    let data = String(start_id);

    while(true){

        data = String(start_id);
        fs.writeFileSync('./currentID', data);
        
        //get request for the next new album
        const nextAlbum: currentRecord | void = await getNextAlbum()
        .catch(async (errors) => {
                console.log('Error in getdata(), waiting 5 minutes and trying again' + ' start_id = ' + start_id);
                await new Promise((resolve) => setTimeout(() =>{

                    //If caught up to the latest new ID, there will be a waiting period before the ID has been generated.
                    //If trying the newest ID for 15 minutes does not work, add 3 to the ID.
                    getNextAlbumErrorCount++;
                    console.log("Error count: " + getNextAlbumErrorCount);
                    if(getNextAlbumErrorCount >= 5)
                        start_id += 3; 

                    resolve(resolve);

                }, 300000));
                   
        });    
              

        if( nextAlbum !== undefined && nextAlbum["response"]["status"] === 200){
            
            getNextAlbumErrorCount = 0;
            start_id += 3; 

            console.log('Status 200: adding ' + nextAlbum["response"]["data"]["uri"] + ' ' + nextAlbum["response"]["data"]["title"] + ' ' + (nextAlbum["response"]["data"]["genres"]?nextAlbum["response"]["data"]["genres"]:'')  + (nextAlbum["cover"] !== "" ? ' with cover' : ' without cover') + ' and ' + nextAlbum["response"]["data"]["num_for_sale"] + ' for sale. ' + start_id);
            console.log(nextAlbum["cover"]);
            
            if(nextAlbum["response"]["data"]["num_for_sale"] === 0){

                //Check latest record to see if it is now buyable. Add to buyable records if able.
                //Maintain the total size of 10000 non-buyable records.
                await retestTrimNotForSale()
                .catch( async (errors) => {
                    //If error, then the API link of the last record has been removed causing a 404 error, delete the record.
                    console.log("Retest API link not found. Deleting record.");
                    await recordModelAll.findOneAndDelete().sort({"created_at": 1});
                });

                addAlbumToNotForSale(nextAlbum);
            }
            else{
                trimNotForSale();
                addAlbumToForSale(nextAlbum);
            }

        }
   
        
    }


}

async function getStartID()
{
    const data = fs.readFileSync('./currentID', 'utf8');
    start_id = Number(data.toString());
}

async function getNextAlbum(): Promise<currentRecord> {

    let returnVars = {
                        "response" : <AxiosResponse>{}, 
                        "cover": ""
                    };
    
    returnVars.response = await axios.get(api_url + String(start_id));
    if(returnVars.response !== null){
        const getCover = await axios.get(returnVars["response"]["data"]["uri"]);
        let $ = cheerio.load(getCover.data);
        returnVars.cover = $('picture').children('img').eq(0).attr('src')!;
        if(returnVars.cover === undefined)
            returnVars.cover = "";
    }

    return returnVars; 

} 

async function retestTrimNotForSale(){

    const findCountNotForSale = await recordModelAll.collection.countDocuments({});
    console.log("findCountNotForSale: " + findCountNotForSale);
    if(findCountNotForSale > 10000){

        const latestNotForSaleRecord = await recordModelAll.findOne().sort({"created_at": 1});
        console.log("Retest checking: " + latestNotForSaleRecord["link"] + ' ' + latestNotForSaleRecord["created_at"]);
        const purchasableResponse = await axios.get(latestNotForSaleRecord["api_link"]);

        if(purchasableResponse["data"]["num_for_sale"] > 0){

            console.log("Retest found new quantity: " + purchasableResponse["data"]["title"] + ' ' + purchasableResponse["data"]["num_for_sale"]);

            trimNotForSale();
            
            const getCoverRetry = await axios.get(purchasableResponse.data["uri"]);
            const $ = cheerio.load(getCoverRetry.data);
            let cover = $('picture').children('img').eq(0).attr('src')!;
            if(cover === undefined)
                cover = "";

            console.log(cover);

            await recordModelBuy.create({
                link: purchasableResponse["data"]["uri"],
                api_link: purchasableResponse["data"]["resource_url"],
                cover_art: (cover !== undefined) ? cover : ' ',
                release_year: purchasableResponse["data"]["year"],
                artist_name: purchasableResponse["data"]["artists"]["name"],
                genres: purchasableResponse["data"]["genres"],
                styles: purchasableResponse["data"]["styles"],
                title: purchasableResponse["data"]["title"],
                date_added: purchasableResponse["data"]["date_added"],
                number_for_sale: purchasableResponse["data"]["num_for_sale"],
                lowest_price: purchasableResponse["data"]["lowest_price"],
            }, 
            function (err: Error, release: Request) {
                if(err) return console.error(err);
            });
        }
        else{
            console.log("Retest still shows 0 available: " + purchasableResponse["data"]["title"] + ' ' + purchasableResponse["data"]["num_for_sale"]);
        }

        await recordModelAll.findOneAndDelete().sort({"created_at": 1});
    }

}

async function addAlbumToNotForSale(nextAlbum: currentRecord){

    await recordModelAll.create({
        link: nextAlbum["response"]["data"]["uri"],
        api_link: nextAlbum["response"]["data"]["resource_url"],
        cover_art: (nextAlbum["cover"] !== undefined) ? nextAlbum["cover"] : ' ',
        release_year: nextAlbum["response"]["data"]["year"],
        artist_name: nextAlbum["response"]["data"]["artists"]["name"],
        genres: nextAlbum["response"]["data"]["genres"],
        styles: nextAlbum["response"]["data"]["styles"],
        title: nextAlbum["response"]["data"]["title"],
        date_added: nextAlbum["response"]["data"]["date_added"],
        number_for_sale: nextAlbum["response"]["data"]["num_for_sale"],
        lowest_price: nextAlbum["response"]["data"]["lowest_price"],
    }, 
    function (err: Error, release: Request) {
        if(err) return console.error(err);
    });

}

async function addAlbumToForSale(nextAlbum: currentRecord){

    await recordModelBuy.create({
        link: nextAlbum["response"]["data"]["uri"],
        api_link: nextAlbum["response"]["data"]["resource_url"],
        cover_art: (nextAlbum["cover"] !== undefined) ? nextAlbum["cover"] : ' ',
        release_year: nextAlbum["response"]["data"]["year"],
        artist_name: nextAlbum["response"]["data"]["artists"]["name"],
        genres: nextAlbum["response"]["data"]["genres"],
        styles: nextAlbum["response"]["data"]["styles"],
        title: nextAlbum["response"]["data"]["title"],
        date_added: nextAlbum["response"]["data"]["date_added"],
        number_for_sale: nextAlbum["response"]["data"]["num_for_sale"],
        lowest_price: nextAlbum["response"]["data"]["lowest_price"],
    }, 
    function (err: Error, release: Request) {
        if(err) return console.error(err);
    }); 

}

async function trimNotForSale(){

    const findCountForSale = await recordModelBuy.collection.countDocuments({});
    
    if(findCountForSale > 5000){
        recordModelBuy.findOneAndDelete().sort({"created_at": 1});  
    }
}