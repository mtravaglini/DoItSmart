import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { app, db, serverTimestamp } from './firebase.config';

// use custom style sheet
const styles = require('./Style.js');

export function FirebaseScreen({ route, navigation }) {

    const [todos, setTodos] = useState([]);
    const todoRef = db.collection("todos");
    // const reference = firebase.database("https://taskmanager-cm3070-default-rtdb.europe-west1.firebasedatabase.app").ref('/users/100');

    const [addData, setAddData] = useState('');

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
    }, [])

    // delete  a todo

    const deleteTodo = (todos) => {
        todoRef
            .doc(todos.id)
            .delete()
            .then(() => {
                // success message
                alert("Deleted!");
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
        <View style={{ flex: 1 }}>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a new to do item"
                    onChangeText={(heading) => setAddData(heading)}
                    value={addData}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={addTodo}>
                    <Text
                        style={styles.buttonText}
                    >Add</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={todos}
                numColumns={1}
                renderItem={({ item }) => (
                    <View>
                        <Pressable
                            style={styles.containerX}
                            onPress={() => navigation.navigate('TaskDetail', { item })}
                        >
                            <FontAwesome
                                name='trash-o'
                                color='red'
                                onPress={() => deleteTodo(item)}
                                style={styles.todoIcon}
                            />
                            <View style={styles.innerContainer}>
                                <Text style={styles.itemHeading} >
                                    {item.heading}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    );
}
