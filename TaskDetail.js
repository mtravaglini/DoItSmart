import React, { useState, useEffect } from 'react';
import {
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

import { db } from './firebase.config';
import { doc, collection, query, getDoc, setDoc, onSnapshot, orderBy } from "firebase/firestore";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { HamburgerMenu } from './Hamburger.js';

// use custom style sheet
const styles = require('./Style.js');

export function TaskDetailScreen({ route, navigation }) {

  const uid = route.params.uid;
  const taskId = route.params.taskId;

  const [user, setUser] = useState('');
  const [origTask, setOrigTask] = useState({});
  const [task, setTask] = useState({});

  // date picker variables
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  const handleStartDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, startDate: Date.parse(date) }));
    setStartDatePickerVisibility(false);
  }

  const handleEndDatePickerConfirm = (date) => {
    setTask((prevState) => ({ ...prevState, endDate: Date.parse(date) }));
    setEndDatePickerVisibility(false);
  }

  const formatDate = (date) => {
    var formattedDate = date;

    if (date) {
      formattedDate = new Date(date)
    } else {
      formattedDate = new Date(Date.now())
    }

    return formattedDate.toString().slice(0, 10) + "\n" + formattedDate.toString().slice(16, 21)
  }

  // get user 
  useEffect(() => {
    // console.log("Getting user", uid)
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

  // get task
  useEffect(() => {
    // console.log("Getting task", uid, taskId);
    async function getTask() {
      try {
        const docSnap = await getDoc(doc(db, "users", uid, "tasks", taskId));
        setOrigTask(docSnap.data());
        setTask(docSnap.data());
      } catch (error) {
        console.error(error);
      }
    }
    getTask();
  }, [])

  const taskChanged = () => {
    const keys1 = Object.keys(task);
    const keys2 = Object.keys(origTask);
    if (keys1.length !== keys2.length) {
      return true;
    }
    for (let key of keys1) {
      if (task[key] !== origTask[key]) {
        return true;
      }
    }
    return false;
  }



  const SaveTask = async () => {

    if (!taskChanged()) {
      // console.log("!taskChanged()")
      return 0
    }

    // console.log("Saving task", uid, taskId)

    try {
      await setDoc(doc(db, "users", uid, "tasks", taskId), task)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      return 1;
    }

    return 0;
  }
  // console.log("task", task)
  // console.log("origTask", origTask)
  console.log("REFRESHED", Date())


  return (
    <SafeAreaView style={[styles.safeView]}>
      <ScrollView style={{ height: '100%' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                            <HamburgerMenu style={{ flex: 1}}></HamburgerMenu>
                            <View style={[styles.pageTitleContainer, { flex: 5 }]}>
                                <Text style={styles.pageTitleText}>
                                    Task Detail
                                </Text>
                                <Text style={styles.pageSubTitleText}>
                                    {user.name}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                            </View>
                        </View>

              <View style={styles.inputFormContainer}>
                <Text style={styles.inputLabel}>Title (created on {new Date(task.createdAt).toString().slice(0, 24)})</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, title: newValue })) }}
                  value={task.title}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Created by</Text>
                <TextInput
                  readOnly={true}
                  style={styles.input}
                  // onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, creator: newValue })) }}
                  value={task.creator}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, {
                    height: 150,
                    textAlignVertical: "top" // android fix for centering it at the top-left corner 
                  }]}
                  multiline={true} // ios fix for centering it at the top-left corner 
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, notes: newValue })) }}
                  value={task.notes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ flexDirection: "row" }}>

                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Start After</Text>
                    <Pressable
                      onPress={() => setStartDatePickerVisibility(true)}>
                      <Text style={styles.dateText}>
                        {formatDate(task.startDate)}
                      </Text>
                    </Pressable>
                  </View>

                  <View>
                    <TouchableOpacity title="Show Date Picker">
                      <DateTimePickerModal
                        isVisible={isStartDatePickerVisible}
                        mode="datetime"
                        date={new Date(task.startDate)}
                        onConfirm={handleStartDatePickerConfirm}
                        onCancel={() => setStartDatePickerVisibility(false)}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Finish by</Text>
                    <Pressable
                      onPress={() => setEndDatePickerVisibility(true)}>
                      <Text style={styles.dateText}>
                        {formatDate(task.endDate)}
                      </Text>
                    </Pressable>
                  </View>

                  <View>
                    <TouchableOpacity title="Show Date Picker">
                      <DateTimePickerModal
                        isVisible={isEndDatePickerVisible}
                        mode="datetime"
                        date={new Date(task.endDate)}
                        onConfirm={handleEndDatePickerConfirm}
                        onCancel={() => setEndDatePickerVisibility(false)}
                      />
                    </TouchableOpacity>
                  </View>

                </View>

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, priority: +newValue })) }}
                      value={task.priority?.toString()}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flexDirection: "column", flex: 1 }}>
                    <Text style={styles.inputLabel}>Effort</Text>
                    <TextInput
                      style={[styles.input]}
                      onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, effort: +newValue })) }}
                      value={task.effort?.toString()}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Group</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={task.taskGroup}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Resources</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={task.taskResources}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={[styles.mainButton, { opacity: (!taskChanged()) ? 0.5 : 1.0 }]}
                    disabled={!taskChanged()}
                    onPress={async () => {
                      await SaveTask().then(
                        (result) => {
                          if (result == 0) {
                            navigation.goBack();
                          }
                        }
                      )
                    }}
                  >
                    <Text
                      style={styles.buttonText}
                    >Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
