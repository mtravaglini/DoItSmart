import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Pressable,
      Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { signOut } from "firebase/auth";
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, orderBy, where } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'

export function ResourcesScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
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
                        collection(db, "Resources"), where("creator", "==", uid), orderBy('name')), (querySnapshot) => {
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
        <View style={[styles.safeView, {
      marginTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                <View style={{ flex: 1 }}>

                        <Title
                            title="Resources"
                            name={user.name}
                            navigation={navigation} />

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
                            <ActivityIndicator style={styles.standardText} size="large" />
                            ) : (
                            <FlatList style={{ height: "73%", marginBottom: 15 }}
                                data={resources}
                                ListEmptyComponent={<Text style={[styles.listText, styles.txtWarning, { alignSelf: "center" }]}>
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
                                                color='lightgrey'
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

                        <Footer auth={auth}
                            navigation={navigation}
                            uid={uid} />

                    </View>
                {/* </TouchableWithoutFeedback> */}
            </KeyboardAvoidingView>
        </View>
    );
}
