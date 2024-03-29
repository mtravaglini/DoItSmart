// import navigator packages
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// import custom functions/screens
import { SigninScreen } from './Signin.js';
import { SignupScreen } from './Signup.js';
import { TasksScreen } from './Tasks.js';
import { TaskDetailScreen } from './TaskDetail.js';
import { GroupsScreen } from './Groups.js';
import { GroupDetailScreen } from './GroupDetail.js';
import { ResourcesScreen } from './Resources.js';
import { ResourceDetailScreen } from './ResourceDetail.js';
import { ProfileScreen } from './Profile.js';

// create the Navigation stack
const Stack = createStackNavigator();
export default function App() {
  return (
    <SafeAreaProvider>
    {/* add all the screens to the Navigation stack, start with Signin screen */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Signin" component={SigninScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Tasks" component={TasksScreen} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="Groups" component={GroupsScreen} />
          <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
          <Stack.Screen name="Resources" component={ResourcesScreen} />
          <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
