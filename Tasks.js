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
// use custom components
import { Title , Footer} from './Components.js'

export function TasksScreen({ route, navigation }) {

    const uid = route.params.uid;

    const [user, setUser] = useState('');
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
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

    // get tasks
    useEffect(() => {
        var unsubscribe;
        var taskObj;
        async function getTasks() {
            try {
                unsubscribe = onSnapshot(
                    query(
                        collection(db, "Tasks"), where("assignee", "==", uid), orderBy('startDate'), orderBy('priority')), (querySnapshot) => {
                            const retrievedTasks = [];
                            querySnapshot.forEach((doc) => {
                                taskObj = doc.data();
                                taskObj.id = doc.id;
                                retrievedTasks.push(taskObj)
                            })
                            setTasks(retrievedTasks)
                            setLoading(false);
                        })
            } catch (error) {
                console.error(error);
            }
        }
        getTasks();
        return function cleanup() {
            unsubscribe();
        };
    }, [])

    // add a task
    const addTask = async () => {
        // check we have one to add
        if (newTaskName && newTaskName.length > 0) {
            try {
                const timestamp = Math.floor(Date.now()) //serverTimestamp();
                const data = {
                    name: newTaskName,
                    creator: uid,
                    assignee: uid,
                    startDate: timestamp,
                    endDate: timestamp + (24 * 60 * 60 * 1000),
                    priority: 1,
                    effort: 30,
                    createdDate: timestamp
                }
                addDoc(collection(db, "Tasks"), data)
                setNewTaskName('');
            } catch (error) {
                alert(error);
            }
        }
    }

    // delete a task
    const deleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, "Tasks", taskId));
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

                        <Title 
                        title="Tasks" 
                        name={user.name} 
                        navigation={navigation}/>

                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="task quick add"
                                onChangeText={(newTaskName) => setNewTaskName(newTaskName)}
                                value={newTaskName}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={[styles.inputButton, { opacity: (!newTaskName ? 0.5 : 1.0) }]}
                                disabled={!newTaskName}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    addTask()
                                }}
                            >
                                <Text
                                    style={styles.buttonText}
                                >Add</Text>
                            </TouchableOpacity>
                        </View>
                        {/* show acivity indicator when waiting to return to tasks screen */}
                        {isLoading ? (
                            <ActivityIndicator size="large" color="cornflowerblue" />
                        ) : (
                            <FlatList style={{ height: "76%", marginBottom: 15 }}
                                data={tasks}
                                ListEmptyComponent={<Text style={[styles.listText, { alignSelf: "center" }]}>
                                    All done! Add more tasks!
                                </Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.listContainer}
                                            onPress={() => navigation.navigate('TaskDetail', { uid: uid, taskId: item.id })}
                                        >
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteTask(item.id)} />
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
                        uid={uid}/>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
