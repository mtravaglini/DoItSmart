import React from 'react';
import {
  Text,
  View,
} from 'react-native';

// use custom style sheet
const styles = require('./Style.js');

export function TaskDetailScreen({route, navigation}) {
    return (
      <View style={styles.container}>
        <Text>TaskDetail</Text>
      </View>
    );
  }
  