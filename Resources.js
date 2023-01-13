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
import { app, db, serverTimestamp } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');

export function ResourcesScreen({ route, navigation }) {

    const resourcesRef = db.collection("resources");

    const [resources, setResources] = useState([]);
    const [newData, setNewData] = useState('');
    const [isLoading, setLoading] = useState(true);
    
    useEffect(() => {
        resourcesRef
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                querySnapshot => {
                    const resources = []
                    querySnapshot.forEach((doc) => {
                        const resourceTitle = doc.data().title;
                        const resourceDate = new Date(doc.data().createdAt);
                        resources.push({
                            id: doc.id,
                            resourceTitle: resourceTitle,
                            resourceDate: resourceDate
                        })
                    })
                    setResources(resources)
                }
            )

        setLoading(false);

    }, [])

    // delete  a resource

    const deleteResource = (resources) => {
        resourcesRef
            .doc(resources.id)
            .delete()
            .then(() => {
                // success message
                // alert("Deleted!");
            })
            .catch(error => {
                alert(error);
            })
    }

    // add  a resource

    const addResource = () => {
        // check we have one to add
        if (newData && newData.length > 0) {
            const timestamp = Math.floor(Date.now()) //serverTimestamp();
            const data = {
                title: newData,
                createdAt: timestamp
            }
            resourcesRef
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
                                Resources
                            </Text>
                        </View>
                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="Enter a new resource here"
                                onChangeText={(resourceTitle2) => setNewData(resourceTitle2)}
                                value={newData}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={styles.inputButton}
                                onPress={addResource}>
                                <Text
                                    style={styles.buttonText}
                                >Add</Text>
                            </TouchableOpacity>
                        </View>
                        {/* show acivity indicator when waiting to return to resources screen */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="cornflowerblue" />
                        ) : (
                            <FlatList style={{ height: "75%" }}
                                data={resources}
                                ListEmptyComponent={<Text style={[styles.listText, { marginLeft: "20%" }]}>No resources! Add some!</Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.listContainer}
                                            onPress={() => navigation.navigate('ResourceDetail', { item })}>
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteResource(item)} />
                                            {/* <View > */}
                                            <Text style={styles.listText} >
                                                {/* {item.id}  */}
                                                {item.resourceTitle}
                                                {/* {item.resourceDate}  */}
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
