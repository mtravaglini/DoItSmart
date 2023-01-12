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
                        // const {heading} = doc.data();
                        const heading = doc.data().heading;
                        todos.push({
                            id: doc.id,
                            heading
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
            const timestamp = Math.floor(Date.now() / 1000) //serverTimestamp();
            const data = {
                heading: addData,
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
                        <View style={styles.formContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new task here"
                                onChangeText={(heading) => setAddData(heading)}
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
                            <FlatList style={{height: "75%"}}
                                data={todos}
                                ListEmptyComponent={<Text style={[styles.taskHeading, { marginLeft: "20%" }]}>All done! Add more tasks!</Text>}
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
                                            <View >
                                                <Text style={styles.taskHeading} >
                                                    {item.heading}
                                                </Text>
                                            </View>
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
