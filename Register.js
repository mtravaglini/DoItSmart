import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// use custom style sheet
const styles = require('./Style.js');

export function RegisterScreen({ route, navigation }) {
  return (
    <SafeAreaView style={[styles.safeView, styles.container]}>
      <Text>Resgister</Text>
    </SafeAreaView>
  );
}
