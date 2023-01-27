import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { signOut } from "firebase/auth";
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, orderBy } from "firebase/firestore";


// use custom style sheet
const styles = require('./Style.js');

export function ProfileScreen({ route, navigation }) {

    const uid = route.params.uid;

    const [user, setUser] = useState('');
    const [isLoading, setLoading] = useState(true);

    // get user 
    useEffect(() => {
        async function getUser() {
            try {
                const docSnap = await getDoc(doc(db, "Users", uid));
                setUser(docSnap.data());
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        getUser();
    }, [])


    return (
        <SafeAreaView style={styles.safeView}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.pageTitleContainer}>
                            <Text style={styles.pageTitleText}>
                                Profile
                            </Text>
                            <Text style={styles.pageSubTitleText}>
                                {user.name}
                            </Text>
                        </View>
                        <ScrollView style={{ height: "84%", marginBottom: 15 }}>

                            {/* show acivity indicator when waiting to return to groups screen */}
                            {isLoading ? (
                                <ActivityIndicator size="large" color="cornflowerblue" />
                            ) : (
                                <Text style={styles.textDisplay}>{user.email}</Text>
                            )}
                        </ScrollView>
                        <View style={styles.footer}>

                            <Pressable
                                onPress={() => { navigation.navigate('Tasks', { uid: uid }) }}
                            >
                                <FontAwesome
                                    style={styles.footerIcon}
                                    name='tasks'
                                    color='black'
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => { navigation.navigate('Groups', { uid: uid }) }}
                            >
                                <FontAwesome
                                    style={styles.footerIcon}
                                    name='group'
                                    color='black'
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => { navigation.navigate('Resources', { uid: uid }) }}
                            >
                                <FontAwesome
                                    style={styles.footerIcon}
                                    name='car'
                                    color='black'
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => { navigation.navigate('Profile', { uid: uid }) }}
                            >
                                <FontAwesome
                                    style={styles.footerIcon}
                                    name='user'
                                    color='black'
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    signOut(auth).then(() => {
                                        // Sign-out successful.
                                        //   alert("SIGNED OUT")
                                        navigation.navigate('Signin')
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

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
