import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import * as GoogleService from '../services/google.js';
import Home from '../screens/Home.js';
import UpdateStore from '../screens/UpdateStore.js';
import Signup from '../screens/Signup.js';
import Login from '../screens/Login.js';
import PasswordReset from '../screens/PasswordReset.js';
import AddStore from '../screens/AddStore.js';
import { Alert, Button } from 'react-native';
import i18n from 'i18n-js';

const Stack = createStackNavigator();


  //  createStackNavigator()

function MainStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName='Home'
        screenOptions={{
          gestureEnabled: true
        }}>
        <Stack.Screen 
            options={{headerShown: false, title: i18n.t('screenTitleMap')}}
            name='Map'
            component={Home} 
        />
        <Stack.Screen
          name='UpdateStore'
          component={UpdateStore}
          options={({ route, navigation }) => ({title: route.params.storeName, 
            headerRight: () => (
            <Button
              title={i18n.t('signoutButtonText')}
              style={{left:-10}}
              onPress={() => {
                GoogleService.init().auth().signOut().then(function() {
                  Alert.alert(
                  i18n.t('signedOutAlertTitle'),
                  i18n.t('signedOutSuccessfullyAlertTitle'),        
                  [
                    {text: i18n.t('backToMapButtonText'), onPress: () => navigation.navigate('Map')
                    }
                  ])
                }).catch(function(error) {
                  Alert.alert("Error", i18n.t('somethingWentWrong'),        
                  [
                    {text: i18n.t('ok')}
                  ])
                });
              }}
            />
          ),
          headerLeft: () => (
            <HeaderBackButton onPress={()=>{navigation.navigate("Map")}} label={i18n.t('screenTitleMap')}>
            </HeaderBackButton>
          ),
        })}
        />
        <Stack.Screen
          name='Login'
          component={Login}
          options={{ title: i18n.t('login') }}
        />
        <Stack.Screen
          name='Password reset'
          component={PasswordReset}
          options={{ title: i18n.t('screenTitleResetPassword') }}
        />
        <Stack.Screen
          name='Signup'
          component={Signup}
          options={{ title: i18n.t('screenTitleSignup') }}
        />
        <Stack.Screen
          name='AddStore'
          component={AddStore}
          options={({ navigation }) => ({title: i18n.t('addStoreTitle'), 
            headerRight: () => (
            <Button
              title={i18n.t('signoutButtonText')}
              style={{left:-10}}
              onPress={() => {
                GoogleService.init().auth().signOut().then(function() {
                  Alert.alert(
                  i18n.t('signedOutAlertTitle'),
                  i18n.t('signedOutSuccessfullyAlertTitle'),        
                  [
                    {text: i18n.t('backToMapButtonText'), onPress: () => navigation.navigate('Map')
                    }
                  ])
                }).catch(function(error) {
                  Alert.alert("Error", i18n.t('somethingWentWrong'),        
                  [
                    {text: i18n.t('ok')}
                  ])
                });
              }}
            />
          ),
          headerLeft: () => (
            <HeaderBackButton onPress={()=>{navigation.navigate("Map")}} label={i18n.t('screenTitleMap')}>
            </HeaderBackButton>
          ),
        })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default MainStackNavigator