// import navigator packages
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// import custom functions/screens
import { SigninScreen } from './Signin.js';
import { RegisterScreen } from './Register.js';
import { TasksScreen } from './Tasks.js';
import { TaskDetailScreen } from './TaskDetail.js';
import { GroupsScreen } from './Groups.js';
import { ResourcesScreen } from './Resources.js';
import { ProfileScreen } from './Profile.js';

// create the Navigation stack
const Stack = createStackNavigator();
export default function App() {
  return (
    // add all the screens to the Navigation stack, start with Signin screen
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Signin" component={SigninScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="Resources" component={ResourcesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
