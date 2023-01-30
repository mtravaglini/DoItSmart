import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

    const [groupNames, setGroupNames] = useState([]);
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

    function getGroupUsersParents(groupUsersSnaps) {
        return Promise.all(groupUsersSnaps.map(async (groupUser) => {

            const docRef = groupUser.ref;
            const parentCollectionRef = docRef.parent; // CollectionReference
            const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
            const parentDoc = await getDoc(immediateParentDocumentRef)

            return {
                "id": parentDoc.id,
                "name": parentDoc.data().name,
            }
        }))
        // setGroupNames(retrievedGroupNames)
    }

    useEffect(() => {
        var unsubscribe;
        const parentsPromises = [];
        const retrievedGroupNames = [];
        async function getGroupUsers() {
            try {
                // const querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)));
                unsubscribe = onSnapshot(
                    query(
                        collectionGroup(db, 'GroupUsers'), where('userId', '==', uid)), (querySnapshot) => {
                            // const parentsPromises = [];
                            // querySnapshot.forEach((doc) => {
                            //     // console.log(doc.id, '-> ', doc.data())
                            //     console.log("doc.id", doc.id)
                            //     const docRef = doc.ref;
                            //     const parentCollectionRef = docRef.parent; // CollectionReference
                            //     const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
                            // parentsPromises.push(getDoc(immediateParentDocumentRef));
                            getGroupUsersParents(querySnapshot.docs)
                                .then((retrievedGroupNames) => {
                                    setGroupNames(retrievedGroupNames)
                                })
                                .catch((error) => {
                                    console.log(error)
                                })

                        });
                // setGroupNames(retrievedGroupNames)

                console.log("parentsPromises 1", parentsPromises)


            } catch (error) {
                console.error(error);
            }
        }

        getGroupUsers();



        return function cleanup() {
            unsubscribe();
        };
    }, [])

    const confirmDelete = (groupId, groupName) => {
        Alert.alert("Leave group " + groupName,
            "Are you sure?",
            [{
                text: "Leave",
                onPress: () => deleteGroupMembership(groupId),

            },   
            {
                text: "Cancel"
            }]
        )
        return
    }

    // delete a group membership
    const deleteGroupMembership = async (groupId) => {
        // console.log("deleting the group membership", groupId, uid)


        try {
            const querySnapshot = await getDocs(query(collection(db, "Groups", groupId, "GroupUsers"), where('userId', '==', uid)));
            console.log(typeof querySnapshot)
            querySnapshot.forEach((doc) => {
                // console.log("deleting docref", doc.ref)
                deleteDoc(doc.ref)
            })
        } catch (error) {
            console.error(error);
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
                                Profile
                            </Text>
                            <Text style={styles.pageSubTitleText}>
                                {user.name}
                            </Text>
                        </View>
                        {/* <ScrollView style={{ height: "84%", marginBottom: 15 }}> */}

                        {/* show acivity indicator when waiting to return to groups screen */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="cornflowerblue" />
                        ) : (

                            <View>
                                <Text style={styles.textDisplay}>{user.email}</Text>
                                <Text style={styles.inputLabel}>Your groups</Text>
                                <FlatList style={{ height: "74%", marginBottom: 15, marginLeft: "1%" }}
                                    data={groupNames}
                                    ListEmptyComponent={<Text style={[styles.listText, { alignSelf: "center" }]}>
                                        You're not a member of any groups.
                                    </Text>}
                                    numColumns={5}
                                    renderItem={({ item }) => (
                                        <Pressable style={styles.groupButton}
                                            onPress={() => navigation.navigate('GroupDetail', { uid: uid, groupId: item.id })}
                                            onLongPress={() => confirmDelete(item.id, item.name)}
                                        >
                                            <Text style={styles.groupText}>
                                                {item.name}
                                            </Text>
                                        </Pressable>
                                    )}
                                />



                            </View>




                        )}
                        {/* </ScrollView> */}
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
