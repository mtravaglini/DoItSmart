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
// import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { app, db } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');

export function GroupsScreen({ route, navigation }) {

    const groupsRef = db.collection("groups");

    const [groups, setGroups] = useState([]);
    const [newData, setNewData] = useState('');
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        groupsRef
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                querySnapshot => {
                    const groups = []
                    querySnapshot.forEach((doc) => {
                        const groupTitle = doc.data().title;
                        const groupDate = new Date(doc.data().createdAt);
                        groups.push({
                            id: doc.id,
                            groupTitle: groupTitle,
                            groupDate: groupDate
                        })
                    })
                    setGroups(groups)
                }
            )

        setLoading(false);

    }, [])

    // delete  a group

    const deleteGroup = (groups) => {
        groupsRef
            .doc(groups.id)
            .delete()
            .then(() => {
                // success message
                // alert("Deleted!");
            })
            .catch(error => {
                alert(error);
            })
    }

    // add  a group

    const addGroup = () => {
        // check we have one to add
        if (newData && newData.length > 0) {
            const timestamp = Math.floor(Date.now()) //serverTimestamp();
            const data = {
                title: newData,
                createdAt: timestamp
            }
            groupsRef
                .add(data)
                .then(() => {
                    setNewData('');
                    Keyboard.dismiss();
                    // success message
                    // alert("Added!");
                })
                .catch(error => {
                    alert(error);
                })
        }

    }


    return (
        <SafeAreaView style={styles.safeView}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.pageTitleContainer}>
                            <Text style={styles.pageTitleText}>
                                Groups
                            </Text>
                        </View>
                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                onChangeText={(groupTitle2) => setNewData(groupTitle2)}
                                value={newData}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={styles.inputButton}
                                onPress={addGroup}>
                                <Text
                                    style={styles.buttonText}
                                >Add</Text>
                            </TouchableOpacity>
                        </View>
                        {/* show acivity indicator when waiting to return to groups screen */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="cornflowerblue" />
                        ) : (
                            <FlatList style={{ height: "75%" }}
                                data={groups}
                                ListEmptyComponent={<Text style={[styles.listText, { marginLeft: "20%" }]}>No groups! Add some!</Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.listContainer}
                                            onPress={() => navigation.navigate('GroupDetail', { item })}>
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteGroup(item)} />
                                            {/* <View > */}
                                            <Text style={styles.listText} >
                                                {/* {item.id}  */}
                                                {item.groupTitle}
                                                {/* {item.groupDate}  */}
                                            </Text>
                                            {/* </View> */}
                                        </Pressable>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
