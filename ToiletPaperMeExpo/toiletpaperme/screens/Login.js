// components/login.js

import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as GoogleService from '../services/google.js';
import i18n from 'i18n-js';


export default class Login extends Component {
  
  constructor(props) {
    super(props);
    this.state = { 
      email: '', 
      password: '',
      isLoading: false
    }
  }

  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  userLogin = () => {
    if(this.state.email === '' && this.state.password === '') {
      Alert.alert(i18n.t('informationEmpty'))
    } else {
      this.setState({
        isLoading: true,
      })
      GoogleService.init()
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((res) => {
        console.log('User logged-in successfully!')
        if (this.props.route.params.origin == 'addStore') {
          this.props.navigation.navigate('AddStore', {
            userLocationLatitude: this.props.route.params.userLocationLatitude,
            userLocationLongitude: this.props.route.params.userLocationLongitude,
            loggedUser: res.user.email,
          });
        }

        else if (this.props.route.params.origin == 'updateStore') {
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
      .catch((error) => {
        var errorCode = error.code;
        this.setState({
          isLoading: false,
          email: '', 
          password: ''
        })
        //var errorMessage = error.message;
        if (errorCode == 'auth/wrong-password' || errorCode == 'auth/user-not-found' || errorCode == 'auth/invalid-email') {
          Alert.alert(i18n.t('loginEmailPasswordWrong'));
        } else {
          Alert.alert(i18n.t('SignupGeneralError'));
        }
        console.log(error);
      });
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
        <Text style={styles.infoText}>
          {i18n.t('forceLoginInformation')}
        </Text>
        <TextInput
          style={styles.inputStyle}
          autoCapitalize = 'none'
          autoCompleteType = 'email'
          placeholder={i18n.t('email')}
          value={this.state.email}
          onChangeText={(val) => this.updateInputVal(val, 'email')}
        />
        <TextInput
          style={styles.inputStyle}
          autoCapitalize = 'none'
          autoCompleteType = 'password'
          placeholder={i18n.t('password')}
          value={this.state.password}
          onChangeText={(val) => this.updateInputVal(val, 'password')}
          maxLength={15}
          secureTextEntry={true}
        />   
        <TouchableOpacity
          style={styles.LogInButton}
          color="#3740FE"
          title={i18n.t('login')}
          onPress={() => this.userLogin()}
        >
          <Text 
            style={styles.LogInText}>
            {i18n.t('login')}
          </Text>     
        </TouchableOpacity>

        <Text 
          style={styles.SignUpText}
          onPress={() => {

            if (this.props.route.params.origin == 'addStore') {
              this.props.navigation.navigate('Signup', {
                origin: this.props.route.params.origin,
                userLocationLatitude: this.props.route.params.userLocationLatitude,
                userLocationLongitude: this.props.route.params.userLocationLongitude,
              });
            }
    
            else if (this.props.route.params.origin == 'updateStore') {
              this.props.navigation.navigate('Signup', {
                origin: this.props.route.params.origin,
                storeType: this.props.route.params.storeType,
                storeName: this.props.route.params.storeName,
                storeId: this.props.route.params.storeId,
              });
            }

          }}>
          {i18n.t('noAccountText')}
        </Text>
        <Text 
          style={styles.SignUpText}
          onPress={() => {
                this.props.navigation.navigate('Password reset', {
                  storeName: this.props.route.params.storeName,
                  storeId: this.props.route.params.storeId,
              });
          }}>
          {i18n.t('passwordForgotQuestion')}
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
  LogInText: {
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
  LogInButton: {
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