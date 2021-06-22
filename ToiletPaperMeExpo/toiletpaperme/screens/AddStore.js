import React, { Component } from 'react';
import { StyleSheet, View, Text, Picker, Alert, TouchableOpacity, Dimensions, Keyboard, Image, KeyboardAvoidingView, ScrollView } from 'react-native'
import * as GoogleService from '../services/google';
import SafeAreaView from 'react-native-safe-area-view';
import PlacesInput from 'react-native-places-input';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';





import i18n from 'i18n-js';

const { width } = Dimensions.get('window').width; //full width
const height = Dimensions.get('window').height; //full height

export default class AddStore extends Component {
  state = {
    availabilityPickerValue: '1',
    selectedStoreLocation: null,
    selectedStoreId: null,
    selectedStoreAddress:null,
  }
  constructor(props) {
    super(props);


    //this.state.availabilityPickerValue='1';

  }



  
  renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.text}>{i18n.t('currentlyLoggedInInformation')}</Text>
        <Text style={styles.text}>{this.props.route.params.loggedUser}</Text>
      </View>

    );
  }
  

  addStore = async (selectedStoreId, selectedStoreLocation, pickerValue) => {
    let availability = pickerValue;
    var res = await GoogleService._addStore(selectedStoreId, selectedStoreLocation, availability);
    if (res == 0) {
      Alert.alert(
        i18n.t('alertStoreAddSuccessTitle'),
        i18n.t('updateSubmittedSharingInfo'),
        [
          {text: i18n.t('backToMapButtonText'), onPress: () => this.props.navigation.navigate('Map')}
        ]
      );
    }
    else {
      Alert.alert(
        i18n.t('somethingWentWrong'),
        i18n.t('tryAgain'),
        [
          {text: i18n.t('ok')}
        ]
      );
    }
  };


  renderSearchBar () {
    if(this.state.selectedStoreAddress != null) {
      return(
      <View style={{ flexDirection: 'row', height:'10%'}}>
      <View style= {{width:'10%'}}>
          <Ionicons name="md-pin" size={25} style={styles.placeIcon} color = {"#66CCCC"}/>
      </View>
            <View style={{width: '85%'}}>
              <TouchableOpacity style={styles.selectedStoreAddressButton} onPress= {()=> this.setState({selectedStoreLocation: null, selectedStoreId: null, selectedStoreAddress: null })}>
                <Text style={styles.selectedStoreAddressButtonText}>
                  {this.state.selectedStoreAddress}
                </Text>
              </TouchableOpacity>
            </View>
    </View>
      );
    }
    else {
    return (
      <View style={{flexDirection: 'row', height:'10%'}}>
            <View style= {{width:'10%'}}>
                <Ionicons name="md-pin"
                  size={25} style={styles.placeIcon} color = {"#66CCCC"}/>
            </View>
            <View style={{width: '90%'}}>
                <PlacesInput
                    stylesContainer={{zIndex: 102}}
                    contentScrollViewBottom={
                      <Image source={require('../images/google/powered_by_google_on_white.png')}/>      
                    }
                    googleApiKey={'XXX'}
                    placeHolder={i18n.t('searchFindStore')}
                    language={Localization.locale}
                    queryFields="geometry,place_id,name"
                    queryTypes="establishment"
                    searchRadius={5000}
                    searchLatitude={this.props.route.params.userLocationLatitude}
                    searchLongitude={this.props.route.params.userLocationLongitude}
                    onSelect={place => {
                        const selectedStoreAddress = place.result.name;

                        //console.log(selectedStoreAddress)
                        const selectedStoreLocation = {
                            latitude: place.result.geometry.location.lat,
                            longitude: place.result.geometry.location.lng,
                        };
                        const selectedStoreId = place.result.place_id;
                        this.setState ({selectedStoreLocation: selectedStoreLocation, selectedStoreId: selectedStoreId , selectedStoreAddress: selectedStoreAddress});
                        Keyboard.dismiss();
                    }}
                    iconResult={<Ionicons name="md-pin" size={25} style={styles.placeIcon}/>}
                />
            </View>
    </View>
    );
  }
  }


  renderRest () {

    return(
    <View style={styles.restContainer}>
        <Text style={styles.text}>{i18n.t('chooseAvailabilityMask')}</Text>
        <Picker
      style={styles.pickerContainer}
      selectedValue={this.state.availabilityPickerValue}
      onValueChange={(value, index) => this.setState({availabilityPickerValue:value}) }
      accessibilityRole= 'radiogroup'
        >
        <Picker.Item label={i18n.t('stocksEmpty')} value="1"/>
        <Picker.Item label={i18n.t('stocksModerate')} value="2"/>
        <Picker.Item label={i18n.t('stocksFull')} value="3"/>
        </Picker>
    <TouchableOpacity 
      title="Submit update"
      style = {styles.buttonContainer}
      onPress={()=> {
        if(this.state.selectedStoreAddress != null) {
        this.addStore(this.state.selectedStoreId, this.state.selectedStoreLocation,parseInt(this.state.availabilityPickerValue))
        }
        else {
          Alert.alert(
            i18n.t('addStoreNoSelection'),
            i18n.t('addStoreNoSelectionDescription'),
            [
              {text: i18n.t('ok')}
            ]
          );
        }
      }}>
              <Text style={styles.buttonText}>{i18n.t('addStoreButton')}</Text>
    </TouchableOpacity>    
    </View>   
    );  
  }

    render() {
        return (
            <SafeAreaView style={styles.container} forceInset={{bottom: 'always'}}>
                {this.renderHeader()}
                <View style={styles.InnerContainer}>
                {this.renderSearchBar()}
                {this.renderRest()}
              </View>     
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: '#fff'
  },
  headerContainer: {
    //flex: 1,
    height:'10%',
    width: '100%',
    marginTop: 15,
    paddingTop: 15,
    marginBottom: 15,
    paddingBottom: 15,
    alignItems:'center',
    alignSelf: "flex-start",
    borderColor: "#66CCCC",
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  InnerContainer: {
    alignContent:'center',
    paddingTop:'10%',
    height: '90%',
    flexDirection: 'column',
  },
  restContainer: {
    flex: 1,
    padding: 70,
    alignSelf: 'center',
    height:'90%',
    width: '150%',  
  },

  pickerContainer: {
    width: '90%',
    alignSelf: 'center',

    // top: '-10%',
    flex: 1,
  },
  text: {
    alignSelf: 'center',
    color: '#101010',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignSelf: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  placeIcon: {
    alignSelf: 'center',
    top: '25%',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  selectedStoreAddressButton: {
    padding: 17,
    borderRadius: 10,
    backgroundColor: "#66CCCC",
    alignItems: 'center',
    top: '10%',
    left: '3%',
    },
  selectedStoreAddressButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
})

