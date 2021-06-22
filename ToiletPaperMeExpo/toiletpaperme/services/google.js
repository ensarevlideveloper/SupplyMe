import axios from 'axios';
import Constants from 'expo-constants';
import * as firebase from 'firebase';
import { GeoFire } from 'geofire';

import i18n from 'i18n-js';


const GOOGLE_API_KEY = 'XXX';
//const VERSION = 1;
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  databaseURL: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  measurementId: "XXX"
}

var geoFire;

export function init() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  var storesRef = firebase.database().ref('marketsLocations/');
  geoFire = new GeoFire (storesRef);
  return firebase;
}

export function getFireBaseInstance() {
  return firebase;
}

export async function isObsolete() {
  var returnData = false;
  //versionTest for testing, version for build
  var versionRef = firebase.database().ref('version/');
  await versionRef.once('value').then(snapshot => {
    if(snapshot.val() != Constants.nativeAppVersion) {
      returnData = true;
    }
    else {
      returnData = false;
    }
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  return returnData;
}
//type=grocery_or_supermarket|convenience_store|drugstore|department_store|home_goods_store
export async function getMarkets (userLocation, callbackSetMarkets) {
  var markets = [];
  await axios.get
  ('https://maps.googleapis.com/maps/api/place/nearbysearch/json?&key='+GOOGLE_API_KEY+'&location='+userLocation.latitude+','+userLocation.longitude+'&radius=5000&type=grocery_or_supermarket&fields=place_id, geometry, name')
  .then(async function(response) {
    await Promise.all(response.data.results.map(async function(item) {
      var marketAvailability = await _getMarketAvailabilityToiletpaper(item.place_id);
      var market = {
        coordinate : {
          latitude: item.geometry.location.lat,
          longitude: item.geometry.location.lng,
        },
        placeId : item.place_id,
        name : item.name,
        availability: marketAvailability.availability,
        time: 0,
        imageString: 0,
        availabilityString: 0,
      };

      switch (marketAvailability.availability) {
        case 0:
          market.time = 0;
          market.imageString = 'toiletpaper_black.png';                       
          market.availabilityString = i18n.t('noEntryInfo');
          break;
        case 1:
          market.time = marketAvailability.time;
          market.imageString = 'toiletpaper_red.png';
          market.availabilityString = i18n.t('noToiletpaperInfo');
          break;
        case 2:
          market.time = marketAvailability.time;
          market.imageString = 'toiletpaper_yellow.png';
          market.availabilityString= i18n.t('moderateToiletpaperInfo');
          break;  
        case 3: 
          market.time = marketAvailability.time;
          market.imageString = 'toiletpaper_green.png';
          market.availabilityString = i18n.t('fullToiletpaperInfo');
          break;
      };
      markets.push(market);
    }));
  })
  .catch(error => console.error(error));
  callbackSetMarkets(markets);

}


export async function getStoresMask(userLocation, callbackSetStores) {
  geoQuery = geoFire.query({
    center: [userLocation.latitude, userLocation.longitude],
    radius: 5,
  });


  var storesMask = [];
  var storesMaskPromises = [];
  var onKeyEnteredRegistration = geoQuery.on("key_entered", async function (key, location, distance) {
    storesMaskPromises.push(axios.get
    ('https://maps.googleapis.com/maps/api/place/details/json?&key='+GOOGLE_API_KEY+'&placeid='+key+'')
    .then(async function(response) {
      var marketMaskAvailability = await _getMarketAvailabilityMask(key);
      let item = response.data.result;
        var storeMask = {
          coordinate: {
            latitude: item.geometry.location.lat,
            longitude: item.geometry.location.lng,
          },
          placeId : key,
          name : item.name,
          availability: marketMaskAvailability.availability,
          time: 0,
          imageString: 0,
          availabilityString: 0,
        }

        switch (marketMaskAvailability.availability) {
          case 0:
            storeMask.time = 0;
            storeMask.imageString = 'black';                       
            storeMask.availabilityString = 'noEntryInfo';
            break;
          case 1:
            storeMask.time = marketMaskAvailability.time;
            storeMask.imageString = 'red';
            storeMask.availabilityString = i18n.t('noMaskInfo');
            break;
          case 2:
            storeMask.time = marketMaskAvailability.time;
            storeMask.imageString = 'yellow';
            storeMask.availabilityString= i18n.t('moderateMaskInfo');
            break;  
          case 3: 
            storeMask.time = marketMaskAvailability.time;
            storeMask.imageString = 'green';
            storeMask.availabilityString = i18n.t('fullMaskInfo');
            break;
        };
        storesMask.push(storeMask);
    })
    .catch(error => console.error(error)))

  });

  geoQuery.on("ready", async function() {
    // This will fire once the initial data is loaded, so now we can cancel the "key_entered" event listener
    await Promise.all(storesMaskPromises);
    onKeyEnteredRegistration.cancel();  
    callbackSetStores(storesMask);

  });


}



export async function _addStore(storeId, storeLocation, availability) {
    await geoFire.set(""+storeId, [storeLocation.latitude, storeLocation.longitude]).then(function() {
    }, function(error) {
      console.log("Error: " + error);
    });
    await _setMarketAvailabilityMask (storeId, availability)
    return 0;
     
}

export function _setMarketAvailabilityMask(placeId, availability) {
  var docRef = firebase.database().ref("markets/"+placeId);
  docRef.update({
      timeMask: Date.now(),
      availabilityMask: availability
    
  }).catch((error) => console.log(error));
  return 0;
}


export function _setMarketAvailabilityToiletpaper (placeId, availability) {
  var docRef = firebase.database().ref("markets/"+placeId);
  docRef.update({
      timeToiletpaper: Date.now(),
      availabilityToiletpaper: availability
    
  }).catch((error) => console.log(error));
  return 0;
}







export async function _getMarketAvailabilityToiletpaper (placeId) {
  var returnData = {
    availability: 0,
    time: 0
  }
  var storeRef = firebase.database().ref('markets/'+placeId);
  await storeRef.once('value').then(snapshot => {
    if (snapshot.val() == null) {
      returnData = {
        availability: 0,
        time: 0,
      }
    }
    else if (snapshot.val().availabilityToiletpaper != null){
      //console.log("Market found! Availability: "+snapshot.val().availability);
      
      returnData = {
        availability: snapshot.val().availabilityToiletpaper,
        time: snapshot.val().timeToiletpaper,
      }
    }
  }, function (errorObject) {
    //console.log("The read failed: " + errorObject.code);
  });
  return returnData;
}

export async function _getMarketAvailabilityMask (placeId) {
  var returnData = {
    availability: 0,
    time: 0
  }
  var storeRef = firebase.database().ref('markets/'+placeId);
  await storeRef.once('value').then(snapshot => {
    if (snapshot.val() == null) {
      //console.log('No such market!');
      returnData = {
        availability: 0,
        time: 0,
      }
    }
    else if (snapshot.val().availabilityMask != null){

      //console.log("Market found! Availability: "+snapshot.val().availability);
      returnData = {
        availability: snapshot.val().availabilityMask,
        time: snapshot.val().timeMask,
      }
    }
  }, function (errorObject) {
    //console.log("The read failed: " + errorObject.code);
  });
  return returnData;
}







