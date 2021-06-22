import React, { Component } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import {
  TouchableOpacity,
} from 'react-native-gesture-handler';
import { StyleSheet, 
        View, 
        Text, 
        Platform, 
        Dimensions, 
        Keyboard,
        ActivityIndicator,
        Image,
        ScrollView
        } from 'react-native'
        
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import MapView  from 'react-native-maps';
import { Marker } from 'react-native-maps';
import * as GoogleService from '../services/google';
import PlacesInput from 'react-native-places-input';
import BottomSheet from 'reanimated-bottom-sheet';
import SafeAreaView from 'react-native-safe-area-view';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import i18n from 'i18n-js';



const { width } = Dimensions.get('screen').width;
const height  = Dimensions.get('screen').height;



const deltas = {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

export default class Home extends Component {
    
    state = {
        region: null,
        markets: [],
        storesMask: [],
        errorMessage: null,
        currentMarker: null,
        loadingUser: null,
        user: null,
        isLoadingToiletpaper: null,
        isLoadingMask: null,
        updatePending: false,
        activeTab: null,
    };
  
    
    constructor(props) {
        super(props);
        this.state = {
          region: null,
          markets: [],
          storesMask: [],
          errorMessage: null,
          currentMarker: null,
          loadingUser: true,
          user: null,
          isLoadingToiletpaper: true,
          isLoadingMask: true,
          updatePending: false,
          activeTab: 'toiletpaper',
        };
        this.mapCamLocation = null;
        this.fireBaseInstance = null;
        this.bottomSheetRef = React.createRef();
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.initDBConnection();
            this._getLocationAsync();
            this.setState({
              errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
          this.initDBConnection();
          this._getLocationAsync();
        }
    }

    componentDidMount() {
      this.comeToFocus = this.props.navigation.addListener('focus', (shouldRefresh) => {
       if (this.state.region != null) {
          this.refreshPage();

       }
      });
      this.fireBaseInstance.auth().onAuthStateChanged((user) => {

        if(user) {
          this.setState({ loadingUser: false, user: user });
        }
        else {
          this.setState({ loadingUser: true, user: null});
        }
      });
    }

    componentWillUnmount() {
      this.comeToFocus();
    }


    
    initDBConnection() {
        this.fireBaseInstance = GoogleService.init();
    }
    
      
    _getLocationAsync = async () => {
        let isObsolete = await GoogleService.isObsolete();
        if (isObsolete) {
          this.setState({updatePending : true});
        }
        else {
          let { status } = await Permissions.askAsync(Permissions.LOCATION);
          var region;
          if (status !== 'granted') {
            this.setState({
              errorMessage: i18n.t('locationPermissionDeniedError'),
            });
            region = this.mapCamLocation;
          }
          else {
            let location = await Location.getCurrentPositionAsync({});
            region = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: deltas.latitudeDelta,
              longitudeDelta: deltas.longitudeDelta,
            }
          }
          this.mapCamLocation =region;
          this.setState({ region: region });
          this.map.animateToRegion(region);
          this._getMarketsAsync(region);
          this._getStoresMaskAsync(region);
        }
    };
    
    _getMarketsAsync = async (region) => {
        const userLocation = {  latitude: region.latitude,
                                longitude: region.longitude,
                              };
        GoogleService.getMarkets(userLocation, this.setMarkets);
    };

    _getStoresMaskAsync = async (region) => {
      const userLocation = {  latitude: region.latitude,
                              longitude: region.longitude,
                            };
      GoogleService.getStoresMask(userLocation, this.setStoresMask);
  };
    
    setMarkets = (market) => {
        var arr = [];
        arr = market;
        this.setState({ markets: arr, isLoadingToiletpaper: false})
        this.forceUpdate();
    };

    setStoresMask = (market) => {
      var arr = [];
      arr = market;
      this.setState({ storesMask: arr, isLoadingMask: false})
      //console.log("mask Loaded")
      this.forceUpdate();
  };

    refreshPage = () => {
      if (this.state.activeTab == 'toiletpaper') {
        this.setState({isLoadingToiletpaper: true})
        this._getMarketsAsync(this.mapCamLocation);
      }
      else {
        this.setState({isLoadingMask: true})
        this._getStoresMaskAsync(this.mapCamLocation);
      }

    }


    openBottomSheet() {
      this.bottomSheetRef.current.snapTo(1);
    }

    handleTab = (tabKey) => {
      this.bottomSheetRef.current.snapTo(0);
      this.setState({ activeTab : tabKey});
      this.bottomSheetRef.current.snapTo(0);
    };


    renderSearchBar () {
      return (
        <View style={{width:'90%',height:'100%'}}>

              <PlacesInput
                  stylesContainer={{zIndex: 100}}
                  googleApiKey={'XXX'}
                  placeHolder={i18n.t('searchPlacePlaceholder')}
                  language={"en-US"}
                  onSelect={place => {
                      const selectedRegion = {
                          latitude: place.result.geometry.location.lat,
                          longitude: place.result.geometry.location.lng,
                          latitudeDelta: deltas.latitudeDelta,
                          longitudeDelta: deltas.longitudeDelta,
                      };
                      this.map.animateToRegion(selectedRegion);
                      this.setState ({region: selectedRegion, isLoading: true});
                      this._getMarketsAsync(selectedRegion);
                      this._getStoresMaskAsync(selectedRegion);
                      Keyboard.dismiss();
                  }}
                  iconResult={<Ionicons name="md-pin" size={25} style={styles.placeIcon}/>}
              />
            
      </View >
      );
    }


    renderTabs () {
      return (
      <View style={styles.tabs}>
          <View
          style={[styles.tab, this.state.activeTab === "toiletpaper" ? styles.activeTab : null]}
          >
              <Text
                  style={ [styles.tabTitle, this.state.activeTab === "toiletpaper" ? styles.activeTabTitle : null] }
                  onPress = {() => { this.handleTab("toiletpaper");
                }}
              >
                  {i18n.t('tabTitleToiletPaper')}
              </Text>
          </View>
          <View
          style={[styles.tab, this.state.activeTab === "mask" ? styles.activeTab : null]}
          >
              <Text
                  style={ [styles.tabTitle, this.state.activeTab === "mask" ? styles.activeTabTitle : null] }
                  onPress = {() => { 
                    this.handleTab("mask"); }}
              >
                 {i18n.t('maskTab')}
              </Text>
          </View>
      </View>
      );
    }

    renderHeader () {
        return (
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <View style={styles.headerUpperContainer}>
                  <View style={styles.location}>
                      <FontAwesome
                        name="location-arrow"
                        size={20}
                        color="white"
                        onPress={() => this._getLocationAsync()}
                      />
                  </View>
                  {this.renderSearchBar()}
                </View>
                {this.renderTabs()}
              </View>
            </View>
          );
    }

    renderFooterInner = () => {
      if(this.state.currentMarker == null) {
          return(
              <View style={styles.footerPanel}>
              <Text style={styles.footerPanelTitle}>None</Text>
              <Text style={styles.footerPanelSubtitle}>
                No Information aquired.
              </Text>
            </View>
          );
      }
      else {
          const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
          var marker = this.state.currentMarker;
          var lastUpdateString;
          if (marker.time == 0) {
            lastUpdateString = "-"
          }
          else {
            let currentDate = new Date(marker.time);
            lastUpdateString = currentDate.getDate() + "-" + months[currentDate.getMonth()] + "-" + currentDate.getFullYear() + " " +
            currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
          }
          return(
              <View style={styles.footerPanel}>
              <Text style={styles.footerPanelTitle}>{marker.name}</Text>
              <Text style={styles.footerPanelSubtitle}>
                {marker.availabilityString + "\n"}{i18n.t('lastUpdateInformation')} {lastUpdateString}
              </Text>
              <TouchableOpacity style={styles.footerPanelButton} onPress={()=> {

                  if(this.state.loadingUser == false) {
                    console.log("Navigating to update store")
                    this.props.navigation.navigate('UpdateStore', {
                      storeType: this.state.activeTab,
                      loggedUser: this.state.user.email,
                      storeName: marker.name,
                      storeId: marker.placeId,
                    })
                  }
                  else {
                    this.props.navigation.navigate('Login', {
                      origin: "updateStore",
                      storeType: this.state.activeTab,
                      storeName: marker.name,
                      storeId: marker.placeId,
                    })
                  }
                  }}>
                <Text style={styles.footerPanelButtonTitle}>{i18n.t('updateMarketButtonLabel')}</Text>
              </TouchableOpacity>
            </View>
          );
      }
    };

    renderFooterSheet = () => (
      <View style={styles.FooterHeaderContainer}>
        <View style={styles.FooterHeaderPanelContainer}>
          <View style={styles.FooterHandleContainer} />
        </View>
      </View>
    )

    renderFooter() {
        return (
            <BottomSheet
            ref={this.bottomSheetRef}
            snapPoints={['0%', height * (0.35-((1/height)*getBottomSpace()))]}
            renderHeader={() => this.renderFooterSheet()}
            renderContent={() => this.renderFooterInner()}
            initialSnap={0} //this line gives the error described
            enabledInnerScrolling={false}
          />
        );
        
    };

    renderActivityIndicatorToiletpaper = () => {
      if(this.state.isLoadingToiletpaper == true) {
        return(
        <View style={styles.preloader}>
          <ActivityIndicator size="large" color="#9E9E9E"/>
        </View>
        )
      }

    }

    renderActivityIndicatorMask = () => {
      if(this.state.isLoadingMask == true) {
        return(
        <View style={styles.preloader}>
          <ActivityIndicator size="large" color="#9E9E9E"/>
        </View>
        )
      }

    }

    renderMap() {
       // const { markets } = this.state;
       if (this.state.activeTab == 'toiletpaper') {
          return (
          <View style={styles.mapContainer}>
            <MapView 
            showsMyLocationButton={false}
            provider="google"
            key = "firstMapView"
            style={styles.map}
            initialRegion = {this.state.region}
            ref={ref=>this.map=ref}
            showsUserLocation = {true}
            onRegionChangeComplete = {(newMapCamLocation) => { this.mapCamLocation = newMapCamLocation; }}
            >
            {this.state.markets.map((marker) => {
                    var iconToiletpaper;
                    switch (marker.imageString) {
                        case("toiletpaper_black.png"):
                        iconToiletpaper = require('../images/toiletpaper/toiletpaper_black.png');
                        break;
                        case("toiletpaper_red.png"):
                        iconToiletpaper = require('../images/toiletpaper/toiletpaper_red.png');
                        break;
                        case("toiletpaper_yellow.png"):
                        iconToiletpaper = require('../images/toiletpaper/toiletpaper_yellow.png');
                        break;
                        case("toiletpaper_green.png"):
                        iconToiletpaper = require('../images/toiletpaper/toiletpaper_green.png');
                        break;
                    }
                    return (
                    <Marker 
                        onPress={() => {this.setState({currentMarker : marker});
                        this.openBottomSheet()}}
                        key = {marker.placeId+'toiletpaper'}
                        coordinate={marker.coordinate}
                        //title={marker.name}
                        image={iconToiletpaper}
                    >
                    </Marker>
                    );
            })}
            </MapView>
            {this.renderRefreshButton()}
            {this.renderActivityIndicatorToiletpaper()}
          </View>
          );
        }
        else if (this.state.activeTab == 'mask') {
          return (
            <View style={styles.mapContainer}>
            <MapView 
            showsMyLocationButton={false}
            provider="google"
            key = "firstMapView"
            style={styles.map}
            initialRegion = {this.state.region}
            ref={ref=>this.map=ref}
            showsUserLocation = {true}
            onRegionChangeComplete = {(newMapCamLocation) => { this.mapCamLocation = newMapCamLocation; }}
            >
            {this.state.storesMask.map((marker) => {
                    var iconMask;
                    switch (marker.imageString) {
                        case("black"):
                        iconMask = require('../images/mask/mask_black.png');
                        break;
                        case("red"):
                        iconMask = require('../images/mask/mask_red.png');
                        break;
                        case("yellow"):
                        iconMask = require('../images/mask/mask_yellow.png');
                        break;
                        case("green"):
                        iconMask = require('../images/mask/mask_green.png');
                        break;
                    }

                    return (
                    <Marker 
                        onPress={() => {this.setState({currentMarker : marker});
                        this.openBottomSheet()}}
                        key = {marker.placeId+'mask'}
                        coordinate={marker.coordinate}
                        image={iconMask}
                    >
                    </Marker>
                    );
            })}
            </MapView>

            {this.renderRefreshButton()}
            {this.renderAddMaskButton()}
            {this.renderActivityIndicatorMask()}

          </View>
          );
        }
      };

  renderRefreshButton () {
    return (
      <View style={styles.refreshButtonContainer}>
        <TouchableOpacity onPress={() => this.refreshPage()}>
          <Ionicons name="ios-refresh" size={28} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

  renderAddMaskButton () {
    return (
      <View style={styles.addMaskButtonContainer}>
        <TouchableOpacity onPress={() => {
        if(this.state.loadingUser == false) {
          this.props.navigation.navigate('AddStore',{
            loggedUser: this.state.user.email,
            userLocationLatitude: this.state.region.latitude,
            userLocationLongitude: this.state.region.longitude
          })
        }
        else {
          this.props.navigation.navigate('Login', {
            origin: 'addStore',
            userLocationLatitude: this.state.region.latitude,
            userLocationLongitude: this.state.region.longitude
          })
        }
        
        }}>
          <MaterialIcons name="add-location" size={28} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

      
  render() {
    if(this.state.updatePending == false) {
      return (
        <SafeAreaView style={{flex:1}} forceInset={{bottom:'never'}}>
          <View style={styles.container}>
            {this.renderHeader()}
            {this.renderMap()}
            {this.renderFooter()}
          </View>
        </SafeAreaView>
        );
      }
    else {
      return(
        <View style= {{flex:1, alignContent: 'center', justifyContent: 'center'}}>
          <Text>{i18n.t('appVersionObsolete')}</Text>
        </View>
      );
    }
  }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    headerContainer: {
      //top: 0 + getStatusBarHeight(),
      height: '15%',
      width: '100%',
      display: 'flex',
    },
    header: {
        flex: 1,
        display: 'flex',
        flexDirection: "column",
        alignItems: "center",
        //justifyContent: "center",
        paddingHorizontal: 14,
    },
    headerUpperContainer: {
      flexDirection: "row", 
      height: '70%', 
      alignContent:'center', 
      alignItems
      :'center', 
      alignSelf:'center', 
      justifyContent:'center'
    },
    tabs: {
        position: 'absolute',
        flex: 1,
      //  zIndex:15,
        bottom: 0,
        //height:'20%',
        //bottom: -height*0.15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end"
    },
    tab: {
        //bottom: height * 0.15

        paddingHorizontal: 14,
        marginHorizontal: 10,
        borderBottomWidth: 3,
        borderBottomColor: "transparent"
    },
    tabTitle: {
        fontWeight: "bold",
       // zIndex:11,

        fontSize: 14,
        marginBottom: 7
    },
    activeTab: {
        borderBottomColor: "#66CCCC"
    },
    activeTabTitle: {
       // zIndex:11,
        color: "#66CCCC"
    },
    location: {
        alignSelf: 'center',
        height: 28,
        width: 28,
        left:'-5%',
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#66CCCC"
    },
    mapContainer: {
       // top: he,

        height: '85%',
        width: '100%',
    },
    map: {
      height: '100%', 
      width: '100%',
    },
    refreshButtonContainer: {
        width: 28,
        height: 28,
        top: '-100%',
        left: '3%',
    },
    addMaskButtonContainer: {
      width: 28,
      height: 28,
      top: '-98%',
      left: '2.3%',
    },
    preloader: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5FCFF88',

    },

    bottomSheetContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      //height:height*0.2,
    },
    FooterHeaderContainer: {
      backgroundColor: '#f7f5eee8',
      shadowColor: '#000000',
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    FooterHeaderPanelContainer: {
      alignItems: 'center',
    },
    FooterHandleContainer: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10,
    },
    footerPanel: {
      height: 600,
      padding: 20,
      backgroundColor: '#f7f5eee8',
    },
    footerPanelTitle: {
      fontSize: 27,
      height: 40,
      marginBottom: 10,
      top: -10,
    },
    footerPanelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 35,
      lineHeight: 17,
      top: -10,
    },
    footerPanelButton: {


    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
    //top: -10,
    },
    footerPanelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },



      
});
