import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { Title } from 'react-native-paper';

// use custom style sheet
const styles = require('./Style.js');

export function WelcomeScreen({ route, navigation }) {
    return (
        <SafeAreaView style={[styles.safeView, styles.container]}>
            
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        Do It. Smart.
                    </Text>
                </View>
                <TouchableOpacity style={styles.mainButton}
                    onPress={() => { navigation.navigate('Tasks'); }}>
                    <Text style={styles.buttonText}>Tasks</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainButton}
                    onPress={() => { navigation.navigate('Register'); }}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

        </SafeAreaView>
    );
}
