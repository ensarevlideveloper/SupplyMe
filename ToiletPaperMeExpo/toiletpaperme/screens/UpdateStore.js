import React, { Component } from 'react';
import { StyleSheet, View, Text, Picker, Alert, TouchableOpacity, Dimensions} from 'react-native'
import * as GoogleService from '../services/google';
import SafeAreaView from 'react-native-safe-area-view';
import i18n from 'i18n-js';


const { width, height } = Dimensions.get('screen');

export default class UpdateStore extends Component {
  state = {
    availabilityPickerValue: '1',
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

  renderRest = () => {
    return (
      <View style={styles.restContainer}>
        <Text style={styles.text}>{i18n.t('chooseAvailability')}</Text>
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
          onPress={()=> this.submitAvailability()}
        >
                  <Text style={styles.buttonText}>{i18n.t('submitUpdate')}</Text>
        </TouchableOpacity> 
      </View>
    )
  }

  submitAvailability = async () => {
    var storeId = this.props.route.params.storeId;
    var availability = parseInt(this.state.availabilityPickerValue);
    if (this.props.route.params.storeType == 'toiletpaper') {
      var res = await GoogleService._setMarketAvailabilityToiletpaper(storeId, availability);
    } 
    else if (this.props.route.params.storeType == 'mask') {
      var res = await GoogleService._setMarketAvailabilityMask(storeId, availability);
    }
    if (res == 0) {
      Alert.alert(
        i18n.t('updateSubmittedInfo'),
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

    render() {
        return (
            <SafeAreaView style={styles.container} forceInset={{bottom: 'always'}}>
              {this.renderHeader()}
              <View style={styles.InnerContainer}>
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
    flex: 1,
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

    alignSelf: 'center',
    width: '90%',
    flex:1,
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

  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  }
})

