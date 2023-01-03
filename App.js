// import navigator packages
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// import custom functions/screens
import { WelcomeScreen } from './Welcome.js';
import { RegisterScreen } from './Register.js';
import { TasksScreen } from './Tasks.js';
import { FirebaseScreen } from './Firebase.js';
import { TaskDetailScreen } from './TaskDetail.js';
// import './Firebase.js'

// create the Navigation stack
const Stack = createStackNavigator();
export default function App() {
  return (
    // add all the screens to the Navigation stack, start with Welcome screen
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="Firebase" component={FirebaseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
