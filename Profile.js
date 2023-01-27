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
import { doc, collection, collectionGroup, query, getDoc, getDocs, getParent, getRef, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";


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

    // get user's groups
    useEffect(() => {
        // var unsubscribe;
        async function getGroups() {
            try {
                const querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)));
                const parentsPromises = [];

                querySnapshot.forEach((doc) => {
                    console.log(doc.id, '-> ', doc.data())


                    const docRef = doc.ref;
                    const parentCollectionRef = docRef.parent;   // CollectionReference
                    const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference


                    parentsPromises.push(getDoc(immediateParentDocumentRef));
                    // const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
                    // const grandParentDocumentRef = immediateParentDocumentRef.parent.parent; // DocumentReference
                    // console.log("docRef-> ", docRef.id)
                    // console.log("parentCollectionRef-> ", parentCollectionRef.id)
                    // console.log("immediateParentDocumentRef-> ", immediateParentDocumentRef.id)
                    // console.log("grandParentDocumentRef-> ", immediateParentDocumentRef)
                });
                const arrayOfParentsDocumentSnapshots = await Promise.all(parentsPromises);
                // console.log(arrayOfParentsDocumentSnapshots[0].data())
                for (var group of arrayOfParentsDocumentSnapshots) {
                    console.log(group.data().name)
                }

            } catch (error) {
                console.error(error);
            }
        }
        getGroups();
        // return function cleanup() {
        //     unsubscribe();
        // };
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
