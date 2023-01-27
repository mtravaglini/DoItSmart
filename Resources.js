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
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');

export function ResourcesScreen({ route, navigation }) {

    const uid = route.params.uid;
    // const resourcesRef = db.collection("resources");

    const [user, setUser] = useState('');
    const [resources, setResources] = useState([]);
    const [newResourceName, setNewResourceName] = useState('');
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

    // get resources
    useEffect(() => {
        var unsubscribe;
        var resourceObj;
        async function getResources() {
            try {
                unsubscribe = onSnapshot(
                    query(
                        collection(db, "Resources"), orderBy('name')), (querySnapshot) => {
                            const retrievedResources = [];
                            querySnapshot.forEach((doc) => {
                                resourceObj = doc.data();
                                resourceObj.id = doc.id;
                                retrievedResources.push(resourceObj)
                            })
                            setResources(retrievedResources)
                            setLoading(false);
                        })
            } catch (error) {
                console.error(error);
            }
        }
        getResources();
        return function cleanup() {
            unsubscribe();
        };
    }, [])

    // add a resource
    const addResource = async () => {
        // check we have one to add
        if (newResourceName && newResourceName.length > 0) {
            try {
                const timestamp = Math.floor(Date.now()) //serverTimestamp();
                const data = {
                    name: newResourceName,
                    creator: uid,
                    createdDate: timestamp
                }
                addDoc(collection(db, "Resources"), data)
                setNewResourceName('');
            } catch (error) {
                alert(error);
            }
        }
    }

    // delete a resource
    const deleteResource = async (resourceId) => {
        try {
            await deleteDoc(doc(db, "Resources", resourceId));
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
                                Resources
                            </Text>
                            <Text style={styles.pageSubTitleText}>
                                {user.name}
                            </Text>
                        </View>

                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="resource quick add"
                                onChangeText={(newResourceName) => setNewResourceName(newResourceName)}
                                value={newResourceName}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={[styles.inputButton, { opacity: (!newResourceName ? 0.5 : 1.0) }]}
                                disabled={!newResourceName}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    addResource()
                                }}
                            >
                                <Text
                                    style={styles.buttonText}
                                >Add</Text>
                            </TouchableOpacity>
                        </View>
                        {/* show acivity indicator when waiting to return to resources screen */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="cornflowerblue" />
                        ) : (
                            <FlatList style={{ height: "76%", marginBottom: 15 }}
                                data={resources}
                                ListEmptyComponent={<Text style={[styles.listText, { marginLeft: "20%" }]}>
                                    No resources! Add some!
                                </Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.listContainer}
                                            onPress={() => navigation.navigate('ResourceDetail', { uid: uid, resourceId: item.id })}
                                        >
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteResource(item.id)} />
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
