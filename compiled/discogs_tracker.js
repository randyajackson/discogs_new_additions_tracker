"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var fs = __importStar(require("fs"));
var cheerio = __importStar(require("cheerio"));
var mongoose = require('mongoose');
var axios = require('axios');
require('dotenv').config({ path: '../.env' });
var api_url = "http://api.discogs.com/releases/";
var start_id;
var newErrorCount = 0;
var recordSchema = new mongoose_1.Schema({
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
}, { timestamps: { createdAt: 'created_at' } });
var db = mongoose.connect(process.env.PURCHASABLE, { useNewUrlParser: true });
var db2 = mongoose.createConnection(process.env.NON_PURCHASABLE, { useNewUrlParser: true });
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
var recordModelBuy = db.model('new_record_purchasable', recordSchema);
var recordModelAll = db2.model('new_record_all', recordSchema);
db.once('open', function () {
    beginCollection();
});
function beginCollection() {
    return __awaiter(this, void 0, void 0, function () {
        var data, nextAlbum;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getStartID();
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    data = fs.readFileSync('./currentID', 'utf8');
                    data = String(start_id);
                    fs.writeFileSync('./currentID', data);
                    return [4 /*yield*/, getNextAlbum()
                            .catch(function (errors) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log('Error in getdata(), waiting 5 minutes and trying again' + ' start_id = ' + start_id);
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () {
                                                newErrorCount++;
                                                console.log(newErrorCount);
                                                if (newErrorCount >= 3)
                                                    start_id += 3;
                                                resolve(resolve);
                                            }, 300000); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    nextAlbum = _a.sent();
                    if (nextAlbum !== undefined && nextAlbum["response"]["status"] === 200) {
                        newErrorCount = 0;
                        start_id += 3;
                        console.log('Status 200: adding ' + nextAlbum["response"]["data"]["uri"] + ' ' + nextAlbum["response"]["data"]["title"] + ' ' + (nextAlbum["response"]["data"]["genres"] ? nextAlbum["response"]["data"]["genres"] : '') + (nextAlbum["cover"] !== "" ? ' with cover' : ' without cover') + ' and ' + nextAlbum["response"]["data"]["num_for_sale"] + ' for sale. ' + start_id);
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
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getStartID() {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            data = fs.readFileSync('./currentID', 'utf8');
            start_id = Number(data.toString());
            return [2 /*return*/];
        });
    });
}
function getNextAlbum() {
    return __awaiter(this, void 0, void 0, function () {
        var returnVars, _a, getCover, $;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    returnVars = {
                        "response": {},
                        "cover": ""
                    };
                    _a = returnVars;
                    return [4 /*yield*/, axios.get(api_url + String(start_id))];
                case 1:
                    _a.response = _b.sent();
                    if (!(returnVars.response !== null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, axios.get(returnVars["response"]["data"]["uri"])];
                case 2:
                    getCover = _b.sent();
                    $ = cheerio.load(getCover);
                    returnVars.cover = $('picture').children('img').eq(0).attr('src');
                    if (returnVars.cover === undefined)
                        returnVars.cover = "";
                    _b.label = 3;
                case 3: return [2 /*return*/, returnVars];
            }
        });
    });
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
//# sourceMappingURL=discogs_tracker.js.map