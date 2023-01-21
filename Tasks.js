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
import { db } from './firebase.config';
import { doc, collection, query, getDoc, setDoc, addDoc, deleteDoc, onSnapshot, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');

export function TasksScreen({ route, navigation }) {

    const uid = route.params.uid;

    const [user, setUser] = useState('');
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTask] = useState('');
    const [isLoading, setLoading] = useState(true);

    // get user 
    useEffect(() => {
        async function getUser() {
            try {
                const docSnap = await getDoc(doc(db, "users", uid));
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
                        collection(db, "users", uid, "tasks"), orderBy('createdAt')), (querySnapshot) => {
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
        if (newTaskTitle && newTaskTitle.length > 0) {
            try {
                const timestamp = Math.floor(Date.now()) //serverTimestamp();
                const data = {
                    title: newTaskTitle,
                    creator: uid,
                    assignee: uid,
                    startDate: timestamp,
                    endDate: timestamp + (24 * 60 * 60 * 1000),
                    priority: 1,
                    effort: 30,
                    createdAt: timestamp
                }
                addDoc(collection(db, "users", uid, "tasks"), data)
                setNewTask('');
            } catch (error) {
                alert(error);
            }
        }
    }

    // delete a task
    const deleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, "users", uid, "tasks", taskId));
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
                                Tasks
                            </Text>
                            <Text style={styles.pageSubTitleText}>
                                {user.name}
                            </Text>
                        </View>

                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="task quick add"
                                onChangeText={(newTaskTitle) => setNewTask(newTaskTitle)}
                                value={newTaskTitle}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={[styles.inputButton, { opacity: (!newTaskTitle ? 0.5 : 1.0) }]}
                                disabled={!newTaskTitle}
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
                            <FlatList style={{ height: "75%" }}
                                data={tasks}
                                ListEmptyComponent={<Text style={[styles.listText, { marginLeft: "20%" }]}>
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
                                                {item.title}
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
                                onPress={() => { navigation.navigate('Signout', { uid: uid }) }}
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
