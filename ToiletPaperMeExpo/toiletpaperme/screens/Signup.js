

import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as GoogleService from '../services/google.js';
import i18n from 'i18n-js';


export default class Signup extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      displayName: '',
      email: '', 
      password: '',
      passwordConfirm: '',
      isLoading: false,
    }
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  registerUser = () => {
    if(this.state.email === '' || this.state.password === '') {
      Alert.alert(i18n.t('informationEmpty'))
    } 
    else if(this.state.password != this.state.passwordConfirm) {
      Alert.alert(i18n.t('passwordsDontMatch'))
    }
    else {
      this.setState({
        isLoading: true,
      })

      GoogleService.init().auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((res) => {
        /*
        res.user.updateProfile({
          displayName: this.state.displayName
        })
        */
        console.log('User registered successfully!')
        if(this.props.route.params.origin == "addStore") {
          this.props.navigation.navigate('AddStore', {
            userLocationLatitude: this.props.route.params.userLocationLatitude,
            userLocationLongitude: this.props.route.params.userLocationLongitude,
            loggedUser: res.user.email,
          });
        }
        else if(this.props.route.params.origin == "updateStore"){
          this.props.navigation.navigate('UpdateStore', {
            storeType: this.props.route.params.storeType,
            storeName: this.props.route.params.storeName,
            storeId: this.props.route.params.storeId,
            loggedUser: res.user.email,
          });
        }
        this.setState({
          isLoading: false,
          email: '', 
          password: ''
        })
      })
      .catch(function(error) {
        var errorCode = error.code;
        //var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          Alert.alert(i18n.t('signUpPasswordTooWeak'));
        } else if(errorCode== 'auth/invalid-email') {
            Alert.alert(i18n.t('signUpEmailNotValid'));
          }
          else if(errorCode == 'auth/email-already-in-use') {
            Alert.alert(i18n.t('signUpEmailInUse'));
          }
          else {
            Alert.alert(i18n.t('loginErrorGeneral'));
          }
        }
      );    
    }
  }

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
        <TextInput
          style={styles.inputStyle}
          autoCapitalize = 'none'
          placeholder={i18n.t('email')}
          value={this.state.email}
          onChangeText={(val) => this.updateInputVal(val, 'email')}
        />
        <TextInput
          style={styles.inputStyle}
          autoCapitalize = 'none'
          placeholder={i18n.t('password')}
          value={this.state.password}
          onChangeText={(val) => this.updateInputVal(val, 'password')}
          maxLength={15}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.inputStyle}
          autoCapitalize = 'none'
          placeholder={i18n.t('confirmPassword')}
          value={this.state.passwordConfirm}
          onChangeText={(val) => this.updateInputVal(val, 'passwordConfirm')}
          maxLength={15}
          secureTextEntry={true}
        />     
        <TouchableOpacity
          style={styles.SignupButton}
          color="#3740FE"
          title={i18n.t('confirmPassword')}
          onPress={() => this.registerUser()}
        >
          <Text 
            style={styles.SignUpText}>
            {i18n.t('signup')}
          </Text>     
        </TouchableOpacity>

        <Text 
          style={styles.loginText}
          onPress={() => this.props.navigation.navigate('Login')}>
          {i18n.t('alreadyAccount')}
        </Text>                          
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 35,
    backgroundColor: '#fff'
  },
  inputStyle: {
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    alignSelf: "center",
    borderColor: "#ccc",
    borderBottomWidth: 1
  },
  loginText: {
    color: '#318bfb',
    marginTop: 25,
    textAlign: 'center'
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
  SignupButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#318bfb',
    alignItems: 'center',
    marginVertical: 10,
    top: -10,
  },
  SignUpText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});