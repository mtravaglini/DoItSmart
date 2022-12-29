import React from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {
  useState,
  useEffect,
} from 'react';
import {
  ScrollView,
} from 'react-native-gesture-handler';
import {
  Cell,
  TableView,
} from 'react-native-tableview-simple';


// use custom style sheet
const styles = require('./Style.js');


export function TasksScreen({ route, navigation }) {

  const [tasks, setTasks] = useState([]);
  const [isLoading, setLoading] = useState(true);


  // Retrieve all user's tasks here
  // FOR TESTING
  retrieved_tasks = [

    {
      "Name": "Make Bed",
      "Priority": 1,
      "Effort": 5,
      "Recurrence": "D",
      "Lifeline": "",
      "Deadline": "2023-01-31",
      "Assignee": "Jack"
    },

    {
      "Name": "Get Dressed",
      "Priority": 2,
      "Effort": 15,
      "Recurrence": "D",
      "Lifeline": "",
      "Deadline": "2023-01-31",
      "Assignee": "Jack"
    },

    {
      "Name": "Eat Breakfast",
      "Priority": 2,
      "Effort": 15,
      "Recurrence": "D",
      "Lifeline": "",
      "Deadline": "2023-01-31",
      "Assignee": "Jack"
    },

    {
      "Name": "Brush Teeth",
      "Priority": 3,
      "Effort": 2,
      "Recurrence": "D",
      "Lifeline": "",
      "Deadline": "2023-01-31",
      "Assignee": "Jack"
    }

  ]

  if (tasks.length == 0) {
    setTasks(retrieved_tasks);
    setLoading(false);
  }


  return (
    // <View style={styles.container}>
    //   <Text>Tasks</Text>
    // </View>



    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeView}>
          <View>

            {/* show acivity indicator when waiting to return to portfolio screen after 
            user presses save button */}
            {isLoading ? (
              <ActivityIndicator size="large" color="cornflowerblue" />
            ) : (
              <ScrollView>
                <TableView appearance="light">
                  {/* show message depending on if any results returned or not */}
                  <Text>
                    {' '}
                    {tasks.length == 0
                      ? 'All done!'
                      : 'Tasks:'}
                  </Text>

                  {/* go through array of tasks
                  add a table cell for each one */}
                  {React.Children.toArray(
                    tasks.map((task) => (
                      <Cell
                        cellStyle="Subtitle"
                        title={
                          task['Name']
                        }
                        detail={task['Deadline']}
                        detailTextStyle={{ fontsize: 30 }}
                      // when user selects a ticker, invoke the add ticker screen
                      // onPress={() =>
                      //   navigation.navigate('TaskDetail', {
                      //     username: usernameText,
                      //     symbol: ticker['1. symbol'],
                      //     symbolName: ticker['2. name'],
                      //     symbolCurrency: ticker['8. currency'],
                      //   })
                      // }
                      />
                    ))
                  )}
                </TableView>
                {/* text item so show messages to the user on the screen
                <Text>{screenMsg}</Text> */}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>




  );
}

