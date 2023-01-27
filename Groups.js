import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { signOut } from "firebase/auth";
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');

export function GroupsScreen({ route, navigation }) {

    const uid = route.params.uid;
    // const groupsRef = db.collection("groups");

    const [user, setUser] = useState('');
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [isLoading, setLoading] = useState(true);

    // get user 
    useEffect(() => {
        async function getUser() {
            try {
                const docSnap = await getDoc(doc(db, "Users", uid));
                setUser(docSnap.data());
            } catch (error) {
                console.error(error);
            }
        }
        getUser();
    }, [])

    // get groups
    useEffect(() => {
        var unsubscribe;
        var groupObj;
        async function getGroups() {
            try {
                unsubscribe = onSnapshot(
                    query(
                        collection(db, "Groups"), orderBy('name'), where("creator", "==", uid)), (querySnapshot) => {
                            const retrievedGroups = [];
                            querySnapshot.forEach((doc) => {
                                groupObj = doc.data();
                                groupObj.id = doc.id;
                                retrievedGroups.push(groupObj)
                            })
                            setGroups(retrievedGroups)
                            setLoading(false);
                        })
            } catch (error) {
                console.error(error);
            }
        }
        getGroups();
        return function cleanup() {
            unsubscribe();
        };
    }, [])

    // add a group
    const addGroup = async () => {
        // check we have one to add
        if (newGroupName && newGroupName.length > 0) {
            try {
                var data = {};
                const timestamp = Math.floor(Date.now()) //serverTimestamp();
                // add the group
                data = {
                    name: newGroupName,
                    creator: uid,
                    createdDate: timestamp
                }
                var groupRef = addDoc(collection(db, "Groups"), data)
                setNewGroupName('');
                // add current user to group
                data = {
                    userId: uid,
                    createdDate: timestamp
                }
                addDoc(collection(db, "Groups", (await groupRef).id, "GroupUsers"), data)
            } catch (error) {
                alert(error);
            }
        }
    }

    // delete a group
    const deleteGroup = async (groupId) => {
        try {
            await deleteDoc(doc(db, "Groups", groupId));
        } catch (error) {
            alert(error);
        }
    }

    return (
        <SafeAreaView style={styles.safeView}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.pageTitleContainer}>
                            <Text style={styles.pageTitleText}>
                                Groups
                            </Text>
                            <Text style={styles.pageSubTitleText}>
                                {user.name}
                            </Text>
                        </View>

                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="group quick add"
                                onChangeText={(newGroupName) => setNewGroupName(newGroupName)}
                                value={newGroupName}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={[styles.inputButton, { opacity: (!newGroupName ? 0.5 : 1.0) }]}
                                disabled={!newGroupName}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    addGroup()
                                }}
                            >
                                <Text
                                    style={styles.buttonText}
                                >Add</Text>
                            </TouchableOpacity>
                        </View>
                        {/* show acivity indicator when waiting to return to groups screen */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="cornflowerblue" />
                        ) : (
                            <FlatList style={{ height: "76%", marginBottom: 15 }}
                                data={groups}
                                ListEmptyComponent={<Text style={[styles.listText, { marginLeft: "20%" }]}>
                                    No groups! Add some!
                                </Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.listContainer}
                                            onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                                        >
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteGroup(item.id)} />
                                            {/* <View > */}
                                            <Text style={styles.listText} >
                                                {item.name}
                                            </Text>
                                            {/* </View> */}
                                        </Pressable>
                                    </View>
                                )}
                            />
                        )}
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
