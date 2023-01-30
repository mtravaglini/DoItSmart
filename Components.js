import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signOut } from "firebase/auth";

// use custom style sheet
const styles = require('./Style.js');

export function scheduleTasks(unscheduled_tasks) {
    var scheduled_tasks = unscheduled_tasks;
    return scheduled_tasks;
}

export const Title = props => {
    return (
        <View>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Pressable style={{ position: "absolute", left: "1%" }}
                    onPress={() => props.navigation.goBack()}
                >
                    <Text>
                        <FontAwesome
                            style={styles.listDelIcon}
                            name='arrow-circle-o-left'
                            color='cornflowerblue'
                        />
                    </Text>
                </Pressable>
                <Text style={[styles.pageTitleText]}>
                    {props.title}
                </Text>
            </View>

            <Text style={styles.pageSubTitleText}>
                {props.name}
            </Text>
        </View>
    )
}

export const Footer = props => {
    return (
        <View style={styles.footer}>

            <Pressable
                onPress={() => { props.navigation.navigate('Tasks', { uid: props.uid }) }}
            >
                <FontAwesome
                    style={styles.footerIcon}
                    name='tasks'
                    color='black'
                />
            </Pressable>

            <Pressable
                onPress={() => { props.navigation.navigate('Groups', { uid: props.uid }) }}
            >
                <FontAwesome
                    style={styles.footerIcon}
                    name='group'
                    color='black'
                />
            </Pressable>

            <Pressable
                onPress={() => { props.navigation.navigate('Resources', { uid: props.uid }) }}
            >
                <FontAwesome
                    style={styles.footerIcon}
                    name='car'
                    color='black'
                />
            </Pressable>

            <Pressable
                onPress={() => { props.navigation.navigate('Profile', { uid: props.uid }) }}
            >
                <FontAwesome
                    style={styles.footerIcon}
                    name='user'
                    color='black'
                />
            </Pressable>

            <Pressable
                onPress={() => {
                    signOut(props.auth).then(() => {
                        // Sign-out successful.
                        //   alert("SIGNED OUT")
                        props.navigation.navigate('Signin')
                    }).catch((error) => {
                        alert(error.message)
                    });
                }}
            >
                <FontAwesome
                    style={styles.footerIcon}
                    name='sign-out'
                    color='black'
                />
            </Pressable>

        </View>
    )
}