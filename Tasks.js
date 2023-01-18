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
// import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from './firebase.config';
import { doc, collection, query, getDoc, setDoc, deleteDoc, onSnapshot, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');

export function TasksScreen({ route, navigation }) {

    const [user, setUser] = useState('');
    // const [email, setEmail] = useState(route.params.email);
    const email = route.params.email;
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [isLoading, setLoading] = useState(true);

    // const userRef = doc(db, "users", route.params.email);
    // const tasksRef = query(collection(db, "users", route.params.email, "tasks"), orderBy('createdAt'));

    // get user 
    useEffect(() => {
        async function getUser() {
            try {
                const docSnap = await getDoc(doc(db, "users", email));
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
                        collection(db, "users", route.params.email, "tasks"), orderBy('createdAt')), (querySnapshot) => {
                            const retrievedTasks = [];
                            querySnapshot.forEach((doc) => {
                                taskObj = doc.data();
                                taskObj.taskTitle = doc.id;
                                retrievedTasks.push(taskObj
                                )
                            })
                            setTasks(retrievedTasks)
                            setLoading(false);
                            console.log(taskObj);
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

    // delete a task
    const deleteTask = async (taskTitle) => {
        try {
            await deleteDoc(doc(db, "users", route.params.email, "tasks", taskTitle));
        } catch (error) {
            alert(error);
        }
    }

    // add a task
    const addTask = async () => {
        // const addTask = () => {
        // check we have one to add
        if (newTask && newTask.length > 0) {
            try {
                const timestamp = Math.floor(Date.now()) //serverTimestamp();
                const data = {
                    assignee: email,
                    startDate: timestamp,
                    endDate: timestamp + (24 * 60 * 60 * 1000),
                    createdAt: timestamp
                }
                setDoc(doc(db, "users", email, "tasks", newTask), data)
                setNewTask('');
            } catch (error) {
                alert(error);
            }
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
                                value={newTask}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={styles.inputButton}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    { addTask() }
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
                                            onPress={() => navigation.navigate('TaskDetail', { item })}
                                        >
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteTask(item.taskTitle)} />
                                            {/* <View > */}
                                            <Text style={styles.listText} >
                                                {item.taskTitle}
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
