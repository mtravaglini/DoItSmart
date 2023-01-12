import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// import { SafeAreaView } from 'react-native-safe-area-context';

// use custom style sheet
const styles = require('./Style.js');

export function TaskDetailScreen({ route, navigation }) {
  console.log(route.params.item);
  console.log(route.params.item.startDate);
  return (
    <SafeAreaView style={[styles.safeView]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>

            <View style={styles.pageTitleContainer}>
              <Text style={styles.titleText}>
                Task Detail
              </Text>
            </View>

            <View style={styles.inputFormContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Task title"
                // onChangeText={(taskTitle) => setAddData(taskTitle)}
                value={route.params.item.taskTitle}
                underlineColorAndroid='transparent'
                autoCapitalize='none'
              />

              <Text style={styles.inputLabel}>Created</Text>
              <TextInput
                editable={false} selectTextOnFocus={false}
                style={styles.input}
                placeholder="Date Created"
                // onChangeText={(taskTitle) => setAddData(taskTitle)}
                value={route.params.item.taskDate.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")}
                underlineColorAndroid='transparent'
                autoCapitalize='none'
              />

              <Text style={styles.inputLabel}>Assigned To</Text>
              <TextInput
                style={styles.input}
                placeholder="Assigned to"
                // onChangeText={(taskTitle) => setAddData(taskTitle)}
                value={route.params.item.assignedTo}
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
                placeholder="Notes"
                // onChangeText={(taskTitle) => setAddData(taskTitle)}
                value={route.params.item.taskNotes}
                underlineColorAndroid='transparent'
                autoCapitalize='none'
              />

              <Text style={styles.inputLabel}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="Start Date"
                // onChangeText={(taskTitle) => setAddData(taskTitle)}
                value={route.params.item.startDate == undefined ?
                  new Date(Date.now()).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")
                  :
                  route.params.item.startDate.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")}
                underlineColorAndroid='transparent'
                autoCapitalize='none'
              />

              <Text style={styles.inputLabel}>End Before Date</Text>
              <TextInput
                style={styles.input}
                placeholder="End Before Date"
                // onChangeText={(taskTitle) => setAddData(taskTitle)}
                value={route.params.item.endDate == undefined ?
                  new Date(Date.now()).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")
                  :
                  route.params.item.endDate.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")}
                underlineColorAndroid='transparent'
                autoCapitalize='none'
              />

              <View style={{ flexDirection: "row" }}>

                <View style={{ flexDirection: "column" }}>
                  <Text style={styles.inputLabel}>Priority</Text>
                  <TextInput
                    style={[styles.input]}
                    placeholder="Priority"
                    // onChangeText={(taskTitle) => setAddData(taskTitle)}
                    value={route.params.item.taskPriority}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />
                </View>

                <View style={{ flexDirection: "column" }}>
                  <Text style={styles.inputLabel}>Effort</Text>
                  <TextInput
                    style={[styles.input]}
                    placeholder="Effort"
                    // onChangeText={(taskTitle) => setAddData(taskTitle)}
                    value={route.params.item.taskPriority}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                  />
                </View>

              </View>


            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
