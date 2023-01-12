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

export function TasksScreen({ route, navigation }) {

    const [todos, setTodos] = useState([]);
    const todoRef = db.collection("todos");
    // const reference = firebase.database("https://taskmanager-cm3070-default-rtdb.europe-west1.firebasedatabase.app").ref('/users/100');

    const [addData, setAddData] = useState('');

    const [isLoading, setLoading] = useState(true);


    useEffect(() => {
        todoRef
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                querySnapshot => {
                    const todos = []
                    querySnapshot.forEach((doc) => {
                        const taskTitle = doc.data().title;
                        const taskDate = new Date(doc.data().createdAt);
                        todos.push({
                            id: doc.id,
                            taskTitle: taskTitle,
                            taskDate: taskDate
                        })
                    })
                    setTodos(todos)
                }
            )

        setLoading(false);

    }, [])

    // delete  a todo

    const deleteTodo = (todos) => {
        todoRef
            .doc(todos.id)
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
        if (addData && addData.length > 0) {
            const timestamp = Math.floor(Date.now()) //serverTimestamp();
            const data = {
                title: addData,
                createdAt: timestamp
            }
            todoRef
                .add(data)
                .then(() => {
                    setAddData('');
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
                            <Text style={styles.titleText}>
                                Tasks
                            </Text>
                        </View>
                        <View style={styles.inputBtnFormContainer}>
                            <TextInput
                                style={styles.inputShort}
                                placeholder="Enter new task here"
                                onChangeText={(taskTitle2) => setAddData(taskTitle2)}
                                value={addData}
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
                                data={todos}
                                ListEmptyComponent={<Text style={[styles.taskText, { marginLeft: "20%" }]}>All done! Add more tasks!</Text>}
                                renderItem={({ item }) => (
                                    <View>
                                        <Pressable
                                            style={styles.taskContainer}
                                            onPress={() => navigation.navigate('TaskDetail', { item })}>
                                            <FontAwesome
                                                style={styles.taskDelIcon}
                                                name='trash-o'
                                                color='red'
                                                onPress={() => deleteTodo(item)} />
                                            {/* <View > */}
                                            <Text style={styles.taskText} >
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
