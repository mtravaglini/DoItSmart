import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
} from 'react-native';

// use custom style sheet
const styles = require('./Style.js');

export function WelcomeScreen({route, navigation}) {
    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.mainButton}
                onPress={() => {navigation.navigate('Tasks');}}>
                <Text style={styles.mainText}>Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainButton}
                onPress={() => {navigation.navigate('Register');}}>
                <Text style={styles.mainText}>Register</Text>
            </TouchableOpacity>

        </View>
    );
}
