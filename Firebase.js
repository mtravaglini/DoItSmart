import React from 'react';
import {
  Text,
  View,
} from 'react-native';

// import database from '@react-native-firebase/database';
import { firebase } from '@react-native-firebase/database';

  
// use custom style sheet
const styles = require('./Style.js');

export function FirebaseScreen({route, navigation}) {

    const reference = firebase
    .app()
    .database('https://taskmanager-cm3070-default-rtdb.europe-west1.firebasedatabase.app/')
    .ref('/users/100');
  
    return (
      <View style={styles.container}>
        <Text>Firebase</Text>
        <Text>{reference}</Text>
      </View>
    );
  }
  