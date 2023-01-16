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
import { auth, db } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');

export function TasksScreen({ route, navigation }) {

    const tasksRef = db.collection("tasks");

    const [uid, setUid] = useState(route.params.uid);
    const [tasks, setTodos] = useState([]);
    const [newData, setNewData] = useState('');
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        tasksRef
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                querySnapshot => {
                    const tasks = []
                    querySnapshot.forEach((doc) => {
                        const taskTitle = doc.data().title;
                        const taskDate = new Date(doc.data().createdAt);
                        tasks.push({
                            id: doc.id,
                            taskTitle: taskTitle,
                            taskDate: taskDate
                        })
                    })
                    setTodos(tasks)
                }
            )

        setLoading(false);

    }, [])

    // delete  a todo

    const deleteTodo = (tasks) => {
        tasksRef
            .doc(tasks.id)
            .delete()
            .then(() => {
                // success message
                // alert("Deleted!");
            })
            .catch(error => {
                alert(error);
            })
    }

    // add  a todo

    const addTodo = () => {
        // check we have one to add
        if (newData && newData.length > 0) {
            const timestamp = Math.floor(Date.now()) //serverTimestamp();
            const data = {
                uid: uid,
                title: newData,
                createdAt: timestamp
            }
            tasksRef
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
                                Tasks
                            </Text>
                            <Text style={styles.pageSubTitleText}>
                                {uid}
                            </Text>
                        </View>
                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="Enter new task here"
                                onChangeText={(taskTitle2) => setNewData(taskTitle2)}
                                value={newData}
                                underlineColorAndroid='transparent'
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={styles.inputButton}
                                onPress={addTodo}>
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
                                ListEmptyComponent={<Text style={[styles.listText, { marginLeft: "20%" }]}>All done! Add more tasks!</Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.listContainer}
                                            onPress={() => navigation.navigate('TaskDetail', { item })}>
                                            <FontAwesome
                                                style={styles.listDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteTodo(item)} />
                                            {/* <View > */}
                                            <Text style={styles.listText} >
                                                {/* {item.id}  */}
                                                {item.taskTitle}
                                                {/* {item.taskDate}  */}
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
