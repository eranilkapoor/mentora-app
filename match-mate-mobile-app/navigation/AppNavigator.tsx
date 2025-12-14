import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import MatchListScreen from '../screens/Matches/MatchListScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import SettingsStack from './SettingsNavigator';
import ChatsScreen from '../screens/Chats/ChatsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Matches': iconName = 'heart'; break;
            case 'Chats': iconName = 'chatbubble'; break;
            case 'Profile': iconName = 'person'; break;
            case 'Settings': iconName = 'settings'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e91e63',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchListScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Profile" component={EditProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
