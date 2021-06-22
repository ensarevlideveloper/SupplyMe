import React, { Component } from 'react';
import MainStackNavigator from './navigation/MainStackNavigator.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppLoading } from 'expo';
//import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import Constants from 'expo-constants';




import de from './languages/de';
import en from './languages/en';
import es from './languages/es';
import fr from './languages/fr';
import it from './languages/it';
import nl from './languages/nl';
import tr from './languages/tr';


i18n.translations = {
  de : de,
  en : en,
  es : es,
  fr : fr,
  it : it,
  nl : nl,
  tr : tr,
}

i18n.locale = Localization.locale;
i18n.defaultLocale = 'en';
i18n.fallbacks = true;

/*
function cacheImages(images) {
  return images.map(image => {
      return Asset.fromModule(image).downloadAsync();
  });
}
*/

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}


export default class App extends Component {
  state = {
    isReady: false,
  };


  async _cacheResourcesAsync() {
    const fontAssets = cacheFonts([
      FontAwesome.font,
      Ionicons.font
    ])

    await Promise.all([fontAssets])
  }

  render() {
    console.log(Constants.nativeAppVersion)

    if(!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this.setState({ isReady : true})}
          onError={console.warn}
        />
      );
    }

    return (
      <SafeAreaProvider>
        <MainStackNavigator></MainStackNavigator>
      </SafeAreaProvider>
    );
  }
}

       