import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as GoogleService from '../services/google.js';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';


export default class PasswordReset extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      email: '', 
      isLoading: false
    }
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  passwordReset = () => {
    if(this.state.email === '') {
      Alert.alert(i18n.t('resetPasswordEmailError'))
    } else {
      this.setState({
        isLoading: true,
      })
      GoogleService.init().auth().languageCode = ''+Localization.locale.toString();
      GoogleService.init()
      .auth()
      .sendPasswordResetEmail(this.state.email)
      .then((res) => {
        console.log(res)
        console.log(i18n.t('resetPasswordSuccess'))
        this.setState({
          isLoading: false,
          email: '', 
        })
        Alert.alert(
          i18n.t('resetPasswordSuccessAlertTitle'),
          i18n.t('resetPasswordSuccessAlertInfo'),
            [
              {text: i18n.t('ok'), onPress: () => this.props.navigation.navigate('Login', {
                storeName: this.props.route.params.storeName,
                storeId: this.props.route.params.Id,
              })}
            ]
          );
      })
      .catch((error) => {
        var errorCode = error.code;
        this.setState({
          isLoading: false,
          email: '', 
        })
        //var errorMessage = error.message;
        Alert.alert(
          i18n.t('SignupEmailNotValid'),        
          [
            {text: i18n.t('ok'), onPress: () => this.props.navigation.navigate('Login', {
              storeName: this.props.route.params.storeName,
              storeId: this.props.route.params.Id,
            })}
          ]);
        console.log(error);
      });
    }
  }
  //ensarevli@gmail.com
  render() {
    if(this.state.isLoading){
      return(
        <View style={styles.preloader}>
          <ActivityIndicator size="large" color="#9E9E9E"/>
        </View>
      )
    }    
    return (
      <View style={styles.container}> 
        <Text style={styles.infoText}>
          {i18n.t('resetPasswordInfo')}
        </Text>
        <TextInput
          style={styles.inputStyle}
          placeholder="Email"
          autoCapitalize = 'none'
          value={this.state.email}
          onChangeText={(val) => this.updateInputVal(val, 'email')}
        />
        <TouchableOpacity
          style={styles.ResetButton}
          color="#3740FE"
          title="Reset"
          onPress={() => this.passwordReset()}
        >
          <Text 
            style={styles.ResetText}>
            Reset
          </Text>     
        </TouchableOpacity>                 
      </View>
    );
  }
}
//ensarevli@gmail.com
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 35,
    backgroundColor: '#fff'
  },
  infoText: {
    fontSize: 16,
    position: 'relative',
    top: -25,
  },
  inputStyle: {
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    alignSelf: "center",
    borderColor: "#ccc",
    borderBottomWidth: 1
  },
  ResetText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  ResetButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
    top: -10,
  },
  SignUpText: {
    color: '#318bfb',
    marginTop: 25,
    textAlign: 'center'
  },
});