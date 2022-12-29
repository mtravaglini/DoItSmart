import React from 'react';
import {
  Text,
  View,
} from 'react-native';

// use custom style sheet
const styles = require('./Style.js');

export function RegisterScreen({route, navigation}) {
    return (
      <View style={styles.container}>
        <Text>Resgister</Text>
      </View>
    );
  }
  